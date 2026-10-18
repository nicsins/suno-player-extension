# Suno Player Extension

Manifest V3 browser extension that embeds a persistent mini-player for Suno tracks. Streams audio through a proxy backend (not directly from Suno) to bypass CORS and auth walls. Queue is built from track files ingested by the suno-connector (https://github.com/nicsins/suno-connector).

## Why

Suno doesn't serve streams cross-origin cleanly and requires login for full playback. A proxy that fetches the CDN audio URL server-side and re-serves it solves both problems. The extension then becomes a sticky front-end: mini-player follows you across tabs, queue control, and it doubles as the UI for everything the daily Suno watch pulls.

## Architecture

```
[Extension popup/side panel] --fetch--> [Proxy backend (Vercel/Node)] --fetch--> [Suno CDN audio URL]
[Extension] <--audio stream-- [Proxy]
```

- **Service worker**: handles extension lifecycle, badge updates, and message passing to the proxy.
- **Popup / side panel UI**: play, pause, skip, queue list, current track metadata (title, styles, lyrics snippet).
- **Proxy endpoint**: `GET /api/suno/stream/:songId` — server fetches the audio URL from Suno page metadata and pipes it back with correct headers. Cache with short TTL.
- **Queue source**: reads ingested JSON/MD files from `/workspace/suno/` (or a synced copy) so the daily watch's new drops appear automatically.

## First milestone

One song plays end to end through the proxy with no Suno login required.

## Status

- [x] Repo created (2026-10-18)
- [ ] Extension scaffold (manifest.json, service worker, popup)
- [ ] Proxy backend endpoint
- [ ] Queue from ingested tracks
- [ ] Test: one song plays end to end

## License

MIT
