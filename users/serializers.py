from django.contrib.auth.models import User
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password', 'email')
        # Робимо пароль прихованим (write_only), щоб він не повертався у відповідях
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # Використовуємо create_user, щоб Django автоматично захешував (зашифрував) пароль
        user = User.objects.create_user(**validated_data)
        return user