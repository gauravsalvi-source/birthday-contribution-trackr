import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import * as api from './api.js';
import {
  defaultBirthdayMonth,
  defaultBirthdayFor,
  defaultEventType,
  managerPassword,
  defaultTeamMemberNames,
  blankForm,
  blankExpenseForm,
  blankMonthForm,
  viewTabs,
} from './constants.js';
import { formatMoney, formatMonthLabel, getNextMonth } from './utils/formatters.js';
import {
  makeId,
  makeSheetKey,
  getSheetKey,
  parseSheetKey,
  formatSheetLabel,
  compareSheetKeys,
  normalizeEventType,
  getEventMeta,
} from './utils/sheetHelpers.js';
import {
  parseAmount,
  normalizeRecord,
  normalizeExpense,
  buildMonthRecords,
  isBirthdayEmployee,
} from './utils/normalizers.js';
import { recordsFromCsv, buildCsv } from './utils/csvHelpers.js';
import { loadRecords, saveRecords, loadExpenses, saveExpenses } from './utils/storage.js';

import { Topbar } from './components/Topbar.jsx';
import { MonthCreatePanel } from './components/MonthCreatePanel.jsx';
import { MemberForm } from './components/MemberForm.jsx';
import { MetricCard } from './components/MetricCard.jsx';
import { OpeningBalanceEditor } from './components/OpeningBalanceEditor.jsx';
import { RecordsTable } from './components/RecordsTable.jsx';
import { ExpenseSection, ExpenseSummary } from './components/ExpenseSection.jsx';
import { ReportPage } from './components/ReportPage.jsx';
import { BirthdayBanner } from './components/BirthdayBanner.jsx';
import { CombineMonthsModal } from './components/CombineMonthsModal.jsx';

