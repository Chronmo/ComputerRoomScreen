import type { RowDataPacket } from 'mysql2';
import type { Pool } from 'mysql2/promise';
import type { DashboardData, HostRisk, Level } from '../shared/dashboardTypes.js';

type HostRow = RowDataPacket & {
  hostid: string;
  hostname: string;
  owner: string;
  model: string;
  location1: string;
  location2: string;
};

type MetricDefRow = RowDataPacket & {
  mod: string;
  type: 'pref' | 'disk';
  description: string;
  unit: string;
  tag: string;
};

type MetricRow = RowDataPacket & {
  ts: number;
  hostid: string;
  type: 'pref' | 'disk';
  mod: string;
  value: number;
  tag: string;
};

const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const round = (value: number, digits = 1) => Number(value.toFixed(digits));

const formatDate = (ts: number) => new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
}).format(new Date(ts));

const counts = <T extends Record<string, string>>(items: T[], key: keyof T) => {
  const map = new Map<string, number>();
  items.forEach((item) => map.set(String(item[key]), (map.get(String(item[key])) ?? 0) + 1));
  return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
};

const diskMetricValues = (metrics: Map<string, number> | undefined, suffix: string) =>
  [...(metrics?.entries() ?? [])]
    .filter(([mod]) => mod.endsWith(suffix))
    .map(([, value]) => value);

