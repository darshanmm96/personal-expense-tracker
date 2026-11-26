import { ArrowDownLeft, ArrowUpRight, Pencil, Trash2 } from 'lucide-react';
import { CATEGORY_COLORS } from '../utils/constants';
import { formatCurrency, formatDate } from '../utils/format';

const TransactionTable = ({ transactions = [], currency = 'USD', onEdit, onDelete, compact = false }) => {
  if (transactions.length === 0) {
    return <p className="table-empty">No transactions to display.</p>;
  }

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Type</th>
            <th className="align-right">Amount</th>
            {!compact && <th className="align-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            const isIncome = transaction.type === 'income';
            return (
              <tr key={transaction._id}>
                <td data-label="Date">{formatDate(transaction.date)}</td>
                <td data-label="Description">
                  <div className="transaction-description">
                    <span className={`transaction-icon${isIncome ? ' income' : ' expense'}`}>
                      {isIncome ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </span>
                    <div>
                      <strong>{transaction.description || transaction.category}</strong>
                      {transaction.source && <small>{transaction.source}</small>}
                    </div>
                  </div>
                </td>
                <td data-label="Category">
                  <span className="category-chip" style={{ '--chip-color': CATEGORY_COLORS[transaction.category] || '#94a3b8' }}>
                    {transaction.category}
                  </span>
                </td>
                <td data-label="Type">
                  <span className={`type-badge ${transaction.type}`}>
                    {isIncome ? 'Income' : 'Expense'}
                  </span>
                </td>
                <td data-label="Amount" className={`align-right amount ${isIncome ? 'positive' : 'negative'}`}>
                  {isIncome ? '+' : '−'}{formatCurrency(transaction.amount, currency)}
                </td>
                {!compact && (
                  <td data-label="Actions" className="align-right">
                    <div className="row-actions">
                      <button className="icon-button" onClick={() => onEdit?.(transaction)} type="button" title="Edit transaction" aria-label="Edit transaction">
                        <Pencil size={16} />
                      </button>
                      <button className="icon-button danger" onClick={() => onDelete?.(transaction)} type="button" title="Delete transaction" aria-label="Delete transaction">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
