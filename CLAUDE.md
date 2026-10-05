# CLAUDE.md

## Git

- Do not add a `Co-Authored-By: Claude` line (or any Claude/AI attribution) to commit messages or pull request descriptions.
- Commits are authored as `Sky Wei <sky.wei@ctwei.com>`.

## Project

Standalone accessibility panel for any website: one script, no dependencies, no network calls. Repository: `a11y-widget/a11y-widget`. Maintenance and release details are in `MAINTAINING.md`; user-facing docs are `README.md` and `INSTALL.md`.

- `a11y-widget.js`: the whole widget. Its stylesheet is embedded between `/*A11YW_CSS_START*/` and `/*A11YW_CSS_END*/`.
- `a11y-widget.css`: generated from that block by `node build.js`. Never edit by hand.
- `scripts/check-labels.js`: every label key must exist in all four languages (en, zh, es, vi).
- `platforms/wordpress/a11y-widget/` plus the committed `a11y-widget.zip`: rebuild the zip whenever the plugin source changes (CI diffs them).
- `platforms/shopify`, `platforms/wix`: snippet and guide.
- `demo/index.html`: served at the root of the Vercel site; `/v1/<file>` rewrites to the latest files (`vercel.json`).

## Commands

- `npm run check`: syntax check, regenerate the CSS, check labels. Run before committing.
- Rebuild the plugin zip: `(cd platforms/wordpress && rm -f a11y-widget.zip && zip -qr a11y-widget.zip a11y-widget)`
- Release: `scripts/release.sh <x.y.z>` bumps versions and pinned URLs, rolls the `## Unreleased` changelog section, rebuilds, commits, tags and pushes. Add changes under `## Unreleased` in `CHANGELOG.md` first.

## Things to know

- Pushing to `main` deploys to Vercel through GitHub Actions (the `deploy` job runs after the checks pass), and `https://a11ywidget.vercel.app/v1/` goes live on every site that uses it within minutes. Treat a push as a release.
- Host sites style buttons and text aggressively. Panel rules that matter (padding, appearance, colours) use `.a11yw .a11yw-…` specificity so theme CSS cannot override them.
- Check layout at phone widths (320–390px) in all four languages; Spanish labels are the longest.
