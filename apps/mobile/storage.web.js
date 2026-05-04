export const storageLabel = "this browser";

export function loadState(key) {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  const value = window.localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
}

export function saveState(key, state) {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(state));
}
