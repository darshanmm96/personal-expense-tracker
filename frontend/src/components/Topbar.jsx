import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Menu, Plus, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/format';

const Topbar = ({ title, subtitle, onMenuClick }) => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const closeOnOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutside);
    return () => document.removeEventListener('mousedown', closeOnOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const initials = (user?.name || 'U')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-button menu-button" onClick={onMenuClick} type="button" aria-label="Open menu">
          <Menu size={22} />
        </button>
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="topbar-right">
        <span className="topbar-date">{formatDate(new Date(), { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
        <Link to="/add" className="btn btn-primary topbar-add">
          <Plus size={17} /> <span>Add Transaction</span>
        </Link>
        <div className="user-menu" ref={dropdownRef}>
          <button className="user-trigger" onClick={() => setOpen((value) => !value)} type="button" aria-expanded={open}>
            <span className="avatar">{initials}</span>
            <span className="user-trigger-name">{user?.name?.split(' ')[0]}</span>
            <ChevronDown size={16} />
          </button>
          {open && (
            <div className="user-dropdown">
              <div className="dropdown-user">
                <strong>{user?.name}</strong>
                <span>{user?.email}</span>
              </div>
              <Link to="/profile" onClick={() => setOpen(false)}>
                <UserRound size={16} /> My Profile
              </Link>
              <button type="button" onClick={handleLogout}>
                <LogOut size={16} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
