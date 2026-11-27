#!/usr/bin/env bash
# Token-lean checks for this repo. One line per passing step; only the
# relevant failure lines (max $CHECK_MAX_LINES). Full logs in .claude/tmp/.
# Usage: scripts/check.sh [types] [lint] [test] [build] | all   (default: types lint test)
set -uo pipefail
cd "$(dirname "$0")/.."

MAX="${CHECK_MAX_LINES:-40}"
LOG_DIR=".claude/tmp"
mkdir -p "$LOG_DIR"

run_step() {
  local name="$1" pattern="$2"; shift 2
  local log="$LOG_DIR/check-$name.log" code=0 hits
  "$@" >"$log" 2>&1 || code=$?
  if [ "$code" -eq 0 ]; then echo "PASS $name"; return 0; fi
  echo "FAIL $name (exit $code, full log: $log)"
  hits=$(grep -E "$pattern" "$log" | head -n "$MAX")
  if [ -n "$hits" ]; then echo "$hits"; else tail -n "$MAX" "$log"; fi
  return 1
}

steps=("$@")
[ ${#steps[@]} -eq 0 ] && steps=(types lint test)
[ "${steps[0]}" = all ] && steps=(types lint test build)
fail=0
for s in "${steps[@]}"; do
  case "$s" in
    types) run_step types 'error TS' pnpm -r typecheck || fail=1 ;;
    lint)
      run_step lint-js '^/|[0-9]+:[0-9]+ +error' pnpm -r lint || fail=1
      run_step lint-py '^[^ ].*:[0-9]+:[0-9]+:|would reformat' \
        bash -c 'cd backend && uv run ruff check . && uv run ruff format --check .' || fail=1 ;;
    test) run_step test 'FAILED|Error|assert|not ok' bash -c 'cd backend && uv run pytest -q && cd ../frontend && node --test tests/*.test.mjs' || fail=1 ;;
    build) run_step build '[Ee]rror|[Ff]ailed' pnpm -r build || fail=1 ;;
    *) echo "unknown step: $s (use types, lint, test, build or all)"; fail=1 ;;
  esac
done
exit $fail
