from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.Categories_List_Create.as_view(), name='categories-list-create'),
    path('categories/delete/<int:pk>/',views.Categories_Delete.as_view(), name='categories-delete'),
    path('categories/update/<int:pk>/', views.Categories_Update.as_view(), name='categories-update'),   
]
