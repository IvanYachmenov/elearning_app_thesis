import { useEffect, useState } from "react";
import { api } from "../../../api/client";
import CourseCard from "../components/CourseCard";

function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    api
      .get("/api/courses/")
      .then((resp) => {
        setCourses(resp.data.results || resp.data || []);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load courses.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="page">
      <h1 className="page__title">Courses</h1>
      <p className="page__subtitle">
        Browse available courses. After you enroll, they will appear on the
        <strong> Learning</strong> page.
      </p>

      {loading && <p>Loading courses...</p>}
      {error && <p style={{ color: "salmon" }}>{error}</p>}

      {!loading && !error && courses.length === 0 && (
        <p>No courses yet. Ask administrator to create at least one course.</p>
      )}

      <div className="courses-grid">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}

export default CoursesPage;
