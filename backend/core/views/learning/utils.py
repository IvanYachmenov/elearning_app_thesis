from django.utils import timezone
from ...models import Topic, TopicProgress


def get_topic_time_limit_seconds(topic: Topic):
    if not topic.is_timed_test:
        return None
    if topic.time_limit_seconds and topic.time_limit_seconds >= 120:
        return topic.time_limit_seconds
    return 120


def calculate_score_percent(correct_count: int, total_questions: int) -> int:
    if not total_questions:
        return 0
    return round(correct_count * 100 / total_questions)


def ensure_topic_progress(user, topic: Topic, is_timed: bool, time_limit_seconds: int | None):
    progress, _ = TopicProgress.objects.get_or_create(
        user=user,
        topic=topic,
        defaults={
            "status": TopicProgress.Status.IN_PROGRESS,
            "is_timed": is_timed,
            "time_limit_seconds": time_limit_seconds if is_timed else None,
            "started_at": timezone.now() if is_timed else None,
        },
    )

    updates = []
    if progress.status == TopicProgress.Status.NOT_STARTED:
        progress.status = TopicProgress.Status.IN_PROGRESS
        updates.append("status")

    if progress.is_timed != is_timed:
        progress.is_timed = is_timed
        updates.append("is_timed")

    if is_timed:
        effective_limit = time_limit_seconds or 120
        if progress.time_limit_seconds != effective_limit:
            progress.time_limit_seconds = effective_limit
            updates.append("time_limit_seconds")
        if not progress.started_at:
            progress.started_at = timezone.now()
            updates.append("started_at")

    if updates:
        progress.save(update_fields=updates)

    return progress
