#!/bin/sh
set -e

echo "Waiting for database..."
until npx prisma db push --skip-generate >/dev/null 2>&1; do
  sleep 2
done

echo "Starting Next.js..."
npm run dev -- --hostname 0.0.0.0 --port 3000
