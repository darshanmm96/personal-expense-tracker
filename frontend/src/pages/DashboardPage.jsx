import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  PiggyBank,
  PlusCircle,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import CategoryPieChart from '../components/CategoryPieChart';
import Loader from '../components/Loader';
import MonthlyBarChart from '../components/MonthlyBarChart';
import PageHeader from '../components/PageHeader';
import SummaryCard from '../components/SummaryCard';
import TransactionTable from '../components/TransactionTable';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { formatCurrency } from '../utils/format';

const DashboardPage = () => {
  const { user } = useAuth();
  const { summary, loading, error, refresh } = useTransactions();
  const currency = user?.currency || 'USD';
  const totals = summary?.totals || { income: 0, expenses: 0, balance: 0, savings: 0, savingsRate: 0 };
  const recent = summary?.recentTransactions || [];

  return (
    <div className="page">
      <PageHeader
        title={`Good day, ${user?.name?.split(' ')[0] || 'there'} 👋`}
        subtitle="Here is what is happening with your money."
        action={<Link to="/add" className="btn btn-primary"><PlusCircle size={17} /> New transaction</Link>}
      />

      {error && <div className="alert alert-error">{error} <button className="alert-link" onClick={refresh} type="button">Retry</button></div>}

      {loading && !summary ? (
        <Loader fullPage text="Loading dashboard..." />
      ) : (
        <>
          <section className="summary-grid">
            <SummaryCard title="Total Income" value={formatCurrency(totals.income, currency)} icon={TrendingUp} tone="income" subtitle="All-time income received" />
            <SummaryCard title="Total Expenses" value={formatCurrency(totals.expenses, currency)} icon={TrendingDown} tone="expense" subtitle="All-time money spent" />
            <SummaryCard title="Current Balance" value={formatCurrency(totals.balance, currency)} icon={Wallet} tone="balance" subtitle="Income minus expenses" />
            <SummaryCard title="Total Savings" value={formatCurrency(totals.savings, currency)} icon={PiggyBank} tone="savings" subtitle={`${totals.savingsRate}% savings rate`} />
          </section>

          <section className="dashboard-grid">
            <article className="card chart-card">
              <div className="card-header">
                <div>
                  <h3>Monthly Financial Summary</h3>
                  <p>Income and expenses over the last 6 months</p>
                </div>
                <Link to="/reports" className="text-link">Full report <ArrowRight size={15} /></Link>
              </div>
              <MonthlyBarChart data={summary?.monthly || []} currency={currency} />
            </article>

            <article className="card chart-card">
              <div className="card-header">
                <div>
                  <h3>Spending by Category</h3>
                  <p>Where your money went</p>
                </div>
              </div>
              {summary?.categorySpending?.length ? (
                <CategoryPieChart data={summary.categorySpending} currency={currency} />
              ) : (
                <p className="empty-chart">Add an expense to see your category breakdown.</p>
              )}
            </article>
          </section>

          <section className="dashboard-grid dashboard-grid-bottom">
            <article className="card">
              <div className="card-header">
                <div>
                  <h3>Recent Transactions</h3>
                  <p>Your latest financial activity</p>
                </div>
                <Link to="/history" className="text-link">View all <ArrowRight size={15} /></Link>
              </div>
              {recent.length ? (
                <TransactionTable transactions={recent} currency={currency} compact />
              ) : (
                <div className="empty-state">
                  <ArrowUpRight size={28} />
                  <h4>No transactions yet</h4>
                  <p>Start by adding your first income or expense.</p>
                  <Link to="/add" className="btn btn-primary btn-sm">Add transaction</Link>
                </div>
              )}
            </article>

            <article className="card quick-card">
              <div className="card-header">
                <div>
                  <h3>Quick Actions</h3>
                  <p>Manage your finances faster</p>
                </div>
              </div>
              <div className="quick-actions">
                <Link to="/add" className="quick-action">
                  <span className="quick-icon income-icon"><PlusCircle size={20} /></span>
                  <div><strong>Add Income</strong><small>Record money received</small></div>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/add?type=expense" className="quick-action">
                  <span className="quick-icon expense-icon"><TrendingDown size={20} /></span>
                  <div><strong>Add Expense</strong><small>Track money spent</small></div>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/reports" className="quick-action">
                  <span className="quick-icon report-icon"><PiggyBank size={20} /></span>
                  <div><strong>View Reports</strong><small>Analyse your savings</small></div>
                  <ArrowRight size={16} />
                </Link>
              </div>
              <div className="savings-progress">
                <div className="savings-progress-head">
                  <span>Savings rate</span>
                  <strong>{totals.savingsRate}%</strong>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, totals.savingsRate))}%` }} />
                </div>
                <small>Goal: save at least 20% of your income</small>
              </div>
            </article>
          </section>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
