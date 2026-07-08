import mysql from 'mysql2/promise';

export const dbConfig = {
  host: process.env.MYSQL_HOST ?? '127.0.0.1',
  port: Number(process.env.MYSQL_PORT ?? 3307),
  user: process.env.MYSQL_USER ?? 'screen',
  password: process.env.MYSQL_PASSWORD ?? 'screen_password',
  database: process.env.MYSQL_DATABASE ?? 'computer_room_screen',
  waitForConnections: true,
  connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT ?? 10),
  charset: 'utf8mb4',
};

export const pool = mysql.createPool(dbConfig);
