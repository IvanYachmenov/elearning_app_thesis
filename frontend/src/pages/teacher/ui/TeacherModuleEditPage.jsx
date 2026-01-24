import {useState, useEffect, useCallback} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {api} from '../../../shared/api';
import {useLanguage} from '../../../shared/lib/i18n/LanguageContext';
import '../styles/teacher.css';

function TeacherModuleEditPage({user}) {
    const {courseId, moduleId} = useParams();
    const isEditMode = !!moduleId;
    const navigate = useNavigate();
    const {t} = useLanguage();
    
    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    
    const [moduleData, setModuleData] = useState({
        title: '',
        order: 0,
        topics: []
    });

    const fetchModule = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/api/teacher/modules/${moduleId}/`);
            const data = response.data;
            if (data && data.topics) {
                data.topics = (data.topics || []).map(topic => ({
                    ...topic,
                    questions: topic.questions || []
                }));
            }
            setModuleData(data);
        } catch (err) {
            setError(err.response?.data?.detail || err.response?.data?.message || t('pages.teacher.failedToLoadModule'));
        } finally {
            setLoading(false);
        }
    }, [moduleId]);

    useEffect(() => {
        if (!user || user.role !== 'teacher') {
            navigate('/home', {replace: true});
            return;
        }

        if (isEditMode && moduleId) {
            fetchModule();
        } else if (courseId) {
            // For new module, fetch course to get max order
            api.get(`/api/teacher/courses/${courseId}/`)
                .then(response => {
                    const course = response.data;
                    const maxOrder = course.modules && course.modules.length > 0
                        ? Math.max(...course.modules.map(m => typeof m.order === 'number' ? m.order : 0))
                        : -1;
                    setModuleData(prev => ({
                        ...prev,
                        order: maxOrder + 1
                    }));
                })
                .catch(err => {
                    console.error('Failed to fetch course:', err);
                });
        }
    }, [moduleId, courseId, user, navigate, isEditMode, fetchModule]);

    const prepareTopic = (topic, topicIndex) => ({
        ...(topic.id && { id: topic.id }),
        title: topic.title || '',
        content: topic.content || '',
        order: typeof topic.order === 'number' ? topic.order : topicIndex,
        is_timed_test: Boolean(topic.is_timed_test),
        time_limit_seconds: topic.is_timed_test && topic.time_limit_seconds 
            ? parseInt(topic.time_limit_seconds) 
            : null,
        questions: (topic.questions || []).map((q, idx) => ({
            ...(q.id && { id: q.id }),
            text: q.text || '',
            order: typeof q.order === 'number' ? q.order : idx,
            question_type: q.question_type || 'single_choice',
            max_score: q.max_score ? parseInt(q.max_score) : 100,
            options: (q.options || []).map(opt => ({
                ...(opt.id && { id: opt.id }),
                text: opt.text || '',
                is_correct: Boolean(opt.is_correct)
            }))
        }))
    });

    const prepareModuleData = () => ({
        title: moduleData.title,
        order: moduleData.order,
        course: parseInt(courseId),
        topics: moduleData.topics.map(prepareTopic)
    });

    const handleSave = async () => {
        if (!moduleData.title.trim()) {
            setError('Module title is required');
            return;
        }

        setSaving(true);
        setError(null);
        
        try {
            const dataToSend = prepareModuleData();
            
            if (isEditMode) {
                await api.put(`/api/teacher/modules/${moduleId}/`, dataToSend);
                navigate(`/teacher/courses/${courseId}/edit`);
            } else {
                const res = await api.post('/api/teacher/modules/', dataToSend);
                navigate(`/teacher/courses/${courseId}/modules/${res.data.id}/edit`);
            }
        } catch (err) {
            console.error('Save error:', err.response?.data);
            let errorMessage = t('pages.teacher.failedToSaveModule');
            
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

    const handleAddTopic = () => {
        if (moduleId && moduleId !== 'new') {
            navigate(`/teacher/courses/${courseId}/modules/${moduleId}/topics/new`);
        } else {
            setError('Please save the module first before adding topics.');
        }
    };

    const handleEditTopic = (topicIndex) => {
        const topic = moduleData.topics[topicIndex];
        if (moduleId && moduleId !== 'new' && topic?.id) {
            navigate(`/teacher/courses/${courseId}/modules/${moduleId}/topics/${topic.id}/edit`);
        } else {
            setError(t('pages.teacher.saveModuleAndTopicFirst'));
        }
    };

    const handleDeleteTopic = async (topicIndex) => {
        const topic = moduleData.topics[topicIndex];
        if (!topic.id) {
            // If topic is not saved, just remove from local state
            const updatedTopics = moduleData.topics.filter((_, index) => index !== topicIndex);
            setModuleData({
                ...moduleData,
                topics: updatedTopics
            });
            return;
        }

        if (!window.confirm(t('pages.teacher.deleteTopicConfirm'))) {
            return;
        }

        try {
            await api.delete(`/api/teacher/topics/${topic.id}/`);
            const updatedTopics = moduleData.topics.filter((_, index) => index !== topicIndex);
            setModuleData({
                ...moduleData,
                topics: updatedTopics
            });
        } catch (err) {
            setError(err.response?.data?.detail || err.response?.data?.message || t('pages.teacher.failedToDeleteTopic'));
        }
    };

    if (!user || user.role !== 'teacher') {
        return null;
    }

    if (loading) {
        return (
            <div className="page page-enter">
                <h1 className="page__title">{isEditMode ? t('pages.teacher.editModule') : t('pages.teacher.createModule')}</h1>
                <p>{t('pages.teacher.loadingGeneric')}</p>
            </div>
        );
    }

    return (
        <div className="page page-enter">
            <div className="teacher-course-edit-top">
                <h1 className="teacher-course-edit-title">{isEditMode ? t('pages.teacher.editModule') : t('pages.teacher.createModule')}</h1>
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
                    <label className="teacher-form-label">{t('pages.teacher.moduleTitle')} <span style={{color: 'red'}}>*</span></label>
                    <input
                        type="text"
                        className="teacher-form-input"
                        value={moduleData.title}
                        onChange={(e) => setModuleData({...moduleData, title: e.target.value})}
                        placeholder={t('pages.teacher.enterModuleTitle')}
                        required
                    />
                </div>

                <div className="teacher-topics-section">
                    <div className="teacher-topics-header">
                        <h4 className="teacher-topics-title">{t('pages.teacher.topics')}</h4>
                                        <button
                                            className="teacher-add-topic-btn"
                                            type="button"
                                            onClick={handleAddTopic}
                                            disabled={!moduleId || moduleId === 'new'}
                                            title={(!moduleId || moduleId === 'new') ? t('pages.teacher.saveModuleFirst') : ''}
                                        >
                                            + {t('pages.teacher.addTopic')}
                                        </button>
                    </div>
                    
                    {moduleData.topics && moduleData.topics.length > 0 ? (
                        <div className="teacher-topics-list">
                            {moduleData.topics.map((topic, topicIndex) => (
                                <div key={topic.id || topicIndex} className="teacher-topic-item">
                                    <div className="teacher-topic-header">
                                        <h5 className="teacher-topic-title">
                                            {topic.title || `Topic ${topicIndex + 1}`}
                                        </h5>
                                        <div style={{display: 'flex', gap: '8px'}}>
                                            <button
                                                className="teacher-topic-edit-btn"
                                                type="button"
                                                onClick={() => handleEditTopic(topicIndex)}
                                                disabled={!moduleId || moduleId === 'new' || !topic.id}
                                                title={(!moduleId || moduleId === 'new' || !topic.id) ? t('pages.teacher.saveModuleFirst') : ''}
                                            >
                                                {t('pages.teacher.edit')}
                                            </button>
                                            <button
                                                className="teacher-topic-delete-btn"
                                                type="button"
                                                onClick={() => handleDeleteTopic(topicIndex)}
                                            >
                                                {t('pages.teacher.delete')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="teacher-empty-text">{t('pages.teacher.noTopicsYet')}</p>
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

export default TeacherModuleEditPage;
