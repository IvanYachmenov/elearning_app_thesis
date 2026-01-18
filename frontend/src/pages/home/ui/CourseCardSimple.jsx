import './CourseCardSimple.css';

function CourseCardSimple({ course }) {
    return (
        <div className="course-card-simple">
            <div className="course-card-simple__image">
                {course.image_url ? (
                    <img src={course.image_url} alt={course.title} />
                ) : (
                    <div className="course-card-simple__image-placeholder">
                        🐍
                    </div>
                )}
            </div>
            <h3 className="course-card-simple__title">{course.title}</h3>
        </div>
    );
}

export default CourseCardSimple;