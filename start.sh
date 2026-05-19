#!/usr/bin/env bash
set -e
export PATH="$HOME/.local/bin:$PATH"

echo "▶ Backend http://localhost:8000"
cd "$(dirname "$0")/pdf-saas-backend"
pip install -q -r requirements.txt 2>/dev/null || true
python3 scripts/seed_admin.py
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACK_PID=$!

echo "▶ Frontend http://localhost:5173"
cd "$(dirname "$0")/pdf-saas-frontend"
npm run dev -- --host 0.0.0.0 --port 5173 &
FRONT_PID=$!

trap "kill $BACK_PID $FRONT_PID 2>/dev/null" EXIT
echo ""
echo "✅ PDFMaster prêt"
echo "   App:    http://localhost:5173"
echo "   API:    http://localhost:8000/docs"
echo "   Admin:  admin@pdfmaster.app / Admin123!"
wait
