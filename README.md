# a11y-widget

A standalone accessibility panel for any website. One script, no dependencies, no network calls, nothing sent anywhere. Preferences stay in the visitor's browser.

**New here? Read [INSTALL.md](INSTALL.md)**: supported platforms, step-by-step installation for WordPress, Shopify, Wix, Next.js and others, how visitors use the panel, the statement template, privacy wording and troubleshooting.

```html
<script src="https://a11ywidget.vercel.app/v1/a11y-widget.js" data-statement="/accessibility" data-color="#1f3a93"></script>
```

That is the whole installation. Two ways to load the file:

| URL | Behaviour |
| --- | --- |
| `https://a11ywidget.vercel.app/v1/a11y-widget.js` | **Automatic updates (recommended).** Always the latest release, served from Vercel with a 5-minute browser cache; a new release reaches visitors within minutes. `/v1/` stays on the 1.x line. |
| `https://cdn.jsdelivr.net/gh/skychengtian/a11y-widget@1.1.2/a11y-widget.js` | **Pinned.** One exact release from the jsDelivr CDN, cached for a year. For sites that want to control when updates land, or that use integrity hashes under a strict Content Security Policy. |
| `https://cdn.jsdelivr.net/gh/skychengtian/a11y-widget@1.0.0/a11y-widget.js` | Pinned to one release. Use with an `integrity` hash on sites with a strict Content Security Policy. |
| `https://cdn.jsdelivr.net/gh/skychengtian/a11y-widget@1/a11y-widget.css` | The stylesheet, for the `data-css="off"` mode. |

The live demo is at https://a11ywidget.vercel.app. The script injects its own styles, adds a round button in the lower corner, and remembers the visitor's choices across pages.

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

The panel's neutral surfaces (pill backgrounds, borders, switch tracks) are derived from `data-color`, so the widget takes on the site's own cast rather than a generic grey. Pass `data-ink` and `data-accent` to match a brand's text and secondary colours exactly.

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
| `data-ink` | `#262b33` | Text colour inside the panel |
| `data-accent` | `#f3c552` | Colour of the small "settings active" dots |
| `data-key` | `a11y-widget` | `localStorage` key |
| `data-z` | `2147483000` | z-index |
| `data-css` | on | `off` to skip injected styles and link `a11y-widget.css` yourself (for a strict Content Security Policy) |
| `data-shortcut` | on | `off` to disable `Alt + Shift + A` |

Configuration can also be given as an object before the script loads, with the same keys in camelCase. Useful where a script loader cannot add attributes to the tag (WordPress `wp_enqueue_script`, some tag managers):

```html
<script>window.A11yWidgetConfig = { statement: '/accessibility', color: '#1f3a93', position: 'left' };</script>
<script src="https://a11ywidget.vercel.app/v1/a11y-widget.js" defer></script>
```

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

**Releasing**: bump `version` in `package.json`, commit, then tag and push:

```
git tag v1.0.1 && git push origin main --tags
```

jsDelivr picks the tag up within minutes. Sites on the `@1` range update automatically; pinned sites update when you change the tag and `integrity` hash. The Vercel mirror (demo at the root) redeploys from `vercel --prod` or the connected GitHub repository.

Embed snippets for common platforms:

- **Plain HTML**: the script tag above, before `</body>`.
- **Next.js**: `<Script src="https://cdn.jsdelivr.net/gh/skychengtian/a11y-widget@1.1.2/a11y-widget.js" strategy="beforeInteractive" data-statement="/accessibility" />` in the root layout, and `suppressHydrationWarning` on `<html>`.
- **WordPress, Shopify, Webflow, Squarespace, Wix**: paste the script tag into the site's custom code / footer scripts setting.
- **No code access**: a Google Tag Manager "Custom HTML" tag containing the script tag.

## Platforms

Ready-made installs live in [`platforms/`](platforms/):

| Platform | What you get | Guide |
| --- | --- | --- |
| WordPress | A plugin with a settings page (colours, position, statement URL). Upload the zip, activate, done. | [platforms/wordpress](platforms/wordpress/README.md) |
| Shopify | A Liquid snippet with the settings at the top and a one-line `{% render %}` for `theme.liquid`. | [platforms/shopify](platforms/shopify/README.md) |
| Wix | A paste-in snippet for **Settings → Custom Code** (Premium plan with a connected domain). | [platforms/wix](platforms/wix/README.md) |
| Next.js | `<Script strategy="beforeInteractive">` in the root layout or `_document`. | see above |
| Anything else | The script tag, or a Google Tag Manager "Custom HTML" tag. | see above |

Each guide ends with the same two reminders: pick the corner that does not already hold a chat bubble, and add one sentence to your privacy policy saying the panel script comes from the jsDelivr CDN and stores preferences in the visitor's browser only.

## Statement template

The panel links to an accessibility statement page. A short one is enough:

> **Accessibility.** [Organisation] wants everyone to be able to use this website, including people who rely on screen readers, keyboard navigation, magnification or other assistive technology. We design to WCAG 2.1 Level AA. Every page has an accessibility panel in the lower corner (or press Alt + Shift + A) for text size, contrast, reading aids and read-aloud; your choices stay in your browser and are never sent to us. If you encounter a barrier, email [address] with the page, what you were trying to do, and the browser or assistive technology you were using. We aim to respond within five business days.

## Files

- `a11y-widget.js` — the widget, styles embedded
- `a11y-widget.css` — the same styles as a file, for strict-CSP sites (generated from the JS by `npm run build`)
- `demo/index.html` — a sample page
- `platforms/` — WordPress plugin (source and zip), Shopify snippet, Wix instructions

## Privacy

The widget stores one JSON object in `localStorage` and a hide flag in `sessionStorage`. It makes no network requests. Say so in your privacy policy.

## A note on overlays

A panel like this is a convenience for visitors who want to adjust the display. It does not make an inaccessible site accessible, and it is not a substitute for building to WCAG at the source. See the [Overlay Fact Sheet](https://overlayfactsheet.com/). This widget deliberately avoids the behaviours that document criticizes: it does not rewrite the page's markup, inject headings or alt text, capture focus outside its own dialog, or load third-party code.

## License

MIT
