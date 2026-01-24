import json
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from ..models import Course, Module, Topic
from ..models.learning import TopicQuestion, TopicQuestionOption
from ..serializers.teacher import (
    TeacherCourseSerializer,
    TeacherModuleSerializer,
    TeacherTopicSerializer,
)
from ..permissions import IsTeacher


# GET/POST /api/teacher/courses/
# GET/PUT/PATCH/DELETE /api/teacher/courses/<id>/
class TeacherCourseViewSet(viewsets.ModelViewSet):
    serializer_class = TeacherCourseSerializer
    permission_classes = [IsAuthenticated, IsTeacher]
    
    def get_queryset(self):
        return Course.objects.filter(author=self.request.user).select_related('author').prefetch_related(
            'modules__topics__questions__options'
        ).order_by('-id')
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def update(self, request, *args, **kwargs):
        # Parse modules from FormData before validation
        if 'modules' in request.data and isinstance(request.data['modules'], str):
            request.data._mutable = True
            parsed_modules = json.loads(request.data['modules'])
            print(f"[UPDATE] Parsed {len(parsed_modules)} modules")
            request.data['modules'] = parsed_modules
            request.data._mutable = False
        
        return super().update(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        if 'modules' in request.data and isinstance(request.data['modules'], str):
            request.data._mutable = True
            request.data['modules'] = json.loads(request.data['modules'])
            request.data._mutable = False
        return super().create(request, *args, **kwargs)


# GET/POST /api/teacher/modules/
# GET/PUT/PATCH/DELETE /api/teacher/modules/<id>/
class TeacherModuleViewSet(viewsets.ModelViewSet):
    serializer_class = TeacherModuleSerializer
    permission_classes = [IsAuthenticated, IsTeacher]
    
    def get_queryset(self):
        teacher_courses = Course.objects.filter(author=self.request.user)
        return Module.objects.filter(course__in=teacher_courses).select_related('course').prefetch_related(
            'topics__questions__options'
        ).order_by('course', 'order')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


# GET/POST /api/teacher/topics/ 
# GET/PUT/PATCH/DELETE /api/teacher/topics/<id>/ 
class TeacherTopicViewSet(viewsets.ModelViewSet):
    serializer_class = TeacherTopicSerializer
    permission_classes = [IsAuthenticated, IsTeacher]
    
    def get_queryset(self):
        teacher_courses = Course.objects.filter(author=self.request.user)
        teacher_modules = Module.objects.filter(course__in=teacher_courses)
        return Topic.objects.filter(module__in=teacher_modules).select_related('module__course').prefetch_related(
            'questions__options'
        ).order_by('module', 'order')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        # Filter modules to only those belonging to the teacher's courses
        teacher_courses = Course.objects.filter(author=self.request.user)
        context['teacher_modules'] = Module.objects.filter(course__in=teacher_courses)
        return context
