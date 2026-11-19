# IHUTE Backend

FastAPI backend for the IHUTE (Ijwi ry'Umuhinzi) agricultural intelligence platform.

---

## Requirements

- Python 3.11+
- PostgreSQL with the **PostGIS** extension enabled
- Git

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/ihute.git
cd ihute/backend
```

### 2. Create a virtual environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Set up environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=postgresql+psycopg2://<db_user>:<db_password>@<db_host>:<db_port>/<db_name>
JWT_SECRET=<generate_a_long_random_string>
```

To generate a secure `JWT_SECRET` run:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### 5. Enable PostGIS on your database

Connect to your PostgreSQL database and run:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### 6. Run the server

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

---

## API Documentation

Once the server is running, open:

| URL | Description |
|-----|-------------|
| `http://localhost:8000/docs` | Swagger UI — interactive, test every endpoint |
| `http://localhost:8000/redoc` | ReDoc — clean read-only docs |
| `http://localhost:8000/openapi.json` | Raw OpenAPI spec (import into Postman) |

---

## API Endpoints Summary

### Auth — `/api/auth`

| Method | Endpoint | Who | Description |
|--------|----------|-----|-------------|
| POST | `/api/auth/register` | Public | Register as a farmer |
| POST | `/api/auth/login` | Public | Login (phone or email + password) |
| GET | `/api/auth/me` | Any logged-in user | Get current user info |

### Reports — `/api/reports`

| Method | Endpoint | Who | Description |
|--------|----------|-----|-------------|
| POST | `/api/reports` | Farmer | Submit a crop problem report (photo, voice, text) |
| GET | `/api/reports/mine` | Farmer | Get my own reports |
| GET | `/api/reports` | Officer / Admin | List reports in their area |
| GET | `/api/reports/{id}` | Farmer / Officer / Admin | Get a single report |
| PATCH | `/api/reports/{id}/review` | Officer / Admin | Verify, reject or request more info |

### Alerts — `/api/alerts`

| Method | Endpoint | Who | Description |
|--------|----------|-----|-------------|
| POST | `/api/alerts` | Officer / Admin | Draft a community alert |
| GET | `/api/alerts/officer` | Officer / Admin | List alerts in their area |
| GET | `/api/alerts/clusters` | Officer / Admin | View disease clusters |
| PATCH | `/api/alerts/{id}/approve` | Officer / Admin | Approve and send an alert |
| PATCH | `/api/alerts/{id}/dismiss` | Officer / Admin | Dismiss an alert |
| GET | `/api/alerts` | Any logged-in user | Get sent alerts for my area (farmer view) |

### Admin — `/api/admin`

| Method | Endpoint | Who | Description |
|--------|----------|-----|-------------|
| POST | `/api/admin/users` | Admin | Create an officer or admin account |
| GET | `/api/admin/users` | Admin | List all users |
| PATCH | `/api/admin/users/{id}/deactivate` | Admin | Deactivate a user |
| PATCH | `/api/admin/users/{id}/activate` | Admin | Reactivate a user |

---

## Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

The token is returned from `/api/auth/register` and `/api/auth/login`.

---

## Roles

| Role | What they can do |
|------|-----------------|
| `farmer` | Submit reports, view own reports, view alerts for their area |
| `officer` | Review reports, manage alerts and clusters in their district/sector |
| `admin` | Everything — plus create officer/admin accounts |

> Self-registration always creates a `farmer`. Officers and admins must be created by an admin via `POST /api/admin/users`.

---

## Project Structure

```
backend/
├── main.py              # App entry point, middleware, router registration
├── models.py            # SQLAlchemy database models
├── schemas.py           # Pydantic request/response schemas
├── database.py          # Database connection
├── security.py          # JWT and password hashing
├── deps.py              # Auth dependencies (get_current_user, require_role)
├── auth_routes.py       # Register, login, me
├── reports_routes.py    # Farmer report submission and officer listing
├── review_routes.py     # Officer report review
├── alerts_routes.py     # Community alerts and clusters
├── admin_routes.py      # Admin user management
├── cluster_logic.py     # Auto-detect disease clusters after verification
├── ai.py                # AI integration (image model + voice transcription)
├── storage.py           # File upload handling (photos, voice notes)
├── requirements.txt
├── .env.example
└── uploads/             # Uploaded files (not committed to Git)
```

---

## Deployment (Render)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) and create a new **Web Service**
3. Connect your GitHub repository
4. Set the following:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port 10000`
5. Add environment variables in the Render dashboard:
   - `DATABASE_URL` — your PostgreSQL connection string
   - `JWT_SECRET` — your secret key
6. Use [Render PostgreSQL](https://render.com/docs/databases) or [Supabase](https://supabase.com) for the database (both have free tiers with PostGIS support)

---

## Notes

- Uploaded photos and voice notes are stored in `uploads/` which is excluded from Git
- The `.env` file is excluded from Git — never commit it
- PostGIS must be enabled on the database before the first run
