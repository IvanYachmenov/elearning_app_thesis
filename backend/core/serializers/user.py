from rest_framework import serializers
from django.conf import settings
from ..models import User

class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False, allow_null=True, write_only=True)
    avatar_url = serializers.SerializerMethodField(read_only=True)
    
    def get_avatar_url(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return f"{settings.MEDIA_URL}{obj.avatar.url}" if obj.avatar else None
        return None
    
    def validate_username(self, value):
        """Validate username uniqueness, excluding current user"""
        user = self.instance
        if user and User.objects.filter(username=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("A user with this username already exists. Please choose another one.")
        elif not user and User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists. Please choose another one.")
        return value
    
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "points",
            "two_factor_enabled",
            "auth_provider",
            "email_verified",
            "avatar",
            "avatar_url",
            "profile_background_gradient",
        )
        read_only_fields = ("email", "role", "points", "two_factor_enabled", "auth_provider", "email_verified", "avatar_url")
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "role",
        )
        extra_kwargs = {
            "role": {"required": False},
            "first_name": {"required": False, "allow_blank": True},
            "last_name": {"required": False, "allow_blank": True},
        }

    def create(self, validated_data):
        role = validated_data.get("role", User.Roles.STUDENT)
        password = validated_data.pop("password")

        user = User.objects.create_user(
            username = validated_data["username"],
            email = validated_data.get("email", ""),
            password = password,
            role = role,
            first_name = validated_data.get("first_name", ""),
            last_name = validated_data.get("last_name", ""),
        )
        return user

