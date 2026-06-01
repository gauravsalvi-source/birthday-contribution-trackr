import { useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'birthday-contribution-records-react-v5';
const EXPENSE_STORAGE_KEY = 'birthday-contribution-expenses-react-v3';
const defaultBirthdayMonth = '2026-05';
const defaultBirthdayFor = 'Sumit, Lalit & Bhakti';
const defaultEventType = 'birthday';
const eventTypeLabels = {
  birthday: {
    name: 'Birthday',
    contributionName: 'Birthday Contribution',
    sheetLabel: 'Birthday For',
    recipientPlaceholder: 'Employee birthday name',
    exemptedLabel: 'Birthday Employees',
    bannerLabel: 'Birthday Wish Banner',
    exemptedNote: 'Birthday Employee',
  },
  babyGift: {
    name: 'Baby Gift',
    contributionName: 'Baby Gift Contribution',
    sheetLabel: 'Gift For',
    recipientPlaceholder: 'Employee or baby gift name',
    exemptedLabel: 'Gift Recipients',
    bannerLabel: 'Baby Gift Banner',
    exemptedNote: 'Gift Recipient',
  },
};
const contributionStatuses = ['Paid', 'Pending', 'Exempted', 'NA'];
const managerPassword = 'Gaurav007';

const defaultRecords = [
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Gaurav', status: 'Paid', contribution: 100, expense: 467, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Pawan', status: 'Paid', contribution: 100, expense: 480, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Nehal', status: 'Paid', contribution: 100, expense: 354, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Sangeeta', status: 'Paid', contribution: 100, expense: 0, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Bhakti', status: 'Exempted', contribution: 0, expense: 0, note: '', statusRemark: 'Birthday Employee' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Riddhi', status: 'Paid', contribution: 100, expense: 0, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Mohammed', status: 'Paid', contribution: 100, expense: 0, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Mane', status: 'Paid', contribution: 100, expense: 0, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Aniket', status: 'Paid', contribution: 100, expense: 0, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Ishwar', status: 'Paid', contribution: 100, expense: 0, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Samiran', status: 'Paid', contribution: 100, expense: 0, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Sumit', status: 'Exempted', contribution: 0, expense: 0, note: '', statusRemark: 'Birthday Employee' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Lalit', status: 'Exempted', contribution: 0, expense: 0, note: '', statusRemark: 'Birthday Employee' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Juhee', status: 'Paid', contribution: 100, expense: 0, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Rupali', status: 'Paid', contribution: 100, expense: 0, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Rushab', status: 'Paid', contribution: 100, expense: 0, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Ankit', status: 'Paid', contribution: 100, expense: 0, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Sayali', status: 'Paid', contribution: 100, expense: 0, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Prathamesh', status: 'Paid', contribution: 100, expense: 0, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Sweta', status: 'Paid', contribution: 100, expense: 0, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Shivam', status: 'Paid', contribution: 100, expense: 0, note: '', statusRemark: '' },
];

const teamMemberNames = Array.from(new Set(defaultRecords.map((record) => record.name)));

const blankForm = {
  id: '',
  birthdayMonth: defaultBirthdayMonth,
  birthdayFor: defaultBirthdayFor,
  eventType: defaultEventType,
  birthdayDay: 1,
  name: '',
  status: 'Paid',
  contribution: '100',
  birthDate: '',
  note: '',
};

const defaultExpenses = [
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, item: 'Cake & Sevpuri', amount: 1301 },
];

const blankExpenseForm = {
  id: '',
  birthdayMonth: defaultBirthdayMonth,
  birthdayFor: defaultBirthdayFor,
  eventType: defaultEventType,
  item: '',
  amount: '',
};

const blankMonthForm = {
  birthdayMonth: defaultBirthdayMonth,
  birthdayFor: '',
  eventType: defaultEventType,
};

const viewTabs = [
  { id: 'records', label: 'Records' },
  { id: 'pending', label: 'Pending List' },
  { id: 'na', label: 'NA List' },
  { id: 'exempted', label: 'Recipients' },
  { id: 'banner', label: 'Banner' },
];

