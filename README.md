# Visa Agency CRM System

A comprehensive CRM system for visa agencies built with Laravel backend and Next.js frontend.

## Features

- Lead management with approval workflow
- Customer onboarding with secure tokens
- Multi-role RBAC system (Admin, Staff, Customer, Viewer, Sales Rep)
- Contact assignment system
- Questionnaire system (static and dynamic)
- Visa application management
- Invoice generation and PDF export
- Document upload and management
- Gmail SMTP integration

## Tech Stack

- **Backend**: Laravel 12, PHP 8.2, MySQL
- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Authentication**: Laravel Sanctum
- **Queue**: Redis
- **Email**: Gmail SMTP
- **Containerization**: Docker & Docker Compose

## Setup Instructions

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local frontend development)
- PHP 8.2+ and Composer (for local backend development)

### Using Docker (Recommended)

1. Clone the repository
2. Copy `.env.example` to `.env` in the backend directory
3. Update environment variables in `backend/.env`:
   - Database credentials
   - Gmail SMTP credentials
   - App URLs

4. Start the services:
```bash
docker-compose up -d
```

5. Run migrations and seeders:
```bash
docker-compose exec app php artisan migrate --seed
```

6. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api
   - Mailhog (dev email testing): http://localhost:8025

### Local Development

#### Backend Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Default Roles

- **Admin**: Full system access
- **User (Staff)**: Manages assigned contacts
- **Sales Rep**: Sales representative access
- **Viewer**: Read-only access
- **Customer**: Can only access own profile and data

## API Documentation

The API is RESTful and uses Laravel Sanctum for authentication. All endpoints require authentication except:
- `POST /api/leads` - Public lead submission
- `GET /api/onboard/{token}` - Onboarding page
- `POST /api/onboard/{token}` - Complete onboarding

## Environment Variables

See `backend/.env.example` for all required environment variables.

Key variables:
- `DB_*` - Database configuration
- `MAIL_*` - Gmail SMTP configuration
- `FRONTEND_URL` - Frontend URL for email links
- `QUEUE_CONNECTION=redis` - Queue configuration

## License

Proprietary

