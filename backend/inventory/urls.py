from django.urls import path 
from .views import (
    StockListView, StockDetailView,
    StockEntryListCreateView, StockEntryDetailView,
    StockTransactionListCreateView, StockTransactionDetailView
)

urlpatterns = [
    path('stocks/', StockListView.as_view(), name='stock-list'),
    path('stocks/<int:product_id>/', StockDetailView.as_view(), name='stock-detail'),

    path('stock-entries/', StockEntryListCreateView.as_view(), name='stock-entry-list-create'),
    path('stock-entries/<int:pk>/', StockEntryDetailView.as_view(), name='stock-entry-detail'),

    path('stock-transactions/', StockTransactionListCreateView.as_view(), name='stock-transaction-list-create'),
    path('stock-transactions/<int:pk>/', StockTransactionDetailView.as_view(), name='stock-transaction-detail'),
]
