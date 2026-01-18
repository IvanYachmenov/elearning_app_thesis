"""
Custom adapters for django-allauth
"""
from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.utils.text import slugify


class CustomAccountAdapter(DefaultAccountAdapter):
    """Custom account adapter for regular email/password registration"""
    pass


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    """Custom social account adapter for OAuth providers"""
    
    def populate_user(self, request, sociallogin, data):
        """
        Customize user creation from social account data
        """
        user = super().populate_user(request, sociallogin, data)
        
        # Set auth_provider
        provider = sociallogin.account.provider
        if provider == 'google':
            user.auth_provider = 'google'
            # Extract google_id from social account
            if sociallogin.account.uid:
                user.google_id = sociallogin.account.uid
            # Mark email as verified if Google says so
            if data.get('email_verified'):
                user.email_verified = True
        
        return user
    
    def pre_social_login(self, request, sociallogin):
        """
        Called before social login completes
        Useful for linking accounts
        """
        # If user is already logged in, link the social account
        if request.user.is_authenticated:
            sociallogin.connect(request, request.user)
        return super().pre_social_login(request, sociallogin)
