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
      item TEXT,
      amount INTEGER
    );`);
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
    name,
    status,
    contribution,
    birthDate = '',
    statusRemark = '',
    note = ''
  } = record;
  await query(
    `INSERT INTO records (id, birthdayMonth, birthdayFor, name, status, contribution, birthDate, statusRemark, note)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     ON CONFLICT (id) DO UPDATE SET
       birthdayMonth = EXCLUDED.birthdayMonth,
       birthdayFor = EXCLUDED.birthdayFor,
       name = EXCLUDED.name,
       status = EXCLUDED.status,
       contribution = EXCLUDED.contribution,
       birthDate = EXCLUDED.birthDate,
       statusRemark = EXCLUDED.statusRemark,
       note = EXCLUDED.note`,
    [id, birthdayMonth, birthdayFor, name, status, contribution, birthDate, statusRemark, note]
  );
  return { id, birthdayMonth, birthdayFor, name, status, contribution, birthDate, statusRemark, note };
}

export async function bulkAddRecords(records) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const queryText = `INSERT INTO records (id,birthdayMonth,birthdayFor,name,status,contribution,birthDate,statusRemark,note) VALUES ` +
      records.map((_, i) => `($${i*9+1},$${i*9+2},$${i*9+3},$${i*9+4},$${i*9+5},$${i*9+6},$${i*9+7},$${i*9+8},$${i*9+9})`).join(',') +
      ` ON CONFLICT (id) DO UPDATE SET
        birthdayMonth = EXCLUDED.birthdayMonth,
        birthdayFor = EXCLUDED.birthdayFor,
        name = EXCLUDED.name,
        status = EXCLUDED.status,
        contribution = EXCLUDED.contribution,
        birthDate = EXCLUDED.birthDate,
        statusRemark = EXCLUDED.statusRemark,
        note = EXCLUDED.note`;
    const values = [];
    for (const r of records) {
      const {
        id = uuidv4(),
        birthdayMonth,
        birthdayFor,
        name,
        status,
        contribution,
        birthDate = '',
        statusRemark = '',
        note = ''
      } = r;
      values.push(id, birthdayMonth, birthdayFor, name, status, contribution, birthDate, statusRemark, note);
    }
    await client.query(queryText, values);
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
  await query(`UPDATE records SET status = 'Pending', contribution = 0, statusRemark = '', note = '' WHERE birthdayMonth = $1`, [month]);
}

export async function deleteMonth(month) {
  await query('DELETE FROM records WHERE birthdayMonth = $1', [month]);
  await query('DELETE FROM expenses WHERE birthdayMonth = $1', [month]);
}

export async function addExpense(expense) {
  const { id = uuidv4(), birthdayMonth, birthdayFor, item, amount } = expense;
  await query(
    `INSERT INTO expenses (id, birthdayMonth, birthdayFor, item, amount)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (id) DO UPDATE SET
       birthdayMonth = EXCLUDED.birthdayMonth,
       birthdayFor = EXCLUDED.birthdayFor,
       item = EXCLUDED.item,
       amount = EXCLUDED.amount`,
    [id, birthdayMonth, birthdayFor, item, amount]
  );
  return { id, birthdayMonth, birthdayFor, item, amount };
}

export async function deleteExpense(id) {
  await query('DELETE FROM expenses WHERE id = $1', [id]);
}