function makeId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function parseAmount(value) {
  const parsed = Number.parseFloat(String(value || '').replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeEventType(value) {
  return Object.prototype.hasOwnProperty.call(eventTypeLabels, value) ? value : defaultEventType;
}

function getEventMeta(eventType) {
  return eventTypeLabels[normalizeEventType(eventType)];
}

function formatSheetLabel(sheetKey) {
  const sheet = parseSheetKey(sheetKey);
  const eventMeta = getEventMeta(sheet.eventType);
  return `${formatMonthLabel(sheet.birthdayMonth)} - ${eventMeta.name}`;
}

function makeSheetKey(month, eventType, recipient) {
  return [
    String(month || defaultBirthdayMonth).trim(),
    normalizeEventType(eventType),
    String(recipient || defaultBirthdayFor).trim(),
  ].join('|');
}

function getSheetKey(item) {
  return makeSheetKey(item.birthdayMonth, item.eventType, item.birthdayFor);
}

function parseSheetKey(sheetKey) {
  const [birthdayMonth = defaultBirthdayMonth, eventType = defaultEventType, birthdayFor = defaultBirthdayFor] = String(sheetKey || '').split('|');
  return {
    birthdayMonth,
    eventType: normalizeEventType(eventType),
    birthdayFor,
  };
}

function normalizeRecord(record) {
  const status = contributionStatuses.includes(record.status) ? record.status : 'Paid';
  const contribution = status === 'NA' || status === 'Exempted' ? 0 : parseAmount(record.contribution);

  return {
    id: record.id || makeId(),
    birthdayMonth: String(record.birthdayMonth || defaultBirthdayMonth).trim(),
    birthdayFor: String(record.birthdayFor || defaultBirthdayFor).trim(),
    eventType: normalizeEventType(record.eventType),
    name: String(record.name || '').trim() || 'Unnamed',
    status,
    contribution,
    birthDate: String(record.birthDate || '').trim(),
    statusRemark: String(record.statusRemark || '').trim(),
    note: String(record.note || '').trim(),
  };
}

function normalizeExpense(expense) {
  return {
    id: expense.id || makeId(),
    birthdayMonth: String(expense.birthdayMonth || defaultBirthdayMonth).trim(),
    birthdayFor: String(expense.birthdayFor || defaultBirthdayFor).trim(),
    eventType: normalizeEventType(expense.eventType),
    item: String(expense.item || '').trim() || 'Expense',
    amount: parseAmount(expense.amount),
  };
}

function cloneDefaultRecords() {
  return defaultRecords.map(normalizeRecord);
}

function buildMonthRecords(birthdayMonth, birthdayFor, eventType = defaultEventType) {
  const normalizedEventType = normalizeEventType(eventType);
  const isBirthday = normalizedEventType === 'birthday';
  const eventMeta = getEventMeta(normalizedEventType);

  return teamMemberNames.map((name) => normalizeRecord({
    birthdayMonth,
    birthdayFor,
    eventType: normalizedEventType,
    name,
    status: isBirthday && isBirthdayEmployee(name, birthdayFor) ? 'Exempted' : 'Pending',
    contribution: isBirthday && isBirthdayEmployee(name, birthdayFor) ? 0 : 100,
    note: isBirthday && isBirthdayEmployee(name, birthdayFor) ? eventMeta.exemptedNote : '',
  }));
}

function isBirthdayEmployee(name, birthdayFor) {
  const normalizedName = name.trim().toLowerCase();
  return birthdayFor
    .toLowerCase()
    .split(/,|&|and|\+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .includes(normalizedName);
}

function cloneDefaultExpenses() {
  return defaultExpenses.map(normalizeExpense);
}

function cloneZeroedRecords() {
  return defaultRecords.map((record) => normalizeRecord({
    ...record,
    status: 'Pending',
    contribution: 0,
    statusRemark: '',
    note: '',
  }));
}

function loadRecords() {
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
    console.log('Record load error:', error);
    return cloneDefaultRecords();
  }
}

function saveRecords(records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // The app can still run if a browser blocks storage.
  }
}

function loadExpenses() {
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

function saveExpenses(expenses) {
  try {
    localStorage.setItem(EXPENSE_STORAGE_KEY, JSON.stringify(expenses));
  } catch {
    // The app can still run if a browser blocks storage.
  }
}

function formatMoney(value) {
  return `Rs. ${new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(value)}`;
}

function formatMonthLabel(value) {
  if (!value) {
    return 'No Month';
  }

  const [year, month] = value.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        index += 1;
      }
      row.push(cell);
      if (row.some((value) => value.trim() !== '')) {
        rows.push(row);
      }
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((value) => value.trim() !== '')) {
    rows.push(row);
  }

  return rows;
}

