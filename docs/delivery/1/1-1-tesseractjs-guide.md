# 1-1 tesseract.js guide

Date: 2026-04-07

## Sources

- [Repository](https://github.com/naptha/tesseract.js)
- [API documentation](https://github.com/naptha/tesseract.js/blob/master/docs/api.md)

## Install

- npm install tesseract.js

## Verified Core API

- Import: import { createWorker } from 'tesseract.js'
- Worker creation: const worker = await createWorker('eng')
- Recognition: const result = await worker.recognize(imageInput)
- Text output: result.data.text
- Cleanup: await worker.terminate()

## Usage Notes

- For multiple images, create one worker, reuse recognize for each image, then terminate once.
- The library runs in browser via WebAssembly.
- The README notes that non-text outputs changed in recent versions; text extraction should remain the primary output for MVP.

## Example

```ts
import { createWorker } from 'tesseract.js';

export async function runOcr(imageDataUrl: string): Promise<string> {
  const worker = await createWorker('eng');
  try {
    const result = await worker.recognize(imageDataUrl);
    return result.data.text;
  } finally {
    await worker.terminate();
  }
}
```
