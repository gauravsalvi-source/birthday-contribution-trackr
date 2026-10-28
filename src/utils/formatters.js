export function formatMoney(value) {
  return `Rs. ${new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(value)}`;
}

export function formatSingleMonth(val) {
  if (!val) return null;
  const trimmed = String(val).trim();
  const match = trimmed.match(/^(\d{4})-(\d{1,2})$/);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const date = new Date(year, month - 1, 1);
    if (!isNaN(date.getTime())) {
      return {
        monthName: new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(date),
        fullMonthName: new Intl.DateTimeFormat('en-IN', { month: 'long' }).format(date),
        year,
        full: new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric' }).format(date),
      };
    }
  }
  return { monthName: trimmed, fullMonthName: trimmed, year: null, full: trimmed };
}

export function formatMonthLabel(value) {
  if (!value) {
    return 'No Month';
  }

  const str = String(value).trim();
  if (str.includes('&')) {
    const parts = str.split('&').map((p) => p.trim());
    const [p1, p2] = parts.map(formatSingleMonth);
    if (p1 && p2) {
      if (p1.year && p2.year && p1.year === p2.year) {
        return `${p1.monthName} & ${p2.monthName} ${p1.year}`;
      }
      return `${p1.full} & ${p2.full}`;
    }
  }

  const single = formatSingleMonth(str);
  return single ? single.full : str;
}

export function getNextMonth(yyyyMm) {
  if (!yyyyMm || !yyyyMm.includes('-')) return '';
  const [yearStr, monthStr] = yyyyMm.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  if (!year || !month) return '';
  const nextDate = new Date(year, month, 1);
  const nextY = nextDate.getFullYear();
  const nextM = String(nextDate.getMonth() + 1).padStart(2, '0');
  return `${nextY}-${nextM}`;
}