function recordsFromCsv(text) {
  const rows = parseCsv(text);
  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0].map((header) => header.trim().toLowerCase());
  const monthIndex = headers.findIndex((header) => header.includes('month'));
  const birthdayForIndex = headers.findIndex((header) => header.includes('birthday') || header === 'for' || header.includes('gift for'));
  const eventTypeIndex = headers.findIndex((header) => header.includes('occasion') || header.includes('event'));
  const nameIndex = headers.findIndex((header) => header === 'name' || header.includes('member'));
  const statusIndex = headers.findIndex((header) => header.includes('status'));
  const amountIndex = headers.findIndex((header) => header === 'amount' || header.includes('contribution'));
  const expenseIndex = headers.findIndex((header) => header.includes('expense'));
  const balanceIndex = headers.findIndex((header) => header.includes('balance'));
  const remarkIndex = headers.findIndex((header) => header.includes('remark'));

  return rows
    .slice(1)
    .map((row) => ({
      birthdayMonth: monthIndex >= 0 && row[monthIndex] ? row[monthIndex] : defaultBirthdayMonth,
      birthdayFor: birthdayForIndex >= 0 && row[birthdayForIndex] ? row[birthdayForIndex] : defaultBirthdayFor,
      eventType: eventTypeIndex >= 0 && row[eventTypeIndex]?.toLowerCase().includes('baby') ? 'babyGift' : defaultEventType,
      name: row[nameIndex] || '',
      status: statusIndex >= 0 && row[statusIndex] ? row[statusIndex] : 'Paid',
      contribution: parseAmount(row[amountIndex]),
      expense: expenseIndex >= 0 ? parseAmount(row[expenseIndex]) : 0,
      statusRemark: remarkIndex >= 0 && row[remarkIndex] ? row[remarkIndex] : '',
      note: balanceIndex >= 0 && row[balanceIndex] ? `Balance ${row[balanceIndex]}` : '',
    }))
    .filter((record) => record.name.trim() && !record.name.toLowerCase().includes('total'))
    .map(normalizeRecord);
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function buildCsv(records) {
  const header = ['Month', 'Occasion', 'For', 'Team Member Name', 'Contribution Status', 'Contribution Amount', 'Note'];
  const rows = records.map((record) => [
    record.birthdayMonth,
    getEventMeta(record.eventType).name,
    record.birthdayFor,
    record.name,
    record.status,
    record.contribution,
    record.note,
  ]);

  return [header, ...rows]
    .map((row) => row.map(csvEscape).join(','))
    .join('\n');
}

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
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error('Failed to fetch data from the server');
      }
      const data = await response.json();
      const backendRecords = (data.records || []).map(normalizeRecord);
      const backendExpenses = (data.expenses || []).map(normalizeExpense);
      setRecords(backendRecords);
      setExpenses(backendExpenses);
      
      if (backendRecords.length > 0 || backendExpenses.length > 0) {
        const sheets = Array.from(new Set([
          ...backendRecords.map(getSheetKey),
          ...backendExpenses.map(getSheetKey),
        ])).filter(Boolean);
        const sorted = sheets.sort((a, b) => b.localeCompare(a));
        if (sorted.length > 0) {
          setActiveMonth(sorted[0]);
        }
      }
      setError(null);
    } catch (err) {
      console.error('Error loading backend data:', err);
      setError('Could not connect to the backend server. Using local storage instead.');
      const localRecs = loadRecords();
      const localExps = loadExpenses();
      setRecords(localRecs);
      setExpenses(localExps);
      if (localRecs && localRecs.length > 0) {
        const sheets = Array.from(new Set(localRecs.map(getSheetKey))).filter(Boolean);
        const sorted = sheets.sort((a, b) => b.localeCompare(a));
        if (sorted.length > 0) {
          setActiveMonth(sorted[0]);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  const monthTabs = useMemo(() => {
    const sheets = Array.from(new Set([
      ...records.map(getSheetKey),
      ...expenses.map(getSheetKey),
    ])).filter(Boolean);
    return sheets.sort((a, b) => b.localeCompare(a));
  }, [records, expenses]);

  const activeSheet = useMemo(() => parseSheetKey(activeMonth), [activeMonth]);
  const activeEventMeta = getEventMeta(activeSheet.eventType);

  const monthlyRecords = useMemo(
    () => records.filter((record) => getSheetKey(record) === activeMonth && record.name !== 'Opening Balance'),
    [records, activeMonth],
  );
  const monthlyExpenses = useMemo(
    () => expenses.filter((expense) => getSheetKey(expense) === activeMonth),
    [expenses, activeMonth],
  );

  const monthFinancials = useMemo(() => {
    const orderedSheets = Array.from(new Set([
      ...records.map(getSheetKey),
      ...expenses.map(getSheetKey),
    ]))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    let runningBalance = 0;
    const financials = {};

    orderedSheets.forEach((sheetKey) => {
      const monthRecords = records.filter((record) => getSheetKey(record) === sheetKey);
      const monthExpenses = expenses.filter((expense) => getSheetKey(expense) === sheetKey);
      
      const openingBalanceAdjustment = monthRecords
        .filter((record) => record.name === 'Opening Balance')
        .reduce((sum, record) => sum + record.contribution, 0);

      const regularRecords = monthRecords.filter((record) => record.name !== 'Opening Balance');

      const collected = regularRecords
        .filter((record) => record.status === 'Paid')
        .reduce((sum, record) => sum + record.contribution, 0);
      const spent = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
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
    });

    return financials;
  }, [records, expenses]);

  const totals = useMemo(() => {
    const paidRecords = monthlyRecords.filter((record) => record.status === 'Paid');
    const pendingRecords = monthlyRecords.filter((record) => record.status === 'Pending');
    const exemptedRecords = monthlyRecords.filter((record) => record.status === 'Exempted');
    const naRecords = monthlyRecords.filter((record) => record.status === 'NA');
    const activeRecords = monthlyRecords.filter((record) => record.status !== 'Exempted' && record.status !== 'NA');
    const collected = paidRecords.reduce((sum, record) => sum + record.contribution, 0);
    const pendingAmount = pendingRecords.reduce((sum, record) => sum + record.contribution, 0);
    const spent = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    return {
      collected,
      expected: collected + pendingAmount,
      pendingAmount,
      spent,
      balance: collected - spent,
      openingBalance: monthFinancials[activeMonth]?.openingBalance ?? 0,
      closingBalance: monthFinancials[activeMonth]?.closingBalance ?? collected - spent,
      expectedBalance: (monthFinancials[activeMonth]?.openingBalance ?? 0) + collected + pendingAmount - spent,
      activeCount: activeRecords.length,
      paidCount: paidRecords.length,
      pendingCount: pendingRecords.length,
      exemptedCount: exemptedRecords.length,
      naCount: naRecords.length,
    };
  }, [monthlyRecords, monthlyExpenses, monthFinancials, activeMonth]);

  const statusReports = useMemo(() => ({
    pending: monthlyRecords.filter((record) => record.status === 'Pending'),
    na: monthlyRecords.filter((record) => record.status === 'NA'),
    exempted: monthlyRecords.filter((record) => record.status === 'Exempted'),
  }), [monthlyRecords]);

  const visibleRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    return monthlyRecords
      .filter((record) => !query || record.name.toLowerCase().includes(query))
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
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
      birthdayFor: monthRecord?.birthdayFor || defaultBirthdayFor,
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

    try {
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || 'Failed to save record on server');
      }
      const savedRecord = await response.json();

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
    } catch (err) {
      console.error(err);
      // fallback to offline save if server is unreachable
      const existingIndex = records.findIndex((item) => item.id === record.id);
      const nextRecords = existingIndex >= 0
        ? records.map((item) => (item.id === record.id ? record : item))
        : [...records, record];
      commitRecords(nextRecords);
      setActiveMonth(getSheetKey(record));
      setForm({
        ...blankForm,
        birthdayMonth: record.birthdayMonth,
        eventType: record.eventType,
        birthdayFor: record.birthdayFor,
      });
      setError(`Saved locally only. Backend sync failed: ${err.message}`);
      alert(`Note: Saved locally only. Backend sync failed: ${err.message}`);
    }
  }

  function editRecord(record) {
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
  }

  async function deleteRecord(record) {
    if (!confirm(`Delete entry for ${record.name}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/records/${record.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete record on server');

      const nextRecords = records.filter((item) => item.id !== record.id);
      commitRecords(nextRecords);
      if (form.id === record.id) {
        resetForm();
      }
    } catch (err) {
      console.error(err);
      const nextRecords = records.filter((item) => item.id !== record.id);
      commitRecords(nextRecords);
      if (form.id === record.id) {
        resetForm();
      }
      alert('Note: Deleted locally. Failed to sync with server.');
    }
  }

  async function handleExpenseSubmit(event) {
    event.preventDefault();
    const expense = normalizeExpense(expenseForm);

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || 'Failed to save expense on server');
      }
      const savedExpense = await response.json();

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
    } catch (err) {
      console.error(err);
      // offline fallback
      const existingIndex = expenses.findIndex((item) => item.id === expense.id);
      const nextExpenses = existingIndex >= 0
        ? expenses.map((item) => (item.id === expense.id ? expense : item))
        : [...expenses, expense];
      commitExpenses(nextExpenses);
      setActiveMonth(getSheetKey(expense));
      setExpenseForm({
        ...blankExpenseForm,
        birthdayMonth: expense.birthdayMonth,
        eventType: expense.eventType,
        birthdayFor: expense.birthdayFor,
      });
      setError(`Saved expense locally only. Backend sync failed: ${err.message}`);
      alert(`Note: Saved expense locally only. Backend sync failed: ${err.message}`);
    }
  }

  function editExpense(expense) {
    setExpenseForm({
      id: expense.id,
      birthdayMonth: expense.birthdayMonth,
      birthdayFor: expense.birthdayFor,
      eventType: expense.eventType,
      item: expense.item,
      amount: String(expense.amount),
    });
  }

  async function deleteExpense(expense) {
    if (!confirm(`Delete expense "${expense.item}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/expenses/${expense.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete expense on server');

      const nextExpenses = expenses.filter((item) => item.id !== expense.id);
      commitExpenses(nextExpenses);
      if (expenseForm.id === expense.id) {
        resetExpenseForm();
      }
    } catch (err) {
      console.error(err);
      // offline fallback
      const nextExpenses = expenses.filter((item) => item.id !== expense.id);
      commitExpenses(nextExpenses);
      if (expenseForm.id === expense.id) {
        resetExpenseForm();
      }
      alert('Note: Deleted locally. Failed to sync with server.');
    }
  }

  async function resetData() {
    if (!confirm(`Reset ${formatMonthLabel(activeSheet.birthdayMonth)} ${activeEventMeta.contributionName} and expense amounts to 0?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/records/reset/${encodeURIComponent(activeMonth)}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to reset month data on server');

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
    } catch (err) {
      console.error(err);
      // offline fallback
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
      commitRecords(nextRecords);
      commitExpenses(expenses.filter((expense) => getSheetKey(expense) !== activeMonth));
      resetForm();
      resetExpenseForm();
      setSearch('');
      alert('Note: Reset locally. Failed to sync with server.');
    }
  }

  async function deleteActiveMonth() {
    if (!confirm(`Delete ${formatMonthLabel(activeSheet.birthdayMonth)} ${activeEventMeta.contributionName} sheet and all its records and expenses?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/records/month/${encodeURIComponent(activeMonth)}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete month from server');

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
    } catch (err) {
      console.error(err);
      // offline fallback
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
      alert('Note: Deleted locally. Failed to sync with server.');
    }
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

    const birthdayMonth = monthForm.birthdayMonth;
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

    const newMonthRecords = buildMonthRecords(birthdayMonth, birthdayFor, eventType);

    try {
      const response = await fetch('/api/records/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMonthRecords),
      });
      if (!response.ok) throw new Error('Failed to create month on server');
      const savedRecords = (await response.json()).map(normalizeRecord);

      commitRecords(savedRecords);

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
        birthdayMonth,
        eventType,
        birthdayFor: '',
      });
    } catch (err) {
      console.error(err);
      // offline fallback
      const nextRecords = [...records, ...newMonthRecords];
      commitRecords(nextRecords);
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
        birthdayMonth,
        eventType,
        birthdayFor: '',
      });
      alert('Note: Created month sheet locally. Failed to sync with server.');
    }
  }

  async function handleSaveOpeningBalance(amount) {
    const activeSheetKey = activeMonth;
    const { birthdayMonth, eventType, birthdayFor } = parseSheetKey(activeSheetKey);
    
    const existingRecord = records.find(
      (r) => getSheetKey(r) === activeSheetKey && r.name === 'Opening Balance'
    );
    
    const record = {
      id: existingRecord ? existingRecord.id : makeId(),
      birthdayMonth,
      birthdayFor,
      eventType,
      name: 'Opening Balance',
      status: 'Paid',
      contribution: amount,
      note: 'Opening Balance Adjustment'
    };

    try {
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || 'Failed to save opening balance adjustment on server');
      }
      const savedRecord = await response.json();

      const existingIndex = records.findIndex((item) => item.id === savedRecord.id);
      const nextRecords = existingIndex >= 0
        ? records.map((item) => (item.id === savedRecord.id ? savedRecord : item))
        : [...records, savedRecord];

      commitRecords(nextRecords);
      // Refresh data to reflect updated opening balance
      fetchData();
    } catch (err) {
      console.error(err);
      // fallback to offline save if server is unreachable
      const existingIndex = records.findIndex((item) => item.id === record.id);
      const nextRecords = existingIndex >= 0
        ? records.map((item) => (item.id === record.id ? record : item))
        : [...records, record];
      commitRecords(nextRecords);
      setError(`Saved opening balance adjustment locally only. Backend sync failed: ${err.message}`);
    }
  }

  function unlockManagerMode(event) {
    event.preventDefault();
    if (managerPasswordInput !== managerPassword) {
      alert('Incorrect manager password.');
      return;
    }
    setIsManagerMode(true);
    setManagerPasswordInput('');
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
    if (!file) {
      return;
    }

    const text = await file.text();
    const importedRecords = recordsFromCsv(text);
    if (importedRecords.length === 0) {
      alert('No valid records found in this CSV.');
      event.target.value = '';
      return;
    }

    try {
      const response = await fetch('/api/records/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(importedRecords),
      });
      if (!response.ok) throw new Error('Failed to bulk save imported records on server');
      const savedRecords = await response.json();

      commitRecords(savedRecords);
      setActiveMonth(getSheetKey(savedRecords[0]));
      setActiveView('records');
      resetForm();
      setSearch('');
      event.target.value = '';
    } catch (err) {
      console.error(err);
      // offline fallback
      commitRecords(importedRecords);
      setActiveMonth(getSheetKey(importedRecords[0]));
      setActiveView('records');
      resetForm();
      setSearch('');
      event.target.value = '';
      alert('Note: Imported CSV locally. Failed to sync with server.');
    }
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
        color: '#202124'
      }}>
        <div className="spinner" style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e5ded3',
          borderTop: '4px solid #0f766e',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
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
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
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
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#7f1d1d'}
            onMouseOut={(e) => e.target.style.background = '#991b1b'}
          >
            Retry Connection
          </button>
        </div>
      )}
      <header className="topbar">
        <div>
          <p className="eyebrow">Monthly Team Birthday Fund</p>
          <h1>Birthday Contribution Tracker</h1>
        </div>
        <div className="topbar-actions">
          {isManagerMode ? (
            <>
              <button type="button" className="secondary-button" onClick={exportCsv}>
                Export CSV
              </button>
              <button type="button" className="secondary-button" onClick={() => fileInputRef.current.click()}>
                Import CSV
              </button>
              <button type="button" className="secondary-button danger-button" onClick={lockManagerMode}>
                Lock Editing
              </button>
              <input ref={fileInputRef} className="hidden-file" type="file" accept=".csv,text/csv" onChange={importCsv} />
            </>
          ) : (
            <form className="manager-login" onSubmit={unlockManagerMode}>
              <input
                type="password"
                placeholder="Manager password"
                value={managerPasswordInput}
                onChange={(event) => setManagerPasswordInput(event.target.value)}
              />
              <button type="submit" className="secondary-button">
                Unlock Editing
              </button>
            </form>
          )}
        </div>
      </header>

      {isManagerMode ? (
        <form className="month-create-panel" onSubmit={createMonth}>
          <div>
            <h2>Create Monthly Sheet</h2>
            <p>All team members will be added automatically for the selected month.</p>
          </div>
          <label>
            Occasion
            <select
              value={monthForm.eventType}
              onChange={(event) => updateMonthField('eventType', event.target.value)}
              required
            >
              {Object.entries(eventTypeLabels).map(([value, meta]) => (
                <option key={value} value={value}>{meta.name}</option>
              ))}
            </select>
          </label>
          <label>
            Month
            <input
              type="month"
              value={monthForm.birthdayMonth}
              onChange={(event) => updateMonthField('birthdayMonth', event.target.value)}
              required
            />
          </label>
          <label>
            {getEventMeta(monthForm.eventType).sheetLabel}
            <input
              type="text"
              placeholder={getEventMeta(monthForm.eventType).recipientPlaceholder}
              value={monthForm.birthdayFor}
              onChange={(event) => updateMonthField('birthdayFor', event.target.value)}
              required
            />
          </label>
          <button type="submit" className="primary-button">
            Create Month
          </button>
        </form>
      ) : null}

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
        {isManagerMode ? (
          <form className="form-panel" onSubmit={handleSubmit}>
            <div className="section-heading">
              <h2>{form.id ? 'Edit Record' : 'Add Record'}</h2>
              {form.id ? (
                <button type="button" className="ghost-button" onClick={resetForm}>
                  Cancel
                </button>
              ) : null}
            </div>

            <label>
              Month
              <input
                type="month"
                value={form.birthdayMonth}
                onChange={(event) => updateField('birthdayMonth', event.target.value)}
                required
              />
            </label>

            <label>
              Occasion
              <select
                value={form.eventType}
                onChange={(event) => updateField('eventType', event.target.value)}
                required
              >
                {Object.entries(eventTypeLabels).map(([value, meta]) => (
                  <option key={value} value={value}>{meta.name}</option>
                ))}
              </select>
            </label>

            <label>
              {getEventMeta(form.eventType).sheetLabel}
              <input
                type="text"
                placeholder={getEventMeta(form.eventType).recipientPlaceholder}
                value={form.birthdayFor}
                onChange={(event) => updateField('birthdayFor', event.target.value)}
                required
              />
            </label>

            <label>
              Team Member Name
              <input
                type="text"
                placeholder="Contributor name"
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                required
              />
            </label>

            <label>
              Contribution Status
              <select
                value={form.status}
                onChange={(event) => updateField('status', event.target.value)}
                required
              >
                {contributionStatuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>

            <label>
              Contribution Amount
              <input
                type="number"
                min="0"
                step="1"
                placeholder="100"
                value={form.contribution}
                onChange={(event) => updateField('contribution', event.target.value)}
                disabled={form.status === 'NA' || form.status === 'Exempted'}
                required
              />
            </label>

            <label>
              Birth Date
              <input
                type="date"
                value={form.birthDate}
                onChange={(event) => updateField('birthDate', event.target.value)}
              />
            </label>

            <label>
              Note
              <input
                type="text"
                placeholder="Optional"
                value={form.note}
                onChange={(event) => updateField('note', event.target.value)}
              />
            </label>

            <button type="submit" className="primary-button">
              Save Record
            </button>
          </form>
        ) : null}

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
    </main>
  );
}

