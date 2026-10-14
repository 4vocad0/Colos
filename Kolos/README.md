## 🚀 Uruchomienie projektu

Wymagania: **Docker** oraz **Docker Compose**.

1. Przejdź do folderu z infrastrukturą:

```bash
cd infra/docker

```

2. Zbuduj obrazy (wymagane przy pierwszym uruchomieniu lub po dodaniu nowych bibliotek w plikach `requirements` / `package.json`):

```bash
docker-compose build

```

3. Uruchom środowisko w tle:

```bash
docker-compose up -d

```

> **Ważne:** Baza danych, migracje oraz domyślne konto administratora (`admin` / `admin`) inicjalizują się **automatycznie** przy starcie środowiska dzięki skryptowi `entrypoint.sh`.

Zatrzymanie środowiska: `docker-compose down` (dodanie flagi `-v` bezpowrotnie usunie bazę danych).

Wejdź na `localhost:3000`, powinien pojawić się panel logowania ;)


---

## 🔐 Autoryzacja i Dokumentacja API

API zabezpieczone jest za pomocą JSON Web Tokens. Po zalogowaniu do każdego zapytania należy dołączyć nagłówek: `Authorization: Bearer <twój_token>`.

Pełną dokumentację, schematy JSON i możliwość testowania na żywo (przycisk *Authorize*) znajdziesz pod adresami:

* **Swagger UI:** [http://localhost:8000/api/schema/swagger-ui/](https://www.google.com/search?q=http://localhost:8000/api/schema/swagger-ui/)
* **ReDoc:** [http://localhost:8000/api/schema/redoc/](https://www.google.com/search?q=http://localhost:8000/api/schema/redoc/)

---

## 📍 Główne Endpointy REST API (localhost:8000)

**👤 Autoryzacja (`/api/...`)**

* `POST /auth/register/` - Rejestracja
* `POST /token/` - Pobranie tokenów JWT (Logowanie)
* `POST /token/refresh/` - Odświeżenie tokena

**🏋️ Treningi (`/api/workouts/...`)**

* `GET, POST /exercises/` - Baza ćwiczeń (globalne i prywatne)
* `GET, POST /plans/` - Szablony planów treningowych
* `GET, POST /plan-days/` - Dni w ramach danego planu
* `GET, POST /plan-exercises/` - Konkretne ćwiczenia przypisane do dnia
* `GET, POST /sessions/` - Dziennik (zrealizowane jednostki)
* `GET, POST /sets/` - Wykonane serie i powtórzenia

**🤝 Społeczność (`/api/social/...`)**

* `GET, POST /groups/` - Grupy użytkowników
* `GET, POST /members/` - Członkostwo w grupach
* `GET, POST /posts/` - Posty na tablicy
* `GET, POST /likes/` - Polubienia postów
* `GET, POST /comments/` - Komentarze pod postami

**💬 Komunikator (`/api/chat/...`)**

* `GET, POST /messages/` - Wiadomości prywatne (tekst, media, udostępnianie planów)

```

```