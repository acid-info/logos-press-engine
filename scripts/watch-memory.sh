#!/usr/bin/env bash
# watch-memory.sh — A/B memory comparison poller
#
# Polls /api/debug/memory on both containers every INTERVAL seconds and
# prints a live side-by-side table. Also writes a CSV file so you can plot
# the heap growth curves afterwards.
#
# Usage:
#   ./scripts/watch-memory.sh [interval_seconds]
#
# Examples:
#   ./scripts/watch-memory.sh          # poll every 15s (default)
#   ./scripts/watch-memory.sh 30       # poll every 30s
#
# Run this in one terminal while running the load test in another:
#   node scripts/load-test-og.mjs --duration=300

set -euo pipefail

INTERVAL="${1:-15}"
MASTER_URL="http://127.0.0.1:3001/api/debug/memory"
FIX_URL="http://127.0.0.1:3002/api/debug/memory"
CSV_FILE="memory-ab-test-$(date +%Y%m%d-%H%M%S).csv"

# Colors
RED='\033[0;31m'; GRN='\033[0;32m'; YLW='\033[1;33m'
CYN='\033[0;36m'; BLD='\033[1m'; RST='\033[0m'

# Require curl
if ! command -v curl &>/dev/null; then
  echo "ERROR: curl is required" >&2; exit 1
fi

echo "timestamp,uptime_master,rss_master_mb,heap_used_master_mb,heap_total_master_mb,ext_master_mb,uptime_fix,rss_fix_mb,heap_used_fix_mb,heap_total_fix_mb,ext_fix_mb" > "$CSV_FILE"

echo -e "${BLD}Memory A/B test — polling every ${INTERVAL}s${RST}"
echo -e "${CYN}CSV output: ${CSV_FILE}${RST}"
echo ""
printf "${BLD}%-22s  %-30s  %-30s${RST}\n" "TIME (uptime s)" "MASTER (unfixed)" "FIX (patched)"
printf "%-22s  %-30s  %-30s\n" "$(printf '%0.s-' {1..22})" "$(printf '%0.s-' {1..30})" "$(printf '%0.s-' {1..30})"

fetch_metrics() {
  local url="$1"
  # Returns: uptime rss_mb heap_used_mb heap_total_mb ext_mb
  local json
  json=$(curl -sf --max-time 5 "$url" 2>/dev/null) || { echo "0 0 0 0 0"; return; }
  local uptime rss heap_used heap_total ext
  uptime=$(echo "$json"    | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('uptimeSeconds',0))"  2>/dev/null || echo 0)
  rss=$(echo "$json"       | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('rss_mb',0))"          2>/dev/null || echo 0)
  heap_used=$(echo "$json" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('heapUsed_mb',0))"     2>/dev/null || echo 0)
  heap_total=$(echo "$json"| python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('heapTotal_mb',0))"    2>/dev/null || echo 0)
  ext=$(echo "$json"       | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('external_mb',0))"     2>/dev/null || echo 0)
  echo "$uptime $rss $heap_used $heap_total $ext"
}

# Track initial RSS to detect growth trend
master_rss_initial=""
fix_rss_initial=""

while true; do
  NOW=$(date '+%Y-%m-%d %H:%M:%S')

  read -r m_up m_rss m_hused m_htotal m_ext <<< "$(fetch_metrics "$MASTER_URL")"
  read -r f_up f_rss f_hused f_htotal f_ext <<< "$(fetch_metrics "$FIX_URL")"

  # Set baselines on first successful read
  [[ -z "$master_rss_initial" && "$m_rss" != "0" ]] && master_rss_initial="$m_rss"
  [[ -z "$fix_rss_initial"    && "$f_rss" != "0" ]] && fix_rss_initial="$f_rss"

  # Compute deltas from baseline
  m_delta=$(python3 -c "print(round(${m_rss:-0} - ${master_rss_initial:-0}, 2))" 2>/dev/null || echo "?")
  f_delta=$(python3 -c "print(round(${f_rss:-0} - ${fix_rss_initial:-0}, 2))"    2>/dev/null || echo "?")

  # Color RSS red if growing fast (>50 MB delta), yellow if moderate (>20 MB)
  master_color="$GRN"
  fix_color="$GRN"
  python3 -c "exit(0 if float('${m_delta}' if '${m_delta}' != '?' else 0) > 50 else 1)" 2>/dev/null && master_color="$RED"
  python3 -c "exit(0 if float('${m_delta}' if '${m_delta}' != '?' else 0) > 20 else 1)" 2>/dev/null && [[ "$master_color" == "$GRN" ]] && master_color="$YLW"
  python3 -c "exit(0 if float('${f_delta}' if '${f_delta}' != '?' else 0) > 50 else 1)" 2>/dev/null && fix_color="$RED"
  python3 -c "exit(0 if float('${f_delta}' if '${f_delta}' != '?' else 0) > 20 else 1)" 2>/dev/null && [[ "$fix_color" == "$GRN" ]] && fix_color="$YLW"

  master_str="RSS=${m_rss}MB(+${m_delta}) heap=${m_hused}/${m_htotal}MB"
  fix_str="RSS=${f_rss}MB(+${f_delta}) heap=${f_hused}/${f_htotal}MB"

  printf "%-22s  ${master_color}%-42s${RST}  ${fix_color}%-42s${RST}\n" \
    "$NOW [up:${m_up}s/${f_up}s]" "$master_str" "$fix_str"

  # Append to CSV
  echo "${NOW},${m_up},${m_rss},${m_hused},${m_htotal},${m_ext},${f_up},${f_rss},${f_hused},${f_htotal},${f_ext}" >> "$CSV_FILE"

  sleep "$INTERVAL"
done
