from django.urls import path
from .views import AdminRegisterView, LoginView, CreateUserView,UserProfileView

urlpatterns = [
    path('register/',CreateUserView.as_view(),name='register'),
    path('admin/register/', AdminRegisterView.as_view(), name='admin-register'),
    path('login/', LoginView.as_view(), name='admin-login'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
]