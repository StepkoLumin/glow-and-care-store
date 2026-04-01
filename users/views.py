from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import User
from .models import Product, Order
from .serializers import UserSerializer, ProductSerializer, OrderSerializer

# В'юшка для реєстрації
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

# В'юшка для списку товарів
class ProductListView(generics.ListAPIView):
    queryset = Product.objects.all() 
    serializer_class = ProductSerializer
    permission_classes = (AllowAny,) 

# В'юшка для створення замовлення (ТА САМА, ЯКОЇ НЕ ВИСТАЧАЛО)
class CreateOrderView(generics.CreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Автоматично підставляємо користувача, який робить замовлення
        serializer.save(user=self.request.user)