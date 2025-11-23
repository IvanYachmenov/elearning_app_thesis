from .auth import RegisterView, MeView
from .courses import (
    CourseListView,
    CourseDetailView,
    EnrollCourseView,
    MyCoursesListView,
)

__all__ = [
    "RegisterView",
    "MeView",
    "CourseListView",
    "CourseDetailView",
    "EnrollCourseView",
    "MyCoursesListView",
]