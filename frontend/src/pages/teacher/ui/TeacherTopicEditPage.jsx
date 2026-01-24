import {useState, useEffect, useCallback} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {api} from '../../../shared/api';
import '../styles/teacher.css';

function TeacherTopicEditPage({user}) {
    const {courseId, moduleId, topicId} = useParams();
    const isEditMode = !!topicId;
    const navigate = useNavigate();
    
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
            setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to load topic.');
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

    const prepareTopicData = () => ({
        title: topicData.title,
        content: topicData.content || '',
        order: topicData.order,
        module: parseInt(moduleId),
        is_timed_test: Boolean(topicData.is_timed_test),
        time_limit_seconds: topicData.is_timed_test && topicData.time_limit_seconds 
            ? parseInt(topicData.time_limit_seconds) 
            : null,
        questions: topicData.questions.map((q, idx) => prepareQuestion(q, idx))
    });

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
            let errorMessage = 'Failed to save topic.';
            
            if (err.response?.status === 401) {
                errorMessage = 'Your session has expired. Please refresh the page and log in again.';
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
                <h1 className="page__title">{isEditMode ? 'Edit Topic' : 'Create Topic'}</h1>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="page page-enter">
            <div className="teacher-course-edit-top">
                <h1 className="teacher-course-edit-title">{isEditMode ? 'Edit Topic' : 'Create Topic'}</h1>
                <div className="teacher-course-edit-back">
                    <button
                        className="btn-primary"
                        onClick={handleCancel}
                        disabled={saving}
                    >
                        ← Back
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
                    <label className="teacher-form-label">Topic Title <span style={{color: 'red'}}>*</span></label>
                    <input
                        type="text"
                        className="teacher-form-input"
                        value={topicData.title}
                        onChange={(e) => setTopicData({...topicData, title: e.target.value})}
                        placeholder="Enter topic title"
                        required
                    />
                </div>
                
                <div className="teacher-form-group">
                    <label className="teacher-form-label">Theory Text</label>
                    <textarea
                        className="teacher-form-textarea"
                        value={topicData.content || ''}
                        onChange={(e) => setTopicData({...topicData, content: e.target.value})}
                        placeholder="Enter theory content for this topic"
                        rows={8}
                    />
                </div>
                
                <div className="teacher-form-group">
                    <label className="teacher-form-checkbox-label">
                        <input
                            type="checkbox"
                            checked={topicData.is_timed_test || false}
                            onChange={(e) => setTopicData({...topicData, is_timed_test: e.target.checked})}
                        />
                        Timed test
                    </label>
                </div>
                
                {topicData.is_timed_test && (
                    <div className="teacher-form-group">
                        <label className="teacher-form-label">Time Limit (seconds)</label>
                        <input
                            type="number"
                            className="teacher-form-input"
                            value={topicData.time_limit_seconds || ''}
                            onChange={(e) => setTopicData({...topicData, time_limit_seconds: parseInt(e.target.value) || null})}
                            placeholder="Enter time limit in seconds"
                            min="120"
                        />
                    </div>
                )}

                <div className="teacher-questions-section">
                    <div className="teacher-questions-header">
                        <h5 className="teacher-questions-title">Questions</h5>
                        <button
                            className="teacher-add-question-btn"
                            type="button"
                            onClick={handleAddQuestion}
                        >
                            + Add Question
                        </button>
                    </div>

                    {topicData.questions && topicData.questions.length > 0 ? (
                        <div className="teacher-questions-list">
                            {topicData.questions.map((question, questionIndex) => (
                                <div key={question.id || questionIndex} className="teacher-question-item">
                                    <div className="teacher-question-header">
                                        <h6 className="teacher-question-title">Question {questionIndex + 1}</h6>
                                        <button
                                            className="teacher-question-delete-btn"
                                            type="button"
                                            onClick={() => handleDeleteQuestion(questionIndex)}
                                        >
                                            Delete
                                        </button>
                                    </div>

                                    <div className="teacher-form-group">
                                        <label className="teacher-form-label">Question Text</label>
                                        <textarea
                                            className="teacher-form-textarea"
                                            value={question.text || ''}
                                            onChange={(e) => handleQuestionChange(questionIndex, 'text', e.target.value)}
                                            placeholder="Enter question text"
                                            rows={2}
                                        />
                                    </div>

                                    <div className="teacher-form-group">
                                        <label className="teacher-form-label">Question Type</label>
                                        <select
                                            className="teacher-form-input"
                                            value={question.question_type || 'single_choice'}
                                            onChange={(e) => handleQuestionChange(questionIndex, 'question_type', e.target.value)}
                                        >
                                            <option value="single_choice">Single Choice</option>
                                            <option value="multiple_choice">Multiple Choice</option>
                                        </select>
                                    </div>

                                    <div className="teacher-form-group">
                                        <label className="teacher-form-label">Max Score</label>
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
                                            <label className="teacher-form-label">Options</label>
                                            <button
                                                className="teacher-add-option-btn"
                                                type="button"
                                                onClick={() => handleAddOption(questionIndex)}
                                            >
                                                + Add Option
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
                                                                placeholder="Option text"
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
                                                                Correct
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
                                            <p className="teacher-empty-text-small">No options yet. Add at least 2 options.</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="teacher-empty-text-small">No questions yet. Click "Add Question" to create one.</p>
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
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TeacherTopicEditPage;
