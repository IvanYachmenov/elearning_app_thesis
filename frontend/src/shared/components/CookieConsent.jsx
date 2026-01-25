import {useState, useEffect} from 'react';
import {getCookieConsent, setCookieConsent} from '../lib/cookies';
import {useLanguage} from '../lib/i18n/LanguageContext';
import './CookieConsent.css';

function CookieConsent() {
    const {t} = useLanguage();
    const [show, setShow] = useState(false);

    useEffect(() => {
        const consent = getCookieConsent();
        if (!consent) {
            setShow(true);
        }
    }, []);

    const handleAccept = () => {
        setCookieConsent(true);
        setShow(false);
    };

    if (!show) {
        return null;
    }

    return (
        <>
            <div className="cookie-consent__backdrop" />
            <div className="cookie-consent">
                <div className="cookie-consent__content">
                    <div className="cookie-consent__icon">🍪</div>
                    <div className="cookie-consent__text-wrap">
                        <div className="cookie-consent__text">
                            <strong>{t('cookie.title')}</strong>
                            <p>{t('cookie.message')}</p>
                        </div>
                        <button 
                            className="cookie-consent__button"
                            onClick={handleAccept}
                        >
                            {t('cookie.accept')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CookieConsent;
