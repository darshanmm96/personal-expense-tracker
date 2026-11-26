import { BarChart3, LockKeyhole, ShieldCheck, Wallet } from 'lucide-react';

const AuthShell = ({ title, subtitle, children, footer }) => (
  <div className="auth-page">
    <section className="auth-visual">
      <div className="auth-visual-inner">
        <div className="auth-brand">
          <span className="brand-mark"><Wallet size={24} /></span>
          <strong>Expense<span>Tracker</span></strong>
        </div>
        <h2>Take control of your money, one transaction at a time.</h2>
        <p>Track income, expenses and savings with clear reports that help you make better financial decisions.</p>
        <ul className="auth-features">
          <li><span><BarChart3 size={18} /></span> Beautiful reports & insights</li>
          <li><span><ShieldCheck size={18} /></span> Your data stays private and secure</li>
          <li><span><LockKeyhole size={18} /></span> JWT protected account access</li>
        </ul>
      </div>
      <div className="auth-visual-footer">Personal Expense Tracker &copy; {new Date().getFullYear()}</div>
    </section>

    <section className="auth-form-side">
      <div className="auth-form-card">
        <h1>{title}</h1>
        <p className="auth-subtitle">{subtitle}</p>
        {children}
        {footer && <div className="auth-footer">{footer}</div>}
      </div>
    </section>
  </div>
);

export default AuthShell;
