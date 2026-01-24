import {useEffect, useState, useRef} from 'react';
import {useParams, useNavigate, Link} from 'react-router-dom';
import {api} from '../../../shared/api';
import {useLanguage} from '../../../shared/lib/i18n/LanguageContext';
import '../styles/learning.css';

function CourseLearningPage() {
    const {id} = useParams();
    const navigate = useNavigate();
    const {t} = useLanguage();

    const [course, setCourse] = useState(null);
    const [expandedModules, setExpandedModules] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const topicWrappersRef = useRef({});

    useEffect(() => {
        setLoading(true);
        setError(null);

        api
            .get(`/api/learning/courses/${id}/`)
            .then((resp) => {
                setCourse(resp.data);

                const defaultExpanded = {};
                (resp.data.modules || []).forEach((m) => {
                    defaultExpanded[m.id] = true;
                });
                setExpandedModules(defaultExpanded);
            })
            .catch((err) => {
                console.error(err);
                if (err.response && err.response.status === 404) {
                    setError(t('pages.learning.courseNotFoundOrNotEnrolled'));
                } else if (err.response && err.response.status === 403) {
                    setError(t('pages.learning.notEnrolled'));
                } else {
                    setError(t('pages.learning.failedToLoadCourse'));
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    const toggleModule = (moduleId) => {
        setExpandedModules((prev) => ({
            ...prev,
            [moduleId]: !prev[moduleId],
        }));
    };

    const handleTopicClick = (topic) => {
        if (!course) return;
        navigate(`/learning/courses/${course.id}/topics/${topic.id}/`);
    };

    if (loading) {
        return (
            <div className="page page-enter">
                <p>{t('pages.learning.loadingCourse')}</p>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="page page-enter">
                <p style={{color: '#dc2626'}}>{error || t('pages.learning.courseNotFound')}</p>
                <Link
                    to="/learning"
                    className="btn-primary"
                    style={{marginTop: '16px'}}
                >
                    {t('pages.learning.backToMyLearning')}
                </Link>
            </div>
        );
    }

    const progressPercent = course.progress_percent ?? 0;

    const fullDescription = course.description || '';
    const maxDescLength = 260;
    const isLongDescription = fullDescription.length > maxDescLength;
    const shortDescription = isLongDescription
        ? fullDescription.slice(0, maxDescLength).trimEnd() + '…'
        : fullDescription;

    return (
        <div className="page page-enter">
            <header className="learning-course-header">
                <button
                    type="button"
                    className="learning-back-link"
                    onClick={() => navigate('/learning')}
                >
                    {t('pages.learning.backToMyLearning')}
                </button>

                <h1 className="page__title">{course.title}</h1>

                {fullDescription && (
                    <p className="learning-course-description">
                        {shortDescription}{' '}
                        {isLongDescription && (
                            <Link
                                to={`/courses/${course.id}`}
                                className="learning-course-description__link"
                            >
                                {t('pages.learning.readMore')}
                            </Link>
                        )}
                    </p>
                )}

                <div className="learning-course-progress">
                    <div className="learning-course-progress__info">
                        <span className="learning-course-progress__label">{t('pages.learning.progress')}</span>
                        <span className="learning-course-progress__value">
              {course.completed_topics}/{course.total_topics} {t('pages.learning.topics')}
            </span>
                        <span className="learning-course-progress__percent">
              ({progressPercent}%)
            </span>
                    </div>

                    <div className="learning-progress-bar">
                        <div
                            className="learning-progress-bar__fill"
                            style={{width: `${progressPercent}%`}}
                        />
                    </div>
                </div>
            </header>

            <section className="learning-modules">
                {course.modules && course.modules.length > 0 ? (
                    course.modules.map((mod) => {
                        const isOpen = !!expandedModules[mod.id];

                        const setWrapperRef = (el) => {
                            if (el) {
                                topicWrappersRef.current[mod.id] = el;
                            }
                        };

                        const wrapperMaxHeight = isOpen
                            ? `${topicWrappersRef.current[mod.id]?.scrollHeight || 0}px`
                            : '0px';

                        return (
                            <article key={mod.id} className="learning-module">
                                <button
                                    type="button"
                                    className="learning-module__header"
                                    onClick={() => toggleModule(mod.id)}
                                >
                                    <div>
                                        <div className="learning-module__title">{mod.title}</div>
                                        <div className="learning-module__meta">
                                            {mod.topics.length} {t('pages.learning.topics')}
                                        </div>
                                    </div>
                                    <div
                                        className={
                                            'learning-module__chevron' + (isOpen ? ' open' : '')
                                        }
                                    >
                                        ▾
                                    </div>
                                </button>

                                <div
                                    ref={setWrapperRef}
                                    className={
                                        'learning-topic-wrapper' +
                                        (isOpen ? ' learning-topic-wrapper--open' : '')
                                    }
                                    style={{maxHeight: wrapperMaxHeight}}
                                >
                                    {mod.topics.length > 0 ? (
                                        <ul className="learning-topic-list">
                                            {mod.topics.map((topic) => (
                                                <li
                                                    key={topic.id}
                                                    className={
                                                        'learning-topic learning-topic--' + topic.status
                                                    }
                                                    onClick={() => handleTopicClick(topic)}
                                                >
                                                    <div className="learning-topic__title">
                                                        {topic.title}
                                                        {topic.is_timed_test && (
                                                            <span className="learning-topic__timed-badge" title={t('pages.learning.timedTest')}>
                                                                ⏱
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="learning-topic__status">
                            <span className="learning-topic__status-pill">
                              {topic.status === 'not_started'
                                  ? t('pages.learning.statusNotStarted')
                                  : topic.status === 'in_progress'
                                      ? t('pages.learning.statusInProgress')
                                      : topic.status === 'completed'
                                          ? (topic.score != null && topic.score >= 100)
                                              ? t('pages.learning.statusPassed')
                                              : t('pages.learning.statusCompleted')
                                          : topic.status === 'failed'
                                              ? t('pages.learning.statusFailed')
                                              : topic.status.replace('_', ' ')}
                            </span>
                                                        {topic.score != null && (
                                                            <span className="learning-topic__score">
                                {topic.score}%
                              </span>
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="learning-topic-empty">{t('pages.learning.noTopicsYet')}</p>
                                    )}
                                </div>
                            </article>
                        );
                    })
                ) : (
                    <p>{t('pages.learning.noModulesYet')}</p>
                )}
            </section>
        </div>
    );
}

export default CourseLearningPage;