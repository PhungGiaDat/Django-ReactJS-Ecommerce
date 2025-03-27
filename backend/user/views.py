from django.shortcuts import render
from django.contrib.auth.models import User
from API.serializers import AdminUserSerializer, UserSerializer
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.status import HTTP_400_BAD_REQUEST
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.permissions import IsAuthenticated, AllowAny,IsAdminUser
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    
class CheckSuperUserView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self,request):
        user = request.user
        if user.is_superuser:
            return Response(
                {
                    'is_superuser':True,
                    'message':'You are a superuser'
                },status=status.HTTP_200_OK
            )

# ✅ Endpoint Đăng Ký Admin
class AdminRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [AllowAny]  # Cho phép tất cả người dùng đăng ký

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Tạo Token cho Admin
        refresh = RefreshToken.for_user(user)
        return Response({
            "user": AdminUserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token)
        }, status=status.HTTP_201_CREATED)
        
class LoginView(generics.GenericAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")

        user = User.objects.filter(username=username).first()
        if user and user.check_password(password):
            refresh = RefreshToken.for_user(user)
            return Response({
                "user": AdminUserSerializer(user).data,
                "is_admin": user.is_staff,  # ✅ Trả về trạng thái admin
                "refresh": str(refresh),
                "access": str(refresh.access_token)
            }, status=status.HTTP_200_OK)
        
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


