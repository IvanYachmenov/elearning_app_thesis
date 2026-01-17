from rest_framework import serializers
from ...models import Topic
from ...models.learning import TopicQuestion, TopicQuestionOption
from .question import TeacherQuestionSerializer


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
