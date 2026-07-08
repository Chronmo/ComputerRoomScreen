<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { DashboardData } from '../shared/dashboardTypes';

const data = ref<DashboardData | null>(null);
const loading = ref(true);
const error = ref('');

const apiBase = import.meta.env.VITE_API_BASE ?? '/api';

const loadDashboard = async () => {
  loading.value = true;
  error.value = '';
  try {
    const response = await fetch(`${apiBase}/dashboard`);
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.message ?? `接口请求失败：${response.status}`);
    }
    data.value = await response.json();
  } catch (requestError) {
    error.value = requestError instanceof Error ? requestError.message : '大屏数据加载失败';
  } finally {
    loading.value = false;
  }
};

onMounted(loadDashboard);

const fixed = (value: number, digits = 1) => value.toFixed(digits);
const pct = (value: number) => `${Math.max(0, Math.min(100, value))}%`;

const sparkPath = (points: readonly number[], width = 440, height = 104) => {
  if (!points.length) return '';
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  return points.map((point, index) => {
    const x = points.length === 1 ? 0 : index / (points.length - 1) * width;
    const y = height - ((point - min) / span * (height - 12) + 6);
    return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
};

const trendSeries = computed(() => ({
  cpu: data.value?.trend.map((item) => item.cpu) ?? [],
  wait: data.value?.trend.map((item) => item.wait) ?? [],
  net: data.value?.trend.map((item) => item.net) ?? [],
}));
</script>

<template>
  <main class="screen">
    <div class="grid-bg"></div>

    <section v-if="loading" class="state-card">
      <b>正在连接数据中心 API</b>
      <span>从 Docker MySQL 聚合运行监控数据...</span>
    </section>

    <section v-else-if="error" class="state-card error">
      <b>数据加载失败</b>
      <span>{{ error }}</span>
      <button type="button" @click="loadDashboard">重试</button>
    </section>

    <template v-else-if="data">
      <header class="topbar">
        <div>
          <p>HISMARTLAB / IDC OPERATIONS CENTER</p>
          <h1>数据中心运行监控大屏</h1>
        </div>
        <div class="timebox">
          <span>性能 {{ data.perfRange }}</span>
          <span>磁盘 {{ data.diskRange }}</span>
          <strong>{{ data.latestTime }}</strong>
        </div>
      </header>

      <section class="kpis">
        <article>
          <span>主机资产</span>
          <b>{{ data.stats.hostCount }}</b>
          <small>{{ data.stats.roomCount }} 机房 / {{ data.stats.metricCount }} 指标</small>
        </article>
        <article>
          <span>全局健康度</span>
          <b>{{ data.stats.health }}</b>
          <small>{{ data.stats.critical }} 高危 · {{ data.stats.warning }} 关注</small>
        </article>
        <article class="hot">
          <span>CPU 综合负载</span>
          <b>{{ fixed(data.stats.avgCpu) }}%</b>
          <small>IO Wait {{ fixed(data.stats.avgWait) }}%</small>
        </article>
        <article>
          <span>内存压力</span>
          <b>{{ fixed(data.stats.avgMem) }}%</b>
          <small>used / total 估算</small>
        </article>
        <article>
          <span>网络吞吐</span>
          <b>{{ fixed(data.stats.totalNet) }}</b>
          <small>GB/s 聚合入出站</small>
        </article>
        <article class="hot">
          <span>数据样本</span>
          <b>{{ Math.round(data.stats.dataRows / 1000) }}K</b>
          <small>MySQL 实时聚合摘要</small>
        </article>
      </section>

      <section class="main-grid">
        <aside class="panel left">
          <div class="panel-title">
            <b>运行优先级</b>
            <span>后端聚合数据</span>
          </div>
          <div class="priority">
            <p><b>P0</b><span>CPU / IO Wait / 磁盘利用率 / 磁盘延迟</span></p>
            <p><b>P1</b><span>内存 / 网络 / 负载 / 阻塞进程</span></p>
            <p><b>P2</b><span>机房 / 机柜 / 责任人 / 型号 / 指标覆盖</span></p>
          </div>

          <div class="panel-title tight">
            <b>告警队列</b>
            <span>{{ data.alerts.length }} 条</span>
          </div>
          <div class="alerts">
            <p v-for="item in data.alerts" :key="`${item.host}-${item.text}`" :class="item.level">
              <b>{{ item.host }}</b>
              <span>{{ item.text }}</span>
              <em>{{ item.room }} / {{ fixed(item.value) }}</em>
            </p>
          </div>
        </aside>

        <section class="panel center">
          <div class="panel-title">
            <b>机房态势拓扑</b>
            <span>20 台服务器 / A-E 机房</span>
          </div>
          <div class="room-map">
            <article v-for="room in data.rooms" :key="room.room" class="room">
              <header>
                <b>{{ room.room }}</b>
                <strong>{{ room.health }}</strong>
              </header>
              <i class="meter"><em :style="{ width: pct(room.health) }"></em></i>
              <div class="nodes">
                <span
                  v-for="host in room.hosts"
                  :key="`${room.room}-${host.id}`"
                  :class="host.level === '高危' ? 'danger' : host.level === '关注' ? 'warn' : 'ok'"
                >
                  {{ host.id }}
                </span>
              </div>
            </article>
          </div>

          <div class="trend">
            <div class="panel-title compact">
              <b>近 36 个采样趋势</b>
              <span>CPU / IO Wait / 网络</span>
            </div>
            <svg viewBox="0 0 460 116" role="img">
              <defs>
                <linearGradient id="cyanLine" x1="0" x2="1">
                  <stop offset="0%" stop-color="#5eead4" />
                  <stop offset="100%" stop-color="#38bdf8" />
                </linearGradient>
              </defs>
              <path class="chart-grid" d="M0 24H460 M0 58H460 M0 92H460" />
              <path class="line cpu" :d="sparkPath(trendSeries.cpu, 460, 108)" />
              <path class="line wait" :d="sparkPath(trendSeries.wait, 460, 108)" />
              <path class="line net" :d="sparkPath(trendSeries.net, 460, 108)" />
            </svg>
          </div>
        </section>

        <aside class="panel right">
          <div class="panel-title">
            <b>风险主机</b>
            <span>健康度升序</span>
          </div>
          <div class="risk">
            <p v-for="host in data.topRisk" :key="host.hostid">
              <strong>{{ host.hostid }}</strong>
              <span>{{ host.room }} {{ host.rack }}</span>
              <i><em :style="{ width: pct(100 - host.health) }"></em></i>
              <b>{{ host.health }}</b>
            </p>
          </div>

          <div class="panel-title tight">
            <b>存储热点</b>
            <span>Util / Latency</span>
          </div>
          <div class="disk">
            <p v-for="item in data.diskHotspots" :key="`${item.host}-${item.disk}`">
              <b>{{ item.host }}</b>
              <span>{{ item.room }} {{ item.disk }}</span>
              <strong>{{ fixed(item.util) }}%</strong>
              <em>{{ fixed(item.latency) }}ms</em>
            </p>
          </div>
        </aside>

        <section class="panel footer-left">
          <div class="panel-title">
            <b>资产构成</b>
            <span>型号 / 责任人</span>
          </div>
          <div class="bars">
            <p v-for="item in data.modelCounts" :key="item.name">
              <span>{{ item.name }}</span>
              <i><em :style="{ width: `${item.value / data.stats.hostCount * 100}%` }"></em></i>
              <b>{{ item.value }}</b>
            </p>
          </div>
          <div class="chips">
            <span v-for="item in data.ownerCounts" :key="item.name">{{ item.name }} {{ item.value }}</span>
          </div>
        </section>

        <section class="panel footer-right">
          <div class="panel-title">
            <b>指标覆盖</b>
            <span>mod_detail 提炼</span>
          </div>
          <div class="coverage">
            <p v-for="item in data.tagCounts" :key="item.name">
              <span>{{ item.name }}</span>
              <i><em :style="{ width: `${item.value / 10 * 100}%` }"></em></i>
              <b>{{ item.value }}</b>
            </p>
          </div>
        </section>
      </section>
    </template>
  </main>
</template>
