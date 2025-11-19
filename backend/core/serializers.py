from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "role",
            "points",
            "two_factor_enabled",
        )
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "password",
            "role",
        )
        extra_kwargs = {
            "role": {"required": False},
        }

    def create(self, validated_data):
        role = validated_data.get("role", User.Roles.STUDENT)
        password = validated_data.get("password")

        user = User.objects.create_user(
            username = validated_data["username"],
            email = validated_data.get("email", ""),
            password = password,
            role = role,
        )
        return user

