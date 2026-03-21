# Training Platform

AI-powered тренировочная платформа для циклических видов спорта и OCR-гонок.

## Стек

- **Backend**: Python 3.12 + FastAPI + SQLAlchemy 2 + Alembic + Celery
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **БД**: PostgreSQL 16
- **Кэш / очередь**: Redis 7
- **AI**: Claude API

## Запуск

### 1. Переменные окружения

```bash
cp .env.example .env
```

`.env` уже заполнен для локальной разработки — ничего менять не нужно.

### 2. Поднять сервисы

```bash
docker compose up --build
```

### 3. Применить миграции (первый раз)

```bash
docker compose exec backend alembic upgrade head
```

---

## URL

| Сервис | URL |
|--------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |
| Health check | http://localhost:8000/health |

## Подключение к БД

| Параметр | Значение |
|----------|----------|
| Host | `localhost` |
| Port | `5433` |
| Database | `training_platform` |
| User | `postgres` |
| Password | `postgres` |

> Порт `5433` — чтобы не конфликтовать с локальным PostgreSQL.

## Тесты

```bash
docker compose exec backend pytest --cov=app -v
```

## Полезные команды

```bash
# Остановить всё
docker compose down

# Остановить и удалить данные БД
docker compose down -v

# Новая миграция
docker compose exec backend alembic revision --autogenerate -m "description"

# Логи конкретного сервиса
docker compose logs -f backend
docker compose logs -f frontend
```