export const buildDashboardData = async (pool: Pool): Promise<DashboardData> => {
  const [[hostCountRow]] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) AS count FROM hosts');
  if (Number(hostCountRow?.count ?? 0) === 0) {
    throw new Error('MySQL 中还没有主机数据，请先运行 npm run db:import 或 docker compose up importer。');
  }

  const [hosts] = await pool.query<HostRow[]>('SELECT * FROM hosts ORDER BY hostid');
  const [metricDefs] = await pool.query<MetricDefRow[]>('SELECT `mod`, type, description, unit, tag FROM metric_defs ORDER BY type, `mod`');
  const [[prefRange]] = await pool.query<RowDataPacket[]>('SELECT MIN(ts) AS minTs, MAX(ts) AS maxTs, COUNT(*) AS rowsCount FROM pref_metrics');
  const [[diskRange]] = await pool.query<RowDataPacket[]>('SELECT MIN(ts) AS minTs, MAX(ts) AS maxTs, COUNT(*) AS rowsCount FROM disk_metrics');
  const [latestPref] = await pool.query<MetricRow[]>('SELECT ts, hostid, type, `mod`, value, tag FROM pref_metrics WHERE ts = ? ORDER BY hostid, `mod`', [prefRange.maxTs]);
  const [diskRows] = await pool.query<MetricRow[]>('SELECT ts, hostid, type, `mod`, value, tag FROM disk_metrics ORDER BY ts');
  const [trendRows] = await pool.query<MetricRow[]>(
    `SELECT ts, hostid, type, \`mod\`, value, tag
     FROM pref_metrics
     WHERE ts IN (SELECT ts FROM (SELECT DISTINCT ts FROM pref_metrics ORDER BY ts DESC LIMIT 36) recent_ts)
     ORDER BY ts`,
  );

  const hostById = new Map(hosts.map((host) => [host.hostid, host]));
  const metricName = new Map(metricDefs.map((item) => [item.mod, item.description]));

  const latestPrefByHost = new Map<string, Map<string, number>>();
  for (const row of latestPref) {
    const metrics = latestPrefByHost.get(row.hostid) ?? new Map<string, number>();
    metrics.set(row.mod, Number(row.value));
    latestPrefByHost.set(row.hostid, metrics);
  }

  const latestDiskByHost = new Map<string, Map<string, number>>();
  for (const row of diskRows) {
    const metrics = latestDiskByHost.get(row.hostid) ?? new Map<string, number>();
    metrics.set(row.mod, Number(row.value));
    latestDiskByHost.set(row.hostid, metrics);
  }

  const snapshots: HostRisk[] = hosts.map((host) => {
    const pref = latestPrefByHost.get(host.hostid);
    const disk = latestDiskByHost.get(host.hostid);
    const used = pref?.get('mem_used') ?? 0;
    const memoryTotal = used + (pref?.get('mem_free') ?? 0) + (pref?.get('mem_buff') ?? 0) + (pref?.get('mem_cache') ?? 0);
    const cpu = pref?.get('cpu_usage') ?? 0;
    const wait = pref?.get('cpu_wait') ?? 0;
    const mem = memoryTotal ? used / memoryTotal * 100 : 0;
    const load = pref?.get('load1') ?? 0;
    const blocked = pref?.get('proc_block') ?? 0;
    const diskUtil = Math.max(0, ...diskMetricValues(disk, '_util'));
    const diskAwait = Math.max(0, ...diskMetricValues(disk, '_await'), ...diskMetricValues(disk, '_svctm'));
    const pressure = cpu * 0.35 + wait * 0.25 + mem * 0.15 + clamp(load * 3) * 0.1 + clamp(blocked / 2) * 0.05 + diskUtil * 0.1;
    const health = clamp(100 - pressure);
    const level: Level = health < 45 || wait > 45 || diskUtil > 90 ? '高危' : health < 62 || wait > 35 || diskUtil > 80 ? '关注' : '稳定';

    return {
      hostid: host.hostid,
      hostname: host.hostname.replace('.hismartlab.cn', ''),
      owner: host.owner,
      model: host.model,
      room: host.location1,
      rack: host.location2,
      cpu: round(cpu),
      wait: round(wait),
      mem: round(mem),
      net: round((pref?.get('net_in') ?? 0) + (pref?.get('net_out') ?? 0)),
      load: round(load),
      blocked,
      diskUtil: round(diskUtil),
      diskAwait: round(diskAwait),
      health: round(health, 0),
      level,
    };
  });

  const byRoom = new Map<string, HostRisk[]>();
  for (const host of snapshots) {
    const room = byRoom.get(host.room) ?? [];
    room.push(host);
    byRoom.set(host.room, room);
  }

  const rooms = [...byRoom.entries()].map(([room, list]) => ({
    room,
    health: round(average(list.map((host) => host.health)), 0),
    cpu: round(average(list.map((host) => host.cpu))),
    hosts: list
      .sort((a, b) => a.rack.localeCompare(b.rack, 'zh-CN'))
      .map((host) => ({ id: host.hostid.replace('host', ''), level: host.level, rack: host.rack })),
  })).sort((a, b) => a.room.localeCompare(b.room, 'zh-CN'));

  const trendByTs = new Map<number, MetricRow[]>();
  for (const row of trendRows) {
    const bucket = trendByTs.get(Number(row.ts)) ?? [];
    bucket.push(row);
    trendByTs.set(Number(row.ts), bucket);
  }

  const trend = [...trendByTs.entries()].sort((a, b) => a[0] - b[0]).map(([ts, rows]) => {
    const byMod = (mod: string) => rows.filter((row) => row.mod === mod).map((row) => Number(row.value));
    return {
      ts,
      cpu: round(average(byMod('cpu_usage'))),
      wait: round(average(byMod('cpu_wait'))),
      net: round(average(byMod('net_in')) + average(byMod('net_out'))),
    };
  });

  const alerts = snapshots.flatMap((host) => {
    const rows: DashboardData['alerts'] = [];
    if (host.wait > 40) rows.push({ host: host.hostid, room: host.room, text: 'CPU IO 等待偏高', level: host.wait > 46 ? 'critical' : 'warning', value: host.wait });
    if (host.cpu > 65) rows.push({ host: host.hostid, room: host.room, text: '综合 CPU 压力偏高', level: 'warning', value: host.cpu });
    if (host.diskUtil > 80) rows.push({ host: host.hostid, room: host.room, text: '磁盘利用率接近饱和', level: host.diskUtil > 90 ? 'critical' : 'warning', value: host.diskUtil });
    if (host.diskAwait > 32) rows.push({ host: host.hostid, room: host.room, text: '磁盘等待/服务时间偏高', level: 'warning', value: host.diskAwait });
    if (host.blocked > 170) rows.push({ host: host.hostid, room: host.room, text: '阻塞进程积压', level: 'warning', value: host.blocked });
    return rows;
  }).sort((a, b) => b.value - a.value).slice(0, 6);

  const diskHotspots = [...latestDiskByHost.entries()].map(([hostid, metrics]) => {
    const host = hostById.get(hostid);
    const util = [...metrics.entries()].filter(([mod]) => mod.endsWith('_util')).sort((a, b) => b[1] - a[1])[0];
    const latency = [...metrics.entries()].filter(([mod]) => mod.endsWith('_await') || mod.endsWith('_svctm')).sort((a, b) => b[1] - a[1])[0];
    return {
      host: hostid,
      room: host?.location1 ?? '-',
      disk: util?.[0].slice(0, 3).toUpperCase() ?? '-',
      util: round(util?.[1] ?? 0),
      latency: round(latency?.[1] ?? 0),
      note: metricName.get(latency?.[0] ?? '') ?? '磁盘延迟',
    };
  }).sort((a, b) => (b.util + b.latency) - (a.util + a.latency)).slice(0, 6);

  const stats = {
    hostCount: hosts.length,
    roomCount: new Set(hosts.map((host) => host.location1)).size,
    metricCount: metricDefs.length,
    dataRows: Number(prefRange.rowsCount ?? 0) + Number(diskRange.rowsCount ?? 0),
    health: round(average(snapshots.map((host) => host.health)), 0),
    avgCpu: round(average(snapshots.map((host) => host.cpu))),
    avgWait: round(average(snapshots.map((host) => host.wait))),
    avgMem: round(average(snapshots.map((host) => host.mem))),
    totalNet: round(snapshots.reduce((sum, host) => sum + host.net, 0) / 1024),
    critical: snapshots.filter((host) => host.level === '高危').length,
    warning: snapshots.filter((host) => host.level === '关注').length,
  };

  return {
    generatedAt: new Date(Number(prefRange.maxTs)).toISOString(),
    latestTime: formatDate(Number(prefRange.maxTs)),
    perfRange: `${formatDate(Number(prefRange.minTs))} - ${formatDate(Number(prefRange.maxTs))}`,
    diskRange: `${formatDate(Number(diskRange.minTs))} - ${formatDate(Number(diskRange.maxTs))}`,
    stats,
    rooms,
    topRisk: [...snapshots].sort((a, b) => a.health - b.health).slice(0, 6),
    alerts,
    diskHotspots,
    trend,
    modelCounts: counts(hosts, 'model'),
    ownerCounts: counts(hosts, 'owner').slice(0, 6),
    tagCounts: counts(metricDefs, 'tag').slice(0, 6),
  };
};
