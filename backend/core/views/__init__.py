from .auth import RegisterView, MeView, GoogleOAuthView
from .courses import (
    CourseListView,
    CourseDetailView,
    EnrollCourseView,
    MyCoursesListView,
)
from .teacher import (
    TeacherCourseViewSet,
    TeacherModuleViewSet,
    TeacherTopicViewSet,
)
from .learning import (
    LearningCourseDetailView,
    TopicTheoryView,
    TopicNextQuestionView,
    TopicQuestionAnswerView,
    TopicPracticeHistoryView,
    TopicPracticeResetView,
)

__all__ = [
    "RegisterView",
    "MeView",
    "GoogleOAuthView",
    "CourseListView",
    "CourseDetailView",
    "EnrollCourseView",
    "MyCoursesListView",
    "TeacherCourseViewSet",
    "TeacherModuleViewSet",
    "TeacherTopicViewSet",
    "LearningCourseDetailView",
    "TopicTheoryView",
    "TopicNextQuestionView",
    "TopicQuestionAnswerView",
    "TopicPracticeHistoryView",
    "TopicPracticeResetView",
]
