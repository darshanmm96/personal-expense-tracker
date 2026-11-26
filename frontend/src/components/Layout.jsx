import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const pageMeta = {
  '/': { title: 'Dashboard', subtitle: 'Your financial overview at a glance' },
  '/add': { title: 'Add Transaction', subtitle: 'Record a new income or expense' },
  '/history': { title: 'Transaction History', subtitle: 'Search, filter and manage all transactions' },
  '/reports': { title: 'Reports & Analytics', subtitle: 'Understand where your money goes' },
  '/profile': { title: 'Profile & Settings', subtitle: 'Manage your account details and preferences' },
};

const Layout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const meta = location.pathname.startsWith('/transactions/')
    ? { title: 'Edit Transaction', subtitle: 'Update the details of this transaction' }
    : pageMeta[location.pathname] || { title: 'Personal Expense Tracker', subtitle: '' };

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-area">
        <Topbar title={meta.title} subtitle={meta.subtitle} onMenuClick={() => setSidebarOpen(true)} />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
