from rest_framework import serializers
from ...models import Module, Topic
from ...models.learning import TopicQuestion, TopicQuestionOption
from .topic import TeacherTopicSerializer


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
            print(f"[MODULE UPDATE] Updating module {instance.id} with {len(topics_data)} topics")
            
            existing_topic_ids = set(instance.topics.values_list('id', flat=True))
            updated_topic_ids = set()
            received_topic_ids = set()
            
            for topic_data in topics_data:
                topic_id = topic_data.get('id')
                print(f"[MODULE UPDATE] Processing topic: id={topic_id}, title={topic_data.get('title')}")
                
                if topic_id:
                    received_topic_ids.add(topic_id)
                    if instance.topics.filter(id=topic_id).exists():
                        topic = instance.topics.get(id=topic_id)
                        print(f"[MODULE UPDATE] Updating existing topic {topic_id}")
                        topic_serializer = TeacherTopicSerializer(topic, data=topic_data, partial=True)
                        topic_serializer.is_valid(raise_exception=True)
                        topic_serializer.save()
                        updated_topic_ids.add(topic_id)
                        print(f"[MODULE UPDATE] Topic {topic_id} updated successfully")
                else:
                    print(f"[MODULE UPDATE] Creating new topic")
                    topic_data.pop('id', None)
                    questions_data = topic_data.pop('questions', [])
                    topic = Topic.objects.create(module=instance, **topic_data)
                    print(f"[MODULE UPDATE] Created topic {topic.id}")
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
        
        # Reload instance from database with all related data
        from django.db.models import Prefetch
        instance = Module.objects.prefetch_related(
            Prefetch('topics', queryset=Topic.objects.prefetch_related(
                'questions__options'
            ))
        ).get(pk=instance.pk)
        
        return instance
