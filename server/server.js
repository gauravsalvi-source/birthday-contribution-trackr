import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb, getAllRecords, getAllExpenses, addRecord, bulkAddRecords, resetMonth, deleteMonth, addExpense, deleteExpense } from './db.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize DB and tables
initDb();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get all data (records + expenses)
app.get('/api/data', async (req, res) => {
  const records = await getAllRecords();
  const expenses = await getAllExpenses();
  res.json({ records, expenses });
});

// Records endpoints
app.post('/api/records', async (req, res) => {
  const record = req.body;
  const saved = await addRecord(record);
  res.json(saved);
});

app.post('/api/records/bulk', async (req, res) => {
  const records = req.body;
  const saved = await bulkAddRecords(records);
  res.json(saved);
});

app.post('/api/records/reset/:month', async (req, res) => {
  const { month } = req.params;
  await resetMonth(month);
  res.json({ status: 'reset' });
});

app.delete('/api/records/month/:month', async (req, res) => {
  const { month } = req.params;
  await deleteMonth(month);
  res.json({ status: 'deleted' });
});

// Expenses endpoints
app.post('/api/expenses', async (req, res) => {
  const expense = req.body;
  const saved = await addExpense(expense);
  res.json(saved);
});

app.delete('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;
  await deleteExpense(id);
  res.json({ status: 'deleted' });
});

app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});
