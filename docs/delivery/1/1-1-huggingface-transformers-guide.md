# 1-1 @huggingface/transformers guide

Date: 2026-04-07

## Sources

- [Repository](https://github.com/huggingface/transformers.js)
- [Documentation](https://huggingface.co/docs/transformers.js)
- [NPM package](https://www.npmjs.com/package/@huggingface/transformers)

## Install

- npm install @huggingface/transformers

## Verified Core API

- Import: import { pipeline, env } from '@huggingface/transformers'
- Pipeline creation: const translator = await pipeline('translation', modelId, options)
- Inference: const output = await translator(inputText)
- Translation output shape typically includes translation_text on each returned item.

## Browser Runtime Notes

- Runs with ONNX Runtime in browser (WASM by default).
- Quantization options can be set with dtype such as q8 or q4 for performance.
- WebGPU can be enabled with device: 'webgpu' in compatible environments.
- env APIs can be used to control remote model behavior and wasm asset pathing if needed.

## Example

```ts
import { pipeline } from '@huggingface/transformers';

export async function translateText(text: string): Promise<string> {
  const modelId = 'Xenova/opus-mt-en-es';
  const translator = await pipeline('translation', modelId, { dtype: 'q8' });
  const output = await translator(text);
  return output.map((item: { translation_text?: string }) => item.translation_text ?? '').join('\n');
}
```
