#!/bin/zsh

# Exit immediately if a command exits with a non-zero status.
# set -e # Commented out for debugging

echo "Attempting to stop existing dev servers..."

# Find and kill processes on port 8000 (Backend)
BACKEND_PID=$(lsof -ti tcp:8000)
if [ -n "$BACKEND_PID" ]; then
  echo "Killing backend process (PID: $BACKEND_PID) on port 8000..."
  # Use kill -9 for force, add || true to prevent exit if already stopped
  kill -9 $BACKEND_PID || true 
else
  echo "No process found on port 8000."
fi

# Find and kill processes on port 3000 (Frontend)
FRONTEND_PID=$(lsof -ti tcp:3000)
if [ -n "$FRONTEND_PID" ]; then
  echo "Killing frontend process (PID: $FRONTEND_PID) on port 3000..."
  kill -9 $FRONTEND_PID || true 
else
  echo "No process found on port 3000."
fi

# Wait a moment for ports to be released
echo "Waiting for ports to release..."
sleep 2

# Determine Log Directory (project root)
LOG_DIR=$(pwd)
BACKEND_LOG="$LOG_DIR/backend_nohup.log"
FRONTEND_LOG="$LOG_DIR/frontend_nohup.log"

echo "Starting backend server in background (Logs: $BACKEND_LOG)..."
cd backend
if [ -d "venv/bin" ]; then
    source venv/bin/activate
    # Use nohup, redirect stdout/stderr, run in background (&)
    nohup uvicorn main:app --reload --port 8000 > "$BACKEND_LOG" 2>&1 &
    # Deactivate immediately after launching
    deactivate 
else
    echo "Backend virtual environment 'venv' not found. Skipping backend start."
fi
cd ..

echo "Starting frontend server in background (Logs: $FRONTEND_LOG)..."
# Use nohup, redirect stdout/stderr, run in background (&)
nohup npm run dev > "$FRONTEND_LOG" 2>&1 &

echo "Restart script finished. Servers starting in background."
echo "Check $BACKEND_LOG and $FRONTEND_LOG for server output/errors."
