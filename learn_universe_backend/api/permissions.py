from rest_framework.permissions import BasePermission


class IsOwnStudentPath(BasePermission):
    def has_permission(self, request, view):
        return str(request.user.pk) == str(view.kwargs.get('user_id'))


class IsTeacher(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user.is_authenticated and request.user.is_teacher)
