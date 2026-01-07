import {useEffect, useState} from 'react';
import {api, setAuthToken} from '../../../shared/api';
import {Link, useNavigate} from 'react-router-dom';
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
            localStorage.setItem('access', access);
            localStorage.setItem('refresh', refresh);
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

    useEffect(() => {
        document.body.classList.remove('theme-app');
        document.body.classList.add('theme-auth');
        return () => document.body.classList.remove('theme-auth');
    }, []);

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
                    <p className="auth-subtitle">Sign up to get started with E-Learning</p>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-field">
                            <label className="auth-label">Username *</label>
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
                            <label className="auth-label">Email</label>
                            <input
                                className="auth-input"
                                type="email"
                                name="email"
                                placeholder="your@email.com"
                                value={form.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="auth-field">
                            <label className="auth-label">Password *</label>
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

                    <p className="auth-footer">
                        Already have an account?{' '}
                        <Link to="/login" className="auth-link">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;
