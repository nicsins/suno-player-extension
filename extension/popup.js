const PROXY = "https://suno-player-proxy.vercel.app";

const els = {
  title: document.getElementById("title"),
  meta: document.getElementById("meta"),
  audio: document.getElementById("audio"),
  queue: document.getElementById("queue"),
  status: document.getElementById("status"),
  play: document.getElementById("play"),
  prev: document.getElementById("prev"),
  next: document.getElementById("next"),
);

let tracks = [];
let current = 0;

function setStatus(t) { els.status.textContent = t; }

function render() {
  const t = tracks[current];
  if (!t) {
    els.title.textContent = "No tracks";
    els.meta.textContent = "";
    els.queue.innerHTML = "";
    return;
  }
  els.title.textContent = t.title || "Untitled";
  els.meta.textContent = `@${t.handle || "?"} · ${(t.styles || []).join(", ")}`;
  els.audio.src = `${PROXY}/api/suno/stream/${t.song_id}`;
  els.queue.innerHTML = "";
  tracks.forEach((tr, i) => {
    const div = document.createElement("div");
    div.className = "queue-item" + (i === current ? " active" : "");
    div.textContent = tr.title || tr.song_id;
    div.onclick = () => { current = i; render(); els.audio.play(); };
    els.queue.appendChild(div);
  });
  chrome.runtime.sendMessage({ type: "UPDATE_BADGE", count: tracks.length });
}

function loadQueue() {
  setStatus("Fetching queue…");
  chrome.runtime.sendMessage({ type: "GET_QUEUE" }, (res) => {
    if (!res || !res.ok) {
      setStatus("Queue unavailable: " + ((res && res.error) || "unknown"));
      return;
    }
    tracks = res.data.tracks || [];
    setStatus(`${tracks.length} tracks`);
    render();
  });
}

els.play.onclick = () => {
  if (els.audio.paused) els.audio.play().catch((e) => setStatus("Play failed: " + e.message));
  else els.audio.pause();
  els.play.textContent = els.audio.paused ? "Play" : "Pause";
);
els.prev.onclick = () => { if (current > 0) { current--; render(); els.audio.play(); } };
els.next.onclick = () => { if (current < tracks.length - 1) { current++; render(); els.audio.play(); } };
els.audio.onended = () => { if (current < tracks.length - 1) { current++; render(); els.audio.play(); } };

loadQueue();
