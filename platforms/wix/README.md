# Wix

Wix allows site-wide code through **Custom Code**, which requires a Premium plan with a connected domain. Do not use the "Embed HTML" element: it renders inside an iframe and the panel would be trapped in a small box.

## Install

1. In the Wix dashboard go to **Settings → Custom Code** (under Advanced).
2. Click **+ Add Custom Code** and paste:

   ```html
   <script
     src="https://cdn.jsdelivr.net/gh/skychengtian/a11y-widget@1.1.2/a11y-widget.js"
     defer
     data-color="#1f3a93"
     data-ink="#262b33"
     data-accent="#f3c552"
     data-position="left"
     data-statement="/accessibility">
   </script>
   ```

3. Name it "Accessibility panel", set **Add Code to Pages** to **All pages**, load it **once**, and choose **Body - end**. Click Apply.
4. Publish the site. Custom Code runs on the live site only, not in the editor or preview.
5. Optional: add a page called "Accessibility" at the URL `/accessibility` with your statement (see the main README's "Statement template"). Change `data-statement` if you use a different URL.

## Colours

Replace the three colour values with your site's palette. The accent gets white text drawn on it, so use a colour with at least 4.5:1 contrast against white. If you use the Wix Chat bubble, keep `data-position="left"` so the two do not overlap.

## Notes

- Wix sets the page language on `<html lang>`, so multilingual sites get the matching panel labels automatically for English, Simplified Chinese, Spanish and Vietnamese.
- Wix navigates between pages without a full reload. The panel stays mounted and rebuilds its page-structure list each time it is opened, so it always reflects the current page.
- Wix's own accessibility wizard fixes alt text and headings in your content; keep using it. This panel adds visitor-side display preferences on top.
- Mention in your privacy policy that the accessibility panel script is delivered by the jsDelivr content delivery network and stores preferences in the visitor's browser only.
