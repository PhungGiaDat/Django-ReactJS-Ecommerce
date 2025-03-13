from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated,AllowAny


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