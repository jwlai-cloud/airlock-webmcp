#!/bin/sh
# Publish origin B to a SECOND origin, and point origin A at it.
#
# Airlock needs two distinct origins -- exposedTo and fromOrigins take origins, and
# same-origin documents see each other's tools automatically, which would defeat the
# demonstration. Every repo under one GitHub account shares a single Pages origin
# (user.github.io), so the pair cannot both live there. A GitHub *organisation* gets
# its own Pages origin, which is the cheapest second origin available.
#
# Usage:  ./tools/deploy-publisher.sh <org-name> [repo-name]
set -e
ORG="$1"; REPO="${2:-airlock-publisher}"
[ -n "$ORG" ] && [ -n "$REPO" ] || { echo "usage: $0 <org-name> [repo-name]"; exit 1; }

command -v gh >/dev/null || { echo "gh CLI required"; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "run: gh auth login"; exit 1; }

# Creating a repo inside an org needs more than the default token scopes.
gh auth status 2>&1 | grep -q "admin:org" || \
  echo "note: if this fails on permissions, run: gh auth refresh -s admin:org,workflow"

PAGES_URL="https://${ORG}.github.io/${REPO}/"
echo "Publishing origin B to ${PAGES_URL}"

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
cp site-b/index.html "$TMP/index.html"
cp LICENSE "$TMP/LICENSE" 2>/dev/null || true
cat > "$TMP/README.md" <<EOF
# Airlock — publisher origin

Origin B of [Airlock](https://github.com/jwlai-cloud/airlock-webmcp). Deployed separately
because Airlock needs two genuinely different origins; this one exists only to be the
other side of the boundary. Source of truth is \`site-b/index.html\` in the main repo.
EOF

cd "$TMP"
git init -q && git add -A
git -c user.email=noreply@github.com -c user.name=airlock \
    commit -qm "Airlock publisher origin"
gh repo create "$ORG/$REPO" --public --source=. --push \
  --description "Airlock — publisher origin (origin B)" 2>/dev/null \
  || { git remote add origin "https://github.com/$ORG/$REPO.git" 2>/dev/null || true
       git push -f origin HEAD:main; }
cd - >/dev/null

gh api -X POST "repos/$ORG/$REPO/pages" -f "source[branch]=main" -f "source[path]=/" \
  >/dev/null 2>&1 || echo "Pages may already be enabled; continuing"

echo
echo "Publisher origin: $PAGES_URL"
echo "Now wiring origin A to it..."
python3 - "$PAGES_URL" <<'PY'
import re, sys
url = sys.argv[1]
p = "site-a/index.html"
s = open(p).read()
s2 = re.sub(r'const PARTNER_URL = "[^"]*";', f'const PARTNER_URL = "{url}";', s, count=1)
assert s2 != s or url in s, "PARTNER_URL not found in site-a/index.html"
open(p, "w").write(s2)
print(f"  set PARTNER_URL = {url}")
PY
echo
echo "Next:"
echo "  1. git commit -am 'Point origin A at the deployed publisher' && git push"
echo "  2. Pages can take a couple of minutes to go live."
echo "  3. Verify the deployed pair:"
echo "     node tools/verify.js --base https://jwlai-cloud.github.io/airlock-webmcp/site-a/"
