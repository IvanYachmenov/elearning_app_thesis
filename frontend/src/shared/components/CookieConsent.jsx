import {useState, useEffect} from 'react';
import {getCookieConsent, setCookieConsent} from '../lib/cookies';
import './CookieConsent.css';

function CookieConsent() {
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
                    <div className="cookie-consent__text">
                        <strong>Cookies</strong>
                        <p>
                            We use cookies to enhance your development experience and keep your data secure.
                        </p>
                    </div>
                    <button 
                        className="cookie-consent__button"
                        onClick={handleAccept}
                    >
                        Accept
                    </button>
                </div>
            </div>
        </>
    );
}

export default CookieConsent;
