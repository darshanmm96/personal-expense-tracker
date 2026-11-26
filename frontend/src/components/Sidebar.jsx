import { NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  History,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  UserRound,
  Wallet,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { formatCompactCurrency } from '../utils/format';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/add', label: 'Add Transaction', icon: PlusCircle },
  { to: '/history', label: 'Transaction History', icon: History },
  { to: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
  { to: '/profile', label: 'Profile & Settings', icon: UserRound },
];

const Sidebar = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const { summary } = useTransactions();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar${open ? ' sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-mark"><Wallet size={22} strokeWidth={2.2} /></span>
          <div>
            <strong>Expense<span>Tracker</span></strong>
            <small>Personal Finance</small>
          </div>
          <button className="sidebar-close" onClick={onClose} type="button" aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <p className="nav-label">MAIN MENU</p>
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={onClose}
            >
              <Icon size={19} strokeWidth={2} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-balance">
            <span>Available balance</span>
            <strong>{formatCompactCurrency(summary?.totals?.balance || 0, user?.currency)}</strong>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} type="button">
            <LogOut size={18} />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
