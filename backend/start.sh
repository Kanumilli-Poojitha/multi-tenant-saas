#!/bin/sh
set -e

echo "🚀 Running migrations & seeds..."
node scripts/init.js

echo "🚀 Starting backend..."
node src/server.js