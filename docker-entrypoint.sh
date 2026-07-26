#!/bin/sh
set -e

echo "Waiting for database..."
until npx prisma db push --skip-generate >/dev/null 2>&1; do
  sleep 2
done

if [ "${NEXT_DEV:-0}" = "1" ]; then
  echo "Starting Next.js (dev)..."
  npm run dev -- --hostname 0.0.0.0 --port 3000
else
  echo "Building Next.js (production)..."
  npm run build
  echo "Starting Next.js (production)..."
  npm run start -- --hostname 0.0.0.0 --port 3000
fi
