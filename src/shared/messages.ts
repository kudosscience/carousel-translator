export interface ProcessSlideRequest {
  type: string;
  target: string;
  imageDataUrl: string;
  targetLanguage: string;
}

export interface ProcessSlideResponse {
  ok: boolean;
  extractedText?: string;
  translatedText?: string;
  error?: string;
}
