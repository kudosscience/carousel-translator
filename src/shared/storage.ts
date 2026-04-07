import { DEFAULT_TARGET_LANGUAGE, STORAGE_TARGET_LANGUAGE_KEY } from './constants';
import { isSupportedTargetLanguage, type TargetLanguageCode } from './languages';

export async function getTargetLanguage(): Promise<TargetLanguageCode> {
  const result = await chrome.storage.sync.get(STORAGE_TARGET_LANGUAGE_KEY);
  const selectedLanguage = result[STORAGE_TARGET_LANGUAGE_KEY];

  if (typeof selectedLanguage === 'string' && isSupportedTargetLanguage(selectedLanguage)) {
    return selectedLanguage;
  }

  return DEFAULT_TARGET_LANGUAGE;
}

export async function setTargetLanguage(languageCode: TargetLanguageCode): Promise<void> {
  await chrome.storage.sync.set({ [STORAGE_TARGET_LANGUAGE_KEY]: languageCode });
}
