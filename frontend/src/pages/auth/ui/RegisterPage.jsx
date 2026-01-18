import {useEffect, useState, useRef} from 'react';
import {api, setAuthToken, API_URL} from '../../../shared/api';
import {Link, useNavigate} from 'react-router-dom';
import {setCookie} from '../../../shared/lib/cookies';
import {initializeGoogleSignIn} from '../../../shared/lib/google-auth';
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
            setError('Registration failed. Username or email may already be taken.');
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
                setError('Google authentication failed. Please try again.');
            }
        }
    };

    const handleGoogleRegister = async () => {
        try {
            const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
            
            if (!clientId) {
                setError('Google OAuth is not configured. Please contact support.');
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
                        setError('Failed to initialize Google Sign-In. Please try again.');
                    }
                }, 100);
            } else {
                setError('Google Sign-In failed to load. Please refresh the page.');
            }
        } catch (err) {
            console.error('Google register error:', err);
            // Only show error if it's not a cancellation
            if (err.name !== 'AbortError' && !err.message?.includes('aborted')) {
                setError('Failed to initialize Google Sign-In. Please try again.');
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
            setError(err.response?.data?.detail || 'Google authentication failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGitHubRegister = () => {
        // Ask backend to force account chooser (if provider supports it)
        window.location.href = `${API_URL}/accounts/github/login/?next=/home&select_account=1`;
    };

    useEffect(() => {
        document.body.classList.remove('theme-app');
        document.body.classList.add('theme-auth');
        
        // Initialize Google Sign-In when component mounts
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
        if (clientId && !showEmailForm) {
            initializeGoogleSignIn(clientId, handleGoogleCallback);
        }
        
        return () => document.body.classList.remove('theme-auth');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showEmailForm]);

    //TODO <div className="auth-left__logo"></div>
    return (
        <div className="auth-container auth-container--register">
            <div className="auth-left">
                <div className="auth-left__content">
                    <div className="auth-left__logo"></div>
                    <h1 className="auth-left__title">Start Your Journey</h1>
                    <p className="auth-left__subtitle">
                        Join thousands of learners and unlock your potential with our comprehensive courses.
                    </p>
                </div>
            </div>

            <div className="auth-right">
                <div className="auth-form-wrapper">
                    <h1 className="auth-title">Create account</h1>
                    <p className="auth-subtitle">Choose your preferred sign up method</p>

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
                                    {isLoading ? 'Signing up...' : 'Continue with Google'}
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
                                    Continue with GitHub
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
                                Use email / password
                            </button>
                        </>
                    ) : (
                        <>
                            <form className="auth-form" onSubmit={handleSubmit}>
                                <div className="auth-field">
                                    <label className="auth-label">
                                        Username <span className="auth-label-required">*</span>
                                    </label>
                                    <input
                                        className="auth-input"
                                        type="text"
                                        name="username"
                                        placeholder="Choose a username"
                                        value={form.username}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="auth-field">
                                    <label className="auth-label">
                                        Email <span className="auth-label-required">*</span>
                                    </label>
                                    <input
                                        className="auth-input"
                                        type="email"
                                        name="email"
                                        placeholder="your@email.com"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="auth-field">
                                    <label className="auth-label">
                                        Password <span className="auth-label-required">*</span>
                                    </label>
                                    <input
                                        className="auth-input"
                                        type="password"
                                        name="password"
                                        placeholder="Create a strong password"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="auth-field">
                                    <label className="auth-label">First name</label>
                                    <input
                                        className="auth-input"
                                        type="text"
                                        name="first_name"
                                        placeholder="Your first name"
                                        value={form.first_name}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="auth-field">
                                    <label className="auth-label">Last name</label>
                                    <input
                                        className="auth-input"
                                        type="text"
                                        name="last_name"
                                        placeholder="Your last name"
                                        value={form.last_name}
                                        onChange={handleChange}
                                    />
                                </div>

                                <button type="submit" className="auth-button" disabled={isLoading}>
                                    {isLoading ? 'Creating account...' : 'Create account'}
                                </button>
                            </form>

                            {error && <div className="auth-error">{error}</div>}

                            <button
                                type="button"
                                className="auth-button-back"
                                onClick={() => setShowEmailForm(false)}
                            >
                                ← Back to other options
                            </button>
                        </>
                    )}

                    {!showEmailForm && (
                        <p className="auth-footer">
                            Already have an account?{' '}
                            <Link to="/login" className="auth-link">
                                Log in
                            </Link>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;
