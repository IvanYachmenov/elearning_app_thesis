import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {api} from '../../../shared/api';
import '../styles/learning.css';

import {
    PracticeQuestionCard,
    PracticeCompletionPanel,
    PracticeHistorySection,
    PracticeTimer,
} from '../../../features/learning';
import {useNavigationLock} from '../../../shared/lib/navigation-lock';
import {useLanguage} from '../../../shared/lib/i18n/LanguageContext';

function TopicPracticePage() {
    const {courseId, topicId} = useParams();
    const navigate = useNavigate();
    const {lockNavigation, unlockNavigation, isLocked} = useNavigationLock();
    const {t} = useLanguage();

    const [topic, setTopic] = useState(null);
    const [loadingTopic, setLoadingTopic] = useState(true);
    const [error, setError] = useState(null);

    const [practiceLoading, setPracticeLoading] = useState(false);
    const [practiceQuestion, setPracticeQuestion] = useState(null);
    const [practiceCompleted, setPracticeCompleted] = useState(false);

    const [timedOut, setTimedOut] = useState(false);
    const [passed, setPassed] = useState(false);
    const [scorePercent, setScorePercent] = useState(null);

    const [selectedOptions, setSelectedOptions] = useState([]);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [answerFeedback, setAnswerFeedback] = useState(null);

    const [topicProgressPercent, setTopicProgressPercent] = useState(0);
    const [answeredCount, setAnsweredCount] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);

    const [isTimedMode, setIsTimedMode] = useState(false);
    const [timeLimitSeconds, setTimeLimitSeconds] = useState(null);
    const [remainingSeconds, setRemainingSeconds] = useState(null);

    const [isReviewMode, setIsReviewMode] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState(null);
    const [historyQuestions, setHistoryQuestions] = useState([]);

    const [timedAnswerSaved, setTimedAnswerSaved] = useState(false);

    const timerExpiredRef = useRef(false);

    // load topic meta data
    useEffect(() => {
        if (!topicId) return;

        setLoadingTopic(true);
        setError(null);

        api
            .get(`/api/learning/topics/${topicId}/`)
            .then((resp) => {
                const data = resp.data;

                setTopic(data);
                setTopicProgressPercent(data.progress_percent ?? 0);
                setAnsweredCount(data.answered_questions ?? 0);
                setCorrectAnswers(data.correct_answers ?? data.answered_questions ?? 0);
                setTotalQuestions(data.total_questions ?? 0);

                const timed = Boolean(data.is_timed_test);
                setIsTimedMode(timed);

                if (timed && typeof data.time_limit_seconds === 'number') {
                    setTimeLimitSeconds(data.time_limit_seconds);
                }

                // if backend marks it completed via progress
                if ((data.total_questions ?? 0) > 0 && (data.progress_percent ?? 0) >= 100) {
                    setPracticeCompleted(true);
                }
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
            .finally(() => setLoadingTopic(false));
    }, [topicId]);

    const applyPracticePayload = useCallback((data, options = {}) => {
        const {preserveQuestion = false} = options;

        setAnsweredCount((prev) => data.answered_questions ?? prev ?? 0);
        setCorrectAnswers((prev) => data.correct_answers ?? data.answered_questions ?? prev ?? 0);
        setTotalQuestions((prev) => data.total_questions ?? prev ?? 0);

        if (typeof data.progress_percent === 'number') {
            setTopicProgressPercent(data.progress_percent);
        }
        if (typeof data.score_percent === 'number') {
            setScorePercent(data.score_percent);
        }

        const timed = Boolean(data.is_timed);
        setIsTimedMode(timed);

        if (timed) {
            if (typeof data.time_limit_seconds === 'number') {
                setTimeLimitSeconds(data.time_limit_seconds);
            }
            if (typeof data.remaining_seconds === 'number') {
                setRemainingSeconds(data.remaining_seconds);
                if (data.remaining_seconds > 0) {
                    timerExpiredRef.current = false;
                }
            }
        }

        const completedFlag = Boolean(data.completed || data.test_completed || data.timed_out);
        setPracticeCompleted(completedFlag);
        setTimedOut(Boolean(data.timed_out));
        setPassed(Boolean(data.passed));

        if (completedFlag) {
            unlockNavigation();
            setRemainingSeconds(null);
            timerExpiredRef.current = false;
            setPracticeQuestion(null);
            setSelectedOptions([]);
            setAnswerFeedback(null);
            setTimedAnswerSaved(false);
            return;
        }

        setPracticeQuestion((prev) => data.question || (preserveQuestion ? prev : null));

        // Only show feedback in non-timed mode
        if (data.last_answer && !timed) {
            setSelectedOptions(data.last_answer.selected_option_ids || []);
            setAnswerFeedback({
                type: data.last_answer.is_correct ? 'success' : 'fail',
                message: data.last_answer.is_correct ? t('pages.learning.correctAnswer') : t('pages.learning.incorrectAnswer'),
                score: data.last_answer.score,
            });
        } else {
            setSelectedOptions((prev) => (timed && preserveQuestion ? prev : []));
            setAnswerFeedback(null);
            setTimedAnswerSaved(false);
        }
    }, [unlockNavigation]);

    const fetchNextQuestion = useCallback(() => {
        if (!topicId) return;

        setPracticeLoading(true);
        setTimedAnswerSaved(false);

        api
            .get(`/api/learning/topics/${topicId}/next-question/`)
            .then((resp) => applyPracticePayload(resp.data))
            .catch((err) => {
                console.error(err);
                setSelectedOptions([]);
                setAnswerFeedback({
                    type: 'error',
                    message: t('pages.learning.failedToLoadNextQuestion'),
                });
            })
            .finally(() => setPracticeLoading(false));
    }, [applyPracticePayload, topicId]);

    // fetch first question once topic meta is loaded
    useEffect(() => {
        if (
            !loadingTopic &&
            !error &&
            topic &&
            totalQuestions > 0 &&
            !practiceQuestion &&
            !practiceCompleted &&
            !practiceLoading
        ) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchNextQuestion();
        }
    }, [loadingTopic, error, topic, totalQuestions, practiceQuestion, practiceCompleted, practiceLoading, fetchNextQuestion]);

    // load history when toggling review mode
    useEffect(() => {
        if (!isReviewMode) return;
        if (!topicId) return;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHistoryLoading(true);
        setHistoryError(null);

        api
            .get(`/api/learning/topics/${topicId}/history/`)
            .then((resp) => {
                const data = resp.data;
                setHistoryQuestions(data.questions || []);
            })
            .catch((err) => {
                console.error(err);
                if (err.response && err.response.status === 400) {
                    setHistoryError(t('pages.learning.historyAvailableAfterFinish'));
                } else {
                    setHistoryError(t('pages.learning.failedToLoadTestHistory'));
                }
            })
            .finally(() => setHistoryLoading(false));
    }, [isReviewMode, topicId]);

    // manage navigation lock for timed mode (NO redirects!)
    // manage navigation lock for timed mode (NO redirects!)
    const hasTimer = typeof remainingSeconds === 'number';
    const isTimedTestActive =
        isTimedMode &&
        !practiceCompleted &&
        !timedOut &&
        !!practiceQuestion &&
        hasTimer &&
        remainingSeconds > 0;

    useEffect(() => {
        if (isTimedTestActive) {
            lockNavigation(
                t('pages.learning.timedTestInProgress'),
                [`/learning/courses/${courseId}/topics/${topicId}/practice`],
            );
        } else {
            unlockNavigation();
        }

        // Cleanup on unmount
        return () => {
            unlockNavigation();
        };
    }, [isTimedTestActive, lockNavigation, unlockNavigation, courseId, topicId]);

// Remove the second useEffect - it's now handled above

    // countdown timer (stable interval, no restart every second)

    useEffect(() => () => unlockNavigation(), [unlockNavigation]);
    useEffect(() => {
        if (!isTimedMode || practiceCompleted || timedOut) return undefined;
        if (!hasTimer) return undefined;

        const interval = setInterval(() => {
            setRemainingSeconds((prev) => {
                if (prev === null || prev === undefined) return prev;
                return Math.max(prev - 1, 0);
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isTimedMode, practiceCompleted, timedOut, hasTimer]);

    // handle time expiration: let backend decide timed_out on next-question response
    useEffect(() => {
        if (!isTimedMode || practiceCompleted) return;
        if (remainingSeconds !== 0 || timerExpiredRef.current) return;

        timerExpiredRef.current = true;
        fetchNextQuestion();
    }, [fetchNextQuestion, isTimedMode, practiceCompleted, remainingSeconds]);

    const handleBackToTheory = () => {
        // Only block if timed test is ACTIVELY running
        if (isTimedTestActive) return;

        if (courseId) {
            navigate(`/learning/courses/${courseId}/topics/${topicId}`);
        } else if (topic && topic.course_id) {
            navigate(`/learning/courses/${topic.course_id}/topics/${topic.id}`);
        } else {
            navigate('/learning');
        }
    };


    const handleOptionToggle = (optionId) => {
        if (!practiceQuestion) return;
        if (isTimedMode && timedAnswerSaved) return;

        const locked = !!answerFeedback && answerFeedback.type === 'success' && !isTimedMode;
        if (locked) return;

        if (practiceQuestion.question_type === 'single_choice') {
            setSelectedOptions([optionId]);
        } else {
            setSelectedOptions((prev) =>
                prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId],
            );
        }
    };

    const handleContinueTimed = () => {
        if (!practiceQuestion) return;

        setSubmitLoading(true);

        api
            .post(`/api/learning/questions/${practiceQuestion.id}/answer/`, {
                selected_options: selectedOptions, // can be []
            })
            .then((resp) => {
                const data = resp.data;

                const newAnsweredCount = data.answered_questions ?? answeredCount;
                const newTotalQuestions = data.total_questions ?? totalQuestions;
                const isLastQuestionAnswer = newAnsweredCount >= newTotalQuestions && newTotalQuestions > 0;

                applyPracticePayload(
                    {
                        ...data,
                        completed: data.test_completed,
                    },
                    {preserveQuestion: !data.test_completed && !data.timed_out},
                );

                // For timed tests, only show "Answer accepted!" without correctness feedback
                // Only complete automatically if test is already marked as completed by backend
                // For the last question, show feedback and "Finish test" button instead
                if (data.test_completed || data.timed_out) {
                    if (isLastQuestionAnswer && !data.timed_out) {
                        // Last question (correct or incorrect) - show feedback and "Finish test" button
                        setAnswerFeedback({
                            type: 'neutral',
                            message: 'Answer accepted!',
                            score: data.score,
                            isLastQuestion: true,
                        });
                        setTimedAnswerSaved(true);
                    } else {
                        // Test completed or timed out - go to results
                        setPracticeCompleted(true);
                        setTimedOut(Boolean(data.timed_out));
                        setPassed(Boolean(data.passed));
                        setPracticeQuestion(null);
                        setTimedAnswerSaved(false);
                    }
                } else {
                    // Regular question - show only "Answer accepted!"
                    setAnswerFeedback({
                        type: 'neutral',
                        message: t('pages.learning.answerAccepted'),
                        score: data.score,
                        isLastQuestion: isLastQuestionAnswer,
                    });
                    setTimedAnswerSaved(true);
                }
            })
            .catch((err) => {
                console.error(err);
                setAnswerFeedback({
                    type: 'error',
                    message: t('pages.learning.failedToSubmitAnswer'),
                });
            })
            .finally(() => {
                setSubmitLoading(false);
            });
    };

    const handleSubmitAnswer = () => {
        if (!practiceQuestion) return;

        if (isTimedMode) {
            handleContinueTimed();
            return;
        }

        // If "Try again" button was clicked (feedback type is 'fail'), reset everything
        if (answerFeedback?.type === 'fail') {
            setAnswerFeedback(null);
            setSelectedOptions([]);
            return; // Exit early to allow user to select new answers
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

                const newAnsweredCount = data.answered_questions ?? answeredCount;
                const newTotalQuestions = data.total_questions ?? totalQuestions;
                const isLastQuestionAnswer = newAnsweredCount >= newTotalQuestions && newTotalQuestions > 0;

                setAnswerFeedback({
                    type: data.is_correct ? 'success' : 'fail',
                    message: data.is_correct ? t('pages.learning.correctAnswer') : t('pages.learning.incorrectAnswer'),
                    score: data.score,
                    isLastQuestion: isLastQuestionAnswer,
                });

                setTotalQuestions(newTotalQuestions);
                setAnsweredCount(newAnsweredCount);

                const completed =
                    data.test_completed ||
                    (typeof data.topic_progress_percent === 'number' && data.topic_progress_percent >= 100);

                if (typeof data.score_percent === 'number') {
                    setScorePercent(data.score_percent);
                }

                // Only complete automatically if test is already marked as completed by backend
                // For the last question (correct or incorrect), show feedback and "Finish test" button instead
                if (completed && data.test_completed && !isLastQuestionAnswer) {
                    setPracticeCompleted(true);
                    setPassed(Boolean(data.passed));
                    setPracticeQuestion(null);
                    setSelectedOptions([]);
                    setAnswerFeedback(null);
                }

                if (data.is_correct) {
                    setCorrectAnswers(data.correct_answers ?? data.answered_questions ?? newAnsweredCount);

                    if (typeof data.topic_progress_percent === 'number') {
                        setTopicProgressPercent(data.topic_progress_percent);
                        if (data.topic_progress_percent >= 100 || data.test_completed) {
                            setTopic((prev) => (prev ? {...prev, status: 'completed'} : prev));
                        }
                    }
                }
            })
            .catch((err) => {
                console.error(err);
                setAnswerFeedback({
                    type: 'error',
                    message: t('pages.learning.failedToSubmitAnswer'),
                });
            })
            .finally(() => setSubmitLoading(false));
    };

    const handleContinue = () => {
        // If this was the last question (for both timed and non-timed), complete the test
        const isLast = (answerFeedback?.isLastQuestion) || (answeredCount >= totalQuestions && totalQuestions > 0);
        
        if (isLast) {
            // Complete the test
            if (isTimedMode) {
                // For timed tests, we need to trigger completion
                // The backend should have already marked it as completed
                setPracticeCompleted(true);
                setTimedOut(false);
                // Determine if passed - for timed tests need 100% correct
                const passed = scorePercent !== null && scorePercent >= 100;
                setPassed(passed);
            } else {
                // For non-timed tests
                setPracticeCompleted(true);
                const passed = scorePercent !== null && scorePercent >= 100;
                setPassed(passed);
            }
            setPracticeQuestion(null);
            setSelectedOptions([]);
            setAnswerFeedback(null);
            setTimedAnswerSaved(false);
            return;
        }
        
        // Continue to next question
        if (isTimedMode) {
            fetchNextQuestion();
        } else {
            fetchNextQuestion();
        }
    };

    const handleRetry = () => {
        if (!topicId) return;

        setPracticeLoading(true);
        timerExpiredRef.current = false;

        api
            .post(`/api/learning/topics/${topicId}/reset/`)
            .then(() => {
                setPracticeCompleted(false);
                setTimedOut(false);
                setPassed(false);
                setAnswerFeedback(null);
                setSelectedOptions([]);
                setScorePercent(null);
                setIsReviewMode(false);
                fetchNextQuestion();
            })
            .catch((err) => {
                console.error(err);
                setAnswerFeedback({
                    type: 'error',
                    message: t('pages.learning.failedToRestartTest'),
                });
            })
            .finally(() => setPracticeLoading(false));
    };

    const canPractice = useMemo(() => totalQuestions > 0, [totalQuestions]);
    const isExitLocked = isTimedTestActive;
    const isAnswerLocked =
        (!!answerFeedback && answerFeedback.type === 'success' && !isTimedMode) ||
        (!!answerFeedback && answerFeedback.type === 'fail' && !isTimedMode) || // Block when wrong answer shown
        (isTimedMode && timedAnswerSaved);
    const isLastQuestion = answerFeedback?.isLastQuestion || (answeredCount >= totalQuestions && totalQuestions > 0);
    const showNextButton =
        !isTimedMode &&
        !!answerFeedback &&
        answerFeedback.type === 'success' &&
        !isLastQuestion;
    const showFinishButton =
        !!answerFeedback &&
        isLastQuestion &&
        ((!isTimedMode && (answerFeedback.type === 'success' || answerFeedback.type === 'fail')) ||
         (isTimedMode && answerFeedback.type === 'neutral'));
    const showTimedNextButton = isTimedMode && timedAnswerSaved && !showFinishButton;
    if (loadingTopic && !topic) {
        return <div className="page page-enter"/>;
    }

    if (error || !topic) {
        return (
            <div className="page page-enter">
                <p style={{color: '#dc2626'}}>{error || t('pages.learning.topicNotFound')}</p>
                <button
                    type="button"
                    className="learning-back-link"
                    onClick={() => navigate('/learning')}
                    style={{marginTop: '16px'}}

                >
                    {t('pages.learning.backToMyLearning')}
                </button>
            </div>
        );
    }

    return (
        <div className="page page-enter">
            <header className="topic-page-header">
                <div className="topic-page-header__row">
                    <button
                        type="button"
                        className="learning-back-link"
                        onClick={handleBackToTheory}
                        disabled={isExitLocked}
                        aria-disabled={isExitLocked}
                    >
                        {t('pages.learning.backToTheory')}
                    </button>

                    {practiceCompleted && isReviewMode && (
                        <button
                            type="button"
                            className="learning-back-link topic-page-header__back-results"
                            onClick={() => setIsReviewMode(false)}
                        >
                            {t('pages.learning.backToResults')}
                        </button>
                    )}
                </div>

                <div className="topic-meta">
                    {topic.course_title} · {topic.module_title}
                </div>

                <h1 className="page__title">{topic.title} – Practice</h1>
            </header>

            <section className="topic-practice">
                <header className="topic-practice__header">
                    <div className="topic-practice__progress">
                        <div className="learning-progress-bar">
                            <div
                                className="learning-progress-bar__fill"
                                style={{width: `${topicProgressPercent}%`}}
                            />
                        </div>
                    </div>

                    {isTimedMode && !practiceCompleted && !timedOut && (
                        <PracticeTimer
                            remainingSeconds={remainingSeconds}
                            timeLimitSeconds={timeLimitSeconds}
                            isActive={!practiceCompleted && !timedOut}
                            timedOut={timedOut}
                        />
                    )}
                </header>

                {!canPractice && (
                    <p className="topic-practice__empty">
                        There are no practice questions for this topic yet.
                    </p>
                )}

                {canPractice && (
                    <>
                        {practiceLoading && !practiceQuestion && (
                            <p className="topic-practice__empty">{t('pages.learning.loadingQuestion')}</p>
                        )}

                        {practiceCompleted && !practiceQuestion && !practiceLoading && !isReviewMode && (
                            <PracticeCompletionPanel
                                topicTitle={topic.title}
                                isTimed={isTimedMode}
                                timedOut={timedOut}
                                passed={passed}
                                scorePercent={scorePercent}
                                correctAnswers={correctAnswers}
                                totalQuestions={totalQuestions}
                                answeredQuestions={answeredCount}
                                onRetry={handleRetry}
                                onViewHistory={() => setIsReviewMode(true)}
                                isReviewMode={isReviewMode}
                            />
                        )}

                        {practiceCompleted && isReviewMode && (
                            <PracticeHistorySection
                                historyQuestions={historyQuestions}
                                loading={historyLoading}
                                error={historyError}
                            />
                        )}

                        {!practiceCompleted && practiceQuestion && (
                            <PracticeQuestionCard
                                question={practiceQuestion}
                                selectedOptions={selectedOptions}
                                onOptionToggle={handleOptionToggle}
                                answerFeedback={answerFeedback}
                                onSubmit={handleSubmitAnswer}
                                onContinue={handleContinue}
                                submitLoading={submitLoading}
                                practiceLoading={practiceLoading}
                                isTimedMode={isTimedMode}
                                isAnswerLocked={isAnswerLocked}
                                timedAnswerSaved={timedAnswerSaved}
                                // important: in timed mode Continue must NOT be blocked by empty selection
                                disableSubmit={!isTimedMode && selectedOptions.length === 0}
                                showNextButton={showNextButton}
                                showFinishButton={showFinishButton}
                                showTimedNextButton={showTimedNextButton}
                            />
                        )}
                    </>
                )}
            </section>
        </div>
    );
}

export default TopicPracticePage;
