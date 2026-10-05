# Maintaining a11y-widget

For whoever maintains this repository. Covers how the pieces fit together, how to release, where each site loads the widget from, and how to test.

---

## 1. How it fits together

| Piece | Where | Notes |
| --- | --- | --- |
| Source | `a11y-widget.js` | One file. The CSS lives inside it between `/*A11YW_CSS_START*/` and `/*A11YW_CSS_END*/` so a single script tag works everywhere. |
| Stylesheet file | `a11y-widget.css` | Generated from the JS by `node build.js`. Never edit it by hand. It exists for strict-CSP sites that link CSS instead of allowing an injected `<style>`. |
| Demo | `demo/index.html` | Served at the root of the Vercel host. |
| Hosting | Vercel project `a11y-widget` (team et-digital) | Deployed by GitHub Actions (`deploy` job in `.github/workflows/check.yml`): every push to `main` deploys to production after the checks pass. Needs the repository secret `VERCEL_TOKEN`. The project has no Git connection in Vercel. Config in `vercel.json`. Domain: https://a11ywidget.vercel.app |
| CDN | jsDelivr | Serves any tag: `https://cdn.jsdelivr.net/gh/a11y-widget/a11y-widget@<tag>/a11y-widget.js`. Nothing to configure. |
| WordPress plugin | `platforms/wordpress/a11y-widget/` + `a11y-widget.zip` | The zip is committed so it can be downloaded from the Vercel host. Rebuild it whenever the plugin source changes. |
| Shopify snippet | `platforms/shopify/a11y-widget.liquid` | Reference snippet. The 1stbouquet theme vendors the JS into its `assets/` instead. |

### Two URLs, two update behaviours

| URL | Browser cache | Updates |
| --- | --- | --- |
| `https://a11ywidget.vercel.app/v1/a11y-widget.js` | 5 minutes (`vercel.json`) | Automatic. Each deploy invalidates Vercel's edge, so visitors have a new release within about 5 minutes. `/v1/` is a rewrite to the root file; if a breaking 2.x is ever released, move the 1.x files into a `v1/` folder and point the rewrite there so `/v1/` keeps serving 1.x. |
| `https://cdn.jsdelivr.net/gh/a11y-widget/a11y-widget@1.1.2/…` | 1 year, immutable | Never. Consumers bump the version (and integrity hashes) themselves. |
| `https://cdn.jsdelivr.net/gh/a11y-widget/a11y-widget@1/…` | 7 days | Follows releases, but visitors can run an old build for a week. **Do not recommend.** This is what caused the "fix didn't arrive" confusion in 1.1.x. |

---

## 2. Making a change

1. Edit `a11y-widget.js`. CSS changes go in the embedded block; JS elsewhere.
2. `npm run check` — syntax check and regenerate `a11y-widget.css`.
3. Test in a browser: `python3 -m http.server 8000` in the repo root, open `http://localhost:8000/demo/`. Also test on a page with a strict CSP by linking the CSS and setting `data-css="off"`.
4. Keep every new user-facing string in all four label tables (`en`, `zh`, `es`, `vi`) in `LABELS`. The build does not enforce this, so check by hand.
5. Any new display mode: add the class under `TOGGLES`/`CONTRAST`/`SAT`/`ALIGN`, its CSS rule scoped to `html.a11yw-…`, a label, and an icon in `I`. Never reuse a mode class name for an overlay element (the 1.0.x reading-mask bug).
6. Add a line to `CHANGELOG.md` under "Unreleased".

### Conventions worth keeping

- Everything is scoped under `.a11yw` and `html.a11yw-*`. Host-page CSS must never leak in, and widget CSS must never leak out. Hover and pressed states set **both** background and text colour explicitly.
- Overlay elements (reading guide, mask panes) are direct children of `<body>` with `pointer-events: none`.
- The panel uses fixed colours plus `color-mix` tints of the accent, with a `@supports not` fallback.
- No external requests, no cookies, no third-party code. If that ever changes, every consuming site's privacy policy has to change too.

