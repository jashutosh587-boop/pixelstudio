# PixelCraft Studio — QA and deployment notes

## Updates in this release
- Contact, Privacy Policy and Disclaimer use the clickable support email `jashutosh587@gmail.com`. Confirm that this inbox is monitored before publishing.
- Removed outdated instructions asking the owner to replace the Contact-page placeholder.
- Privacy copy explains local image processing, hosting/CDN technical requests, local preference storage, inactive advertising/analytics placeholders, and the limitations of the included preference panel.
- Cookie preferences are versioned, migrate prior saved choices, support reject/accept/custom choices, can be reopened from the footer, and expose `window.PixelCraftConsent.get()` / `.allows(category)` plus a `pixelcraft:consentchange` event for future integrations.
- No analytics or advertising scripts are enabled by these preferences. The panel is not a certified consent-management platform; add an appropriate certified CMP where required before turning on regulated advertising.
- Improved image decoding fallback, crop history restoration, original-image comparison, collage capacity messaging, download failure messages and multi-file routing fallback.
- Clarified that already-optimized or very small images may not become smaller after re-encoding.
- Added `robots.txt` and `sitemap.xml` for the current Netlify hostname.

## Automated browser checks
Tested using Chromium with generated PNG fixtures and a simulated browser page. These are automated local tests, not a substitute for checking the production site in real devices and browsers.

- JavaScript/page errors: **0**. Browser console errors: **0**.
- Crop button activates the crop frame directly; drag, apply, original comparison, undo and redo passed. Example 640 × 480 source cropped to 512 × 384; original comparison remained 640 × 480.
- Transparent PNG export retained alpha in letterboxed margins; JPEG export filled those margins white.
- Main multi-file upload routed two images into the batch workspace.
- Batch resize: two successful outputs and working download link.
- Bulk compression: two successful outputs. A test using already-small PNG fixtures produced slightly larger WebP files; the UI reports the actual size change rather than promising every conversion will shrink a file.
- Format conversion: downloaded WebP was confirmed as 800 × 600.
- Passport maker: downloaded 413 × 531 JPEG for the 35 × 45 mm preset at 300 DPI.
- Background remover: generated/downloaded a transparent PNG using the solid-color sampling tool.
- Watermark editor: generated/downloaded a 640 × 480 PNG.
- Collage and meme tools generated downloadable JPG outputs. The 2 × 2 collage correctly reported that four of six selected photos fit that layout.
- Project JSON save and restore passed.
- Image decoding fallback passed when `createImageBitmap` was forced to reject.
- No horizontal page overflow at 390 px or 320 px viewport widths; mobile tools modal opened.
- Dimension input clamped a request of 20,000 px to the 12,000 px per-edge limit.

## Remaining limitations
- Background removal uses chroma-key/color sampling; it is not AI subject segmentation.
- The cookie panel is a basic preference interface, not a certified CMP. No optional analytics or advertising tags are shipped in this build.
- Ad slots are placeholders. Add your own approved AdSense code and actual publisher identifiers only after approval and after meeting applicable consent requirements.
- Automated checks were run in Chromium. Manually verify the production deployment in current Chrome, Edge, Firefox and mobile Safari before public promotion.

## Deployment
Upload the complete `photosizer_site` folder to the existing Netlify project as a new production deploy. Keep `index.html`, `pixelcraft-enhancements.js`, legal pages, `robots.txt` and `sitemap.xml` together.

This package does **not** directly update the currently published Netlify deployment. The live site changes only after the site owner uploads this folder to the existing Netlify project.
