#!/bin/bash

# Dependency Audit Script for FarmConnect Monorepo

echo "🔍 Starting Security Audit for Monorepo Dependencies..."

echo "------------------------------------------------"
echo "📦 Auditing Root..."
npm audit

echo "------------------------------------------------"
echo "📦 Auditing Backend..."
cd apps/backend && npm audit && cd ../..

echo "------------------------------------------------"
echo "📦 Auditing Web App..."
cd apps/web && npm audit && cd ../..

echo "------------------------------------------------"
echo "🐍 Auditing AI Service (Python)..."
# Using safety if available, otherwise just pip list
if command -v safety &> /dev/null
then
    safety check -r services/ai-service/requirements.txt
else
    echo "⚠️ 'safety' tool not found. Running basic outdated check..."
    pip list --outdated --format=columns | grep -E "Pillow|torch|FastAPI|jwt"
fi

echo "------------------------------------------------"
echo "✅ Audit Complete."
