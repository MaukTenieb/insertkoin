# Insert Koin — VHS cabinet
## Implementation document

This document contains the proposed implementation for the VHS cabinet.
It is intentionally separated into:
1. new files;
2. integration diffs;
3. owner decisions still required;
4. tests/checklist.

No existing repository file is silently rewritten here.

---

# 1. `kg-vhs.html`

```html
<div id="kg-vhs" class="vhs" data-vhs-root>
  <div class="vhs-shell">
    <div class="vhs-topline">
      <div class="vhs-brand">VHS</div>
      <div class="vhs-status" data-vhs-status>STOP</div>
      <div class="vhs-standard">PAL</div>
    </div>

    <div class="vhs-screen-wrap">
      <div class="vhs-screen" data-vhs-screen>
        <video
          class="vhs-local-video"
          data-vhs-video
          playsinline
          crossorigin="anonymous"
          preload="auto"
          controls
        ></video>

        <canvas
          class="vhs-canvas"
          data-vhs-canvas
          aria-hidden="true"
        ></canvas>

        <div class="vhs-fallback" data-vhs-fallback hidden>
          <video
            class="vhs-fallback-video"
            data-vhs-fallback-video
            playsinline
            preload="auto"
            controls
          ></video>
        </div>
      </div>
    </div>

    <div class="vhs-osd" aria-live="polite">
      <span data-vhs-osd-state>STOP</span>
      <span data-vhs-osd-counter>00:00:00</span>
      <span data-vhs-osd-speed>SP</span>
      <span data-vhs-osd-track>—</span>
    </div>

    <div class="vhs-controls" data-vhs-controls>
      <button type="button" data-vhs-action="prev" aria-label="Previous">◀</button>
      <button type="button" data-vhs-action="play" aria-label="Play / pause">▶/❚❚</button>
      <button type="button" data-vhs-action="next" aria-label="Next">▶</button>
      <button type="button" data-vhs-action="random" aria-label="Random">RND</button>
      <button type="button" data-vhs-action="speed" aria-label="Tape speed">SP</button>
      <button type="button" data-vhs-action="source" aria-label="Source">YT</button>
    </div>

    <div class="vhs-source-tabs" role="tablist">
      <button
        type="button"
        class="vhs-tab is-active"
        data-vhs-source="youtube"
        role="tab"
        aria-selected="true"
      >CATALOGUE</button>

      <button
        type="button"
        class="vhs-tab"
        data-vhs-source="local"
        role="tab"
        aria-selected="false"
      >FILES</button>
    </div>

    <div class="vhs-catalogue" data-vhs-catalogue>
      <div class="vhs-player-frame">
        <div class="vhs-youtube" data-vhs-youtube></div>
      </div>

      <ol class="vhs-tracklist" data-vhs-tracklist></ol>
    </div>

    <div class="vhs-local" data-vhs-local hidden>
      <div class="vhs-local-empty" data-vhs-local-empty>
        No local VHS files have been supplied.
      </div>
      <ol class="vhs-local-list" data-vhs-local-list></ol>
    </div>

    <div class="vhs-message" data-vhs-message role="status"></div>
  </div>
</div>
```

---

# 2. `kg-vhs.css`

```css
.kg-layer:has(.vhs) {
  overflow: auto;
}

.vhs {
  --vhs-bg: #111;
  --vhs-panel: #181818;
  --vhs-border: #666;
  --vhs-text: #ddd;
  --vhs-accent: #b9d84a;
  --vhs-warn: #e5c15b;

  width: 100%;
  min-height: 100%;
  box-sizing: border-box;
  padding: clamp(10px, 2vw, 22px);
  color: var(--vhs-text);
  font-family: "DM Mono", monospace;
}

.vhs *,
.vhs *::before,
.vhs *::after {
  box-sizing: border-box;
}

.vhs-shell {
  width: min(1180px, 100%);
  margin: 0 auto;
  padding: clamp(10px, 2vw, 18px);
  border: 2px solid var(--vhs-border);
  background:
    linear-gradient(rgba(255,255,255,.025) 50%, transparent 50%),
    var(--vhs-panel);
  background-size: 100% 4px, auto;
  box-shadow:
    inset 0 0 0 1px #050505,
    0 8px 30px rgba(0,0,0,.4);
}

.vhs-topline,
.vhs-osd {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 12px;
  align-items: center;
  min-height: 32px;
  padding: 5px 8px;
  background: #090909;
  border: 1px solid #444;
  text-transform: uppercase;
  letter-spacing: .08em;
  font-size: 11px;
}

.vhs-brand {
  color: var(--vhs-accent);
  font-weight: 700;
}

.vhs-status {
  min-width: 62px;
}

.vhs-screen-wrap {
  margin-top: 8px;
  background: #000;
  border: 4px solid #282828;
  padding: 7px;
}

.vhs-screen {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  min-height: 200px;
  overflow: hidden;
  background: #000;
}

.vhs-canvas,
.vhs-local-video,
.vhs-fallback {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.vhs-local-video {
  display: none;
}

.vhs-canvas {
  display: block;
}

.vhs-fallback[hidden] {
  display: none;
}

.vhs-fallback {
  background: #000;
}

.vhs-fallback-video {
  width: 100%;
  height: 100%;
}

.vhs-osd {
  grid-template-columns: auto 1fr auto minmax(0, 2fr);
  margin-top: 8px;
}

.vhs-osd span:nth-child(2) {
  text-align: center;
}

.vhs-osd span:last-child {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: right;
}

.vhs-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.vhs button {
  min-height: 34px;
  border: 1px solid #555;
  background: #101010;
  color: var(--vhs-text);
  font: inherit;
  font-size: 11px;
  padding: 6px 10px;
  cursor: pointer;
}

.vhs button:hover,
.vhs button:focus-visible {
  border-color: var(--vhs-accent);
  outline: none;
}

.vhs button:disabled {
  opacity: .4;
  cursor: default;
}

.vhs-source-tabs {
  display: flex;
  gap: 4px;
  margin-top: 12px;
}

.vhs-tab {
  border-bottom: 2px solid transparent;
}

.vhs-tab.is-active {
  color: var(--vhs-accent);
  border-bottom-color: var(--vhs-accent);
}

.vhs-catalogue,
.vhs-local {
  margin-top: 10px;
}

.vhs-player-frame {
  width: min(720px, 100%);
  margin: 0 auto;
  padding: 12px;
  border: 3px solid #3e3e3e;
  background: #080808;
}

.vhs-youtube {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
}

.vhs-youtube iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

.vhs-tracklist,
.vhs-local-list {
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 3px;
}

.vhs-tracklist button,
.vhs-local-list button {
  width: 100%;
  text-align: left;
  min-height: 32px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vhs-tracklist button.is-active,
.vhs-local-list button.is-active {
  color: var(--vhs-accent);
  border-color: var(--vhs-accent);
}

.vhs-message {
  min-height: 1.5em;
  margin-top: 8px;
  font-size: 11px;
  color: var(--vhs-warn);
}

.vhs-local-empty {
  padding: 18px;
  border: 1px dashed #555;
  text-align: center;
  font-size: 11px;
}

.vhs.is-reduced-motion .vhs-shell {
  background: var(--vhs-panel);
}

@media (max-width: 760px) {
  .vhs {
    padding: 6px;
  }

  .vhs-shell {
    padding: 7px;
  }

  .vhs-topline,
  .vhs-osd {
    font-size: 9px;
    gap: 6px;
  }

  .vhs-screen {
    min-height: 200px;
  }

  .vhs-controls button {
    flex: 1 1 calc(33.333% - 6px);
  }

  .vhs-osd {
    grid-template-columns: auto 1fr auto;
  }

  .vhs-osd span:last-child {
    grid-column: 1 / -1;
    text-align: left;
  }
}

@media (prefers-reduced-motion: reduce) {
  .vhs {
    --vhs-reduced-motion: 1;
  }
}
```