---

## 3. Releasing

One command does the whole thing:

```
scripts/release.sh 1.1.3
```

It bumps `package.json`, updates pinned URLs in the docs and the plugin's bundled version, rebuilds the CSS and the plugin zip, moves the "Unreleased" changelog section under the new version, commits, tags `v1.1.3` and pushes `main` with tags. GitHub Actions deploys to Vercel once the checks pass; jsDelivr serves the tag within a couple of minutes.

Manual equivalent, if you need it:

```
# 1. version
sed -i '' 's/"version": "1.1.2"/"version": "1.1.3"/' package.json
# 2. pinned URLs in docs + plugin bundled version
grep -rl 'a11y-widget@1.1.2' README.md INSTALL.md platforms | xargs sed -i '' 's/a11y-widget@1.1.2/a11y-widget@1.1.3/g'
sed -i '' "s/A11YW_WIDGET_VERSION', '1.1.2'/A11YW_WIDGET_VERSION', '1.1.3'/" platforms/wordpress/a11y-widget/a11y-widget.php
# 3. build + zip
npm run check && (cd platforms/wordpress && rm -f a11y-widget.zip && zip -qr a11y-widget.zip a11y-widget)
# 4. commit, tag, push
git add -A && git commit -m "Release 1.1.3" && git tag -a v1.1.3 -m v1.1.3 && git push origin main --tags
```

After pushing, verify:

```
curl -sI https://a11ywidget.vercel.app/v1/a11y-widget.js | grep -i cache-control   # 200, max-age=300
curl -s  https://cdn.jsdelivr.net/gh/a11y-widget/a11y-widget@1.1.3/a11y-widget.js | shasum
shasum a11y-widget.js                                                                # same hash
```

### Versioning

Semantic versions. Patch for fixes, minor for new options or modes, major only for breaking changes to attributes, the API or the stored state shape. The stored state is read defensively (`load()` validates every field), so adding fields is never breaking.

### Integrity hashes for pinned consumers

```
curl -s https://cdn.jsdelivr.net/gh/a11y-widget/a11y-widget@1.1.3/a11y-widget.js  | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://cdn.jsdelivr.net/gh/a11y-widget/a11y-widget@1.1.3/a11y-widget.css | openssl dgst -sha384 -binary | openssl base64 -A
```

Prefix each with `sha384-`.

---

## 4. Consuming sites and how to update them

| Site | Repo | Loads from | After a release |
| --- | --- | --- | --- |
| paimo.io | `PAiMo-io/paimo-landing`, `src/app/layout.tsx` | Vercel `/v1/` | Nothing. Updates automatically. |
| pivclub.org | `PAiMo-io/pivclub`, `src/pages/_document.tsx` | Vercel `/v1/` | Nothing. Updates automatically. |
| 1stbouquet (Shopify) | `1stbouquet/1stbouquet.com`, `assets/a11y-widget.js` | Vendored file in the theme (Shopify CDN) | Copy the new `a11y-widget.js` over `assets/a11y-widget.js`, update the version note in `snippets/accessibility-panel.liquid`, open a PR. The theme's settings live under Theme settings → Accessibility panel. |
| WordPress sites with the plugin | Plugin settings page | Vercel `/v1/` on the Automatic channel (default); jsDelivr pinned on the Pinned channel | Automatic: nothing. Pinned: the site updates the plugin. |
| Wix / others on the `/v1/` URL | Site's custom code | Vercel `/v1/` | Nothing. |

Why the split: sites with a strict Content Security Policy need integrity hashes, which only work with an immutable URL, so they pin. Shopify's theme check prefers theme assets over remote scripts, so that theme vendors. Everyone else gets automatic updates.

---

## 5. Hosting details

