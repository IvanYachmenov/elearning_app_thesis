import {useState, useEffect, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {api} from '../../../shared/api';
import '../styles/teacher.css';

function TeacherCoursesPage({user}) {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/api/teacher/courses/');
            
            let coursesData = response.data;
            
            if (coursesData && coursesData.results && Array.isArray(coursesData.results)) {
                coursesData = coursesData.results;
            } else if (!Array.isArray(coursesData)) {
                coursesData = [];
            }
            
            setCourses(coursesData);
        } catch (err) {
            setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to load your courses. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!user || user.role !== 'teacher') {
            navigate('/home', {replace: true});
            return;
        }
        fetchCourses();
    }, [user, navigate, fetchCourses]);

    const handleCreateCourse = () => {
        navigate('/teacher/courses/new');
    };

    const handleEditCourse = (courseId) => {
        navigate(`/teacher/courses/${courseId}/edit`);
    };

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
            return;
        }

        try {
            await api.delete(`/api/teacher/courses/${courseId}/`);
            setCourses(courses.filter(c => c.id !== courseId));
        } catch (err) {
            alert('Failed to delete course. Please try again.');
        }
    };

    if (!user || user.role !== 'teacher') {
        return null;
    }

    if (loading) {
        return (
            <div className="page page-enter">
                <h1 className="page__title">My Courses</h1>
                <p>Loading your courses...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page page-enter">
                <h1 className="page__title">My Courses</h1>
                <p style={{color: '#dc2626'}}>{error}</p>
            </div>
        );
    }

    return (
        <div className="page page-enter">
            <div className="teacher-courses-header">
                <h1 className="page__title">My Courses</h1>
                <button
                    className="teacher-create-btn"
                    onClick={handleCreateCourse}
                >
                    + Create New Course
                </button>
            </div>

            {courses.length === 0 ? (
                <div className="teacher-empty">
                    <p>You haven't created any courses yet.</p>
                    <button
                        className="teacher-create-btn"
                        onClick={handleCreateCourse}
                    >
                        Create Your First Course
                    </button>
                </div>
            ) : (
                <div className="teacher-courses-grid">
                    {courses.map((course) => (
                        <div
                            key={course.id}
                            className="teacher-course-card teacher-course-card--clickable"
                            role="button"
                            tabIndex={0}
                            onClick={() => handleEditCourse(course.id)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleEditCourse(course.id);
                                }
                            }}
                        >
                            <div className="teacher-course-card__header">
                                <h3 className="teacher-course-card__title">{course.title}</h3>
                                <div className="teacher-course-card__actions">
                                    <button
                                        className="teacher-course-card__delete"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleDeleteCourse(course.id);
                                        }}
                                        title="Delete course"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            <div className="teacher-course-card__meta">
                                <span>Modules: {course.modules?.length || 0}</span>
                                <span>•</span>
                                <span>Topics: {course.modules?.reduce((sum, m) => sum + (m.topics?.length || 0), 0) || 0}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default TeacherCoursesPage;
