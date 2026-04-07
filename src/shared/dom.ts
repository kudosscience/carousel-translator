export function isElementVisible(element: Element): boolean {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) {
    return false;
  }

  const boundingRect = element.getBoundingClientRect();
  return boundingRect.width > 0 && boundingRect.height > 0;
}
