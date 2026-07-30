export const PUBLIC_QUICK_CHAT_OPEN_EVENT = "public-quick-chat:open";

export function openPublicQuickChat() {
  window.dispatchEvent(new Event(PUBLIC_QUICK_CHAT_OPEN_EVENT));
}
