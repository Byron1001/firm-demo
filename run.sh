#!/usr/bin/env bash
set -e

BACKEND_DIR="$(dirname "$0")/backend"
BACKEND_PORT=8080
FRONTEND_PORT=4321

cleanup() {
  echo ""
  echo "Shutting down..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
  echo "Done."
}
trap cleanup EXIT INT TERM

echo "=== Lexicon Legal ==="
echo ""

# Kill anything already on our ports
kill $(lsof -ti:$BACKEND_PORT) 2>/dev/null || true
kill $(lsof -ti:$FRONTEND_PORT) 2>/dev/null || true

# Start backend
echo "[1/3] Building backend..."
(cd "$BACKEND_DIR" && mvn package -q)
echo "[2/3] Starting backend on port $BACKEND_PORT..."
java -jar "$BACKEND_DIR/target/legal-firm-backend-1.0.0.jar" &
BACKEND_PID=$!

# Wait for backend to be ready
for i in $(seq 1 30); do
  if curl -s -o /dev/null "http://localhost:$BACKEND_PORT/api/contact" 2>/dev/null; then
    break
  fi
  sleep 1
done
echo "       Backend ready at http://localhost:$BACKEND_PORT"

# Start frontend
echo "[3/3] Starting frontend on port $FRONTEND_PORT..."
npm run dev -- --port $FRONTEND_PORT &
FRONTEND_PID=$!

echo ""
echo "  Frontend : http://localhost:$FRONTEND_PORT"
echo "  Backend  : http://localhost:$BACKEND_PORT"
echo "  H2       : http://localhost:$BACKEND_PORT/h2-console"
echo ""
echo "Press Ctrl+C to stop both servers."
wait
