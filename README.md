# LinkedIn Carousel Translator

LinkedIn can translate post captions, but not the text inside carousel pages.
This extension helps by translating the visible carousel slide without leaving LinkedIn.

## What This Is (In Plain English)

This is a Chrome extension that:

- Adds a "Translate slide" button to LinkedIn carousel posts.
- Reads text from the currently visible slide.
- Translates that text into your chosen language.
- Shows translation in a movable panel on the same page.

You can stay in your feed or on the post page the whole time.

## Why This Is Useful

If someone uploads a PDF carousel in a language you do not speak, you normally need to copy text manually or use external tools.
With this extension, translation happens right there on LinkedIn.

## Privacy and Cost

- No paid API key is required.
- OCR and translation run locally in your browser extension context.
- The extension may download model files the first time you use it.

## How It Works (Simple View)

1. You click "Translate slide" on a LinkedIn carousel post.
2. The extension captures the visible slide image.
3. OCR extracts text from the image.
4. A local translation model translates the text.
5. A floating panel shows translated text plus optional raw OCR text.

## Quick Start

1. Install Node.js 20 or later.
2. Run `npm install` in the project root.
3. Run `npm run check`.
4. Load the `dist` folder as an unpacked extension in Chrome.
5. Open extension settings and pick your target language.
6. Go to LinkedIn and click "Translate slide" on a carousel post.

For full step-by-step deployment instructions, see [docs/deployment.md](docs/deployment.md).

## Full Documentation

- Deployment guide: [docs/deployment.md](docs/deployment.md)
- Usage guide: [docs/usage.md](docs/usage.md)
- Chrome Web Store publishing guide: [docs/chrome-web-store-publishing.md](docs/chrome-web-store-publishing.md)

## Current Capabilities

- Manual translation trigger (button on carousel posts)
- Draggable translation panel
- Target language saved in extension settings
- Works on `linkedin.com` with Chrome Manifest V3

## Limitations to Know

- OCR quality depends on slide image quality and font size.
- First translation can be slower due to model download.
- Very dense slides may produce imperfect line breaks.

## Troubleshooting (Quick)

- No button appears:
  - Refresh LinkedIn after installing or updating the extension.
  - Make sure the post is a carousel or document post.
- Translation is slow on first run:
  - Wait for model download and caching.
- Empty result:
  - The slide may have low-contrast text or be image-heavy.

More troubleshooting steps are in [docs/usage.md](docs/usage.md).

## Tech Stack

- Chrome Extension Manifest V3
- TypeScript + esbuild
- OCR: `tesseract.js`
- Translation: `@huggingface/transformers`
