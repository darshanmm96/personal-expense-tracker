const express = require('express');
const { body, param } = require('express-validator');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { EXPENSE_CATEGORIES, INCOME_CATEGORIES } = require('../utils/constants');
const {
  getTransactions,
  getTransaction,
  getSummary,
  getReports,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');

const router = express.Router();

router.use(protect);

const transactionValidation = [
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a number greater than 0')
    .custom((value) => Number(value) <= 1000000000)
    .withMessage('Amount is too large'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .custom((value, { req }) => {
      const allowed = req.body.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
      if (!allowed.includes(value)) {
        throw new Error(`Choose a valid ${req.body.type} category`);
      }
      return true;
    }),
  body('date').optional({ checkFalsy: true }).isISO8601().withMessage('Date must be a valid date'),
  body('source').optional({ checkFalsy: true }).isLength({ max: 100 }).withMessage('Source cannot exceed 100 characters'),
  body('description').optional({ checkFalsy: true }).isLength({ max: 300 }).withMessage('Description cannot exceed 300 characters'),
];

const idValidation = [param('id').isMongoId().withMessage('Invalid transaction id')];

// Static routes must be declared before /:id
router.get('/summary', getSummary);
router.get('/reports', getReports);

router.get('/', getTransactions);
router.get('/:id', idValidation, validate, getTransaction);
router.post('/', transactionValidation, validate, createTransaction);
router.put('/:id', idValidation, ...transactionValidation, validate, updateTransaction);
router.delete('/:id', idValidation, validate, deleteTransaction);

module.exports = router;
