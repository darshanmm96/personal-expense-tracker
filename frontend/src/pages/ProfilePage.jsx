import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, CheckCircle2, KeyRound, LogOut, Save, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { CURRENCIES } from '../utils/constants';
import { formatDate, getErrorMessage } from '../utils/format';

const ProfilePage = () => {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const { transactions } = useTransactions();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', currency: user?.currency || 'USD' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const initials = (user?.name || 'U').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();

  const handleProfileChange = (event) => {
    setProfile((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    setProfileError('');
    setProfileSuccess('');
  };

  const handlePasswordChange = (event) => {
    setPasswords((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    setPasswordError('');
    setPasswordSuccess('');
  };

  const submitProfile = async (event) => {
    event.preventDefault();
    if (profile.name.trim().length < 2) return setProfileError('Name must be at least 2 characters.');
    if (!/^\S+@\S+\.\S+$/.test(profile.email)) return setProfileError('Please enter a valid email.');
    setSavingProfile(true);
    setProfileError('');
    try {
      await updateProfile({ name: profile.name.trim(), email: profile.email.trim(), currency: profile.currency });
      setProfileSuccess('Profile updated successfully.');
    } catch (err) {
      setProfileError(getErrorMessage(err, 'Unable to update profile.'));
    } finally {
      setSavingProfile(false);
    }
  };

  const submitPassword = async (event) => {
    event.preventDefault();
    if (passwords.newPassword.length < 6) return setPasswordError('New password must be at least 6 characters.');
    if (passwords.newPassword !== passwords.confirmPassword) return setPasswordError('New passwords do not match.');
    setSavingPassword(true);
    setPasswordError('');
    try {
      await changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordSuccess('Password changed successfully.');
    } catch (err) {
      setPasswordError(getErrorMessage(err, 'Unable to change password.'));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="page">
      <section className="card profile-hero">
        <span className="profile-avatar">{initials}</span>
        <div className="profile-hero-info">
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
          <span className="profile-badge"><ShieldCheck size={14} /> Verified account</span>
        </div>
        <div className="profile-meta">
          <div><CalendarDays size={16} /><span>Member since</span><strong>{formatDate(user?.createdAt, { month: 'long', year: 'numeric' })}</strong></div>
          <div><UserRound size={16} /><span>Transactions</span><strong>{transactions.length}</strong></div>
          <div><ShieldCheck size={16} /><span>Currency</span><strong>{user?.currency}</strong></div>
        </div>
      </section>

      <div className="profile-grid">
        <section className="card form-card">
          <div className="card-header"><div><h3>Personal Information</h3><p>Update your name, email and currency.</p></div></div>
          {profileError && <div className="alert alert-error">{profileError}</div>}
          {profileSuccess && <div className="alert alert-success"><CheckCircle2 size={16} /> {profileSuccess}</div>}
          <form onSubmit={submitProfile} noValidate>
            <div className="form-group">
              <label htmlFor="profile-name">Full name</label>
              <input id="profile-name" name="name" value={profile.name} onChange={handleProfileChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="profile-email">Email address</label>
              <input id="profile-email" name="email" type="email" value={profile.email} onChange={handleProfileChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="profile-currency">Preferred currency</label>
              <select id="profile-currency" name="currency" value={profile.currency} onChange={handleProfileChange}>
                {CURRENCIES.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
              </select>
              <small className="field-hint">Used for all amounts and charts in your account.</small>
            </div>
            <button className="btn btn-primary" type="submit" disabled={savingProfile}>
              {savingProfile ? <span className="btn-loading"><span className="spinner spinner-sm" /> Saving...</span> : <><Save size={16} /> Save changes</>}
            </button>
          </form>
        </section>

        <div className="profile-side">
          <section className="card form-card">
            <div className="card-header"><div><h3>Change Password</h3><p>Use a strong password you do not reuse elsewhere.</p></div></div>
            {passwordError && <div className="alert alert-error">{passwordError}</div>}
            {passwordSuccess && <div className="alert alert-success"><CheckCircle2 size={16} /> {passwordSuccess}</div>}
            <form onSubmit={submitPassword} noValidate>
              <div className="form-group">
                <label htmlFor="currentPassword">Current password</label>
                <input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" value={passwords.currentPassword} onChange={handlePasswordChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New password</label>
                <input id="newPassword" name="newPassword" type="password" autoComplete="new-password" value={passwords.newPassword} onChange={handlePasswordChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm new password</label>
                <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" value={passwords.confirmPassword} onChange={handlePasswordChange} required />
              </div>
              <button className="btn btn-primary" type="submit" disabled={savingPassword}>
                {savingPassword ? <span className="btn-loading"><span className="spinner spinner-sm" /> Updating...</span> : <><KeyRound size={16} /> Update password</>}
              </button>
            </form>
          </section>

          <section className="card account-actions">
            <div className="card-header"><div><h3>Session</h3><p>Sign out of this device.</p></div></div>
            <button className="btn btn-outline btn-block" type="button" onClick={handleLogout}><LogOut size={16} /> Log out</button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
