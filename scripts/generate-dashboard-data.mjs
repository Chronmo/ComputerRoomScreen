import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

const parseTsv = (file) => {
  const rows = readFileSync(resolve(root, file), 'utf8').trim().split(/\r?\n/);
  const headers = rows[0].split('\t');
  return rows.slice(1).map((line) => {
    const cells = line.split('\t');
    return Object.fromEntries(headers.map((key, index) => [key, cells[index] ?? '']));
  });
};

const hosts = parseTsv('host_detail.dat');
const metricDefs = parseTsv('mod_detail.dat');
const prefRows = parseTsv('pref_tsar.dat').map((row) => ({ ...row, ts: Number(row.ts), value: Number(row.value) }));
const diskRows = parseTsv('disk_tsar.dat').map((row) => ({ ...row, ts: Number(row.ts), value: Number(row.value) }));

const average = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const formatDate = (ts) => new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
}).format(new Date(ts));

const hostById = new Map(hosts.map((host) => [host.hostid, host]));
const prefTimes = [...new Set(prefRows.map((row) => row.ts))].sort((a, b) => a - b);
const diskTimes = [...new Set(diskRows.map((row) => row.ts))].sort((a, b) => a - b);
const latestPrefTs = prefTimes.at(-1);

const prefByTime = new Map();
for (const row of prefRows) {
  const bucket = prefByTime.get(row.ts) ?? [];
  bucket.push(row);
  prefByTime.set(row.ts, bucket);
}

const latestPrefByHost = new Map();
for (const row of prefRows.filter((item) => item.ts === latestPrefTs)) {
  const metrics = latestPrefByHost.get(row.hostid) ?? new Map();
  metrics.set(row.mod, row.value);
  latestPrefByHost.set(row.hostid, metrics);
}

const latestDiskByHost = new Map();
for (const row of diskRows) {
  const metrics = latestDiskByHost.get(row.hostid) ?? new Map();
  metrics.set(row.mod, row.value);
  latestDiskByHost.set(row.hostid, metrics);
}

const diskMetricValues = (metrics, suffix) => [...(metrics?.entries() ?? [])]
  .filter(([mod]) => mod.endsWith(suffix))
  .map(([, value]) => value);

const snapshots = hosts.map((host) => {
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
  const level = health < 45 || wait > 45 || diskUtil > 90 ? '高危' : health < 62 || wait > 35 || diskUtil > 80 ? '关注' : '稳定';
  return {
    hostid: host.hostid,
    hostname: host.hostname.replace('.hismartlab.cn', ''),
    owner: host.owner,
    model: host.model,
    room: host.location1,
    rack: host.location2,
    cpu: Number(cpu.toFixed(1)),
    wait: Number(wait.toFixed(1)),
    mem: Number(mem.toFixed(1)),
    net: Number(((pref?.get('net_in') ?? 0) + (pref?.get('net_out') ?? 0)).toFixed(1)),
    load: Number(load.toFixed(1)),
    blocked,
    diskUtil: Number(diskUtil.toFixed(1)),
    diskAwait: Number(diskAwait.toFixed(1)),
    health: Number(health.toFixed(0)),
    level,
  };
});

const byRoom = new Map();
for (const host of snapshots) {
  const room = byRoom.get(host.room) ?? [];
  room.push(host);
  byRoom.set(host.room, room);
}

const rooms = [...byRoom.entries()].map(([room, list]) => ({
  room,
  health: Number(average(list.map((host) => host.health)).toFixed(0)),
  cpu: Number(average(list.map((host) => host.cpu)).toFixed(1)),
  hosts: list
    .sort((a, b) => a.rack.localeCompare(b.rack, 'zh-CN'))
    .map((host) => ({ id: host.hostid.replace('host', ''), level: host.level, rack: host.rack })),
})).sort((a, b) => a.room.localeCompare(b.room, 'zh-CN'));

const trend = prefTimes.map((ts) => {
  const rows = prefByTime.get(ts) ?? [];
  const byMod = (mod) => rows.filter((row) => row.mod === mod).map((row) => row.value);
  return {
    ts,
    cpu: Number(average(byMod('cpu_usage')).toFixed(1)),
    wait: Number(average(byMod('cpu_wait')).toFixed(1)),
    net: Number((average(byMod('net_in')) + average(byMod('net_out'))).toFixed(1)),
  };
}).slice(-36);

