import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Download, PlusCircle, Search, SlidersHorizontal } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import Loader from '../components/Loader';
import PageHeader from '../components/PageHeader';
import TransactionTable from '../components/TransactionTable';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/constants';
import { formatCurrency, getErrorMessage } from '../utils/format';

const PAGE_SIZE = 10;

const HistoryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { transactions, loading, error, refresh, deleteTransaction } = useTransactions();
  const currency = user?.currency || 'USD';

  const [filters, setFilters] = useState({ type: '', category: '', search: '', startDate: '', endDate: '' });
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState('');

  const categories = filters.type === 'income' ? INCOME_CATEGORIES : filters.type === 'expense' ? EXPENSE_CATEGORIES : [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

  const filtered = useMemo(() => {
    const term = filters.search.toLowerCase().trim();
    return transactions.filter((transaction) => {
      if (filters.type && transaction.type !== filters.type) return false;
      if (filters.category && transaction.category !== filters.category) return false;
      if (filters.startDate && new Date(transaction.date) < new Date(`${filters.startDate}T00:00:00`)) return false;
      if (filters.endDate && new Date(transaction.date) > new Date(`${filters.endDate}T23:59:59`)) return false;
      if (term) {
        const haystack = `${transaction.description} ${transaction.category} ${transaction.source} ${transaction.amount}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [transactions, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [filters.type, filters.category, filters.search, filters.startDate, filters.endDate]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value, ...(key === 'type' ? { category: '' } : {}) }));

  const resetFilters = () => setFilters({ type: '', category: '', search: '', startDate: '', endDate: '' });

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    setActionError('');
    try {
      await deleteTransaction(toDelete._id);
      setToDelete(null);
    } catch (err) {
      setActionError(getErrorMessage(err, 'Unable to delete transaction.'));
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const exportCSV = () => {
    const header = ['Date', 'Type', 'Category', 'Source', 'Description', `Amount (${currency})`];
    const rows = filtered.map((transaction) => [
      new Date(transaction.date).toLocaleDateString('en-US'),
      transaction.type,
      transaction.category,
      transaction.source || '',
      transaction.description || '',
      transaction.amount.toFixed(2),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredTotals = filtered.reduce(
    (acc, item) => {
      if (item.type === 'income') acc.income += item.amount;
      else acc.expense += item.amount;
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="page">
      <PageHeader
        title="Transaction History"
        subtitle="Search, filter and manage every transaction."
        action={<Link to="/add" className="btn btn-primary"><PlusCircle size={17} /> Add transaction</Link>}
      />

      {(error || actionError) && <div className="alert alert-error">{error || actionError} {error && <button className="alert-link" onClick={refresh} type="button">Retry</button>}</div>}

      <section className="card">
        <div className="filter-toolbar">
          <div className="search-field">
            <Search size={18} />
            <input type="search" placeholder="Search description, category or amount..." value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} aria-label="Search transactions" />
          </div>
          <div className="filter-row">
            <div className="filter-select filter-select-icon">
              <SlidersHorizontal size={16} />
              <select value={filters.type} onChange={(event) => updateFilter('type', event.target.value)} aria-label="Filter by type">
                <option value="">All types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <select className="filter-select" value={filters.category} onChange={(event) => updateFilter('category', event.target.value)} aria-label="Filter by category">
              <option value="">All categories</option>
              {[...new Set(categories)].map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <input className="date-filter" type="date" value={filters.startDate} onChange={(event) => updateFilter('startDate', event.target.value)} aria-label="Start date" title="From date" />
            <input className="date-filter" type="date" value={filters.endDate} onChange={(event) => updateFilter('endDate', event.target.value)} aria-label="End date" title="To date" />
            <button className="btn btn-outline btn-sm" type="button" onClick={exportCSV} disabled={!filtered.length}><Download size={16} /> Export</button>
            {hasFilters && <button className="btn btn-ghost btn-sm" type="button" onClick={resetFilters}>Clear filters</button>}
          </div>
        </div>

        <div className="history-stats">
          <span><strong>{filtered.length}</strong> transactions</span>
          <span className="stat-income"><strong>{formatCurrency(filteredTotals.income, currency)}</strong> income</span>
          <span className="stat-expense"><strong>{formatCurrency(filteredTotals.expense, currency)}</strong> expenses</span>
        </div>

        {loading && !transactions.length ? (
          <Loader text="Loading transactions..." />
        ) : (
          <>
            <TransactionTable
              transactions={visible}
              currency={currency}
              onEdit={(transaction) => navigate(`/transactions/${transaction._id}/edit`)}
              onDelete={(transaction) => setToDelete(transaction)}
            />

            {filtered.length > PAGE_SIZE && (
              <div className="pagination">
                <button className="btn btn-outline btn-sm" type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Previous</button>
                <span>Page {page} of {totalPages}</span>
                <button className="btn btn-outline btn-sm" type="button" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)}>Next</button>
              </div>
            )}
          </>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this transaction?"
        message={`"${toDelete?.description || toDelete?.category || 'This transaction'}" will be permanently deleted. Your dashboard totals will update automatically.`}
        confirmLabel="Delete transaction"
        loading={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default HistoryPage;
