#!/bin/bash
set -e

echo "==> Checking .env..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "    Created .env from .env.example"
  echo "    !! Edit .env and set SECRET_KEY, ENCRYPTION_KEY, POSTGRES_PASSWORD !!"
  exit 1
fi

echo "==> Stopping old containers..."
docker compose down --remove-orphans

echo "==> Building and starting containers..."
docker compose up --build -d

echo "==> Done!"
