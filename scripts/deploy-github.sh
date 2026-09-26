#!/usr/bin/env bash
# ==============================================================================
# VetVap Test - Manual GitHub Pages Deployment Script
# Builds the static PWA and pushes dist/ to gh-pages branch
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${PROJECT_ROOT}"

echo "Building production PWA..."
npm run build

echo "Deploying to gh-pages branch..."
cd dist

if [ ! -d ".git" ]; then
  git init
  git checkout -b gh-pages
fi

git add -A
git commit -m "Deploy VetVap PWA to GitHub Pages - $(date +'%Y-%m-%d %H:%M:%S')"

echo "Pushing to remote repository..."
git push -f git@github.com:$(git remote get-url origin 2>/dev/null | sed -e 's/.*github.com[:\/]//' -e 's/\.git$//') gh-pages:gh-pages 2>/dev/null || {
  echo "If remote is not configured, run: git push -f <your-repo-remote-url> gh-pages:gh-pages"
}

echo "Done! Ensure GitHub repository Settings -> Pages -> Source is set to 'gh-pages' branch."
