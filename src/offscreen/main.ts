import { pipeline } from '@huggingface/transformers';
import { createWorker } from 'tesseract.js';
import {
  MAX_TRANSLATION_CHUNK_SIZE,
  MESSAGE_TARGET_OFFSCREEN,
  MESSAGE_TYPE_PROCESS_SLIDE,
  OCR_LANGUAGE
} from '../shared/constants';
import { getModelIdForTargetLanguage } from '../shared/languages';
import type { ProcessSlideRequest, ProcessSlideResponse } from '../shared/messages';

const TRANSLATION_TASK = 'translation';
const TRANSLATION_DTYPE = 'q8';
const EMPTY_TEXT_ERROR = 'No readable text was detected on this slide.';

type TranslationRecord = {
  translation_text?: string;
  generated_text?: string;
  text?: string;
};

type TranslationResult = TranslationRecord[] | string;
type TranslatorPipeline = (input: string) => Promise<TranslationResult>;

let ocrWorkerPromise: Promise<Awaited<ReturnType<typeof createWorker>>> | null = null;
const translatorPipelineCache = new Map<string, Promise<TranslatorPipeline>>();

function isProcessSlideRequest(message: unknown): message is ProcessSlideRequest {
  if (!message || typeof message !== 'object') {
    return false;
  }

  const candidate = message as Partial<ProcessSlideRequest>;
  return (
    candidate.type === MESSAGE_TYPE_PROCESS_SLIDE
    && candidate.target === MESSAGE_TARGET_OFFSCREEN
    && typeof candidate.imageDataUrl === 'string'
    && typeof candidate.targetLanguage === 'string'
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown offscreen processing error.';
}

function splitTextForTranslation(text: string, maxChunkSize: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];

  let currentChunk = '';
  for (const word of words) {
    const separator = currentChunk.length === 0 ? '' : ' ';
    const candidateChunk = `${currentChunk}${separator}${word}`;

    if (candidateChunk.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = word;
      continue;
    }

    currentChunk = candidateChunk;
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

function normalizeTranslationResult(result: TranslationResult): string {
  if (typeof result === 'string') {
    return result;
  }

  if (!Array.isArray(result)) {
    return '';
  }

  return result
    .map((item) => item.translation_text ?? item.generated_text ?? item.text ?? '')
    .join('\n')
    .trim();
}

async function getOcrWorker(): Promise<Awaited<ReturnType<typeof createWorker>>> {
  ocrWorkerPromise ??= createWorker(OCR_LANGUAGE);

  return ocrWorkerPromise;
}

async function getTranslator(modelId: string): Promise<TranslatorPipeline> {
  const existingTranslator = translatorPipelineCache.get(modelId);
  if (existingTranslator) {
    return existingTranslator;
  }

  const translatorPromise = pipeline(TRANSLATION_TASK, modelId, {
    dtype: TRANSLATION_DTYPE
  }) as unknown as Promise<TranslatorPipeline>;

  translatorPipelineCache.set(modelId, translatorPromise);
  return translatorPromise;
}

async function translateText(extractedText: string, targetLanguage: string): Promise<string> {
  const modelId = getModelIdForTargetLanguage(targetLanguage);
  const translator = await getTranslator(modelId);
  const textChunks = splitTextForTranslation(extractedText, MAX_TRANSLATION_CHUNK_SIZE);
  const translatedChunks: string[] = [];

  for (const textChunk of textChunks) {
    const translationResult = await translator(textChunk);
    const normalizedChunk = normalizeTranslationResult(translationResult);
    if (normalizedChunk.length > 0) {
      translatedChunks.push(normalizedChunk);
    }
  }

  return translatedChunks.join('\n').trim();
}

async function processSlide(request: ProcessSlideRequest): Promise<ProcessSlideResponse> {
  const ocrWorker = await getOcrWorker();
  const recognitionResult = await ocrWorker.recognize(request.imageDataUrl);
  const extractedText = recognitionResult.data.text.trim();

  if (extractedText.length === 0) {
    return {
      ok: false,
      error: EMPTY_TEXT_ERROR
    };
  }

  const translatedText = await translateText(extractedText, request.targetLanguage);

  return {
    ok: true,
    extractedText,
    translatedText
  };
}

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  if (!isProcessSlideRequest(message)) {
    return;
  }

  void processSlide(message)
    .then((response) => sendResponse(response))
    .catch((error) => {
      sendResponse({
        ok: false,
        error: getErrorMessage(error)
      } as ProcessSlideResponse);
    });

  return true;
});
