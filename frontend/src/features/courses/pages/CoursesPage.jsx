import { useEffect, useState } from "react";
import { api } from "../../../api/client";

function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "my"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    api
      .get("/api/courses/")
      .then((resp) => {
        setCourses(resp.data.results || resp.data); // если пагинация включена
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load courses.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const myCourses = courses.filter((c) => c.is_enrolled);
  const allCourses = courses;

  const shownCourses = activeTab === "my" ? myCourses : allCourses;

  const tabButtonStyle = (isActive) => ({
    padding: "6px 12px",
    borderRadius: "999px",
    border: "1px solid #475569",
    backgroundColor: isActive ? "#38bdf8" : "#0f172a",
    color: isActive ? "#0f172a" : "#e5e7eb",
    cursor: "pointer",
  });

  return (
    <div>
      <h1 style={{ fontSize: "24px", marginBottom: "12px" }}>Courses</h1>

      <div style={{ marginBottom: "16px", display: "flex", gap: "8px" }}>
        <button
          type="button"
          style={tabButtonStyle(activeTab === "all")}
          onClick={() => setActiveTab("all")}
        >
          All courses
        </button>
        <button
          type="button"
          style={tabButtonStyle(activeTab === "my")}
          onClick={() => setActiveTab("my")}
        >
          My courses
        </button>
      </div>

      {loading && <p>Loading courses...</p>}
      {error && (
        <p style={{ color: "red", marginTop: 8 }}>
          {error}
        </p>
      )}

      {!loading && !error && shownCourses.length === 0 && (
        <p style={{ color: "#9ca3af", marginTop: 8 }}>
          {activeTab === "my"
            ? "You are not enrolled in any courses yet."
            : "There are no courses yet."}
        </p>
      )}

      {!loading && !error && shownCourses.length > 0 && (
        <div style={{ display: "grid", gap: "12px", marginTop: "8px" }}>
          {shownCourses.map((course) => (
            <article
              key={course.id}
              style={{
                padding: "12px",
                borderRadius: "10px",
                backgroundColor: "#020617",
                border: "1px solid #1e293b",
              }}
            >
              <h2 style={{ fontSize: "18px", marginBottom: "4px" }}>
                {course.title}
              </h2>
              <p style={{ color: "#9ca3af", marginBottom: "8px" }}>
                {course.description || "No description yet."}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  fontSize: "13px",
                  color: "#9ca3af",
                }}
              >
                <span>Author: {course.author_username || "Unknown"}</span>
                <span>Modules: {course.modules_count}</span>
                {course.is_enrolled && (
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "999px",
                      backgroundColor: "#16a34a",
                      color: "#0f172a",
                      fontWeight: 600,
                    }}
                  >
                    Enrolled
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default CoursesPage;
