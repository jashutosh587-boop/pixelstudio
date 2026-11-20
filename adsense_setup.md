# Google AdSense setup for PixelCraft Studio

## Important

The `ADVERTISEMENT` areas in `index.html` are **layout placeholders only**. No ads are served and no revenue is generated until the site owner applies to AdSense, is approved, and adds their own publisher and ad-unit identifiers. Do not leave demo or placeholder publisher IDs in production.

## Before applying

1. Deploy the full `photosizer_site` folder to a domain you control.
2. Confirm the support address in `contact.html` is monitored. The current configured address is `jashutosh587@gmail.com`; update it if you use a different support inbox.
3. Review the Privacy Policy and Terms for your actual business, location, data practices, and advertising setup. Obtain legal advice where needed.
4. Add useful original content (for example, clear image-size guides, compression explanations, and passport-photo instructions) so the site offers more than only tool controls.
5. Test the editor on mobile and desktop, including downloads, privacy page, and navigation.

## Add the AdSense code after approval

1. Create or access your publisher account at https://adsense.google.com/.
2. Follow the current AdSense site-verification and approval instructions shown in your account.
3. Copy the exact AdSense script and ad-unit code supplied by Google. Insert the script in the `<head>` of `index.html` exactly as Google instructs.
4. Replace the three visible `.ad-slot` placeholder blocks with your own approved ad-unit snippets. Use the actual `data-ad-client` / `data-ad-slot` values from your account; never guess them.
5. If AdSense instructs you to publish an `ads.txt` file, create it at the site root using the exact seller record from your account. Do not publish an example or placeholder publisher ID.
6. If ads or analytics use cookies or similar technologies, update your privacy disclosures and implement a suitable consent-management platform for the jurisdictions and ad products you use. The starter preference banner is not a certified CMP; for AdSense personalization in the EEA, UK and Switzerland, check Google’s current CMP requirements and use a certified solution when required.
7. Redeploy and verify the site in your AdSense account.

## Suggested placements

- Top banner: below the main editor navigation, above the workspace.
- Inline placement: below the selected photo tool.
- Footer placement: near the bottom of the page.

Keep ads away from upload, crop, download, and other functional controls. Clearly distinguish advertisements from tool buttons. Never click your own ads or encourage visitors to do so.

## Notes

Ad approval and earnings are not guaranteed. Google may change eligibility, privacy, consent, and placement requirements; always follow the latest instructions in your AdSense account and official policy pages.


## Consent banner note

The built-in PixelCraft preference banner is a basic opt-in interface. It is not a certified consent management platform and no optional analytics/ad scripts are loaded by default. Before turning on personalized advertising for visitors in the EEA, UK or Switzerland, check the current Google AdSense requirements and use a Google-certified CMP when required. The ad integration must honor stored consent choices.
