from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK
from rest_framework.views import APIView

from ..models import Course
from ..serializers import (
    CourseListSerializer,
    CourseDetailSerializer
)


class CourseListView(generics.ListAPIView):
    """
    GET /api/courses -> public list of courses
    """
    serializer_class = CourseListSerializer
    permission_classes = (permissions.AllowAny,)

    filterset_fields = ["author_id"]
    search_fields = ["title", "description"]
    ordering_fields = ["title", "id"]
    ordering = ["id"]

    queryset = Course.objects.select_related("author")

class CourseDetailView(generics.RetrieveAPIView):
    """
    GET /api/courses/<id>/enroll/ -> detailed info about course
    """
    serializer_class = CourseDetailSerializer
    permission_classes = (permissions.AllowAny,)

    queryset = (
        Course.objects
        .select_related("author")
        .prefetch_related("modules__topics")
    )

class EnrollCourseView(APIView):
    """
    POST /api/courses/<id>/enroll -> enroll user to course
    """
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

class MyCoursesListView(generics.ListAPIView):
    """
    GET /api/my-courses/ -> list of user's courses
    """
    serializer_class = CourseListSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        return user.enrolled_courses.select_related("author")
