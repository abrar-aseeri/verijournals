#!/usr/bin/env bash
# Fetches source CSVs for the import scripts in this directory.
# Output lands under scripts/data/ which is gitignored — re-run when you
# want to refresh against the latest upstream dumps. The pre-existing
# scripts/sjr2023.csv (committed) is intentionally NOT touched.
#
# Usage:
#   bash scripts/fetch-source-data.sh                  # fetch all three
#   bash scripts/fetch-source-data.sh doaj             # only DOAJ
#   bash scripts/fetch-source-data.sh nlm              # only NLM
#   bash scripts/fetch-source-data.sh retraction-watch # only Retraction Watch
#   bash scripts/fetch-source-data.sh rw               # alias for retraction-watch

set -euo pipefail

cd "$(dirname "$0")/.."
mkdir -p scripts/data

target="${1:-all}"

fetch_doaj() {
  echo "==> DOAJ (https://doaj.org/csv)"
  curl -L --silent --show-error -o scripts/data/doaj.csv https://doaj.org/csv
  echo "    $(wc -l < scripts/data/doaj.csv) lines, $(du -h scripts/data/doaj.csv | cut -f1)"
}

fetch_rw() {
  echo "==> Retraction Watch (Crossref-hosted GitLab mirror)"
  curl -L --silent --show-error -o scripts/data/retraction-watch.csv \
    https://gitlab.com/crossref/retraction-watch-data/-/raw/main/retraction_watch.csv
  echo "    $(wc -l < scripts/data/retraction-watch.csv) lines, $(du -h scripts/data/retraction-watch.csv | cut -f1)"
}

fetch_nlm() {
  echo "==> NLM Catalog (ftp.ncbi.nlm.nih.gov J_Medline.txt)"
  curl -L --silent --show-error -o scripts/data/J_Medline.txt \
    https://ftp.ncbi.nlm.nih.gov/pubmed/J_Medline.txt
  echo "    $(grep -c '^JrId:' scripts/data/J_Medline.txt) records, $(du -h scripts/data/J_Medline.txt | cut -f1)"
}

case "$target" in
  all)
    fetch_doaj; echo
    fetch_rw; echo
    fetch_nlm
    ;;
  doaj)              fetch_doaj ;;
  nlm)               fetch_nlm ;;
  retraction-watch|rw) fetch_rw ;;
  *)
    echo "Unknown source: $target" >&2
    echo "Valid: all, doaj, nlm, retraction-watch (rw)" >&2
    exit 1
    ;;
esac

echo
echo "Files in scripts/data/:"
ls -la scripts/data/
