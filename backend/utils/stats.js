const { round } = require('./constants');

const monthKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const monthName = (monthIndex) =>
  new Date(2000, monthIndex, 1).toLocaleString('en-US', { month: 'short' });

/**
 * Build an income/expense/savings series for the last `count` months
 * (including the current month).
 */
const lastMonthsSeries = (transactions, count = 6, referenceDate = new Date()) => {
  const months = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - i, 1);
    months.push({
      key: monthKey(date),
      label: monthName(date.getMonth()),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      income: 0,
      expenses: 0,
      savings: 0,
    });
  }

  const byKey = new Map(months.map((month) => [month.key, month]));

  transactions.forEach((transaction) => {
    const month = byKey.get(monthKey(new Date(transaction.date)));
    if (!month) return;
    if (transaction.type === 'income') month.income += transaction.amount;
    else month.expenses += transaction.amount;
  });

  return months.map((month) => ({
    label: month.label,
    month: month.month,
    year: month.year,
    income: round(month.income),
    expenses: round(month.expenses),
    savings: round(month.income - month.expenses),
  }));
};

/** Build a 12-month series for a specific year. */
const yearSeries = (transactions, year) => {
  const months = Array.from({ length: 12 }, (_, index) => ({
    key: `${year}-${String(index + 1).padStart(2, '0')}`,
    label: monthName(index),
    month: index + 1,
    year,
    income: 0,
    expenses: 0,
  }));
  const byKey = new Map(months.map((month) => [month.key, month]));

  transactions.forEach((transaction) => {
    const month = byKey.get(monthKey(new Date(transaction.date)));
    if (!month) return;
    if (transaction.type === 'income') month.income += transaction.amount;
    else month.expenses += transaction.amount;
  });

  return months.map((month) => ({
    label: month.label,
    month: month.month,
    year: month.year,
    income: round(month.income),
    expenses: round(month.expenses),
    savings: round(month.income - month.expenses),
  }));
};

/** Group transactions by category and calculate share of the total. */
const categoryBreakdown = (transactions, type) => {
  const filtered = transactions.filter((transaction) => transaction.type === type);
  const total = filtered.reduce((sum, transaction) => sum + transaction.amount, 0);
  const grouped = filtered.reduce((acc, transaction) => {
    const key = transaction.category || 'Other';
    acc[key] = (acc[key] || 0) + transaction.amount;
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([category, amount]) => ({
      category,
      amount: round(amount),
      percentage: total > 0 ? round((amount / total) * 100) : 0,
      count: filtered.filter((transaction) => (transaction.category || 'Other') === category).length,
    }))
    .sort((a, b) => b.amount - a.amount);
};

const totalsFrom = (transactions) => {
  const income = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const expenses = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return {
    income: round(income),
    expenses: round(expenses),
    balance: round(income - expenses),
    savings: round(income - expenses),
    savingsRate: income > 0 ? round(((income - expenses) / income) * 100) : 0,
  };
};

module.exports = {
  monthKey,
  lastMonthsSeries,
  yearSeries,
  categoryBreakdown,
  totalsFrom,
};
