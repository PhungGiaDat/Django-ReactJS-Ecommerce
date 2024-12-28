from django.shortcuts import render
from rest_framework.permissions import IsAdminUser
from django.contrib.auth.models import User
from API.serializers import AdminUserSerializer
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.status import HTTP_400_BAD_REQUEST

# class AdminUserView(generics.ListCreateAPIView):
#     queryset = User.objects.all()
#     serializer_class = AdminUserSerializer()
#     permissions_classes = [A]
#
#
#     ''' This function will save when frontend submit a form  '''
#     def perform_create(self, serializer):
#         if serializer.is_valid():
#             serializer.save()
#         else:
#             return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)
