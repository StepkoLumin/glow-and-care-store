from django.db import models
from django.contrib.auth.models import User

class Product(models.Model):
    CATEGORY_CHOICES = [
        ('face', 'Обличчя'),
        ('hair', 'Волосся'),
    ]

    name = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    image_url = models.CharField(max_length=500)
    needs = models.CharField(max_length=255)

    def __str__(self):
        return self.name


STATUS_CHOICES = [
    ('pending', 'Очікує підтвердження'),
    ('processing', 'В обробці'),
    ('shipped', 'Відправлено'),
    ('delivered', 'Отримано'),
    ('canceled', 'Скасовано'),
]


class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Статус")
    
    # НОВІ ПОЛЯ ДЛЯ ДОСТАВКИ
    last_name = models.CharField(max_length=100, blank=True, null=True, verbose_name="Прізвище")
    first_name = models.CharField(max_length=100, blank=True, null=True, verbose_name="Ім'я")
    middle_name = models.CharField(max_length=100, blank=True, null=True, verbose_name="По батькові")
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Телефон")
    city = models.CharField(max_length=100, blank=True, null=True, verbose_name="Місто")
    nova_poshta = models.CharField(max_length=255, blank=True, null=True, verbose_name="Відділення НП")

    def __str__(self):
        return f"Замовлення {self.id} від {self.user.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} шт. {self.product.name}"
    
    