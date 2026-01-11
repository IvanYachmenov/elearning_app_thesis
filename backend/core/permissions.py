from rest_framework import permissions


class IsTeacher(permissions.BasePermission):
    message = "You must be a teacher to perform this action."

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_teacher
        )
