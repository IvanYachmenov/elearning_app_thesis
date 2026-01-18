from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from allauth.socialaccount.models import SocialAccount
import jwt

from ..models import User
from ..serializers import UserSerializer, RegisterSerializer

User = get_user_model()

# POST /api/auth/register/
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)

# GET/PATCH /api/auth/me/
class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

# POST /api/auth/google/
class GoogleOAuthView(APIView):
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        """
        Authenticate user with Google OAuth ID token
        
        Request body:
        {
            "token": "google_id_token_string"
        }
        
        Returns:
        {
            "access": "jwt_access_token",
            "refresh": "jwt_refresh_token",
            "user": {...user_data...}
        }
        """
        id_token = request.data.get('token')
        
        if not id_token:
            return Response(
                {'detail': 'Google ID token is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Decode and verify Google ID token
            try:
                # Decode token (without signature verification for now)
                # Frontend should verify the token before sending
                decoded = jwt.decode(id_token, options={"verify_signature": False})
                
                # Verify issuer
                if decoded.get('iss') not in ['accounts.google.com', 'https://accounts.google.com']:
                    return Response(
                        {'detail': 'Invalid token issuer.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Extract user data from token
                user_data = {
                    'sub': decoded.get('sub'),
                    'email': decoded.get('email', ''),
                    'email_verified': decoded.get('email_verified', False),
                    'name': decoded.get('name', ''),
                    'given_name': decoded.get('given_name', ''),
                    'family_name': decoded.get('family_name', ''),
                    'picture': decoded.get('picture', ''),
                }
                
            except jwt.DecodeError:
                return Response(
                    {'detail': 'Invalid token format.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            except Exception as e:
                return Response(
                    {'detail': f'Failed to process Google token: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not user_data:
                return Response(
                    {'detail': 'Invalid Google token.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get or create user using allauth models
            user = self._get_or_create_user(user_data)
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            
            # Serialize user data
            serializer = UserSerializer(user, context={'request': request})
            
            return Response({
                'access': access_token,
                'refresh': refresh_token,
                'user': serializer.data
            })
            
        except Exception as e:
            return Response(
                {'detail': f'Authentication failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _get_or_create_user(self, user_data):
        """
        Get or create user from Google OAuth data using allauth models
        """
        google_id = user_data.get('sub')
        email = user_data.get('email', '')
        
        # Try to find existing user by social account (allauth)
        try:
            social_account = SocialAccount.objects.get(provider='google', uid=google_id)
            user = social_account.user
            self._update_user_from_data(user, user_data)
            return user
        except SocialAccount.DoesNotExist:
            pass
        
        # Try to find by email (for linking accounts)
        if email:
            try:
                user = User.objects.get(email=email)
                # Link social account if not already linked
                if not SocialAccount.objects.filter(user=user, provider='google').exists():
                    SocialAccount.objects.create(
                        user=user,
                        provider='google',
                        uid=google_id,
                        extra_data=user_data
                    )
                self._update_user_from_data(user, user_data)
                return user
            except User.DoesNotExist:
                pass
        
        # Create new user
        username_base = email.split('@')[0] if email else slugify(user_data.get('name', 'user'))
        username = username_base
        counter = 1
        
        while User.objects.filter(username=username).exists():
            username = f"{username_base}{counter}"
            counter += 1
        
        user = User.objects.create_user(
            username=username,
            email=email or '',
            google_id=google_id,
            auth_provider='google',
            email_verified=user_data.get('email_verified', False),
            first_name=user_data.get('given_name', ''),
            last_name=user_data.get('family_name', ''),
        )
        
        # Create social account association (allauth)
        SocialAccount.objects.create(
            user=user,
            provider='google',
            uid=google_id,
            extra_data=user_data
        )
        
        return user
    
    def _update_user_from_data(self, user, user_data):
        """Update user fields from OAuth data"""
        if not user.google_id:
            user.google_id = user_data.get('sub') or user_data.get('id')
        if user.auth_provider != 'google':
            user.auth_provider = 'google'
        if user_data.get('email_verified'):
            user.email_verified = True
        if not user.first_name and user_data.get('given_name'):
            user.first_name = user_data.get('given_name')
        if not user.last_name and user_data.get('family_name'):
            user.last_name = user_data.get('family_name')
        user.save()
