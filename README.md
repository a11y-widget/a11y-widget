# a11y-widget

A standalone accessibility panel for any website. One script tag, no dependencies, no accounts, no network calls of its own. Visitors get a tabbed panel to enlarge text, change contrast, turn on reading aids, have the page read aloud and more. Their choices are saved in their own browser and never sent anywhere.

- **Live demo:** https://a11ywidget.vercel.app
- **Install guide (all platforms):** [INSTALL.md](INSTALL.md)
- **Maintainer guide (releases, hosting, sites):** [MAINTAINING.md](MAINTAINING.md)
- **Changelog:** [CHANGELOG.md](CHANGELOG.md)
- **Current release:** 1.1.2

## Quick start

```html
<script
  src="https://a11ywidget.vercel.app/v1/a11y-widget.js"
  defer
  data-color="#1f3a93"
  data-statement="/accessibility">
</script>
```

Put that before `</body>`. A round button appears in the lower-right corner. Everything else is optional.

| URL | Use it when |
| --- | --- |
| `https://a11ywidget.vercel.app/v1/a11y-widget.js` | **Default.** Always the latest 1.x release, with a 5-minute browser cache, so fixes reach visitors within minutes. |
| `https://cdn.jsdelivr.net/gh/skychengtian/a11y-widget@1.1.2/a11y-widget.js` | You want to approve each update yourself, or you need `integrity` hashes under a strict Content Security Policy. Pair with `.../a11y-widget.css` and `data-css="off"`. |

## What visitors get

| Tab | Options |
| --- | --- |
| **Profiles** | One-tap presets with plain-language descriptions: Vision impaired, Dyslexia & reading, ADHD & focus, Seizure safe, Keyboard & motor |
| **Text** | Size 100–175%, spacing (Wide meets WCAG 1.4.12), alignment, readable font |
| **Color** | Contrast: default, high, dark, invert. Saturation: default, grayscale, high |
| **Reading** | Highlight links, headings or focus, big cursor, reading guide, reading mask, stop animations (pauses video too), hide images, mute sounds |
| **Tools** | Read page aloud with pause and stop, page-structure navigator (headings and landmarks), move the button, hide the panel for this visit |

Labels follow the page language: English, Simplified Chinese, Spanish and Vietnamese. Open with the button or **Alt + Shift + A**; any link to `#a11y` opens it too.

## Configuration

Attributes on the script tag. Every one is optional.

| Attribute | Default | Purpose |
| --- | --- | --- |
| `data-color` | `#1f3a93` | Accent for the button and selected controls. White text is drawn on it: use a colour with at least 4.5:1 contrast against white. Neutral surfaces are tinted from it automatically. |
| `data-ink` | `#262b33` | Panel text colour |
| `data-accent` | `#f3c552` | The small "settings active" dots |
| `data-position` | `right` | `right` or `left` |
| `data-statement` | none | URL of your accessibility statement page |
| `data-main` | `#main, main, [role=main], #content, #primary` | Main content selector for read-aloud and page structure |
| `data-lang` | `<html lang>` | Force `en`, `zh`, `es` or `vi` |
| `data-css` | on | `off` to skip injected styles and link `a11y-widget.css` yourself |
| `data-shortcut` | on | `off` to disable Alt + Shift + A |
| `data-key` | `a11y-widget` | localStorage key |
| `data-z` | `2147483000` | z-index |

The same keys can be set on `window.A11yWidgetConfig` (camelCase) before the script loads, for loaders that cannot add attributes. A small API is exposed on `window.A11yWidget`: `open(tab?)`, `close()`, `toggle()`, `reset()`, `get()`, `set(partial)`, `destroy()`.

## Platforms

Ready-made installers in [`platforms/`](platforms/): a **WordPress** plugin with a settings page, a **Shopify** Liquid snippet, and **Wix** Custom Code instructions. Next.js, static sites, other builders, Google Tag Manager and strict-CSP setups are covered step by step in [INSTALL.md](INSTALL.md).

## Accessibility of the panel itself

Modal dialog with a focus trap. Escape closes and returns focus. Tabs work with the arrow keys. Every toggle exposes `aria-pressed`, changes are announced through a live region, touch targets are at least 44px, and the panel is hidden in print. Display modes are applied as classes on `<html>` with scoped CSS; the widget never rewrites the page's own markup, headings or focus order.

## Privacy

One JSON object in `localStorage`, one hide flag in `sessionStorage`, no cookies, no requests. Suggested wording for a privacy policy is in [INSTALL.md § 7](INSTALL.md#7-privacy).

## A note on overlays

A panel like this is a convenience for visitors who want to adjust the display. It does not make an inaccessible site accessible and is not a substitute for building to WCAG at the source. See the [Overlay Fact Sheet](https://overlayfactsheet.com/). This widget deliberately avoids what that document criticises: no rewriting of page markup, no injected headings or alt text, no focus capture outside its own dialog, no third-party code.

## Repository layout

```
a11y-widget.js          the widget, styles embedded (single source of truth)
a11y-widget.css         the same styles as a file, generated by `npm run build`
build.js                extracts the CSS from the JS
demo/index.html         demo page (served at the root of the Vercel host)
platforms/              WordPress plugin (source + zip), Shopify snippet, Wix guide
scripts/release.sh      one-command release
scripts/check-labels.js fails if a translation key is missing in any language
vercel.json             hosting: /v1/ alias, caching and CORS headers
.github/workflows/      CI: syntax, CSS and plugin zip in sync, PHP lint, label parity
INSTALL.md              installation and usage for site owners
MAINTAINING.md          releases, hosting, consuming sites, testing
CHANGELOG.md            what changed in each release
```

## Development

```
npm run check     # syntax check, regenerate a11y-widget.css, verify label parity
python3 -m http.server 8000   # then open http://localhost:8000/demo/
scripts/release.sh 1.1.3      # bump, build, changelog, tag, push (see MAINTAINING.md)
```

## License

MIT
