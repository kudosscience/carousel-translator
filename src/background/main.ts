import {
  MESSAGE_TARGET_OFFSCREEN,
  MESSAGE_TYPE_PROCESS_SLIDE,
  PROCESSING_TIMEOUT_MS
} from '../shared/constants';
import type { ProcessSlideRequest, ProcessSlideResponse } from '../shared/messages';

const OFFSCREEN_DOCUMENT_PATH = 'offscreen.html';
const OFFSCREEN_REASONS: chrome.offscreen.Reason[] = [chrome.offscreen.Reason.WORKERS];
const OFFSCREEN_JUSTIFICATION = 'Run OCR and translation pipelines in a hidden extension page.';
const OFFSCREEN_CONTEXT_TYPE: chrome.runtime.ContextType[] = [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT];

let creatingOffscreenPromise: Promise<void> | null = null;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown background error.';
}

function isProcessSlideRequest(message: unknown): message is ProcessSlideRequest {
  if (!message || typeof message !== 'object') {
    return false;
  }

  const candidate = message as Partial<ProcessSlideRequest>;
  return (
    candidate.type === MESSAGE_TYPE_PROCESS_SLIDE
    && typeof candidate.imageDataUrl === 'string'
    && typeof candidate.targetLanguage === 'string'
    && typeof candidate.target === 'string'
  );
}

async function hasOffscreenDocument(path: string): Promise<boolean> {
  const offscreenDocumentUrl = chrome.runtime.getURL(path);
  const contexts = await chrome.runtime.getContexts({
    contextTypes: OFFSCREEN_CONTEXT_TYPE,
    documentUrls: [offscreenDocumentUrl]
  });

  return contexts.length > 0;
}

async function ensureOffscreenDocument(): Promise<void> {
  const hasExistingDocument = await hasOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);
  if (hasExistingDocument) {
    return;
  }

  if (creatingOffscreenPromise !== null) {
    await creatingOffscreenPromise;
    return;
  }

  creatingOffscreenPromise = chrome.offscreen.createDocument({
    url: OFFSCREEN_DOCUMENT_PATH,
    reasons: OFFSCREEN_REASONS,
    justification: OFFSCREEN_JUSTIFICATION
  });

  try {
    await creatingOffscreenPromise;
  } finally {
    creatingOffscreenPromise = null;
  }
}

async function sendMessageWithTimeout<T>(message: unknown, timeoutMs: number): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Translation request timed out.')), timeoutMs);
  });

  return Promise.race([
    chrome.runtime.sendMessage(message) as Promise<T>,
    timeoutPromise
  ]);
}

async function handleProcessSlideRequest(message: ProcessSlideRequest): Promise<ProcessSlideResponse> {
  await ensureOffscreenDocument();

  const requestForOffscreen: ProcessSlideRequest = {
    ...message,
    target: MESSAGE_TARGET_OFFSCREEN
  };

  return sendMessageWithTimeout<ProcessSlideResponse>(requestForOffscreen, PROCESSING_TIMEOUT_MS);
}

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  if (!isProcessSlideRequest(message)) {
    return;
  }

  if (message.target === MESSAGE_TARGET_OFFSCREEN) {
    return;
  }

  void handleProcessSlideRequest(message)
    .then((response) => sendResponse(response))
    .catch((error) => {
      sendResponse({
        ok: false,
        error: getErrorMessage(error)
      } as ProcessSlideResponse);
    });

  return true;
});
