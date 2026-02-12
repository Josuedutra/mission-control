#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Fail if providerEmbed( appears outside memoryIndexService.ts
matches=$(grep -RIn --binary-files=without-match "providerEmbed(" "$ROOT/src" \
  | grep -v "src/memory/memoryIndexService.ts" || true)

if [[ -n "$matches" ]]; then
  echo "[TRIPWIRE] Direct providerEmbed() usage found outside memoryIndexService.ts"
  echo "$matches"
  exit 1
fi

echo "[TRIPWIRE] OK: no direct providerEmbed() calls outside memoryIndexService.ts"
