import {
  MESSAGE_TARGET_BACKGROUND,
  MESSAGE_TYPE_PROCESS_SLIDE
} from '../shared/constants';
import { isElementVisible } from '../shared/dom';
import { getTargetLanguage } from '../shared/storage';
import type { ProcessSlideRequest, ProcessSlideResponse } from '../shared/messages';

const STYLE_ID = 'carousel-translator-style';
const WIDGET_ID = 'carousel-translator-widget';
const BUTTON_CLASS_NAME = 'carousel-translator-button';
const POST_SCANNED_ATTRIBUTE = 'data-carousel-translator-scanned';
const OBSERVER_DEBOUNCE_MS = 250;
const MIN_MEDIA_WIDTH = 220;
const MIN_MEDIA_HEIGHT = 120;
const TRANSLATE_BUTTON_TEXT = 'Translate slide';
const TRANSLATING_BUTTON_TEXT = 'Translating...';
const DEFAULT_TRANSLATION_ERROR = 'Translation failed for this slide.';
const INITIAL_WIDGET_TOP_PX = 90;
const INITIAL_WIDGET_RIGHT_PX = 28;
const DRAG_OFFSET_MIN_PX = 8;
const POST_SELECTORS = ['article', 'div.feed-shared-update-v2'];
const DOCUMENT_HINT_SELECTORS = [
  '[aria-label*="Document"]',
  '[aria-label*="document"]',
  '[data-test-id*="document"]',
  'button[aria-label*="Next page"]',
  'button[aria-label*="Previous page"]'
];

interface WidgetParts {
  root: HTMLDivElement;
  header: HTMLDivElement;
  title: HTMLSpanElement;
  closeButton: HTMLButtonElement;
  status: HTMLDivElement;
  translatedText: HTMLPreElement;
  sourceText: HTMLPreElement;
}

let widgetParts: WidgetParts | null = null;
let scanTimeoutId: number | null = null;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return DEFAULT_TRANSLATION_ERROR;
}

