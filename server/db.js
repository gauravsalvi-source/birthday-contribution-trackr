// server/db.js (PostgreSQL version)
import pkg from 'pg';
import { v4 as uuidv4 } from 'uuid';

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;

// Initialize tables if they don't exist
export async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS records (
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
    );`);
    await client.query(`CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      birthdayMonth TEXT,
      birthdayFor TEXT,
      eventType TEXT DEFAULT 'birthday',
      item TEXT,
      amount INTEGER
    );`);
    await client.query(`ALTER TABLE records ADD COLUMN IF NOT EXISTS eventType TEXT DEFAULT 'birthday';`);
    await client.query(`ALTER TABLE expenses ADD COLUMN IF NOT EXISTS eventType TEXT DEFAULT 'birthday';`);
  } finally {
    client.release();
  }
}

// Helper to run queries
export async function query(text, params) {
  return pool.query(text, params);
}

// CRUD helpers – identical signatures to previous SQLite version
export async function getAllRecords() {
  const res = await query(
    `SELECT
      id,
      birthdaymonth AS "birthdayMonth",
      birthdayfor AS "birthdayFor",
      COALESCE(eventtype, 'birthday') AS "eventType",
      name,
      status,
      contribution,
      birthdate AS "birthDate",
      statusremark AS "statusRemark",
      note
    FROM records`,
    []
  );
  return res.rows;
}

export async function getAllExpenses() {
  const res = await query(
    `SELECT
      id,
      birthdaymonth AS "birthdayMonth",
      birthdayfor AS "birthdayFor",
      COALESCE(eventtype, 'birthday') AS "eventType",
      item,
      amount
    FROM expenses`,
    []
  );
  return res.rows;
}

export async function addRecord(record) {
  const {
    id = uuidv4(),
    birthdayMonth,
    birthdayFor,
    eventType = 'birthday',
    name,
    status,
    contribution,
    birthDate = '',
    statusRemark = '',
    note = ''
  } = record;
  await query(
    `INSERT INTO records (id, birthdayMonth, birthdayFor, eventType, name, status, contribution, birthDate, statusRemark, note)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     ON CONFLICT (id) DO UPDATE SET
       birthdayMonth = EXCLUDED.birthdayMonth,
       birthdayFor = EXCLUDED.birthdayFor,
       eventType = EXCLUDED.eventType,
       name = EXCLUDED.name,
       status = EXCLUDED.status,
       contribution = EXCLUDED.contribution,
       birthDate = EXCLUDED.birthDate,
       statusRemark = EXCLUDED.statusRemark,
       note = EXCLUDED.note`,
    [id, birthdayMonth, birthdayFor, eventType, name, status, contribution, birthDate, statusRemark, note]
  );
  return { id, birthdayMonth, birthdayFor, eventType, name, status, contribution, birthDate, statusRemark, note };
}

export async function bulkAddRecords(records) {
  if (!records || records.length === 0) return getAllRecords();
  const CHUNK_SIZE = 500;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (let i = 0; i < records.length; i += CHUNK_SIZE) {
      const chunk = records.slice(i, i + CHUNK_SIZE);
      const queryText = `INSERT INTO records (id,birthdayMonth,birthdayFor,eventType,name,status,contribution,birthDate,statusRemark,note) VALUES ` +
        chunk.map((_, idx) => `($${idx*10+1},$${idx*10+2},$${idx*10+3},$${idx*10+4},$${idx*10+5},$${idx*10+6},$${idx*10+7},$${idx*10+8},$${idx*10+9},$${idx*10+10})`).join(',') +
        ` ON CONFLICT (id) DO UPDATE SET
          birthdayMonth = EXCLUDED.birthdayMonth,
          birthdayFor = EXCLUDED.birthdayFor,
          eventType = EXCLUDED.eventType,
          name = EXCLUDED.name,
          status = EXCLUDED.status,
          contribution = EXCLUDED.contribution,
          birthDate = EXCLUDED.birthDate,
          statusRemark = EXCLUDED.statusRemark,
          note = EXCLUDED.note`;
      const values = [];
      for (const r of chunk) {
        const {
          id = uuidv4(),
          birthdayMonth,
          birthdayFor,
          eventType = 'birthday',
          name,
          status,
          contribution,
          birthDate = '',
          statusRemark = '',
          note = ''
        } = r;
        values.push(id, birthdayMonth, birthdayFor, eventType, name, status, contribution, birthDate, statusRemark, note);
      }
      await client.query(queryText, values);
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
  return getAllRecords();
}

export async function resetMonth(month) {
  if (!month) return;
  const parts = String(month).includes('|') ? String(month).split('|') : [month];
  const birthdayMonth = parts[0];
  const eventType = parts[1] || null;
  const birthdayFor = parts.slice(2).join('|') || null;
  if (eventType && birthdayFor) {
    await query(
      `UPDATE records SET status = 'Pending', contribution = 0, statusRemark = '', note = ''
       WHERE birthdayMonth = $1 AND eventType = $2 AND birthdayFor = $3`,
      [birthdayMonth, eventType, birthdayFor]
    );
    return;
  }
  await query(`UPDATE records SET status = 'Pending', contribution = 0, statusRemark = '', note = '' WHERE birthdayMonth = $1`, [birthdayMonth]);
}

export async function deleteMonth(month) {
  if (!month) return;
  const parts = String(month).includes('|') ? String(month).split('|') : [month];
  const birthdayMonth = parts[0];
  const eventType = parts[1] || null;
  const birthdayFor = parts.slice(2).join('|') || null;
  if (eventType && birthdayFor) {
    await query('DELETE FROM records WHERE birthdayMonth = $1 AND eventType = $2 AND birthdayFor = $3', [birthdayMonth, eventType, birthdayFor]);
    await query('DELETE FROM expenses WHERE birthdayMonth = $1 AND eventType = $2 AND birthdayFor = $3', [birthdayMonth, eventType, birthdayFor]);
    return;
  }
  await query('DELETE FROM records WHERE birthdayMonth = $1', [birthdayMonth]);
  await query('DELETE FROM expenses WHERE birthdayMonth = $1', [birthdayMonth]);
}

export async function deleteRecord(id) {
  await query('DELETE FROM records WHERE id = $1', [id]);
}

export async function addExpense(expense) {
  const { id = uuidv4(), birthdayMonth, birthdayFor, eventType = 'birthday', item, amount } = expense;
  await query(
    `INSERT INTO expenses (id, birthdayMonth, birthdayFor, eventType, item, amount)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (id) DO UPDATE SET
       birthdayMonth = EXCLUDED.birthdayMonth,
       birthdayFor = EXCLUDED.birthdayFor,
       eventType = EXCLUDED.eventType,
       item = EXCLUDED.item,
       amount = EXCLUDED.amount`,
    [id, birthdayMonth, birthdayFor, eventType, item, amount]
  );
  return { id, birthdayMonth, birthdayFor, eventType, item, amount };
}

export async function deleteExpense(id) {
  await query('DELETE FROM expenses WHERE id = $1', [id]);
}

export async function bulkAddExpenses(expenses) {
  if (!expenses || expenses.length === 0) return [];
  const CHUNK_SIZE = 500;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (let i = 0; i < expenses.length; i += CHUNK_SIZE) {
      const chunk = expenses.slice(i, i + CHUNK_SIZE);
      const queryText = `INSERT INTO expenses (id, birthdayMonth, birthdayFor, eventType, item, amount) VALUES ` +
        chunk.map((_, idx) => `($${idx*6+1},$${idx*6+2},$${idx*6+3},$${idx*6+4},$${idx*6+5},$${idx*6+6})`).join(',') +
        ` ON CONFLICT (id) DO UPDATE SET
          birthdayMonth = EXCLUDED.birthdayMonth,
          birthdayFor = EXCLUDED.birthdayFor,
          eventType = EXCLUDED.eventType,
          item = EXCLUDED.item,
          amount = EXCLUDED.amount`;
      const values = [];
      for (const exp of chunk) {
        const { id = uuidv4(), birthdayMonth, birthdayFor, eventType = 'birthday', item, amount } = exp;
        values.push(id, birthdayMonth, birthdayFor, eventType, item, amount);
      }
      await client.query(queryText, values);
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
  return getAllExpenses();
}
