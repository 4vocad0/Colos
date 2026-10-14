#!/bin/bash
set -e

echo "⏳ Czekam na uruchomienie bazy danych PostgreSQL..."
python -c "
import time
import psycopg2
from psycopg2 import OperationalError
import os

db_name = os.environ.get('POSTGRES_DB', 'kolos_db')
db_user = os.environ.get('POSTGRES_USER', 'postgres')
db_password = os.environ.get('POSTGRES_PASSWORD', 'postgres')
db_host = os.environ.get('POSTGRES_HOST', 'db')

while True:
    try:
        psycopg2.connect(dbname=db_name, user=db_user, password=db_password, host=db_host)
        break
    except OperationalError:
        print('Baza jeszcze się inicjalizuje... czekam 1 sekundę.')
        time.sleep(1)
print('✅ Baza danych jest gotowa na połączenia!')
"

echo "⚙️ Aplikowanie migracji bazy danych..."
python manage.py migrate --noinput

echo "🦸 Sprawdzanie superużytkownika..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@edu.pl', 'admin')
    print('✅ Utworzono domyślnego superużytkownika (login: admin, hasło: admin)')
else:
    print('✅ Superużytkownik już istnieje. Pomijam.')
"

echo "💪 Uzupełnianie BodyParts..."
python manage.py shell -c "
from workouts.models import BodyPart
names = [
    'Klatka', 'Plecy', 'Barki', 'Biceps', 'Triceps',
    'Brzuch', 'Czworogłowe', 'Dwugłowe', 'Pośladki', 'Łydki',
    'Przedramiona', 'Trapezy',
]
created = 0
for name in names:
    _, was_created = BodyPart.objects.get_or_create(name=name)
    if was_created:
        created += 1
print(f'✅ BodyParts: {BodyPart.objects.count()} łącznie ({created} nowych)')
"

echo "🚀 Uruchamianie serwera Django..."
exec "$@"
