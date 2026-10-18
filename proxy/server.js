// Minimal Suno stream proxy — Node 18+ (no deps).
// GET /api/suno/stream/:songId  -> pipes audio from Suno CDN
// GET /api/suno/queue         -> list of ingested tracks

const http = require("http");
const { SunoConnector } = require("../suno-connector-src/suno_connector.js"); // copy or submodule

const PORT = process.env.PORT || 3000;
const sc = new SunoConnector(1.5);

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // CORS for extension
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  if (url.pathname.startsWith("/api/suno/stream/")) {
    const songId = url.pathname.split("/").pop();
    try {
      const track = await sc.get_track(songId); // python-ish; adapt to JS port
      if (!track.audio_url) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "no audio url" }));
        return;
      }
      const upstream = await fetch(track.audio_url);
      if (!upstream.ok) {
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "upstream " + upstream.status }));
        return;
      }
      res.writeHead(200, {
        "Content-Type": upstream.headers.get("content-type") || "audio/mpeg",
        "Cache-Control": "public, max-age=300",
        "Access-Control-Allow-Origin": "*",
      });
      const buf = Buffer.from(await upstream.arrayBuffer());
      res.end(buf);
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: String(e) }));
    }
    return;
  }

  if (url.pathname === "/api/suno/queue") {
    // Serve ingested track list (adapt path to your artifacts dir)
    res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
    res.end(JSON.stringify({ tracks: [] })); // placeholder — wire to ingested JSON files
    return;
  }

  res.writeHead(404); res.end("not found");
});

server.listen(PORT, () => console.log("suno proxy on", PORT));
