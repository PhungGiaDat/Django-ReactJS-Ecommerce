from django.urls import path
from . import views
from django.conf import  settings
from django.conf.urls.static import static

from .views import Product_Detail_View

urlpatterns = [
    path('categories/', views.Categories_List_Create.as_view(), name='categories-list-create'),
    path('categories/delete/<int:pk>/',views.Categories_Delete.as_view(), name='categories-delete'),
    path('categories/update/<int:pk>/', views.Categories_Update.as_view(), name='categories-update'),
    path("categories/public",views.Categoris_Public_List_View.as_view(),name="Categories-public"),
    path('',views.Product_List_View.as_view(),name="product"),
    path('public',views.Product_Public_List_View.as_view(),name="public-product"),
    path("<int:pk>/",Product_Detail_View.as_view(), name='product-detail'),
    path('create',views.Product_List_Create.as_view(),name='product-create'),
    path('delete/<int:pk>/',views.Product_Delete.as_view(),name="product-delete"),
    path('update/<int:pk>',views.Product_Update.as_view(),name="product-update"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)