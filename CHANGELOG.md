# Changelog

All notable changes to a11y-widget. Versions are semantic; the hosted `/v1/` URL always serves the latest 1.x.

## Unreleased

## 1.1.2 — 2026-10-04

- Read-aloud shows a notice when the browser lists voices but none for the page language, instead of reading with the default (usually English) voice. Notice in all four languages.
- Documentation and the WordPress plugin now recommend the automatic-update URL (`https://a11ywidget.vercel.app/v1/a11y-widget.js`) and explain the 7-day browser cache on jsDelivr's `@1` range. WordPress plugin 1.2.0 adds an Update channel setting (Automatic / Pinned).

## 1.1.1 — 2026-10-04

- Read-aloud: page language is normalised to a tag browsers register voices under (`zh-Hans` and `zh` → `zh-CN`, `zh-Hant` → `zh-TW`, bare codes → regional) and a matching voice is selected explicitly, waiting for the voice list when it loads late. Chinese pages previously fell back to the English voice.
- Every hover state sets text colour and background explicitly at raised specificity, so host-site rules (link fades, button colours) cannot leave panel text invisible.

## 1.1.0 — 2026-10-04

- Configuration via `window.A11yWidgetConfig` as an alternative to data attributes.
- Main-content detection also matches `#content` and `#primary`.
- Platform installers: WordPress plugin with settings page (source and zip), Shopify Liquid snippet, Wix instructions. `INSTALL.md` added.

## 1.0.1 — 2026-10-04

- Panel neutrals (pill backgrounds, borders, switch tracks, secondary text) are derived from the accent and ink colours with `color-mix`, so the panel matches each site's palette. New `data-ink` and `data-accent` attributes.

## 1.0.0 — 2026-10-04

- First standalone release. Tabbed panel (Profiles, Text, Color, Reading, Tools), quick profiles with descriptions, text size to 175%, spacing, alignment, readable font, contrast and saturation modes, reading aids (links, headings, focus, cursor, guide, mask, animations, images, sounds), read-aloud, page-structure navigator, keyboard shortcut, English/Chinese/Spanish/Vietnamese labels, strict-CSP mode via linked stylesheet, Vercel demo host.
- Fixed from the pre-release versions: reading-mask overlay class collided with the `<html>` toggle class and froze the page; hover and pressed states; rounded restyle; contrast of surfaces.
