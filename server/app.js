import express from 'express';
import cors from 'cors';
import {
  initDb,
  getAllRecords,
  getAllExpenses,
  addRecord,
  bulkAddRecords,
  resetMonth,
  deleteMonth,
  deleteRecord,
  addExpense,
  deleteExpense,
} from './db.js';

const app = express();
let dbReady;

async function ensureDb(req, res, next) {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is missing. Add it in your Vercel project environment variables.');
    }

    if (!dbReady) {
      dbReady = initDb().catch((error) => {
        dbReady = null;
        throw error;
      });
    }

    await dbReady;
    next();
  } catch (error) {
    next(error);
  }
}

app.use(ensureDb);
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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/data', asyncHandler(async (req, res) => {
  const records = await getAllRecords();
  const expenses = await getAllExpenses();
  res.json({ records, expenses });
}));

app.post('/api/records', asyncHandler(async (req, res) => {
  const saved = await addRecord(req.body);
  res.json(saved);
}));

app.post('/api/records/bulk', asyncHandler(async (req, res) => {
  const saved = await bulkAddRecords(req.body);
  res.json(saved);
}));

app.post('/api/records/reset/:month', asyncHandler(async (req, res) => {
  await resetMonth(req.params.month);
  res.json({ status: 'reset' });
}));

app.delete('/api/records/month/:month', asyncHandler(async (req, res) => {
  await deleteMonth(req.params.month);
  res.json({ status: 'deleted' });
}));

app.delete('/api/records/:id', asyncHandler(async (req, res) => {
  await deleteRecord(req.params.id);
  res.json({ status: 'deleted' });
}));

app.post('/api/expenses', asyncHandler(async (req, res) => {
  const saved = await addExpense(req.body);
  res.json(saved);
}));

app.delete('/api/expenses/:id', asyncHandler(async (req, res) => {
  await deleteExpense(req.params.id);
  res.json({ status: 'deleted' });
}));

export function registerErrorHandler(expressApp) {
  expressApp.use((error, req, res, next) => {
    console.error(`${req.method} ${req.path} failed:`, error.message || error);
    res.status(500).json({ error: error.message || 'Server error' });
  });
}

export default app;
