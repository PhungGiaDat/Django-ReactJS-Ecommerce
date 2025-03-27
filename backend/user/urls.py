from django.urls import path
from .views import AdminRegisterView, AdminLoginView, CreateUserView

urlpatterns = [
    path('register/',CreateUserView.as_view(),name='register'),
    path('admin/register/', AdminRegisterView.as_view(), name='admin-register'),
    path('login/', AdminLoginView.as_view(), name='admin-login'),
]