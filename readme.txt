PIXELCRAFT STUDIO — STATIC WEBSITE

CONTENTS
- index.html: editor, canvas, crop/resize, adjustments, effects, transforms, text, stickers, frames and export.
- Crop workflow: click the Crop icon in the canvas toolbar or the Crop & Resize sidebar tab. The crop frame appears immediately over the image; drag the frame or its handles, then choose Apply crop or Cancel.
- pixelcraft-enhancements.js: history, zoom/pan, compare-original, project JSON, collage/meme tools, UI tabs and cookie preferences.
- about.html, contact.html, privacy.html, terms.html, disclaimer.html, guides.html: support and legal-information pages.
- ADSENSE_SETUP.md: advertising setup checklist.

RUN LOCALLY
1. Keep all files in this folder.
2. Open index.html in a recent version of Chrome, Edge or Firefox.
3. Images are processed by browser Canvas APIs; they are not sent to a PixelCraft image-processing server.
4. Tailwind CSS and Lucide icons are loaded from CDNs for styling/icons; an internet connection is needed for those external resources. The image editing tools themselves run in the browser.

DEPLOY
Upload the complete photosizer_site folder to Netlify Drop or another static host. Keep pixelcraft-enhancements.js beside index.html.

BEFORE PUBLIC LAUNCH
- The Contact page is configured to use jashutosh587@gmail.com. Confirm this inbox is monitored before publishing; update contact.html and the linked legal-page email addresses if it changes.
- Review all legal copy for your business and jurisdictions.
- Advertisement blocks are placeholders. No ads or revenue are active until you add your own approved AdSense code.
- The starter cookie preference banner is not a certified consent-management platform. Before activating personalized ads for users in regions requiring a certified CMP, check current Google requirements and use an appropriate certified CMP.
- Background removal is a color-sampling/chroma-key tool, not AI segmentation.
- Passport photo templates set dimensions only; they do not validate official photo rules.
- Project JSON currently saves a flattened image preview together with settings metadata; loading restores that preview as an editable image layer.
- Batch processing creates individual file downloads, not a ZIP archive.

TECHNOLOGY
Static HTML/CSS/JavaScript with Tailwind CDN utilities and Lucide icon set; no backend or account database is required.
