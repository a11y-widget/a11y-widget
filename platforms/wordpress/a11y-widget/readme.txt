=== Accessibility Panel (a11y-widget) ===
Contributors: skywei
Tags: accessibility, a11y, wcag, dyslexia, contrast, text size, screen reader
Requires at least: 5.7
Tested up to: 6.7
Requires PHP: 7.2
Stable tag: 1.1.2
License: MIT

Adds an accessibility panel to every page: quick profiles, text size and spacing, contrast modes, reading aids, read-aloud and page structure. No tracking, no account.

== Description ==

A light, self-contained accessibility panel for your visitors. One round button in a corner opens a tabbed panel with:

* Quick profiles: vision impaired, dyslexia and reading, ADHD and focus, seizure safe, keyboard and motor
* Text: size up to 175%, spacing, alignment, readable font
* Color: high contrast, dark, invert, grayscale, saturation
* Reading aids: highlight links, headings and focus, big cursor, reading guide, reading mask, stop animations, hide images, mute sounds
* Tools: read the page aloud (browser speech engine), page-structure navigator
* English, Simplified Chinese, Spanish and Vietnamese, following the page language

Preferences are saved in the visitor's browser only. Nothing is sent anywhere. The script is served from the jsDelivr CDN from a public, tagged release on GitHub.

A panel like this complements, but does not replace, an accessible theme and accessible content.

== Installation ==

1. Upload the `a11y-widget` folder to `/wp-content/plugins/`, or upload the zip under Plugins → Add New → Upload Plugin.
2. Activate the plugin.
3. Go to Settings → Accessibility Panel to choose colours, position and your accessibility statement URL.

== Frequently Asked Questions ==

= Can I self-host the script instead of using the CDN? =

Yes. Download `a11y-widget.js` from the GitHub releases, upload it to your site, and add to your theme's functions.php:
`add_filter( 'a11yw_script_url', function () { return 'https://example.com/path/a11y-widget.js'; } );`

= The button overlaps my chat bubble =

Switch Position to the other side in Settings → Accessibility Panel.

== Changelog ==

= 1.1.2 =
* Widget 1.1.2: selects a matching voice for Chinese and other languages when reading aloud, shows a notice when the device has no voice for the page language, keeps hover text legible, pins the widget to the plugin version so browser caches never serve a stale build.

= 1.1.0 =
* Initial WordPress plugin. Configuration through the settings page; widget 1.1.0.
