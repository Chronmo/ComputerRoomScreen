export type Level = '稳定' | '关注' | '高危';

export type DashboardStats = {
  hostCount: number;
  roomCount: number;
  metricCount: number;
  dataRows: number;
  health: number;
  avgCpu: number;
  avgWait: number;
  avgMem: number;
  totalNet: number;
  critical: number;
  warning: number;
};

export type RoomSummary = {
  room: string;
  health: number;
  cpu: number;
  hosts: Array<{
    id: string;
    level: Level;
    rack: string;
  }>;
};

export type HostRisk = {
  hostid: string;
  hostname: string;
  owner: string;
  model: string;
  room: string;
  rack: string;
  cpu: number;
  wait: number;
  mem: number;
  net: number;
  load: number;
  blocked: number;
  diskUtil: number;
  diskAwait: number;
  health: number;
  level: Level;
};

export type AlertItem = {
  host: string;
  room: string;
  text: string;
  level: 'warning' | 'critical';
  value: number;
};

export type DiskHotspot = {
  host: string;
  room: string;
  disk: string;
  util: number;
  latency: number;
  note: string;
};

export type TrendPoint = {
  ts: number;
  cpu: number;
  wait: number;
  net: number;
};

export type CountItem = {
  name: string;
  value: number;
};

export type DashboardData = {
  generatedAt: string;
  latestTime: string;
  perfRange: string;
  diskRange: string;
  stats: DashboardStats;
  rooms: RoomSummary[];
  topRisk: HostRisk[];
  alerts: AlertItem[];
  diskHotspots: DiskHotspot[];
  trend: TrendPoint[];
  modelCounts: CountItem[];
  ownerCounts: CountItem[];
  tagCounts: CountItem[];
};
