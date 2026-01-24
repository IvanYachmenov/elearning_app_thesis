import {useState, useEffect, useCallback} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {api} from '../../../shared/api';
import {useLanguage} from '../../../shared/lib/i18n/LanguageContext';
import '../styles/teacher.css';

function TeacherTopicEditPage({user}) {
    const {courseId, moduleId, topicId} = useParams();
    const isEditMode = !!topicId;
    const navigate = useNavigate();
    const {t} = useLanguage();
    
    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    
    const [topicData, setTopicData] = useState({
        title: '',
        content: '',
        order: 0,
        is_timed_test: false,
        time_limit_seconds: null,
        questions: []
    });

    // Convert seconds to minutes and seconds
    const secondsToMinutesAndSeconds = (totalSeconds) => {
        if (!totalSeconds || totalSeconds < 30) return { minutes: 0, seconds: 30 };
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return { minutes: Math.min(minutes, 29), seconds: Math.min(seconds, 59) };
    };

    // Convert minutes and seconds to total seconds
    const minutesAndSecondsToSeconds = (minutes, seconds) => {
        const total = minutes * 60 + seconds;
        if (total < 30) return 30;
        if (total > 1800) return 1800;
        return total;
    };

    // Get current minutes and seconds from time_limit_seconds
    const getTimeDisplay = () => {
        if (!topicData.time_limit_seconds) {
            return { minutes: 0, seconds: 30 };
        }
        return secondsToMinutesAndSeconds(topicData.time_limit_seconds);
    };

    const handleTimeChange = (field, value) => {
        const current = getTimeDisplay();
        let newMinutes = current.minutes;
        let newSeconds = current.seconds;

        if (field === 'minutes') {
            const numValue = parseInt(value) || 0;
            newMinutes = Math.max(0, Math.min(29, numValue));
        } else if (field === 'seconds') {
            const numValue = parseInt(value) || 0;
            newSeconds = Math.max(0, Math.min(59, numValue));
        }

        const totalSeconds = minutesAndSecondsToSeconds(newMinutes, newSeconds);
        setTopicData({...topicData, time_limit_seconds: totalSeconds});
    };


    const fetchTopic = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/api/teacher/topics/${topicId}/`);
            const data = response.data;
            if (data && data.questions) {
                data.questions = (data.questions || []).map(question => ({
                    ...question,
                    options: question.options || []
                }));
            }
            setTopicData(data);
        } catch (err) {
            setError(err.response?.data?.detail || err.response?.data?.message || t('pages.teacher.failedToLoadTopic'));
        } finally {
            setLoading(false);
        }
    }, [topicId]);

    useEffect(() => {
        if (!user || user.role !== 'teacher') {
            navigate('/home', {replace: true});
            return;
        }

        if (isEditMode && topicId) {
            fetchTopic();
        } else if (moduleId) {
            // For new topic, fetch module to get max order
            api.get(`/api/teacher/modules/${moduleId}/`)
                .then(response => {
                    const module = response.data;
                    const maxOrder = module.topics && module.topics.length > 0
                        ? Math.max(...module.topics.map(t => typeof t.order === 'number' ? t.order : -1))
                        : -1;
                    setTopicData(prev => ({
                        ...prev,
                        order: maxOrder + 1
                    }));
                })
                .catch(err => {
                    console.error('Failed to fetch module:', err);
                });
        }
    }, [topicId, moduleId, user, navigate, isEditMode, fetchTopic]);

    const prepareOption = (option) => ({
        ...(option.id && { id: option.id }),
        text: option.text || '',
        is_correct: Boolean(option.is_correct)
    });

    const prepareQuestion = (question, questionIndex) => ({
        ...(question.id && { id: question.id }),
        text: question.text || '',
        order: typeof question.order === 'number' ? question.order : questionIndex,
        question_type: question.question_type || 'single_choice',
        max_score: question.max_score ? parseInt(question.max_score) : 100,
        options: (question.options || []).map(prepareOption)
    });

    const prepareTopicData = () => {
        // If timed test is enabled but no time limit set, default to 30 seconds
        let timeLimit = null;
        if (topicData.is_timed_test) {
            timeLimit = topicData.time_limit_seconds 
                ? parseInt(topicData.time_limit_seconds) 
                : 30;
            // Ensure minimum 30 seconds
            if (timeLimit < 30) timeLimit = 30;
            // Ensure maximum 1800 seconds (30 minutes)
            if (timeLimit > 1800) timeLimit = 1800;
        }
        
        const data = {
            title: topicData.title,
            content: topicData.content || '',
            order: topicData.order,
            is_timed_test: Boolean(topicData.is_timed_test),
            time_limit_seconds: timeLimit,
            questions: topicData.questions.map((q, idx) => prepareQuestion(q, idx))
        };
        
        // Only include module when creating new topic
        if (!isEditMode && moduleId) {
            data.module = parseInt(moduleId);
        }
        
        return data;
    };

    const handleSave = async () => {
        if (!topicData.title.trim()) {
            setError('Topic title is required');
            return;
        }

        setSaving(true);
        setError(null);
        
        try {
            const dataToSend = prepareTopicData();
            
            if (isEditMode) {
                await api.put(`/api/teacher/topics/${topicId}/`, dataToSend);
            } else {
                await api.post('/api/teacher/topics/', dataToSend);
            }
            navigate(`/teacher/courses/${courseId}/edit`);
        } catch (err) {
            console.error('Save error:', err.response?.data);
            let errorMessage = t('pages.teacher.failedToSaveTopic');
            
            if (err.response?.status === 401) {
                errorMessage = t('pages.teacher.sessionExpired');
            } else if (err.response?.data) {
                if (typeof err.response.data === 'string') {
                    errorMessage = err.response.data;
                } else if (err.response.data.detail) {
                    errorMessage = err.response.data.detail;
                } else if (err.response.data.message) {
                    errorMessage = err.response.data.message;
                }
            }
            setError(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate(`/teacher/courses/${courseId}/edit`);
    };

    const handleAddQuestion = () => {
        const maxOrder = topicData.questions.length > 0
            ? Math.max(...topicData.questions.map(q => typeof q.order === 'number' ? q.order : -1))
            : -1;
        const newQuestion = {
            text: '',
            order: maxOrder + 1,
            question_type: 'single_choice',
            max_score: 100,
            options: []
        };
        setTopicData({
            ...topicData,
            questions: [...topicData.questions, newQuestion]
        });
    };

    const handleQuestionChange = (questionIndex, field, value) => {
        const updatedQuestions = [...topicData.questions];
        updatedQuestions[questionIndex] = {
            ...updatedQuestions[questionIndex],
            [field]: value
        };
        setTopicData({
            ...topicData,
            questions: updatedQuestions
        });
    };

    const handleDeleteQuestion = (questionIndex) => {
        const updatedQuestions = topicData.questions.filter((_, index) => index !== questionIndex);
        setTopicData({
            ...topicData,
            questions: updatedQuestions
        });
    };

    const handleAddOption = (questionIndex) => {
        const updatedQuestions = [...topicData.questions];
        const question = updatedQuestions[questionIndex];
        const newOption = {
            text: '',
            is_correct: false
        };
        updatedQuestions[questionIndex] = {
            ...question,
            options: [...(question.options || []), newOption]
        };
        setTopicData({
            ...topicData,
            questions: updatedQuestions
        });
    };

    const handleOptionChange = (questionIndex, optionIndex, field, value) => {
        const updatedQuestions = [...topicData.questions];
        updatedQuestions[questionIndex].options[optionIndex] = {
            ...updatedQuestions[questionIndex].options[optionIndex],
            [field]: value
        };
        setTopicData({
            ...topicData,
            questions: updatedQuestions
        });
    };

    const handleDeleteOption = (questionIndex, optionIndex) => {
        const updatedQuestions = [...topicData.questions];
        updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options.filter(
            (_, index) => index !== optionIndex
        );
        setTopicData({
            ...topicData,
            questions: updatedQuestions
        });
    };

    if (!user || user.role !== 'teacher') {
        return null;
    }

    if (loading) {
        return (
            <div className="page page-enter">
                <h1 className="page__title">{isEditMode ? t('pages.teacher.editTopic') : t('pages.teacher.createTopic')}</h1>
                <p>{t('pages.teacher.loadingGeneric')}</p>
            </div>
        );
    }

    return (
        <div className="page page-enter">
            <div className="teacher-course-edit-top">
                <h1 className="teacher-course-edit-title">{isEditMode ? t('pages.teacher.editTopic') : t('pages.teacher.createTopic')}</h1>
                <div className="teacher-course-edit-back">
                    <button
                        className="btn-primary"
                        onClick={handleCancel}
                        disabled={saving}
                    >
                        {t('pages.teacher.back')}
                    </button>
                </div>
            </div>

            {error && (
                <div className="teacher-error">
                    {error}
                </div>
            )}

            <div className="teacher-course-edit-form">
                <div className="teacher-form-group">
                    <label className="teacher-form-label">{t('pages.teacher.topicTitle')} <span style={{color: 'red'}}>*</span></label>
                    <input
                        type="text"
                        className="teacher-form-input"
                        value={topicData.title}
                        onChange={(e) => setTopicData({...topicData, title: e.target.value})}
                        placeholder={t('pages.teacher.enterTopicTitle')}
                        required
                    />
                </div>
                
                <div className="teacher-form-group">
                    <label className="teacher-form-label">{t('pages.teacher.theoryText')}</label>
                    <textarea
                        className="teacher-form-textarea"
                        value={topicData.content || ''}
                        onChange={(e) => setTopicData({...topicData, content: e.target.value})}
                        placeholder={t('pages.teacher.enterTheoryContent')}
                        rows={8}
                    />
                </div>
                
                <div className="teacher-form-group">
                    <label className="teacher-form-checkbox-label">
                        <input
                            type="checkbox"
                            checked={topicData.is_timed_test || false}
                            onChange={(e) => {
                                const isChecked = e.target.checked;
                                setTopicData({
                                    ...topicData,
                                    is_timed_test: isChecked,
                                    time_limit_seconds: isChecked && !topicData.time_limit_seconds ? 30 : topicData.time_limit_seconds
                                });
                            }}
                        />
                        {t('pages.teacher.timedTest')}
                    </label>
                </div>
                
                {topicData.is_timed_test && (
                    <div className="teacher-form-group">
                        <label className="teacher-form-label">{t('pages.teacher.timeLimit')}</label>
                        <div style={{display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap'}}>
                            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'}}>
                                <label style={{fontSize: '12px', color: '#666'}}>Minutes</label>
                                <input
                                    type="number"
                                    className="teacher-form-input"
                                    value={getTimeDisplay().minutes}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '' || (!isNaN(value) && parseInt(value) >= 0 && parseInt(value) <= 29)) {
                                            handleTimeChange('minutes', value);
                                        }
                                    }}
                                    onBlur={(e) => {
                                        const value = parseInt(e.target.value) || 0;
                                        handleTimeChange('minutes', Math.max(0, Math.min(29, value)));
                                    }}
                                    style={{
                                        width: '80px',
                                        textAlign: 'center',
                                        padding: '8px 4px'
                                    }}
                                    min="0"
                                    max="29"
                                />
                            </div>
                            <span style={{fontSize: '20px', fontWeight: 'bold', marginTop: '20px'}}>:</span>
                            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'}}>
                                <label style={{fontSize: '12px', color: '#666'}}>Seconds</label>
                                <input
                                    type="number"
                                    className="teacher-form-input"
                                    value={getTimeDisplay().seconds}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '' || (!isNaN(value) && parseInt(value) >= 0 && parseInt(value) <= 59)) {
                                            handleTimeChange('seconds', value);
                                        }
                                    }}
                                    onBlur={(e) => {
                                        const value = parseInt(e.target.value) || 0;
                                        handleTimeChange('seconds', Math.max(0, Math.min(59, value)));
                                    }}
                                    style={{
                                        width: '80px',
                                        textAlign: 'center',
                                        padding: '8px 4px'
                                    }}
                                    min="0"
                                    max="59"
                                />
                            </div>
                            <div style={{fontSize: '12px', color: '#666', marginTop: '20px'}}>
                                (30s - 30min)
                            </div>
                        </div>
                    </div>
                )}

                <div className="teacher-questions-section">
                    <div className="teacher-questions-header">
                        <h5 className="teacher-questions-title">{t('pages.teacher.questions')}</h5>
                        <button
                            className="teacher-add-question-btn"
                            type="button"
                            onClick={handleAddQuestion}
                        >
                            + {t('pages.teacher.addQuestion')}
                        </button>
                    </div>

                    {topicData.questions && topicData.questions.length > 0 ? (
                        <div className="teacher-questions-list">
                            {topicData.questions.map((question, questionIndex) => (
                                <div key={question.id || questionIndex} className="teacher-question-item">
                                    <div className="teacher-question-header">
                                        <h6 className="teacher-question-title">{t('pages.teacher.question')} {questionIndex + 1}</h6>
                                        <button
                                            className="teacher-question-delete-btn"
                                            type="button"
                                            onClick={() => handleDeleteQuestion(questionIndex)}
                                        >
                                            {t('pages.teacher.delete')}
                                        </button>
                                    </div>

                                    <div className="teacher-form-group">
                                        <label className="teacher-form-label">{t('pages.teacher.questionText')}</label>
                                        <textarea
                                            className="teacher-form-textarea"
                                            value={question.text || ''}
                                            onChange={(e) => handleQuestionChange(questionIndex, 'text', e.target.value)}
                                            placeholder={t('pages.teacher.enterQuestionText')}
                                            rows={2}
                                        />
                                    </div>

                                    <div className="teacher-form-group">
                                        <label className="teacher-form-label">{t('pages.teacher.questionType')}</label>
                                        <select
                                            className="teacher-form-input"
                                            value={question.question_type || 'single_choice'}
                                            onChange={(e) => handleQuestionChange(questionIndex, 'question_type', e.target.value)}
                                        >
                                            <option value="single_choice">{t('pages.teacher.singleChoice')}</option>
                                            <option value="multiple_choice">{t('pages.teacher.multipleChoice')}</option>
                                        </select>
                                    </div>

                                    <div className="teacher-form-group">
                                        <label className="teacher-form-label">{t('pages.teacher.maxScore')}</label>
                                        <input
                                            type="number"
                                            className="teacher-form-input"
                                            value={question.max_score || 100}
                                            onChange={(e) => handleQuestionChange(questionIndex, 'max_score', parseInt(e.target.value) || 100)}
                                            min="1"
                                            max="100"
                                        />
                                    </div>

                                    <div className="teacher-options-section">
                                        <div className="teacher-options-header">
                                            <label className="teacher-form-label">{t('pages.teacher.options')}</label>
                                            <button
                                                className="teacher-add-option-btn"
                                                type="button"
                                                onClick={() => handleAddOption(questionIndex)}
                                            >
                                                + {t('pages.teacher.addOption')}
                                            </button>
                                        </div>

                                        {question.options && question.options.length > 0 ? (
                                            <div className="teacher-options-list">
                                                {question.options.map((option, optionIndex) => (
                                                    <div key={optionIndex} className="teacher-option-item">
                                                        <div className="teacher-option-content">
                                                            <input
                                                                type="text"
                                                                className="teacher-form-input"
                                                                value={option.text || ''}
                                                                onChange={(e) => handleOptionChange(questionIndex, optionIndex, 'text', e.target.value)}
                                                                placeholder={t('pages.teacher.optionText')}
                                                            />
                                                            <label className="teacher-form-checkbox-label">
                                                                <input
                                                                    type={question.question_type === 'single_choice' ? 'radio' : 'checkbox'}
                                                                    name={`question-${questionIndex}`}
                                                                    checked={option.is_correct || false}
                                                                    onChange={(e) => {
                                                                        if (question.question_type === 'single_choice') {
                                                                            question.options.forEach((opt, idx) => {
                                                                                if (idx !== optionIndex) {
                                                                                    handleOptionChange(questionIndex, idx, 'is_correct', false);
                                                                                }
                                                                            });
                                                                        }
                                                                        handleOptionChange(questionIndex, optionIndex, 'is_correct', e.target.checked);
                                                                    }}
                                                                />
                                                                {t('pages.teacher.correct')}
                                                            </label>
                                                            <button
                                                                className="teacher-option-delete-btn"
                                                                type="button"
                                                                onClick={() => handleDeleteOption(questionIndex, optionIndex)}
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="teacher-empty-text-small">{t('pages.teacher.noOptionsYet')}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="teacher-empty-text-small">{t('pages.teacher.noQuestionsYet')}</p>
                    )}
                </div>
            </div>
            
            <div className="teacher-course-edit-footer">
                <div className="teacher-course-edit-actions">
                    <button
                        className="teacher-save-btn"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? t('pages.teacher.saving') : t('pages.teacher.save')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TeacherTopicEditPage;
