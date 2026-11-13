#!/usr/bin/env bash
# Gives the server the RevenueCat secret key, so it can check CzechLocal Plus with the store.
# The key is typed without being shown, written to a temporary file only for the upload, and
# never printed or saved. Run from the repository root:  bash scripts/set-revenuecat-secret.sh
set -euo pipefail

read -rsp "Paste the RevenueCat secret API key (sk_…), then press Enter: " KEY
echo
case "$KEY" in
  sk_*) ;;
  *) echo "That doesn't look like a secret key (it should start with sk_). Nothing was changed."; exit 1 ;;
esac

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT
printf 'REVENUECAT_SECRET_KEY=%s\n' "$KEY" > "$TMP"
unset KEY

npx supabase secrets set --env-file "$TMP" --remote --yes > /dev/null
echo "Done: REVENUECAT_SECRET_KEY is set on the server."