- **Vercel project**: `a11y-widget`, team `et-digital`, domains `a11ywidget.vercel.app`, `a11y-widget-five.vercel.app`, `a11y-widget-et-digital.vercel.app`. Static, no build step (`vercel.json`: `outputDirectory: "."`, `cleanUrls`, `/v1/:file` rewrite, root rewrite to `/demo`). Deployment Protection is **off** on purpose: the script must be publicly fetchable.
- **Headers** (`vercel.json`): `.js`/`.css` get `Access-Control-Allow-Origin: *`, `Cache-Control: public, max-age=300, s-maxage=3600, stale-while-revalidate=86400`, `nosniff`. Everything gets `X-Frame-Options: SAMEORIGIN` and a referrer policy.
- **Deploys**: GitHub Actions only (`deploy` job). Create the token at vercel.com/account/tokens (scope: team et-digital) and store it as the repository secret `VERCEL_TOKEN`. If Actions is unavailable, `vercel deploy --prod --yes` from the repo root deploys manually. Do not reconnect Vercel's Git integration, or every push deploys twice.
- **jsDelivr**: no account. Purge a path after a tag if needed: `curl https://purge.jsdelivr.net/gh/a11y-widget/a11y-widget@1/a11y-widget.js`. Pinned URLs never need purging.

---

## 6. Testing

There is no test suite; the widget is small and visual. What has worked:

- **Demo page** at `demo/index.html` for manual checks of every tab and mode.
- **Headless screenshots** with Chrome: `--headless=new --screenshot --window-size=1280,900 http://localhost:8000/demo/#a11y` opens the panel via the hash. Use `--force-device-scale-factor=2` for alignment checks. Headless Chrome refuses widths under about 500px; to check phone layouts, load the page inside a 390px `<iframe>` on a wide harness page.
- **Hover states**: copy the CSS, replace `:hover` with a class, add that class to one of each control, screenshot. Do this over a host site's real stylesheet (the 1stbouquet theme fades links on hover, which is how the 1.1.1 hover bug was found).
- **Display modes**: bake the mode classes into `<html class="a11yw-contrast-dark …">` on a copy of a real page with the script tag removed (the script would otherwise reset the classes from storage).
- **Read-aloud**: cannot be tested headless (no voices). Test in a real browser on a `zh` page: Chrome's `speechSynthesis.getVoices()` should list a `zh-CN` voice and the widget should pick it. The language mapping is pure and can be unit-tested by extracting `speechLang` with a regex and `eval`.
- **Strict CSP**: serve a page with `Content-Security-Policy: script-src 'self' https://cdn.jsdelivr.net; style-src 'self' https://cdn.jsdelivr.net` and the linked-CSS install; the panel must appear and the console must stay clean.
- **Pointer-through check for overlays**: with the reading mask on, `document.elementFromPoint(x, y)` must return page content, not a pane, and `getComputedStyle(document.documentElement).position` must be `static`.

The GitHub Actions workflow in `.github/workflows/check.yml` runs the syntax check and fails if `a11y-widget.css` is out of sync with the JS.

---

## 7. Known constraints

- Host pages that put `transform` or `filter` on `<body>` break `position: fixed`, so the button scrolls away. Not fixable from the widget; document it for the site.
- Read-aloud depends on the device having a voice for the page language. Since 1.1.2 the panel says so instead of reading in the wrong voice.
- `color-mix` is needed for brand-tinted neutrals; older browsers get neutral greys via the `@supports not` fallback.
- Invert mode uses a CSS filter on `<html>`; fixed elements inside a filtered ancestor still work because `<html>` fills the viewport.

---

## 8. Support checklist when a site reports a problem

1. Which URL does the site load? Pinned sites need a version bump; `@1` sites may be showing a 7-day-old build (hard-refresh to confirm).
2. Open the console: a 404 means a wrong URL; a CSP violation means the CDN origin is not allowed.
3. Does the button appear but scroll with the page? Body transform on the host.
4. Read-aloud wrong language? Check `speechSynthesis.getVoices()` in the console for a voice in that language.
5. Reproduce on `demo/` with the same `data-` attributes before changing the widget.
