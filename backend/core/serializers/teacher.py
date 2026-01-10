from rest_framework import serializers
from django.utils.text import slugify
from ..models import Course, Module, Topic


class TeacherTopicSerializer(serializers.ModelSerializer):
    """
    Serializer for topics in teacher's CRUD operations.
    """
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

    def validate_time_limit_seconds(self, value):
        if value is not None and value < 120:
            raise serializers.ValidationError("Time limit must be at least 120 seconds.")
        return value


class TeacherModuleSerializer(serializers.ModelSerializer):
    """
    Serializer for modules in teacher's CRUD operations.
    Includes nested topics.
    """
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
            Topic.objects.create(module=module, **topic_data)
        return module

    def update(self, instance, validated_data):
        topics_data = validated_data.pop('topics', None)
        
        # Update module fields
        instance.title = validated_data.get('title', instance.title)
        instance.order = validated_data.get('order', instance.order)
        instance.save()
        
        # Handle topics update
        if topics_data is not None:
            # Get existing topic IDs
            existing_topic_ids = set(instance.topics.values_list('id', flat=True))
            updated_topic_ids = set()
            
            # Update or create topics
            for topic_data in topics_data:
                topic_id = topic_data.get('id')
                if topic_id and instance.topics.filter(id=topic_id).exists():
                    # Update existing topic
                    topic = instance.topics.get(id=topic_id)
                    for key, value in topic_data.items():
                        if key != 'id':
                            setattr(topic, key, value)
                    topic.save()
                    updated_topic_ids.add(topic_id)
                else:
                    # Create new topic
                    topic_data.pop('id', None)
                    Topic.objects.create(module=instance, **topic_data)
            
            # Delete topics that were not in the update
            topics_to_delete = existing_topic_ids - updated_topic_ids
            if topics_to_delete:
                instance.topics.filter(id__in=topics_to_delete).delete()
        
        return instance


class TeacherCourseSerializer(serializers.ModelSerializer):
    """
    Serializer for courses in teacher's CRUD operations.
    Includes nested modules and topics.
    """
    modules = TeacherModuleSerializer(many=True, required=False)
    author_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Course
        fields = (
            "id",
            "title",
            "slug",
            "description",
            "author_name",
            "modules",
        )
        read_only_fields = ("id", "author_name")

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
        
        # Generate slug from title if not provided
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
        
        # Create modules and topics
        for module_data in modules_data:
            topics_data = module_data.pop('topics', [])
            module = Module.objects.create(course=course, **module_data)
            for topic_data in topics_data:
                Topic.objects.create(module=module, **topic_data)
        
        return course

    def update(self, instance, validated_data):
        modules_data = validated_data.pop('modules', None)
        
        # Update course fields
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        
        # Update slug if title changed
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
        
        # Handle modules update
        if modules_data is not None:
            # Get existing module IDs
            existing_module_ids = set(instance.modules.values_list('id', flat=True))
            updated_module_ids = set()
            
            # Update or create modules
            for module_data in modules_data:
                module_id = module_data.get('id')
                if module_id and instance.modules.filter(id=module_id).exists():
                    # Update existing module using the serializer's update method
                    module = instance.modules.get(id=module_id)
                    module_serializer = TeacherModuleSerializer(module, data=module_data, partial=True)
                    module_serializer.is_valid(raise_exception=True)
                    module_serializer.save()
                    updated_module_ids.add(module_id)
                else:
                    # Create new module
                    module_data.pop('id', None)
                    topics_data = module_data.pop('topics', [])
                    module = Module.objects.create(course=instance, **module_data)
                    for topic_data in topics_data:
                        Topic.objects.create(module=module, **topic_data)
            
            # Delete modules that were not in the update
            modules_to_delete = existing_module_ids - updated_module_ids
            if modules_to_delete:
                instance.modules.filter(id__in=modules_to_delete).delete()
        
        return instance