const counts = (items, key) => {
  const map = new Map();
  items.forEach((item) => map.set(item[key], (map.get(item[key]) ?? 0) + 1));
  return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
};

const tagCounts = counts(metricDefs, 'tag');
const modelCounts = counts(hosts, 'model');
const ownerCounts = counts(hosts, 'owner').slice(0, 6);
const metricName = new Map(metricDefs.map((item) => [item.mod, item.desc]));

const diskHotspots = [...latestDiskByHost.entries()].map(([hostid, metrics]) => {
  const host = hostById.get(hostid);
  const util = [...metrics.entries()].filter(([mod]) => mod.endsWith('_util')).sort((a, b) => b[1] - a[1])[0];
  const latency = [...metrics.entries()].filter(([mod]) => mod.endsWith('_await') || mod.endsWith('_svctm')).sort((a, b) => b[1] - a[1])[0];
  return {
    host: hostid,
    room: host?.location1 ?? '-',
    disk: util?.[0].slice(0, 3).toUpperCase() ?? '-',
    util: Number((util?.[1] ?? 0).toFixed(1)),
    latency: Number((latency?.[1] ?? 0).toFixed(1)),
    note: metricName.get(latency?.[0] ?? '') ?? '磁盘延迟',
  };
}).sort((a, b) => (b.util + b.latency) - (a.util + a.latency)).slice(0, 6);

const alerts = snapshots.flatMap((host) => {
  const rows = [];
  if (host.wait > 40) rows.push({ host: host.hostid, room: host.room, text: 'CPU IO 等待偏高', level: host.wait > 46 ? 'critical' : 'warning', value: host.wait });
  if (host.cpu > 65) rows.push({ host: host.hostid, room: host.room, text: '综合 CPU 压力偏高', level: 'warning', value: host.cpu });
  if (host.diskUtil > 80) rows.push({ host: host.hostid, room: host.room, text: '磁盘利用率接近饱和', level: host.diskUtil > 90 ? 'critical' : 'warning', value: host.diskUtil });
  if (host.diskAwait > 32) rows.push({ host: host.hostid, room: host.room, text: '磁盘等待/服务时间偏高', level: 'warning', value: host.diskAwait });
  if (host.blocked > 170) rows.push({ host: host.hostid, room: host.room, text: '阻塞进程积压', level: 'warning', value: host.blocked });
  return rows;
}).sort((a, b) => b.value - a.value).slice(0, 6);

const stats = {
  hostCount: hosts.length,
  roomCount: new Set(hosts.map((host) => host.location1)).size,
  metricCount: metricDefs.length,
  dataRows: prefRows.length + diskRows.length,
  health: Number(average(snapshots.map((host) => host.health)).toFixed(0)),
  avgCpu: Number(average(snapshots.map((host) => host.cpu)).toFixed(1)),
  avgWait: Number(average(snapshots.map((host) => host.wait)).toFixed(1)),
  avgMem: Number(average(snapshots.map((host) => host.mem)).toFixed(1)),
  totalNet: Number((snapshots.reduce((sum, host) => sum + host.net, 0) / 1024).toFixed(1)),
  critical: snapshots.filter((host) => host.level === '高危').length,
  warning: snapshots.filter((host) => host.level === '关注').length,
};

const dashboardData = {
  generatedAt: new Date(latestPrefTs).toISOString(),
  latestTime: formatDate(latestPrefTs),
  perfRange: `${formatDate(prefTimes[0])} - ${formatDate(prefTimes.at(-1))}`,
  diskRange: `${formatDate(diskTimes[0])} - ${formatDate(diskTimes.at(-1))}`,
  stats,
  rooms,
  topRisk: [...snapshots].sort((a, b) => a.health - b.health).slice(0, 6),
  alerts,
  diskHotspots,
  trend,
  modelCounts,
  ownerCounts,
  tagCounts: tagCounts.slice(0, 6),
};

const target = resolve(root, 'src/data/dashboardData.ts');
mkdirSync(dirname(target), { recursive: true });
writeFileSync(
  target,
  `export const dashboardData = ${JSON.stringify(dashboardData, null, 2)} as const;\n\nexport type DashboardData = typeof dashboardData;\n`,
  'utf8',
);
