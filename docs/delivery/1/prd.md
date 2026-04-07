# PBI-1: Local LinkedIn Carousel Page Translation Extension

[View in Backlog](../backlog.md#user-content-pbi-1)

## Overview

Build a Chrome Manifest V3 extension that translates text from LinkedIn carousel pages without sending user content to a paid external API.

## Problem Statement

LinkedIn currently translates post captions but not the text inside carousel pages (typically uploaded PDF pages rendered as images or canvas). Users must leave the feed or manually copy text to external tools.

## User Stories

- As a LinkedIn user, I want a Translate button on carousel posts so I can trigger translation only when needed.
- As a user, I want translated content shown directly on the LinkedIn page so I do not leave the feed.
- As a privacy-sensitive user, I want OCR and translation to run locally in my browser.

## Technical Approach

- Use a content script with DOM observation to detect carousel posts and inject a Translate button.
- Capture the visible carousel page image from img or canvas elements.
- Use an offscreen extension document to run OCR and translation with WebAssembly models.
- Persist target language in chrome.storage.sync and apply it for all translation requests.

## UX/UI Considerations

- Keep controls minimal and non-invasive.
- Translation is shown in a draggable floating widget to avoid layout conflicts with LinkedIn UI.
- Provide loading and error states for first-time model download and OCR failures.

## Acceptance Criteria

- Translate button appears on eligible carousel posts.
- Clicking Translate captures the visible slide and extracts text.
- Translation runs locally and returns text in the configured target language.
- Results are displayed in a movable widget on the same page.
- No mandatory API key or paid service is required.

## Dependencies

- Chrome Extensions Manifest V3 APIs, including offscreen and storage.
- OCR library: tesseract.js.
- Local translation library: @huggingface/transformers.

## Open Questions

- Should auto-translate be supported when users navigate to the next carousel page?
- Should a per-post source language override be exposed in the widget?

## Related Tasks

- [Tasks for PBI 1](./tasks.md)
