function SettingsNav({activeKey, onChange}) {
    const items = [
        {key: 'account', label: 'Account'},
        {key: 'language', label: 'Language'},
        {key: 'theme', label: 'Theme'},
    ]; // alphabetical

    return (
        <div className="settings-nav">
            {items.map((item) => (
                <button
                    key={item.key}
                    type="button"
                    className={`settings-nav__item ${activeKey === item.key ? 'settings-nav__item--active' : ''}`}
                    onClick={() => onChange(item.key)}
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
}

export default SettingsNav;

