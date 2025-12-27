#!/bin/sh
set -e

echo "Running database migrations..."

# Run Prisma migrations
npx prisma migrate deploy

echo "Migrations completed successfully!"

# Execute the CMD passed to the container
exec "$@"
