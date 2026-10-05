#!/usr/bin/env bash
# Release a new version of a11y-widget.
#   scripts/release.sh 1.1.3
# Bumps package.json, pinned URLs in docs, the WordPress plugin's bundled widget
# version, rebuilds the CSS and plugin zip, rolls the changelog, commits, tags and pushes.
set -euo pipefail

NEW="${1:-}"
if [[ ! "$NEW" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "usage: scripts/release.sh <major.minor.patch>" >&2; exit 1
fi
cd "$(dirname "$0")/.."

CUR=$(node -p "require('./package.json').version")
if [[ "$CUR" == "$NEW" ]]; then echo "package.json is already $NEW" >&2; exit 1; fi
if git rev-parse "v$NEW" >/dev/null 2>&1; then echo "tag v$NEW already exists" >&2; exit 1; fi
if [[ -n "$(git status --porcelain)" ]]; then echo "working tree not clean; commit or stash first" >&2; exit 1; fi

echo "Releasing $CUR -> $NEW"

# 1. version
sed -i '' "s/\"version\": \"$CUR\"/\"version\": \"$NEW\"/" package.json

# 2. pinned URLs in docs and platform files; plugin's bundled widget version
grep -rl "a11y-widget@$CUR" README.md INSTALL.md CHANGELOG.md platforms 2>/dev/null | xargs -I{} sed -i '' "s/a11y-widget@$CUR/a11y-widget@$NEW/g" {} || true
sed -i '' "s/A11YW_WIDGET_VERSION', '$CUR'/A11YW_WIDGET_VERSION', '$NEW'/" platforms/wordpress/a11y-widget/a11y-widget.php
sed -i '' "s/^- \*\*Current release:\*\* .*/- **Current release:** $NEW/" README.md
sed -i '' "s/^- Current release: \`$CUR\`\./- Current release: \`$NEW\`./" INSTALL.md

# 3. changelog: Unreleased -> version heading
TODAY=$(date +%Y-%m-%d)
if grep -q '^## Unreleased' CHANGELOG.md; then
  perl -0pi -e "s/## Unreleased\n/## Unreleased\n\n## $NEW — $TODAY\n/" CHANGELOG.md
fi

# 4. build and package
node --check a11y-widget.js
node build.js
(cd platforms/wordpress && rm -f a11y-widget.zip && zip -qr a11y-widget.zip a11y-widget)

# 5. commit, tag, push
git add -A
git commit -q -m "Release $NEW"
git tag -a "v$NEW" -m "v$NEW"
git push origin main --tags

echo
echo "Released v$NEW."
echo "  Vercel deploys from the push:   https://a11ywidget.vercel.app/v1/a11y-widget.js"
echo "  jsDelivr pinned URL:            https://cdn.jsdelivr.net/gh/a11y-widget/a11y-widget@$NEW/a11y-widget.js"
echo "  Pinned consumers (Sky Trading) need the new version and integrity hashes; see MAINTAINING.md § 3."
