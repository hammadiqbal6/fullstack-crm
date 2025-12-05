# Quick Start Guide

## Running Both Apps with Docker Compose

### Step 1: Setup Environment

1. **Backend Environment:**
```bash
cd backend
cp .env.example .env
```

2. **Edit `backend/.env` and set:**
```env
APP_NAME=CRM
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=crm
DB_USERNAME=crm_user
DB_PASSWORD=password

REDIS_HOST=redis
REDIS_PORT=6379

QUEUE_CONNECTION=redis

# For development - use Mailhog
MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS=noreply@crm.local
MAIL_FROM_NAME="${APP_NAME}"

# For production - use Gmail SMTP
# MAIL_MAILER=smtp
# MAIL_HOST=smtp.gmail.com
# MAIL_PORT=587
# MAIL_USERNAME=your-email@gmail.com
# MAIL_PASSWORD=your-app-password
# MAIL_ENCRYPTION=tls
```

3. **Frontend Environment (optional):**
```bash
cd frontend
# Create .env.local if needed
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
```

### Step 2: Start All Services

```bash
# From the project root directory
docker-compose up -d
```

This will start:
- **Backend (Laravel)**: http://localhost:8000
- **Frontend (Next.js)**: http://localhost:3000
- **Database (MySQL)**: localhost:3306
- **Redis**: localhost:6379
- **Mailhog**: http://localhost:8025 (for email testing)
- **Nginx**: http://localhost (proxies to frontend/backend)

### Step 3: Initialize Database

```bash
# Generate application key
docker-compose exec app php artisan key:generate

# Run migrations and seeders
docker-compose exec app php artisan migrate --seed
```

### Step 4: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **API Health Check**: http://localhost:8000/up
- **Mailhog UI**: http://localhost:8025 (view test emails)

### Useful Commands

```bash
# View logs
docker-compose logs -f app          # Backend logs
docker-compose logs -f frontend    # Frontend logs
docker-compose logs -f              # All logs

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# Rebuild containers
docker-compose up -d --build

# Run artisan commands
docker-compose exec app php artisan migrate
docker-compose exec app php artisan queue:work

# Access backend container shell
docker-compose exec app bash

# Access database
docker-compose exec db mysql -u crm_user -ppassword crm
```

---

## Running Locally (Without Docker)

### Backend (Laravel)

```bash
cd backend

# Install dependencies
composer install

# Setup environment
cp .env.example .env
php artisan key:generate

# Configure .env with local database
# DB_HOST=127.0.0.1
# DB_DATABASE=crm
# etc.

# Run migrations
php artisan migrate --seed

# Start server
php artisan serve
# Backend runs on http://localhost:8000
```

### Frontend (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local

# Start development server
npm run dev
# Frontend runs on http://localhost:3000
```

### Prerequisites for Local Development

- **MySQL** running locally (or use Docker just for DB)
- **Redis** running locally (or use Docker just for Redis)
- **PHP 8.2+** with extensions: pdo_mysql, mbstring, redis
- **Node.js 20+** and npm

---

## Troubleshooting

### Port Already in Use

If ports 3000, 8000, or 80 are already in use:

1. **Change ports in docker-compose.yml:**
```yaml
ports:
  - "3001:3000"  # Frontend on 3001 instead
  - "8001:8000"  # Backend on 8001 instead
```

2. **Update frontend .env.local:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8001/api
```

### Database Connection Issues

Make sure:
- Database service is running: `docker-compose ps`
- Environment variables in `.env` match docker-compose.yml
- Database credentials are correct

### Frontend Can't Connect to Backend

- Check CORS settings in `backend/config/cors.php`
- Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Check backend is running: http://localhost:8000/up

