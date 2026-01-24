import {useState, useEffect, useCallback} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {api} from '../../../shared/api';
import {useLanguage} from '../../../shared/lib/i18n/LanguageContext';
import '../styles/teacher.css';

function TeacherCourseEditPage({user}) {
    const {id} = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const {t} = useLanguage();
    
    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    
    const [courseData, setCourseData] = useState({
        title: '',
        slug: '',
        description: '',
        modules: [],
        image: null,
        image_url: null
    });
    

    const fetchCourse = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/api/teacher/courses/${id}/`);
            const data = response.data;
            if (data && data.modules) {
                // Ensure all modules and their nested data are properly structured
                data.modules = data.modules.map(module => ({
                    id: module.id,
                    title: String(module.title || ''),
                    order: typeof module.order === 'number' ? module.order : 0,
                    topics: (module.topics || []).map(topic => ({
                        id: topic.id,
                        title: String(topic.title || ''),
                        content: String(topic.content || ''),
                        order: typeof topic.order === 'number' ? topic.order : 0,
                        is_timed_test: Boolean(topic.is_timed_test),
                        time_limit_seconds: topic.time_limit_seconds || null,
                        questions: (topic.questions || []).map(q => ({
                            id: q.id,
                            text: String(q.text || ''),
                            order: typeof q.order === 'number' ? q.order : 0,
                            question_type: String(q.question_type || 'single_choice'),
                            max_score: typeof q.max_score === 'number' ? q.max_score : 100,
                            options: (q.options || []).map(opt => ({
                                id: opt.id,
                                text: String(opt.text || ''),
                                is_correct: Boolean(opt.is_correct)
                            }))
                        }))
                    }))
                }));
            }
            // Initialize image_url if available
            if (data && !data.image_url && data.image) {
                data.image_url = data.image;
            }
            setCourseData(data);
        } catch (err) {
            setError(err.response?.data?.detail || err.response?.data?.message || t('pages.teacher.failedToLoadCourse'));
        } finally {
            setLoading(false);
        }
    }, [id, t]);

    useEffect(() => {
        if (!user || user.role !== 'teacher') {
            navigate('/home', {replace: true});
            return;
        }

        if (isEditMode && id) {
            fetchCourse();
        }
    }, [id, user, navigate, isEditMode, fetchCourse]);

    // Helper functions to prepare data for API
    const prepareOption = (option) => {
        const optionData = {
            text: String(option.text || ''),
            is_correct: Boolean(option.is_correct)
        };
        // Only include id if option exists (has been saved)
        if (option.id) {
            optionData.id = option.id;
        }
        return optionData;
    };

    const prepareQuestion = (question, questionIndex) => {
        const questionData = {
            text: String(question.text || ''),
            order: typeof question.order === 'number' ? question.order : questionIndex,
            question_type: String(question.question_type || 'single_choice'),
            max_score: question.max_score ? parseInt(question.max_score) : 100,
            options: (question.options || []).map(prepareOption)
        };
        // Only include id if question exists (has been saved)
        if (question.id) {
            questionData.id = question.id;
        }
        return questionData;
    };

    const prepareTopic = (topic, topicIndex) => {
        // Ensure all values are serializable
        const topicData = {
            title: String(topic.title || ''),
            content: String(topic.content || ''),
            order: typeof topic.order === 'number' ? topic.order : topicIndex,
            is_timed_test: Boolean(topic.is_timed_test),
            time_limit_seconds: topic.is_timed_test && topic.time_limit_seconds 
                ? parseInt(topic.time_limit_seconds) 
                : null,
            questions: (topic.questions || []).map((q, idx) => prepareQuestion(q, idx))
        };
        // Only include id if topic exists (has been saved)
        if (topic.id) {
            topicData.id = topic.id;
        }
        return topicData;
    };

    const prepareModule = (module, moduleIndex) => {
        // Ensure all values are serializable
        const moduleData = {
            title: String(module.title || ''),
            order: typeof module.order === 'number' ? module.order : moduleIndex,
            topics: (module.topics || []).map((t, idx) => prepareTopic(t, idx))
        };
        // Only include id if module exists (has been saved)
        if (module.id) {
            moduleData.id = module.id;
        }
        return moduleData;
    };

    const prepareCourseData = () => {
        // Filter out empty modules (modules without title)
        const validModules = courseData.modules
            .filter(module => module.title && module.title.trim())
            .map(prepareModule);
        
        // Always stringify modules to prevent [object Object] issues
        const modulesJson = JSON.stringify(validModules);
        
        // Always use FormData to avoid JSON parsing issues with nested data
        // This ensures consistent handling on the backend
        const formData = new FormData();
        formData.append('title', courseData.title);
        formData.append('description', courseData.description || '');
        formData.append('modules', modulesJson);
        
        // Only append image if it's a new file
        if (courseData.image instanceof File) {
            formData.append('image', courseData.image);
        }
        
        return formData;
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        
        try {
            const dataToSend = prepareCourseData();
            // Always FormData now, so verify modules is a string
            const modulesValue = dataToSend.get('modules');
            if (modulesValue && typeof modulesValue !== 'string') {
                console.warn('Modules in FormData is not a string, fixing...', typeof modulesValue);
                dataToSend.set('modules', JSON.stringify(modulesValue));
            }
            
            // Don't set Content-Type header - axios will set it automatically with boundary
            const config = {};
            
            if (isEditMode) {
                await api.put(`/api/teacher/courses/${id}/`, dataToSend, config);
                // Reload course data to get IDs for newly created modules and topics
                await fetchCourse();
            } else {
                const res = await api.post('/api/teacher/courses/', dataToSend, config);
                navigate(`/teacher/courses/${res.data.id}/edit`);
                return;
            }
        } catch (err) {
            console.error('Save error:', err.response?.data);
            let errorMessage = t('pages.teacher.failedToSaveCourse');
            
            if (err.response?.status === 401) {
                errorMessage = t('pages.teacher.sessionExpired');
            } else if (err.response?.data) {
                if (typeof err.response.data === 'string') {
                    errorMessage = err.response.data;
                } else if (err.response.data.detail) {
                    errorMessage = err.response.data.detail;
                } else if (err.response.data.message) {
                    errorMessage = err.response.data.message;
                } else {
                    const errorObj = err.response.data;
                    if (typeof errorObj === 'object') {
                        const errorKeys = Object.keys(errorObj);
                        if (errorKeys.length > 0) {
                            const firstError = errorObj[errorKeys[0]];
                            if (Array.isArray(firstError) && firstError.length > 0) {
                                errorMessage = `${errorKeys[0]}: ${firstError[0]}`;
                            } else {
                                errorMessage = JSON.stringify(errorObj);
                            }
                        }
                    } else {
                        errorMessage = JSON.stringify(errorObj);
                    }
                }
            }
            setError(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
            return;
        }

        setSaving(true);
        try {
            await api.delete(`/api/teacher/courses/${id}/`);
            navigate('/teacher/courses');
        } catch (err) {
            setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to delete course.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate('/teacher/courses');
    };

    if (!user || user.role !== 'teacher') {
        return null;
    }

    if (loading) {
        return (
            <div className="page page-enter">
                <h1 className="page__title">{isEditMode ? 'Edit Course' : 'Create Course'}</h1>
                <p>Loading...</p>
            </div>
        );
    }

    const handleAddModule = () => {
        const maxOrder = courseData.modules.length > 0 
            ? Math.max(...courseData.modules.map(m => typeof m.order === 'number' ? m.order : 0))
            : -1;
        const newModuleIndex = courseData.modules.length;
        const newModule = {
            title: '',
            order: maxOrder + 1,
            topics: [],
            id: null
        };
        setCourseData({
            ...courseData,
            modules: [...courseData.modules, newModule]
        });
    };

    const handleModuleChange = (moduleIndex, field, value) => {
        const updatedModules = [...courseData.modules];
        updatedModules[moduleIndex] = {
            ...updatedModules[moduleIndex],
            [field]: value
        };
        setCourseData({
            ...courseData,
            modules: updatedModules
        });
    };

    const handleDeleteModule = (moduleIndex) => {
        const updatedModules = courseData.modules.filter((_, index) => index !== moduleIndex);
        setCourseData({
            ...courseData,
            modules: updatedModules
        });
    };

    const handleAddTopic = (moduleIndex) => {
        const module = courseData.modules[moduleIndex];
        const maxOrder = module.topics && module.topics.length > 0 
            ? Math.max(...module.topics.map(t => typeof t.order === 'number' ? t.order : 0))
            : -1;
        const newTopic = {
            title: '',
            content: '',
            order: maxOrder + 1,
            is_timed_test: false,
            time_limit_seconds: null,
            questions: [],
            id: null
        };
        const updatedModules = [...courseData.modules];
        updatedModules[moduleIndex] = {
            ...updatedModules[moduleIndex],
            topics: [...(updatedModules[moduleIndex].topics || []), newTopic]
        };
        setCourseData({
            ...courseData,
            modules: updatedModules
        });
    };

    const handleEditTopic = (moduleIndex, topicIndex) => {
        const module = courseData.modules[moduleIndex];
        const topic = module.topics[topicIndex];
        if (module.id && topic.id) {
            navigate(`/teacher/courses/${id}/modules/${module.id}/topics/${topic.id}/edit`);
        } else {
            setError(t('pages.teacher.saveModuleAndTopicFirst'));
        }
    };

    const handleDeleteTopic = (moduleIndex, topicIndex) => {
        const updatedModules = [...courseData.modules];
        updatedModules[moduleIndex].topics = updatedModules[moduleIndex].topics.filter(
            (_, index) => index !== topicIndex
        );
        setCourseData({
            ...courseData,
            modules: updatedModules
        });
    };

    const handleEditModule = (moduleIndex) => {
        const module = courseData.modules[moduleIndex];
        if (module?.id) {
            navigate(`/teacher/courses/${id}/modules/${module.id}/edit`);
        } else {
            setError(t('pages.teacher.saveCourseFirst'));
        }
    };

    const handleTopicChange = (moduleIndex, topicIndex, field, value) => {
        const updatedModules = [...courseData.modules];
        updatedModules[moduleIndex].topics[topicIndex] = {
            ...updatedModules[moduleIndex].topics[topicIndex],
            [field]: value
        };
        setCourseData({
            ...courseData,
            modules: updatedModules
        });
    };

    return (
        <div className="page page-enter">
            <div className="teacher-course-edit-top">
                <h1 className="teacher-course-edit-title">{isEditMode ? t('pages.teacher.editCourse') : t('pages.teacher.createCourseTitle')}</h1>
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
                    <label className="teacher-form-label">{t('pages.teacher.courseTitle')}</label>
                    <input
                        type="text"
                        className="teacher-form-input"
                        value={courseData.title}
                        onChange={(e) => setCourseData({...courseData, title: e.target.value})}
                        placeholder={t('pages.teacher.courseTitle')}
                    />
                </div>

                <div className="teacher-form-group">
                    <label className="teacher-form-label">{t('pages.teacher.description')}</label>
                    <textarea
                        className="teacher-form-textarea"
                        value={courseData.description}
                        onChange={(e) => setCourseData({...courseData, description: e.target.value})}
                        placeholder={t('pages.teacher.description')}
                        rows={8}
                    />
                </div>

                <div className="teacher-form-group">
                    <label className="teacher-form-label">{t('pages.teacher.courseImage')}</label>
                    <div className="teacher-file-input-wrapper">
                        <input
                            type="file"
                            accept="image/*"
                            id="course-image-input"
                            className="teacher-file-input"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setCourseData({...courseData, image: file});
                                }
                            }}
                        />
                        <label htmlFor="course-image-input" className="teacher-file-input-label">
                            {courseData.image instanceof File ? courseData.image.name : t('pages.teacher.chooseFile')}
                        </label>
                    </div>
                    {courseData.image_url && !(courseData.image instanceof File) && (
                        <div style={{marginTop: '8px'}}>
                            <img 
                                src={courseData.image_url} 
                                alt="Course preview" 
                                style={{maxWidth: '200px', maxHeight: '200px', objectFit: 'cover', border: '1px solid #ccc'}}
                            />
                        </div>
                    )}
                    {courseData.image instanceof File && (
                        <div style={{marginTop: '8px'}}>
                            <img 
                                src={URL.createObjectURL(courseData.image)} 
                                alt="Course preview" 
                                style={{maxWidth: '200px', maxHeight: '200px', objectFit: 'cover', border: '1px solid #ccc'}}
                            />
                        </div>
                    )}
                </div>

                <div className="teacher-course-modules">
                    <div className="teacher-modules-header">
                        <h2 className="teacher-modules-title">{t('pages.teacher.modules')}</h2>
                        <div className="teacher-modules-actions">
                            <button
                                className="teacher-add-module-btn"
                                type="button"
                                onClick={handleAddModule}
                            >
                                + {t('pages.teacher.addModule')}
                            </button>
                        </div>
                    </div>

                    {courseData.modules && courseData.modules.length > 0 ? (
                        <div className="teacher-modules-list">
                            {courseData.modules.map((module, moduleIndex) => (
                                <div key={module.id || moduleIndex} className="teacher-module-item">
                                    <div className="teacher-module-header">
                                        <input
                                            type="text"
                                            className="teacher-form-input teacher-module-title-input"
                                            value={module.title || ''}
                                            onChange={(e) => handleModuleChange(moduleIndex, 'title', e.target.value)}
                                            placeholder={`Module ${moduleIndex + 1}`}
                                        />
                                        <div style={{display: 'flex', gap: '8px'}}>
                                            <button
                                                className="teacher-module-edit-btn"
                                                type="button"
                                                onClick={() => handleEditModule(moduleIndex)}
                                                disabled={!module.id}
                                                title={!module.id ? t('pages.teacher.saveCourseFirst') : ''}
                                            >
                                                {t('pages.teacher.edit')}
                                            </button>
                                            <button
                                                className="teacher-module-delete-btn"
                                                type="button"
                                                onClick={() => handleDeleteModule(moduleIndex)}
                                            >
                                                {t('pages.teacher.delete')}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="teacher-topics-section">
                                        <div className="teacher-topics-header">
                                            <h4 className="teacher-topics-title">{t('pages.teacher.topics')}</h4>
                                            <button
                                                className="teacher-add-topic-btn"
                                                type="button"
                                                onClick={() => handleAddTopic(moduleIndex)}
                                            >
                                                + {t('pages.teacher.addTopic')}
                                            </button>
                                        </div>
                                        
                                        {module.topics && module.topics.length > 0 ? (
                                            <div className="teacher-topics-list">
                                                {module.topics.map((topic, topicIndex) => (
                                                    <div key={topic.id || topicIndex} className="teacher-topic-item">
                                                        <div className="teacher-topic-header">
                                                            <input
                                                                type="text"
                                                                className="teacher-form-input teacher-topic-title-input"
                                                                value={topic.title || ''}
                                                                onChange={(e) => handleTopicChange(moduleIndex, topicIndex, 'title', e.target.value)}
                                                                placeholder={`Topic ${topicIndex + 1}`}
                                                                style={{flex: 1, marginRight: '8px'}}
                                                            />
                                                            <div style={{display: 'flex', gap: '8px'}}>
                                                                <button
                                                                    className="teacher-topic-edit-btn"
                                                                    type="button"
                                                                    onClick={() => handleEditTopic(moduleIndex, topicIndex)}
                                                                    disabled={!module.id || !topic.id}
                                                                    title={(!module.id || !topic.id) ? t('pages.teacher.saveCourseFirst') : ''}
                                                                >
                                                                    {t('pages.teacher.edit')}
                                                                </button>
                                                                <button
                                                                    className="teacher-topic-delete-btn"
                                                                    type="button"
                                                                    onClick={() => handleDeleteTopic(moduleIndex, topicIndex)}
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
                            ))}
                        </div>
                    ) : (
                        <p className="teacher-empty-text">{t('pages.teacher.noModulesYet')}</p>
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
                    {isEditMode && (
                        <button
                            className="teacher-delete-btn"
                            onClick={handleDelete}
                            disabled={saving}
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TeacherCourseEditPage;
