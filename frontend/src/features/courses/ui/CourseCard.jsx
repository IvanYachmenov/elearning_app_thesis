import {Link} from 'react-router-dom';

function CourseCard({course}) {
    const description = course.description || '';
    const shortDescription =
        description.length > 160
            ? description.slice(0, 160).trimEnd() + '…'
            : description;

    const authorName =
        course.author_name ||
        (course.author && (course.author.username || course.author.email)) ||
        null;

    return (
        <article className="course-card">
            <h3 className="course-card__title">{course.title}</h3>

            {authorName && <p className="course-card__author">by {authorName}</p>}

            {shortDescription && (
                <p className="course-card__description">{shortDescription}</p>
            )}

            <div className="course-card__footer">
                <Link to={`/courses/${course.id}`} className="btn-primary">
                    View details →
                </Link>
            </div>
        </article>
    );
}

export default CourseCard;
