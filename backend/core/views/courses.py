from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK
from rest_framework.views import APIView

from ..models import Course
from ..serializers import (
    CourseListSerializer,
    CourseDetailSerializer
)


# GET /api/courses/
class CourseListView(generics.ListAPIView):
    serializer_class = CourseListSerializer
    permission_classes = (permissions.AllowAny,)

    filterset_fields = ["author_id"]
    search_fields = ["title", "description"]
    ordering_fields = ["title", "id"]
    ordering = ["id"]

    queryset = Course.objects.select_related("author")

# GET /api/courses/<id>/
class CourseDetailView(generics.RetrieveAPIView):
    serializer_class = CourseDetailSerializer
    permission_classes = (permissions.AllowAny,)

    queryset = (
        Course.objects
        .select_related("author")
        .prefetch_related("modules__topics")
    )

# POST /api/courses/<id>/enroll/
class EnrollCourseView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            course = Course.objects.get(pk=pk)
        except Course.DoesNotExist:
            return Response(
                {"detail": "Course not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        user = request.user
        user.enrolled_courses.add(course)

        serializer = CourseDetailSerializer(
            course,
            context={"request": request}
        )
        return Response(serializer.data, status=HTTP_200_OK)

# GET /api/my-courses/
class MyCoursesListView(generics.ListAPIView):
    serializer_class = CourseListSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        return user.enrolled_courses.select_related("author")
