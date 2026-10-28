import {
  defaultBirthdayMonth,
  defaultBirthdayFor,
  defaultEventType,
  eventTypeLabels,
} from '../constants.js';
import { formatMonthLabel } from './formatters.js';

export function makeId() {
  if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function normalizeEventType(value) {
  return Object.prototype.hasOwnProperty.call(eventTypeLabels, value) ? value : defaultEventType;
}

export function getEventMeta(eventType) {
  return eventTypeLabels[normalizeEventType(eventType)];
}

export function makeSheetKey(month, eventType, recipient) {
  return [
    String(month || defaultBirthdayMonth).trim(),
    normalizeEventType(eventType),
    String(recipient || defaultBirthdayFor).trim(),
  ].join('|');
}

export function getSheetKey(item) {
  return makeSheetKey(item.birthdayMonth, item.eventType, item.birthdayFor);
}

export function parseSheetKey(sheetKey) {
  const [
    birthdayMonth = defaultBirthdayMonth,
    eventType = defaultEventType,
    birthdayFor = defaultBirthdayFor,
  ] = String(sheetKey || '').split('|');

  return {
    birthdayMonth,
    eventType: normalizeEventType(eventType),
    birthdayFor,
  };
}

export function formatSheetLabel(sheetKey) {
  const sheet = parseSheetKey(sheetKey);
  const eventMeta = getEventMeta(sheet.eventType);
  return `${formatMonthLabel(sheet.birthdayMonth)} - ${eventMeta.name}`;
}

export function compareSheetKeys(a, b) {
  const sheetA = parseSheetKey(a);
  const sheetB = parseSheetKey(b);
  const m1A = String(sheetA.birthdayMonth).split('&')[0].trim();
  const m1B = String(sheetB.birthdayMonth).split('&')[0].trim();
  if (m1A !== m1B) {
    return m1A.localeCompare(m1B);
  }
  const isCombinedA = sheetA.birthdayMonth.includes('&');
  const isCombinedB = sheetB.birthdayMonth.includes('&');
  if (isCombinedA !== isCombinedB) {
    return isCombinedA ? 1 : -1;
  }
  return a.localeCompare(b);
}
