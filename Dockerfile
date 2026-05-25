FROM php:8.3-fpm

# Install system dependencies required for PHP extensions
RUN apt-get update && apt-get install -y \
    nginx \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    libxml2-dev \
    libonig-dev \
    libicu-dev \
    zip \
    unzip \
    git \
    && rm -rf /var/lib/apt/lists/*

# Configure and install PHP extensions safely
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-configure intl \
    && docker-php-ext-install pdo pdo_mysql gd zip bcmath mbstring xml intl ctype

# Get modern Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY . .

# Install dependencies optimized for production
RUN composer install --no-dev --optimize-autoloader

# Create standard Laravel directories and set write permissions for Nginx
RUN mkdir -p /var/www/html/storage/framework/{cache,sessions,views} \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Copy Nginx configuration file
COPY docker/nginx.conf /etc/nginx/sites-available/default

# Expose Render's internal port and launch services via a startup script
EXPOSE 80
CMD sh docker/startup.sh