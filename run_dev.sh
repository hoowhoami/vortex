#!/bin/bash

# Lumina Development Runner
# This script runs Flutter with CORS disabled for development

echo "🚀 Starting Lumina in development mode..."
echo "📝 CORS is disabled for API access"
echo ""

# Kill any existing Flutter/Chrome processes
killall -9 dart flutter chrome 2>/dev/null || true
sleep 2

# Run Flutter with CORS disabled
flutter run -d chrome \
  --web-browser-flag "--disable-web-security" \
  --web-browser-flag "--user-data-dir=/tmp/chrome_dev_test"
