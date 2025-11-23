# Elearn Backend (Django + DRF)

Backend API for an e-learning web application built with Django and Django REST Framework. It provides JWT-based authentication, user profiles, and course-related endpoints. This README covers setup, configuration, scripts, and development workflow for the backend service located in the `backend/` directory.

> Note: A separate frontend exists under `../frontend/` (not covered here). CORS is configured for `http://localhost:5173` during development.

## Overview
- Stack: Python, Django 5.2.8, Django REST Framework, Simple JWT, django-filter, django-cors-headers
- Database: PostgreSQL
- Auth: JWT (access/refresh) via `rest_framework_simplejwt`
- Entry point: `manage.py` (Django project name: `elearn_backend`)
- App(s): `core`
- Custom user model: `core.User` (`AUTH_USER_MODEL`)

### Implemented API endpoints
Auth
- POST `/api/auth/register/` — user registration
- POST `/api/auth/token/` — obtain JWT access and refresh tokens
- POST `/api/auth/token/refresh/` — refresh access token
- GET  `/api/auth/me/` — get current authenticated user profile

Courses
- GET  `/api/courses/` — list courses (public; supports filter/search/order)
- GET  `/api/courses/<int:pk>/` — course details (public)
- POST `/api/courses/<int:pk>/enroll/` — enroll authenticated user to a course
- GET  `/api/my-courses/` — list courses the authenticated user is enrolled in

## Requirements
- Python 3.11+ (compatible with Django 5.2.8) — TODO: confirm exact Python version used in deployment
- PostgreSQL 14+ — TODO: confirm exact version
- pip (and optionally `venv` for isolation)

Python packages (from `elearn_backend/settings.py` `INSTALLED_APPS`):
- `django`
- `djangorestframework`
- `djangorestframework-simplejwt`
- `django-cors-headers`
- `django_filters`

> Note: A `requirements.txt` is not committed. See the Setup section for installing dependencies.
> TODO: generate and commit `requirements.txt` (or adopt Poetry and create `pyproject.toml`).

## Local Setup
1. Go to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   - Windows (PowerShell):
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     ```
   - macOS/Linux (bash):
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. Install dependencies (temporary direct install; see TODO above):
   ```bash
   pip install "Django==5.2.8" djangorestframework djangorestframework-simplejwt django-cors-headers django-filter psycopg2-binary
   ```

4. Configure PostgreSQL:
   - Create database and user matching `elearn_backend/settings.py` defaults:
     ```sql
     -- in psql as a superuser
     CREATE USER elearn_user WITH PASSWORD 'strong_password';
     CREATE DATABASE elearning OWNER elearn_user;
     GRANT ALL PRIVILEGES ON DATABASE elearning TO elearn_user;
     ```
   - Alternatively, adjust the database settings via environment variables (recommended) — see Environment Variables. TODO: externalize DB config in settings.

5. Apply migrations and create a superuser:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

6. Run the development server:
   ```bash
   python manage.py runserver
   ```
   The app should be available at `http://127.0.0.1:8000/`.

## Running Tests
- Run the Django test suite:
  ```bash
  python manage.py test
  ```
- Tests live under `core/tests.py`. TODO: add/expand test coverage.

## Environment Variables
Currently, `elearn_backend/settings.py` contains inline defaults. For production, move sensitive and environment-specific values to environment variables and load them in settings.

Recommended variables (TODO: wire these into `settings.py`):
- `DJANGO_SECRET_KEY` — secret key used by Django
- `DJANGO_DEBUG` — `True`/`False`
- `DJANGO_ALLOWED_HOSTS` — comma-separated list of hosts
- `CORS_ALLOWED_ORIGINS` — comma-separated list for CORS
- `DATABASE_URL` — e.g., `postgres://user:pass@host:5432/dbname`
  - Alternatively, discrete vars: `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`

JWT configuration currently uses defaults from `rest_framework_simplejwt`.
- TODO: explicitly configure token lifetimes and related JWT settings as needed.

## Common Scripts (manage.py)
- Run dev server: `python manage.py runserver`
- Make migrations: `python manage.py makemigrations`
- Apply migrations: `python manage.py migrate`
- Create superuser: `python manage.py createsuperuser`
- Collect static files: `python manage.py collectstatic`
- Run tests: `python manage.py test`

## Project Structure
```
backend/
├─ core/
│  ├─ __init__.py
│  ├─ admin.py
│  ├─ apps.py
│  ├─ migrations/
│  │  ├─ 0001_initial.py
│  │  └─ __init__.py
│  ├─ models/
│  │  ├─ __init__.py
│  │  ├─ course.py
│  │  └─ user.py
│  ├─ serializers/
│  │  ├─ __init__.py
│  │  ├─ course.py
│  │  └─ user.py
│  ├─ tests.py
│  └─ views/
│     ├─ __init__.py
│     ├─ auth.py
│     └─ courses.py
├─ elearn_backend/
│  ├─ __init__.py
│  ├─ asgi.py
│  ├─ settings.py
│  ├─ urls.py
│  └─ wsgi.py
└─ manage.py
```

## Configuration Details
- `REST_FRAMEWORK`:
  - `DEFAULT_AUTHENTICATION_CLASSES`: `rest_framework_simplejwt.authentication.JWTAuthentication`
  - `DEFAULT_PERMISSION_CLASSES`: `rest_framework.permissions.IsAuthenticatedOrReadOnly`
  - Filters: `django_filters.rest_framework.DjangoFilterBackend`, `rest_framework.filters.SearchFilter`, `rest_framework.filters.OrderingFilter`
  - Pagination: `rest_framework.pagination.PageNumberPagination` with `PAGE_SIZE=20`
- CORS: `CORS_ALLOWED_ORIGINS` includes `http://localhost:5173`
- Allowed hosts (dev): `127.0.0.1`, `localhost`

## Development Notes
- Security: `SECRET_KEY` and DB credentials are hardcoded for local dev. TODO: move to environment variables before production.
- Requirements management: TODO: add `requirements.txt` via `pip freeze > requirements.txt` (or adopt Poetry and create `pyproject.toml`).
- API docs: Consider adding an OpenAPI schema via `drf-spectacular` or `drf-yasg`. TODO.
- Serializer/view notes: `CourseListView` and `CourseDetailView` exist; ensure serializer usage and queryset definitions are complete. TODO: review `CourseDetailView` docstring vs actual behavior.

## License
- TODO: Add license information (e.g., MIT, Apache-2.0). If this is for a thesis, confirm institutional requirements for licensing.

## Troubleshooting
- `psycopg2` build issues: on Windows/macOS, prefer `psycopg2-binary` for local dev. For production builds, use `psycopg2`.
- Database connection errors: ensure PostgreSQL is running and credentials match `settings.py`.
- CORS errors: add your frontend origin to `CORS_ALLOWED_ORIGINS` in settings.

## Links
- Django docs: https://docs.djangoproject.com/en/5.2/
- DRF docs: https://www.django-rest-framework.org/
- Simple JWT: https://django-rest-framework-simplejwt.readthedocs.io/
- django-filter: https://django-filter.readthedocs.io/
- django-cors-headers: https://github.com/adamchainz/django-cors-headers
