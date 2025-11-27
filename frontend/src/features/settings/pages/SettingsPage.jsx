function SettingsPage() {
  return (
    <div className="page page-enter">
      <div
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-light)',
          textAlign: 'center',
        }}
      >
        <h1 className="page__title">⚙️ Settings</h1>
        <p className="page__subtitle">
          Application and account settings will be available here soon.
        </p>
      </div>
    </div>
  );
}

export default SettingsPage;
