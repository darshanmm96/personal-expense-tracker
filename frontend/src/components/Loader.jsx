const Loader = ({ fullPage = false, text = 'Loading...', small = false }) => (
  <div className={fullPage ? 'loader-fullpage' : small ? 'loader-small' : 'loader-inline'}>
    <span className={`spinner${small ? ' spinner-sm' : ''}`} aria-hidden="true" />
    {text && <span className="loader-text">{text}</span>}
  </div>
);

export default Loader;
