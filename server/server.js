import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  initDb,
  getAllRecords,
  getAllExpenses,
  addRecord,
  bulkAddRecords,
  resetMonth,
  deleteMonth,
  addExpense,
  deleteExpense,
} from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

function asyncHandler(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get all data (records + expenses)
app.get('/api/data', asyncHandler(async (req, res) => {
  const records = await getAllRecords();
  const expenses = await getAllExpenses();
  res.json({ records, expenses });
}));

// Records endpoints
app.post('/api/records', asyncHandler(async (req, res) => {
  const record = req.body;
  const saved = await addRecord(record);
  res.json(saved);
}));

app.post('/api/records/bulk', asyncHandler(async (req, res) => {
  const records = req.body;
  const saved = await bulkAddRecords(records);
  res.json(saved);
}));

app.post('/api/records/reset/:month', asyncHandler(async (req, res) => {
  const { month } = req.params;
  await resetMonth(month);
  res.json({ status: 'reset' });
}));

app.delete('/api/records/month/:month', asyncHandler(async (req, res) => {
  const { month } = req.params;
  await deleteMonth(month);
  res.json({ status: 'deleted' });
}));

// Expenses endpoints
app.post('/api/expenses', asyncHandler(async (req, res) => {
  const expense = req.body;
  const saved = await addExpense(expense);
  res.json(saved);
}));

app.delete('/api/expenses/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  await deleteExpense(id);
  res.json({ status: 'deleted' });
}));

app.use(express.static(distPath));

app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');

  if (!existsSync(indexPath)) {
    res.status(500).json({
      error: 'Frontend build not found. Run npm run build before starting the server.',
    });
    return;
  }

  res.sendFile(indexPath);
});

app.use((error, req, res, next) => {
  console.error(`${req.method} ${req.path} failed:`, error.message || error);
  res.status(500).json({ error: error.message || 'Server error' });
});

try {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing. Create a .env file with your PostgreSQL connection string.');
  }

  await initDb();
  console.log('Database initialized');

  app.listen(PORT, () => {
    console.log(`Backend server listening on http://localhost:${PORT}`);
  });
} catch (e) {
  console.error('Failed to init DB:', e.message || e);
  process.exit(1);
}