export default function App() {
  const [records, setRecords] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [expenseForm, setExpenseForm] = useState(blankExpenseForm);
  const [monthForm, setMonthForm] = useState(blankMonthForm);
  const [search, setSearch] = useState('');
  const [activeMonth, setActiveMonth] = useState(makeSheetKey(defaultBirthdayMonth, defaultEventType, defaultBirthdayFor));
  const [activeView, setActiveView] = useState('records');
  const [isManagerMode, setIsManagerMode] = useState(false);
  const [managerPasswordInput, setManagerPasswordInput] = useState('');
  const [showCombineModal, setShowCombineModal] = useState(false);
  const [combineForm, setCombineForm] = useState({
    sheet1: '',
    sheet2: '',
    birthdayFor: '',
    contributionStrategy: 'standard',
    defaultContribution: '100',
    deleteOriginals: true,
  });

  const fileInputRef = useRef(null);
  const nameInputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const data = await api.fetchData();
      const backendRecords = (data.records || []).map(normalizeRecord);
      const backendExpenses = (data.expenses || []).map(normalizeExpense);
      setRecords(backendRecords);
      setExpenses(backendExpenses);

      if (backendRecords.length > 0 || backendExpenses.length > 0) {
        const sheets = Array.from(new Set([
          ...backendRecords.map(getSheetKey),
          ...backendExpenses.map(getSheetKey),
        ])).filter(Boolean);
        const sorted = sheets.sort((a, b) => compareSheetKeys(b, a));
        if (sorted.length > 0) {
          setActiveMonth(sorted[0]);
        }
      }
      setError(null);
    } catch (err) {
      console.warn('Backend unavailable, falling back to local storage:', err);
      const isLocalDev = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
      setError(
        isLocalDev
          ? 'Could not connect to the backend server. Start it with "npm run dev:backend" in a second terminal, then refresh. Using local storage for now.'
          : 'Could not connect to the backend server. Check that DATABASE_URL is set on Vercel, then redeploy. Using local storage for now.',
      );
      const localRecs = loadRecords();
      const localExps = loadExpenses();
      setRecords(localRecs);
      setExpenses(localExps);
      if (localRecs && localRecs.length > 0) {
        const sheets = Array.from(new Set(localRecs.map(getSheetKey))).filter(Boolean);
        const sorted = sheets.sort((a, b) => compareSheetKeys(b, a));
        if (sorted.length > 0) {
          setActiveMonth(sorted[0]);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  // Pre-group records & expenses by sheet key in single passes for O(1) sheet lookups
  const recordsBySheet = useMemo(() => {
    const map = new Map();
    for (const r of records) {
      const key = getSheetKey(r);
      let list = map.get(key);
      if (!list) {
        list = [];
        map.set(key, list);
      }
      list.push(r);
    }
    return map;
  }, [records]);

  const expensesBySheet = useMemo(() => {
    const map = new Map();
    for (const e of expenses) {
      const key = getSheetKey(e);
      let list = map.get(key);
      if (!list) {
        list = [];
        map.set(key, list);
      }
      list.push(e);
    }
    return map;
  }, [expenses]);

  const allSheetKeys = useMemo(() => {
    const set = new Set([...recordsBySheet.keys(), ...expensesBySheet.keys()]);
    return Array.from(set).filter(Boolean);
  }, [recordsBySheet, expensesBySheet]);

  const teamMemberNames = useMemo(() => {
    const namesFromRecords = records
      .map((record) => record.name)
      .filter((name) => name && name !== 'Opening Balance');
    return Array.from(new Set([...defaultTeamMemberNames, ...namesFromRecords]))
      .sort((a, b) => a.localeCompare(b));
  }, [records]);

  const monthTabs = useMemo(() => {
    return [...allSheetKeys].sort((a, b) => compareSheetKeys(b, a));
  }, [allSheetKeys]);

  const activeSheet = useMemo(() => parseSheetKey(activeMonth), [activeMonth]);
  const activeEventMeta = getEventMeta(activeSheet.eventType);

  const monthlyRecords = useMemo(
    () => (recordsBySheet.get(activeMonth) || []).filter((r) => r.name !== 'Opening Balance'),
    [recordsBySheet, activeMonth],
  );

  const monthlyExpenses = useMemo(
    () => expensesBySheet.get(activeMonth) || [],
    [expensesBySheet, activeMonth],
  );

  // Linear O(N) calculation of running balances across all sheets
  const monthFinancials = useMemo(() => {
    const orderedSheets = [...allSheetKeys].sort(compareSheetKeys);
    let runningBalance = 0;
    const financials = {};

    for (const sheetKey of orderedSheets) {
      const monthRecs = recordsBySheet.get(sheetKey) || [];
      const monthExps = expensesBySheet.get(sheetKey) || [];

      let openingBalanceAdjustment = 0;
      let collected = 0;

      for (const r of monthRecs) {
        if (r.name === 'Opening Balance') {
          openingBalanceAdjustment += r.contribution;
        } else if (r.status === 'Paid') {
          collected += r.contribution;
        }
      }

      let spent = 0;
      for (const e of monthExps) {
        spent += e.amount;
      }

      const openingBalance = runningBalance + openingBalanceAdjustment;
      const monthlyBalance = collected - spent;
      const closingBalance = openingBalance + monthlyBalance;

      financials[sheetKey] = {
        openingBalance,
        monthlyBalance,
        closingBalance,
        openingBalanceAdjustment,
      };

      runningBalance = closingBalance;
    }

    return financials;
  }, [allSheetKeys, recordsBySheet, expensesBySheet]);

  // Single-pass accumulation for active sheet metrics
  const totals = useMemo(() => {
    let collected = 0;
    let pendingAmount = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let exemptedCount = 0;
    let naCount = 0;
    let activeCount = 0;

    for (const r of monthlyRecords) {
      if (r.status === 'Paid') {
        collected += r.contribution;
        paidCount += 1;
        activeCount += 1;
      } else if (r.status === 'Pending') {
        pendingAmount += r.contribution;
        pendingCount += 1;
        activeCount += 1;
      } else if (r.status === 'Exempted') {
        exemptedCount += 1;
      } else if (r.status === 'NA') {
        naCount += 1;
      }
    }

    let spent = 0;
    for (const e of monthlyExpenses) {
      spent += e.amount;
    }

    const fin = monthFinancials[activeMonth] || {};
    const openingBalance = fin.openingBalance ?? 0;
    const closingBalance = fin.closingBalance ?? collected - spent;

    return {
      collected,
      expected: collected + pendingAmount,
      pendingAmount,
      spent,
      balance: collected - spent,
      openingBalance,
      closingBalance,
      expectedBalance: openingBalance + collected + pendingAmount - spent,
      activeCount,
      paidCount,
      pendingCount,
      exemptedCount,
      naCount,
    };
  }, [monthlyRecords, monthlyExpenses, monthFinancials, activeMonth]);

  // Single-pass report categorisation
  const statusReports = useMemo(() => {
    const pending = [];
    const na = [];
    const exempted = [];
    for (const r of monthlyRecords) {
      if (r.status === 'Pending') pending.push(r);
      else if (r.status === 'NA') na.push(r);
      else if (r.status === 'Exempted') exempted.push(r);
    }
    return { pending, na, exempted };
  }, [monthlyRecords]);

  const visibleRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = query
      ? monthlyRecords.filter((r) => r.name.toLowerCase().includes(query))
      : monthlyRecords;
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }, [monthlyRecords, search]);

  const activeBirthdayFor = monthlyRecords[0]?.birthdayFor || activeSheet.birthdayFor || defaultBirthdayFor;

  function commitRecords(nextRecords) {
    setRecords(nextRecords);
    saveRecords(nextRecords);
  }

  function commitExpenses(nextExpenses) {
    setExpenses(nextExpenses);
    saveExpenses(nextExpenses);
  }

  function updateField(field, value) {
    setForm((current) => {
      if (field === 'status' && (value === 'NA' || value === 'Exempted')) {
        return { ...current, status: value, contribution: '0' };
      }
      if (field === 'status' && (value === 'Paid' || value === 'Pending')) {
        const contribution = current.contribution === '' || current.contribution === '0' ? '100' : current.contribution;
        return { ...current, status: value, contribution };
      }
      return { ...current, [field]: value };
    });
  }

  function updateExpenseField(field, value) {
    setExpenseForm((current) => ({ ...current, [field]: value }));
  }

  function updateMonthField(field, value) {
    setMonthForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    const monthRecord = monthlyRecords[0];
    setForm({
      ...blankForm,
      birthdayMonth: activeSheet.birthdayMonth,
      eventType: activeSheet.eventType,
      birthdayFor: monthRecord?.birthdayFor || activeSheet.birthdayFor || defaultBirthdayFor,
    });
  }

  function startAddMember() {
    const monthRecord = monthlyRecords[0];
    setForm({
      ...blankForm,
      birthdayMonth: activeSheet.birthdayMonth,
      eventType: activeSheet.eventType,
      birthdayFor: monthRecord?.birthdayFor || activeSheet.birthdayFor || defaultBirthdayFor,
      status: 'Pending',
      contribution: '100',
    });
    setActiveView('records');
    requestAnimationFrame(() => {
      nameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      nameInputRef.current?.focus();
    });
  }

  function resetExpenseForm() {
    const monthRecord = monthlyRecords[0];
    setExpenseForm({
      ...blankExpenseForm,
      birthdayMonth: activeSheet.birthdayMonth,
      eventType: activeSheet.eventType,
      birthdayFor: monthRecord?.birthdayFor || defaultBirthdayFor,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const record = normalizeRecord(form);
    if (!record.name) {
      alert('Please enter a name.');
      return;
    }

    const targetSheetKey = makeSheetKey(record.birthdayMonth, record.eventType, record.birthdayFor);
    const duplicateInSheet = records.some(
      (item) => getSheetKey(item) === targetSheetKey
        && item.name.toLowerCase() === record.name.toLowerCase()
        && item.id !== record.id
        && item.name !== 'Opening Balance',
    );
    if (duplicateInSheet) {
      alert(`${record.name} is already in this month's sheet.`);
      return;
    }

    let savedRecord = record;
    try {
      savedRecord = await api.createRecord(record);
    } catch (err) {
      console.warn('Offline save fallback for record:', err);
      setError(`Saved locally only. Backend sync failed: ${err.message}`);
    }

    const existingIndex = records.findIndex((item) => item.id === savedRecord.id);
    const nextRecords = existingIndex >= 0
      ? records.map((item) => (item.id === savedRecord.id ? savedRecord : item))
      : [...records, savedRecord];

    commitRecords(nextRecords);
    setActiveMonth(getSheetKey(savedRecord));
    setForm({
      ...blankForm,
      birthdayMonth: savedRecord.birthdayMonth,
      eventType: savedRecord.eventType,
      birthdayFor: savedRecord.birthdayFor,
    });
  }

  const editRecord = useCallback((record) => {
    setForm({
      id: record.id,
      birthdayMonth: record.birthdayMonth,
      birthdayFor: record.birthdayFor,
      eventType: record.eventType,
      name: record.name,
      status: record.status,
      contribution: String(record.contribution),
      birthDate: record.birthDate || '',
      note: record.note,
    });
  }, []);

  const deleteRecord = useCallback(async (record) => {
    if (!confirm(`Delete entry for ${record.name}?`)) {
      return;
    }

    try {
      await api.deleteRecord(record.id);
    } catch (err) {
      console.warn('Offline delete fallback for record:', err);
    }

    setRecords((prev) => {
      const nextRecords = prev.filter((item) => item.id !== record.id);
      saveRecords(nextRecords);
      return nextRecords;
    });

    setForm((current) => (current.id === record.id ? blankForm : current));
  }, []);

  async function handleExpenseSubmit(event) {
    event.preventDefault();
    const expense = normalizeExpense(expenseForm);

    let savedExpense = expense;
    try {
      savedExpense = await api.createExpense(expense);
    } catch (err) {
      console.warn('Offline expense save fallback:', err);
      setError(`Saved expense locally only. Backend sync failed: ${err.message}`);
    }

    const existingIndex = expenses.findIndex((item) => item.id === savedExpense.id);
    const nextExpenses = existingIndex >= 0
      ? expenses.map((item) => (item.id === savedExpense.id ? savedExpense : item))
      : [...expenses, savedExpense];

    commitExpenses(nextExpenses);
    setActiveMonth(getSheetKey(savedExpense));
    setExpenseForm({
      ...blankExpenseForm,
      birthdayMonth: savedExpense.birthdayMonth,
      eventType: savedExpense.eventType,
      birthdayFor: savedExpense.birthdayFor,
    });
  }

  const editExpense = useCallback((expense) => {
    setExpenseForm({
      id: expense.id,
      birthdayMonth: expense.birthdayMonth,
      birthdayFor: expense.birthdayFor,
      eventType: expense.eventType,
      item: expense.item,
      amount: String(expense.amount),
    });
  }, []);

  const deleteExpense = useCallback(async (expense) => {
    if (!confirm(`Delete expense "${expense.item}"?`)) {
      return;
    }

    try {
      await api.deleteExpense(expense.id);
    } catch (err) {
      console.warn('Offline expense delete fallback:', err);
    }

    setExpenses((prev) => {
      const nextExpenses = prev.filter((item) => item.id !== expense.id);
      saveExpenses(nextExpenses);
      return nextExpenses;
    });

    setExpenseForm((current) => (current.id === expense.id ? blankExpenseForm : current));
  }, []);

  async function resetData() {
    if (!confirm(`Reset ${formatMonthLabel(activeSheet.birthdayMonth)} ${activeEventMeta.contributionName} and expense amounts to 0?`)) {
      return;
    }

    try {
      await api.resetMonth(activeMonth);
    } catch (err) {
      console.warn('Offline reset fallback:', err);
    }

    const zeroedMonthRecords = monthlyRecords.map((record) => normalizeRecord({
      ...record,
      status: 'Pending',
      contribution: 0,
      statusRemark: '',
      note: '',
    }));
    const nextRecords = records.map((record) => {
      const replacement = zeroedMonthRecords.find((item) => item.id === record.id);
      return replacement || record;
    });
    const nextExpenses = expenses.filter((expense) => getSheetKey(expense) !== activeMonth);

    commitRecords(nextRecords);
    commitExpenses(nextExpenses);
    resetForm();
    resetExpenseForm();
    setSearch('');
  }

  async function deleteActiveMonth() {
    if (!confirm(`Delete ${formatMonthLabel(activeSheet.birthdayMonth)} ${activeEventMeta.contributionName} sheet and all its records and expenses?`)) {
      return;
    }

    try {
      await api.deleteMonth(activeMonth);
    } catch (err) {
      console.warn('Offline delete month fallback:', err);
    }

    const nextRecords = records.filter((record) => getSheetKey(record) !== activeMonth);
    const nextExpenses = expenses.filter((expense) => getSheetKey(expense) !== activeMonth);
    const nextActiveMonth = nextRecords[0] ? getSheetKey(nextRecords[0]) : makeSheetKey(defaultBirthdayMonth, defaultEventType, defaultBirthdayFor);
    const nextSheet = parseSheetKey(nextActiveMonth);

    commitRecords(nextRecords);
    commitExpenses(nextExpenses);
    setActiveMonth(nextActiveMonth);
    setActiveView('records');
    setSearch('');
    setForm({
      ...blankForm,
      birthdayMonth: nextSheet.birthdayMonth,
      eventType: nextSheet.eventType,
      birthdayFor: nextSheet.birthdayFor,
    });
    setExpenseForm({
      ...blankExpenseForm,
      birthdayMonth: nextSheet.birthdayMonth,
      eventType: nextSheet.eventType,
      birthdayFor: nextSheet.birthdayFor,
    });
  }

  function switchMonth(month) {
    const sheet = parseSheetKey(month);
    setActiveMonth(month);
    setActiveView('records');
    setSearch('');
    setForm({
      ...blankForm,
      birthdayMonth: sheet.birthdayMonth,
      eventType: sheet.eventType,
      birthdayFor: sheet.birthdayFor,
    });
    setExpenseForm({
      ...blankExpenseForm,
      birthdayMonth: sheet.birthdayMonth,
      eventType: sheet.eventType,
      birthdayFor: sheet.birthdayFor,
    });
  }

  async function createMonth(event) {
    event.preventDefault();

    let birthdayMonth = monthForm.birthdayMonth;
    if (monthForm.isCombined) {
      const m1 = monthForm.birthdayMonth;
      const m2 = monthForm.birthdayMonth2;
      if (!m1 || !m2) {
        alert('Please select both months to combine.');
        return;
      }
      if (m1 === m2) {
        alert('Please select two different months to combine.');
        return;
      }
      birthdayMonth = m1 <= m2 ? `${m1} & ${m2}` : `${m2} & ${m1}`;
    }

    const birthdayFor = monthForm.birthdayFor.trim();
    const eventType = normalizeEventType(monthForm.eventType);
    const newSheetKey = makeSheetKey(birthdayMonth, eventType, birthdayFor);
    const eventMeta = getEventMeta(eventType);

    if (!birthdayMonth || !birthdayFor) {
      alert(`Please select a month and enter ${eventMeta.sheetLabel}.`);
      return;
    }

    const existingMonthRecords = records.filter((record) => getSheetKey(record) === newSheetKey);
    if (existingMonthRecords.length > 0) {
      switchMonth(newSheetKey);
      alert(`${formatMonthLabel(birthdayMonth)} ${eventMeta.contributionName} sheet already exists. Switched to that sheet.`);
      return;
    }

    const additionalNames = monthForm.additionalMembers
      .split(/,|\n|&/)
      .map((name) => name.trim())
      .filter(Boolean);
    const allMemberNames = Array.from(new Set([...teamMemberNames, ...additionalNames]));
    const defaultContribution = parseAmount(monthForm.contributionPerMember) || 100;
    const newMonthRecords = buildMonthRecords(birthdayMonth, birthdayFor, eventType, allMemberNames, defaultContribution);

    let savedRecords = newMonthRecords;
    try {
      const res = await api.bulkCreateRecords(newMonthRecords);
      savedRecords = res.map(normalizeRecord);
    } catch (err) {
      console.warn('Offline create month fallback:', err);
    }

    commitRecords([...records, ...savedRecords]);
    setActiveMonth(newSheetKey);
    setActiveView('records');
    setSearch('');
    setForm({
      ...blankForm,
      birthdayMonth,
      eventType,
      birthdayFor,
    });
    setExpenseForm({
      ...blankExpenseForm,
      birthdayMonth,
      eventType,
      birthdayFor,
    });
    setMonthForm({
      isCombined: false,
      birthdayMonth: monthForm.birthdayMonth,
      birthdayMonth2: getNextMonth(monthForm.birthdayMonth),
      eventType,
      birthdayFor: '',
      contributionPerMember: '100',
      additionalMembers: '',
    });
  }

  function openCombineModal() {
    if (monthTabs.length < 2) {
      alert('You need at least 2 existing sheets to combine them. You can also create a new combined sheet using the form above.');
      return;
    }
    const s1 = monthTabs[0];
    const s2 = monthTabs[1] || monthTabs[0];
    const p1 = parseSheetKey(s1);
    const p2 = parseSheetKey(s2);
    const initialRecipients = p1.birthdayFor === p2.birthdayFor
      ? p1.birthdayFor
      : `${p1.birthdayFor} & ${p2.birthdayFor}`;

    setCombineForm({
      sheet1: s1,
      sheet2: s2,
      birthdayFor: initialRecipients,
      contributionStrategy: 'standard',
      defaultContribution: '100',
      deleteOriginals: true,
    });
    setShowCombineModal(true);
  }

  function updateCombineSheet(field, value) {
    setCombineForm((prev) => {
      const next = { ...prev, [field]: value };
      const s1 = field === 'sheet1' ? value : next.sheet1;
      const s2 = field === 'sheet2' ? value : next.sheet2;
      const p1 = parseSheetKey(s1);
      const p2 = parseSheetKey(s2);
      if (s1 && s2 && s1 !== s2) {
        next.birthdayFor = p1.birthdayFor === p2.birthdayFor
          ? p1.birthdayFor
          : `${p1.birthdayFor} & ${p2.birthdayFor}`;
      }
      return next;
    });
  }

  async function handleCombineExistingSheets(event) {
    event.preventDefault();
    const { sheet1, sheet2, birthdayFor, contributionStrategy, defaultContribution, deleteOriginals } = combineForm;

    if (!sheet1 || !sheet2) {
      alert('Please select two sheets to combine.');
      return;
    }
    if (sheet1 === sheet2) {
      alert('Please select two different sheets to combine.');
      return;
    }

    const p1 = parseSheetKey(sheet1);
    const p2 = parseSheetKey(sheet2);
    const combinedRecipients = birthdayFor.trim() || `${p1.birthdayFor} & ${p2.birthdayFor}`;
    const m1 = p1.birthdayMonth;
    const m2 = p2.birthdayMonth;

    const combinedMonth = m1 <= m2 ? `${m1} & ${m2}` : `${m2} & ${m1}`;
    const eventType = p1.eventType;
    const combinedSheetKey = makeSheetKey(combinedMonth, eventType, combinedRecipients);

    const sheet1Records = records.filter((r) => getSheetKey(r) === sheet1 && r.name !== 'Opening Balance');
    const sheet2Records = records.filter((r) => getSheetKey(r) === sheet2 && r.name !== 'Opening Balance');
    const nameMap = new Map();
    for (const name of [...teamMemberNames, ...sheet1Records.map((r) => r.name), ...sheet2Records.map((r) => r.name)]) {
      if (!name || name === 'Opening Balance') continue;
      const lower = name.trim().toLowerCase();
      if (!nameMap.has(lower)) {
        nameMap.set(lower, name.trim());
      }
    }
    const allNames = Array.from(nameMap.values()).sort((a, b) => a.localeCompare(b));

    const standardAmount = parseAmount(defaultContribution) || 100;

    const mergedRecords = allNames.map((name) => {
      const isExempted = isBirthdayEmployee(name, combinedRecipients);
      if (isExempted) {
        return normalizeRecord({
          birthdayMonth: combinedMonth,
          birthdayFor: combinedRecipients,
          eventType,
          name,
          status: 'Exempted',
          contribution: 0,
          note: getEventMeta(eventType).exemptedNote,
        });
      }

      const r1 = sheet1Records.find((r) => r.name.toLowerCase() === name.toLowerCase());
      const r2 = sheet2Records.find((r) => r.name.toLowerCase() === name.toLowerCase());

      let status = 'Pending';
      let contribution = standardAmount;

      if (contributionStrategy === 'sum') {
        const c1 = r1 ? r1.contribution : 0;
        const c2 = r2 ? r2.contribution : 0;
        contribution = c1 + c2;
        if (r1?.status === 'Paid' || r2?.status === 'Paid') {
          status = 'Paid';
        } else if (r1?.status === 'NA' && r2?.status === 'NA') {
          status = 'NA';
        }
      } else {
        if (r1?.status === 'Paid' || r2?.status === 'Paid') {
          status = 'Paid';
        } else if (r1?.status === 'NA' && r2?.status === 'NA') {
          status = 'NA';
          contribution = 0;
        } else {
          status = 'Pending';
        }
      }

      const notes = [r1?.note, r2?.note].filter(Boolean);
      const uniqueNotes = Array.from(new Set(notes)).join(' | ');

      return normalizeRecord({
        birthdayMonth: combinedMonth,
        birthdayFor: combinedRecipients,
        eventType,
        name,
        status,
        contribution,
        birthDate: r1?.birthDate || r2?.birthDate || '',
        note: uniqueNotes,
      });
    });

    const s1OpeningBalance = records.find((r) => getSheetKey(r) === sheet1 && r.name === 'Opening Balance')?.contribution || 0;
    const s2OpeningBalance = records.find((r) => getSheetKey(r) === sheet2 && r.name === 'Opening Balance')?.contribution || 0;
    const combinedOpeningBalanceAdjustment = s1OpeningBalance + s2OpeningBalance;
    if (combinedOpeningBalanceAdjustment !== 0) {
      mergedRecords.push(normalizeRecord({
        birthdayMonth: combinedMonth,
        birthdayFor: combinedRecipients,
        eventType,
        name: 'Opening Balance',
        status: 'Paid',
        contribution: combinedOpeningBalanceAdjustment,
        note: 'Opening Balance Adjustment (Combined)',
      }));
    }

    const s1Expenses = expenses.filter((e) => getSheetKey(e) === sheet1);
    const s2Expenses = expenses.filter((e) => getSheetKey(e) === sheet2);
    const mergedExpenses = [...s1Expenses, ...s2Expenses].map((e) => normalizeExpense({
      ...e,
      id: makeId(),
      birthdayMonth: combinedMonth,
      birthdayFor: combinedRecipients,
      eventType,
    }));

    try {
      const savedRecords = (await api.bulkCreateRecords(mergedRecords)).map(normalizeRecord);

      let savedExpenses = mergedExpenses;
      try {
        const res = await api.bulkCreateExpenses(mergedExpenses);
        savedExpenses = res.map(normalizeExpense);
      } catch {
        // Fallback: save one by one if bulk failed
        savedExpenses = await Promise.all(
          mergedExpenses.map((exp) => api.createExpense(exp).catch(() => exp))
        );
      }

      if (deleteOriginals) {
        await Promise.all([
          api.deleteMonth(sheet1).catch(console.warn),
          api.deleteMonth(sheet2).catch(console.warn),
        ]);
      }

      let nextRecords = records;
      let nextExpenses = expenses;
      if (deleteOriginals) {
        nextRecords = nextRecords.filter((r) => getSheetKey(r) !== sheet1 && getSheetKey(r) !== sheet2);
        nextExpenses = nextExpenses.filter((e) => getSheetKey(e) !== sheet1 && getSheetKey(e) !== sheet2);
      }
      nextRecords = [...nextRecords, ...savedRecords];
      nextExpenses = [...nextExpenses, ...savedExpenses];

      commitRecords(nextRecords);
      commitExpenses(nextExpenses);
      setActiveMonth(combinedSheetKey);
      setShowCombineModal(false);
      alert(`Successfully combined into ${formatSheetLabel(combinedSheetKey)}!`);
    } catch (err) {
      console.error(err);
      let nextRecords = records;
      let nextExpenses = expenses;
      if (deleteOriginals) {
        nextRecords = nextRecords.filter((r) => getSheetKey(r) !== sheet1 && getSheetKey(r) !== sheet2);
        nextExpenses = nextExpenses.filter((e) => getSheetKey(e) !== sheet1 && getSheetKey(e) !== sheet2);
      }
      nextRecords = [...nextRecords, ...mergedRecords];
      nextExpenses = [...nextExpenses, ...mergedExpenses];

      commitRecords(nextRecords);
      commitExpenses(nextExpenses);
      setActiveMonth(combinedSheetKey);
      setShowCombineModal(false);
      alert(`Combined locally into ${formatSheetLabel(combinedSheetKey)}. (Backend sync failed)`);
    }
  }

  async function handleSaveOpeningBalance(amount) {
    const activeSheetKey = activeMonth;
    const { birthdayMonth, eventType, birthdayFor } = parseSheetKey(activeSheetKey);

    const existingRecord = records.find(
      (r) => getSheetKey(r) === activeSheetKey && r.name === 'Opening Balance',
    );

    const record = {
      id: existingRecord ? existingRecord.id : makeId(),
      birthdayMonth,
      birthdayFor,
      eventType,
      name: 'Opening Balance',
      status: 'Paid',
      contribution: amount,
      note: 'Opening Balance Adjustment',
    };

    let savedRecord = record;
    try {
      savedRecord = await api.createRecord(record);
    } catch (err) {
      console.warn('Offline opening balance adjustment save fallback:', err);
      setError(`Saved opening balance adjustment locally only. Backend sync failed: ${err.message}`);
    }

    const existingIndex = records.findIndex((item) => item.id === savedRecord.id);
    const nextRecords = existingIndex >= 0
      ? records.map((item) => (item.id === savedRecord.id ? savedRecord : item))
      : [...records, savedRecord];

    commitRecords(nextRecords);
  }

  async function unlockManagerMode(event) {
    event.preventDefault();
    try {
      await api.verifyManagerPassword(managerPasswordInput);
      setIsManagerMode(true);
      setManagerPasswordInput('');
    } catch (err) {
      if (managerPasswordInput === managerPassword) {
        setIsManagerMode(true);
        setManagerPasswordInput('');
        return;
      }
      alert(err.message || 'Incorrect manager password.');
    }
  }

  function lockManagerMode() {
    setIsManagerMode(false);
    resetForm();
    resetExpenseForm();
  }

  function exportCsv() {
    const blob = new Blob([buildCsv(records)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'birthday-contribution-record.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importCsv(event) {
    const file = event.target.files[0];
    if (!file) return;

    const text = await file.text();
    const importedRecords = recordsFromCsv(text);
    if (importedRecords.length === 0) {
      alert('No valid records found in this CSV.');
      event.target.value = '';
      return;
    }

    let savedRecords = importedRecords;
    try {
      const res = await api.bulkCreateRecords(importedRecords);
      savedRecords = res.map(normalizeRecord);
    } catch (err) {
      console.warn('Offline import CSV fallback:', err);
    }

    commitRecords(savedRecords);
    setActiveMonth(getSheetKey(savedRecords[0]));
    setActiveView('records');
    resetForm();
    setSearch('');
    event.target.value = '';
  }

  if (loading) {
    return (
      <div className="loading-container" style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: '#f6f4ef',
        color: '#202124',
      }}>
        <div className="spinner" style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e5ded3',
          borderTop: '4px solid #0f766e',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px',
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <h2 style={{ fontSize: '1.2rem', color: '#4a453e' }}>Loading tracker data...</h2>
      </div>
    );
  }

  return (
    <main className="app-shell">
      {error && (
        <div style={{
          background: '#fff2f2',
          border: '1px solid #fca5a5',
          color: '#991b1b',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontWeight: '600',
          fontSize: '0.9rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        }}>
          <span>⚠️ {error}</span>
          <button
            onClick={fetchData}
            style={{
              background: '#991b1b',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => e.target.style.background = '#7f1d1d'}
            onMouseOut={(e) => e.target.style.background = '#991b1b'}
          >
            Retry Connection
          </button>
        </div>
      )}

      <Topbar
        isManagerMode={isManagerMode}
        managerPasswordInput={managerPasswordInput}
        onPasswordChange={setManagerPasswordInput}
        onUnlock={unlockManagerMode}
        onLock={lockManagerMode}
        onExportCsv={exportCsv}
        onImportCsv={importCsv}
        fileInputRef={fileInputRef}
      />

      {isManagerMode && (
        <MonthCreatePanel
          monthForm={monthForm}
          setMonthForm={setMonthForm}
          onUpdateMonthField={updateMonthField}
          onSubmit={createMonth}
          onOpenCombineModal={openCombineModal}
          canCombine={monthTabs.length >= 2}
        />
      )}

      <nav className="month-tabs" aria-label="Month views">
        {monthTabs.map((month) => (
          <button
            key={month}
            type="button"
            className={month === activeMonth ? 'tab-button active' : 'tab-button'}
            onClick={() => switchMonth(month)}
          >
            {formatSheetLabel(month)}
          </button>
        ))}
      </nav>

      <section className="summary-grid" aria-label="Contribution totals">
        <MetricCard
          label="Opening Balance"
          value={
            <div>
              <div>{formatMoney(totals.openingBalance)}</div>
              {isManagerMode && (
                <div style={{ fontSize: '0.8rem', color: '#6d675f', marginTop: '6px', fontWeight: 'normal' }}>
                  Adjustment:
                  <OpeningBalanceEditor
                    currentAdjustment={monthFinancials[activeMonth]?.openingBalanceAdjustment ?? 0}
                    onSave={handleSaveOpeningBalance}
                  />
                </div>
              )}
            </div>
          }
        />
        <MetricCard label="Total Collected" value={formatMoney(totals.collected)} />
        <MetricCard label="Total Expense" value={formatMoney(totals.spent)} />
        <MetricCard label="Total Balance" value={formatMoney(totals.closingBalance)} />
      </section>

      <section className="status-grid" aria-label="Contribution status totals">
        <MetricCard label="Total Paid Members" value={totals.paidCount} className="status-card paid-card" />
        <MetricCard label="Pending Members" value={totals.pendingCount} className="status-card pending-card" />
        <MetricCard label="Exempted Members" value={totals.exemptedCount} className="status-card exempted-card" />
        <MetricCard label="NA Members" value={totals.naCount} className="status-card na-card" />
      </section>

      <section className={isManagerMode ? 'editor-layout' : 'viewer-layout'}>
        {isManagerMode && (
          <MemberForm
            form={form}
            onUpdateField={updateField}
            onSubmit={handleSubmit}
            onReset={resetForm}
            nameInputRef={nameInputRef}
          />
        )}

        <datalist id="team-member-suggestions">
          {teamMemberNames.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>

        <section className="records-panel">
          <div className="table-toolbar">
            <div>
              <h2>{formatMonthLabel(activeSheet.birthdayMonth)} {activeEventMeta.name} View</h2>
              <p>{visibleRecords.length} of {monthlyRecords.length} records</p>
            </div>
            <div className="toolbar-actions">
              <input
                type="search"
                placeholder="Search name"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              {isManagerMode ? (
                <div className="reset-actions">
                  <button type="button" className="primary-button" onClick={startAddMember}>
                    + Add Member
                  </button>
                  <button type="button" className="secondary-button" onClick={resetData}>
                    Reset to 0
                  </button>
                  <button type="button" className="secondary-button danger-button" onClick={deleteActiveMonth}>
                    Delete Month
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <nav className="view-tabs" aria-label="Contribution report views">
            {viewTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={tab.id === activeView ? 'tab-button active' : 'tab-button'}
                onClick={() => setActiveView(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="formula-strip">
            <span>Opening Balance</span>
            <strong>{formatMoney(totals.openingBalance)}</strong>
            <span>+ Total Collected</span>
            <strong>{formatMoney(totals.collected)}</strong>
            <span>- Total Expense</span>
            <strong>{formatMoney(totals.spent)}</strong>
            <span>= Total Balance</span>
            <strong className={totals.closingBalance < 0 ? 'negative' : 'positive'}>{formatMoney(totals.closingBalance)}</strong>
            <span>(Pending Amount:</span>
            <strong>{formatMoney(totals.pendingAmount)})</strong>
          </div>

          {activeView === 'records' ? (
            <>
              <RecordsTable
                records={visibleRecords}
                totals={totals}
                onEdit={editRecord}
                onDelete={deleteRecord}
                canEdit={isManagerMode}
              />
              {isManagerMode ? (
                <ExpenseSection
                  form={expenseForm}
                  expenses={monthlyExpenses}
                  onFieldChange={updateExpenseField}
                  onSubmit={handleExpenseSubmit}
                  onCancel={resetExpenseForm}
                  onEdit={editExpense}
                  onDelete={deleteExpense}
                />
              ) : (
                <ExpenseSummary expenses={monthlyExpenses} />
              )}
            </>
          ) : null}

          {activeView === 'pending' ? (
            <ReportPage
              title="Pending Contribution List"
              records={statusReports.pending}
              emptyText="No pending members for this month."
            />
          ) : null}

          {activeView === 'na' ? (
            <ReportPage
              title="NA / Not Participated"
              records={statusReports.na}
              emptyText="No NA members for this month."
            />
          ) : null}

          {activeView === 'exempted' ? (
            <ReportPage
              title={activeEventMeta.exemptedLabel}
              records={statusReports.exempted}
              emptyText={`No ${activeEventMeta.exemptedLabel.toLowerCase()} marked for this sheet.`}
              showBirthDate={true}
            />
          ) : null}

          {activeView === 'banner' ? (
            <BirthdayBanner
              birthdayFor={activeBirthdayFor}
              month={activeMonth}
              eventType={activeSheet.eventType}
              birthdayEmployees={statusReports.exempted}
            />
          ) : null}
        </section>
      </section>

      {showCombineModal && (
        <CombineMonthsModal
          isOpen={showCombineModal}
          onClose={() => setShowCombineModal(false)}
          sheets={monthTabs}
          combineForm={combineForm}
          onUpdateField={updateCombineSheet}
          onCombine={handleCombineExistingSheets}
          expenses={expenses}
          records={records}
        />
      )}
    </main>
  );
}
