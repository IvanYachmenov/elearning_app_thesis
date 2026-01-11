import {useEffect, useState} from 'react';
import {api, setAuthToken} from '../../../shared/api';
import {Link, useNavigate} from 'react-router-dom';
import {setCookie} from '../../../shared/lib/cookies';
import '../styles/auth.css';

function LoginPage({onAuth}) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
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
    useEffect(() => {
        document.body.classList.remove('theme-app');
        document.body.classList.add('theme-auth');
        return () => document.body.classList.remove('theme-auth');
    }, []);

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
                    <p className="auth-subtitle">Enter your credentials to access your account</p>

                    <form className="auth-form" onSubmit={handleLogin}>
                        <div className="auth-field">
                            <label className="auth-label">Username</label>
                            <input
                                className="auth-input"
                                type="text"
                                placeholder="Enter your username"
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

                    <p className="auth-footer">
                        Don&apos;t have an account?{' '}
                        <Link to="/register" className="auth-link">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
