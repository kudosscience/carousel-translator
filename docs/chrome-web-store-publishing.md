# Chrome Web Store Publishing Guide

This guide explains how to publish the extension to the Chrome Web Store.

## 1. Prerequisites

Before publishing, make sure you have:

- A Google account for publisher access
- A built extension in `dist/`
- Branding assets (icon, screenshots, optional promo graphics)
- A support contact email

Note: Google may charge a one-time or recurring developer registration fee depending on current policy.
Always confirm the latest requirements in the Chrome Web Store dashboard.

## 2. Create Publisher Account

1. Go to the Chrome Web Store Developer Dashboard.
2. Sign in with your Google account.
3. Complete publisher registration.
4. Accept terms and any required verification steps.

## 3. Prepare Release Package

You must upload a ZIP containing the extension build artifacts.

### Build fresh artifacts

```bash
npm install
npm run check
```

### Create ZIP from `dist`

PowerShell example:

```powershell
Compress-Archive -Path .\dist\* -DestinationPath .\linkedin-carousel-translator-webstore.zip -Force
```

Important:

- Zip the contents of `dist`, not the entire repository folder.
- Ensure `manifest.json` is at the root level inside the ZIP.

## 4. Prepare Store Listing Content

Create these assets and texts before upload.

### Required or commonly requested

- Extension name
- Short description
- Detailed description
- Category
- Language
- At least one screenshot
- 128x128 icon

### Strongly recommended

- Additional screenshots showing real usage
- Small and large promo tiles (if requested by dashboard flow)
- A simple support page
- A privacy policy page

## 5. Upload New Item

1. Open the Developer Dashboard.
2. Click **Add new item**.
3. Upload `linkedin-carousel-translator-webstore.zip`.
4. Wait for validation checks.

If validation fails:

- Read the error in dashboard
- Fix source or build
- Rebuild and upload again

## 6. Fill Product Details

In the listing form:

1. Add title and descriptions in plain language.
2. Upload screenshots that show:

   - Translate button on LinkedIn carousel post
   - Translation widget with output
   - Language settings page

3. Select category (for example, Productivity).
4. Add support contact and links.

## 7. Complete Privacy and Permissions Disclosures

Because this extension uses host permissions and content scripts, provide clear disclosures.

### Explain permissions in plain language

- `storage`: saves the user's selected target language.
- `offscreen`: runs OCR and translation in a hidden extension page.
- `https://www.linkedin.com/*`: needed to inject the translate button and read visible slide data.
- `https://huggingface.co/*` and `https://cdn.jsdelivr.net/*`: used to fetch model and runtime assets.

### Data handling statement guidance

Document that:

- The extension is designed to process slide text locally.
- No paid third-party translation API is required.
- Any network calls are for model and runtime asset download and not for paid cloud translation processing.

Use precise wording that matches actual behavior in code and manifest.

## 8. Pass Policy Review

Before submitting for review:

1. Re-test extension from `dist` in a clean Chrome profile.
2. Confirm no broken UI labels or placeholder text.
3. Confirm all screenshots match current UI.
4. Ensure description does not claim features that are not implemented.
5. Ensure privacy policy and support URLs are reachable.

## 9. Submit for Review

1. Click **Submit for review**.
2. Track status in dashboard.
3. Respond quickly to any policy feedback.

Review may include requests to clarify permissions, data handling, or user value.

## 10. Publish and Maintain

After approval:

1. Set visibility (public or unlisted as needed).
2. Publish release.
3. Monitor user feedback and issue reports.
4. For updates, repeat:

   - Bump version in `manifest.json`
   - Build new ZIP from `dist`
   - Upload as new package
   - Submit update for review

## 11. Release Checklist (Quick)

- [ ] `npm run check` passes
- [ ] ZIP built from `dist/*`
- [ ] Listing text finalized
- [ ] Screenshots updated
- [ ] Permission explanations finalized
- [ ] Privacy and support URLs verified
- [ ] Submission completed
