# Document assets

Images and SVGs used by the digital document viewer. All are served from `public/images/` so they never depend on external URLs.

**Receipt assets (used by `DocumentView`):**
- **avatar.svg** – Silhouette in the thank-you block (downloaded from Shopify CDN; kept local).
- **web.svg**, **facebook.svg**, **instagram.svg**, **youtube.svg**, **whatsapp.svg** – Social icons in the footer (downloaded from Shopify CDN).
- **circle.svg** – Optional circle/brand graphic from Shopify (`4bb9c689-...`).

**Legacy placeholders** (can be replaced with production assets):
- **logo.svg** – Header logo (receipt currently uses external logo URL until local PNG is set).
- **banner.svg** – Hero image (receipt currently uses external banner URL until local image is set).

Use the same filenames so the app keeps working without code changes.
