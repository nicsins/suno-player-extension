# Suno Player Extension — Spec v0.1

Date: 2026-10-18
Author: Nic + Grok

## Goal

A Manifest V3 browser extension providing a persistent mini-player for Suno tracks, streaming through a proxy to avoid CORS/auth issues, with a queue sourced from suno-connector ingested files.

## User story

> "Play the new Grokzilla song the bots dropped."
> → Extension popup shows the track (ingested by daily watch), user hits play, audio streams through the proxy, mini-player persists across tabs.

## Components

### 1. manifest.json (MV3)

- Permissions: `storage`, `activeTab` (optional), host permissions for the proxy domain only.
- Background service worker: badge count for queue length, message relay.
- Action popup: compact player UI.
- Optional side panel for full queue + lyrics view.

### 2. Popup UI

- Current track: title, handle, styles, publish date.
- Controls: play/pause, prev/next, volume.
- Queue: scrollable list of ingested tracks, click to jump.
- Lyrics snippet: first verse or chorus, expandable.

### 3. Proxy backend

- `GET /api/suno/stream/:songId` → resolves audio URL from Suno page (reuse suno_connector.get_track), fetches audio, pipes with `Content-Type: audio/mpeg` (or whatever the CDN serves), short cache headers.
- `GET /api/suno/queue` → returns list of ingested tracks as JSON.
- Rate limit + cache to protect Suno from hammering.
- Deploy on Vercel alongside ai-micro-pay or as standalone.

### 4. Queue sync

- Extension polls `/api/suno/queue` on popup open (and optionally on interval) to pick up new daily-watch drops.
- Local storage caches last-known queue for offline-ish behavior.

## Error handling

- Proxy 404/503 → show "track unavailable" in popup, don't crash.
- Audio URL expired → proxy re-resolves from Suno page on next request.
- Suno blocks proxy IP → surface error, suggest retry later.

## Testing plan

1. Load unpacked extension in Chrome.
2. Proxy serves one known song (e.g. Grokzilla Remix) — audio plays in popup.
3. Queue shows ingested tracks; clicking jumps playback.
4. Close popup, reopen — mini-player state persists (service worker).
5. Daily watch drops a new track overnight → appears in queue next morning.

## Open questions

- Should the proxy also serve lyrics as a separate endpoint for the side panel?
- x402 exposure: stream endpoint at $0.001/play for outside users?
- Side panel vs popup: side panel is better for lyrics but less universally supported.
