import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';

const backupPath = process.argv[2] || 'backup.sql';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is missing. Add your Neon connection string to .env first.');
  process.exit(1);
}

function decodeCopyValue(value) {
  if (value === '\\N') return null;
  return value
    .replace(/\\t/g, '\t')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\\\/g, '\\');
}

function parseCopyBlocks(sql) {
  const lines = sql.split(/\r?\n/);
  const blocks = [];

  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(/^COPY public\.(\w+) \((.+)\) FROM stdin;$/);
    if (!match) continue;

    const table = match[1];
    const columns = match[2].split(',').map((column) => column.trim());
    const rows = [];

    i += 1;
    while (i < lines.length && lines[i] !== '\\.') {
      rows.push(lines[i].split('\t').map(decodeCopyValue));
      i += 1;
    }

    blocks.push({ table, columns, rows });
  }

  return blocks;
}

async function ensureSchema(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS records (
      id TEXT PRIMARY KEY,
      birthdayMonth TEXT,
      birthdayFor TEXT,
      eventType TEXT DEFAULT 'birthday',
      name TEXT,
      status TEXT,
      contribution INTEGER,
      birthDate TEXT,
      statusRemark TEXT,
      note TEXT
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      birthdayMonth TEXT,
      birthdayFor TEXT,
      eventType TEXT DEFAULT 'birthday',
      item TEXT,
      amount INTEGER
    );
  `);
}

function buildUpsert({ table, columns, rows }) {
  const placeholders = rows.map((row, rowIndex) => {
    const values = row.map((_, columnIndex) => `$${rowIndex * columns.length + columnIndex + 1}`);
    return `(${values.join(', ')})`;
  });
  const updates = columns
    .filter((column) => column !== 'id')
    .map((column) => `${column} = EXCLUDED.${column}`)
    .join(', ');

  return {
    text: `
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES ${placeholders.join(', ')}
      ON CONFLICT (id) DO UPDATE SET ${updates};
    `,
    values: rows.flat(),
  };
}

async function main() {
  const sql = fs.readFileSync(path.resolve(backupPath), 'utf8');
  const blocks = parseCopyBlocks(sql).filter(({ table }) => table === 'records' || table === 'expenses');

  if (blocks.length === 0) {
    throw new Error(`No records or expenses COPY data found in ${backupPath}.`);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    await client.query('BEGIN');
    await ensureSchema(client);

    for (const block of blocks) {
      if (block.rows.length === 0) continue;
      await client.query(buildUpsert(block));
      console.log(`Imported ${block.rows.length} rows into ${block.table}.`);
    }

    await client.query('COMMIT');

    const { rows } = await client.query(`
      SELECT
        (SELECT COUNT(*)::int FROM records) AS records,
        (SELECT COUNT(*)::int FROM expenses) AS expenses;
    `);

    console.log(`Neon now has ${rows[0].records} records and ${rows[0].expenses} expenses.`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
