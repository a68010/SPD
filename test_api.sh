#!/usr/bin/env bash
set -euo pipefail

BASE_URL="http://localhost:3001"
TMP_FILE=$(mktemp)

echo "1) Teste PUT / (criar key=foo, value=bar)"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE_URL/" \
  -H "Content-Type: application/json" \
  -d '{"data":{"key":"foo","value":"bar"}}')
if [[ "$HTTP_CODE" != "200" ]]; then
  echo "❌ PUT retornou HTTP $HTTP_CODE (esperado 200)" && exit 1
else
  echo "✅ OK"
fi

echo "2) Teste GET /?key=foo"
curl -s -o "$TMP_FILE" "$BASE_URL/?key=foo"
if jq -e '.data.value == "bar"' "$TMP_FILE" > /dev/null; then
  echo "✅ OK"
else
  echo "❌ GET devolveu:" && cat "$TMP_FILE" && exit 1
fi

echo "3) Teste DELETE /?key=foo"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/?key=foo")
if [[ "$HTTP_CODE" != "200" ]]; then
  echo "❌ DELETE retornou HTTP $HTTP_CODE (esperado 200)" && exit 1
else
  echo "✅ OK"
fi

echo "4) Teste GET /?key=foo (depois de DELETE, espera 404)"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/?key=foo")
if [[ "$HTTP_CODE" != "404" ]]; then
  echo "❌ GET pós-DELETE retornou HTTP $HTTP_CODE (esperado 404)" && exit 1
else
  echo "✅ OK"
fi

echo "🎉 Todos os testes passaram!"
rm -f "$TMP_FILE"
