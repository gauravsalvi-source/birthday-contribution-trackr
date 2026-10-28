import {
  defaultBirthdayMonth,
  defaultBirthdayFor,
  defaultEventType,
  contributionStatuses,
  defaultRecords,
  defaultTeamMemberNames,
  defaultExpenses,
} from '../constants.js';
import { makeId, normalizeEventType, getEventMeta } from './sheetHelpers.js';

export function parseAmount(value) {
  const parsed = Number.parseFloat(String(value || '').replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

export function normalizeRecord(record) {
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

export function normalizeExpense(expense) {
  return {
    id: expense.id || makeId(),
    birthdayMonth: String(expense.birthdayMonth || defaultBirthdayMonth).trim(),
    birthdayFor: String(expense.birthdayFor || defaultBirthdayFor).trim(),
    eventType: normalizeEventType(expense.eventType),
    item: String(expense.item || '').trim() || 'Expense',
    amount: parseAmount(expense.amount),
  };
}

export function getBabyGiftRecipientName(birthdayFor, fallbackName) {
  const recipient = String(birthdayFor || '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(?:baby\s*gift|gift|baby\s*shower|contribution)\s*(?:for|to)?\s*/i, '')
    .replace(/\s*(?:baby\s*gift|gift\s*contribution|gift|contribution)\s*$/i, '')
    .replace(/\s*(?:'s|`s|’s|\u2019s)\s*(?:baby|babies|child|children|kid|kids|daughter|daughters|son|sons|twin|twins|boy|boys|girl|girls)?\s*$/i, '')
    .replace(/\s*(?:'s|`s|’s|\u2019s)\s*$/i, '')
    .replace(/\s+(?:baby|babies|child|children|kid|kids|daughter|daughters|son|sons|twin|twins|boy|boys|girl|girls)\s*$/i, '')
    .trim();

  return recipient || fallbackName || 'you';
}

export function isBirthdayEmployee(name, birthdayFor) {
  if (!name || !birthdayFor) return false;
  const normalizedName = name.trim().toLowerCase();
  const cleanItem = (item) => item.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim();

  const rawList = birthdayFor
    .toLowerCase()
    .split(/,|&|and|\+/)
    .map(cleanItem)
    .filter(Boolean);

  if (rawList.includes(normalizedName)) return true;

  const cleaned = getBabyGiftRecipientName(birthdayFor, '').toLowerCase();
  const cleanedList = cleaned
    .split(/,|&|and|\+/)
    .map(cleanItem)
    .filter(Boolean);

  return cleanedList.includes(normalizedName);
}

export function buildMonthRecords(
  birthdayMonth,
  birthdayFor,
  eventType = defaultEventType,
  memberNames = defaultTeamMemberNames,
  defaultContribution = 100,
) {
  const normalizedEventType = normalizeEventType(eventType);
  const eventMeta = getEventMeta(normalizedEventType);
  const uniqueNames = Array.from(new Set(
    memberNames.map((name) => String(name || '').trim()).filter(Boolean),
  ));

  return uniqueNames.map((name) => {
    const isExempted = isBirthdayEmployee(name, birthdayFor);
    return normalizeRecord({
      birthdayMonth,
      birthdayFor,
      eventType: normalizedEventType,
      name,
      status: isExempted ? 'Exempted' : 'Pending',
      contribution: isExempted ? 0 : defaultContribution,
      note: isExempted ? eventMeta.exemptedNote : '',
    });
  });
}

export function cloneDefaultRecords() {
  return defaultRecords.map(normalizeRecord);
}

export function cloneDefaultExpenses() {
  return defaultExpenses.map(normalizeExpense);
}

export function cloneZeroedRecords() {
  return defaultRecords.map((record) => normalizeRecord({
    ...record,
    status: 'Pending',
    contribution: 0,
    statusRemark: '',
    note: '',
  }));
}