function MetricCard({ label, value, className = '', valueClassName = '' }) {
  return (
    <article className={`metric-card ${className}`.trim()}>
      <span>{label}</span>
      <strong className={valueClassName}>{value}</strong>
    </article>
  );
}

function OpeningBalanceEditor({ currentAdjustment, onSave }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentAdjustment);

  useEffect(() => {
    setValue(currentAdjustment);
  }, [currentAdjustment]);

  if (editing) {
    return (
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          onSave(parseFloat(value) || 0);
          setEditing(false);
        }}
        style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}
      >
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{
            width: '80px',
            height: '24px',
            fontSize: '0.8rem',
            padding: '2px 6px',
            border: '1px solid #cec6bb',
            borderRadius: '4px',
            background: '#ffffff',
            color: '#202124'
          }}
          required
        />
        <button 
          type="submit" 
          className="primary-button" 
          style={{ minHeight: '24px', padding: '0 6px', fontSize: '0.75rem', fontWeight: 'bold' }}
        >
          Save
        </button>
        <button 
          type="button" 
          className="secondary-button" 
          onClick={() => {
            setValue(currentAdjustment);
            setEditing(false);
          }}
          style={{ minHeight: '24px', padding: '0 6px', fontSize: '0.75rem' }}
        >
          Cancel
        </button>
      </form>
    );
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: '4px' }}>
      <strong>{formatMoney(currentAdjustment)}</strong>
      <button 
        type="button" 
        className="ghost-button" 
        onClick={() => setEditing(true)}
        style={{ minHeight: '20px', padding: '0px 4px', fontSize: '0.75rem', textDecoration: 'underline' }}
      >
        Edit
      </button>
    </span>
  );
}

