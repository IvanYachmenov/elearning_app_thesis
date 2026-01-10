from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from ..models import Course, Module, Topic
from ..serializers.teacher import (
    TeacherCourseSerializer,
    TeacherModuleSerializer,
    TeacherTopicSerializer,
)
from ..permissions import IsTeacher


class TeacherCourseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for teacher's course management.
    Allows teachers to create, read, update, and delete their courses.
    """
    serializer_class = TeacherCourseSerializer
    permission_classes = [IsAuthenticated, IsTeacher]
    
    def get_queryset(self):
        """
        Return only courses authored by the current teacher.
        """
        return Course.objects.filter(author=self.request.user).select_related('author').prefetch_related('modules__topics').order_by('-id')
    
    def perform_create(self, serializer):
        """
        Automatically set the author to the current user when creating a course.
        """
        serializer.save(author=self.request.user)
    
    def get_serializer_context(self):
        """
        Add request to serializer context for URL generation.
        """
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class TeacherModuleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for teacher's module management.
    Teachers can manage modules within their courses.
    """
    serializer_class = TeacherModuleSerializer
    permission_classes = [IsAuthenticated, IsTeacher]
    
    def get_queryset(self):
        """
        Return only modules from courses authored by the current teacher.
        """
        teacher_courses = Course.objects.filter(author=self.request.user)
        return Module.objects.filter(course__in=teacher_courses).select_related('course').prefetch_related('topics').order_by('course', 'order')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class TeacherTopicViewSet(viewsets.ModelViewSet):
    """
    ViewSet for teacher's topic management.
    Teachers can manage topics within modules of their courses.
    """
    serializer_class = TeacherTopicSerializer
    permission_classes = [IsAuthenticated, IsTeacher]
    
    def get_queryset(self):
        """
        Return only topics from modules of courses authored by the current teacher.
        """
        teacher_courses = Course.objects.filter(author=self.request.user)
        teacher_modules = Module.objects.filter(course__in=teacher_courses)
        return Topic.objects.filter(module__in=teacher_modules).select_related('module__course').order_by('module', 'order')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
