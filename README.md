# a11y-widget

A standalone accessibility panel for any website. One script, no dependencies, no network calls, nothing sent anywhere. Preferences stay in the visitor's browser.

```html
<script src="https://a11ywidget.vercel.app/v1/a11y-widget.js" data-statement="/accessibility" data-color="#1f3a93"></script>
```

That is the whole installation. The hosted copy lives at **https://a11ywidget.vercel.app** (Vercel, project `a11y-widget`). `/v1/a11y-widget.js` follows the latest 1.x release; `/a11y-widget.js` is the same file. For a strict Content Security Policy, download the file and serve it from your own origin instead. The script injects its own styles, adds a round button in the lower corner, and remembers the visitor's choices across pages.

The panel is organised in five tabs so only one short section is on screen at a time: **Profiles** (one-tap presets, each with a plain-language description), **Text**, **Color**, **Reading** (a grid of icon tiles) and **Tools**. Tabs that hold active settings show a small dot, the last tab you used is remembered for the session, and the tab bar is keyboard-operable with the arrow keys.

## What it offers

| Group | Options |
| --- | --- |
| Quick profiles | Vision impaired · Dyslexia & reading · ADHD & focus · Seizure safe · Keyboard & motor |
| Text | Size 100–175% in six steps · spacing Default / Moderate / Wide (Wide meets WCAG 1.4.12) · alignment · readable font |
| Color | Contrast Default / High / Dark / Invert · saturation Default / Grayscale / High |
| Reading aids | Highlight links · highlight headings · highlight focus · big cursor · reading guide · reading mask · stop animations (also pauses video) · hide images · mute sounds |
| Tools | Read page aloud with pause and stop (browser speech engine, no third party) · page structure navigator (headings and landmarks) |
| Panel | Tabbed layout with icons · active-tab indicators · reset all · move left/right · hide for this visit · `Alt + Shift + A` · opens from any `#a11y` link · link to your accessibility statement |

Labels switch automatically between English, Simplified Chinese, Spanish and Vietnamese based on `<html lang>`.

## Accessibility of the panel itself

Modal dialog with a focus trap, `Escape` closes and returns focus, every toggle exposes `aria-pressed`, changes are announced through a live region, touch targets are at least 44px, and the panel is hidden in print. It never touches the page's own markup, headings or focus order; display modes are applied as classes on `<html>` with scoped CSS.

## Configuration

All settings are `data-` attributes on the script tag.

| Attribute | Default | Purpose |
| --- | --- | --- |
| `data-lang` | `<html lang>` | `en`, `zh`, `es` or `vi` |
| `data-position` | `right` | `right` or `left` |
| `data-statement` | none | URL of your accessibility statement, shown as a link in the panel |
| `data-main` | `#main, main, [role=main]` | Selector for the main content, used by read-aloud and page structure |
| `data-color` | `#1f3a93` | Accent colour for the button and controls |
| `data-key` | `a11y-widget` | `localStorage` key |
| `data-z` | `2147483000` | z-index |
| `data-css` | on | `off` to skip injected styles and link `a11y-widget.css` yourself (for a strict Content Security Policy) |
| `data-shortcut` | on | `off` to disable `Alt + Shift + A` |

A small JavaScript API is exposed as `window.A11yWidget` with `open(tab?)`, `close()`, `toggle()`, `reset()`, `get()`, `set(partialState)` and `destroy()`. `open('reading')` opens the panel on a given tab (`profiles`, `text`, `color`, `reading`, `tools`).

### Strict Content Security Policy

If your CSP has `style-src 'self'` with no nonce, the injected `<style>` tag would be blocked. Link the stylesheet instead; the script detects it and skips injection:

```html
<link rel="stylesheet" href="/a11y-widget.css">
<script src="/a11y-widget.js" data-css="off"></script>
```

If you use nonces, the script copies its own `nonce` attribute onto the injected style tag.

### Next.js

```tsx
import Script from "next/script";
// in the root layout, inside <body>
<Script src="/a11y-widget.js" strategy="beforeInteractive" data-statement="/accessibility" data-color="#8C5DF8" />
```

Add `suppressHydrationWarning` to `<html>` so React does not complain about the mode classes the script sets before hydration.

## Hosting and updates

The repository deploys to Vercel as a static site. Pushing to `main` (or running `vercel --prod`) publishes a new version; every site loading the hosted URL picks it up within the cache window (5 minutes at the browser, 1 hour at the edge). The demo is served at the root of the host. Deployment Protection is disabled on this project on purpose: the script must be publicly fetchable.

Embed snippets for common platforms:

- **Plain HTML**: the script tag above, before `</body>`.
- **Next.js**: `<Script src="https://a11ywidget.vercel.app/v1/a11y-widget.js" strategy="beforeInteractive" data-statement="/accessibility" />` in the root layout, and `suppressHydrationWarning` on `<html>`.
- **WordPress, Shopify, Webflow, Squarespace, Wix**: paste the script tag into the site's custom code / footer scripts setting.
- **No code access**: a Google Tag Manager "Custom HTML" tag containing the script tag.

## Files

- `a11y-widget.js` — the widget, styles embedded
- `a11y-widget.css` — the same styles as a file, for strict-CSP sites (generated from the JS by `npm run build`)
- `demo/index.html` — a sample page

## Privacy

The widget stores one JSON object in `localStorage` and a hide flag in `sessionStorage`. It makes no network requests. Say so in your privacy policy.

## A note on overlays

A panel like this is a convenience for visitors who want to adjust the display. It does not make an inaccessible site accessible, and it is not a substitute for building to WCAG at the source. See the [Overlay Fact Sheet](https://overlayfactsheet.com/). This widget deliberately avoids the behaviours that document criticizes: it does not rewrite the page's markup, inject headings or alt text, capture focus outside its own dialog, or load third-party code.

## License

MIT