function ensureStyles(): void {
  const existingStyle = document.getElementById(STYLE_ID);
  if (existingStyle) {
    return;
  }

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .${BUTTON_CLASS_NAME} {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 20;
      border: 0;
      border-radius: 999px;
      background: #0a66c2;
      color: #ffffff;
      padding: 7px 12px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 6px 18px rgba(12, 28, 58, 0.24);
    }

    .${BUTTON_CLASS_NAME}:hover {
      background: #084f97;
    }

    .${BUTTON_CLASS_NAME}:disabled {
      cursor: wait;
      background: #608fc7;
      box-shadow: none;
    }

    #${WIDGET_ID} {
      position: fixed;
      top: ${INITIAL_WIDGET_TOP_PX}px;
      right: ${INITIAL_WIDGET_RIGHT_PX}px;
      width: min(380px, 92vw);
      max-height: 70vh;
      z-index: 2147483000;
      background: #ffffff;
      border: 1px solid #c4d2e4;
      border-radius: 12px;
      box-shadow: 0 14px 34px rgba(5, 20, 46, 0.25);
      overflow: hidden;
      color: #112038;
      font-family: Segoe UI, system-ui, sans-serif;
    }

    #${WIDGET_ID}[data-hidden='true'] {
      display: none;
    }

    #${WIDGET_ID} .ct-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      background: linear-gradient(135deg, #0a66c2, #1d89d9);
      color: #ffffff;
      padding: 10px 12px;
      cursor: move;
      user-select: none;
    }

    #${WIDGET_ID} .ct-title {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.01em;
    }

    #${WIDGET_ID} .ct-close {
      border: 0;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.2);
      color: #ffffff;
      width: 26px;
      height: 24px;
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
    }

    #${WIDGET_ID} .ct-content {
      padding: 10px 12px 12px;
      overflow: auto;
      max-height: calc(70vh - 46px);
      background: #f8fbff;
    }

    #${WIDGET_ID} .ct-status {
      font-size: 12px;
      color: #315173;
      margin-bottom: 10px;
    }

    #${WIDGET_ID} .ct-section-title {
      margin: 0 0 6px;
      font-size: 12px;
      font-weight: 700;
      color: #0f2f50;
    }

    #${WIDGET_ID} pre {
      margin: 0;
      padding: 9px;
      border-radius: 8px;
      border: 1px solid #d4dceb;
      background: #ffffff;
      white-space: pre-wrap;
      word-break: break-word;
      font-size: 12px;
      line-height: 1.45;
    }

    #${WIDGET_ID} details {
      margin-top: 10px;
    }

    #${WIDGET_ID} summary {
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      color: #3f5472;
      margin-bottom: 8px;
    }
  `;

  document.head.append(style);
}

function createWidget(): WidgetParts {
  const root = document.createElement('div');
  root.id = WIDGET_ID;
  root.dataset.hidden = 'true';

  const header = document.createElement('div');
  header.className = 'ct-header';

  const title = document.createElement('span');
  title.className = 'ct-title';
  title.textContent = 'Carousel translation';

  const closeButton = document.createElement('button');
  closeButton.className = 'ct-close';
  closeButton.textContent = '×';
  closeButton.setAttribute('aria-label', 'Close translator panel');

  header.append(title, closeButton);

  const content = document.createElement('div');
  content.className = 'ct-content';

  const status = document.createElement('div');
  status.className = 'ct-status';

  const translatedTitle = document.createElement('h3');
  translatedTitle.className = 'ct-section-title';
  translatedTitle.textContent = 'Translated text';

  const translatedText = document.createElement('pre');
  translatedText.textContent = '';

  const originalWrapper = document.createElement('details');
  const originalSummary = document.createElement('summary');
  originalSummary.textContent = 'Original OCR text';

  const sourceText = document.createElement('pre');
  sourceText.textContent = '';

  originalWrapper.append(originalSummary, sourceText);
  content.append(status, translatedTitle, translatedText, originalWrapper);
  root.append(header, content);

  closeButton.addEventListener('click', () => {
    root.dataset.hidden = 'true';
  });

  document.body.append(root);
  makeWidgetDraggable(root, header);

  return {
    root,
    header,
    title,
    closeButton,
    status,
    translatedText,
    sourceText
  };
}

function getWidget(): WidgetParts {
  if (!widgetParts) {
    widgetParts = createWidget();
  }

  return widgetParts;
}

function showWidget(): WidgetParts {
  const widget = getWidget();
  widget.root.dataset.hidden = 'false';
  return widget;
}

function renderWidgetLoading(message: string): void {
  const widget = showWidget();
  widget.status.textContent = message;
  widget.translatedText.textContent = '';
  widget.sourceText.textContent = '';
}

function renderWidgetSuccess(translatedText: string, sourceText: string): void {
  const widget = showWidget();
  widget.status.textContent = 'Done';
  widget.translatedText.textContent = translatedText;
  widget.sourceText.textContent = sourceText;
}

function renderWidgetError(message: string): void {
  const widget = showWidget();
  widget.status.textContent = message;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function makeWidgetDraggable(root: HTMLDivElement, dragHandle: HTMLDivElement): void {
  let isDragging = false;
  let pointerOffsetX = 0;
  let pointerOffsetY = 0;

  dragHandle.addEventListener('mousedown', (mouseEvent) => {
    isDragging = true;

    const box = root.getBoundingClientRect();
    pointerOffsetX = mouseEvent.clientX - box.left;
    pointerOffsetY = mouseEvent.clientY - box.top;

    mouseEvent.preventDefault();
  });

  document.addEventListener('mousemove', (mouseEvent) => {
    if (!isDragging) {
      return;
    }

    const maxTop = window.innerHeight - root.offsetHeight - DRAG_OFFSET_MIN_PX;
    const maxLeft = window.innerWidth - root.offsetWidth - DRAG_OFFSET_MIN_PX;

    const nextTop = clamp(mouseEvent.clientY - pointerOffsetY, DRAG_OFFSET_MIN_PX, maxTop);
    const nextLeft = clamp(mouseEvent.clientX - pointerOffsetX, DRAG_OFFSET_MIN_PX, maxLeft);

    root.style.top = `${nextTop}px`;
    root.style.left = `${nextLeft}px`;
    root.style.right = 'auto';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
}

function isLargeEnough(element: HTMLImageElement | HTMLCanvasElement): boolean {
  return element.width >= MIN_MEDIA_WIDTH && element.height >= MIN_MEDIA_HEIGHT;
}

function findVisibleCanvas(postContainer: Element): HTMLCanvasElement | null {
  const canvasElements = Array.from(postContainer.querySelectorAll('canvas'));
  for (const canvasElement of canvasElements) {
    if (isElementVisible(canvasElement) && isLargeEnough(canvasElement)) {
      return canvasElement;
    }
  }

  return null;
}

function findVisibleImage(postContainer: Element): HTMLImageElement | null {
  const imageElements = Array.from(postContainer.querySelectorAll('img'));
  for (const imageElement of imageElements) {
    if (isElementVisible(imageElement) && isLargeEnough(imageElement)) {
      return imageElement;
    }
  }

  return null;
}

function hasDocumentHint(postContainer: Element): boolean {
  if (DOCUMENT_HINT_SELECTORS.some((selector) => postContainer.querySelector(selector))) {
    return true;
  }

  const imageElements = Array.from(postContainer.querySelectorAll('img'));
  return imageElements.some((imageElement) => {
    const imageUrl = imageElement.currentSrc || imageElement.src;
    return imageUrl.includes('/dms/document/');
  });
}

function isLikelyCarouselPost(postContainer: Element): boolean {
  if (!hasDocumentHint(postContainer)) {
    return false;
  }

  return Boolean(findVisibleCanvas(postContainer) || findVisibleImage(postContainer));
}

function canvasToDataUrl(canvasElement: HTMLCanvasElement): string {
  return canvasElement.toDataURL('image/png');
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Unable to convert image to data URL.'));
    };

    reader.onerror = () => reject(new Error('Unable to read image blob.'));
    reader.readAsDataURL(blob);
  });
}

async function imageToDataUrl(imageElement: HTMLImageElement): Promise<string> {
  const imageUrl = imageElement.currentSrc || imageElement.src;
  if (!imageUrl) {
    throw new Error('No image URL was available for the current slide.');
  }

  // Security control: only fetches media URLs already rendered by LinkedIn in the active post.
  const response = await fetch(imageUrl, { credentials: 'omit' });
  if (!response.ok) {
    throw new Error('Unable to fetch image data for OCR extraction.');
  }

  const blob = await response.blob();
  return blobToDataUrl(blob);
}

async function extractActiveSlideDataUrl(postContainer: Element): Promise<string> {
  const canvasElement = findVisibleCanvas(postContainer);
  if (canvasElement) {
    return canvasToDataUrl(canvasElement);
  }

  const imageElement = findVisibleImage(postContainer);
  if (imageElement) {
    return imageToDataUrl(imageElement);
  }

  throw new Error('No visible slide image found in this post.');
}

async function translatePost(postContainer: Element, buttonElement: HTMLButtonElement): Promise<void> {
  buttonElement.disabled = true;
  buttonElement.textContent = TRANSLATING_BUTTON_TEXT;
  renderWidgetLoading('Extracting text from the visible slide...');

  try {
    const imageDataUrl = await extractActiveSlideDataUrl(postContainer);
    const targetLanguage = await getTargetLanguage();

    renderWidgetLoading('Translating locally in your browser...');

    const request: ProcessSlideRequest = {
      type: MESSAGE_TYPE_PROCESS_SLIDE,
      target: MESSAGE_TARGET_BACKGROUND,
      imageDataUrl,
      targetLanguage
    };

    const response = await chrome.runtime.sendMessage(request) as ProcessSlideResponse;

    if (!response.ok) {
      throw new Error(response.error || DEFAULT_TRANSLATION_ERROR);
    }

    renderWidgetSuccess(response.translatedText || '', response.extractedText || '');
  } catch (error) {
    renderWidgetError(getErrorMessage(error));
  } finally {
    buttonElement.disabled = false;
    buttonElement.textContent = TRANSLATE_BUTTON_TEXT;
  }
}

function attachTranslateButton(postContainer: Element): void {
  if (!(postContainer instanceof HTMLElement)) {
    return;
  }

  if (postContainer.querySelector(`.${BUTTON_CLASS_NAME}`)) {
    return;
  }

  if (!isLikelyCarouselPost(postContainer)) {
    return;
  }

  const computedStyle = window.getComputedStyle(postContainer);
  if (computedStyle.position === 'static') {
    postContainer.style.position = 'relative';
  }

  const buttonElement = document.createElement('button');
  buttonElement.className = BUTTON_CLASS_NAME;
  buttonElement.type = 'button';
  buttonElement.textContent = TRANSLATE_BUTTON_TEXT;

  buttonElement.addEventListener('click', () => {
    void translatePost(postContainer, buttonElement);
  });

  postContainer.append(buttonElement);
}

function scanPosts(): void {
  const postContainers = new Set<Element>();

  for (const selector of POST_SELECTORS) {
    const matchedElements = document.querySelectorAll(selector);
    for (const matchedElement of matchedElements) {
      postContainers.add(matchedElement);
    }
  }

  for (const postContainer of postContainers) {
    if ((postContainer as HTMLElement).getAttribute(POST_SCANNED_ATTRIBUTE) === 'true') {
      continue;
    }

    attachTranslateButton(postContainer);
    (postContainer as HTMLElement).setAttribute(POST_SCANNED_ATTRIBUTE, 'true');
  }
}

function schedulePostScan(): void {
  if (scanTimeoutId !== null) {
    window.clearTimeout(scanTimeoutId);
  }

  scanTimeoutId = window.setTimeout(() => {
    scanPosts();
    scanTimeoutId = null;
  }, OBSERVER_DEBOUNCE_MS);
}

function startObserver(): void {
  const observer = new MutationObserver(() => {
    schedulePostScan();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function bootstrap(): void {
  ensureStyles();
  scanPosts();
  startObserver();
}

bootstrap();
