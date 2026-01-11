from rest_framework import serializers
from django.utils.text import slugify
import json
from ..models import Course, Module, Topic
from ..models.learning import TopicQuestion, TopicQuestionOption


class TeacherQuestionOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TopicQuestionOption
        fields = ("id", "text", "is_correct")


class TeacherQuestionSerializer(serializers.ModelSerializer):
    options = TeacherQuestionOptionSerializer(many=True, required=False)

    class Meta:
        model = TopicQuestion
        fields = (
            "id",
            "text",
            "order",
            "question_type",
            "max_score",
            "options",
        )

    def create(self, validated_data):
        options_data = validated_data.pop('options', [])
        question = TopicQuestion.objects.create(**validated_data)
        for option_data in options_data:
            TopicQuestionOption.objects.create(question=question, **option_data)
        return question

    def update(self, instance, validated_data):
        options_data = validated_data.pop('options', None)
        
        instance.text = validated_data.get('text', instance.text)
        instance.order = validated_data.get('order', instance.order)
        instance.question_type = validated_data.get('question_type', instance.question_type)
        instance.max_score = validated_data.get('max_score', instance.max_score)
        instance.save()
        
        if options_data is not None:
            existing_option_ids = set(instance.options.values_list('id', flat=True))
            updated_option_ids = set()
            
            for option_data in options_data:
                option_id = option_data.get('id')
                if option_id and instance.options.filter(id=option_id).exists():
                    option = instance.options.get(id=option_id)
                    option.text = option_data.get('text', option.text)
                    option.is_correct = option_data.get('is_correct', option.is_correct)
                    option.save()
                    updated_option_ids.add(option_id)
                else:
                    option_data.pop('id', None)
                    TopicQuestionOption.objects.create(question=instance, **option_data)
            
            options_to_delete = existing_option_ids - updated_option_ids
            if options_to_delete:
                instance.options.filter(id__in=options_to_delete).delete()
        
        return instance


class TeacherTopicSerializer(serializers.ModelSerializer):
    questions = TeacherQuestionSerializer(many=True, required=False)

    class Meta:
        model = Topic
        fields = (
            "id",
            "title",
            "content",
            "order",
            "is_timed_test",
            "time_limit_seconds",
            "questions",
        )

    def validate_time_limit_seconds(self, value):
        if value is not None and value < 120:
            raise serializers.ValidationError("Time limit must be at least 120 seconds.")
        return value

    def create(self, validated_data):
        questions_data = validated_data.pop('questions', [])
        topic = Topic.objects.create(**validated_data)
        for question_data in questions_data:
            options_data = question_data.pop('options', [])
            question = TopicQuestion.objects.create(topic=topic, **question_data)
            for option_data in options_data:
                TopicQuestionOption.objects.create(question=question, **option_data)
        return topic

    def update(self, instance, validated_data):
        questions_data = validated_data.pop('questions', None)
        
        instance.title = validated_data.get('title', instance.title)
        instance.content = validated_data.get('content', instance.content)
        instance.order = validated_data.get('order', instance.order)
        instance.is_timed_test = validated_data.get('is_timed_test', instance.is_timed_test)
        instance.time_limit_seconds = validated_data.get('time_limit_seconds', instance.time_limit_seconds)
        instance.save()
        
        if questions_data is not None:
            existing_question_ids = set(instance.questions.values_list('id', flat=True))
            updated_question_ids = set()
            
            for question_data in questions_data:
                question_id = question_data.get('id')
                if question_id and instance.questions.filter(id=question_id).exists():
                    question = instance.questions.get(id=question_id)
                    question_serializer = TeacherQuestionSerializer(question, data=question_data, partial=True)
                    question_serializer.is_valid(raise_exception=True)
                    question_serializer.save()
                    updated_question_ids.add(question_id)
                else:
                    question_data.pop('id', None)
                    options_data = question_data.pop('options', [])
                    question = TopicQuestion.objects.create(topic=instance, **question_data)
                    for option_data in options_data:
                        option_data.pop('id', None)
                        TopicQuestionOption.objects.create(question=question, **option_data)
            
            questions_to_delete = existing_question_ids - updated_question_ids
            if questions_to_delete:
                instance.questions.filter(id__in=questions_to_delete).delete()
        
        return instance