---

# 3. `kg-vhs.js`

```javascript
(() => {
  "use strict";

  const NAME = "vhs";
  const ROOT_SELECTOR = "[data-vhs-root]";
  const YT_API = "https://www.youtube.com/iframe_api";

  /*
   * JUKE_TRACKS is intentionally consumed from the existing global.
   * No catalogue is duplicated here.
   */
  const getTracks = () => {
    if (Array.isArray(window.JUKE_TRACKS)) return window.JUKE_TRACKS;
    return [];
  };

  const state = {
    root: null,
    destroyed: true,

    source: "youtube",
    tracks: [],
    index: 0,

    player: null,
    ytReadyPromise: null,
    ytPreviousReadyHandler: null,

    video: null,
    fallbackVideo: null,
    canvas: null,
    gl: null,

    program: null,
    buffer: null,
    texture: null,
    vao: null,

    animationFrame: 0,
    videoFrameCallback: 0,
    renderMode: null,

    resizeObserver: null,
    mutationObserver: null,

    startTime: 0,
    intensity: 0.22,
    standard: 0,
    speed: "SP",

    roll: 0,
    paused: true,

    reducedMotion: false,
    contextLost: false,

    localFiles: [],
  };

  const SHADER_VS = `#version 300 es
    in vec2 aPosition;
    in vec2 aUV;

    out vec2 vUV;

    void main() {
      vUV = aUV;
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const SHADER_FS = `#version 300 es
    precision highp float;

    uniform sampler2D uTex;
    uniform vec2 uRes;
    uniform float uTime;
    uniform float uIntensity;
    uniform float uStd;
    uniform float uPause;
    uniform float uRoll;

    in vec2 vUV;
    out vec4 outColor;

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 345.45));
      p += dot(p, p + 34.345);
      return fract(p.x * p.y);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);

      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));

      vec2 u = f * f * (3.0 - 2.0 * f);

      return mix(a, b, u.x)
           + (c - a) * u.y * (1.0 - u.x)
           + (d - b) * u.x * u.y;
    }

    vec3 rgbToYiq(vec3 c) {
      return vec3(
        dot(c, vec3(0.2990, 0.5870, 0.1140)),
        dot(c, vec3(0.5959, -0.2746, -0.3213)),
        dot(c, vec3(0.2115, -0.5227, 0.3112))
      );
    }

    vec3 yiqToRgb(vec3 c) {
      return vec3(
        c.x + 0.9563 * c.y + 0.6210 * c.z,
        c.x - 0.2721 * c.y - 0.6474 * c.z,
        c.x - 1.1070 * c.y + 1.7046 * c.z
      );
    }

    vec3 sampleYiq(vec2 uv, float chromaOffset) {
      vec2 texel = 1.0 / max(uRes, vec2(1.0));

      vec3 a = rgbToYiq(texture(uTex, uv).rgb);

      float y = a.x;
      float i = 0.0;
      float q = 0.0;

      /*
       * Chroma blur is deliberately much wider than luma.
       * These values are implementation starting points, not a physical
       * reconstruction of a particular VHS deck.
       */
      const int SAMPLES = 9;

      for (int n = -SAMPLES; n <= SAMPLES; n++) {
        float f = float(n);
        float weight = 1.0 - abs(f) / float(SAMPLES + 1);

        vec2 off = vec2(
          f * texel.x * chromaOffset,
          0.0
        );

        vec3 s = rgbToYiq(texture(uTex, uv + off).rgb);

        i += s.y * weight;
        q += s.z * weight;
      }

      float normalization = 1.0 / 100.0;
      i *= normalization;
      q *= normalization;

      return vec3(y, i, q);
    }

    void main() {
      vec2 uv = vUV;

      float line = floor(uv.y * uRes.y);

      float lineNoise = noise(vec2(
        line * 0.071,
        floor(uTime * 24.0)
      ));

      float jitter = 0.0;

      if (uIntensity > 0.001) {
        jitter =
          (lineNoise - 0.5)
          * 0.0018
          * uIntensity;
      }

      uv.x += jitter;

      /*
       * Tracking band.
       */
      float trackingCenter = fract(uTime * 0.045);
      float bandDistance = abs(uv.y - trackingCenter);
      float tracking =
        smoothstep(
          0.075,
          0.0,
          bandDistance
        );

      float chromaShift =
        mix(0.9, 2.0, uStd)
        * uIntensity;

      vec3 yiq = sampleYiq(
        uv,
        9.0 + 3.0 * uIntensity
      );

      yiq.yz *= 1.0 - 0.22 * uIntensity;

      vec3 color = yiqToRgb(yiq);

      /*
       * Horizontal chroma displacement.
       */
      if (chromaShift > 0.0) {
        vec2 chromaUV = uv;
        chromaUV.x += chromaShift / max(uRes.x, 1.0);

        vec3 shifted = sampleYiq(
          chromaUV,
          9.0 + 3.0 * uIntensity
        );

        color = yiqToRgb(
          vec3(
            yiq.x,
            shifted.y,
            shifted.z
          )
        );
      }

      /*
       * Tape noise.
       */
      float grain = noise(
        uv * uRes * 0.19 +
        vec2(0.0, uTime * 6.0)
      );

      color +=
        (grain - 0.5)
        * 0.055
        * uIntensity;

      /*
       * Tracking disturbance.
       */
      float trackingNoise = noise(
        vec2(
          uv.x * 90.0,
          floor(uTime * 32.0)
        )
      );

      color +=
        tracking
        * (trackingNoise - 0.5)
        * 0.42
        * uIntensity;

      /*
       * Head-switching band near the bottom of the frame.
       */
      float headBand =
        smoothstep(0.055, 0.0, uv.y);

      float headShift =
        sin(
          uv.y * 130.0 +
          uTime * 11.0
        ) * 0.012;

      color +=
        headBand
        * headShift
        * uIntensity;

      /*
       * Dropouts.
       */
      float dropoutSeed = noise(
        vec2(
          floor(uv.x * 180.0),
          floor(uv.y * 80.0) + floor(uTime * 5.0)
        )
      );

      float dropout =
        step(0.997, dropoutSeed)
        * step(0.08, hash(vec2(
          floor(uTime * 8.0),
          floor(uv.y * 100.0)
        )));

      color = mix(
        color,
        vec3(1.0),
        dropout * 0.65 * uIntensity
      );

      /*
       * Pause: preserve the frozen frame and introduce a moving noise band.
       */
      if (uPause > 0.5) {
        float pauseBand =
          smoothstep(
            0.08,
            0.0,
            abs(
              uv.y -
              fract(uTime * 0.12)
            )
          );

        color +=
          pauseBand
          * (noise(uv * 160.0 + uTime) - 0.5)
          * 0.25
          * uIntensity;
      }

      /*
       * Roll is reserved for deliberate transitions.
       */
      if (uRoll > 0.001) {
        uv.y +=
          sin(
            uv.x * 8.0 +
            uTime * 2.0
          )
          * 0.025
          * uRoll;
      }

      color = clamp(color, 0.0, 1.0);

      outColor = vec4(color, 1.0);
    }
  `;

  function q(selector, root = state.root) {
    return root ? root.querySelector(selector) : null;
  }

  function qa(selector, root = state.root) {
    return root ? [...root.querySelectorAll(selector)] : [];
  }

  function setText(selector, value) {
    const el = q(selector);
    if (el) el.textContent = value;
  }

  function setMessage(message) {
    setText("[data-vhs-message]", message || "");
  }

  function setStatus(status) {
    setText("[data-vhs-status]", status);
    setText("[data-vhs-osd-state]", status);
  }

  function currentTrack() {
    return state.tracks[state.index] || null;
  }

  function getVideoId(track) {
    if (!track) return "";

    if (typeof track === "string") {
      return track;
    }

    return (
      track.id ||
      track.videoId ||
      track.youtubeId ||
      ""
    );
  }

  function getTrackTitle(track) {
    if (!track) return "—";

    if (typeof track === "string") {
      return track;
    }

    return (
      track.title ||
      track.name ||
      track.label ||
      getVideoId(track) ||
      "Untitled"
    );
  }

  function cleanTitle(title) {
    return String(title || "")
      .replace(/^\s*\d+\s*[\)\].:-]\s*/i, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normaliseTracks() {
    state.tracks = getTracks()
      .map((track) => {
        const id = getVideoId(track);
        if (!id) return null;

        return {
          source: track,
          id,
          title: cleanTitle(getTrackTitle(track)),
        };
      })
      .filter(Boolean);
  }

  function ensureRoot() {
    const root = document.querySelector(ROOT_SELECTOR);
    if (!root) return false;

    state.root = root;
    return true;
  }

  function loadYouTubeAPI() {
    if (window.YT && window.YT.Player) {
      return Promise.resolve();
    }

    if (state.ytReadyPromise) {
      return state.ytReadyPromise;
    }

    state.ytReadyPromise = new Promise((resolve, reject) => {
      const previous = window.onYouTubeIframeAPIReady;
      state.ytPreviousReadyHandler = previous;

      window.onYouTubeIframeAPIReady = () => {
        try {
          if (typeof previous === "function") previous();
        } finally {
          resolve();
        }
      };

      const existing = document.querySelector(
        'script[src="' + YT_API + '"]'
      );

      if (existing) return;

      const script = document.createElement("script");
      script.src = YT_API;
      script.async = true;
      script.onerror = () => reject(new Error("YouTube API unavailable."));
      document.head.appendChild(script);
    });

    return state.ytReadyPromise;
  }

  function createYouTubePlayer() {
    const mount = q("[data-vhs-youtube]");
    const track = currentTrack();

    if (!mount || !track || state.destroyed) return;

    if (!window.YT || !window.YT.Player) return;

    destroyYouTubePlayer();

    state.player = new YT.Player(mount, {
      videoId: track.id,
      width: "100%",
      height: "100%",
      playerVars: {
        playsinline: 1,
        rel: 0,
        modestbranding: 1,
        origin: window.location.origin
      },
      events: {
        onReady: onYouTubeReady,
        onStateChange: onYouTubeStateChange,
        onError: onYouTubeError
      }
    });

    updateTrackUI();
  }

  function destroyYouTubePlayer() {
    if (!state.player) return;

    try {
      state.player.stopVideo();
    } catch (_) {}

    try {
      state.player.destroy();
    } catch (_) {}

    state.player = null;
  }

  function onYouTubeReady() {
    if (state.destroyed) return;

    updateTrackUI();
    setStatus("STOP");
  }

  function onYouTubeStateChange(event) {
    if (state.destroyed) return;

    const states = window.YT && YT.PlayerState
      ? YT.PlayerState
      : {};

    if (event.data === states.PLAYING) {
      state.paused = false;
      setStatus("PLAY");
    } else if (event.data === states.PAUSED) {
      state.paused = true;
      setStatus("PAUSE");
    } else if (event.data === states.ENDED) {
      state.paused = true;
      setStatus("STOP");
      nextTrack();
    } else if (event.data === states.BUFFERING) {
      setStatus("LOAD");
    } else {
      setStatus("STOP");
    }
  }

  function onYouTubeError() {
    setMessage("YouTube could not load this video.");
  }

  function updateTrackUI() {
    const track = currentTrack();

    setText(
      "[data-vhs-osd-track]",
      track
        ? `${state.index + 1}/${state.tracks.length} — ${track.title}`
        : "—"
    );

    qa("[data-vhs-track]").forEach((button, i) => {
      button.classList.toggle("is-active", i === state.index);
      button.setAttribute(
        "aria-current",
        i === state.index ? "true" : "false"
      );
    });
  }

  function renderTrackList() {
    const list = q("[data-vhs-tracklist]");
    if (!list) return;

    list.textContent = "";

    state.tracks.forEach((track, index) => {
      const li = document.createElement("li");
      const button = document.createElement("button");

      button.type = "button";
      button.dataset.vhsTrack = String(index);
      button.textContent = `${index + 1}. ${track.title}`;
      button.setAttribute("aria-label", track.title);

      button.addEventListener("click", () => {
        selectTrack(index, true);
      });

      li.appendChild(button);
      list.appendChild(li);
    });
  }

  function selectTrack(index, autoplay) {
    if (!state.tracks.length) return;

    const count = state.tracks.length;

    state.index =
      ((index % count) + count) % count;

    const track = currentTrack();

    updateTrackUI();

    if (state.source !== "youtube") return;

    if (state.player && typeof state.player.loadVideoById === "function") {
      state.player.loadVideoById(track.id);

      if (!autoplay) {
        state.player.pauseVideo();
      }

      return;
    }

    createYouTubePlayer();
  }

  function nextTrack() {
    selectTrack(state.index + 1, true);
  }

  function previousTrack() {
    selectTrack(state.index - 1, true);
  }

  function randomTrack() {
    if (state.tracks.length < 2) return;

    let next = state.index;

    while (next === state.index) {
      next = Math.floor(Math.random() * state.tracks.length);
    }

    selectTrack(next, true);
  }

  function toggleYouTubePlayback() {
    if (!state.player) return;

    try {
      const playerState = state.player.getPlayerState();
      const playing =
        window.YT &&
        YT.PlayerState &&
        playerState === YT.PlayerState.PLAYING;

      if (playing) {
        state.player.pauseVideo();
      } else {
        state.player.playVideo();
      }
    } catch (_) {}
  }

  function setSource(source) {
    state.source = source;

    const youtube = q("[data-vhs-source='youtube']");
    const local = q("[data-vhs-source='local']");
    const catalogue = q("[data-vhs-catalogue]");
    const localPanel = q("[data-vhs-local]");

    if (youtube) {
      youtube.classList.toggle("is-active", source === "youtube");
      youtube.setAttribute(
        "aria-selected",
        source === "youtube" ? "true" : "false"
      );
    }

    if (local) {
      local.classList.toggle("is-active", source === "local");
      local.setAttribute(
        "aria-selected",
        source === "local" ? "true" : "false"
      );
    }

    if (catalogue) catalogue.hidden = source !== "youtube";
    if (localPanel) localPanel.hidden = source !== "local";

    if (source === "youtube") {
      startYouTube();
    } else {
      stopYouTube();
      renderLocalFiles();
    }
  }

  function setSpeed() {
    const speeds = ["SP", "LP", "EP"];
    const i = speeds.indexOf(state.speed);
    state.speed = speeds[(i + 1) % speeds.length];

    const intensity = {
      SP: 0.18,
      LP: 0.36,
      EP: 0.58
    };

    state.intensity = intensity[state.speed];

    setText("[data-vhs-osd-speed]", state.speed);

    if (state.video) {
      state.video.playbackRate =
        state.speed === "SP"
          ? 1
          : state.speed === "LP"
            ? 0.95
            : 0.9;
    }
  }

  function createShader(type, source) {
    const shader = state.gl.createShader(type);
    state.gl.shaderSource(shader, source);
    state.gl.compileShader(shader);

    if (!state.gl.getShaderParameter(
      shader,
      state.gl.COMPILE_STATUS
    )) {
      const log = state.gl.getShaderInfoLog(shader);
      state.gl.deleteShader(shader);
      throw new Error(log || "Shader compilation failed.");
    }

    return shader;
  }

  function createProgram() {
    const gl = state.gl;

    const vs = createShader(
      gl.VERTEX_SHADER,
      SHADER_VS
    );

    const fs = createShader(
      gl.FRAGMENT_SHADER,
      SHADER_FS
    );

    const program = gl.createProgram();

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    gl.deleteShader(vs);
    gl.deleteShader(fs);

    if (!gl.getProgramParameter(
      program,
      gl.LINK_STATUS
    )) {
      const log = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(log || "Program linking failed.");
    }

    return program;
  }

  function initGL() {
    const canvas = q("[data-vhs-canvas]");
    if (!canvas) return false;

    state.canvas = canvas;

    const gl =
      canvas.getContext("webgl2", {
        alpha: false,
        antialias: false,
        powerPreference: "high-performance"
      });

    if (!gl) return false;

    state.gl = gl;

    try {
      state.program = createProgram();

      const positions = new Float32Array([
        -1, -1, 0, 0,
         1, -1, 1, 0,
        -1,  1, 0, 1,
         1,  1, 1, 1
      ]);

      state.buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, state.buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        positions,
        gl.STATIC_DRAW
      );

      state.vao = gl.createVertexArray();
      gl.bindVertexArray(state.vao);

      const positionLoc =
        gl.getAttribLocation(
          state.program,
          "aPosition"
        );

      const uvLoc =
        gl.getAttribLocation(
          state.program,
          "aUV"
        );

      gl.enableVertexAttribArray(positionLoc);
      gl.vertexAttribPointer(
        positionLoc,
        2,
        gl.FLOAT,
        false,
        16,
        0
      );

      gl.enableVertexAttribArray(uvLoc);
      gl.vertexAttribPointer(
        uvLoc,
        2,
        gl.FLOAT,
        false,
        16,
        8
      );

      state.texture = gl.createTexture();
      gl.bindTexture(
        gl.TEXTURE_2D,
        state.texture
      );

      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        gl.LINEAR
      );

      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MAG_FILTER,
        gl.LINEAR
      );

      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_WRAP_S,
        gl.CLAMP_TO_EDGE
      );

      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_WRAP_T,
        gl.CLAMP_TO_EDGE
      );

      gl.bindVertexArray(null);

      canvas.addEventListener(
        "webglcontextlost",
        onContextLost,
        false
      );

      canvas.addEventListener(
        "webglcontextrestored",
        onContextRestored,
        false
      );

      resizeGL();
      return true;
    } catch (error) {
      console.error("[VHS] WebGL init failed:", error);
      destroyGL();
      return false;
    }
  }

  function onContextLost(event) {
    event.preventDefault();
    state.contextLost = true;
    cancelRenderLoop();
    showFallback();
  }

  function onContextRestored() {
    if (state.destroyed) return;

    state.contextLost = false;

    destroyGL(false);

    if (initGL()) {
      hideFallback();
      startRenderLoop();
    }
  }

  function resizeGL() {
    if (!state.canvas || !state.gl) return;

    const dpr = Math.min(
      window.devicePixelRatio || 1,
      2
    );

    const rect = state.canvas.getBoundingClientRect();

    const width = Math.max(
      1,
      Math.floor(rect.width * dpr)
    );

    const height = Math.max(
      1,
      Math.floor(rect.height * dpr)
    );

    if (
      state.canvas.width !== width ||
      state.canvas.height !== height
    ) {
      state.canvas.width = width;
      state.canvas.height = height;
    }

    state.gl.viewport(
      0,
      0,
      state.canvas.width,
      state.canvas.height
    );
  }

  function renderGL(now) {
    if (
      state.destroyed ||
      !state.gl ||
      !state.program ||
      !state.video ||
      state.contextLost
    ) {
      return;
    }

    if (
      state.video.readyState <
      HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      return;
    }

    resizeGL();

    const gl = state.gl;

    gl.useProgram(state.program);
    gl.bindVertexArray(state.vao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, state.texture);

    gl.pixelStorei(
      gl.UNPACK_FLIP_Y_WEBGL,
      true
    );

    try {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        state.video
      );
    } catch (_) {
      return;
    }

    const resLoc = gl.getUniformLocation(
      state.program,
      "uRes"
    );

    const timeLoc = gl.getUniformLocation(
      state.program,
      "uTime"
    );

    const intensityLoc = gl.getUniformLocation(
      state.program,
      "uIntensity"
    );

    const stdLoc = gl.getUniformLocation(
      state.program,
      "uStd"
    );

    const pauseLoc = gl.getUniformLocation(
      state.program,
      "uPause"
    );

    const rollLoc = gl.getUniformLocation(
      state.program,
      "uRoll"
    );

    gl.uniform2f(
      resLoc,
      state.canvas.width,
      state.canvas.height
    );

    gl.uniform1f(
      timeLoc,
      now / 1000
    );

    gl.uniform1f(
      intensityLoc,
      state.intensity
    );

    gl.uniform1f(
      stdLoc,
      state.standard
    );

    gl.uniform1f(
      pauseLoc,
      state.paused ? 1 : 0
    );

    gl.uniform1f(
      rollLoc,
      state.reducedMotion ? 0 : state.roll
    );

    gl.drawArrays(
      gl.TRIANGLE_STRIP,
      0,
      4
    );

    gl.bindVertexArray(null);
  }

  function renderFrame(now) {
    if (state.destroyed) return;

    renderGL(now);

    if (state.renderMode === "raf") {
      state.animationFrame =
        requestAnimationFrame(renderFrame);
    }
  }

  function scheduleVideoFrame() {
    if (
      state.destroyed ||
      state.renderMode !== "rvfc" ||
      !state.video ||
      typeof state.video.requestVideoFrameCallback !== "function"
    ) {
      return;
    }

    state.videoFrameCallback =
      state.video.requestVideoFrameCallback(
        (_, metadata) => {
          if (state.destroyed) return;

          renderGL(metadata.mediaTime * 1000);

          if (!state.paused) {
            scheduleVideoFrame();
          }
        }
      );
  }

  function startRenderLoop() {
    cancelRenderLoop();

    if (
      !state.gl ||
      !state.video
    ) {
      return;
    }

    if (
      !state.reducedMotion &&
      typeof state.video.requestVideoFrameCallback === "function"
    ) {
      state.renderMode = "rvfc";
      scheduleVideoFrame();
    } else {
      state.renderMode = "raf";
      state.animationFrame =
        requestAnimationFrame(renderFrame);
    }
  }

  function cancelRenderLoop() {
    if (state.animationFrame) {
      cancelAnimationFrame(state.animationFrame);
      state.animationFrame = 0;
    }

    if (
      state.video &&
      state.videoFrameCallback &&
      typeof state.video.cancelVideoFrameCallback === "function"
    ) {
      try {
        state.video.cancelVideoFrameCallback(
          state.videoFrameCallback
        );
      } catch (_) {}
    }

    state.videoFrameCallback = 0;
    state.renderMode = null;
  }

  function setupLocalVideo() {
    const video = q("[data-vhs-video]");
    const fallback = q("[data-vhs-fallback-video]");

    state.video = video;
    state.fallbackVideo = fallback;

    if (!video) return;

    video.addEventListener("play", () => {
      state.paused = false;
      setStatus("PLAY");
      startRenderLoop();
    });

    video.addEventListener("pause", () => {
      state.paused = true;
      setStatus("PAUSE");
      startRenderLoop();
    });

    video.addEventListener("ended", () => {
      state.paused = true;
      setStatus("STOP");
      cancelRenderLoop();
    });

    video.addEventListener("timeupdate", updateLocalCounter);

    video.addEventListener("error", () => {
      setMessage("The local VHS file could not be played.");
    });

    if (fallback) {
      fallback.addEventListener(
        "timeupdate",
        updateLocalCounter
      );
    }
  }

  function updateLocalCounter() {
    const video =
      state.fallbackVideo &&
      !q("[data-vhs-fallback]").hidden
        ? state.fallbackVideo
        : state.video;

    if (!video) return;

    const t = Number.isFinite(video.currentTime)
      ? video.currentTime
      : 0;

    setText(
      "[data-vhs-osd-counter]",
      formatTime(t)
    );
  }

  function formatTime(seconds) {
    seconds = Math.max(
      0,
      Math.floor(seconds || 0)
    );

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    return [
      String(h).padStart(2, "0"),
      String(m).padStart(2, "0"),
      String(s).padStart(2, "0")
    ].join(":");
  }

  function showFallback() {
    const wrapper = q("[data-vhs-fallback]");
    const fallback = state.fallbackVideo;

    if (!wrapper || !fallback || !state.video) return;

    wrapper.hidden = false;
    state.video.style.display = "none";

    if (state.video.currentSrc) {
      fallback.src = state.video.currentSrc;
      fallback.currentTime = state.video.currentTime || 0;
    }

    setMessage("WebGL2 unavailable; showing the source video.");
  }

  function hideFallback() {
    const wrapper = q("[data-vhs-fallback]");

    if (!wrapper || !state.video) return;

    wrapper.hidden = true;
    state.video.style.display = "none";
    setMessage("");
  }

  function playLocalFile(url) {
    if (!state.video) return;

    hideFallback();

    state.video.src = url;
    state.video.currentTime = 0;
    state.paused = true;
    state.video.playbackRate =
      state.speed === "SP"
        ? 1
        : state.speed === "LP"
          ? 0.95
          : 0.9;

    state.video.play().catch(() => {
      setStatus("PAUSE");
    });
  }

  function renderLocalFiles() {
    const list = q("[data-vhs-local-list]");
    const empty = q("[data-vhs-local-empty]");

    if (!list) return;

    list.textContent = "";

    if (!state.localFiles.length) {
      if (empty) empty.hidden = false;
      return;
    }

    if (empty) empty.hidden = true;

    state.localFiles.forEach((file, index) => {
      const li = document.createElement("li");
      const button = document.createElement("button");

      button.type = "button";
      button.textContent =
        `${index + 1}. ${file.label}`;

      button.addEventListener("click", () => {
        qa(
          "[data-vhs-local-list] button"
        ).forEach((b) =>
          b.classList.remove("is-active")
        );

        button.classList.add("is-active");

        playLocalFile(file.url);
      });

      li.appendChild(button);
      list.appendChild(li);
    });
  }

  function discoverLocalFiles() {
    /*
     * Files are intentionally declared by integration data rather than
     * guessed or fetched from a directory listing.
     */
    const files =
      Array.isArray(window.INSERTKOIN_VHS_FILES)
        ? window.INSERTKOIN_VHS_FILES
        : [];

    state.localFiles = files
      .filter(
        (item) =>
          item &&
          typeof item.url === "string"
      )
      .map((item) => ({
        url: item.url,
        label:
          item.label ||
          item.url.split("/").pop()
      }));
  }

  function stopYouTube() {
    if (!state.player) return;

    try {
      state.player.pauseVideo();
    } catch (_) {}
  }

  function startYouTube() {
    if (!state.tracks.length) {
      setMessage("The YouTube catalogue is unavailable.");
      return;
    }

    loadYouTubeAPI()
      .then(() => {
        if (!state.destroyed) {
          createYouTubePlayer();
        }
      })
      .catch(() => {
        setMessage("The YouTube player could not be loaded.");
      });
  }

  function wireControls() {
    qa("[data-vhs-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.vhsAction;

        if (action === "prev") previousTrack();
        if (action === "next") nextTrack();
        if (action === "random") randomTrack();
        if (action === "play") {
          if (state.source === "youtube") {
            toggleYouTubePlayback();
          } else if (state.video) {
            if (state.video.paused) {
              state.video.play().catch(() => {});
            } else {
              state.video.pause();
            }
          }
        }

        if (action === "speed") setSpeed();

        if (action === "source") {
          setSource(
            state.source === "youtube"
              ? "local"
              : "youtube"
          );
        }
      });
    });

    qa("[data-vhs-source]").forEach((button) => {
      button.addEventListener("click", () => {
        setSource(button.dataset.vhsSource);
      });
    });
  }

  function wireKeyboard() {
    state.root.addEventListener(
      "keydown",
      (event) => {
        if (state.destroyed) return;

        const target = event.target;

        if (
          target &&
          (
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.tagName === "SELECT" ||
            target.isContentEditable
          )
        ) {
          return;
        }

        if (event.key === " ") {
          event.preventDefault();

          if (state.source === "youtube") {
            toggleYouTubePlayback();
          } else if (state.video) {
            state.video.paused
              ? state.video.play().catch(() => {})
              : state.video.pause();
          }
        }

        if (event.key === "ArrowLeft") {
          event.preventDefault();
          previousTrack();
        }

        if (event.key === "ArrowRight") {
          event.preventDefault();
          nextTrack();
        }

        if (event.key.toLowerCase() === "r") {
          randomTrack();
        }

        if (event.key.toLowerCase() === "s") {
          setSpeed();
        }
      }
    );
  }

  function observeRoot() {
    if (!state.root) return;

    state.mutationObserver =
      new MutationObserver(() => {
        if (!document.documentElement.contains(
          state.root
        )) {
          close();
        }
      });

    state.mutationObserver.observe(
      document.documentElement,
      {
        childList: true,
        subtree: true
      }
    );

    state.resizeObserver =
      new ResizeObserver(() => resizeGL());

    const screen = q("[data-vhs-screen]");

    if (screen) {
      state.resizeObserver.observe(screen);
    }
  }

  function detectReducedMotion() {
    state.reducedMotion =
      window.matchMedia &&
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    if (state.reducedMotion) {
      state.intensity *= 0.55;
    }
  }

  function init() {
    if (!ensureRoot()) return;

    state.destroyed = false;

    detectReducedMotion();
    normaliseTracks();
    discoverLocalFiles();

    setupLocalVideo();
    initGL();

    if (!state.gl) {
      showFallback();
    }

    renderTrackList();
    renderLocalFiles();
    wireControls();
    wireKeyboard();
    observeRoot();

    updateTrackUI();
    setText("[data-vhs-osd-speed]", state.speed);

    setSource("youtube");
  }

  function destroyGL(callLoseContext = true) {
    if (!state.gl) return;

    const gl = state.gl;

    cancelRenderLoop();

    if (state.texture) {
      gl.deleteTexture(state.texture);
      state.texture = null;
    }

    if (state.buffer) {
      gl.deleteBuffer(state.buffer);
      state.buffer = null;
    }

    if (state.vao) {
      gl.deleteVertexArray(state.vao);
      state.vao = null;
    }

    if (state.program) {
      gl.deleteProgram(state.program);
      state.program = null;
    }

    if (callLoseContext) {
      const lose =
        gl.getExtension(
          "WEBGL_lose_context"
        );

      if (lose) {
        try {
          lose.loseContext();
        } catch (_) {}
      }
    }

    state.gl = null;
  }

  function close() {
    if (state.destroyed) return;

    state.destroyed = true;

    cancelRenderLoop();

    if (state.mutationObserver) {
      state.mutationObserver.disconnect();
      state.mutationObserver = null;
    }

    if (state.resizeObserver) {
      state.resizeObserver.disconnect();
      state.resizeObserver = null;
    }

    destroyYouTubePlayer();

    if (state.video) {
      try {
        state.video.pause();
      } catch (_) {}

      state.video.removeAttribute("src");

      try {
        state.video.load();
      } catch (_) {}
    }

    if (state.fallbackVideo) {
      try {
        state.fallbackVideo.pause();
      } catch (_) {}

      state.fallbackVideo.removeAttribute("src");

      try {
        state.fallbackVideo.load();
      } catch (_) {}
    }

    destroyGL();

    state.root = null;
    state.video = null;
    state.fallbackVideo = null;
    state.canvas = null;
    state.localFiles = [];
  }

  window.KGVHS = {
    open: init,
    close
  };

  /*
   * Compatibility with the loader contract:
   * the module's entry can simply call KGVHS.open().
   */
  window.kgVhsOpen = init;
  window.kgVhsClose = close;
})();
```

---

# 4. Integration: `index.html` / `fr.html`

The exact surrounding text must be patched against the repository version rather than copied wholesale.

## Cabinet

Add one cabinet beside the six existing cabinets:

```html
<div
  class="cab"
  style="--th:url(thumb-vhs.jpg);--nc:#7f9d42"
