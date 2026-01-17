#!/bin/bash
# Railway startup script with environment validation

echo "🚀 AskUni Backend - Railway Startup"
echo "======================================"

# Check required environment variables
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL is not set!"
    echo "   Please add a PostgreSQL database in Railway"
    exit 1
fi

if [ -z "$MISTRAL_API_KEY" ]; then
    echo "⚠️  WARNING: MISTRAL_API_KEY is not set!"
    echo "   Chat responses will fail without Mistral API key"
fi

# Set default SECRET_KEY if not provided
if [ -z "$SECRET_KEY" ]; then
    export SECRET_KEY="default-secret-key-change-in-production-$(date +%s)"
    echo "⚠️  Using default SECRET_KEY (not secure for production)"
fi

# Print environment info (without sensitive data)
echo ""
echo "Environment Configuration:"
echo "  DATABASE_URL: ${DATABASE_URL:0:20}... ✓"
echo "  MISTRAL_API_KEY: ${MISTRAL_API_KEY:+SET} ${MISTRAL_API_KEY:-NOT SET}"
echo "  SECRET_KEY: ${SECRET_KEY:0:10}... ✓"
echo "  PORT: ${PORT:-8000}"
echo ""

# Start uvicorn
echo "🎯 Starting Uvicorn on port ${PORT:-8000}..."
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
