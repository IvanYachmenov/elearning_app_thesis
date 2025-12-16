from rest_framework import serializers
from ..models import Course, Module, Topic


class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = (
            "id",
            "title",
            "content",
            "order",
            "is_timed_test",
            "time_limit_seconds",
        )


class ModuleSerializer(serializers.ModelSerializer):
    topics = TopicSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = (
            "id",
            "title",
            "order",
            "topics",
        )


class CourseListSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = (
            "id",
            "title",
            "slug",
            "description",
            "author_name",
            "is_enrolled",
        )

    def get_author_name(self, obj):
        author = obj.author
        if not author:
            return None
        if author.first_name or author.last_name:
            return f"{author.first_name} {author.last_name}".strip()
        return author.username

    def get_is_enrolled(self, obj):
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            return False
        return obj.students.filter(pk=request.user.pk).exists()


class CourseDetailSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    modules = ModuleSerializer(many=True, read_only=True)
    is_enrolled = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = (
            "id",
            "title",
            "slug",
            "description",
            "author_name",
            "is_enrolled",
            "modules",
        )

    def get_author_name(self, obj):
        author = obj.author
        if not author:
            return None
        if author.first_name or author.last_name:
            return f"{author.first_name} {author.last_name}".strip()
        return author.username

    def get_is_enrolled(self, obj):
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            return False
        return obj.students.filter(pk=request.user.pk).exists()
