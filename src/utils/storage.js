import { STORAGE_KEY, EXPENSE_STORAGE_KEY } from '../constants.js';
import {
  cloneDefaultRecords,
  normalizeRecord,
  cloneDefaultExpenses,
  normalizeExpense,
} from './normalizers.js';

export function loadRecords() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return cloneDefaultRecords();
    }
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      return cloneDefaultRecords();
    }
    return parsed.map(normalizeRecord);
  } catch (error) {
    console.warn('Record load error:', error);
    return cloneDefaultRecords();
  }
}

export function saveRecords(records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Browser storage might be restricted or full.
  }
}

export function loadExpenses() {
  try {
    const saved = localStorage.getItem(EXPENSE_STORAGE_KEY);
    if (!saved) {
      return cloneDefaultExpenses();
    }
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.map(normalizeExpense) : cloneDefaultExpenses();
  } catch {
    return cloneDefaultExpenses();
  }
}

export function saveExpenses(expenses) {
  try {
    localStorage.setItem(EXPENSE_STORAGE_KEY, JSON.stringify(expenses));
  } catch {
    // Browser storage might be restricted or full.
  }
}
