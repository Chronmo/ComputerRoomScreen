# ComputerRoomScreen

数据中心运行监控大屏，使用 Vue 3 + TypeScript + Vite 实现。

## 效果预览

![数据中心运行监控大屏效果图](docs/dashboard-preview.png)

## 功能

- 从 `host_detail.dat`、`mod_detail.dat`、`pref_tsar.dat`、`disk_tsar.dat` 提炼最终展示数据
- 单屏展示主机资产、全局健康度、机房态势、风险主机、告警队列、性能趋势、存储热点、资产构成和指标覆盖
- 使用 Docker MySQL 保存原始数据，由后端 API 聚合摘要，前端只负责展示

## 使用

Docker 一键运行：

```bash
docker compose up --build -d
```

访问：

```text
http://localhost:8080
```

服务端接口：

```text
http://localhost:3000/api/dashboard
```

MySQL 暴露在宿主机 `3307` 端口，容器内端口为 `3306`。

停止服务：

```bash
docker compose down
```

本地开发：

```bash
npm install
docker compose up -d mysql
npm run db:import
npm run dev:api
npm run dev
```

生产构建：

```bash
npm run build
```
