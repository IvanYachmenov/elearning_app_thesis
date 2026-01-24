import {useLanguage} from '../../../shared/lib/i18n/LanguageContext';

function PracticeHistorySection({historyQuestions, loading, error}) {
    const {t} = useLanguage();
    // Remove dots at the start of option text
    const cleanOptionText = (text) => {
        if (!text) return text;
        // Remove leading dots, ellipsis, and whitespace
        return text.replace(/^[.\s…]+/, '').trim();
    };
    
    return (
        <section className="topic-practice__history">
            {loading && (
                <p className="topic-practice__empty">
                    {t('pages.learning.loadingTestHistory')}
                </p>
            )}

            {error && (
                <p style={{color: '#dc2626', marginTop: '8px'}}>
                    {error}
                </p>
            )}

            {!loading && !error && historyQuestions.length === 0 && (
                <p className="topic-practice__empty">
                    {t('pages.learning.noAnsweredQuestions')}
                </p>
            )}

            {!loading && !error && historyQuestions.length > 0 && (
                <div className="topic-practice__history-list">
                    {historyQuestions.map((q, index) => (
                        <div
                            key={q.id}
                            className="topic-practice__question-card topic-practice__question-card--readonly"
                        >
                            <div className="topic-practice__question-header">
                                <span className="topic-practice__type">
                                    {q.question_type === 'single_choice'
                                        ? t('pages.learning.singleChoice')
                                        : q.question_type === 'multiple_choice'
                                            ? t('pages.learning.multipleChoice')
                                            : t('pages.learning.code')}
                                </span>
                                <div className="topic-practice__question-text">
                                    {q.text}
                                </div>
                            </div>

                            <ul className="topic-practice__options">
                                {q.options.map((opt) => {
                                    const selected = q.user_option_ids?.includes(opt.id);
                                    const correct = opt.is_correct;
                                    return (
                                        <li key={opt.id}>
                                            <div
                                                className={
                                                    'topic-practice__option-button topic-practice__option-button_history' +
                                                    (correct
                                                        ? ' topic-practice__option-button--success'
                                                        : selected
                                                            ? ' topic-practice__option-button--selected-history'
                                                            : '')
                                                }
                                            >
                                                <span className="topic-practice__option-indicator">
                                                    {selected ? '●' : '○'}
                                                </span>
                                                <span className="topic-practice__option-text">
                                                    {cleanOptionText(opt.text)}
                                                </span>
                                                {correct && (
                                                    <span className="topic-practice__option-correct-label">{t('pages.learning.correct')}</span>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>

                            {q.is_correct !== null && (
                                <div
                                    className={
                                        'topic-practice__feedback' +
                                        (q.is_correct
                                            ? ' topic-practice__feedback--success'
                                            : ' topic-practice__feedback--fail')
                                    }
                                    style={{marginTop: '8px'}}
                                >
                                    {q.is_correct
                                        ? t('pages.learning.correctAnswer')
                                        : t('pages.learning.incorrectAnswer')}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default PracticeHistorySection;