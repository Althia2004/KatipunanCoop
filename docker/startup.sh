#!/bin/sh

# Forcefully remove all cached configurations to stop silent failures
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

# Run migrations (Safe, will say "Nothing to migrate")
php artisan migrate --force

# Start Nginx & PHP-FPM
nginx -g "daemon off;" &
php-fpm