function RecordsTable({ records, totals, onEdit, onDelete, canEdit }) {
  return (
    <div className="table-scroll">
      <table className={canEdit ? 'records-table editable-table' : 'records-table viewer-table'}>
        <thead>
          <tr>
            <th>Month</th>
            <th>Team Member Name</th>
            <th>Status</th>
            <th className="number-cell">Contribution Amount</th>
            <th className="number-cell">Total Balance</th>
            {canEdit ? <th>Action</th> : null}
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr>
              <td className="empty-state" colSpan={canEdit ? 6 : 5}>No records found.</td>
            </tr>
          ) : (
            records.map((record) => (
              <RecordRow
                key={record.id}
                record={record}
                onEdit={onEdit}
                onDelete={onDelete}
                canEdit={canEdit}
              />
            ))
          )}
        </tbody>
        <tfoot>
          <tr>
            <th></th>
            <th>Total</th>
            <th>
              Paid {totals.paidCount} / Pending {totals.pendingCount} / NA {totals.naCount}
            </th>
            <th className="number-cell">{formatMoney(totals.collected)}</th>
            <th className={`number-cell ${totals.closingBalance < 0 ? 'negative' : 'positive'}`}>
              {formatMoney(totals.closingBalance)}
            </th>
            {canEdit ? <th></th> : null}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function RecordRow({ record, onEdit, onDelete, canEdit }) {
  return (
    <tr>
      <td>{record.birthdayMonth}</td>
      <td>{record.name}</td>
      <td>
        <span className={`status-pill ${record.status.toLowerCase()}`}>{record.status}</span>
      </td>
      <td className="number-cell">{formatMoney(record.contribution)}</td>
      <td className="number-cell muted-cell">-</td>
      {canEdit ? (
        <td>
          <div className="actions">
            <button type="button" className="action-button" onClick={() => onEdit(record)}>
              Edit
            </button>
            <button type="button" className="action-button danger" onClick={() => onDelete(record)}>
              Delete
            </button>
          </div>
        </td>
      ) : null}
    </tr>
  );
}

