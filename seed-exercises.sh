#!/bin/bash

# ─────────────────────────────────────────────────────────────────────────────
# seed-exercises.sh
# Descarga todos los ejercicios de RapidAPI y los guarda en Supabase.
# Corre en tandas de 20 con pausa entre cada una para respetar rate limits.
#
# Uso:
#   chmod +x seed-exercises.sh
#   ./seed-exercises.sh
#
# Requisitos:
#   - npm run dev corriendo en otra terminal (o apuntar a producción)
#   - curl y python3 instalados (vienen por default en Mac/Linux)
# ─────────────────────────────────────────────────────────────────────────────

URL="http://localhost:3000/api/admin/seed-exercises"
SECRET="r3set_admin_2026"
LIMIT=20
OFFSET=0
TOTAL_SAVED=0
BATCH=1

echo ""
echo "🏋️  R3SET — Seed de ejercicios"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📡 Endpoint: $URL"
echo "📦 Tanda: $LIMIT ejercicios por vez"
echo ""

while true; do
  echo "⏳ Tanda $BATCH — offset=$OFFSET..."

  RESPONSE=$(curl -s -X POST "$URL" \
    -H "Content-Type: application/json" \
    -H "x-admin-secret: $SECRET" \
    -d "{\"offset\": $OFFSET, \"limit\": $LIMIT, \"downloadGifs\": true}")

  # Verificar que la respuesta sea JSON válido
  if ! echo "$RESPONSE" | python3 -c "import sys,json; json.load(sys.stdin)" 2>/dev/null; then
    echo "❌ Error: respuesta inválida del servidor"
    echo "   Respuesta cruda: $RESPONSE"
    echo ""
    echo "   ¿Está corriendo 'npm run dev'?"
    exit 1
  fi

  # Extraer campos
  OK=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('ok', False))")
  DONE=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('done', False))")
  NEXT=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('nextOffset', 0))")
  FETCHED=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('batch', {}).get('fetched', 0))")
  SAVED=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('results', {}).get('inserted', 0))")
  ERRORS=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('results', {}).get('errors', 0))")

  if [ "$OK" != "True" ]; then
    ERROR_MSG=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('error', 'Error desconocido'))")
    echo "❌ API error: $ERROR_MSG"
    exit 1
  fi

  TOTAL_SAVED=$((TOTAL_SAVED + SAVED))

  echo "   ✅ Fetched: $FETCHED | Guardados: $SAVED | Errores: $ERRORS | Total acumulado: $TOTAL_SAVED"

  if [ "$DONE" = "True" ] || [ "$FETCHED" -eq 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎉 Seed completo!"
    echo "   Total ejercicios guardados: $TOTAL_SAVED"
    echo ""
    echo "Verificá el resultado con:"
    echo "  curl -s http://localhost:3000/api/admin/seed-exercises \\"
    echo "    -H 'x-admin-secret: $SECRET' | python3 -m json.tool"
    break
  fi

  OFFSET=$NEXT
  BATCH=$((BATCH + 1))

  # Pausa entre tandas para no saturar RapidAPI (plan free: ~10 req/seg)
  sleep 3
done
