import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../../api/client";

function CourseDetailPage() {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState(null);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);

    api
      .get(`/api/courses/${id}/`)
      .then((resp) => {
        setCourse(resp.data);
        if (resp.data.is_enrolled) {
          setEnrolled(true);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Course not found or failed to load.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleEnroll = async () => {
    setError(null);
    setEnrolling(true);
    try {
      const resp = await api.post(`/api/courses/${id}/enroll/`);
      setCourse(resp.data);
      setEnrolled(true);
    } catch (err) {
      console.error(err);
      setError("Failed to enroll. Maybe you are not logged in?");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <p>Loading course...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="page">
        <p style={{ color: "salmon" }}>{error || "Course not found."}</p>
      </div>
    );
  }

  const authorName =
    course.author_name ||
    (course.author && (course.author.username || course.author.email)) ||
    null;

  return (
    <div className="page">
      <h1 className="page__title">{course.title}</h1>

      {authorName && (
        <p className="page__subtitle">Author: <strong>{authorName}</strong></p>
      )}

      {course.description && (
        <p style={{ marginTop: 16, marginBottom: 24 }}>{course.description}</p>
      )}

      <div style={{ marginBottom: 24 }}>
        <button
          className="btn-primary"
          onClick={handleEnroll}
          disabled={enrolling || enrolled}
        >
          {enrolled ? "You are enrolled" : enrolling ? "Enrolling..." : "Enroll in this course"}
        </button>
      </div>

      {error && (
        <p style={{ color: "salmon", marginBottom: 16 }}>{error}</p>
      )}

      {course.modules && course.modules.length > 0 && (
        <section className="course-content">
          <h2 className="section-title">Course content</h2>
          <ol className="module-list">
            {course.modules.map((mod) => (
              <li key={mod.id} className="module-item">
                <strong>{mod.title}</strong>
                {mod.topics && mod.topics.length > 0 && (
                  <ul className="topic-list">
                    {mod.topics.map((topic) => (
                      <li key={topic.id} className="topic-item">
                        {topic.title}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

export default CourseDetailPage;
