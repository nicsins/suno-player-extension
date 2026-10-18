// Service worker: badge updates + message relay to proxy.
const PROXY = "https://suno-player-proxy.vercel.app";

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({ text: "" });
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "GET_QUEUE") {
    fetch(`${PROXY}/api/suno/queue`)
      .then((r) => r.json())
      .then((data) => sendResponse({ ok: true, data }))
      .catch((e) => sendResponse({ ok: false, error: String(e) }));
    return true; // async
  }
  if (msg.type === "UPDATE_BADGE") {
    chrome.action.setBadgeText({ text: String(msg.count || "") });
    chrome.action.setBadgeBackgroundColor({ color: "#111111" });
  }
});
