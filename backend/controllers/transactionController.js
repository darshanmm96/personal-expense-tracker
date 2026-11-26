const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const {
  lastMonthsSeries,
  yearSeries,
  categoryBreakdown,
  totalsFrom,
} = require('../utils/stats');
const { round } = require('../utils/constants');

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const sanitizeBody = (body) => ({
  type: body.type,
  amount: Number(body.amount),
  category: body.category.trim(),
  source: (body.source || '').trim(),
  description: (body.description || '').trim(),
  date: body.date ? new Date(body.date) : new Date(),
});

const findOwned = async (id, userId) =>
  Transaction.findOne({ _id: id, user: new mongoose.Types.ObjectId(userId) });

// @desc    Get transactions with filters, search, sorting and pagination
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const {
      type,
      category,
      search,
      startDate,
      endDate,
      sortBy = 'date',
      order = 'desc',
      page = 1,
      limit = 100,
    } = req.query;

    const filter = { user: new mongoose.Types.ObjectId(req.user._id) };

    if (type === 'income' || type === 'expense') filter.type = type;
    if (category) filter.category = new RegExp(`^${escapeRegex(category)}$`, 'i');

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    if (search && search.trim()) {
      const term = escapeRegex(search.trim());
      filter.$or = [
        { description: new RegExp(term, 'i') },
        { category: new RegExp(term, 'i') },
        { source: new RegExp(term, 'i') },
      ];
      if (!Number.isNaN(Number(search))) filter.$or.push({ amount: Number(search) });
    }

    const allowedSort = ['date', 'amount', 'createdAt', 'category'];
    const sortField = allowedSort.includes(sortBy) ? sortBy : 'date';
    const sortOrder = order === 'asc' ? 1 : -1;
    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(200, Math.max(1, parseInt(limit, 10) || 100));

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort({ [sortField]: sortOrder, _id: sortOrder })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean();

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single transaction owned by the user
// @route   GET /api/transactions/:id
// @access  Private
const getTransaction = async (req, res, next) => {
  try {
    const transaction = await findOwned(req.params.id, req.user._id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }
    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Dashboard summary: totals, recent activity, monthly series, categories
// @route   GET /api/transactions/summary
// @access  Private
const getSummary = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({
      user: new mongoose.Types.ObjectId(req.user._id),
    })
      .sort({ date: -1 })
      .lean();

    const totals = totalsFrom(transactions);
    const recentTransactions = transactions.slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        totals,
        counts: {
          total: transactions.length,
          income: transactions.filter((item) => item.type === 'income').length,
          expense: transactions.filter((item) => item.type === 'expense').length,
        },
        recentTransactions,
        monthly: lastMonthsSeries(transactions, 6),
        categorySpending: categoryBreakdown(transactions, 'expense'),
        incomeSources: categoryBreakdown(transactions, 'income'),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reports for a given year
// @route   GET /api/transactions/reports?year=2026
// @access  Private
const getReports = async (req, res, next) => {
  try {
    const currentYear = new Date().getFullYear();
    const requestedYear = parseInt(req.query.year, 10);
    const year = Number.isInteger(requestedYear) && requestedYear > 2000 && requestedYear < 2100
      ? requestedYear
      : currentYear;

    const transactions = await Transaction.find({
      user: new mongoose.Types.ObjectId(req.user._id),
    }).lean();

    const yearTransactions = transactions.filter(
      (item) => new Date(item.date).getFullYear() === year
    );
    const monthly = yearSeries(yearTransactions, year);
    const totals = totalsFrom(yearTransactions);
    const activeMonths = monthly.filter(
      (month) => month.income > 0 || month.expenses > 0
    ).length || 1;

    res.status(200).json({
      success: true,
      data: {
        year,
        totals,
        monthly,
        categorySpending: categoryBreakdown(yearTransactions, 'expense'),
        incomeSources: categoryBreakdown(yearTransactions, 'income'),
        averages: {
          monthlyIncome: round(totals.income / activeMonths),
          monthlyExpense: round(totals.expenses / activeMonths),
        },
        topCategory: categoryBreakdown(yearTransactions, 'expense')[0] || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.create({
      ...sanitizeBody(req.body),
      user: req.user._id,
    });
    res.status(201).json({ success: true, message: 'Transaction added.', data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a transaction (owner only)
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: new mongoose.Types.ObjectId(req.user._id) },
      { $set: sanitizeBody(req.body) },
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    res.status(200).json({ success: true, message: 'Transaction updated.', data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a transaction (owner only)
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res, next) => {
  try {
    const result = await Transaction.deleteOne({
      _id: req.params.id,
      user: new mongoose.Types.ObjectId(req.user._id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    res.status(200).json({ success: true, message: 'Transaction deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  getTransaction,
  getSummary,
  getReports,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
