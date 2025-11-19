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

class MeView(generics.RetrieveAPIView):
    """
    GET -> /api/auth/me/ - return user profile

    maybe -> PATCH -> /api/auth/me/ (reload data)
    """
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user
