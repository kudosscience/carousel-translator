import { DEFAULT_TARGET_LANGUAGE } from './constants';

export type TargetLanguageCode = 'es' | 'fr' | 'de' | 'it' | 'pt' | 'nl';

export interface TargetLanguageOption {
  code: TargetLanguageCode;
  label: string;
  modelId: string;
}

export const TARGET_LANGUAGE_OPTIONS: TargetLanguageOption[] = [
  { code: 'es', label: 'Spanish', modelId: 'Xenova/opus-mt-en-es' },
  { code: 'fr', label: 'French', modelId: 'Xenova/opus-mt-en-fr' },
  { code: 'de', label: 'German', modelId: 'Xenova/opus-mt-en-de' },
  { code: 'it', label: 'Italian', modelId: 'Xenova/opus-mt-en-it' },
  { code: 'pt', label: 'Portuguese', modelId: 'Xenova/opus-mt-en-pt' },
  { code: 'nl', label: 'Dutch', modelId: 'Xenova/opus-mt-en-nl' }
];

export function getModelIdForTargetLanguage(languageCode: string): string {
  const selectedOption = TARGET_LANGUAGE_OPTIONS.find((option) => option.code === languageCode);
  if (selectedOption) {
    return selectedOption.modelId;
  }

  return getModelIdForTargetLanguage(DEFAULT_TARGET_LANGUAGE);
}

export function isSupportedTargetLanguage(languageCode: string): languageCode is TargetLanguageCode {
  return TARGET_LANGUAGE_OPTIONS.some((option) => option.code === languageCode);
}

export function getTargetLanguageLabel(languageCode: string): string {
  const selectedOption = TARGET_LANGUAGE_OPTIONS.find((option) => option.code === languageCode);
  if (selectedOption) {
    return selectedOption.label;
  }

  return getTargetLanguageLabel(DEFAULT_TARGET_LANGUAGE);
}
