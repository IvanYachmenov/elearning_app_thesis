from .course import LearningCourseDetailView
from .theory import TopicTheoryView
from .practice import TopicNextQuestionView, TopicQuestionAnswerView
from .reset import TopicPracticeResetView
from .history import TopicPracticeHistoryView

__all__ = [
    "LearningCourseDetailView",
    "TopicTheoryView",
    "TopicNextQuestionView",
    "TopicQuestionAnswerView",
    "TopicPracticeResetView",
    "TopicPracticeHistoryView",
]
