const EXPENSE_CATEGORIES = [
  'Food',
  'Transportation',
  'Shopping',
  'Education',
  'Healthcare',
  'Entertainment',
  'Bills',
  'Other',
];

const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investments',
  'Gifts',
  'Other',
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY', 'NGN', 'PKR', 'BDT'];

const CATEGORY_COLORS = {
  Food: '#f59e0b',
  Transportation: '#3b82f6',
  Shopping: '#ec4899',
  Education: '#8b5cf6',
  Healthcare: '#ef4444',
  Entertainment: '#14b8a6',
  Bills: '#6366f1',
  Other: '#94a3b8',
  Salary: '#10b981',
  Freelance: '#0ea5e9',
  Business: '#8b5cf6',
  Investments: '#f59e0b',
  Gifts: '#ec4899',
};

const round = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

module.exports = {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  CURRENCIES,
  CATEGORY_COLORS,
  round,
};
