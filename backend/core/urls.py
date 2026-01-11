from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView,
    MeView,
    CourseListView,
    CourseDetailView,
    EnrollCourseView,
    MyCoursesListView,
    TeacherCourseViewSet,
    TeacherModuleViewSet,
    TeacherTopicViewSet,
    LearningCourseDetailView,
    TopicTheoryView,
    TopicNextQuestionView,
    TopicQuestionAnswerView,
    TopicPracticeHistoryView,
    TopicPracticeResetView,
)

router = DefaultRouter()
router.register(r'teacher/courses', TeacherCourseViewSet, basename='teacher-course')
router.register(r'teacher/modules', TeacherModuleViewSet, basename='teacher-module')
router.register(r'teacher/topics', TeacherTopicViewSet, basename='teacher-topic')

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/me/", MeView.as_view(), name="me"),

    path("courses/", CourseListView.as_view(), name="course-list"),
    path("courses/<int:pk>/", CourseDetailView.as_view(), name="course-detail"),
    path("courses/<int:pk>/enroll/", EnrollCourseView.as_view(), name="course-enroll"),
    path("my-courses/", MyCoursesListView.as_view(), name="my-courses"),

    path("", include(router.urls)),

    path("learning/courses/<int:pk>/", LearningCourseDetailView.as_view(), name="learning-course-detail"),
    path("learning/topics/<int:pk>/", TopicTheoryView.as_view(), name="learning-topic-detail"),
    path("learning/topics/<int:pk>/next-question/", TopicNextQuestionView.as_view(), name="learning-topic-next-question"),
    path("learning/questions/<int:pk>/answer/", TopicQuestionAnswerView.as_view(), name="learning-question-answer"),
    path("learning/topics/<int:pk>/reset/", TopicPracticeResetView.as_view(), name="learning-topic-reset"),
    path("learning/topics/<int:pk>/history/", TopicPracticeHistoryView.as_view(), name="learning-topic-history"),
]
