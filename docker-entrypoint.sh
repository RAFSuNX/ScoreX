#!/bin/sh
set -e

echo "Ensuring Prisma Client is generated..."

# Generate Prisma Client (safe to run multiple times)
npx prisma generate

echo "Running database migrations..."

# Run Prisma migrations
npx prisma migrate deploy

echo "Migrations completed successfully!"

# Execute the CMD passed to the container
exec "$@"
