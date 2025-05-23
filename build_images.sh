#!/usr/bin/env bash
set -euo pipefail

# Script para build e tag de todas as imagens locais
echo "Iniciando build das imagens..."

docker build -t gateway-service:latest ./gateway-service
echo "→ gateway-service:latest concluído"

docker build -t kv-node-service:latest ./kv-node-service
echo "→ kv-node-service:latest concluído"

docker build -t replicator-service:latest ./replicator-service
echo "→ replicator-service:latest concluído"

docker build -t health-monitor:latest ./health-monitor
echo "→ health-monitor:latest concluído"

docker build -t autoscaler-service:latest ./autoscaler-service
echo "→ autoscaler-service:latest concluído"

echo "Build de todas as imagens concluído!"
