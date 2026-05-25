#!/bin/sh

# Cache configurations for speed
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run database migrations automatically
php artisan migrate --force

# Start PHP-FPM in the background and Nginx in the foreground
php-fpm -D && nginx -g "daemon off;"