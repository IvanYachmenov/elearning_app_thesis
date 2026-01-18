import {useEffect} from 'react';
import {Link} from 'react-router-dom';
import '../styles/landing.css';

function LandingPage() {
    useEffect(() => {
        document.body.classList.remove('theme-app');
        document.body.classList.add('theme-auth');
        return () => document.body.classList.remove('theme-auth');
    }, []);

    return (
        <div className="landing-container">
            <div className="landing-content">
                <div className="landing-header">
                    <h1 className="landing-title">Easy Learn</h1>
                    <p className="landing-subtitle">
                        Your journey to knowledge starts here
                    </p>
                </div>

                <div className="landing-actions">
                    <Link to="/login" className="landing-button landing-button--primary">
                        Log In
                    </Link>
                    <Link to="/register" className="landing-button landing-button--secondary">
                        Registration
                    </Link>
                    <Link to="/courses" className="landing-button landing-button--tertiary">
                        Explore
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default LandingPage;
