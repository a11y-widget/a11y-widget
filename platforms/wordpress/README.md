# WordPress

Two options. The plugin is the easier one and needs no theme editing.

## Option A: plugin (recommended)

1. Download [`a11y-widget.zip`](a11y-widget.zip) from this folder (or from https://a11ywidget.vercel.app/platforms/wordpress/a11y-widget.zip).
2. In WordPress go to **Plugins → Add New → Upload Plugin**, choose the zip, install and activate.
3. Go to **Settings → Accessibility Panel**. Pick the accent, text and indicator colours, the side of the screen, and paste the URL of your accessibility statement page.

The plugin prints a `window.A11yWidgetConfig` object and the deferred script tag in `wp_head` (with `wp_footer` as a fallback for themes that skip `wp_head()`; it is printed once), on the public site only (never in wp-admin, the Customizer preview, feeds or embeds). Settings are stored in one option, `a11yw_settings`.

To self-host the script instead of using the CDN, add to your theme's `functions.php`:

```php
add_filter( 'a11yw_script_url', function () {
    return 'https://example.com/wp-content/uploads/a11y-widget.js';
} );
```

## Option B: paste the tag

If you already use a header/footer code plugin such as WPCode, or a theme with a "footer scripts" box, paste:

```html
<script
  src="https://a11ywidget.vercel.app/v1/a11y-widget.js"
  defer
  data-color="#1f3a93"
  data-ink="#262b33"
  data-accent="#f3c552"
  data-position="right"
  data-statement="/accessibility/">
</script>
```

If your tool strips custom attributes, set the options in a separate script instead:

```html
<script>window.A11yWidgetConfig = { color: '#1f3a93', position: 'right', statement: '/accessibility/' };</script>
<script src="https://a11ywidget.vercel.app/v1/a11y-widget.js" defer></script>
```

## Notes

- Most themes wrap content in `<main>`, `#content` or `#primary`; the widget detects all three for read-aloud and the page-structure list. Page builders (Elementor, Divi) without a `<main>` fall back to the whole page, which still works.
- Themes that put `transform` or `filter` on `<body>` for page-transition effects break every `position: fixed` element, including this button. Disable that effect if the button scrolls with the page.
- Create a page "Accessibility" with your statement and link it in the settings. Start from the [accessibility statement template](../../templates/accessibility-statement.md).
- Add a sentence to your privacy policy: the accessibility panel script is delivered by the jsDelivr content delivery network and stores preferences in the visitor's browser only.
