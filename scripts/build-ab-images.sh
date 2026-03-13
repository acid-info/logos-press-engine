#!/usr/bin/env bash
# build-ab-images.sh — Build both Docker images for the A/B memory-leak test
#
# Strategy: use git worktree to check out master into a temp directory so both
# builds can run from clean states without touching your working tree.
#
# Images produced:
#   lpe:master  — baseline (unfixed, from master branch)
#   lpe:fix     — patched  (from current working tree / fix branch)
#
# Build args: if you have a .env.local file the script reads it automatically.
# You can also export the vars in your shell before running.
#
# Usage:
#   ./scripts/build-ab-images.sh
#   ./scripts/build-ab-images.sh --skip-master   # rebuild only the fix image
#   ./scripts/build-ab-images.sh --skip-fix      # rebuild only the master image

set -euo pipefail

SKIP_MASTER=false
SKIP_FIX=false
for arg in "$@"; do
  [[ "$arg" == "--skip-master" ]] && SKIP_MASTER=true
  [[ "$arg" == "--skip-fix"    ]] && SKIP_FIX=true
done

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORKTREE_DIR="/tmp/lpe-master-worktree"

# ---------------------------------------------------------------------------
# Load build args from .env.local if present (values can be empty for the
# memory test — /api/og doesn't need Strapi or Simplecast)
# ---------------------------------------------------------------------------
load_env() {
  local env_file="$REPO_ROOT/.env.local"
  if [[ -f "$env_file" ]]; then
    echo "Loading build args from $env_file"
    # shellcheck disable=SC1090
    set -a; source "$env_file"; set +a
  else
    echo "No .env.local found — building with empty secrets (fine for OG memory test)"
  fi
}

docker_build_args() {
  echo \
    --build-arg "SIMPLECAST_ACCESS_TOKEN=${SIMPLECAST_ACCESS_TOKEN:-}" \
    --build-arg "REVALIDATE_WEBHOOK_TOKEN=${REVALIDATE_WEBHOOK_TOKEN:-test-token}" \
    --build-arg "STRAPI_API_KEY=${STRAPI_API_KEY:-}" \
    --build-arg "STRAPI_API_URL=${STRAPI_API_URL:-http://localhost:1337}" \
    --build-arg "STRAPI_GRAPHQL_URL=${STRAPI_GRAPHQL_URL:-http://localhost:1337/graphql}" \
    --build-arg "NEXT_PUBLIC_ASSETS_BASE_URL=${NEXT_PUBLIC_ASSETS_BASE_URL:-}" \
    --build-arg "NEXT_PUBLIC_ADMIN_ACID_API_URL=${NEXT_PUBLIC_ADMIN_ACID_API_URL:-}"
}

load_env

# ---------------------------------------------------------------------------
# Build master image
# ---------------------------------------------------------------------------
if [[ "$SKIP_MASTER" == false ]]; then
  echo ""
  echo "=== Building lpe:master ==="

  # Clean up any leftover worktree
  if [[ -d "$WORKTREE_DIR" ]]; then
    echo "Removing stale worktree at $WORKTREE_DIR"
    git -C "$REPO_ROOT" worktree remove --force "$WORKTREE_DIR" 2>/dev/null || rm -rf "$WORKTREE_DIR"
  fi

  git -C "$REPO_ROOT" worktree add "$WORKTREE_DIR" master
  echo "Checked out master → $WORKTREE_DIR"

  # shellcheck disable=SC2046
  docker build \
    $(docker_build_args) \
    -t lpe:master \
    "$WORKTREE_DIR"

  git -C "$REPO_ROOT" worktree remove --force "$WORKTREE_DIR"
  echo "lpe:master built successfully"
fi

# ---------------------------------------------------------------------------
# Build fix image (current working tree)
# ---------------------------------------------------------------------------
if [[ "$SKIP_FIX" == false ]]; then
  echo ""
  echo "=== Building lpe:fix (current branch: $(git -C "$REPO_ROOT" branch --show-current)) ==="

  # shellcheck disable=SC2046
  docker build \
    $(docker_build_args) \
    -t lpe:fix \
    "$REPO_ROOT"

  echo "lpe:fix built successfully"
fi

echo ""
echo "Done. Images available:"
docker images lpe --format "  {{.Repository}}:{{.Tag}}  {{.Size}}  ({{.CreatedAt}})"

echo ""
echo "Next steps:"
echo "  1. docker compose -f docker-compose.ab-test.yml up -d"
echo "  2. ./scripts/watch-memory.sh        (in terminal 1)"
echo "  3. node scripts/load-test-og.mjs    (in terminal 2)"
