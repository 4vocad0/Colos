from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = (
            'username', 'email', 'password', 'country', 
            'gender', 'age', 'height', 'weight', 'description'
        )

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Użytkownik o podanym adresie e-mail już istnieje.")
        return value

    def create(self, validated_data):
        # Metoda create_user automatycznie zajmuje się bezpiecznym haszowaniem hasła (funkcją PBKDF2)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            country=validated_data.get('country', ''),
            gender=validated_data.get('gender', 'O'),
            age=validated_data.get('age'),
            height=validated_data.get('height'),
            weight=validated_data.get('weight'),
            description=validated_data.get('description', '')
        )
        return user