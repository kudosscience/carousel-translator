# Deployment Guide

This guide shows how to build and deploy the extension locally for testing.

## 1. Prerequisites

Install these first:

- Node.js 20 or later
- npm (comes with Node.js)
- Google Chrome (version 116+ recommended)

Check versions:

```bash
node -v
npm -v
```

## 2. Install Dependencies

From the project root:

```bash
npm install
```

## 3. Build and Validate

Run the full validation command:

```bash
npm run check
```

What this does:

- Type-checks TypeScript (`npm run typecheck`)
- Builds the extension bundle into `dist/`

## 4. Confirm Output

After a successful build, confirm these files exist in `dist/`:

- `manifest.json`
- `background.js`
- `content.js`
- `offscreen.js`
- `popup.html`
- `options.html`

## 5. Load in Chrome (Unpacked)

1. Open Chrome and go to `chrome://extensions/`.
2. Turn on **Developer mode**.
3. Click **Load unpacked**.
4. Select the project `dist` folder.
5. The extension should appear as **LinkedIn Carousel Translator**.

## 6. Configure Target Language

1. Click the extension icon.
2. Click **Open Settings**.
3. Choose your target language.
4. Click **Save**.

## 7. Verify Basic Functionality

1. Open LinkedIn.
2. Find a carousel or document post.
3. Click **Translate slide**.
4. Confirm a draggable translation panel appears.

## 8. Rebuild During Development

Any time you change source code:

```bash
npm run check
```

Then:

- Go to `chrome://extensions/`
- Click the extension's **Reload** button
- Refresh the LinkedIn tab

## 9. Packaging for Distribution

For manual sharing or web store upload, zip the contents of the `dist/` folder (not the whole repository).

PowerShell example:

```powershell
Compress-Archive -Path .\dist\* -DestinationPath .\linkedin-carousel-translator.zip -Force
```

## 10. Deployment Troubleshooting

### Extension fails to load

- Open `chrome://extensions/`
- Click **Errors** on the extension card
- Fix any listed issue and rebuild

### No translation response

- Reload extension and page
- Confirm internet is available for initial model download
- Try a different carousel post with clearer text

### Build succeeds but behavior is stale

- Reload extension in `chrome://extensions/`
- Hard refresh LinkedIn (Ctrl+Shift+R)
