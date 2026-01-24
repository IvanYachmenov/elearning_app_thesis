import {useState, useEffect, useCallback} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {api} from '../../../shared/api';
import '../styles/teacher.css';

function TeacherCourseEditPage({user}) {
    const {id} = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
    
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
                data.modules = data.modules.map(module => ({
                    ...module,
                    topics: (module.topics || []).map(topic => ({
                        ...topic,
                        questions: topic.questions || []
                    }))
                }));
            }
            // Initialize image_url if available
            if (data && !data.image_url && data.image) {
                data.image_url = data.image;
            }
            setCourseData(data);
        } catch (err) {
            setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to load course.');
        } finally {
            setLoading(false);
        }
    }, [id]);

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

    const prepareTopic = (topic, topicIndex) => ({
        ...(topic.id && { id: topic.id }),
        title: topic.title || '',
        content: topic.content || '',
        order: typeof topic.order === 'number' ? topic.order : topicIndex,
        is_timed_test: Boolean(topic.is_timed_test),
        time_limit_seconds: topic.is_timed_test && topic.time_limit_seconds 
            ? parseInt(topic.time_limit_seconds) 
            : null,
        questions: (topic.questions || []).map((q, idx) => prepareQuestion(q, idx))
    });

    const prepareModule = (module, moduleIndex) => ({
        ...(module.id && { id: module.id }),
        title: module.title || '',
        order: typeof module.order === 'number' ? module.order : moduleIndex,
        topics: (module.topics || []).map((t, idx) => prepareTopic(t, idx))
    });

    const prepareCourseData = () => {
        const data = {
            title: courseData.title,
            description: courseData.description || '',
            modules: courseData.modules.map(prepareModule)
        };
        
        // If there's an image file, use FormData, otherwise use JSON
        if (courseData.image instanceof File) {
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('description', data.description);
            formData.append('modules', JSON.stringify(data.modules));
            formData.append('image', courseData.image);
            return formData;
        }
        
        return data;
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        
        try {
            const dataToSend = prepareCourseData();
            const config = dataToSend instanceof FormData 
                ? { headers: { 'Content-Type': 'multipart/form-data' } }
                : {};
            
            if (isEditMode) {
                await api.put(`/api/teacher/courses/${id}/`, dataToSend, config);
            } else {
                await api.post('/api/teacher/courses/', dataToSend, config);
            }
            navigate('/teacher/courses');
        } catch (err) {
            console.error('Save error:', err.response?.data);
            let errorMessage = 'Failed to save course.';
            
            if (err.response?.status === 401) {
                errorMessage = 'Your session has expired. Please refresh the page and log in again.';
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

    const toggleModule = (moduleIndex) => {
        setExpandedModules(prev => ({
            ...prev,
            [moduleIndex]: !prev[moduleIndex]
        }));
    };

    const toggleTopic = (moduleIndex, topicIndex) => {
        const key = `${moduleIndex}-${topicIndex}`;
        setExpandedTopics(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

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
        setExpandedModules(prev => ({
            ...prev,
            [newModuleIndex]: true
        }));
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
        if (module.id) {
            navigate(`/teacher/courses/${id}/modules/${module.id}/topics/new`);
        } else {
            setError('Please save the module first before adding topics');
        }
    };

    const handleEditTopic = (moduleIndex, topicIndex) => {
        const module = courseData.modules[moduleIndex];
        const topic = module.topics[topicIndex];
        if (module.id && topic.id) {
            navigate(`/teacher/courses/${id}/modules/${module.id}/topics/${topic.id}/edit`);
        } else {
            setError('Please save the module and topic first');
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

    return (
        <div className="page page-enter">
            <div className="teacher-course-edit-top">
                <h1 className="teacher-course-edit-title">{isEditMode ? 'Edit Course' : 'Create Course'}</h1>
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
                    <label className="teacher-form-label">Course Title</label>
                    <input
                        type="text"
                        className="teacher-form-input"
                        value={courseData.title}
                        onChange={(e) => setCourseData({...courseData, title: e.target.value})}
                        placeholder="Enter course title"
                    />
                </div>

                <div className="teacher-form-group">
                    <label className="teacher-form-label">Description</label>
                    <textarea
                        className="teacher-form-textarea"
                        value={courseData.description}
                        onChange={(e) => setCourseData({...courseData, description: e.target.value})}
                        placeholder="Enter course description"
                        rows={8}
                    />
                </div>

                <div className="teacher-form-group">
                    <label className="teacher-form-label">Course Image</label>
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
                            {courseData.image instanceof File ? courseData.image.name : 'Choose file'}
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
                        <h2 className="teacher-modules-title">Modules</h2>
                        <button
                            className="teacher-add-module-btn"
                            type="button"
                            onClick={handleAddModule}
                        >
                            + Add Module
                        </button>
                    </div>

                    {courseData.modules && courseData.modules.length > 0 ? (
                        <div className="teacher-modules-list">
                            {courseData.modules.map((module, moduleIndex) => (
                                <div key={module.id || moduleIndex} className="teacher-module-item">
                                    <div className="teacher-module-header">
                                        <h3 className="teacher-module-title">
                                            {module.title || `Module ${moduleIndex + 1}`}
                                        </h3>
                                        <div style={{display: 'flex', gap: '8px'}}>
                                            <button
                                                className="teacher-module-edit-btn"
                                                type="button"
                                                onClick={() => handleEditModule(moduleIndex)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="teacher-module-delete-btn"
                                                type="button"
                                                onClick={() => handleDeleteModule(moduleIndex)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="teacher-topics-section">
                                        <div className="teacher-topics-header">
                                            <h4 className="teacher-topics-title">Topics</h4>
                                            <button
                                                className="teacher-add-topic-btn"
                                                type="button"
                                                onClick={() => handleAddTopic(moduleIndex)}
                                                disabled={!module.id}
                                            >
                                                + Add Topic
                                            </button>
                                        </div>
                                        
                                        {module.topics && module.topics.length > 0 ? (
                                            <div className="teacher-topics-list">
                                                {module.topics.map((topic, topicIndex) => (
                                                    <div key={topic.id || topicIndex} className="teacher-topic-item">
                                                        <div className="teacher-topic-header">
                                                            <h5 className="teacher-topic-title">
                                                                {topic.title || `Topic ${topicIndex + 1}`}
                                                            </h5>
                                                            <div style={{display: 'flex', gap: '8px'}}>
                                                                <button
                                                                    className="teacher-topic-edit-btn"
                                                                    type="button"
                                                                    onClick={() => handleEditTopic(moduleIndex, topicIndex)}
                                                                    disabled={!module.id || !topic.id}
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    className="teacher-topic-delete-btn"
                                                                    type="button"
                                                                    onClick={() => handleDeleteTopic(moduleIndex, topicIndex)}
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="teacher-empty-text">No topics yet. Click "Add Topic" to create one.</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="teacher-empty-text">No modules yet. Click "Add Module" to create one.</p>
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
