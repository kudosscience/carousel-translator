import { TARGET_LANGUAGE_OPTIONS, type TargetLanguageCode } from '../shared/languages';
import { getTargetLanguage, setTargetLanguage } from '../shared/storage';

const LANGUAGE_SELECT_ID = 'target-language';
const SAVE_BUTTON_ID = 'save-language';
const STATUS_ID = 'status';
const STATUS_TIMEOUT_MS = 1800;

function renderLanguageOptions(selectElement: HTMLSelectElement): void {
  for (const option of TARGET_LANGUAGE_OPTIONS) {
    const htmlOption = document.createElement('option');
    htmlOption.value = option.code;
    htmlOption.textContent = option.label;
    selectElement.append(htmlOption);
  }
}

function setStatus(message: string): void {
  const statusElement = document.getElementById(STATUS_ID);
  if (!statusElement) {
    return;
  }

  statusElement.textContent = message;
  setTimeout(() => {
    statusElement.textContent = '';
  }, STATUS_TIMEOUT_MS);
}

const languageSelect = document.getElementById(LANGUAGE_SELECT_ID);
const saveButton = document.getElementById(SAVE_BUTTON_ID);

if (languageSelect instanceof HTMLSelectElement && saveButton instanceof HTMLButtonElement) {
  renderLanguageOptions(languageSelect);

  const currentLanguage = await getTargetLanguage();
  languageSelect.value = currentLanguage;

  saveButton.addEventListener('click', async () => {
    const selectedLanguage = languageSelect.value as TargetLanguageCode;
    await setTargetLanguage(selectedLanguage);
    setStatus('Saved');
  });
}
