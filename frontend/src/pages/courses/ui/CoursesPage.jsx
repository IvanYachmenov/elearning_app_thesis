import {useEffect, useState} from 'react';
import {api} from '../../../shared/api';
import {CourseCard} from '../../../features/courses';
import {useLanguage} from '../../../shared/lib/i18n/LanguageContext';
import '../styles/courses.css';

function CoursesPage() {
    const {t} = useLanguage();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        api
            .get('/api/courses/')
            .then((resp) => {
                setCourses(resp.data.results || resp.data || []);
            })
            .catch((err) => {
                console.error(err);
                setError('Failed to load courses.');
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="page page-enter">
            <h1 className="page__title">{t('pages.courses.title')}</h1>
            <p className="page__subtitle">
                {t('pages.courses.subtitle')}
            </p>

            {loading && <p>{t('pages.courses.loading')}</p>}
            {error && <p style={{color: '#dc2626'}}>{error}</p>}

            {!loading && !error && courses.length === 0 && (
                <p>{t('pages.courses.noCourses')}</p>
            )}

            {!loading && !error && courses.length > 0 && (
                <div className="courses-list">
                    {courses.map((course) => (
                        <CourseCard key={course.id} course={course}/>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CoursesPage;
