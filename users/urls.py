from django.urls import path
from .views import RegisterView, ProductListView, CreateOrderView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('products/', ProductListView.as_view(), name='product-list'),
    path('orders/', CreateOrderView.as_view(), name='create-order'),
]
from .views import RegisterView, ProductListView, CreateOrderView, UserOrdersListView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('products/', ProductListView.as_view(), name='product-list'),
    path('orders/', CreateOrderView.as_view(), name='create-order'),
    
    # НАШ НОВИЙ МАРШРУТ ДЛЯ КАБІНЕТУ
    path('orders/my/', UserOrdersListView.as_view(), name='my-orders'), 
]