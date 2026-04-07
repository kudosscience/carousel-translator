# Usage Guide

This guide is for end users.

## 1. Before You Start

Make sure the extension is already loaded in Chrome.
If not, follow [deployment.md](./deployment.md).

## 2. Set Your Target Language

1. Click the extension icon in Chrome toolbar.
2. Click **Open Settings**.
3. Select your language (for example: Spanish, French, German).
4. Click **Save**.

This setting is remembered for future translations.

## 3. Translate a LinkedIn Carousel Slide

1. Open LinkedIn and find a carousel or document post.
2. On the post, click **Translate slide**.
3. Wait while the extension:

   - Extracts text from the visible slide
   - Translates it to your selected language

4. Read the result in the floating translation panel.

## 4. Move or Close the Translation Panel

- Drag the panel by its header to reposition it.
- Click `x` to close it.
- Click **Translate slide** again to reopen or update it.

## 5. Understand First-Run Delay

The first translation may take longer because language model files are downloaded and cached.
Later translations are usually faster.

## 6. Tips for Better Results

- Use slides with readable, high-contrast text.
- Zoom browser in if slide text is very small.
- Translate one visible slide at a time.

## 7. What Is Not Translated

- LinkedIn captions are handled by LinkedIn itself.
- This extension focuses on text inside carousel pages.

## 8. Common Issues

### Button does not appear

Try these steps:

1. Refresh LinkedIn page.
2. Reload extension in `chrome://extensions/`.
3. Confirm the post is a carousel or document post.

### Translation panel appears but text is empty

Likely causes:

- Slide image quality is low
- Text is too small
- Slide contains mostly graphics

Try another slide or zoom level.

### Translation quality is awkward

OCR and local translation can struggle with complex formatting.
Use the **Original OCR text** section in the panel to compare extracted text.

## 9. Privacy Notes

- Translation is designed to run locally in the extension environment.
- No paid translation API is required.
- Initial model downloads come from approved model/CDN hosts declared in the extension manifest.
