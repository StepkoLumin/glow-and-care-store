from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.permissions import AllowAny
from .serializers import UserSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    # Дозволяємо реєстрацію будь-кому (навіть неавторизованим користувачам)
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer
