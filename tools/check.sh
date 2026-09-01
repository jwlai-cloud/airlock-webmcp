#!/bin/sh
# ponytail: syntax-check each page's inline <script>, and assert no HTML sink
# exists on a page that renders partner-authored text. Catches the one failure
# mode that costs a demo — a typo in a 250-line inline script that shows up only
# as a blank page in flag-enabled Chrome. Upgrade to a real harness if it stops
# being enough.
set -e
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
for f in site-a/index.html site-b/index.html; do
  name=$(basename "$(dirname "$f")")
  sed -n '/^<script>/,/^<\/script>/p' "$f" | sed '1d;$d' > "$tmp/$name.js"
  node --check "$tmp/$name.js" && echo "ok  $f parses"
done
if grep -nE 'insertAdjacentHTML\(|\.innerHTML[[:space:]]*=|outerHTML[[:space:]]*=' site-a/index.html site-b/index.html; then
  echo "FAIL: HTML sink on a page that renders partner text"; exit 1
fi
echo "ok  no HTML sinks"
