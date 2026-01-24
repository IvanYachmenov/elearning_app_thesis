import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../shared/api';
import {useLanguage} from '../../../shared/lib/i18n/LanguageContext';
import '../styles/learning.css';

function TopicTheoryPage() {
    const { courseId, topicId } = useParams();
    const navigate = useNavigate();
    const {t} = useLanguage();

    const [topic, setTopic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        api
            .get(`/api/learning/topics/${topicId}/`)
            .then((resp) => {
                setTopic(resp.data);
            })
            .catch((err) => {
                console.error(err);
                if (err.response && err.response.status === 404) {
                    setError(t('pages.learning.topicNotFound'));
                } else if (err.response && err.response.status === 403) {
                    setError(t('pages.learning.notEnrolled'));
                } else {
                    setError(t('pages.learning.failedToLoadTopic'));
                }
            })
            .finally(() => setLoading(false));
    }, [topicId]);

    const handleBackToCourse = () => {
        if (courseId) {
            navigate(`/learning/courses/${courseId}/`);
        } else if (topic && topic.course_id) {
            navigate(`/learning/courses/${topic.course_id}/`);
        } else {
            navigate('/learning');
        }
    };

    const handleGoToPractice = () => {
        if (!topic) return;

        const cid = courseId || topic.course_id;
        navigate(`/learning/courses/${cid}/topics/${topic.id}/practice`);
    };

    if (loading) {
        return (
            <div className="page page-enter">
                <p>{t('pages.learning.loadingTopic')}</p>
            </div>
        );
    }

    if (error || !topic) {
        return (
            <div className="page page-enter">
                <p style={{ color: '#dc2626' }}>{error || t('pages.learning.topicNotFound')}</p>
                <button
                    type="button"
                    className="learning-back-link"
                    onClick={() => navigate('/learning')}
                    style={{ marginTop: '16px' }}
                >
                    {t('pages.learning.backToMyLearning')}
                </button>
            </div>
        );
    }

    const progressPercent = topic.progress_percent ?? 0;

    return (
        <div className="page page-enter">
            <header className="topic-page-header">
                <button
                    type="button"
                    className="learning-back-link"
                    onClick={handleBackToCourse}
                >
                    {t('pages.learning.backToCourse')}
                </button>

                <div className="topic-meta">
                    {topic.course_title} · {topic.module_title}
                    {topic.is_timed_test && (
                        <span className="topic-meta__timed-badge" title={`${t('pages.learning.timedTest')}${topic.time_limit_seconds ? ` (${Math.floor(topic.time_limit_seconds / 60)} min)` : ''}`}>
                            {t('pages.learning.timedTest')}
                        </span>
                    )}
                </div>

                <h1 className="page__title">{topic.title}</h1>
            </header>

            {/* only progress bar */}
            <div className="topic-theory-progress">
                <div className="learning-progress-bar">
                    <div
                        className="learning-progress-bar__fill"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            <section className="topic-theory">
                <h2 className="topic-section-title">{t('pages.learning.theory')}</h2>
                <div className="topic-theory__content">
                    {topic.content}
                </div>
            </section>

            <div className="topic-theory__actions">
                <button
                    type="button"
                    className="topic-theory__practice-btn"
                    onClick={handleGoToPractice}
                >
                    {t('pages.learning.goToPractice')}
                </button>
            </div>
        </div>
    );
}

export default TopicTheoryPage;
