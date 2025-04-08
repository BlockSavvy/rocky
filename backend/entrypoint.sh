#!/bin/sh

# Exit on error
set -e

# Run the Uvicorn server, using the HOST and PORT env vars
# Render provides PORT, HOST defaults to 0.0.0.0 from Dockerfile
echo "Starting Uvicorn on host $HOST port $PORT"
uvicorn main:app --host "${HOST:-0.0.0.0}" --port "${PORT:-8000}" 