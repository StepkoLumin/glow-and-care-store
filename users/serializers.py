from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Product, Order, OrderItem

# Серіалізатор для користувача (реєстрація)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password', 'email')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

# Серіалізатор для товарів
class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

# Серіалізатор для одного товару в кошику
class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['product', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        # ДОДАЛИ НОВІ ПОЛЯ В СПИСОК:
        fields = [
            'id','status', 'total_price', 'created_at', 'items',
            'last_name', 'first_name', 'middle_name', 
            'phone', 'city', 'nova_poshta'
        ]
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        return order