from django.contrib.auth.models import AbstractUser
from django.db import models

def user_avatar_upload_path(instance, filename):
    return f'users/{instance.username}/avatar/{filename}'

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
    
    # OAuth fields
    google_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    auth_provider = models.CharField(
        max_length=20,
        choices=[
            ('email', 'Email'),
            ('google', 'Google'),
        ],
        default='email'
    )
    email_verified = models.BooleanField(default=False)
    
    avatar = models.ImageField(
        upload_to=user_avatar_upload_path,
        null=True,
        blank=True,
        max_length=500
    )
    
    profile_background_gradient = models.CharField(
        max_length=500,
        null=True,
        blank=True,
        help_text="CSS gradient string for profile background"
    )

    @property
    def is_teacher(self) -> bool:
        return self.role == self.Roles.TEACHER

    @property
    def is_student(self):
        return self.role == self.Roles.STUDENT

    def __str__(self):
        return self.username