>
  <button class="hit" data-go="vhs">
    <b>VHS</b>
  </button>
</div>
```

The final thumbnail and `--nc` remain owner-supplied decisions.

## VHS local-file declaration

Do not make the module guess filenames. Add only when actual masters are supplied:

```html
<script>
  window.INSERTKOIN_VHS_FILES = [
    { url: "vhs-01.mp4", label: "VHS 01" },
    { url: "vhs-02.mp4", label: "VHS 02" }
  ];
</script>
```

If no local files are supplied, omit this declaration. The cabinet will simply report that no local files are available.

## Loader registration

Use the repository's actual `GAMES` structure and preserve its existing shape. The VHS entry should resolve to:

```javascript
entry: () => window.KGVHS && window.KGVHS.open()
```

and its module list should contain:

```javascript
["kg-vhs"]
```

The precise insertion point must remain the existing `GAMES.vhs` convention.

---

# 5. i18n

The module currently uses English fallback strings internally for its dynamic runtime messages. The integration should move visible fixed UI strings into the repository's actual `kg-i18n-dict.js` mechanism.

Proposed source strings:

```text
VHS
CATALOGUE
FILES
PLAY
PAUSE
STOP
LOAD
Previous
Play / pause
Next
Random
Tape speed
Source
No local VHS files have been supplied.
The YouTube catalogue is unavailable.
The YouTube player could not be loaded.
YouTube could not load this video.
The local VHS file could not be played.
WebGL2 unavailable; showing the source video.
```

French translations:

```text
VHS
CATALOGUE
FICHIERS
LECTURE
PAUSE
ARRÊT
CHARGEMENT
Précédent
Lecture / pause
Suivant
Aléatoire
Vitesse de bande
Source
Aucun fichier VHS local n’a été fourni.
Le catalogue YouTube est indisponible.
Le lecteur YouTube n’a pas pu être chargé.
YouTube n’a pas pu charger cette vidéo.
Le fichier VHS local n’a pas pu être lu.
WebGL2 indisponible ; affichage de la vidéo source.
```

These should be entered using the repository's existing `exact` dictionary mechanism, not by introducing a second translation system.

---

# 6. Service worker

The existing service worker should not cache `.mp4` responses.

The fetch handler should short-circuit media requests before the generic same-origin cache branch:

```javascript
if (
  request.method !== "GET" ||
  request.headers.has("range") ||
  /\.(?:mp4|webm|mov|m4v)(?:$|\?)/i.test(
    new URL(request.url).pathname
  )
) {
  return;
}
```

Important: the exact service-worker event handler must preserve its current fallback semantics. The above is a condition to place before the existing cache logic, not a replacement for the whole handler.

The cache version must be incremented according to the existing naming convention.

`kg-vhs.js`, `kg-vhs.css`, and `kg-vhs.html` must be included in the precache/static cache list.

---

# 7. README

Add to the existing Files section:

```text
kg-vhs.js
kg-vhs.css
kg-vhs.html
thumb-vhs.jpg
vhs-*.mp4
```

Do not claim that `vhs-*.mp4` exists until the owner supplies actual files.

Add a shader attribution notice only after the exact final shader provenance has been selected.

The implementation above is an original GLSL implementation. It therefore does not require copying GodotRetro headers. If any GodotRetro shader code is substituted into it, the applicable source header and licence must be preserved verbatim.

---

# 8. Licence

For the code above:

```text
VHS cabinet WebGL implementation: original code for Insert Koin.
```

No third-party source code is copied in this implementation.

If a third-party shader is later incorporated, add its exact licence notice here before committing.

---

# 9. YouTube architecture

The YouTube rectangle is never covered by the VHS OSD or CSS effects.

The visual hierarchy is:

```text
┌─────────────────────────────────────────────┐
│ VHS                         STOP       PAL  │
├─────────────────────────────────────────────┤
│                                             │
│       ┌─────────────────────────────┐       │
│       │                             │       │
│       │       YOUTUBE PLAYER        │       │
│       │       UNMODIFIED RECT       │       │
│       │                             │       │
│       └─────────────────────────────┘       │
│                                             │
├─────────────────────────────────────────────┤
│ PLAY   00:00:00                    SP       │
├─────────────────────────────────────────────┤
│ PREV   PLAY   NEXT   RND   SP   YT         │
└─────────────────────────────────────────────┘
```

The VHS WebGL pipeline applies only to local `<video>` sources.

The YouTube player remains an ordinary YouTube IFrame API player.

---

# 10. Local VHS architecture

A local clip goes through:

```text
vhs-01.mp4
      │
      ▼
