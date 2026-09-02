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

# A credential must never reach a commit, a log, or a video frame.
if git ls-files --error-unmatch .env >/dev/null 2>&1; then
  echo "FAIL: .env is tracked by git"; exit 1
fi
if grep -rlE 'AIza[0-9A-Za-z_-]{30,}' --exclude-dir=.git --exclude-dir=node_modules \
     --exclude-dir=.airlock-video --exclude-dir=.firecrawl . 2>/dev/null | grep -q .; then
  echo "FAIL: something that looks like an API key is in the tree"; exit 1
fi
echo "ok  no credentials in the tree"
