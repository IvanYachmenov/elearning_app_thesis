import {useState, useEffect, useLayoutEffect, useCallback, useRef} from 'react';
import {createPortal} from 'react-dom';
import {useNavigate} from 'react-router-dom';
import {api} from '../../../shared/api';
import {useLanguage} from '../../../shared/lib/i18n/LanguageContext';
import '../styles/teacher.css';

const CARD_HEIGHT = 300;
const IMAGE_HEIGHT = 160;

function TeacherCoursesPage({user}) {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [cardPosition, setCardPosition] = useState(null);
    const [deleteModalCourseId, setDeleteModalCourseId] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const cardRef = useRef(null);
    const navigate = useNavigate();
    const {t} = useLanguage();

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/api/teacher/courses/');
            let coursesData = response.data;
            if (coursesData?.results && Array.isArray(coursesData.results)) {
                coursesData = coursesData.results;
            } else if (!Array.isArray(coursesData)) {
                coursesData = [];
            }
            setCourses(coursesData);
        } catch (err) {
            setError(err.response?.data?.detail || err.response?.data?.message || t('pages.teacher.loadFailed'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        if (!user || user.role !== 'teacher') {
            navigate('/home', {replace: true});
            return;
        }
        fetchCourses();
    }, [user, navigate, fetchCourses]);

    useLayoutEffect(() => {
        if (!openDropdownId || !cardRef.current) {
            setCardPosition(null);
            return;
        }
        const measure = () => {
            const rect = cardRef.current.getBoundingClientRect();
            setCardPosition({
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height
            });
        };
        measure();
        const obs = new ResizeObserver(measure);
        obs.observe(cardRef.current);
        window.addEventListener('scroll', measure, true);
        window.addEventListener('resize', measure);
        return () => {
            obs.disconnect();
            window.removeEventListener('scroll', measure, true);
            window.removeEventListener('resize', measure);
            setCardPosition(null);
        };
    }, [openDropdownId]);

    useEffect(() => {
        if (openDropdownId) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = prev;
            };
        }
    }, [openDropdownId]);

    const handleCreateCourse = () => {
        navigate('/teacher/courses/new');
    };

    const handleCardClick = (courseId) => {
        setOpenDropdownId(courseId);
    };

    const handleCloseDropdown = () => {
        setOpenDropdownId(null);
    };

    const handleEditCourse = (courseId) => {
        setOpenDropdownId(null);
        navigate(`/teacher/courses/${courseId}/edit`);
    };

    const handleDeleteClick = (courseId) => {
        setOpenDropdownId(null);
        setDeleteModalCourseId(courseId);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModalCourseId) return;
        setDeleting(true);
        try {
            await api.delete(`/api/teacher/courses/${deleteModalCourseId}/`);
            setCourses((prev) => prev.filter((c) => c.id !== deleteModalCourseId));
            setDeleteModalCourseId(null);
        } catch (err) {
            setError(err.response?.data?.detail || err.response?.data?.message || t('pages.teacher.deleteFailed'));
        } finally {
            setDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteModalCourseId(null);
    };

    const openCourse = openDropdownId ? courses.find((c) => c.id === openDropdownId) : null;

    if (!user || user.role !== 'teacher') {
        return null;
    }

    if (loading) {
        return (
            <div className="page page-enter">
                <h1 className="page__title">{t('pages.teacher.title')}</h1>
                <p>{t('pages.teacher.loading')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page page-enter">
                <h1 className="page__title">{t('pages.teacher.title')}</h1>
                <p className="teacher-error-inline">{error}</p>
            </div>
        );
    }

    const dropdownPortal =
        openCourse &&
        createPortal(
            <>
                <div className="teacher-dropdown-backdrop" aria-hidden="true" />
                {cardPosition && (
                    <div
                        className="teacher-dropdown-floating"
                        style={{
                            top: cardPosition.top,
                            left: cardPosition.left,
                            width: cardPosition.width,
                            height: cardPosition.height * 2 + 2
                        }}
                    >
                        <div
                            className="teacher-course-card teacher-course-card--floating"
                            style={{
                                '--teacher-card-height': `${cardPosition.height}px`,
                                '--teacher-image-height': `${IMAGE_HEIGHT}px`
                            }}
                        >
                            <div className="teacher-course-card__image-wrap">
                                {openCourse.image_url ? (
                                    <img
                                        src={openCourse.image_url}
                                        alt=""
                                        className="teacher-course-card__image"
                                    />
                                ) : null}
                            </div>
                            <div className="teacher-course-card__body">
                                <h3 className="teacher-course-card__title">{openCourse.title}</h3>
                                <div className="teacher-course-card__meta">
                                    <span>
                                        Modules: {openCourse.modules?.length || 0}
                                    </span>
                                    <span>•</span>
                                    <span>
                                        Topics:{' '}
                                        {openCourse.modules?.reduce(
                                            (sum, m) => sum + (m.topics?.length || 0),
                                            0
                                        ) || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div
                            className="teacher-dropdown-modal teacher-dropdown-modal--under-card"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="teacher-dropdown-title"
                            style={{
                                width: cardPosition.width,
                                height: cardPosition.height
                            }}
                        >
                            <div className="teacher-dropdown-modal__header">
                                <h2 id="teacher-dropdown-title" className="teacher-dropdown-modal__title">
                                    {openCourse.title}
                                </h2>
                            </div>
                            <div className="teacher-dropdown-modal__options">
                                <button
                                    type="button"
                                    className="teacher-dropdown-modal__opt"
                                    onClick={() => handleEditCourse(openCourse.id)}
                                >
                                    {t('pages.teacher.edit')}
                                </button>
                                <button
                                    type="button"
                                    className="teacher-dropdown-modal__opt teacher-dropdown-modal__opt--delete"
                                    onClick={() => handleDeleteClick(openCourse.id)}
                                >
                                    {t('pages.teacher.delete')}
                                </button>
                                <button
                                    type="button"
                                    className="teacher-dropdown-modal__opt teacher-dropdown-modal__opt--close"
                                    onClick={handleCloseDropdown}
                                >
                                    {t('pages.teacher.close')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>,
            document.body
        );

    return (
        <div className="page page-enter">
            <div className="teacher-courses-header">
                <h1 className="page__title">{t('pages.teacher.title')}</h1>
                <button className="teacher-create-btn" onClick={handleCreateCourse}>
                    + {t('pages.teacher.createCourse')}
                </button>
            </div>

            {courses.length === 0 ? (
                <div className="teacher-empty">
                    <p>{t('pages.teacher.noCourses')}</p>
                    <button className="teacher-create-btn" onClick={handleCreateCourse}>
                        {t('pages.teacher.createFirst')}
                    </button>
                </div>
            ) : (
                <div className="teacher-courses-grid-wrapper">
                    <div className="teacher-courses-grid">
                        {courses.map((course) => {
                            const isOpen = openDropdownId === course.id;
                            const topicsCount =
                                course.modules?.reduce((sum, m) => sum + (m.topics?.length || 0), 0) || 0;
                            const modulesCount = course.modules?.length || 0;
                            return (
                                <div
                                    key={course.id}
                                    ref={isOpen ? cardRef : null}
                                    className="teacher-course-card teacher-course-card--clickable"
                                    style={{
                                        '--teacher-card-height': `${CARD_HEIGHT}px`,
                                        '--teacher-image-height': `${IMAGE_HEIGHT}px`
                                    }}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => handleCardClick(course.id)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleCardClick(course.id);
                                        }
                                    }}
                                >
                                    <div className="teacher-course-card__image-wrap">
                                        {course.image_url ? (
                                            <img
                                                src={course.image_url}
                                                alt=""
                                                className="teacher-course-card__image"
                                            />
                                        ) : null}
                                    </div>
                                    <div className="teacher-course-card__body">
                                        <h3 className="teacher-course-card__title">{course.title}</h3>
                                        <div className="teacher-course-card__meta">
                                            <span>Modules: {modulesCount}</span>
                                            <span>•</span>
                                            <span>Topics: {topicsCount}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {dropdownPortal}

            {deleteModalCourseId && (
                <div
                    className="teacher-delete-modal-overlay"
                    onClick={handleDeleteCancel}
                    role="presentation"
                >
                    <div
                        className="teacher-delete-modal"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="teacher-delete-modal-title"
                    >
                        <h3 id="teacher-delete-modal-title" className="teacher-delete-modal__title">
                            {t('pages.teacher.deleteConfirm')}
                        </h3>
                        <div className="teacher-delete-modal__actions">
                            <button
                                type="button"
                                className="teacher-delete-modal__btn teacher-delete-modal__btn--cancel"
                                onClick={handleDeleteCancel}
                                disabled={deleting}
                            >
                                {t('pages.teacher.deleteCancel')}
                            </button>
                            <button
                                type="button"
                                className="teacher-delete-modal__btn teacher-delete-modal__btn--confirm"
                                onClick={handleDeleteConfirm}
                                disabled={deleting}
                            >
                                {deleting ? '…' : t('pages.teacher.delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TeacherCoursesPage;
