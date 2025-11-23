import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../api/client";

function LearningPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    api
      .get("/api/my-courses/")
      .then((resp) => {
        setCourses(resp.data.results || resp.data || []);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load your courses.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="page">
      <h1 className="page__title">Learning</h1>
      <p className="page__subtitle">
        Here you&apos;ll see courses you&apos;re enrolled in.
      </p>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "salmon" }}>{error}</p>}

      {!loading && !error && courses.length === 0 && (
        <p>
          You are not enrolled in any course yet. Go to{" "}
          <Link to="/courses">Courses</Link> and pick something interesting.
        </p>
      )}

      <div className="courses-grid">
        {courses.map((course) => (
          <article key={course.id} className="course-card">
            <h3 className="course-card__title">{course.title}</h3>
            {course.description && (
              <p className="course-card__description">
                {course.description.length > 160
                  ? course.description.slice(0, 160).trimEnd() + "…"
                  : course.description}
              </p>
            )}
            <div className="course-card__footer">
              <Link to={`/courses/${course.id}`} className="btn-primary">
                Continue learning
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default LearningPage;
