const KEY = "phorium:draft";

export function getDraft() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(KEY) ?? "";
}

export function setDraft(text: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, text);
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}