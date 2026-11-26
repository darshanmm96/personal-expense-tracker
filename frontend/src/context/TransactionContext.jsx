import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { transactionAPI } from '../services/api';
import { useAuth } from './AuthContext';

const TransactionContext = createContext(null);

export const TransactionProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [listResponse, summaryResponse] = await Promise.all([
        transactionAPI.getAll({ limit: 200, sortBy: 'date', order: 'desc' }),
        transactionAPI.getSummary(),
      ]);
      setTransactions(listResponse.data.data);
      setSummary(summaryResponse.data.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load your financial data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) refresh();
    else {
      setTransactions([]);
      setSummary(null);
    }
  }, [isAuthenticated, refresh]);

  const addTransaction = async (payload) => {
    const response = await transactionAPI.create(payload);
    await refresh();
    return response.data;
  };

  const updateTransaction = async (id, payload) => {
    const response = await transactionAPI.update(id, payload);
    await refresh();
    return response.data;
  };

  const deleteTransaction = async (id) => {
    const response = await transactionAPI.remove(id);
    await refresh();
    return response.data;
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        summary,
        loading,
        error,
        refresh,
        addTransaction,
        updateTransaction,
        deleteTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) throw new Error('useTransactions must be used inside TransactionProvider');
  return context;
};
