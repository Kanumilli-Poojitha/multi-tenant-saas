#!/bin/sh
set -e

echo "⏳ Waiting for database..."
sleep 5

echo "🚀 Running migrations & seeds..."
node scripts/init.js

echo "🚀 Starting backend..."
node src/server.js