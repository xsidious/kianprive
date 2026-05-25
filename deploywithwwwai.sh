#!/usr/bin/env bash
set -euo pipefail

ZIP_PATH="${1:-kianprive-deploy.zip}"
TARGET_DIR="${2:-/var/www/kianprive}"
RELEASE_TAG="${3:-$(date +%Y%m%d-%H%M%S)}"
RESTART_CMD="${RESTART_CMD:-}"

if [[ ! -f "$ZIP_PATH" ]]; then
  echo "Zip package not found: $ZIP_PATH"
  echo "Usage: ./deploywithwwwai.sh <zip-path> [target-dir] [release-tag]"
  exit 1
fi

mkdir -p "$TARGET_DIR/releases" "$TARGET_DIR/shared"
RELEASE_DIR="$TARGET_DIR/releases/$RELEASE_TAG"
mkdir -p "$RELEASE_DIR"

echo "Extracting package into $RELEASE_DIR"
unzip -q "$ZIP_PATH" -d "$RELEASE_DIR"
cd "$RELEASE_DIR"

if [[ ! -f ".env" && -f "$TARGET_DIR/shared/.env" ]]; then
  ln -s "$TARGET_DIR/shared/.env" ".env"
fi

if [[ ! -f ".env" && -f ".env.example" ]]; then
  echo "No .env found. Copying from .env.example"
  cp .env.example .env
fi

echo "Installing dependencies"
npm ci

echo "Generating Prisma client"
npx prisma generate

if [[ "${RUN_PRISMA_DB_PUSH:-0}" == "1" ]]; then
  echo "Applying Prisma schema with db push"
  npx prisma db push
fi

echo "Building Next.js app"
npm run build

ln -sfn "$RELEASE_DIR" "$TARGET_DIR/current"

if [[ -n "$RESTART_CMD" ]]; then
  echo "Restarting app with: $RESTART_CMD"
  eval "$RESTART_CMD"
else
  echo "Deployment complete. Set RESTART_CMD to restart your process manager."
fi

echo "Current release: $RELEASE_DIR"
