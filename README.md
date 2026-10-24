# Learn Universe development baseline

The project is a React/Vite frontend and Django REST Framework backend with PostgreSQL. This baseline supports local development for the AI-assisted programming education assignment. AI exercises are the next implementation stage.

## Start on this machine

Start Docker Desktop first. In a terminal, from `learn_universe_backend`:

```sh
docker compose --env-file /dev/null up -d --wait postgres
venv/bin/python manage.py migrate
venv/bin/python manage.py runserver 127.0.0.1:8000
```

In a second terminal, from `learn_universe_frontend`:

```sh
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Open http://127.0.0.1:5173/. The API is at http://127.0.0.1:8000/api/v1/ and Django admin is at http://127.0.0.1:8000/admin/.

`--env-file /dev/null` keeps Compose from interpreting unrelated application secrets in `.env`. The Compose file contains local database defaults; if changing these, update the matching backend POSTGRES variables too. The database is bound to loopback and persists in its Docker volume. `docker compose --env-file /dev/null stop` stops it without deleting data.

## Set up another checkout

The existing environment was verified with Python 3.9.6, Django 4.2.9, Node 25.9.0 and PostgreSQL 16. These are the current baseline versions, not a production version recommendation. The inherited Python runtime emits an urllib3/LibreSSL warning.

From `learn_universe_backend`:

```sh
python3 -m venv venv
venv/bin/python -m pip install -r requirements-baseline.txt
cp -n .env.example .env
docker compose --env-file /dev/null up -d --wait postgres
venv/bin/python manage.py migrate
```

`requirements-baseline.txt` records the installed working backend environment. The original `requirements.txt` mixes application packages with unrelated scientific/notebook packages and omits some installed Django integrations. A fresh install on another machine has not yet been verified. Do not replace an existing `.env` with the example.

From `learn_universe_frontend`:

```sh
npm ci
```

The API URL defaults to localhost; `.env.example` documents the optional `VITE_API_BASE_URL` override. Keep the trailing `/api/v1/` path and slash.

## Demo accounts and data

The current database already contains demo data; do not reseed it unnecessarily.

| Role | Email | Local demo password |
| --- | --- | --- |
| Student | alice.brown@learnuniverse.local | student123 |
| Instructor | john.smith@learnuniverse.local | teacher123 |

Only for a new, empty development database, run `venv/bin/python manage.py seed_data`. This command resets the demo account passwords and populates sample content; it is not a production data migration. Create your own admin account with `venv/bin/python manage.py createsuperuser` when needed.

Email defaults to the console backend. No real email provider or payment key is needed for the core learning workflow. Do not put real credentials in example files or commit `.env`.

## Verification

Backend:

```sh
venv/bin/python manage.py check
venv/bin/python manage.py test --noinput
venv/bin/python manage.py makemigrations --check --dry-run
venv/bin/python -m pip check
```

Tests use a separate PostgreSQL test database. Frontend:

```sh
npm run build
npm run lint
```

See `docs/day-1-baseline.md` for actual results and outstanding issues. The full lint gate currently fails; a successful build does not imply a clean lint report.
