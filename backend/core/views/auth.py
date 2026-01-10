from rest_framework import generics, permissions
from ..models import User
from ..serializers import UserSerializer, RegisterSerializer

class RegisterView(generics.CreateAPIView):
    """
    POST -> /api/auth/register
    new user registration
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)

class MeView(generics.RetrieveUpdateAPIView):
    """
    GET -> /api/auth/me/ - return user profile
    PATCH -> /api/auth/me/ - update user profile
    """
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context