import { getTargetLanguage } from '../shared/storage';
import { getTargetLanguageLabel } from '../shared/languages';

const CURRENT_LANGUAGE_ID = 'current-language';
const OPEN_OPTIONS_BUTTON_ID = 'open-options';

async function renderCurrentLanguage(): Promise<void> {
  const currentLanguageElement = document.getElementById(CURRENT_LANGUAGE_ID);
  if (!currentLanguageElement) {
    return;
  }

  const targetLanguage = await getTargetLanguage();
  currentLanguageElement.textContent = getTargetLanguageLabel(targetLanguage);
}

function registerEvents(): void {
  const openOptionsButton = document.getElementById(OPEN_OPTIONS_BUTTON_ID);
  if (!openOptionsButton) {
    return;
  }

  openOptionsButton.addEventListener('click', () => {
    void chrome.runtime.openOptionsPage();
  });
}

async function bootstrapPopup(): Promise<void> {
  await renderCurrentLanguage();
  registerEvents();
}

void bootstrapPopup();
