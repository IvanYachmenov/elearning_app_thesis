import {useTheme} from '../../../shared/lib/theme/ThemeContext';
import {useLanguage} from '../../../shared/lib/i18n/LanguageContext';
import '../styles/settings.css';

function SettingsPage() {
    const {theme, setTheme} = useTheme();
    const {language, setLanguage, t} = useLanguage();

    return (
        <div className="page page-enter">
            <h1 className="page__title">{t('pages.settings.title')}</h1>
            
            <div className="settings-section">
                <h2 className="settings-section__title">{t('pages.settings.theme')}</h2>
                <div className="settings-options">
                    <button
                        className={`settings-option ${theme === 'light' ? 'settings-option--active' : ''}`}
                        onClick={() => {
                            if (theme !== 'light') {
                                setTheme('light');
                            }
                        }}
                    >
                        <span className="settings-option__icon">☀️</span>
                        <span className="settings-option__label">{t('pages.settings.lightTheme')}</span>
                    </button>
                    <button
                        className={`settings-option ${theme === 'dark' ? 'settings-option--active' : ''}`}
                        onClick={() => {
                            if (theme !== 'dark') {
                                setTheme('dark');
                            }
                        }}
                    >
                        <span className="settings-option__icon">🌙</span>
                        <span className="settings-option__label">{t('pages.settings.darkTheme')}</span>
                    </button>
                </div>
            </div>

            <div className="settings-section">
                <h2 className="settings-section__title">{t('pages.settings.language')}</h2>
                <div className="settings-options">
                    <button
                        className={`settings-option ${language === 'en' ? 'settings-option--active' : ''}`}
                        onClick={() => setLanguage('en')}
                    >
                        <span className="settings-option__icon">EN</span>
                        <span className="settings-option__label">{t('pages.settings.english')}</span>
                    </button>
                    <button
                        className={`settings-option ${language === 'sk' ? 'settings-option--active' : ''}`}
                        onClick={() => setLanguage('sk')}
                    >
                        <span className="settings-option__icon">SK</span>
                        <span className="settings-option__label">{t('pages.settings.slovak')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;
