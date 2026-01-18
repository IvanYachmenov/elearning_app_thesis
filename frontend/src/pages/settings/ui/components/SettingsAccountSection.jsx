import {useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';

import {api, API_URL, setAuthToken} from '../../../../shared/api';
import {setCookie} from '../../../../shared/lib/cookies';
import {initializeGoogleSignIn} from '../../../../shared/lib/google-auth';

function SettingsAccountSection({user, onUserUpdate}) {
    const navigate = useNavigate();

    const [connections, setConnections] = useState({google: false, github: false});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const googleHiddenButtonRef = useRef(null);

    const createdAtLabel = useMemo(() => {
        if (!user?.date_joined) return '—';
        try {
            return new Date(user.date_joined).toLocaleString();
        } catch {
            return String(user.date_joined);
        }
    }, [user?.date_joined]);

    const roleLabel = useMemo(() => {
        const role = user?.role;
        if (role === 'student') return 'Student';
        if (role === 'teacher') return 'Teacher';
        if (role === 'admin') return 'Admin';
        return role ? String(role) : '—';
    }, [user?.role]);

    const loadConnections = async () => {
        try {
            const resp = await api.get('/api/auth/social-connections/');
            setConnections(resp.data);
        } catch (err) {
            console.error('Failed to load social connections:', err);
        }
    };

    const refreshMe = async () => {
        const meResp = await api.get('/api/auth/me/');
        onUserUpdate?.(meResp.data);
    };

    useEffect(() => {
        loadConnections();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDisconnect = async (provider) => {
        setIsLoading(true);
        setError(null);
        try {
            await api.post(`/api/auth/social-connections/${provider}/disconnect/`);
            await loadConnections();
            await refreshMe();
        } catch (err) {
            console.error('Disconnect failed:', err);
            setError('Failed to disconnect. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConnectGitHub = () => {
        // Goes through backend OAuth; then returns to /login?access=...&refresh=...&next=/settings
        window.location.href = `${API_URL}/accounts/github/login/?next=/settings&select_account=1`;
    };

    const handleGoogleCallback = async (response) => {
        if (response.credential) {
            await sendGoogleTokenToBackend(response.credential);
        } else if (response.error) {
            if (response.error !== 'popup_closed_by_user' && response.error !== 'popup_blocked') {
                setError('Google authentication failed. Please try again.');
            }
        }
    };

    const handleConnectGoogle = async () => {
        setError(null);

        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
        if (!clientId) {
            setError('Google OAuth is not configured.');
            return;
        }

        try {
            setIsLoading(true);
            await initializeGoogleSignIn(clientId, handleGoogleCallback);

            if (window.google && window.google.accounts && window.google.accounts.id) {
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

                hiddenButtonContainer.innerHTML = '';
                window.google.accounts.id.renderButton(hiddenButtonContainer, {
                    type: 'standard',
                    theme: 'outline',
                    size: 'large',
                    text: 'signin_with',
                    width: 300,
                    use_fedcm_for_button: true,
                });

                setTimeout(() => {
                    const googleButton =
                        hiddenButtonContainer.querySelector('[role="button"]') ||
                        hiddenButtonContainer.querySelector('div[class*="SignInButton"]') ||
                        hiddenButtonContainer.querySelector('button');
                    if (googleButton) {
                        googleButton.click();
                    } else {
                        setError('Failed to initialize Google Sign-In. Please try again.');
                    }
                }, 100);
            } else {
                setError('Google Sign-In failed to load. Please refresh the page.');
            }
        } catch (err) {
            console.error('Google connect error:', err);
            if (err.name !== 'AbortError' && !err.message?.includes('aborted')) {
                setError('Failed to initialize Google Sign-In. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const sendGoogleTokenToBackend = async (idToken) => {
        setIsLoading(true);
        setError(null);

        try {
            const resp = await api.post('/api/auth/google/', {token: idToken});
            const {access, refresh, user: userFromBackend} = resp.data;

            setCookie('access', access, 365);
            setCookie('refresh', refresh, 365);
            setAuthToken(access);

            if (onUserUpdate) {
                onUserUpdate(userFromBackend);
            }
            await loadConnections();
            navigate('/settings', {replace: true});
        } catch (err) {
            console.error('Google auth error:', err);
            setError(err.response?.data?.detail || 'Google authentication failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="settings-section">
            <h2 className="settings-section__title">Account</h2>

            {error && <div className="settings-account__error">{error}</div>}

            <div className="settings-account__grid">
                <div className="settings-account__card">
                    <div className="settings-account__card-title">Overview</div>
                    <div className="settings-account__row">
                        <span className="settings-account__label">Status</span>
                        <span className="settings-account__value">Active</span>
                    </div>
                    <div className="settings-account__row">
                        <span className="settings-account__label">Created</span>
                        <span className="settings-account__value">{createdAtLabel}</span>
                    </div>
                    <div className="settings-account__row">
                        <span className="settings-account__label">Role</span>
                        <span className="settings-account__value">{roleLabel}</span>
                    </div>
                    <div className="settings-account__row">
                        <span className="settings-account__label">Username</span>
                        <span className="settings-account__value">{user?.username || '—'}</span>
                    </div>
                    <div className="settings-account__row">
                        <span className="settings-account__label">Email</span>
                        <span className="settings-account__value">{user?.email || '—'}</span>
                    </div>
                </div>

                <div className="settings-account__card">
                    <div className="settings-account__card-title">Connections</div>

                    <div className="settings-account__connection">
                        <div className="settings-account__connection-left">
                            <img
                                className="settings-account__provider-icon"
                                src="/assets/icons/github.png"
                                alt="GitHub"
                            />
                            <div className="settings-account__connection-main">
                                <div className="settings-account__connection-name">GitHub</div>
                                <div className="settings-account__connection-status">
                                    <img
                                        className="settings-account__status-icon"
                                        src={
                                            connections.github
                                                ? '/assets/icons/connected.png'
                                                : '/assets/icons/disconnected.png'
                                        }
                                        alt={connections.github ? 'Connected' : 'Not connected'}
                                    />
                                    <span>{connections.github ? 'Connected' : 'Not connected'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="settings-account__connection-actions">
                            {connections.github ? (
                                <button
                                    type="button"
                                    className="settings-account__btn settings-account__btn--danger"
                                    onClick={() => handleDisconnect('github')}
                                    disabled={isLoading}
                                >
                                    Disconnect
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="settings-account__btn"
                                    onClick={handleConnectGitHub}
                                    disabled={isLoading}
                                >
                                    Connect
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="settings-account__connection">
                        <div className="settings-account__connection-left">
                            <img
                                className="settings-account__provider-icon"
                                src="/assets/icons/google.png"
                                alt="Google"
                            />
                            <div className="settings-account__connection-main">
                                <div className="settings-account__connection-name">Google</div>
                                <div className="settings-account__connection-status">
                                    <img
                                        className="settings-account__status-icon"
                                        src={
                                            connections.google
                                                ? '/assets/icons/connected.png'
                                                : '/assets/icons/disconnected.png'
                                        }
                                        alt={connections.google ? 'Connected' : 'Not connected'}
                                    />
                                    <span>{connections.google ? 'Connected' : 'Not connected'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="settings-account__connection-actions">
                            {connections.google ? (
                                <button
                                    type="button"
                                    className="settings-account__btn settings-account__btn--danger"
                                    onClick={() => handleDisconnect('google')}
                                    disabled={isLoading}
                                >
                                    Disconnect
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="settings-account__btn"
                                    onClick={handleConnectGoogle}
                                    disabled={isLoading}
                                >
                                    Connect
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="settings-account__note">
                        Account deletion will be added later.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SettingsAccountSection;

