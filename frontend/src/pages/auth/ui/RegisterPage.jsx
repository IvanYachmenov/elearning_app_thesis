import {useEffect, useState, useRef} from 'react';
import {api, setAuthToken} from '../../../shared/api';
import {Link, useNavigate} from 'react-router-dom';
import {setCookie} from '../../../shared/lib/cookies';
import {initializeGoogleSignIn} from '../../../shared/lib/google-auth';
import {initiateGitHubLogin, handleGitHubCallback} from '../../../shared/lib/github-auth';
import {useLanguage} from '../../../shared/lib/i18n/LanguageContext';
import {useTheme} from '../../../shared/lib/theme/ThemeContext';
import '../styles/auth.css';

function RegisterPage({onAuth}) {
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showEmailForm, setShowEmailForm] = useState(false);
    const navigate = useNavigate();
    const {t, language, setLanguage} = useLanguage();
    const {theme, toggleTheme} = useTheme();

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await api.post('/api/auth/register/', form);

            const loginResp = await api.post('/api/auth/token/', {
                username: form.username,
                password: form.password,
            });

            const {access, refresh} = loginResp.data;
            setCookie('access', access, 365);
            setCookie('refresh', refresh, 365);
            setAuthToken(access);

            const meResp = await api.get('/api/auth/me/');

            if (onAuth) {
                onAuth(access, meResp.data);
            }

            navigate('/home');
        } catch (err) {
            console.error(err);
            setError(t('pages.auth.registrationFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    const googleButtonRef = useRef(null);
    const googleHiddenButtonRef = useRef(null);

    const handleGoogleCallback = async (response) => {
        if (response.credential) {
            await sendGoogleTokenToBackend(response.credential);
        } else if (response.error) {
            // Only show error if it's not a user dismissal
            if (response.error !== 'popup_closed_by_user' && response.error !== 'popup_blocked') {
                setError(t('pages.auth.googleAuthFailed'));
            }
        }
    };

    const handleGoogleRegister = async () => {
        try {
            const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
            
            if (!clientId) {
                setError(t('pages.auth.googleOAuthNotConfigured'));
                return;
            }

            // Prevent multiple simultaneous calls
            if (isLoading) {
                return;
            }

            // Load and initialize Google
            await initializeGoogleSignIn(clientId, handleGoogleCallback);
            
            // Use renderButton on a hidden element for FedCM compatibility
            if (window.google && window.google.accounts && window.google.accounts.id) {
                // Create or use hidden button container
                let hiddenButtonContainer = googleHiddenButtonRef.current;
                if (!hiddenButtonContainer) {
                    hiddenButtonContainer = document.createElement('div');
                    hiddenButtonContainer.style.position = 'fixed';
                    hiddenButtonContainer.style.left = '-9999px';
                    hiddenButtonContainer.style.opacity = '0';
                    hiddenButtonContainer.style.pointerEvents = 'none';
                    document.body.appendChild(hiddenButtonContainer);
                    googleHiddenButtonRef.current = hiddenButtonContainer;
                }

                // Clear and render Google button
                hiddenButtonContainer.innerHTML = '';
                window.google.accounts.id.renderButton(hiddenButtonContainer, {
                    type: 'standard',
                    theme: 'outline',
                    size: 'large',
                    text: 'signin_with',
                    width: 300,
                    use_fedcm_for_button: true, // Enable FedCM explicitly
                });

                // Trigger click on the rendered Google button
                setTimeout(() => {
                    const googleButton = hiddenButtonContainer.querySelector('[role="button"]') || 
                                       hiddenButtonContainer.querySelector('div[class*="SignInButton"]') ||
                                       hiddenButtonContainer.querySelector('button');
                    if (googleButton) {
                        googleButton.click();
                    } else {
                        console.error('Google button not rendered');
                        setError(t('pages.auth.googleSignInFailed'));
                    }
                }, 100);
            } else {
                setError(t('pages.auth.googleSignInLoadFailed'));
            }
        } catch (err) {
            console.error('Google register error:', err);
            // Only show error if it's not a cancellation
            if (err.name !== 'AbortError' && !err.message?.includes('aborted')) {
                setError(t('pages.auth.googleSignInFailed'));
            }
        }
    };

    const sendGoogleTokenToBackend = async (idToken) => {
        setIsLoading(true);
        setError(null);

        try {
            const resp = await api.post('/api/auth/google/', {
                token: idToken,
            });

            const {access, refresh, user} = resp.data;

            setCookie('access', access, 365);
            setCookie('refresh', refresh, 365);
            setAuthToken(access);

            if (onAuth) {
                onAuth(access, user);
            }

            navigate('/home');
        } catch (err) {
            console.error('Google auth error:', err);
            setError(err.response?.data?.detail || t('pages.auth.googleAuthFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGitHubRegister = () => {
        initiateGitHubLogin('/home');
    };

    useEffect(() => {
        document.body.classList.remove('theme-app');
        document.body.classList.add('theme-auth');

        // Handle GitHub OAuth redirect back (tokens come via query params)
        const callback = handleGitHubCallback();

        if (callback.error && callback.isGitHubCallback) {
            setError(`${t('pages.auth.githubAuthFailed')}: ${callback.error}`);
        }

        if (callback.access && callback.refresh && callback.isGitHubCallback) {
            (async () => {
                try {
                    setIsLoading(true);
                    setCookie('access', callback.access, 365);
                    setCookie('refresh', callback.refresh, 365);
                    setAuthToken(callback.access);

                    const meResp = await api.get('/api/auth/me/');
                    if (onAuth) {
                        onAuth(callback.access, meResp.data);
                    }
                    navigate(callback.nextPath, {replace: true});
                } catch (err) {
                    console.error('GitHub callback handling error:', err);
                    setError(t('pages.auth.githubAuthFailed'));
                } finally {
                    setIsLoading(false);
                }
            })();
        }
        
        // Initialize Google Sign-In when component mounts
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
        if (clientId && !showEmailForm) {
            initializeGoogleSignIn(clientId, handleGoogleCallback);
        }
        
        return () => document.body.classList.remove('theme-auth');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showEmailForm]);

    return (
        <div className="auth-container auth-container--register">
            <div className="auth-controls">
                <div className="auth-theme-selector">
                    <button
                        className="auth-theme-btn"
                        onClick={toggleTheme}
                        title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                    >
                        <img 
                            src={theme === 'dark' ? '/assets/icons/sun.png' : '/assets/icons/moon.png'} 
                            alt={theme === 'dark' ? 'Light theme' : 'Dark theme'}
                        />
                    </button>
                </div>
                <div className="auth-language-selector">
                    <button
                        className={`auth-language-btn ${language === 'en' ? 'active' : ''}`}
                        onClick={() => setLanguage('en')}
                    >
                        EN
                    </button>
                    <button
                        className={`auth-language-btn ${language === 'sk' ? 'active' : ''}`}
                        onClick={() => setLanguage('sk')}
                    >
                        SK
                    </button>
                </div>
            </div>
            <div className="auth-left">
                <div className="auth-left__content">
                    <div className="auth-left__logo"></div>
                    <h1 className="auth-left__title">{t('pages.auth.startJourney')}</h1>
                    <p className="auth-left__subtitle">
                        {t('pages.auth.joinLearners')}
                    </p>
                </div>
            </div>

            <div className="auth-right">
                <div className="auth-form-wrapper">
                    <h1 className="auth-title">{t('pages.auth.createAccount')}</h1>
                    <p className="auth-subtitle">{t('pages.auth.chooseSignupMethod')}</p>

                    {!showEmailForm ? (
                        <>
                            <div className="auth-oauth">
                                <button
                                    ref={googleButtonRef}
                                    type="button"
                                    className="auth-oauth-button auth-oauth-button--google"
                                    onClick={handleGoogleRegister}
                                    disabled={isLoading}
                                >
                                    <img 
                                        src="/assets/icons/google.png" 
                                        alt="Google" 
                                        className="auth-oauth-icon"
                                    />
                                    {isLoading ? t('pages.auth.signingUp') : t('pages.auth.continueGoogle')}
                                </button>
                                <button
                                    type="button"
                                    className="auth-oauth-button auth-oauth-button--github"
                                    onClick={handleGitHubRegister}
                                    disabled={isLoading}
                                >
                                    <img 
                                        src="/assets/icons/github.png" 
                                        alt="GitHub" 
                                        className="auth-oauth-icon"
                                    />
                                    {t('pages.auth.continueGitHub')}
                                </button>
                            </div>

                            <div className="auth-divider">
                                <span>or</span>
                            </div>

                            <button
                                type="button"
                                className="auth-button auth-button--outline"
                                onClick={() => setShowEmailForm(true)}
                            >
                                {t('pages.auth.useEmailPassword')}
                            </button>
                        </>
                    ) : (
                        <>
                            <form className="auth-form" onSubmit={handleSubmit}>
                                <div className="auth-field">
                                    <label className="auth-label">
                                        {t('pages.auth.username')} <span className="auth-label-required">*</span>
                                    </label>
                                    <input
                                        className="auth-input"
                                        type="text"
                                        name="username"
                                        placeholder={t('pages.auth.chooseUsername')}
                                        value={form.username}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="auth-field">
                                    <label className="auth-label">
                                        {t('pages.auth.email')} <span className="auth-label-required">*</span>
                                    </label>
                                    <input
                                        className="auth-input"
                                        type="email"
                                        name="email"
                                        placeholder={t('pages.auth.yourEmail')}
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="auth-field">
                                    <label className="auth-label">
                                        {t('pages.auth.password')} <span className="auth-label-required">*</span>
                                    </label>
                                    <input
                                        className="auth-input"
                                        type="password"
                                        name="password"
                                        placeholder={t('pages.auth.createPassword')}
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="auth-field">
                                    <label className="auth-label">{t('pages.auth.firstName')}</label>
                                    <input
                                        className="auth-input"
                                        type="text"
                                        name="first_name"
                                        placeholder={t('pages.auth.yourFirstName')}
                                        value={form.first_name}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="auth-field">
                                    <label className="auth-label">{t('pages.auth.lastName')}</label>
                                    <input
                                        className="auth-input"
                                        type="text"
                                        name="last_name"
                                        placeholder={t('pages.auth.yourLastName')}
                                        value={form.last_name}
                                        onChange={handleChange}
                                    />
                                </div>

                                <button type="submit" className="auth-button" disabled={isLoading}>
                                    {isLoading ? t('pages.auth.creatingAccount') : t('pages.auth.createAccountButton')}
                                </button>
                            </form>

                            {error && <div className="auth-error">{error}</div>}

                            <button
                                type="button"
                                className="auth-button-back"
                                onClick={() => setShowEmailForm(false)}
                            >
                                {t('pages.auth.backToOptions')}
                            </button>
                        </>
                    )}

                    {!showEmailForm && (
                        <p className="auth-footer">
                            {t('pages.auth.alreadyHaveAccount')}{' '}
                            <Link to="/login" className="auth-link">
                                {t('pages.auth.login')}
                            </Link>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;
