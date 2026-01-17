from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from ...models import Topic, TopicProgress, TopicQuestionAnswer
from .utils import get_topic_time_limit_seconds


# POST /api/learning/topics/<id>/reset/
class TopicPracticeResetView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            topic = Topic.objects.select_related("module__course").get(pk=pk)
        except Topic.DoesNotExist:
            return Response(
                {"detail": "Topic not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        course = topic.module.course
        if not course.students.filter(pk=request.user.pk).exists():
            return Response(
                {"detail": "You are not enrolled in this course."},
                status=status.HTTP_403_FORBIDDEN,
            )

        TopicQuestionAnswer.objects.filter(
            user=request.user,
            question__topic=topic,
        ).delete()

        TopicProgress.objects.update_or_create(
            user=request.user,
            topic=topic,
            defaults={
                "status": TopicProgress.Status.NOT_STARTED,
                "score": None,
                "completed_at": None,
                "started_at": None,
                "timed_out": False,
                "is_timed": topic.is_timed_test,
                "time_limit_seconds": get_topic_time_limit_seconds(topic),
            },
        )

        return Response({"detail": "Practice progress has been reset."})
