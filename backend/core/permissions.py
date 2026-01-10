from rest_framework import permissions


class IsTeacher(permissions.BasePermission):
    """
    Permission to check if user is a teacher.
    """
    message = "You must be a teacher to perform this action."

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_teacher
        )