class TeacherModuleSerializer(serializers.ModelSerializer):
    topics = TeacherTopicSerializer(many=True, required=False)

    class Meta:
        model = Module
        fields = (
            "id",
            "title",
            "order",
            "topics",
        )

    def create(self, validated_data):
        topics_data = validated_data.pop('topics', [])
        module = Module.objects.create(**validated_data)
        for topic_data in topics_data:
            questions_data = topic_data.pop('questions', [])
            topic = Topic.objects.create(module=module, **topic_data)
            for question_data in questions_data:
                options_data = question_data.pop('options', [])
                question = TopicQuestion.objects.create(topic=topic, **question_data)
                for option_data in options_data:
                    TopicQuestionOption.objects.create(question=question, **option_data)
        return module

    def update(self, instance, validated_data):
        topics_data = validated_data.pop('topics', None)
        
        instance.title = validated_data.get('title', instance.title)
        instance.order = validated_data.get('order', instance.order)
        instance.save()
        
        if topics_data is not None:
            existing_topic_ids = set(instance.topics.values_list('id', flat=True))
            updated_topic_ids = set()
            received_topic_ids = set()
            
            for topic_data in topics_data:
                topic_id = topic_data.get('id')
                if topic_id:
                    received_topic_ids.add(topic_id)
                    if instance.topics.filter(id=topic_id).exists():
                        topic = instance.topics.get(id=topic_id)
                        topic_serializer = TeacherTopicSerializer(topic, data=topic_data, partial=True)
                        topic_serializer.is_valid(raise_exception=True)
                        topic_serializer.save()
                        updated_topic_ids.add(topic_id)
                else:
                    topic_data.pop('id', None)
                    questions_data = topic_data.pop('questions', [])
                    topic = Topic.objects.create(module=instance, **topic_data)
                    for question_data in questions_data:
                        question_data.pop('id', None)
                        options_data = question_data.pop('options', [])
                        question = TopicQuestion.objects.create(topic=topic, **question_data)
                        for option_data in options_data:
                            option_data.pop('id', None)
                            TopicQuestionOption.objects.create(question=question, **option_data)
            
            topics_to_delete = existing_topic_ids - received_topic_ids
            if topics_to_delete:
                instance.topics.filter(id__in=topics_to_delete).delete()
        
        return instance


class TeacherCourseSerializer(serializers.ModelSerializer):
    modules = TeacherModuleSerializer(many=True, required=False)
    author_name = serializers.SerializerMethodField(read_only=True)
    image = serializers.ImageField(required=False, allow_null=True)
    image_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Course
        fields = (
            "id",
            "title",
            "slug",
            "description",
            "author_name",
            "modules",
            "image",
            "image_url",
        )
        read_only_fields = ("id", "slug", "author_name", "image_url")

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            from django.conf import settings
            return f"{settings.MEDIA_URL}{obj.image.url}" if obj.image else None
        return None

    def get_author_name(self, obj):
        author = obj.author
        if not author:
            return None
        if author.first_name or author.last_name:
            return f"{author.first_name} {author.last_name}".strip()
        return author.username

    def create(self, validated_data):
        modules_data = validated_data.pop('modules', [])
        user = self.context['request'].user
        
        if 'slug' not in validated_data or not validated_data.get('slug'):
            title = validated_data.get('title')
            base_slug = slugify(title)
            slug = base_slug
            counter = 1
            while Course.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            validated_data['slug'] = slug
        
        validated_data['author'] = user
        
        course = Course.objects.create(**validated_data)
        
        for module_data in modules_data:
            topics_data = module_data.pop('topics', [])
            module = Module.objects.create(course=course, **module_data)
            for topic_data in topics_data:
                questions_data = topic_data.pop('questions', [])
                topic = Topic.objects.create(module=module, **topic_data)
                for question_data in questions_data:
                    options_data = question_data.pop('options', [])
                    question = TopicQuestion.objects.create(topic=topic, **question_data)
                    for option_data in options_data:
                        TopicQuestionOption.objects.create(question=question, **option_data)
        
        return course

    def update(self, instance, validated_data):
        modules_data = validated_data.pop('modules', None)
        
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.image = validated_data.get('image', instance.image)
        
        if 'title' in validated_data:
            title = validated_data['title']
            base_slug = slugify(title)
            slug = base_slug
            counter = 1
            while Course.objects.filter(slug=slug).exclude(pk=instance.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            instance.slug = slug
        
        instance.save()
        
        if modules_data is not None:
            existing_module_ids = set(instance.modules.values_list('id', flat=True))
            updated_module_ids = set()
            
            for module_data in modules_data:
                module_id = module_data.get('id')
                if module_id and instance.modules.filter(id=module_id).exists():
                    module = instance.modules.get(id=module_id)
                    module_serializer = TeacherModuleSerializer(module, data=module_data, partial=True)
                    module_serializer.is_valid(raise_exception=True)
                    module_serializer.save()
                    updated_module_ids.add(module_id)
                else:
                    module_data.pop('id', None)
                    topics_data = module_data.pop('topics', [])
                    module = Module.objects.create(course=instance, **module_data)
                    for topic_data in topics_data:
                        topic_data.pop('id', None)
                        questions_data = topic_data.pop('questions', [])
                        topic = Topic.objects.create(module=module, **topic_data)
                        for question_data in questions_data:
                            question_data.pop('id', None)
                            options_data = question_data.pop('options', [])
                            question = TopicQuestion.objects.create(topic=topic, **question_data)
                            for option_data in options_data:
                                option_data.pop('id', None)
                                TopicQuestionOption.objects.create(question=question, **option_data)
            
            modules_to_delete = existing_module_ids - updated_module_ids
            if modules_to_delete:
                instance.modules.filter(id__in=modules_to_delete).delete()
        
        return instance
