from django.shortcuts import render
from API.serializers import StockEntrySerializer,StockTransactionSerializer,StockSerializer
from rest_framework import serializers,generics
from core.views import BaseUserOwnedView
from .models import StockEntry,StockTransaction,Stock
# Create your views here.


'''API view để lấy thông tin danh sách số lượng sản phẩm trong kho'''
class StockListView(BaseUserOwnedView,generics.ListAPIView):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    
'''API view lấy chi tiết 1 sản phẩm trong kho'''
class StockDetailView(BaseUserOwnedView,generics.RetrieveAPIView):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    
## API NHẬP KHO ## 

class StockEntryListCreateView(BaseUserOwnedView,generics.ListCreateAPIView):
    queryset = StockEntry.objects.all()
    serializer_class = StockEntrySerializer
    
    def perform_create(self,serializer):
        stock_entry = serializer.save(created_by= self.request.user, updated_by = self.request.user)
        
        
        # Gọi hàm Cập nhật bản stock
        stock, created = Stock.objects.get_or_create(product= stock_entry.product)
        stock.quantity += stock_entry.quantity
        stock.save()

class StockEntryDetailView(BaseUserOwnedView,generics.RetrieveAPIView):
    queryset = StockEntry.objects.all()
    serializer_class = StockEntrySerializer
    

## API Giao dịch Kho ## 
class StockTransactionListCreateView(BaseUserOwnedView, generics.ListCreateAPIView):
    queryset = StockTransaction.objects.all()
    serializer_class = StockTransactionSerializer


class StockTransactionDetailView(BaseUserOwnedView, generics.RetrieveUpdateDestroyAPIView):
    queryset = StockTransaction.objects.all()
    serializer_class = StockTransactionSerializer
    
