import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {api} from '../../../shared/api';
import {useLanguage} from '../../../shared/lib/i18n/LanguageContext';
import '../styles/learning.css';
import '../../courses/styles/courses.css';

function LearningPage() {
    const {t} = useLanguage();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        setError(null);

        api
            .get('/api/my-courses/')
            .then((resp) => {
                setCourses(resp.data.results || resp.data || []);
            })
            .catch((err) => {
                console.error(err);
                setError(t('pages.learning.failedToLoadCourses'));
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="page page-enter">
            <h1 className="page__title">{t('pages.learning.title')}</h1>
            <p className="page__subtitle">{t('pages.learning.subtitle')}</p>

            {error && <p style={{color: '#dc2626'}}>{error}</p>}

            {!loading && !error && courses.length === 0 && (
                <div className="learning-empty">
                    <h2 className="learning-empty__title">{t('pages.learning.noCourses')}</h2>
                    <p className="learning-empty__text">
                        {t('pages.learning.noCoursesText')}
                    </p>
                    <Link to="/courses" className="btn-primary">
                        {t('pages.learning.exploreCourses')}
                    </Link>
                </div>
            )}

            {!loading && !error && courses.length > 0 && (
                <div className="courses-list">
                    {courses.map((course) => (
                        <article key={course.id} className="course-card">
                            <div className="course-card__image">
                                {course.image_url ? (
                                    <img src={course.image_url} alt={course.title} />
                                ) : (
                                    <div className="course-card__image-placeholder">
                                        🐍
                                    </div>
                                )}
                            </div>
                            <div className="course-card__content">
                                <h3 className="course-card__title">{course.title}</h3>
                                {course.description && (
                                    <p className="course-card__description">
                                        {course.description.length > 160
                                            ? course.description.slice(0, 160).trimEnd() + '…'
                                            : course.description}
                                    </p>
                                )}
                                <div className="course-card__footer">
                                    <Link to={`/learning/courses/${course.id}`} className="btn-primary">
                                        {t('pages.learning.continueLearning')} 
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}

export default LearningPage;
