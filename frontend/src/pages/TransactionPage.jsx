import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Save, Trash2 } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/constants';
import { getErrorMessage, todayISO } from '../utils/format';

const TransactionPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { transactions, loading, addTransaction, updateTransaction, deleteTransaction } = useTransactions();

  const initialType = searchParams.get('type') === 'expense' ? 'expense' : 'income';
  const [form, setForm] = useState({
    type: initialType,
    amount: '',
    category: initialType === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0],
    source: '',
    description: '',
    date: todayISO(),
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const existing = id ? transactions.find((transaction) => transaction._id === id) : null;

  useEffect(() => {
    if (!existing) return;
    setForm({
      type: existing.type,
      amount: String(existing.amount),
      category: existing.category,
      source: existing.source || '',
      description: existing.description || '',
      date: new Date(existing.date).toISOString().slice(0, 10),
    });
  }, [existing?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const changeType = (type) => {
    setForm((prev) => ({ ...prev, type, category: type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0] }));
    setError('');
  };

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    setError('');
  };

  const validate = () => {
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) return 'Enter an amount greater than 0.';
    if (amount > 1000000000) return 'Amount is too large.';
    if (!categories.includes(form.category)) return 'Choose a valid category.';
    if (!form.date || Number.isNaN(new Date(form.date).getTime())) return 'Choose a valid date.';
    if (form.description.length > 300) return 'Description cannot exceed 300 characters.';
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) return setError(validationError);

    const payload = {
      type: form.type,
      amount: Number(form.amount),
      category: form.category,
      source: form.type === 'income' ? form.source : '',
      description: form.description,
      date: new Date(`${form.date}T12:00:00`).toISOString(),
    };

    setSaving(true);
    setError('');
    try {
      if (id) {
        await updateTransaction(id, payload);
        setSuccess('Transaction updated successfully.');
      } else {
        await addTransaction(payload);
        setSuccess('Transaction added successfully.');
      }
      window.setTimeout(() => navigate('/history'), 700);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to save transaction.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteTransaction(id);
      setConfirmOpen(false);
      navigate('/history');
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to delete transaction.'));
    } finally {
      setDeleting(false);
    }
  };

  if (id && loading && !existing) return <Loader fullPage text="Loading transaction..." />;
  if (id && !existing && !loading) {
    return (
      <div className="page">
        <div className="alert alert-error">Transaction not found or you do not have access to it.</div>
        <Link to="/history" className="btn btn-outline"><ArrowLeft size={16} /> Back to history</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="form-page-header">
        <Link to="/history" className="text-link"><ArrowLeft size={16} /> Back to transactions</Link>
        <h2>{id ? 'Edit Transaction' : 'Add New Transaction'}</h2>
        <p>{id ? 'Update the details below and save your changes.' : 'Record income or an expense to keep your finances up to date.'}</p>
      </div>

      <div className="form-layout">
        <form className="card form-card" onSubmit={handleSubmit} noValidate>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success"><CheckCircle2 size={17} /> {success}</div>}

          <div className="type-tabs" role="tablist" aria-label="Transaction type">
            <button
              type="button"
              className={`type-tab income${form.type === 'income' ? ' selected' : ''}`}
              onClick={() => changeType('income')}
              disabled={Boolean(id)}
            >
              + Income
            </button>
            <button
              type="button"
              className={`type-tab expense${form.type === 'expense' ? ' selected' : ''}`}
              onClick={() => changeType('expense')}
              disabled={Boolean(id)}
            >
              − Expense
            </button>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">Amount ({user?.currency || 'USD'})</label>
              <input id="amount" name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" value={form.amount} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input id="date" name="date" type="date" value={form.date} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select id="category" name="category" value={form.category} onChange={handleChange}>
                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="source">{form.type === 'income' ? 'Source (optional)' : 'Paid to (optional)'}</label>
              <input id="source" name="source" type="text" maxLength={100} placeholder={form.type === 'income' ? 'e.g. Acme Corp' : 'e.g. Local market'} value={form.source} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" rows={4} maxLength={300} placeholder={form.type === 'income' ? 'e.g. Monthly salary payment' : 'e.g. Groceries for the week'} value={form.description} onChange={handleChange} />
            <small className="field-hint">{form.description.length}/300 characters</small>
          </div>

          <div className="form-actions">
            <Link to="/history" className="btn btn-outline" type="button">Cancel</Link>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? <span className="btn-loading"><span className="spinner spinner-sm" /> Saving...</span> : <><Save size={17} /> {id ? 'Save Changes' : 'Add Transaction'}</>}
            </button>
          </div>
        </form>

        <aside className="form-tip-card">
          <div className="tip-icon"><Trash2 size={20} /></div>
          <h3>Need to remove it?</h3>
          <p>You can delete any transaction from the history page at any time.</p>
          <Link to="/history" className="text-link">Go to history</Link>
          {id && (
            <button className="btn btn-danger btn-block btn-sm" type="button" onClick={() => setConfirmOpen(true)}>
              <Trash2 size={16} /> Delete this transaction
            </button>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this transaction?"
        message="This transaction will be permanently removed and your totals will be updated. This action cannot be undone."
        confirmLabel="Delete transaction"
        loading={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default TransactionPage;
