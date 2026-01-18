import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../shared/api';
import CourseCardSimple from './CourseCardSimple';
import '../styles/home.css';

function HomePage({user}) {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        api.get('/api/courses/')
            .then((resp) => {
                const coursesData = resp.data.results || resp.data || [];
                setCourses(coursesData);
            })
            .catch((err) => {
                console.error('Failed to load courses:', err);
            })
            .finally(() => setLoading(false));
    }, []);

    const newsPosts = [
        {
            id: 1,
            title: "New Python Basics Course Available",
            date: "2024-01-15",
            excerpt: "Learn Python fundamentals with our new interactive course featuring hands-on exercises and real-world examples."
        },
        {
            id: 2,
            title: "Gamification System Update",
            date: "2024-01-10",
            excerpt: "We’re iterating on motivation features. More details soon."
        },
        {
            id: 3,
            title: "Practice Mode Improvements",
            date: "2024-01-05",
            excerpt: "Enhanced practice tests now include timed challenges and detailed performance analytics to help you improve faster."
        }
    ];

    return (
        <div className="page page-enter">
            <div className="home-welcome">
                <h1 className="page__title">Welcome, {user.username}!</h1>
                <p className="page__subtitle">
                    Your personal learning platform for mastering programming.
                </p>
            </div>

            {/* Featured Courses Section */}
            <section className="home-section">
                <h2 className="home-section__title">Featured Courses</h2>
                {loading ? (
                    <p className="home-section__text">Loading courses...</p>
                ) : courses.length === 0 ? (
                    <p className="home-section__text">No courses available yet.</p>
                ) : (
                    <div className="home-courses-scroll">
                        <div className="home-courses-scroll__container">
                            {courses.map((course, index) => (
                                <div 
                                    key={course.id} 
                                    className={`home-course-item ${index >= 3 ? 'home-course-item--faded' : ''}`}
                                >
                                    <CourseCardSimple course={course} />
                                    {index >= 3 && <div className="home-course-item__overlay" />}
                                </div>
                            ))}
                        </div>
                        <button 
                            className="home-courses-scroll__button"
                            onClick={() => navigate('/courses')}
                        >
                            Go to catalog →
                        </button>
                    </div>
                )}
            </section>

            {/* News/Updates Section */}
            <section className="home-section">
                <h2 className="home-section__title">Latest Updates</h2>
                <div className="home-news-list">
                    {newsPosts.map((post) => (
                        <div key={post.id} className="home-news-item">
                            <div className="home-news-item__date">{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                            <h3 className="home-news-item__title">{post.title}</h3>
                            <p className="home-news-item__excerpt">{post.excerpt}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="home-section">
                <h2 className="home-section__title">Shop</h2>
                <p className="home-section__text">
                    The shop is being redesigned. We’ll add it back once the earning and spending logic is defined.
                </p>
                <button
                    className="home-courses-scroll__button"
                    onClick={() => navigate('/shop')}
                >
                    Open shop →
                </button>
            </section>

            {/* Platform Info Section */}
            <section className="home-section">
                <h2 className="home-section__title">
                    What's E-Learning Platform?
                </h2>
                <p className="home-section__text">
                    This is a modern, focused e-learning platform designed to help you connect
                    theory and practice for programming languages like Python and many other topics.
                </p>
                <p className="home-section__text">
                    Instead of just watching long video courses, you'll read concise lessons and
                    immediately apply concepts through quizzes and coding tasks directly in the browser.
                </p>
            </section>
        </div>
    );
}

export default HomePage;
