import {useState, useCallback} from 'react';
import {useLanguage} from '../../../shared/lib/i18n/LanguageContext';
import '../styles/settings.css';
import SettingsNav from './components/SettingsNav';
import SettingsAccountSection from './components/SettingsAccountSection';
import SettingsLanguageSection from './components/SettingsLanguageSection';
import SettingsThemeSection from './components/SettingsThemeSection';

const SECTION_IDS = {account: 'settings-account', language: 'settings-language', theme: 'settings-theme'};

function SettingsPage({user, onUserUpdate}) {
    const {t} = useLanguage();
    const [activeSection, setActiveSection] = useState('account');

    const handleNavClick = useCallback((key) => {
        setActiveSection(key);
        const id = SECTION_IDS[key];
        const el = id ? document.getElementById(id) : null;
        if (el) {
            el.scrollIntoView({behavior: 'smooth', block: 'start'});
        }
    }, []);

    return (
        <div className="page page-enter">
            <h1 className="page__title">{t('pages.settings.title')}</h1>

            <SettingsNav activeKey={activeSection} onChange={handleNavClick} />

            <div id={SECTION_IDS.account} className="settings-section-anchor">
                <SettingsAccountSection user={user} onUserUpdate={onUserUpdate} />
            </div>
            <div id={SECTION_IDS.language} className="settings-section-anchor">
                <SettingsLanguageSection />
            </div>
            <div id={SECTION_IDS.theme} className="settings-section-anchor">
                <SettingsThemeSection />
            </div>
        </div>
    );
}

export default SettingsPage;
