import {useEffect, useState} from 'react';
import {useParams, Link, useNavigate} from 'react-router-dom';
import {api} from '../../../shared/api';
import {useLanguage} from '../../../shared/lib/i18n/LanguageContext';
import '../styles/courses.css';

function CourseDetailPage() {
    const {id} = useParams();
    const navigate = useNavigate();
    const {t} = useLanguage();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [error, setError] = useState(null);
    const [enrolled, setEnrolled] = useState(false);

    useEffect(() => {
        setLoading(true);
        setError(null);

        api
            .get(`/api/courses/${id}/`)
            .then((resp) => {
                setCourse(resp.data);
                if (resp.data.is_enrolled) setEnrolled(true);
            })
            .catch((err) => {
                console.error(err);
                setError(t('pages.courses.courseNotFound'));
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleEnroll = async () => {
        setError(null);
        setEnrolling(true);
        try {
            const resp = await api.post(`/api/courses/${id}/enroll/`);
            setCourse(resp.data);
            setEnrolled(true);
        } catch (err) {
            console.error(err);
            setError(t('pages.courses.failedToEnroll'));
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) {
        return (
            <div className="page page-enter">
                <p>{t('pages.courses.loadingCourse')}</p>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="page page-enter">
                <p style={{color: '#dc2626'}}>{error || t('pages.courses.courseNotFoundShort')}</p>
                <Link to="/courses" className="btn-primary" style={{marginTop: '16px'}}>
                    {t('pages.courses.backToCourses')}
                </Link>
            </div>
        );
    }

    const authorName =
        course.author_name ||
        (course.author && (course.author.username || course.author.email)) ||
        null;

    return (
        <div className="page page-enter">
            <div className="course-detail-back">
                <button
                    className="btn-primary"
                    onClick={() => navigate('/courses')}
                >
                    {t('pages.courses.backToCoursesTitle')}
                </button>
            </div>
            
            <div className="course-detail-header">
                <div className="course-detail-header__image">
                    {course.image_url ? (
                        <img src={course.image_url} alt={course.title} />
                    ) : (
                        <div className="course-detail-header__image-placeholder">
                            🐍
                        </div>
                    )}
                </div>
                
                <h1 className="page__title">{course.title}</h1>

                {authorName && (
                    <p className="page__subtitle">
                        by <strong>{authorName}</strong>
                    </p>
                )}

                {course.description && (
                    <p style={{marginTop: '16px', fontSize: '15px'}}>
                        {course.description}
                    </p>
                )}

                <div className="course-detail-actions">
                    {enrolled ? (
                        <Link to="/learning" className="btn-primary">
                            {t('pages.courses.goToLearning')}
                        </Link>
                    ) : (
                        <button
                            className="btn-primary"
                            onClick={handleEnroll}
                            disabled={enrolling}
                        >
                            {enrolling ? t('pages.courses.enrolling') : t('pages.courses.enrollInCourse')}
                        </button>
                    )}
                </div>

                {error && (
                    <p style={{color: '#dc2626', marginTop: '12px'}}>{error}</p>
                )}
            </div>

            {course.modules && course.modules.length > 0 && (
                <section className="course-content">
                    <h2 className="section-title">{t('pages.learning.courseContent')}</h2>
                    <div className="module-list">
                        {course.modules.map((mod) => (
                            <div key={mod.id} className="module-item">
                                <strong>{mod.title}</strong>
                                {mod.topics && mod.topics.length > 0 && (
                                    <ul className="topic-list">
                                        {mod.topics.map((topic) => (
                                            <li key={topic.id} className="topic-item">
                                                {topic.title}
                                                {topic.is_timed_test && (
                                                    <span className="topic-item__timed-badge" title={t('pages.learning.timedTest')}>
                                                        ⏱
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

export default CourseDetailPage;
