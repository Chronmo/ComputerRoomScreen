import cors from 'cors';
import express from 'express';
import { buildDashboardData } from './dashboard.js';
import { pool } from './db.js';

const app = express();
const port = Number(process.env.API_PORT ?? 3000);

app.use(cors());

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : '数据库连接失败' });
  }
});

app.get('/api/dashboard', async (_req, res) => {
  try {
    const data = await buildDashboardData(pool);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : '生成大屏数据失败' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`API server listening on http://0.0.0.0:${port}`);
});
