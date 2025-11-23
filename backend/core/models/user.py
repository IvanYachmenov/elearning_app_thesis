from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Roles(models.TextChoices):
        STUDENT = "student", "Student"
        TEACHER = "teacher", "Teacher"
        ADMIN = "admin", "Admin"

    role = models.CharField(
        max_length=20,
        choices=Roles.choices,
        default=Roles.STUDENT,
    )

    points = models.PositiveIntegerField(default=0)

    enrolled_courses = models.ManyToManyField(
        "Course",
        related_name="students",
        blank=True,
    )

    two_factor_enabled = models.BooleanField(default=False)

    @property
    def is_teacher(self) -> bool:
        return self.role == self.Roles.TEACHER

    @property
    def is_student(self):
        return self.role == self.Roles.STUDENT

    def __str__(self):
        return self.username
