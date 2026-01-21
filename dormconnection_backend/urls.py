"""
URL configuration for dormconnection_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_root(request):
    """API root endpoint showing available endpoints"""
    return JsonResponse({
        'message': 'DormConnection Django API',
        'version': '1.0',
        'endpoints': {
            'authentication': {
                'login': '/api/auth/google/login/',
                'check_auth': '/api/auth/check/',
                'profile': '/api/auth/profile/',
                'profile_detail': '/api/auth/profile/detail/',
                'logout': '/api/auth/logout/',
            },
            'listings': {
                'list': '/api/listings/',
                'create': '/api/listings/ (POST)',
                'detail': '/api/listings/{id}/',
                'my_listings': '/api/listings/my_listings/',
                'can_create': '/api/listings/can_create/',
            },
            'admin': '/admin/',
        },
        'documentation': {
            'api_docs': '/API_DOCUMENTATION.md',
            'django_readme': '/DJANGO_README.md',
            'migration_guide': '/MIGRATION_GUIDE.md',
        }
    })

urlpatterns = [
    path('', api_root, name='api_root'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/listings/', include('listings.urls')),
    path('', include('social_django.urls', namespace='social')),
]
