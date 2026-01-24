import {useLanguage} from '../../../shared/lib/i18n/LanguageContext';

function PracticeQuestionCard({
    question,
    selectedOptions,
    onOptionToggle,
    answerFeedback,
    onSubmit,
    onContinue,
    submitLoading,
    practiceLoading,
    isTimedMode,
    isAnswerLocked,
    disableSubmit,
    showNextButton,
    showFinishButton,
    showTimedNextButton,
    timedAnswerSaved,
}) {
    const {t} = useLanguage();
    // Remove dots at the start of option text
    const cleanOptionText = (text) => {
        if (!text) return text;
        // Remove leading dots, ellipsis, and whitespace
        return text.replace(/^[.\s…]+/, '').trim();
    };
    const renderFeedback = () => {
        if (!answerFeedback) return null;
        
        // For timed tests, show neutral gray feedback
        if (isTimedMode) {
            return (
                <div className="topic-practice__feedback topic-practice__feedback--neutral">
                    {answerFeedback.message}
                </div>
            );
        }
        
        // For non-timed tests, show colored feedback
        return (
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
        );
    };

    return (
        <div className="topic-practice__question-card">
            <div className="topic-practice__question-header">
                <span className="topic-practice__type">
                    {question.question_type === 'single_choice'
                        ? t('pages.learning.singleChoice')
                        : question.question_type === 'multiple_choice'
                            ? t('pages.learning.multipleChoice')
                            : t('pages.learning.code')}
                </span>
                <div className="topic-practice__question-text">
                    {question.text}
                </div>
            </div>

            <ul className="topic-practice__options">
                {question.options.map((opt) => {
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
                                onClick={() => onOptionToggle(opt.id)}
                                disabled={isAnswerLocked || submitLoading || practiceLoading}
                            >
                                <span className="topic-practice__option-indicator">
                                    {selected ? '●' : '○'}
                                </span>
                                <span className="topic-practice__option-text">
                                    {cleanOptionText(opt.text)}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>

            <div className="topic-practice__actions">
                {renderFeedback()}
                <div className="topic-practice__buttons-row">
                    {!isTimedMode && (!answerFeedback || answerFeedback.type !== 'success') && (
                        <button
                            type="button"
                            className="topic-practice__secondary-btn"
                            onClick={onSubmit}
                            disabled={
                                submitLoading ||
                                !question ||
                                disableSubmit
                            }
                        >
                            {submitLoading ? t('pages.auth.submitting') : answerFeedback?.type === 'fail' ? t('pages.auth.tryAgain') : t('pages.auth.submitAnswer')}
                        </button>
                    )}

                    {isTimedMode && !timedAnswerSaved && (
                        <button
                            type="button"
                            className="topic-practice__secondary-btn"
                            onClick={onSubmit}
                            disabled={submitLoading || practiceLoading}
                        >
                            {submitLoading ? t('pages.auth.saving') : t('pages.auth.submitAnswer')}
                        </button>
                    )}

                    {showNextButton && !isTimedMode && (
                        <button
                            type="button"
                            className="topic-practice__secondary-btn"
                            onClick={onContinue}
                            disabled={practiceLoading}
                        >
                            {t('pages.auth.nextQuestion')}
                        </button>
                    )}

                    {showFinishButton && !isTimedMode && (
                        <button
                            type="button"
                            className="topic-practice__secondary-btn"
                            onClick={onContinue}
                            disabled={practiceLoading}
                        >
                            {t('pages.auth.finishTest')}
                        </button>
                    )}

                    {showTimedNextButton && !showFinishButton && (
                        <button
                            type="button"
                            className="topic-practice__secondary-btn"
                            onClick={onContinue}
                            disabled={practiceLoading}
                        >
                            {t('pages.auth.nextQuestion')}
                        </button>
                    )}

                    {showFinishButton && isTimedMode && (
                        <button
                            type="button"
                            className="topic-practice__secondary-btn"
                            onClick={onContinue}
                            disabled={practiceLoading}
                        >
                            {t('pages.auth.finishTest')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PracticeQuestionCard;