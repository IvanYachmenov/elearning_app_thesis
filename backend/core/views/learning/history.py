from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from ...models import Topic, TopicProgress, TopicQuestion, TopicQuestionAnswer
from ...serializers.learning import TopicPracticeHistoryQuestionSerializer


# GET /api/learning/topics/<id>/history/
class TopicPracticeHistoryView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, pk):
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

        progress = (TopicProgress.objects.filter(
            user=request.user,
            topic=topic
        ).first())
        if not progress or progress.status not in (
                TopicProgress.Status.COMPLETED,
                TopicProgress.Status.FAILED,
        ):
            return Response(
                {"detail": "History is available only for completed topics."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        questions_qs = (
            TopicQuestion.objects
                .filter(topic=topic)
                .order_by("order", "id")
        )

        answers_qs = (
            TopicQuestionAnswer.objects
                .filter(user=request.user, question__topic=topic)
                .select_related("question")
                .prefetch_related("selected_options")
        )
        answers_map = {a.question_id: a for a in answers_qs}
        serializer = TopicPracticeHistoryQuestionSerializer(
            questions_qs,
            many=True,
            context={"user_answers_map": answers_map},
        )

        return Response({
            "topic_id": topic.id,
            "topic_title": topic.title,
            "questions": serializer.data,
        })
