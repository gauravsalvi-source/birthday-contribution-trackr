export const STORAGE_KEY = 'birthday-contribution-records-react-v5';
export const EXPENSE_STORAGE_KEY = 'birthday-contribution-expenses-react-v3';
export const defaultBirthdayMonth = '2026-05';
export const defaultBirthdayFor = 'Sumit, Lalit & Bhakti';
export const defaultEventType = 'birthday';

export const eventTypeLabels = {
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

export const contributionStatuses = ['Paid', 'Pending', 'Exempted', 'NA'];

// Configurable via VITE_MANAGER_PASSWORD env var with safe fallback
export const managerPassword = import.meta.env.VITE_MANAGER_PASSWORD || 'Admin007';

export const defaultRecords = [
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Gaurav', status: 'Paid', contribution: 100, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Pawan', status: 'Paid', contribution: 100, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Nehal', status: 'Paid', contribution: 100, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Sangeeta', status: 'Paid', contribution: 100, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Bhakti', status: 'Exempted', contribution: 0, note: '', statusRemark: 'Birthday Employee' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Riddhi', status: 'Paid', contribution: 100, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Mohammed', status: 'Paid', contribution: 100, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Mane', status: 'Paid', contribution: 100, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Aniket', status: 'Paid', contribution: 100, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Ishwar', status: 'Paid', contribution: 100, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Samiran', status: 'Paid', contribution: 100, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Sumit', status: 'Exempted', contribution: 0, note: '', statusRemark: 'Birthday Employee' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Lalit', status: 'Exempted', contribution: 0, note: '', statusRemark: 'Birthday Employee' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Juhee', status: 'Paid', contribution: 100, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Rupali', status: 'Paid', contribution: 100, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Rushab', status: 'Paid', contribution: 100, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Ankit', status: 'Paid', contribution: 100, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Ankit V', status: 'Paid', contribution: 100, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Laxmi', status: 'Paid', contribution: 100, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Sayali', status: 'Paid', contribution: 100, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Prathamesh', status: 'Paid', contribution: 100, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Sweta', status: 'Paid', contribution: 100, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Shivam', status: 'Paid', contribution: 100, note: '', statusRemark: '' },
];

export const defaultTeamMemberNames = Array.from(new Set(defaultRecords.map((record) => record.name)));

export const blankForm = {
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

export const defaultExpenses = [
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, item: 'Cake & Sevpuri', amount: 1301 },
];

export const blankExpenseForm = {
  id: '',
  birthdayMonth: defaultBirthdayMonth,
  birthdayFor: defaultBirthdayFor,
  eventType: defaultEventType,
  item: '',
  amount: '',
};

export const blankMonthForm = {
  isCombined: false,
  birthdayMonth: defaultBirthdayMonth,
  birthdayMonth2: '',
  birthdayFor: '',
  eventType: defaultEventType,
  contributionPerMember: '100',
  additionalMembers: '',
};

export const viewTabs = [
  { id: 'records', label: 'Records' },
  { id: 'pending', label: 'Pending List' },
  { id: 'na', label: 'NA List' },
  { id: 'exempted', label: 'Recipients' },
  { id: 'banner', label: 'Banner' },
];
