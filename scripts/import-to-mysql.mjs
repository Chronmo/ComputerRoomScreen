import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import mysql from 'mysql2/promise';

const root = resolve(import.meta.dirname, '..');

const config = {
  host: process.env.MYSQL_HOST ?? '127.0.0.1',
  port: Number(process.env.MYSQL_PORT ?? 3307),
  user: process.env.MYSQL_USER ?? 'screen',
  password: process.env.MYSQL_PASSWORD ?? 'screen_password',
  database: process.env.MYSQL_DATABASE ?? 'computer_room_screen',
  charset: 'utf8mb4',
  multipleStatements: true,
};

const parseTsv = (file) => {
  const rows = readFileSync(resolve(root, file), 'utf8').trim().split(/\r?\n/);
  const headers = rows[0].split('\t');
  return rows.slice(1).map((line) => {
    const cells = line.split('\t');
    return Object.fromEntries(headers.map((key, index) => [key, cells[index] ?? '']));
  });
};

const waitForMysql = async () => {
  let lastError;
  for (let index = 0; index < 40; index += 1) {
    try {
      const connection = await mysql.createConnection(config);
      await connection.ping();
      return connection;
    } catch (error) {
      lastError = error;
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 1500));
    }
  }
  throw lastError;
};

const insertBatches = async (connection, sql, values, batchSize = 1000) => {
  for (let index = 0; index < values.length; index += batchSize) {
    await connection.query(sql, [values.slice(index, index + batchSize)]);
  }
};

const connection = await waitForMysql();

try {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS hosts (
      hostid VARCHAR(32) PRIMARY KEY,
      hostname VARCHAR(128) NOT NULL,
      owner VARCHAR(64) NOT NULL,
      model VARCHAR(64) NOT NULL,
      location1 VARCHAR(64) NOT NULL,
      location2 VARCHAR(64) NOT NULL
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS metric_defs (
      \`mod\` VARCHAR(64) PRIMARY KEY,
      type VARCHAR(16) NOT NULL,
      description VARCHAR(255) NOT NULL,
      unit VARCHAR(32) NOT NULL,
      tag VARCHAR(64) NOT NULL
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS pref_metrics (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      ts BIGINT NOT NULL,
      hostid VARCHAR(32) NOT NULL,
      type VARCHAR(16) NOT NULL,
      \`mod\` VARCHAR(64) NOT NULL,
      value DOUBLE NOT NULL,
      tag VARCHAR(64) NOT NULL,
      INDEX idx_pref_ts (ts),
      INDEX idx_pref_host_mod (hostid, \`mod\`)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS disk_metrics (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      ts BIGINT NOT NULL,
      hostid VARCHAR(32) NOT NULL,
      type VARCHAR(16) NOT NULL,
      \`mod\` VARCHAR(64) NOT NULL,
      value DOUBLE NOT NULL,
      tag VARCHAR(64) NOT NULL,
      INDEX idx_disk_ts (ts),
      INDEX idx_disk_host_mod (hostid, \`mod\`)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `);

  const hosts = parseTsv('host_detail.dat');
  const metricDefs = parseTsv('mod_detail.dat');
  const prefRows = parseTsv('pref_tsar.dat');
  const diskRows = parseTsv('disk_tsar.dat');

  await connection.beginTransaction();
  await connection.query('TRUNCATE TABLE disk_metrics');
  await connection.query('TRUNCATE TABLE pref_metrics');
  await connection.query('DELETE FROM metric_defs');
  await connection.query('DELETE FROM hosts');

  await insertBatches(
    connection,
    'INSERT INTO hosts (hostid, hostname, owner, model, location1, location2) VALUES ?',
    hosts.map((row) => [row.hostid, row.hostname, row.owner, row.model, row.location1, row.location2]),
  );

  await insertBatches(
    connection,
    'INSERT INTO metric_defs (`mod`, type, description, unit, tag) VALUES ?',
    metricDefs.map((row) => [row.mod, row.type, row.desc, row.unit, row.tag]),
  );

  await insertBatches(
    connection,
    'INSERT INTO pref_metrics (ts, hostid, type, `mod`, value, tag) VALUES ?',
    prefRows.map((row) => [Number(row.ts), row.hostid, row.type, row.mod, Number(row.value), row.tag]),
    2000,
  );

  await insertBatches(
    connection,
    'INSERT INTO disk_metrics (ts, hostid, type, `mod`, value, tag) VALUES ?',
    diskRows.map((row) => [Number(row.ts), row.hostid, row.type, row.mod, Number(row.value), row.tag]),
    2000,
  );

  await connection.commit();
  console.log(`Imported ${hosts.length} hosts, ${metricDefs.length} metric defs, ${prefRows.length} pref rows, ${diskRows.length} disk rows.`);
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}
