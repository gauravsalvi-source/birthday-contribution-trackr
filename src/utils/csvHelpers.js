import {
  defaultBirthdayMonth,
  defaultBirthdayFor,
  defaultEventType,
} from '../constants.js';
import { parseAmount, normalizeRecord } from './normalizers.js';
import { getEventMeta } from './sheetHelpers.js';

export function parseCsv(text) {
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

export function recordsFromCsv(text) {
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

export function csvEscape(value) {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function buildCsv(records) {
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
