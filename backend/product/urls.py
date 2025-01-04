from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.Categories_List_Create.as_view(), name='categories-list-create'),
    path('categories/delete/<int:pk>/',views.Categories_Delete.as_view(), name='categories-delete'),
    path('categories/update/<int:pk>/', views.Categories_Update.as_view(), name='categories-update'),
    path('',views.Product_List_View.as_view(),name="product"),
    path('create',views.Product_List_Create.as_view(),name='product-create'),
    path('delete/<int:pk>/',views.Product_Delete.as_view(),name="product-delete"),
    path('update/<int:pk>',views.Product_Update.as_view(),name="product-update"),
]
