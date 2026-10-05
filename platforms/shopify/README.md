# Shopify

Works with any Online Store 2.0 theme (Dawn and its derivatives) and older sectioned themes.

## Install

1. In Shopify admin go to **Online Store → Themes**, open the **…** menu on your live theme and choose **Edit code**. Consider duplicating the theme first so you can test on the copy.
2. Under **Snippets** click **Add a new snippet**, name it `a11y-widget`, paste the contents of [`a11y-widget.liquid`](a11y-widget.liquid) and save.
3. Open **Layout → theme.liquid**, find the closing `</body>` tag and add this line just above it:

   ```liquid
   {% render 'a11y-widget' %}
   ```

4. Edit the four `assign` lines at the top of the snippet to set your accent, text and indicator colours and the side of the screen. Shopify Inbox and most chat apps sit bottom-right, so `left` is usually the better choice.
5. Optional: create a page at **Online Store → Pages** titled "Accessibility" (handle `accessibility`). The snippet links the panel to it automatically. Start from the [accessibility statement template](../../templates/accessibility-statement.md).

## Notes

- The storefront language is read from Shopify's `<html lang>`, so the panel labels follow your published locales (English, Simplified Chinese, Spanish and Vietnamese are built in; other languages fall back to English).
- Dawn's main content is `<main id="MainContent">`, which the snippet already targets for read-aloud and the page-structure list.
- The checkout is not themeable on standard plans, so the panel appears on the storefront only. Shopify Plus stores can add the same tag in checkout.liquid or via Checkout Extensibility.
- No app embed or theme setting is required. To remove, delete the `{% render %}` line.
- Add a sentence to your privacy policy: the accessibility panel script is delivered by the jsDelivr content delivery network, and preferences are stored in the visitor's browser only.
