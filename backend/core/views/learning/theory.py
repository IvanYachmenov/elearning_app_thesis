from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from ...models import Topic, TopicProgress
from ...serializers import TopicTheorySerializer


# GET /api/learning/topics/<id>/
class TopicTheoryView(APIView):
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

        progress = TopicProgress.objects.filter(
            user=request.user,
            topic=topic
        ).first()

        serializer = TopicTheorySerializer(
            topic,
            context={"request": request,"topic_progress": progress},
        )
        return Response(serializer.data)
