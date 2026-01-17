from .user import UserSerializer, RegisterSerializer
from .course import (
    TopicSerializer,
    ModuleSerializer,
    CourseListSerializer,
    CourseDetailSerializer,
)
from .teacher import (
    TeacherCourseSerializer,
    TeacherModuleSerializer,
    TeacherTopicSerializer,
    TeacherQuestionSerializer,
    TeacherQuestionOptionSerializer,
)
from .learning import (
    LearningTopicSerializer,
    LearningModuleSerializer,
    LearningCourseSerializer,
    TopicTheorySerializer,
    TopicPracticeQuestionSerializer,
    TopicQuestionAnswerSubmitSerializer,
    TopicPracticeHistoryQuestionSerializer
)

__all__ = [
    "UserSerializer",
    "RegisterSerializer",

    "TopicSerializer",
    "ModuleSerializer",
    "CourseListSerializer",
    "CourseDetailSerializer",

    "TeacherCourseSerializer",
    "TeacherModuleSerializer",
    "TeacherTopicSerializer",

    "LearningTopicSerializer",
    "LearningModuleSerializer",
    "LearningCourseSerializer",
    "TopicTheorySerializer",
    "TopicPracticeQuestionSerializer",
    "TopicQuestionAnswerSubmitSerializer",
    "TopicPracticeHistoryQuestionSerializer",
]
