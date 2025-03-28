from django.shortcuts import render
from django.contrib.auth.models import User
from API.serializers import AdminUserSerializer, UserSerializer
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.status import HTTP_400_BAD_REQUEST
from rest_framework_simplejwt.tokens import AccessToken,RefreshToken
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from rest_framework.permissions import IsAuthenticated, AllowAny,IsAdminUser
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from django.contrib.auth import get_user_model
import logging

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
        
        
User = get_user_model()
logger = logging.getLogger(__name__)
class LoginView(generics.GenericAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")

        logger.info(f"Login attempt for user: {username}")

        user = User.objects.filter(username=username).first()
        if user and user.check_password(password):
            try:
                refresh = RefreshToken.for_user(user)
                logger.info(f"Generated token for {username}: {refresh}")

                # ✅ Kiểm tra lỗi khi lưu OutstandingToken
                try:
                    OutstandingToken.objects.create(user=user, token=str(refresh))
                except Exception as e:
                    logger.error(f"Failed to save OutstandingToken: {e}")

                return Response({
                    "user": AdminUserSerializer(user).data,
                    "is_admin": user.is_staff,
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                }, status=status.HTTP_200_OK)

            except Exception as e:
                logger.error(f"Error generating token for {username}: {e}")
                return Response({"error": "Internal Server Error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)

            # ✅ Blacklist token để không sử dụng lại
            BlacklistedToken.objects.create(token=token)
            return Response({"message": "Đã đăng xuất thành công"}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": "Lỗi khi đăng xuất"}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    def get(self, request):
        user = request.user
        return Response({
            "username": user.username,
            "email": user.email,
            "is_admin": user.is_staff  # Kiểm tra quyền admin
        }, status=status.HTTP_200_OK)