from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.response import Response
from rest_framework import serializers
# Create your views here.
''' Lớp dùng để kiểm tra và thực hiện các hàm khi từng lớp con kế thừa'''
class BaseUserOwnedView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(created_by=self.request.user, updated_by=self.request.user)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    def perform_destroy(self, instance):
        if instance.created_by != self.request.user:
            raise serializers.ValidationError({'error': 'You do not have permission to delete this object'})
        instance.delete()