function ExpenseSummary({ expenses }) {
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <section className="expense-panel">
      <div className="section-heading">
        <div>
          <h2>Monthly Expenses</h2>
          <p>Read-only expense summary</p>
        </div>
      </div>
      <div className="table-scroll">
        <table className="expense-table">
          <thead>
            <tr>
              <th>Expense Item</th>
              <th className="number-cell">Amount</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td className="empty-state" colSpan="2">No expenses added for this month.</td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.item}</td>
                  <td className="number-cell">{formatMoney(expense.amount)}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <th>Total Expense</th>
              <th className="number-cell">{formatMoney(totalExpense)}</th>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

function ExpenseSection({ form, expenses, onFieldChange, onSubmit, onCancel, onEdit, onDelete }) {
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <section className="expense-panel">
      <div className="section-heading">
        <div>
          <h2>Monthly Expenses</h2>
          <p>Spent from total contribution amount</p>
        </div>
        {form.id ? (
          <button type="button" className="ghost-button" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>

      <form className="expense-form" onSubmit={onSubmit}>
        <input
          type="hidden"
          value={form.birthdayMonth}
          onChange={(event) => onFieldChange('birthdayMonth', event.target.value)}
        />
        <input
          type="hidden"
          value={form.eventType}
          onChange={(event) => onFieldChange('eventType', event.target.value)}
        />
        <label>
          Expense Item
          <input
            type="text"
            placeholder="Cake, snacks, decoration"
            value={form.item}
            onChange={(event) => onFieldChange('item', event.target.value)}
            required
          />
        </label>
        <label>
          Expense Amount
          <input
            type="number"
            min="0"
            step="1"
            placeholder="0"
            value={form.amount}
            onChange={(event) => onFieldChange('amount', event.target.value)}
            required
          />
        </label>
        <button type="submit" className="primary-button">
          {form.id ? 'Update Expense' : 'Add Expense'}
        </button>
      </form>

      <div className="table-scroll">
        <table className="expense-table">
          <thead>
            <tr>
              <th>Expense Item</th>
              <th className="number-cell">Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td className="empty-state" colSpan="3">No expenses added for this month.</td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.item}</td>
                  <td className="number-cell">{formatMoney(expense.amount)}</td>
                  <td>
                    <div className="actions">
                      <button type="button" className="action-button" onClick={() => onEdit(expense)}>
                        Edit
                      </button>
                      <button type="button" className="action-button danger" onClick={() => onDelete(expense)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <th>Total Expense</th>
              <th className="number-cell">{formatMoney(totalExpense)}</th>
              <th></th>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

function ReportPage({ title, records, emptyText, showBirthDate = false, canEdit = false, onEdit = null }) {
  return (
    <section className="report-page">
      <div className="report-page-header">
        <h3>{title}</h3>
        <span>{records.length} members</span>
      </div>
      {records.length === 0 ? (
        <p className="empty-report">{emptyText}</p>
      ) : (
        <div className="table-scroll">
          <table className="report-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Team Member Name</th>
                <th>Status</th>
                {showBirthDate ? <th>Birth Date</th> : <th className="number-cell">Contribution Amount</th>}
                <th>Note</th>
                {canEdit ? <th>Action</th> : null}
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>{record.birthdayMonth}</td>
                  <td>{record.name}</td>
                  <td><span className={`status-pill ${record.status.toLowerCase()}`}>{record.status}</span></td>
                  {showBirthDate ? (
                    <td>{record.birthDate ? new Date(record.birthDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '-'}</td>
                  ) : (
                    <td className="number-cell">{formatMoney(record.contribution)}</td>
                  )}
                  <td>{record.note || '-'}</td>
                  {canEdit ? (
                    <td>
                      <div className="actions">
                        <button type="button" className="action-button" onClick={() => onEdit && onEdit(record)}>
                          Edit
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function getBabyGiftRecipientName(birthdayFor, fallbackName) {
  const recipient = String(birthdayFor || '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^baby\s*gift\s*(?:for|to)?\s*/i, '')
    .replace(/^(?:gift|contribution)\s*(?:for|to)\s*/i, '')
    .replace(/\s*(?:baby\s*gift|gift\s*contribution|contribution)\s*$/i, '')
    .replace(/\s*(?:'s|`s|\u2019s)\s*(?:baby|child|daughter|son)?\s*$/i, '')
    .replace(/\s*(?:'s|`s|\u2019s)\s*$/i, '')
    .replace(/\s+(?:baby|child|daughter|son)\s*$/i, '')
    .trim();

  return recipient || fallbackName || 'you';
}

function BirthdayBanner({ birthdayFor, month, eventType, birthdayEmployees }) {
  let names = '';
  const eventMeta = getEventMeta(eventType);
  const monthValue = parseSheetKey(month).birthdayMonth;
  const isBabyGift = eventType === 'babyGift';
  const formatList = (list) => {
    if (list.length === 0) return '';
    if (list.length === 1) return list[0];
    const items = [...list];
    const last = items.pop();
    return `${items.join(', ')} & ${last}`;
  };

  if (birthdayEmployees.length > 0) {
    names = formatList(birthdayEmployees.map((record) => record.name));
  } else {
    const fallbackNames = birthdayFor.split(/,|&|and|\+/).map((n) => n.trim()).filter(Boolean);
    names = formatList(fallbackNames);
  }

  const babyGiftRecipient = getBabyGiftRecipientName(birthdayFor, names);

  return (
    <section className="birthday-banner-page">
      <div className="birthday-banner">
        <div className="banner-ribbon">{formatMonthLabel(monthValue)}</div>
        <p className="banner-kicker">
          {isBabyGift
            ? `${formatMonthLabel(monthValue)} - Team Contribution for ${birthdayFor}`
            : `Team ${eventMeta.name} Contribution`}
        </p>
        <h2>{isBabyGift ? `Congratulations, ${babyGiftRecipient}` : 'Happy Birthday'}</h2>
        {isBabyGift ? null : <strong>{names}</strong>}
        <p className="banner-message">
          {isBabyGift
            ? 'Wishing your family joy, good health, and beautiful new memories ahead.'
            : 'Wishing you joy, success, great health, and a wonderful year ahead.'}
        </p>
        <div className="banner-footer">From all your teammates</div>
      </div>
    </section>
  );
}
