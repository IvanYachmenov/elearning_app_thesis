function PracticeCompletionPanel({
    topicTitle,
    isTimed,
    timedOut,
    passed,
    scorePercent,
    correctAnswers,
    totalQuestions,
    answeredQuestions,
    onRetry,
    onViewHistory,
    isReviewMode,
}) {
    const accuracy = typeof scorePercent === 'number' ? scorePercent : Math.round((correctAnswers * 100) / (totalQuestions || 1));

    const statusLabel = timedOut
        ? 'Test failed – time is up'
        : passed
            ? 'Test passed'
            : 'Test not passed';

    const description = timedOut
        ? 'Time expired before you finished the questions.'
        : isTimed
            ? 'Timed tests require 100% correct answers to pass.'
            : 'You have completed all questions.';

    return (
        <div className="topic-practice__completed-block">
            <p className="topic-practice__completed">{topicTitle} – {statusLabel}</p>
            <p className="topic-practice__subtitle">{description}</p>

            <div className="practice-summary">
                <div className="practice-summary__item">
                    <div className="practice-summary__label">Correct</div>
                    <div className="practice-summary__value">{correctAnswers}/{totalQuestions}</div>
                </div>
                <div className="practice-summary__item">
                    <div className="practice-summary__label">Answered</div>
                    <div className="practice-summary__value">{answeredQuestions}/{totalQuestions}</div>
                </div>
                <div className="practice-summary__item">
                    <div className="practice-summary__label">Accuracy</div>
                    <div className="practice-summary__value">{accuracy}%</div>
                </div>
            </div>

            <div className="topic-practice__buttons-row" style={{marginTop: '12px'}}>
                {onViewHistory && (
                    <button
                        type="button"
                        className="topic-practice__primary-btn topic-practice__history-btn"
                        onClick={onViewHistory}
                        disabled={isReviewMode}
                    >
                        {isReviewMode ? 'History opened' : 'View test history'}
                    </button>
                )}

                {(!passed || timedOut) && onRetry && (
                    <button
                        type="button"
                        className="topic-practice__secondary-btn"
                        onClick={onRetry}
                    >
                        Retry
                    </button>
                )}
            </div>
        </div>
    );
}

export default PracticeCompletionPanel;