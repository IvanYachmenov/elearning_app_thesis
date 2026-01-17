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
