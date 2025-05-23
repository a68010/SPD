#!/usr/bin/env bash
set -e

echo "Construindo e iniciando todos os contêineres (Compose)…"
docker-compose up -d --build
echo "Serviços levantados com Compose!"
