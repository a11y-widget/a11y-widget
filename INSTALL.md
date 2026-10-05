# Accessibility Panel (a11y-widget) — Installation and Usage Guide

A self-contained accessibility panel for any website. One script tag adds a round button in a corner of every page. Visitors open it to enlarge text, change contrast, turn on reading aids, have the page read aloud and more. Their choices are saved in their own browser and never sent anywhere.

- Live demo: https://a11ywidget.vercel.app
- Source and releases: https://github.com/skychengtian/a11y-widget
- Current release: `1.1.2`. Pin the exact version in your script tag (see Section 8 for why).

---

## 1. Supported platforms

| Platform | How it installs | Effort | Guide |
| --- | --- | --- | --- |
| WordPress | Plugin with a settings page (upload a zip) | 2 minutes | [Section 4.1](#41-wordpress) |
| Shopify | Liquid snippet + one line in `theme.liquid` | 5 minutes | [Section 4.2](#42-shopify) |
| Wix | Paste into Settings → Custom Code | 2 minutes | [Section 4.3](#43-wix) |
| Next.js (App Router or Pages Router) | `<Script strategy="beforeInteractive">` | 5 minutes | [Section 4.4](#44-nextjs) |
| Plain HTML / any static site | One script tag before `</body>` | 1 minute | [Section 4.5](#45-plain-html-and-static-sites) |
| Squarespace, Webflow, Framer, Ghost, Hugo, Jekyll, Astro, Nuxt, SvelteKit, Vue, Angular… | Site-wide footer code / layout file | 2 minutes | [Section 4.6](#46-other-builders-and-frameworks) |
| Sites you cannot edit | Google Tag Manager "Custom HTML" tag | 5 minutes | [Section 4.7](#47-google-tag-manager) |
| Sites with a strict Content Security Policy | Linked stylesheet + pinned version + integrity hashes | 10 minutes | [Section 4.8](#48-strict-content-security-policy) |

Browser support: current Chrome, Edge, Safari, Firefox and their mobile versions. Older browsers without `color-mix` fall back to neutral greys. Read-aloud needs the browser's speech engine (all modern browsers have one).

Languages: English, Simplified Chinese, Spanish and Vietnamese, chosen automatically from the page's `<html lang>`. Other languages fall back to English.

---

## 2. Quick start

Add this before `</body>` on every page:

```html
<script
  src="https://cdn.jsdelivr.net/gh/skychengtian/a11y-widget@1.1.2/a11y-widget.js"
  defer
  data-color="#1f3a93"
  data-statement="/accessibility">
</script>
```

Reload the page. A round button appears in the lower-right corner. That is a complete installation; everything below is refinement.

---

## 3. Configuration

All options are `data-` attributes on the script tag.

| Attribute | Default | What it does |
| --- | --- | --- |
| `data-color` | `#1f3a93` | Accent colour: the button, selected tabs and controls. White text is drawn on it, so use a colour with at least 4.5:1 contrast against white (dark blues, greens, purples; not bright yellow or light green). |
| `data-ink` | `#262b33` | Text colour inside the panel. Match your site's body text colour. |
| `data-accent` | `#f3c552` | The small dot that shows "settings are active". A secondary brand colour works well. |
| `data-position` | `right` | `right` or `left`. Choose the corner that does not already hold a chat bubble or back-to-top button. |
| `data-statement` | none | URL of your accessibility statement page. Shown as a link in the panel footer. |
| `data-main` | `#main, main, [role=main], #content, #primary` | CSS selector for the main content, used by read-aloud and the page-structure list. |
| `data-lang` | `<html lang>` | Force a language: `en`, `zh`, `es` or `vi`. |
| `data-css` | on | `off` to skip the injected styles and link `a11y-widget.css` yourself (strict CSP). |
| `data-shortcut` | on | `off` to disable the Alt + Shift + A keyboard shortcut. |
| `data-key` | `a11y-widget` | localStorage key, in case two widgets share a domain. |
| `data-z` | `2147483000` | z-index of the button and panel. |

The panel's neutral surfaces (pill backgrounds, borders, switch tracks) are tinted from `data-color`, so the widget blends with your palette without further settings.

### Configuring without attributes

Some script loaders cannot add attributes to a tag. Set the same options (camelCase keys) on `window.A11yWidgetConfig` before the script loads:

```html
<script>
  window.A11yWidgetConfig = { color: '#1f3a93', position: 'left', statement: '/accessibility' };
</script>
<script src="https://cdn.jsdelivr.net/gh/skychengtian/a11y-widget@1.1.2/a11y-widget.js" defer></script>
```

### JavaScript API

`window.A11yWidget` exposes `open(tab?)`, `close()`, `toggle()`, `reset()`, `get()`, `set(partialState)` and `destroy()`. Any link to `#a11y` on the page also opens the panel, which is handy on the statement page.

---

## 4. Installation by platform

### 4.1 WordPress

**Option A: the plugin (recommended)**

1. Download the plugin zip: https://a11ywidget.vercel.app/platforms/wordpress/a11y-widget.zip
2. In WordPress go to **Plugins → Add New → Upload Plugin**, choose the zip, click **Install Now**, then **Activate**.
3. Go to **Settings → Accessibility Panel**.
4. Pick the accent, text and indicator colours with the colour pickers, choose bottom-left or bottom-right, and paste the URL of your accessibility statement page (see [Section 6](#6-the-accessibility-statement-page)).
5. Save. Open your site in a private window and confirm the button appears.

The plugin prints the script on the public site only, never in wp-admin, the Customizer preview, feeds or embeds. To self-host the script file instead of using the CDN, add to your theme's `functions.php`:

```php
add_filter( 'a11yw_script_url', function () {
    return 'https://example.com/wp-content/uploads/a11y-widget.js';
} );
```

**Option B: paste the tag**

If you already use a header/footer code plugin (WPCode, Insert Headers and Footers) or your theme has a "footer scripts" box, paste the Quick Start tag there. If the tool strips custom attributes, use the `window.A11yWidgetConfig` form from Section 3 instead.

**Notes**

- Page builders (Elementor, Divi, Bricks) without a `<main>` element still work; read-aloud falls back to the whole page.
- Themes that put `transform` or `filter` on `<body>` for page-transition effects break every fixed-position element. If the button scrolls with the page, turn that effect off.

### 4.2 Shopify

Works with Online Store 2.0 themes (Dawn and derivatives) and older sectioned themes.

1. In Shopify admin go to **Online Store → Themes**. On your live theme open the **…** menu and choose **Edit code**. Consider duplicating the theme first and testing on the copy.
2. Under **Snippets** click **Add a new snippet**, name it `a11y-widget`, paste the contents of [`platforms/shopify/a11y-widget.liquid`](platforms/shopify/a11y-widget.liquid) and save.
3. Open **Layout → theme.liquid**, find `</body>` and add this line just above it:
   ```liquid
   {% render 'a11y-widget' %}
   ```
4. At the top of the snippet, edit the four `assign` lines: accent colour, text colour, indicator colour, and `left` or `right`. Shopify Inbox and most chat apps sit bottom-right, so `left` is usually the better choice.
5. Optional: create a page at **Online Store → Pages** titled "Accessibility" (handle `accessibility`). The snippet links the panel to it automatically.
6. Save and preview the theme, then publish.

**Notes**

- Labels follow your published storefront languages through Shopify's `<html lang>`.
- The checkout is not themeable on standard plans; the panel appears on the storefront only.
- To remove: delete the `{% render %}` line.

### 4.3 Wix

Requires a Premium plan with a connected domain (Wix only allows site-wide code on those plans).

1. In the Wix dashboard go to **Settings → Custom Code** (under Advanced).
2. Click **+ Add Custom Code** and paste the Quick Start tag, adjusting the colours. Use `data-position="left"` if you use Wix Chat.
3. Name it "Accessibility panel". Set **Add Code to Pages** to **All pages**, choose **Load code once**, and place it at **Body - end**. Click **Apply**.
4. **Publish** the site. Custom Code runs on the live site only, not in the editor or preview.
5. Optional: add a page "Accessibility" at `/accessibility` and set `data-statement` to match.

Do **not** use the "Embed HTML" element. It renders inside an iframe and the panel would be trapped in a small box.

### 4.4 Next.js

**App Router** (`app/layout.tsx`):

```tsx
import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
        <Script
          src="https://cdn.jsdelivr.net/gh/skychengtian/a11y-widget@1.1.2/a11y-widget.js"
          strategy="beforeInteractive"
          data-color="#1f3a93"
          data-statement="/accessibility"
        />
      </body>
    </html>
  );
}
```

`suppressHydrationWarning` on `<html>` stops React complaining about the mode classes the script sets before hydration.

**Pages Router** (`pages/_document.tsx`), inside `<body>` after `<NextScript />`:

```tsx
import Script from 'next/script';
// ...
<Script
  src="https://cdn.jsdelivr.net/gh/skychengtian/a11y-widget@1.1.2/a11y-widget.js"
  strategy="beforeInteractive"
  data-color="#1f3a93"
  data-statement="/accessibility"
/>
```

Using `next/script` rather than a bare `<script>` satisfies the `@next/next/no-sync-scripts` lint rule. If your site sets `maximumScale: 1` in the viewport, remove it: blocking pinch zoom fails WCAG 1.4.4.

### 4.5 Plain HTML and static sites

Add the Quick Start tag before `</body>` in your layout or template so it appears on every page. For static site generators (Hugo, Jekyll, Eleventy, Astro) put it in the base layout file.

### 4.6 Other builders and frameworks

| Where | Setting |
| --- | --- |
| Squarespace | Settings → Advanced → Code Injection → Footer |
| Webflow | Project Settings → Custom Code → Footer Code |
| Framer | Site Settings → General → Custom Code → End of `<body>` |
| Ghost | Settings → Code injection → Site Footer |
| Nuxt | `app.head.script` in `nuxt.config`, with `defer: true` and the `data-` keys |
| SvelteKit | `src/app.html` before `</body>` |
| Vue / Angular / React (Vite) | `index.html` before `</body>` |

Paste the Quick Start tag. If the builder strips `data-` attributes, use the `window.A11yWidgetConfig` form.

### 4.7 Google Tag Manager

For sites you cannot edit directly.

1. In GTM create a new **Tag** of type **Custom HTML**.
2. Paste the Quick Start tag.
3. Trigger: **All Pages**. Save and **Publish** the container.

The panel loads after GTM, so saved preferences apply a moment after first paint. Acceptable, but prefer a direct install when you can.

### 4.8 Strict Content Security Policy

If your CSP has `style-src 'self'` without `'unsafe-inline'` or a nonce, the injected `<style>` tag would be blocked. Link the stylesheet, turn off injection, pin a version and add integrity hashes:

```html
<link rel="stylesheet"
      href="https://cdn.jsdelivr.net/gh/skychengtian/a11y-widget@1.1.2/a11y-widget.css"
      integrity="sha384-…" crossorigin="anonymous">
<script src="https://cdn.jsdelivr.net/gh/skychengtian/a11y-widget@1.1.2/a11y-widget.js"
        integrity="sha384-…" crossorigin="anonymous"
        data-css="off" data-color="#1f3a93" data-statement="/accessibility"></script>
```

Allow the CDN in your policy: `script-src 'self' https://cdn.jsdelivr.net; style-src 'self' https://cdn.jsdelivr.net`. Compute each hash with:

```
curl -s https://cdn.jsdelivr.net/gh/skychengtian/a11y-widget@1.1.2/a11y-widget.js | openssl dgst -sha384 -binary | openssl base64 -A
```

Integrity hashes only work with a pinned version. When you upgrade, change the version and both hashes together. If you use CSP nonces instead, the script copies its own `nonce` attribute onto the injected style tag, so the simple install works.

---

## 5. How visitors use the panel

The button sits in a lower corner of every page. Click it, or press **Alt + Shift + A**, to open the panel. It has five tabs:

| Tab | Contents |
| --- | --- |
| **Profiles** | One-tap presets, each with a plain-language description: Vision impaired, Dyslexia & reading, ADHD & focus, Seizure safe, Keyboard & motor. Tap again to clear. |
| **Text** | Text size 100–175%, spacing (Default / Moderate / Wide), alignment, readable font. |
| **Color** | Contrast (Default / High / Dark / Invert), saturation (Default / Grayscale / High). |
| **Reading** | Highlight links, highlight headings, highlight focus, big cursor, reading guide, reading mask, stop animations (also pauses video), hide images, mute sounds. |
| **Tools** | Read page aloud (with pause and stop), page structure (jump to any heading or landmark), move the button to the other side, hide the panel for this visit. |

Tabs that hold active settings show a small dot, and so does the button. **Reset all** returns everything to default. Settings persist across pages and visits in the visitor's browser. **Escape** closes the panel and returns focus to the button. Everything is keyboard-operable and announced to screen readers.

---

## 6. The accessibility statement page

The panel links to a statement page. Create one at the URL you pass in `data-statement`. A short statement is enough; adapt this:

> **Accessibility**
>
> [Organisation] wants everyone to be able to use this website, including people who rely on screen readers, keyboard navigation, magnification or other assistive technology. We design to the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA.
>
> Every page has an accessibility panel in the lower corner. Open it with the round button or by pressing Alt + Shift + A to adjust text size, spacing, contrast and reading aids, or to have the page read aloud. Your choices are saved only in your own browser and are never sent to us. The panel supplements, and does not replace, the accessibility built into the site itself.
>
> If you encounter a barrier, email [address] with the page, what you were trying to do, and the browser or assistive technology you were using. We aim to respond within five business days.

Add a link to the page from your footer, and include `<a href="#a11y">Open the accessibility panel</a>` on it.

---

## 7. Privacy

Add one sentence to your privacy policy:

> The accessibility panel script is delivered by the jsDelivr content delivery network, which receives the technical request information (such as IP address) needed to serve the file. Panel preferences are stored in your browser's local storage on your own device and are not transmitted to us.

The widget sets no cookies, loads no fonts or images from third parties, and makes no network requests of its own.

---

## 8. Updating

| Install | How updates arrive |
| --- | --- |
| Pinned `@1.1.2` (recommended, used in all guides) | Change the version in your tag when you want the new release. Each version has its own URL, so every visitor gets it on their next page load. With integrity hashes, recompute both hashes too. |
| `@1` range | Not recommended for production. jsDelivr serves the newest 1.x release, but tells browsers to cache the file for 7 days, so returning visitors can keep an old build for up to a week after a fix. |
| WordPress plugin | The plugin pins the widget to its own version. Update the plugin to get a new widget release. |

Releases are tagged on GitHub: https://github.com/skychengtian/a11y-widget/releases

---

## 9. Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| No button appears | Check the browser console. A 404 means the URL is wrong; a CSP error means the CDN is not allowed (see 4.8). On Wix, Custom Code runs on the published site only. |
| Button overlaps a chat bubble or back-to-top button | Set `data-position` to the other side. |
| Button scrolls with the page instead of staying put | The theme applies `transform` or `filter` to `<body>` or a wrapper, which breaks `position: fixed`. Remove that effect. |
| Panel text is white on a pale accent | Choose a darker `data-color` with at least 4.5:1 contrast against white. |
| Read aloud is greyed out | The browser has no speech engine (rare; some kiosk or privacy browsers). Nothing to fix on the site. |
| Read aloud sounds like the wrong language | The device has no voice installed for the page language, so the engine falls back to its default voice. Since 1.1.2 the panel shows a notice instead of reading. The visitor adds a voice in their system settings (macOS: System Settings → Accessibility → Spoken Content; Windows: Settings → Time & Language → Speech). |
| A fix was released but a site still behaves the old way | The site loads the `@1` range URL, which browsers cache for 7 days. Switch to a pinned version URL, or hard-refresh (Cmd/Ctrl + Shift + R) to test. |
| Panel labels are in the wrong language | Set `<html lang>` correctly, or force it with `data-lang`. |
| Saved settings do not persist | The visitor's browser blocks storage (private mode on some browsers). The panel still works for the session. |
| Two panels appear | The script is included twice. The widget guards against this, but two different versions or two different `data-key` values will both mount. Remove one. |

---

## 10. Checklist before going live

- [ ] Button appears on every page and on mobile.
- [ ] Button does not overlap other floating elements.
- [ ] Accent colour has at least 4.5:1 contrast against white.
- [ ] Accessibility statement page exists and `data-statement` points to it.
- [ ] Footer links to the statement page.
- [ ] Privacy policy mentions the jsDelivr CDN and browser-only storage.
- [ ] Pinch zoom is not disabled in the viewport meta tag.
- [ ] Opened the panel with the keyboard (Tab to the button, Enter, Escape) and it worked.
