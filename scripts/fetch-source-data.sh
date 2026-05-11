#!/usr/bin/env bash
# Fetches source CSVs for the import scripts in this directory.
# Output lands under scripts/data/ which is gitignored — re-run when you
# want to refresh against the latest upstream dumps. The pre-existing
# scripts/sjr2023.csv (committed) is intentionally NOT touched.

set -euo pipefail

cd "$(dirname "$0")/.."
mkdir -p scripts/data

echo "==> DOAJ (https://doaj.org/csv)"
curl -L --silent --show-error -o scripts/data/doaj.csv https://doaj.org/csv
echo "    $(wc -l < scripts/data/doaj.csv) lines, $(du -h scripts/data/doaj.csv | cut -f1)"

echo
echo "==> Retraction Watch (Crossref-hosted GitLab mirror)"
curl -L --silent --show-error -o scripts/data/retraction-watch.csv \
  https://gitlab.com/crossref/retraction-watch-data/-/raw/main/retraction_watch.csv
echo "    $(wc -l < scripts/data/retraction-watch.csv) lines, $(du -h scripts/data/retraction-watch.csv | cut -f1)"

echo
echo "Done. Files in scripts/data/:"
ls -la scripts/data/
