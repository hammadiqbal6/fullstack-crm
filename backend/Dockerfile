# Multi-stage build for Laravel 12 with Vite support

# Stage 1: Base PHP image with Node.js for Vite
FROM php:8.2-fpm AS base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Install Node.js 20 LTS for Vite
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Stage 2: Development build
FROM base AS development

# Copy package files first for better caching
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy composer files
COPY composer.json composer.lock* ./

# Install PHP dependencies
# Using --no-scripts to avoid package discovery errors during initial install
RUN composer install --no-scripts

# Copy application files
COPY . .

# Now run composer scripts and optimize autoloader
RUN composer dump-autoload --optimize

# Generate Laravel application key if .env exists
RUN if [ -f .env ]; then php artisan key:generate --force; fi

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage

EXPOSE 9000 8000 5173

# Default to php-fpm, but can be overridden in docker-compose
CMD ["php-fpm"]

# Stage 3: Production build
FROM base AS production

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Copy composer files
COPY composer.json composer.lock* ./

# Install PHP dependencies (no dev dependencies)
RUN composer install --no-dev --optimize-autoloader

# Copy application files
COPY . .

# Build assets with Vite
RUN npm run build

# Remove Node.js and npm (not needed in production runtime)
RUN apt-get remove -y nodejs npm \
    && apt-get autoremove -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

EXPOSE 9000 8000

# Default to php-fpm
CMD ["php-fpm"]
