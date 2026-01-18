import {useState} from 'react';
import {useLanguage} from '../../../shared/lib/i18n/LanguageContext';
import '../styles/settings.css';
import SettingsNav from './components/SettingsNav';
import SettingsAccountSection from './components/SettingsAccountSection';
import SettingsLanguageSection from './components/SettingsLanguageSection';
import SettingsThemeSection from './components/SettingsThemeSection';

function SettingsPage({user, onUserUpdate}) {
    const {t} = useLanguage();
    const [activeSection, setActiveSection] = useState('account');

    return (
        <div className="page page-enter">
            <h1 className="page__title">{t('pages.settings.title')}</h1>

            <SettingsNav activeKey={activeSection} onChange={setActiveSection} />

            {activeSection === 'account' && (
                <SettingsAccountSection user={user} onUserUpdate={onUserUpdate} />
            )}
            {activeSection === 'language' && <SettingsLanguageSection />}
            {activeSection === 'theme' && <SettingsThemeSection />}
        </div>
    );
}

export default SettingsPage;
