#!/bin/sh
set -e

echo "Aplicando migrations..."
npx prisma migrate deploy

if [ "${RUN_SEED}" = "true" ]; then
  echo "Executando seed..."
  node dist/prisma/seed.js
fi

exec "$@"
