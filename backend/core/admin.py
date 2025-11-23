from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, Course, Module, Topic


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Admin of Custom User
    """

    fieldsets = BaseUserAdmin.fieldsets + (
        ("Extra fields", {
            "fields": (
                "role",
                "points",
                "two_factor_enabled",
                "enrolled_courses",
            )
        }),
    )

    list_display = ("username", "email", "role", "points", "is_staff", "is_superuser")
    list_filter = ("role", "is_staff", "is_superuser")


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("title", "author")
    search_fields = ("title", "description")
    list_filter = ("author",)


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ("title", "course", "order")
    list_filter = ("course",)
    ordering = ("course", "order")


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ("title", "module", "order")
    list_filter = ("module",)
    ordering = ("module", "order")