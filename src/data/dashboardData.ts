export const dashboardData = {
  "generatedAt": "2026-07-07T15:00:00.000Z",
  "latestTime": "07/07 23:00",
  "perfRange": "07/01 00:00 - 07/07 23:00",
  "diskRange": "07/01 00:00 - 08/11 15:55",
  "stats": {
    "hostCount": 20,
    "roomCount": 5,
    "metricCount": 55,
    "dataRows": 79200,
    "health": 59,
    "avgCpu": 39.6,
    "avgWait": 26.4,
    "avgMem": 20.7,
    "totalNet": 19.7,
    "critical": 8,
    "warning": 9
  },
  "rooms": [
    {
      "room": "A机房",
      "health": 57,
      "cpu": 40.3,
      "hosts": [
        {
          "id": "004",
          "level": "高危",
          "rack": "机柜01"
        },
        {
          "id": "008",
          "level": "高危",
          "rack": "机柜03"
        },
        {
          "id": "017",
          "level": "关注",
          "rack": "机柜04"
        },
        {
          "id": "011",
          "level": "高危",
          "rack": "机柜06"
        },
        {
          "id": "014",
          "level": "关注",
          "rack": "机柜09"
        },
        {
          "id": "016",
          "level": "高危",
          "rack": "机柜11"
        },
        {
          "id": "001",
          "level": "关注",
          "rack": "机柜12"
        }
      ]
    },
    {
      "room": "B机房",
      "health": 57,
      "cpu": 46,
      "hosts": [
        {
          "id": "002",
          "level": "关注",
          "rack": "机柜03"
        },
        {
          "id": "019",
          "level": "高危",
          "rack": "机柜06"
        },
        {
          "id": "007",
          "level": "高危",
          "rack": "机柜08"
        },
        {
          "id": "005",
          "level": "稳定",
          "rack": "机柜09"
        }
      ]
    },
    {
      "room": "C机房",
      "health": 61,
      "cpu": 26.6,
      "hosts": [
        {
          "id": "010",
          "level": "稳定",
          "rack": "机柜02"
        },
        {
          "id": "009",
          "level": "关注",
          "rack": "机柜05"
        },
        {
          "id": "020",
          "level": "关注",
          "rack": "机柜12"
        }
      ]
    },
    {
      "room": "D机房",
      "health": 63,
      "cpu": 37.9,
      "hosts": [
        {
          "id": "018",
          "level": "稳定",
          "rack": "机柜05"
        },
        {
          "id": "013",
          "level": "高危",
          "rack": "机柜09"
        }
      ]
    },
    {
      "room": "E机房",
      "health": 59,
      "cpu": 42.4,
      "hosts": [
        {
          "id": "003",
          "level": "关注",
          "rack": "机柜02"
        },
        {
          "id": "006",
          "level": "关注",
          "rack": "机柜04"
        },
        {
          "id": "015",
          "level": "高危",
          "rack": "机柜04"
        },
        {
          "id": "012",
          "level": "关注",
          "rack": "机柜05"
        }
      ]
    }
  ],
  "topRisk": [
    {
      "hostid": "host017",
      "hostname": "server-017",
      "owner": "赵六",
      "model": "Lenovo SR650",
      "room": "A机房",
      "rack": "机柜04",
      "cpu": 62.7,
      "wait": 41.4,
      "mem": 20.9,
      "net": 1393,
      "load": 24.9,
      "blocked": 174,
      "diskUtil": 75.9,
      "diskAwait": 38,
      "health": 45,
      "level": "关注"
    },
    {
      "hostid": "host019",
      "hostname": "server-019",
      "owner": "吴十",
      "model": "Lenovo SR860",
      "room": "B机房",
      "rack": "机柜06",
      "cpu": 58.9,
      "wait": 45.8,
      "mem": 14.5,
      "net": 434.1,
      "load": 23.6,
      "blocked": 222,
      "diskUtil": 86,
      "diskAwait": 49.8,
      "health": 45,
      "level": "高危"
    },
    {
      "hostid": "host006",
      "hostname": "server-006",
      "owner": "王二",
      "model": "Dell R740",
      "room": "E机房",
      "rack": "机柜04",
      "cpu": 69.6,
      "wait": 37.5,
      "mem": 9.6,
      "net": 1117.8,
      "load": 27.4,
      "blocked": 46,
      "diskUtil": 77.9,
      "diskAwait": 44.4,
      "health": 48,
      "level": "关注"
    },
    {
      "hostid": "host008",
      "hostname": "server-008",
      "owner": "王二",
      "model": "Lenovo SR650",
      "room": "A机房",
      "rack": "机柜03",
      "cpu": 49.2,
      "wait": 48.8,
      "mem": 27,
      "net": 904.7,
      "load": 8.9,
      "blocked": 281,
      "diskUtil": 97,
      "diskAwait": 45.7,
      "health": 49,
      "level": "高危"
    },
    {
      "hostid": "host009",
      "hostname": "server-009",
      "owner": "林四",
      "model": "Huawei 2288H",
      "room": "C机房",
      "rack": "机柜05",
      "cpu": 33.9,
      "wait": 21.7,
      "mem": 48.2,
      "net": 1373.4,
      "load": 29.3,
      "blocked": 452,
      "diskUtil": 70.4,
      "diskAwait": 49.3,
      "health": 55,
      "level": "关注"
    },
    {
      "hostid": "host002",
      "hostname": "server-002",
      "owner": "钱七",
      "model": "HP DL388",
      "room": "B机房",
      "rack": "机柜03",
      "cpu": 55.9,
      "wait": 43,
      "mem": 2.9,
      "net": 1277.1,
      "load": 12.4,
      "blocked": 114,
      "diskUtil": 62.6,
      "diskAwait": 48.7,
      "health": 56,
      "level": "关注"
    }
  ],
  "alerts": [
    {
      "host": "host012",
      "room": "E机房",
      "text": "阻塞进程积压",
      "level": "warning",
      "value": 482
    },
    {
      "host": "host004",
      "room": "A机房",
      "text": "阻塞进程积压",
      "level": "warning",
      "value": 479
    },
    {
      "host": "host003",
      "room": "E机房",
      "text": "阻塞进程积压",
      "level": "warning",
      "value": 457
    },
    {
      "host": "host009",
      "room": "C机房",
      "text": "阻塞进程积压",
      "level": "warning",
      "value": 452
    },
    {
      "host": "host010",
      "room": "C机房",
      "text": "阻塞进程积压",
      "level": "warning",
      "value": 434
    },
    {
      "host": "host001",
      "room": "A机房",
      "text": "阻塞进程积压",
      "level": "warning",
      "value": 411
    }
  ],
  "diskHotspots": [
    {
      "host": "host004",
      "room": "A机房",
      "disk": "SDD",
      "util": 99.8,
      "latency": 47.5,
      "note": "磁盘A平均服务时间"
    },
    {
      "host": "host016",
      "room": "A机房",
      "disk": "SDB",
      "util": 96.1,
      "latency": 48.5,
      "note": "磁盘A平均服务时间"
    },
    {
      "host": "host011",
      "room": "A机房",
      "disk": "SDA",
      "util": 96.4,
      "latency": 47.8,
      "note": "磁盘E平均I/O等待时间"
    },
    {
      "host": "host013",
      "room": "D机房",
      "disk": "SDD",
      "util": 98.1,
      "latency": 45.4,
      "note": "磁盘A平均服务时间"
    },
    {
      "host": "host008",
      "room": "A机房",
      "disk": "SDE",
      "util": 97,
      "latency": 45.7,
      "note": "磁盘E平均服务时间"
    },
    {
      "host": "host007",
      "room": "B机房",
      "disk": "SDD",
      "util": 96,
      "latency": 45.7,
      "note": "磁盘A平均I/O等待时间"
    }
  ],
  "trend": [
    {
      "ts": 1783310400000,
      "cpu": 42.7,
      "wait": 30.1,
      "net": 1068.6
    },
    {
      "ts": 1783314000000,
      "cpu": 42,
      "wait": 21.8,
      "net": 1122.6
    },
    {
      "ts": 1783317600000,
      "cpu": 35.2,
      "wait": 25.7,
      "net": 975.6
    },
    {
      "ts": 1783321200000,
      "cpu": 43.9,
      "wait": 20.4,
      "net": 1041.9
    },
    {
      "ts": 1783324800000,
      "cpu": 55.2,
      "wait": 22.8,
      "net": 917.2
    },
    {
      "ts": 1783328400000,
      "cpu": 51.7,
      "wait": 20.4,
      "net": 1133.5
    },
    {
      "ts": 1783332000000,
      "cpu": 48.9,
      "wait": 22.5,
      "net": 979.2
    },
    {
      "ts": 1783335600000,
      "cpu": 39.9,
      "wait": 23.8,
      "net": 1211.5
    },
    {
      "ts": 1783339200000,
      "cpu": 38.2,
      "wait": 16.3,
      "net": 1062.3
    },
    {
      "ts": 1783342800000,
      "cpu": 44.1,
      "wait": 29.5,
      "net": 987.5
    },
    {
      "ts": 1783346400000,
      "cpu": 52.2,
      "wait": 28.1,
      "net": 1187.9
    },
    {
      "ts": 1783350000000,
      "cpu": 43.7,
      "wait": 17.9,
      "net": 1026.1
    },
    {
      "ts": 1783353600000,
      "cpu": 37,
      "wait": 22.1,
      "net": 937.8
    },
    {
      "ts": 1783357200000,
      "cpu": 44.1,
      "wait": 26.6,
      "net": 976
    },
    {
      "ts": 1783360800000,
      "cpu": 40.8,
      "wait": 25.5,
      "net": 1111.9
    },
    {
      "ts": 1783364400000,
      "cpu": 41.4,
      "wait": 24.7,
      "net": 900.5
    },
    {
      "ts": 1783368000000,
      "cpu": 39.8,
      "wait": 24.2,
      "net": 1088.1
    },
    {
      "ts": 1783371600000,
      "cpu": 43.4,
      "wait": 27.6,
      "net": 959.4
    },
    {
      "ts": 1783375200000,
      "cpu": 44.5,
      "wait": 25.4,
      "net": 1054.3
    },
    {
      "ts": 1783378800000,
      "cpu": 40.7,
      "wait": 23.9,
      "net": 1025.7
    },
    {
      "ts": 1783382400000,
      "cpu": 45.3,
      "wait": 27.5,
      "net": 1048.3
    },
    {
      "ts": 1783386000000,
      "cpu": 41.6,
      "wait": 24.8,
      "net": 942.5
    },
    {
      "ts": 1783389600000,
      "cpu": 36.7,
      "wait": 18.4,
      "net": 904.5
    },
    {
      "ts": 1783393200000,
      "cpu": 45.8,
      "wait": 22.8,
      "net": 867.1
    },
    {
      "ts": 1783396800000,
      "cpu": 39.8,
      "wait": 23.3,
      "net": 1030.5
    },
    {
      "ts": 1783400400000,
      "cpu": 46.8,
      "wait": 25.8,
      "net": 980.4
    },
    {
      "ts": 1783404000000,
      "cpu": 40.8,
      "wait": 17.6,
      "net": 1055.5
    },
    {
      "ts": 1783407600000,
      "cpu": 43.6,
      "wait": 30.6,
      "net": 939.9
    },
    {
      "ts": 1783411200000,
      "cpu": 55,
      "wait": 25.2,
      "net": 1004.5
    },
    {
      "ts": 1783414800000,
      "cpu": 37.1,
      "wait": 25.4,
      "net": 938.6
    },
    {
      "ts": 1783418400000,
      "cpu": 44.5,
      "wait": 27.8,
      "net": 1043
    },
    {
      "ts": 1783422000000,
      "cpu": 45.7,
      "wait": 22.1,
      "net": 1119.5
    },
    {
      "ts": 1783425600000,
      "cpu": 48,
      "wait": 29.2,
      "net": 932.9
    },
    {
      "ts": 1783429200000,
      "cpu": 47.6,
      "wait": 21,
      "net": 884.8
    },
    {
      "ts": 1783432800000,
      "cpu": 46.8,
      "wait": 28,
      "net": 952
    },
    {
      "ts": 1783436400000,
      "cpu": 39.6,
      "wait": 26.4,
      "net": 1009.3
    }
  ],
  "modelCounts": [
    {
      "name": "Huawei 2288H",
      "value": 5
    },
    {
      "name": "Dell R750",
      "value": 4
    },
    {
      "name": "HP DL388",
      "value": 4
    },
    {
      "name": "Lenovo SR860",
      "value": 3
    },
    {
      "name": "Dell R740",
      "value": 2
    },
    {
      "name": "Lenovo SR650",
      "value": 2
    }
  ],
  "ownerCounts": [
    {
      "name": "林四",
      "value": 4
    },
    {
      "name": "王二",
      "value": 3
    },
    {
      "name": "李四",
      "value": 3
    },
    {
      "name": "钱七",
      "value": 2
    },
    {
      "name": "刘六",
      "value": 2
    },
    {
      "name": "陈三",
      "value": 1
    }
  ],
  "tagCounts": [
    {
      "name": "disk_rw_sectors",
      "value": 10
    },
    {
      "name": "disk_latency_ms",
      "value": 10
    },
    {
      "name": "disk_rqm_per_sec",
      "value": 5
    },
    {
      "name": "disk_other_metric",
      "value": 5
    },
    {
      "name": "disk_util_percent",
      "value": 5
    },
    {
      "name": "cpu_percent",
      "value": 5
    }
  ]
} as const;

export type DashboardData = typeof dashboardData;
