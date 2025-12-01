import {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {api} from '../../../api/client';
import '../learning.css';

function TopicPracticePage() {
    const {courseId, topicId} = useParams();
    const navigate = useNavigate();

    const [topic, setTopic] = useState(null);
    const [loadingTopic, setLoadingTopic] = useState(true);
    const [error, setError] = useState(null);

    const [practiceLoading, setPracticeLoading] = useState(false);
    const [practiceQuestion, setPracticeQuestion] = useState(null);
    const [practiceCompleted, setPracticeCompleted] = useState(false);

    const [selectedOptions, setSelectedOptions] = useState([]);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [answerFeedback, setAnswerFeedback] = useState(null);

    const [topicProgressPercent, setTopicProgressPercent] = useState(0);
    const [answeredCount, setAnsweredCount] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);

    // load topic meta data
    useEffect(() => {
        setLoadingTopic(true);
        setError(null);

        api
            .get(`/api/learning/topics/${topicId}/`)
            .then((resp) => {
                const data = resp.data;
                setTopic(data);
                setTopicProgressPercent(data.progress_percent ?? 0);
                setAnsweredCount(data.answered_questions ?? 0);
                setTotalQuestions(data.total_questions ?? 0);

                if ((data.total_questions ?? 0) > 0 && (data.progress_percent ?? 0) >= 100) {
                    setPracticeCompleted(true);
                }
            })
            .catch((err) => {
                console.error(err);
                if (err.response && err.response.status === 404) {
                    setError('Topic not found or you are not enrolled.');
                } else if (err.response && err.response.status === 403) {
                    setError('You are not enrolled in this course.');
                } else {
                    setError('Failed to load topic.');
                }
            })
            .finally(() => setLoadingTopic(false));
    }, [topicId]);

    // fetch first question once topic meta is loaded
    useEffect(() => {
        if (
            !loadingTopic &&
            !error &&
            topic &&
            totalQuestions > 0 &&
            !practiceQuestion &&
            !practiceCompleted
        ) {
            fetchNextQuestion();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadingTopic, error, topic, totalQuestions, practiceCompleted]);

    const handleBackToTheory = () => {
        if (courseId) {
            navigate(`/learning/courses/${courseId}/topics/${topicId}`);
        } else if (topic && topic.course_id) {
            navigate(`/learning/courses/${topic.course_id}/topics/${topic.id}`);
        } else {
            navigate('/learning');
        }
    };

    const fetchNextQuestion = () => {
        if (!topicId) return;

        setPracticeLoading(true);

        api
            .get(`/api/learning/topics/${topicId}/next-question/`)
            .then((resp) => {
                const data = resp.data;

                setAnsweredCount(data.answered_questions ?? 0);
                setTotalQuestions(data.total_questions ?? 0);

                if (typeof data.progress_percent === 'number') {
                    setTopicProgressPercent(data.progress_percent);
                }

                if (data.completed || !data.question) {
                    setPracticeCompleted(true);
                    setPracticeQuestion(null);
                    setSelectedOptions([]);
                    setAnswerFeedback(null);
                    return;
                }

                setPracticeCompleted(false);
                setPracticeQuestion(data.question);

                if (data.last_answer) {
                    const selectedIds = data.last_answer.selected_option_ids || [];
                    setSelectedOptions(selectedIds);

                    if (typeof data.last_answer.is_correct === 'boolean') {
                        setAnswerFeedback({
                            type: data.last_answer.is_correct ? 'success' : 'fail',
                            message: data.last_answer.is_correct
                                ? 'Correct answer!'
                                : 'Incorrect answer.',
                        });
                    } else {
                        setAnswerFeedback(null);
                    }
                } else {
                    setSelectedOptions([]);
                    setAnswerFeedback(null);
                }
            })
            .catch((err) => {
                console.error(err);
                setSelectedOptions([]);
                setAnswerFeedback({
                    type: 'error',
                    message: 'Failed to load next question.',
                });
            })
            .finally(() => setPracticeLoading(false));
    };

    const handleOptionToggle = (optionId) => {
        if (!practiceQuestion) return;

        // do not allow changes after a correct answer
        if (answerFeedback && answerFeedback.type === 'success') {
            return;
        }

        if (practiceQuestion.question_type === 'single_choice') {
            setSelectedOptions([optionId]);
        } else {
            setSelectedOptions((prev) =>
                prev.includes(optionId)
                    ? prev.filter((id) => id !== optionId)
                    : [...prev, optionId],
            );
        }
    };

    const handleSubmitAnswer = () => {
        if (!practiceQuestion) return;

        // already correct, nothing to submit
        if (answerFeedback && answerFeedback.type === 'success') {
            return;
        }

        if (selectedOptions.length === 0) {
            setAnswerFeedback({
                type: 'error',
                message: 'Please select at least one option.',
            });
            return;
        }

        setSubmitLoading(true);
        setAnswerFeedback(null);

        api
            .post(`/api/learning/questions/${practiceQuestion.id}/answer/`, {
                selected_options: selectedOptions,
            })
            .then((resp) => {
                const data = resp.data;

                setAnswerFeedback({
                    type: data.is_correct ? 'success' : 'fail',
                    message: data.is_correct ? 'Correct answer!' : 'Incorrect answer.',
                    score: data.score,
                });

                // total questions can always be updated
                setTotalQuestions(data.total_questions ?? totalQuestions);

                if (data.is_correct) {
                    setAnsweredCount(data.answered_questions ?? answeredCount);

                    if (typeof data.topic_progress_percent === 'number') {
                        setTopicProgressPercent(data.topic_progress_percent);
                        if (data.topic_progress_percent >= 100) {
                            setPracticeCompleted(true);
                            setTopic((prev) =>
                                prev ? {...prev, status: 'completed'} : prev,
                            );
                        }
                    }
                }
            })
            .catch((err) => {
                console.error(err);
                setAnswerFeedback({
                    type: 'error',
                    message: 'Failed to submit answer. Please try again.',
                });
            })
            .finally(() => setSubmitLoading(false));
    };

    if (loadingTopic && !topic) {
        // empty wrapper instead of flashing "Loading..."
        return <div className="page page-enter"/>;
    }

    if (error || !topic) {
        return (
            <div className="page page-enter">
                <p style={{color: '#dc2626'}}>{error || 'Topic not found.'}</p>
                <button
                    type="button"
                    className="learning-back-link"
                    onClick={() => navigate('/learning')}
                    style={{marginTop: '16px'}}
                >
                    ← Back to My Learning
                </button>
            </div>
        );
    }

    const canPractice = totalQuestions > 0;
    const isAnswerLocked = !!answerFeedback && answerFeedback.type === 'success';
    const isFail = !!answerFeedback && answerFeedback.type === 'fail';
    const isSuccess = !!answerFeedback && answerFeedback.type === 'success';

    return (
        <div className="page page-enter">
            <header className="topic-page-header">
                <button
                    type="button"
                    className="learning-back-link"
                    onClick={handleBackToTheory}
                >
                    ← Back to theory
                </button>

                <div className="topic-meta">
                    {topic.course_title} · {topic.module_title}
                </div>

                <h1 className="page__title">{topic.title} – Practice</h1>
            </header>

            <section className="topic-practice">
                <header className="topic-practice__header">
                    <div className="topic-practice__progress">
                        <div className="topic-practice__progress-info">
                            <span>
                                {answeredCount}/{totalQuestions} questions
                            </span>
                            <span className="topic-practice__percent">
                                ({Math.round(topicProgressPercent)}%)
                            </span>
                        </div>
                        <div className="learning-progress-bar">
                            <div
                                className="learning-progress-bar__fill"
                                style={{width: `${topicProgressPercent}%`}}
                            />
                        </div>
                    </div>
                </header>

                {!canPractice && (
                    <p className="topic-practice__empty">
                        There are no practice questions for this topic yet.
                    </p>
                )}

                {canPractice && (
                    <>
                        {practiceLoading && !practiceQuestion && (
                            <p className="topic-practice__empty">Loading question...</p>
                        )}

                        {practiceCompleted && !practiceQuestion && !practiceLoading && (
                            <p className="topic-practice__completed">
                                You have completed all questions for this topic.
                            </p>
                        )}

                        {practiceQuestion && (
                            <div className="topic-practice__question-card">
                                <div className="topic-practice__question-meta">
                                    <span/>
                                    <span className="topic-practice__type">
                                        {practiceQuestion.question_type === 'single_choice'
                                            ? 'Single choice'
                                            : practiceQuestion.question_type ===
                                            'multiple_choice'
                                                ? 'Multiple choice'
                                                : 'Code'}
                                    </span>
                                </div>

                                <div className="topic-practice__question-text">
                                    {practiceQuestion.text}
                                </div>

                                <ul className="topic-practice__options">
                                    {practiceQuestion.options.map((opt) => {
                                        const selected = selectedOptions.includes(opt.id);
                                        return (
                                            <li key={opt.id}>
                                                <button
                                                    type="button"
                                                    className={
                                                        'topic-practice__option-button' +
                                                        (selected
                                                            ? ' topic-practice__option-button--selected'
                                                            : '')
                                                    }
                                                    onClick={() => handleOptionToggle(opt.id)}
                                                    disabled={isAnswerLocked || submitLoading}
                                                >
                                                    <span className="topic-practice__option-indicator">
                                                        {selected ? '●' : '○'}
                                                    </span>
                                                    <span className="topic-practice__option-text">
                                                        {opt.text}
                                                    </span>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>

                                <div className="topic-practice__actions">
                                    {answerFeedback && (
                                        <div
                                            className={
                                                'topic-practice__feedback' +
                                                (answerFeedback.type === 'success'
                                                    ? ' topic-practice__feedback--success'
                                                    : answerFeedback.type === 'fail'
                                                        ? ' topic-practice__feedback--fail'
                                                        : ' topic-practice__feedback--error')
                                            }
                                        >
                                            {answerFeedback.message}

                                        </div>
                                    )}

                                    <div className="topic-practice__buttons-row">
                                        {/* main button: Submit / Try again */}
                                        {(!answerFeedback ||
                                            answerFeedback.type !== 'success') && (
                                            <button
                                                type="button"
                                                className="topic-practice__secondary-btn"
                                                onClick={handleSubmitAnswer}
                                                disabled={
                                                    submitLoading ||
                                                    !practiceQuestion ||
                                                    selectedOptions.length === 0
                                                }
                                            >
                                                {submitLoading
                                                    ? 'Submitting...'
                                                    : isFail
                                                        ? 'Try again'
                                                        : 'Submit answer'}
                                            </button>
                                        )}

                                        {/* next question only after correct answer */}
                                        {isSuccess && answeredCount <= totalQuestions && (
                                            <button
                                                type="button"
                                                className="topic-practice__secondary-btn"
                                                onClick={fetchNextQuestion}
                                                disabled={practiceLoading}
                                            >
                                                Next question
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
}

export default TopicPracticePage;
