#!/bin/bash

set -e

echo "🚀 Starting test containers..."
docker compose -f ../sos-ops/docker-postgres-test.yml up -d

echo "⌛ Waiting for containers to be ready..."
sleep 5 

echo "🗑 Dropping test database..."
npx sequelize-cli db:drop --env test

echo "📂 Creating test database..."
npx sequelize-cli db:create --env test

echo "📦 Running migrations..."
npx sequelize-cli db:migrate --env test

echo "🌱 Running seeders..."
npx sequelize-cli db:seed:all --env test --seeders-path ./src/seeders

echo "🧪 Running tests..."
NODE_ENV=test REDIS_HOST=localhost REDIS_PORT=6380 npm test
