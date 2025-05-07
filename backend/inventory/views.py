from django.shortcuts import render
from API.serializers import StockEntrySerializer,StockTransactionSerializer,StockSerializer
from rest_framework import serializers,generics
from core.views import BaseUserOwnedView
from .models import StockEntry,StockTransaction,Stock
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from product.models import Product
from rest_framework.permissions import IsAuthenticated, IsAdminUser
# Create your views here.


'''API view để lấy thông tin danh sách số lượng sản phẩm trong kho'''
class StockListView(BaseUserOwnedView, generics.ListAPIView):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
'''API view lấy chi tiết 1 sản phẩm trong kho'''
class StockDetailView(BaseUserOwnedView, generics.RetrieveAPIView):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_object(self):
        product_id = self.kwargs.get('product_id')
        try:
            # First check if product exists
            product = get_object_or_404(Product, id=product_id)
            # Then get or create stock for this product
            stock, created = Stock.objects.get_or_create(
                product=product,
                defaults={'quantity': 0}
            )
            return stock
        except Product.DoesNotExist:
            return Response(
                {"detail": "Product not found"},
                status=status.HTTP_404_NOT_FOUND
            )
    
## API NHẬP KHO ## 

class StockEntryListCreateView(BaseUserOwnedView,generics.ListCreateAPIView):
    queryset = StockEntry.objects.all()
    serializer_class = StockEntrySerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        queryset = StockEntry.objects.all()
        product_id = self.request.query_params.get('product', None)
        if product_id is not None:
            queryset = queryset.filter(product_id=product_id).order_by('-purchase_date')
        return queryset
    
    def perform_create(self,serializer):
        stock_entry = serializer.save(created_by= self.request.user, updated_by = self.request.user)
        
        
        # Gọi hàm Cập nhật bản stock
        stock, created = Stock.objects.get_or_create(
            product=stock_entry.product,
            defaults={'quantity': 0}
        )
        stock.quantity += stock_entry.quantity
        stock.save()

class StockEntryDetailView(BaseUserOwnedView,generics.RetrieveAPIView):
    queryset = StockEntry.objects.all()
    serializer_class = StockEntrySerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    

## API Giao dịch Kho ## 
class StockTransactionListCreateView(BaseUserOwnedView, generics.ListCreateAPIView):
    queryset = StockTransaction.objects.all()
    serializer_class = StockTransactionSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


class StockTransactionDetailView(BaseUserOwnedView, generics.RetrieveUpdateDestroyAPIView):
    queryset = StockTransaction.objects.all()
    serializer_class = StockTransactionSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