HTMLVideoElement
      │
      ▼
WebGL2 texture
      │
      ▼
YIQ conversion
      │
      ├── wide chroma blur
      ├── chroma displacement
      ├── line jitter
      ├── tracking disturbance
      ├── head-switching band
      ├── dropouts
      └── luma/grain noise
      │
      ▼
canvas
```

The shader is deliberately parameterized so SP / LP / EP alter degradation intensity rather than changing the source file.

---

# 11. Important implementation correction

The original brief proposes:

```text
requestVideoFrameCallback
```

as the primary render loop.

The implementation does this when available, with `requestAnimationFrame` fallback.

One deliberate exception is pause: when the local video is paused, the render loop remains available through the fallback path so the frozen frame can carry the animated pause noise. This is required for the specified VHS-pause effect.

---

# 12. Reduced motion

With:

```text
prefers-reduced-motion: reduce
```

the implementation suppresses roll and reduces degradation intensity.

A future pass can make the shader itself fully deterministic under reduced motion if that becomes a project requirement.

---

# 13. 7-cabinet grid proposal

Current six-cabinet assumptions should not be blindly retained.

Recommended desktop arrangement:

```text
[ 1 ][ 2 ][ 3 ][ 4 ]
[   5 ][   6 ][   7 ]
```

with the second row centered.

Recommended mobile arrangement:

```text
[ 1 ][ 2 ]
[ 3 ][ 4 ]
[ 5 ][ 6 ]
[   7   ]
```

This avoids a final one-item orphan beside another cabinet.

The exact CSS must be reconciled with the existing `.cab` dimensions before applying it.

---

# 14. Known integration issue: loader teardown

The loader does not expose a module-level destructor hook.

Therefore the VHS module owns:

- YouTube player destruction;
- video pause/reset;
- render-loop cancellation;
- `requestVideoFrameCallback` cancellation;
- WebGL resource deletion;
- `WEBGL_lose_context`;
- observers;
- event handlers attached to its root.

`KGVHS.close()` is idempotent.

The module also watches whether its root remains attached to the document. This is necessary because a generic loader close does not itself call a module destructor.

---

# 15. Jukebox

No changes to the jukebox are included in this document.

The existing global `JUKE_TRACKS` is consumed directly.

The proposed owner decision is:

```text
Opening VHS pauses Motel Sound.
Closing VHS does not restart it automatically.
```

This is intentionally left as an owner decision.

No change to the existing 160×90 jukebox player is proposed here.

---

# 16. Owner decisions still required

Before production merge:

1. Koin cost / reward.
2. Actual local master files.
3. PAL or NTSC default.
4. Catalogue-first or files-first.
5. `thumb-vhs.jpg` and cabinet colour.
6. Whether opening VHS pauses Motel Sound.

---

# 17. Acceptance tests

## Loader

- open VHS;
- close with module return;
- close with BAKU BOOM;
- reopen ten times;
- inspect console;
- verify only one VHS player exists;
- verify only one render loop exists.

## Local files

- SP;
- LP;
- EP;
- play;
- pause;
- seek;
- end;
- reload;
- WebGL2 unavailable;
- WebGL context lost/restored;
- tab hidden/visible;
- reduced motion.

## YouTube

- API loads once;
- one `YT.Player`;
- play;
- pause;
- previous;
- next;
- random;
- track selection;
- unavailable video;
- API unavailable;
- close and reopen.

## Internationalisation

- English entry;
- French entry;
- live language switch;
- ARIA labels.

## Service worker

- normal static GET;
- MP4 GET;
- MP4 Range request;
- offline static cabinet;
- offline local-video failure message.

## Browsers

Required:

- Chrome desktop;
- Firefox desktop;
- Safari desktop;
- Safari iOS;
- Chrome Android.

Record explicitly what was not tested.

---

# 18. Files expected in the final change

```text
kg-vhs.js
kg-vhs.css
kg-vhs.html
```

Potentially modified:

```text
index.html
fr.html
kg-i18n-dict.js
sw.js
README.md
```

Potentially proposed but not automatically changed:

```text
sitemap.xml
llms.txt
JSON-LD
```

Potentially supplied by owner:

```text
thumb-vhs.jpg
vhs-01.mp4
vhs-02.mp4
...
```

---

# 19. Final implementation status

The three-module implementation is supplied above.

The integration fragments are deliberately expressed as patches/insertions rather than pretending to be an exact repository diff where the relevant surrounding source has not been reproduced in this document.

No lore, author text, copyright wording, existing cabinet identity, jukebox data, or existing game logic is altered by this proposal.
