import {useEffect, useState, useRef} from 'react';
import {api, setAuthToken, API_URL} from '../../../shared/api';
import {Link, useNavigate} from 'react-router-dom';
import {setCookie} from '../../../shared/lib/cookies';
import {initializeGoogleSignIn} from '../../../shared/lib/google-auth';
import '../styles/auth.css';

function LoginPage({onAuth}) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showEmailForm, setShowEmailForm] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const resp = await api.post('/api/auth/token/', {
                username,
                password,
            });

            const {access, refresh} = resp.data;

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
            setError('Login failed. Invalid username or password.');
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

    const handleGoogleLogin = async () => {
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
            console.error('Google login error:', err);
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

    const handleGitHubLogin = () => {
        // Ask backend to force account chooser (if provider supports it)
        window.location.href = `${API_URL}/accounts/github/login/?next=/home&select_account=1`;
    };
    useEffect(() => {
        document.body.classList.remove('theme-app');
        document.body.classList.add('theme-auth');

        // Handle GitHub OAuth redirect back (tokens come via query params)
        const params = new URLSearchParams(window.location.search);
        const access = params.get('access');
        const refresh = params.get('refresh');
        const error = params.get('error');
        const provider = params.get('provider');
        const nextPath = params.get('next');

        if (error && provider === 'github') {
            setError(`GitHub authentication failed: ${error}`);
        }

        if (access && refresh && provider === 'github') {
            (async () => {
                try {
                    setIsLoading(true);
                    setCookie('access', access, 365);
                    setCookie('refresh', refresh, 365);
                    setAuthToken(access);

                    const meResp = await api.get('/api/auth/me/');
                    if (onAuth) {
                        onAuth(access, meResp.data);
                    }
                    navigate(nextPath && nextPath.startsWith('/') ? nextPath : '/home', {replace: true});
                } catch (err) {
                    console.error('GitHub callback handling error:', err);
                    setError('GitHub authentication failed. Please try again.');
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

    //TODO <div className="auth-left__logo"></div>
    return (
        <div className="auth-container">
            <div className="auth-left">
                <div className="auth-left__content">
                    <div className="auth-left__logo"></div>
                    <h1 className="auth-left__title">Welcome Back!</h1>
                    <p className="auth-left__subtitle">
                        Continue your learning journey and explore new courses to expand your knowledge.
                    </p>
                </div>
            </div>

            <div className="auth-right">
                <div className="auth-form-wrapper">
                    <h1 className="auth-title">Log in</h1>
                    <p className="auth-subtitle">Choose your preferred login method</p>

                    {!showEmailForm ? (
                        <>
                            <div className="auth-oauth">
                                <button
                                    ref={googleButtonRef}
                                    type="button"
                                    className="auth-oauth-button auth-oauth-button--google"
                                    onClick={handleGoogleLogin}
                                    disabled={isLoading}
                                >
                                    <img 
                                        src="/assets/icons/google.png" 
                                        alt="Google" 
                                        className="auth-oauth-icon"
                                    />
                                    {isLoading ? 'Signing in...' : 'Continue with Google'}
                                </button>
                                <button
                                    type="button"
                                    className="auth-oauth-button auth-oauth-button--github"
                                    onClick={handleGitHubLogin}
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
                            <form className="auth-form" onSubmit={handleLogin}>
                                <div className="auth-field">
                                    <label className="auth-label">Username or Email</label>
                                    <input
                                        className="auth-input"
                                        type="text"
                                        placeholder="Enter your username or email"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="auth-field">
                                    <label className="auth-label">Password</label>
                                    <input
                                        className="auth-input"
                                        type="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <button type="submit" className="auth-button" disabled={isLoading}>
                                    {isLoading ? 'Logging in...' : 'Log in'}
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
                            Don&apos;t have an account?{' '}
                            <Link to="/register" className="auth-link">
                                Sign up
                            </Link>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
