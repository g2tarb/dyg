#!/usr/bin/env bash
# Crée (ou recrée) la base de test dyg_test depuis schema.sql.
#
# schema.sql contient des DROP TABLE CASCADE : on l'applique donc UNIQUEMENT à une
# base jetable dédiée aux tests, jamais à dyg (données de dev) ni à la prod.
#
#   npm run test:setup
set -euo pipefail

DB="${TEST_DB:-dyg_test}"

if [ "$DB" = "dyg" ]; then
  echo "Refus : la base de test ne peut pas s'appeler 'dyg' (base de dev)." >&2
  exit 1
fi

SCHEMA="$(dirname "$0")/../server/db/schema.sql"

echo "Recréation de la base de test « $DB »…"
dropdb --if-exists "$DB"
createdb "$DB"
psql -q "$DB" < "$SCHEMA"

TABLES=$(psql -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema='public'" "$DB")
echo "OK — $DB prête avec $TABLES tables."
