import { useEffect, useState } from 'react';
import { BarChart3, PiggyBank, TrendingDown, TrendingUp } from 'lucide-react';
import CategoryPieChart from '../components/CategoryPieChart';
import Loader from '../components/Loader';
import MonthlyBarChart from '../components/MonthlyBarChart';
import SavingsLineChart from '../components/SavingsLineChart';
import SummaryCard from '../components/SummaryCard';
import { useAuth } from '../context/AuthContext';
import { transactionAPI } from '../services/api';
import { CATEGORY_COLORS } from '../utils/constants';
import { formatCurrency, getErrorMessage } from '../utils/format';

const ReportsPage = () => {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await transactionAPI.getReports(year);
        if (active) setReport(data.data);
      } catch (err) {
        if (active) setError(getErrorMessage(err, 'Unable to load reports.'));
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [year]);

  const totals = report?.totals || { income: 0, expenses: 0, savings: 0, savingsRate: 0 };

  return (
    <div className="page">
      <div className="reports-header">
        <div>
          <h2>Reports & Analytics</h2>
          <p>A clear picture of your financial performance.</p>
        </div>
        <div className="form-group year-selector">
          <label htmlFor="year">Report year</label>
          <select id="year" value={year} onChange={(event) => setYear(Number(event.target.value))}>
            {Array.from({ length: 6 }, (_, index) => currentYear - index).map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <Loader fullPage text="Generating report..." />
      ) : (
        <>
          <section className="summary-grid">
            <SummaryCard title={`Income in ${year}`} value={formatCurrency(totals.income, currency)} icon={TrendingUp} tone="income" subtitle={`Avg ${formatCurrency(report?.averages?.monthlyIncome || 0, currency)}/month`} />
            <SummaryCard title={`Expenses in ${year}`} value={formatCurrency(totals.expenses, currency)} icon={TrendingDown} tone="expense" subtitle={`Avg ${formatCurrency(report?.averages?.monthlyExpense || 0, currency)}/month`} />
            <SummaryCard title="Net Savings" value={formatCurrency(totals.savings, currency)} icon={PiggyBank} tone="savings" subtitle={`${totals.savingsRate}% of income saved`} />
            <SummaryCard title="Top Spending Category" value={report?.topCategory?.category || '—'} icon={BarChart3} tone="primary" subtitle={report?.topCategory ? formatCurrency(report.topCategory.amount, currency) : 'No expenses recorded'} />
          </section>

          <section className="card">
            <div className="card-header">
              <div>
                <h3>Monthly Income vs Expenses</h3>
                <p>Compare what you earned and spent each month of {year}</p>
              </div>
            </div>
            <MonthlyBarChart data={report?.monthly || []} currency={currency} height={340} />
          </section>

          <section className="dashboard-grid">
            <article className="card chart-card">
              <div className="card-header">
                <div>
                  <h3>Monthly Savings Trend</h3>
                  <p>Income minus expenses per month</p>
                </div>
              </div>
              <SavingsLineChart data={report?.monthly || []} currency={currency} />
            </article>

            <article className="card chart-card">
              <div className="card-header">
                <div>
                  <h3>Category-wise Spending</h3>
                  <p>Expense distribution for {year}</p>
                </div>
              </div>
              {report?.categorySpending?.length ? (
                <CategoryPieChart data={report.categorySpending} currency={currency} />
              ) : (
                <p className="empty-chart">No expense data for this year.</p>
              )}
            </article>
          </section>

          <section className="dashboard-grid">
            <article className="card">
              <div className="card-header"><h3>Expense Breakdown</h3></div>
              {report?.categorySpending?.length ? (
                <ul className="breakdown-list">
                  {report.categorySpending.map((item) => (
                    <li key={item.category}>
                      <div className="breakdown-head">
                        <span><i style={{ background: CATEGORY_COLORS[item.category] || '#94a3b8' }} />{item.category}</span>
                        <strong>{formatCurrency(item.amount, currency)}</strong>
                      </div>
                      <div className="progress-track"><div className="progress-fill" style={{ width: `${item.percentage}%`, background: CATEGORY_COLORS[item.category] || '#94a3b8' }} /></div>
                      <small>{item.percentage}% of total spending · {item.count} transaction{item.count === 1 ? '' : 's'}</small>
                    </li>
                  ))}
                </ul>
              ) : <p className="empty-chart">Nothing to show yet.</p>}
            </article>

            <article className="card">
              <div className="card-header"><h3>Income Sources</h3></div>
              {report?.incomeSources?.length ? (
                <ul className="breakdown-list">
                  {report.incomeSources.map((item) => (
                    <li key={item.category}>
                      <div className="breakdown-head">
                        <span><i style={{ background: CATEGORY_COLORS[item.category] || '#10b981' }} />{item.category}</span>
                        <strong>{formatCurrency(item.amount, currency)}</strong>
                      </div>
                      <div className="progress-track"><div className="progress-fill income-fill" style={{ width: `${item.percentage}%` }} /></div>
                      <small>{item.percentage}% of total income · {item.count} transaction{item.count === 1 ? '' : 's'}</small>
                    </li>
                  ))}
                </ul>
              ) : <p className="empty-chart">Nothing to show yet.</p>}
            </article>
          </section>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
