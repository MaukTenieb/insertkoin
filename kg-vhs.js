/*
 * VHS cabinet — original code for Insert Koin. v2.2.0
 *
 * Third-party code: none. The YIQ matrices are the standard NTSC constants;
 * the integer hash is the MurmurHash3 32-bit finalizer (public domain).
 *
 * Integration notes (kg-loader):
 *  - Fixed full-viewport panel inside the 0x0 .kg-layer (same convention as
 *    the other panels), scrollable on touch (kg-layer has touch-action:none).
 *  - All English strings go through window.KGI18N.t so the repository's
 *    kg-i18n-dict.js stays the only translation system.
 *  - EJECT closes the cabinet the way the host's back button would, with a
 *    last VHS roll; it never hijacks the host page's own Escape/Space keys.
 *
 * Public API: KGVHS.open(), KGVHS.close(), KGVHS.debug(), KGVHS.version
 * Optional page data (all optional):
 *   window.JUKE_TRACKS               existing jukebox catalogue (read only)
 *   window.INSERTKOIN_VHS_FILES      [{ url, label }]          (legacy form)
 *   window.INSERTKOIN_VHS_CONFIG     { files, standard: "PAL"|"NTSC",
 *                                      source: "youtube"|"local",
 *                                      youtubeNoCookie: true }
 * Events dispatched on window: "kg-vhs:open", "kg-vhs:eject", "kg-vhs:close".
 */
(() => {
  "use strict";

  const VERSION = "2.2.0";
  const ROOT_SELECTOR = "[data-vhs-root]";
  const YT_API = "https://www.youtube.com/iframe_api";

  // SP/LP/EP are gone (owner call): the wear shader keeps its classic SP
  // intensity. Only SPEED_INTENSITY.SP is still read, via effectiveIntensity().
  const SPEED_INTENSITY = { SP: 0.18, LP: 0.36, EP: 0.58 };
  const STANDARDS = {
    // In France the 625/50 family shipped as PAL·SECAM on the same deck;
    // one shader path, the authentic label.
    PAL: { lines: 576, std: 0, label: "PAL·SECAM" },
    NTSC: { lines: 480, std: 1, label: "NTSC" },
  };
  const REDUCED_MOTION_FACTOR = 0.55;
  const PAUSE_FRAME_INTERVAL = 1000 / 24;
  const ROLL_DURATION = 700;
  const MAX_DRAW_FAILURES = 3;

  /* ------------------------------------------------------------------ *
   * i18n. English source strings, translated by the repository's own
   * KGI18N layer (kg-i18n-dict.js, `exact` entries). VHS, PAL, NTSC and
   * the SP/LP/EP speeds are the same word in both languages.
   * ------------------------------------------------------------------ */

  function t(key) {
    if (window.KGI18N && typeof window.KGI18N.t === "function") {
      try {
        const out = window.KGI18N.t(key);
        if (typeof out === "string" && out) return out;
      } catch (_) { /* fall through to the key itself */ }
    }
    return key;
  }

  /* ------------------------------------------------------------------ *
   * Shaders (GLSL ES 3.00)
   * ------------------------------------------------------------------ */

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
    precision highp int;

    uniform sampler2D uTex;
    uniform vec2  uRes;        // canvas size in pixels
    uniform float uAspect;     // video width / height
    uniform float uTime;       // seconds; 0 when motion is reduced
    uniform float uIntensity;  // 0..~0.6 (SP / LP / EP)
    uniform float uStd;        // 0 = PAL, 1 = NTSC
    uniform float uPause;      // 1 when the picture is frozen
    uniform float uRoll;       // 0..1 vertical-hold slip

    in vec2 vUV;
    out vec4 outColor;

    // MurmurHash3 32-bit finalizer (public domain).
    uint hashU(uint x) {
      x ^= x >> 16;
      x *= 0x85ebca6bu;
      x ^= x >> 13;
      x *= 0xc2b2ae35u;
      x ^= x >> 16;
      return x;
    }

    // Uniform random number in [0,1). Arguments must be >= 0.
    float rnd(float a, float b, float c) {
      uint h = hashU(uint(a) + 0x9e3779b9u * hashU(uint(b) + 0x7f4a7c15u * (uint(c) + 1u)));
      return float(h >> 8) * (1.0 / 16777216.0);
    }

    vec3 rgbToYiq(vec3 c) {
      return vec3(
        dot(c, vec3(0.2990,  0.5870,  0.1140)),
        dot(c, vec3(0.5959, -0.2746, -0.3213)),
        dot(c, vec3(0.2115, -0.5227,  0.3112))
      );
    }

    vec3 yiqToRgb(vec3 c) {
      return vec3(
        c.x + 0.9563 * c.y + 0.6210 * c.z,
        c.x - 0.2721 * c.y - 0.6474 * c.z,
        c.x - 1.1070 * c.y + 1.7046 * c.z
      );
    }

    vec3 fetchYiq(vec2 uv) {
      return rgbToYiq(textureLod(uTex, uv, 0.0).rgb);
    }

    void main() {
      float k = uIntensity;

      // --- CRT screen curvature + rounded bezel (drawn on the canvas UVs so
      //     the video inside stays undeformed).
      vec2 c2 = vUV - 0.5;
      vec2 curved = 0.5 + c2 * (1.0 + 0.055 * dot(c2, c2) * 4.0);
      // Rounded-rectangle mask, like a real tube.
      vec2 q2 = abs(c2) - vec2(0.488, 0.482);
      float corner = length(max(q2, 0.0)) + min(max(q2.x, q2.y), 0.0) - 0.012;
      if (corner > 0.0) { outColor = vec4(0.0, 0.0, 0.0, 1.0); return; }

      // --- Letterbox: map the screen into the picture (keeps video aspect).
      float canvasAspect = uRes.x / uRes.y;
      vec2 sc = vec2(1.0);
      if (uAspect > canvasAspect) sc.y = canvasAspect / uAspect;
      else                        sc.x = uAspect / canvasAspect;
      vec2 p = (curved - 0.5) / sc + 0.5;

      if (p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0) {
        outColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
      }

      float line = floor(vUV.y * uRes.y);
      float t25  = floor(uTime * 25.0);

      // --- Vertical-hold roll (applied BEFORE sampling so it is visible).
      float seam = 1.0;
      if (uRoll > 0.001) {
        float seamDist = abs(p.y - (1.0 - uRoll));
        seam = mix(0.15, 1.0, smoothstep(0.0, 0.04, seamDist));
        p.y = fract(p.y + uRoll);
      }

      // --- Horizontal line displacement (all in picture-width units).
      float dx = (rnd(line, t25, 1.0) - 0.5) * 0.009 * k;

      // Tracking band drifting upwards.
      float bandC = fract(uTime * 0.035 + 0.35);
      float band  = smoothstep(0.07, 0.0, abs(p.y - bandC));
      dx += (rnd(line, t25, 2.0) - 0.5) * 0.05 * band * k;
      dx += band * 0.02 * k * sin(p.y * 80.0 + uTime * 5.0);

      // Head-switching skew at the bottom of the picture.
      float hs = smoothstep(0.05, 0.0, p.y);
      dx += hs * hs * 0.07 * k + hs * (rnd(line, t25, 3.0) - 0.5) * 0.02 * k;

      // Extra wobble while rolling or paused.
      dx += (rnd(line, t25, 9.0)  - 0.5) * 0.03  * uRoll;
      dx += (rnd(line, t25, 10.0) - 0.5) * 0.004 * uPause;

      // --- Luma: slightly soft.
      float ld = 0.0008 + 0.0016 * k;
      float yy = 0.50 * fetchYiq(vec2(p.x + dx,      p.y)).x
               + 0.25 * fetchYiq(vec2(p.x + dx - ld, p.y)).x
               + 0.25 * fetchYiq(vec2(p.x + dx + ld, p.y)).x;

      // --- Chroma: delayed and much blurrier than luma.
      // Triangular kernel, normalised by its real weight sum.
      float cShift = mix(0.0018, 0.0034, uStd) * (0.6 + 2.0 * k);
      float cStep  = 0.0026 + 0.004 * k;
      vec2 iq = vec2(0.0);
      float wsum = 0.0;
      for (int n = -6; n <= 6; n++) {
        float w = 1.0 - abs(float(n)) / 7.0;
        vec3 s = fetchYiq(vec2(p.x + dx + cShift + float(n) * cStep, p.y));
        iq += s.yz * w;
        wsum += w;
      }
      iq /= wsum;
      iq *= 1.0 - 0.3 * k;

      vec3 col = yiqToRgb(vec3(yy, iq));

      // --- Tape noise (smeared horizontally, like real FM noise).
      float gx = floor(vUV.x * uRes.x * 0.5);
      col += (rnd(gx, line, t25 + 11.0) - 0.5) * 0.22 * k;

      // --- Head-to-tape slant: the recorded tracks are diagonal stripes, so
      // the noise organises itself along them (helical scan).
      float slant = p.x * 0.10 + p.y * 2.2;
      float stripe = smoothstep(0.55, 1.0, sin(slant * 160.0) * 0.5 + 0.5);
      col += (rnd(gx, line, t25 + 13.0) - 0.5) * 0.10 * k * stripe;

      // Noise burst inside the tracking band (smeared along the tracks).
      float bandStripe = smoothstep(0.45, 1.0, sin((p.x * 0.10 + bandC * 2.2) * 160.0) * 0.5 + 0.5);
      col += band * (rnd(gx, line, t25 + 17.0) - 0.5) * 0.9 * k * (0.55 + 0.45 * bandStripe);

      // --- Dropouts: short bright horizontal streaks on one or two lines.
      float lb = floor(line * 0.5);
      float tb = floor(uTime * 6.0);
      if (rnd(lb, tb, 4.0) < 0.0012 + 0.004 * k) {
        float x0  = rnd(lb, tb, 5.0);
        float len = 0.01 + 0.09 * rnd(lb, tb, 6.0);
        float inside = step(x0, p.x) * step(p.x, x0 + len);
        col = mix(col, vec3(0.92), inside * 0.85);
      }

      // --- Pause: desaturated frozen frame with a drifting noise band.
      if (uPause > 0.5) {
        float pc = fract(uTime * 0.16);
        float pb = smoothstep(0.09, 0.0, abs(p.y - pc));
        float nz = rnd(gx, line, t25 + 23.0);
        col = mix(col, vec3(nz), pb * clamp(0.25 + k, 0.0, 0.7));
        col = mix(col, vec3(dot(col, vec3(0.299, 0.587, 0.114))), 0.25);
      }

      col *= seam;

      // --- Tube vignette: corners fall into the black bezel.
      float vig = 1.0 - 0.4 * clamp(dot(c2, c2) * 3.4, 0.0, 1.0);
      col *= vig;

      outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
    }
  `;

  /* ------------------------------------------------------------------ *
   * State. A fresh object per open(); callbacks from an old session
   * compare against the module-level `state` and bail out.
   * ------------------------------------------------------------------ */

  function makeState() {
    return {
      root: null,
      destroyed: true,
      opened: false,
      cleanups: [],
      layerTouch: null,

      source: "youtube",
      standard: "PAL",
      speed: "SP",
      status: "Stop",
      messageKey: "",
      reducedMotion: false,
      noCookie: true,

      // YouTube
      tracks: [],
      trackIndex: 0,
      player: null,
      playerReady: false,
      ytLoading: false,
      ytPlaying: false,
      ytMuted: false,
      ytTimer: 0,
      ytErrorStreak: 0,
      ytSkipTimer: 0,
      scanTimer: 0,
      scanDir: 0,
      scanHeld: false,
      pendingTrack: null,

      // Local files
      localFiles: [],
      localIndex: -1,
      video: null,
      canvas: null,

      // WebGL
      glTried: false,
      glOk: false,
      fallback: false,
      contextLost: false,
      gl: null,
      program: null,
      buffer: null,
      vao: null,
      texture: null,
      uniforms: null,

      // Render loop
      raf: 0,
      frames: 0,
      lastDraw: 0,
      lastT: -1,
      t0: 0,
      forceUpload: true,
      dirty: true,
      aspect: 16 / 9,
      rollStart: 0,
      drawFailures: 0,

      rootVisible: true,
    };
  }

  let state = makeState();
  let ytPromise = null;
  let retryRaf = 0;
  const counters = { players: 0, contexts: 0 };

  const live = (s) => s === state && !s.destroyed;

  function q(s, selector) {
    return s.root ? s.root.querySelector(selector) : null;
  }

  function qa(s, selector) {
    return s.root ? Array.prototype.slice.call(s.root.querySelectorAll(selector)) : [];
  }

  function setText(s, selector, value) {
    const el = q(s, selector);
    if (el && el.textContent !== value) el.textContent = value;
  }

  function on(s, target, type, handler, options) {
    target.addEventListener(type, handler, options);
    s.cleanups.push(() => target.removeEventListener(type, handler, options));
  }

  /* ------------------------------------------------------------------ *
   * Small UI helpers
   * ------------------------------------------------------------------ */

  function renderStatus(s) {
    // During a picture search the deck window shows REW / FFW; media events
    // must not overwrite the scan indicators until the scan ends.
    if (s.scanDir) return;
    const label = t(s.status);
    setText(s, "[data-vhs-status]", label);
    setText(s, "[data-vhs-osd-state]", label);
  }

  function isPlaying(s) {
    if (s.source === "youtube") return s.ytPlaying;
    return !!(s.video && !s.video.paused && !s.video.ended);
  }

  function updatePlayButton(s) {
    setText(s, "[data-vhs-play-label]", isPlaying(s) ? "\u275A\u275A" : "\u25B6");
  }

  function setStatus(s, status) {
    s.status = status;
    renderStatus(s);
    updatePlayButton(s);
  }

  function renderMessage(s) {
    setText(s, "[data-vhs-message]", s.messageKey ? t(s.messageKey) : "");
  }

  function setMessage(s, key) {
    s.messageKey = key || "";
    renderMessage(s);
  }

  function applyI18n(s) {
    qa(s, "[data-vhs-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-vhs-i18n"));
    });
    qa(s, "[data-vhs-i18n-aria]").forEach((el) => {
      el.setAttribute("aria-label", t(el.getAttribute("data-vhs-i18n-aria")));
    });
    renderStatus(s);
    renderMessage(s);
  }

  function formatTime(seconds) {
    const total = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const sec = total % 60;
    return [h, m, sec].map((n) => String(n).padStart(2, "0")).join(":");
  }

  function setCounter(s, seconds) {
    setText(s, "[data-vhs-osd-counter]", formatTime(seconds));
  }

  function effectiveIntensity(s) {
    return SPEED_INTENSITY[s.speed] * (s.reducedMotion ? REDUCED_MOTION_FACTOR : 1);
  }

  /* ------------------------------------------------------------------ *
   * Tracks (YouTube catalogue) — read from the existing jukebox data
   * ------------------------------------------------------------------ */

  function readTracks() {
    // 1) Scraped cassette library (kg-vhs-library.js → CHANNEL.SCRAPE backend).
    //    Kept separate from JUKE_TRACKS so the Motel Sound jukebox is untouched.
    try {
      if (Array.isArray(window.KG_VHS_TRACKS) && window.KG_VHS_TRACKS.length) {
        return window.KG_VHS_TRACKS;
      }
    } catch (_) { /* ignore */ }
    // 2) A top-level `var JUKE_TRACKS` is NOT a property of window, but it is
    //    visible by name from other classic scripts. Try both.
    try {
      if (typeof JUKE_TRACKS !== "undefined" && Array.isArray(JUKE_TRACKS)) return JUKE_TRACKS;
    } catch (_) { /* ignore */ }
    return Array.isArray(window.JUKE_TRACKS) ? window.JUKE_TRACKS : [];
  }

  function videoIdFrom(value) {
    if (typeof value !== "string") return "";
    const v = value.trim();
    if (/^[\w-]{11}$/.test(v)) return v;
    const m = v.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([\w-]{11})/);
    return m ? m[1] : "";
  }

  function trackId(track) {
    if (typeof track === "string") return videoIdFrom(track);
    if (!track || typeof track !== "object") return "";
    const keys = ["id", "videoId", "youtubeId", "yt", "v", "url", "href", "link"];
    for (let i = 0; i < keys.length; i++) {
      const id = videoIdFrom(track[keys[i]]);
      if (id) return id;
    }
    return "";
  }

  function trackTitle(track, id) {
    const raw = typeof track === "string"
      ? track
      : (track && (track.title || track.name || track.label || track.t)) || "";
    const cleaned = String(raw || "")
      .replace(/^\s*\d+\s*[)\].:-]\s*/, "")
      .replace(/\s+/g, " ")
      .trim();
    return cleaned || id;
  }

  function normaliseTracks(s) {
    const source = readTracks();
    s.tracks = source
      .map((track) => {
        const id = trackId(track);
        return id ? { id, title: trackTitle(track, id) } : null;
      })
      .filter(Boolean);

    if (source.length && !s.tracks.length) {
      console.warn("[VHS] JUKE_TRACKS has " + source.length +
        " entries but none exposes a usable YouTube id; check the data shape.");
    }
  }

  function normaliseFiles(s, files) {
    s.localFiles = (files || [])
      .filter((item) => item && typeof item.url === "string" && item.url)
      .map((item) => ({
        url: item.url,
        label: item.label || item.url.split("?")[0].split("/").pop(),
      }));
  }

  /* ------------------------------------------------------------------ *
   * Track / file lists and selection
   * ------------------------------------------------------------------ */

  function listLength(s) {
    return s.source === "youtube" ? s.tracks.length : s.localFiles.length;
  }

  function currentIndex(s) {
    return s.source === "youtube" ? s.trackIndex : s.localIndex;
  }

  function updateTrackUI(s) {
    const n = listLength(s);
    const i = currentIndex(s);
    let label = "\u2014";

    if (s.source === "youtube" && s.tracks[i]) {
      label = (i + 1) + "/" + n + " \u2014 " + s.tracks[i].title;
    } else if (s.source === "local" && s.localFiles[i]) {
      label = (i + 1) + "/" + n + " \u2014 " + s.localFiles[i].label;
    }
    setText(s, "[data-vhs-osd-track]", label);

    const mark = (selector, active) => {
      qa(s, selector).forEach((button, idx) => {
        button.classList.toggle("is-active", idx === active);
        button.setAttribute("aria-current", idx === active ? "true" : "false");
        if (idx === active && button.scrollIntoView) {
          try { button.scrollIntoView({ block: "nearest" }); } catch (_) { /* old browsers */ }
        }
      });
    };
    mark("[data-vhs-track]", s.source === "youtube" ? s.trackIndex : -1);
    mark("[data-vhs-local-item]", s.source === "local" ? s.localIndex : -1);
  }

  function renderLists(s) {
    const tracklist = q(s, "[data-vhs-tracklist]");
    if (tracklist) {
      tracklist.textContent = "";
      s.tracks.forEach((track, index) => {
        const li = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.vhsTrack = String(index);
        button.textContent = (index + 1) + ". " + track.title;
        li.appendChild(button);
        tracklist.appendChild(li);
      });
    }

    const locals = q(s, "[data-vhs-local-list]");
    const empty = q(s, "[data-vhs-local-empty]");
    if (locals) {
      locals.textContent = "";
      s.localFiles.forEach((file, index) => {
        const li = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.vhsLocalItem = String(index);
        button.textContent = (index + 1) + ". " + file.label;
        li.appendChild(button);
        locals.appendChild(li);
      });
    }
    if (empty) empty.hidden = s.localFiles.length > 0;

    // Without any file, the FILES tab would only lead to an empty panel.
    const tab = q(s, "[data-vhs-source='local']");
    if (tab) tab.hidden = s.localFiles.length === 0;
  }

  function wrapIndex(i, n) {
    return ((i % n) + n) % n;
  }

  function selectTrack(s, index, autoplay) {
    if (!s.tracks.length) return;
    s.trackIndex = wrapIndex(index, s.tracks.length);
    updateTrackUI(s);
    s.pendingTrack = { autoplay: autoplay !== false };
    if (s.player && s.playerReady) applyPendingTrack(s);
    else ensureYouTube(s);
  }

  function applyPendingTrack(s) {
    const pending = s.pendingTrack;
    const track = s.tracks[s.trackIndex];
    if (!pending || !track || !s.player) return;
    s.pendingTrack = null;
    try {
      if (pending.autoplay) s.player.loadVideoById(track.id);
      else s.player.cueVideoById(track.id);
    } catch (_) { /* player not usable yet */ }
  }

  function selectLocal(s, index, autoplay) {
    if (!s.localFiles.length || !s.video) return;
    s.localIndex = wrapIndex(index, s.localFiles.length);
    const file = s.localFiles[s.localIndex];

    setMessage(s, "");
    updateTrackUI(s);
    s.video.src = file.url;
    s.forceUpload = true;
    s.dirty = true;
    s.lastT = -1;
    setCounter(s, 0);
    setSeek(s, 0);

    if (!s.reducedMotion && s.glOk && !s.fallback) s.rollStart = performance.now();

    if (autoplay !== false) {
      const p = s.video.play();
      if (p && typeof p.catch === "function") p.catch(() => { if (live(s)) setStatus(s, "Pause"); });
    }
    syncLoop(s);
  }

  function step(s, delta) {
    if (s.source === "youtube") selectTrack(s, s.trackIndex + delta, true);
    else selectLocal(s, (s.localIndex < 0 ? 0 : s.localIndex) + delta, true);
  }

  function randomItem(s) {
    const n = listLength(s);
    if (n < 2) return;
    const current = currentIndex(s);
    let next = current;
    while (next === current) next = Math.floor(Math.random() * n);
    if (s.source === "youtube") selectTrack(s, next, true);
    else selectLocal(s, next, true);
  }

  /* ------------------------------------------------------------------ *
   * YouTube
   * ------------------------------------------------------------------ */

  function loadYouTubeAPI() {
    if (window.YT && window.YT.Player) return Promise.resolve();
    if (ytPromise) return ytPromise;

    ytPromise = new Promise((resolve, reject) => {
      let settled = false;
      let poll = 0;
      let timer = 0;

      const finish = (fn, arg) => {
        if (settled) return;
        settled = true;
        clearInterval(poll);
        clearTimeout(timer);
        fn(arg);
      };

      // Chain, never replace: the jukebox may use the same global callback.
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () {
        try {
          if (typeof previous === "function") previous.apply(this, arguments);
        } finally {
          finish(resolve);
        }
      };

      // Safety net if another script overwrote the callback after us.
      poll = setInterval(() => {
        if (window.YT && window.YT.Player) finish(resolve);
      }, 250);
      timer = setTimeout(() => finish(reject, new Error("YouTube API timeout")), 15000);

      if (!document.querySelector('script[src="' + YT_API + '"]')) {
        const script = document.createElement("script");
        script.src = YT_API;
        script.async = true;
        script.onerror = () => finish(reject, new Error("YouTube API blocked"));
        document.head.appendChild(script);
      }
    });

    ytPromise = ytPromise.catch((error) => {
      ytPromise = null; // allow a later retry
      throw error;
    });
    return ytPromise;
  }

  function ensureYouTube(s) {
    if (s.player || s.ytLoading || !live(s)) return;
    if (!s.tracks.length) {
      setMessage(s, "Feed the cassette with tapes.");
      return;
    }
    s.ytLoading = true;
    loadYouTubeAPI()
      .then(() => {
        s.ytLoading = false;
        if (live(s) && s.source === "youtube") createPlayer(s);
        else if (live(s) && !s.player) createPlayer(s);
      })
      .catch(() => {
        s.ytLoading = false;
        if (live(s)) setMessage(s, "The player could not be loaded.");
      });
  }

  function createPlayer(s) {
    if (!live(s) || s.player || !window.YT || !window.YT.Player) return;
    const track = s.tracks[s.trackIndex];
    const mount = q(s, "[data-vhs-youtube]");
    if (!track || !mount) return;

    // YT.Player replaces its target element and destroy() removes the
    // iframe, so always hand it a fresh child and keep the mount intact.
    mount.textContent = "";
    const host = document.createElement("div");
    mount.appendChild(host);

    const vars = { playsinline: 1, rel: 0, modestbranding: 1 };
    if (/^https?:$/.test(location.protocol)) vars.origin = location.origin;

    const options = {
      videoId: track.id,
      width: "100%",
      height: "100%",
      playerVars: vars,
      events: {
        onReady: () => onYouTubeReady(s),
        onStateChange: (event) => onYouTubeState(s, event),
        onError: () => onYouTubeError(s),
      },
    };
    if (s.noCookie) options.host = "https://www.youtube-nocookie.com";

    counters.players++;
    s.player = new window.YT.Player(host, options);
  }

  function destroyPlayer(s) {
    stopYtClock(s);
    clearTimeout(s.ytSkipTimer);
    if (!s.player) return;
    try { s.player.stopVideo(); } catch (_) { /* ignore */ }
    try { s.player.destroy(); } catch (_) { /* ignore */ }
    s.player = null;
    s.playerReady = false;
    s.ytPlaying = false;
  }

  function startYtClock(s) {
    stopYtClock(s);
    s.ytTimer = setInterval(() => {
      if (!live(s) || !s.player) return;
      try { setCounter(s, s.player.getCurrentTime()); } catch (_) { /* ignore */ }
    }, 500);
  }

  function stopYtClock(s) {
    if (s.ytTimer) clearInterval(s.ytTimer);
    s.ytTimer = 0;
  }

  function onYouTubeReady(s) {
    if (!live(s)) return;
    s.playerReady = true;
    setMessage(s, "");
    if (s.pendingTrack) applyPendingTrack(s);
    if (s.ytMuted) {
      try { s.player.mute(); } catch (_) { /* ignore */ }
    }
  }

  function onYouTubeState(s, event) {
    if (!live(s) || !window.YT || !window.YT.PlayerState) return;
    const states = window.YT.PlayerState;

    if (event.data === states.PLAYING) {
      s.ytPlaying = true;
      s.ytErrorStreak = 0;
      setMessage(s, "");
      if (s.source === "youtube") setStatus(s, "Play");
      startYtClock(s);
    } else if (event.data === states.PAUSED) {
      s.ytPlaying = false;
      stopYtClock(s);
      if (s.source === "youtube") setStatus(s, "Pause");
    } else if (event.data === states.ENDED) {
      s.ytPlaying = false;
      stopYtClock(s);
      if (s.source === "youtube") setStatus(s, "Stop");
      if (s.source === "youtube") step(s, 1);
    } else if (event.data === states.BUFFERING) {
      if (s.source === "youtube") setStatus(s, "Load");
    } else {
      s.ytPlaying = false;
      if (s.source === "youtube") setStatus(s, "Stop");
    }
  }

  function onYouTubeError(s) {
    if (!live(s)) return;
    s.ytPlaying = false;
    setMessage(s, "YouTube could not load this video.");
    if (s.source === "youtube") setStatus(s, "Stop");

    // Skip unavailable videos, but never loop forever if all of them fail.
    s.ytErrorStreak++;
    if (s.ytErrorStreak < s.tracks.length) {
      clearTimeout(s.ytSkipTimer);
      s.ytSkipTimer = setTimeout(() => {
        if (live(s) && s.source === "youtube") step(s, 1);
      }, 800);
    }
  }

  function pauseYouTube(s) {
    if (!s.player || !s.playerReady) return;
    try { s.player.pauseVideo(); } catch (_) { /* ignore */ }
  }

  /* ------------------------------------------------------------------ *
   * Transport
   * ------------------------------------------------------------------ */

  // Picture search (REW / FFW). Holding one of the arrows scrubs the tape
  // with on-screen signals: counter running fast, REW/FFW in the deck
  // window, horizontal noise bars over the picture, audio silent. Release
  // lands on a still frame. A quick tap nudges the tape instead (see
  // nudge() below); the tracklist (and R) change tracks.
  function startScan(s, dir, opts) {
    stopScan(s);
    if (opts && opts.release) return; // key released: scan already torn down
    s.scanDir = dir;
    const root = s.root;
    if (root) {
      const screen = root.querySelector("[data-vhs-screen]");
      if (screen) screen.classList.add(dir < 0 ? "is-rew" : "is-ffw");
    }
    const scan = q(s, "[data-vhs-scan]");
    if (scan) scan.hidden = false;
    pauseAllMedia(s);
    const stateLabel = q(s, "[data-vhs-osd-state]");
    if (stateLabel) setText(s, "[data-vhs-osd-state]", dir < 0 ? "REW" : "FFW");
    const status = q(s, "[data-vhs-status]");
    if (status) status.textContent = dir < 0 ? "REW" : "FFW";
    const step = () => {
      s.scanTimer = 0;
      handleScanEnd(s);
    };
    s.scanTimer = setTimeout(step, 4000);

    // The counter spins at high speed while the heads skim the tape
    // (virtual on the catalogue, real scrubbing on local files).
    s.scanStartT = performance.now();
    s.scanSec = 0;
    const bump = () => {
      if (!live(s) || !s.scanDir) return;
      if (s.source === "local" && s.video && Number.isFinite(s.video.duration) && s.video.duration > 0) {
        const t = s.video.currentTime + dir * 8 / 60;
        s.video.currentTime = Math.max(0, Math.min(s.video.duration - 0.05, t));
      } else {
        // ~8x real time: the tape counter flies while the picture searches.
        s.scanSec += 8 / 60;
        setCounter(s, s.scanSec);
      }
      requestAnimationFrame(bump);
    };
    requestAnimationFrame(bump);
  }

  function stopScan(s) {
    if (s.scanTimer) { clearTimeout(s.scanTimer); s.scanTimer = 0; }
    if (!s.scanDir) return;
    s.scanDir = 0;
    const root = s.root;
    if (root) {
      const screen = root.querySelector("[data-vhs-screen]");
      if (screen) screen.classList.remove("is-rew", "is-ffw");
    }
    const scan = q(s, "[data-vhs-scan]");
    if (scan) scan.hidden = true;
    // s.status was never overwritten during the scan (renderStatus is
    // guarded), so it still holds the pre-scan deck state: restore it.
    setStatus(s, s.status);
  }

  function handleScanEnd(s) {
    // Scan timeout: the deck stops where it is, on a frozen frame (the
    // classic picture search always lands on a still). Playback resumes
    // from the play button.
    if (!s.scanDir) return;
    stopScan(s);
  }

  // Tape nudge (a quick REW / FFW tap): the heads skim the tape for a
  // beat — the picture tears into noise, OSD says REW/FFW — and playback
  // lands five seconds earlier or later, like a real deck rewinding a
  // few seconds of programme. Holding the button still runs the full
  // picture search.
  function nudge(s, dir, secs) {
    const step = secs && secs > 0 ? secs : 5;
    if (s.scanDir) return; // a held picture search owns the picture
    const root = s.root;
    if (root) {
      const screen = root.querySelector("[data-vhs-screen]");
      if (screen) screen.classList.add(dir < 0 ? "is-rew" : "is-ffw");
    }
    const scan = q(s, "[data-vhs-scan]");
    if (scan) scan.hidden = false;
    const stateLabel = q(s, "[data-vhs-osd-state]");
    if (stateLabel) setText(s, "[data-vhs-osd-state]", dir < 0 ? "REW" : "FFW");
    const status = q(s, "[data-vhs-status]");
    if (status) status.textContent = dir < 0 ? "REW" : "FFW";
    s.dirty = true;

    // The actual tape move: n seconds of programme, clamped to the reel.
    if (s.source === "local" && s.video && Number.isFinite(s.video.duration) && s.video.duration > 0) {
      s.video.currentTime = Math.max(0, Math.min(s.video.duration - 0.05, s.video.currentTime + dir * step));
    } else if (s.source === "youtube" && s.player) {
      try {
        const d = s.player.getDuration ? s.player.getDuration() || 0 : 0;
        let t = (s.player.getCurrentTime() || 0) + dir * step;
        if (t < 0) t = 0;
        if (d > 0 && t > d - 0.05) t = d - 0.05;
        s.player.seekTo(t, true);
      } catch (_) { /* the player will catch up on its own */ }
    }

    // The burst is brief: the heads settle and the picture returns.
    if (s.nudgeTimer) clearTimeout(s.nudgeTimer);
    s.nudgeTimer = setTimeout(() => {
      s.nudgeTimer = 0;
      if (s.scanDir) return; // a picture search took over mid-burst
      const r = s.root;
      if (r) {
        const screen = r.querySelector("[data-vhs-screen]");
        if (screen) screen.classList.remove("is-rew", "is-ffw");
      }
      const sc = q(s, "[data-vhs-scan]");
      if (sc) sc.hidden = true;
      setStatus(s, s.status);
    }, 650);
  }

  function togglePlay(s) {
    if (s.source === "youtube") {
      if (!s.player || !s.playerReady) {
        s.pendingTrack = s.pendingTrack || { autoplay: true };
        ensureYouTube(s);
        return;
      }
      try {
        if (s.ytPlaying) s.player.pauseVideo();
        else s.player.playVideo();
      } catch (_) { /* ignore */ }
      return;
    }

    if (!s.video) return;
    if (s.localIndex < 0) {
      selectLocal(s, 0, true);
      return;
    }
    if (s.video.paused || s.video.ended) {
      const p = s.video.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } else {
      s.video.pause();
    }
  }

  function toggleMute(s) {
    let muted;
    if (s.source === "youtube") {
      s.ytMuted = !s.ytMuted;
      muted = s.ytMuted;
      if (s.player && s.playerReady) {
        try { if (muted) s.player.mute(); else s.player.unMute(); } catch (_) { /* ignore */ }
      }
    } else if (s.video) {
      s.video.muted = !s.video.muted;
      muted = s.video.muted;
    }
    const button = q(s, "[data-vhs-action='mute']");
    if (button) button.setAttribute("aria-pressed", muted ? "true" : "false");
  }

  function setSeek(s, ratio) {
    const slider = q(s, "[data-vhs-seek]");
    if (!slider || slider === document.activeElement) return;
    slider.value = String(Math.round(Math.max(0, Math.min(1, ratio || 0)) * 1000));
  }

  function setSource(s, source, opts) {
    if (source === "local" && !s.localFiles.length) source = "youtube";
    const switching = s.source !== source;
    s.source = source;
    s.root.dataset.mode = source === "local" ? "local" : "catalogue";

    // Changing the tape: the deck ejects and loads again (skipped in boot and
    // under reduced motion; the boot's own first setSource is not a switch).
    if (switching && !bootState && !s.reducedMotion) {
      const screen = q(s, "[data-vhs-screen]");
      if (screen) {
        screen.classList.remove("is-tape-swap");
        void screen.offsetWidth;
        screen.classList.add("is-tape-swap");
        setTimeout(() => { if (live(s)) screen.classList.remove("is-tape-swap"); }, 900);
      }
    }

    const tabs = { youtube: q(s, "[data-vhs-source='youtube']"), local: q(s, "[data-vhs-source='local']") };
    Object.keys(tabs).forEach((key) => {
      if (!tabs[key]) return;
      tabs[key].classList.toggle("is-active", key === source);
      tabs[key].setAttribute("aria-selected", key === source ? "true" : "false");
    });
    q(s, "[data-vhs-catalogue]").hidden = source !== "youtube";
    q(s, "[data-vhs-local]").hidden = source !== "local";

    // One source at a time: never leave the other one playing.
    if (source === "local") {
      pauseYouTube(s);
      ensureGL(s);
      resizeCanvas(s);
      const video = s.video;
      setStatus(s, video && video.src && !video.paused ? "Play" : video && video.src ? "Pause" : "Stop");
      setCounter(s, video && video.src ? video.currentTime : 0);
      const mute = q(s, "[data-vhs-action='mute']");
      if (mute && video) mute.setAttribute("aria-pressed", video.muted ? "true" : "false");
    } else {
      if (s.video && !s.video.paused) s.video.pause();
      ensureYouTube(s);
      setStatus(s, s.ytPlaying ? "Play" : "Stop");
      setCounter(s, 0);
      const mute = q(s, "[data-vhs-action='mute']");
      if (mute) mute.setAttribute("aria-pressed", s.ytMuted ? "true" : "false");
    }

    updateTrackUI(s);
    syncLoop(s);
  }

  /* ------------------------------------------------------------------ *
   * WebGL
   * ------------------------------------------------------------------ */

  function compile(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(log || "Shader compilation failed.");
    }
    return shader;
  }

  function buildProgram(gl) {
    const vs = compile(gl, gl.VERTEX_SHADER, SHADER_VS);
    const fs = compile(gl, gl.FRAGMENT_SHADER, SHADER_FS);
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(log || "Program linking failed.");
    }
    return program;
  }

  function buildGLResources(s) {
    const gl = s.gl;
    s.program = buildProgram(gl);

    s.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, s.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 0, 0,
       1, -1, 1, 0,
      -1,  1, 0, 1,
       1,  1, 1, 1,
    ]), gl.STATIC_DRAW);

    s.vao = gl.createVertexArray();
    gl.bindVertexArray(s.vao);
    const posLoc = gl.getAttribLocation(s.program, "aPosition");
    const uvLoc = gl.getAttribLocation(s.program, "aUV");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(uvLoc);
    gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 16, 8);
    gl.bindVertexArray(null);

    s.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, s.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    const names = ["uTex", "uRes", "uAspect", "uTime", "uIntensity", "uStd", "uPause", "uRoll"];
    s.uniforms = {};
    names.forEach((name) => { s.uniforms[name] = gl.getUniformLocation(s.program, name); });
  }

  function releaseGLResources(s) {
    const gl = s.gl;
    if (!gl) return;
    try {
      if (s.texture) gl.deleteTexture(s.texture);
      if (s.buffer) gl.deleteBuffer(s.buffer);
      if (s.vao) gl.deleteVertexArray(s.vao);
      if (s.program) gl.deleteProgram(s.program);
    } catch (_) { /* context may already be lost */ }
    s.texture = s.buffer = s.vao = s.program = s.uniforms = null;
  }

  function setupGL(s) {
    if (!s.canvas) return false;
    let gl = null;
    try {
      gl = s.canvas.getContext("webgl2", {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
      });
    } catch (_) { gl = null; }
    if (!gl) return false;

    s.gl = gl;
    try {
      buildGLResources(s);
    } catch (error) {
      console.error("[VHS] WebGL init failed:", error);
      releaseGLResources(s);
      s.gl = null;
      return false;
    }
    counters.contexts++;
    return true;
  }

  function ensureGL(s) {
    if (s.glTried) return;
    s.glTried = true;

    s.glOk = setupGL(s);
    if (s.glOk) {
      on(s, s.canvas, "webglcontextlost", (event) => onContextLost(s, event), false);
      on(s, s.canvas, "webglcontextrestored", () => onContextRestored(s), false);
      exitFallback(s);
    } else {
      enterFallback(s);
    }
  }

  function enterFallback(s) {
    s.fallback = true;
    s.root.dataset.gl = "off";
    if (s.video) s.video.controls = true;
    setMessage(s, "WebGL2 unavailable; showing the source video.");
    syncLoop(s);
  }

  function exitFallback(s) {
    s.fallback = false;
    s.root.dataset.gl = "on";
    if (s.video) s.video.controls = false;
    if (s.messageKey === "WebGL2 unavailable; showing the source video.") setMessage(s, "");
    syncLoop(s);
  }

  function onContextLost(s, event) {
    if (!live(s)) return;
    event.preventDefault(); // required, otherwise the context is never restored
    s.contextLost = true;
    enterFallback(s);
  }

  function onContextRestored(s) {
    if (!live(s)) return;
    s.contextLost = false;
    // Objects created before the loss are dead: drop them, do not delete
    // them (deleting on the restored context raises INVALID_OPERATION).
    s.texture = s.buffer = s.vao = s.program = s.uniforms = null;
    try {
      buildGLResources(s);
      s.glOk = true;
      s.forceUpload = true;
      s.dirty = true;
      exitFallback(s);
    } catch (error) {
      console.error("[VHS] WebGL restore failed:", error);
      s.glOk = false;
      enterFallback(s);
    }
  }

  function teardownGL(s) {
    stopLoop(s);
    releaseGLResources(s);
    // NOTE: never loseContext() here. The panel (and its canvas) survive a
    // close — the loader reuses the same DOM on reopen — and a context lost
    // through WEBGL_lose_context can never be revived via getContext(), so
    // the next session would be stuck in fallback forever. An idle context
    // with released resources is cheap enough.
    s.gl = null;
    s.glOk = false;
  }

  function resizeCanvas(s) {
    if (!s.canvas || !s.gl) return;
    const rect = s.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    // Internal resolution follows the broadcast standard (576 / 480 lines),
    // capped by what the screen can actually show. Cheaper and more VHS.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const height = Math.max(120, Math.min(STANDARDS[s.standard].lines, Math.round(rect.height * dpr)));
    const width = Math.max(160, Math.round(height * rect.width / rect.height));

    if (s.canvas.width !== width || s.canvas.height !== height) {
      s.canvas.width = width;
      s.canvas.height = height;
    }
    s.gl.viewport(0, 0, width, height);
    s.dirty = true;
  }

  function uploadFrame(s) {
    const gl = s.gl;
    const video = s.video;
    try {
      gl.bindTexture(gl.TEXTURE_2D, s.texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    } catch (error) {
      // SecurityError = tainted (cross-origin, no CORS) video: unrecoverable.
      console.warn("[VHS] texture upload failed:", error && error.name);
      s.drawFailures += error && error.name === "SecurityError" ? MAX_DRAW_FAILURES : 1;
      return false;
    }
    if (video.videoWidth && video.videoHeight) s.aspect = video.videoWidth / video.videoHeight;
    s.lastT = video.currentTime;
    s.forceUpload = false;
    return true;
  }

  function draw(s, now) {
    const gl = s.gl;
    const u = s.uniforms;
    const playing = isPlaying(s);

    let roll = 0;
    if (!s.reducedMotion && s.rollStart) {
      const k = 1 - (now - s.rollStart) / ROLL_DURATION;
      if (k > 0) roll = k * k;
      else s.rollStart = 0;
    }

    gl.useProgram(s.program);
    gl.bindVertexArray(s.vao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, s.texture);

    gl.uniform1i(u.uTex, 0);
    gl.uniform2f(u.uRes, s.canvas.width, s.canvas.height);
    gl.uniform1f(u.uAspect, s.aspect);
    gl.uniform1f(u.uTime, s.reducedMotion ? 0 : (now - s.t0) / 1000);
    gl.uniform1f(u.uIntensity, effectiveIntensity(s));
    gl.uniform1f(u.uStd, STANDARDS[s.standard].std);
    gl.uniform1f(u.uPause, playing ? 0 : 1);
    gl.uniform1f(u.uRoll, roll);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
    s.lastDraw = now;
    s.dirty = false;
  }

  function frame(s, now) {
    if (!live(s) || !s.raf) return;
    s.raf = requestAnimationFrame((t) => frame(s, t));
    s.frames++;

    const video = s.video;
    if (!s.gl || s.contextLost || !video || video.readyState < 2) return;

    const playing = isPlaying(s);

    // Paused: keep the noise band alive, but at a relaxed rate. With reduced
    // motion the picture is static, so only redraw when something changed.
    if (!playing) {
      if (s.reducedMotion && !s.dirty && !s.forceUpload && !s.rollStart) return;
      if (!s.forceUpload && !s.dirty && now - s.lastDraw < PAUSE_FRAME_INTERVAL) return;
    }

    if (playing || s.forceUpload || video.currentTime !== s.lastT) {
      if (!uploadFrame(s)) {
        if (s.drawFailures >= MAX_DRAW_FAILURES) {
          stopLoop(s);
          enterFallback(s);
        }
        return;
      }
    }

    try {
      draw(s, now);
      s.drawFailures = 0;
    } catch (error) {
      console.error("[VHS] draw failed:", error);
      if (++s.drawFailures >= MAX_DRAW_FAILURES) {
        stopLoop(s);
        enterFallback(s);
      }
    }
  }

  function wantsLoop(s) {
    return live(s) &&
      s.source === "local" &&
      s.glOk && !s.fallback && !s.contextLost &&
      s.rootVisible &&
      document.visibilityState !== "hidden";
  }

  function startLoop(s) {
    if (s.raf) return;
    s.t0 = s.t0 || performance.now();
    s.raf = requestAnimationFrame((t) => frame(s, t));
  }

  function stopLoop(s) {
    if (s.raf) cancelAnimationFrame(s.raf);
    s.raf = 0;
  }

  function syncLoop(s) {
    if (!live(s)) return;
    if (wantsLoop(s)) {
      s.forceUpload = true;
      s.dirty = true;
      startLoop(s);
    } else {
      stopLoop(s);
    }
  }

  /* ------------------------------------------------------------------ *
   * DOM wiring
   * ------------------------------------------------------------------ */

  function wireVideo(s) {
    const video = s.video;
    if (!video) return;

    on(s, video, "play", () => { if (s.source === "local") setStatus(s, "Play"); });
    on(s, video, "playing", () => { if (s.source === "local") setStatus(s, "Play"); });
    on(s, video, "waiting", () => { if (s.source === "local") setStatus(s, "Load"); });
    on(s, video, "pause", () => {
      // Pausing media is part of the scan itself, never a reason to stop it.
      if (s.source === "local" && !video.ended && !s.scanDir) setStatus(s, "Pause");
      s.dirty = true;
    });
    on(s, video, "ended", () => {
      if (s.source !== "local") return;
      setStatus(s, "Stop");
      if (s.localFiles.length > 1) step(s, 1);
    });
    on(s, video, "seeked", () => { s.forceUpload = true; s.dirty = true; });
    on(s, video, "loadedmetadata", () => {
      if (video.videoWidth && video.videoHeight) s.aspect = video.videoWidth / video.videoHeight;
      s.forceUpload = true;
    });
    on(s, video, "timeupdate", () => {
      if (s.source !== "local") return;
      setCounter(s, video.currentTime);
      if (Number.isFinite(video.duration) && video.duration > 0) {
        setSeek(s, video.currentTime / video.duration);
      }
    });
    on(s, video, "error", () => {
      if (s.source !== "local" || !video.getAttribute("src")) return;
      if (s.scanDir) return; // scrubbing past the end reads as an error
      setMessage(s, "The local VHS file could not be played.");
      setStatus(s, "Stop");
    });

    const slider = q(s, "[data-vhs-seek]");
    if (slider) {
      on(s, slider, "input", () => {
        if (Number.isFinite(video.duration) && video.duration > 0) {
          video.currentTime = (Number(slider.value) / 1000) * video.duration;
        }
        if (s.scanDir) stopScan(s);
      });
    }
  }

  function handleAction(s, action) {
    if (action === "prev") nudge(s, -1); // quick tap: rewind 5 s with noise
    else if (action === "next") nudge(s, 1); // quick tap: forward 5 s
    else if (action === "rew") startScan(s, -1); // keydown only: held REW
    else if (action === "ffw") startScan(s, 1); // keydown only: held FFW
    else if (action === "random") randomItem(s);
    else if (action === "play") togglePlay(s);
    else if (action === "mute") toggleMute(s);
    else if (action === "eject") close();
  }

  function onRootClick(s, event) {
    if (s.suppressClick) return; // end of a held REW / FFW scan
    const button = event.target.closest && event.target.closest("button");
    if (!button || !s.root.contains(button)) return;

    if (button.dataset.vhsAction) {
      handleAction(s, button.dataset.vhsAction);
    } else if (button.dataset.vhsSource) {
      setSource(s, button.dataset.vhsSource);
    } else if (button.dataset.vhsTrack !== undefined) {
      selectTrack(s, Number(button.dataset.vhsTrack), true);
    } else if (button.dataset.vhsLocalItem !== undefined) {
      selectLocal(s, Number(button.dataset.vhsLocalItem), true);
    }
  }

  function onRootKeydown(s, event) {
    if (!live(s) || event.defaultPrevented) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return; // never hijack browser shortcuts

    const tag = event.target && event.target.tagName;
    const editable = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" ||
      (event.target && event.target.isContentEditable);
    const interactive = editable || tag === "BUTTON" || tag === "A";
    const key = event.key;

    // Sliders and text fields keep their own arrow / letter keys.
    if (editable) return;

    // Space and Enter on a focused button must keep activating that button.
    if (key === " " || key === "Spacebar") {
      if (interactive) return;
      event.preventDefault();
      togglePlay(s);
    } else if (key === "ArrowLeft") {
      event.preventDefault();
      // Hold to scrub the tape (REW); a quick tap nudges 5 s back with
      // noise (decided in the keyup branch).
      s.scanHeld = true;
      if (!s.scanDir) startScan(s, -1);
    } else if (key === "ArrowRight") {
      event.preventDefault();
      s.scanHeld = true;
      if (!s.scanDir) startScan(s, 1);
    } else if (key === "r" || key === "R") {
      randomItem(s);
    } else if (key === "m" || key === "M") {
      toggleMute(s);
    }
    // Escape is left to the host page: the loader's Baku Boom / BACK owns it.
  }

  function pauseAllMedia(s) {
    if (s.video && !s.video.paused) s.video.pause();
    pauseYouTube(s);
  }

  /* ------------------------------------------------------------------ *
   * Cassette boot: random snow burst, then the tape slides in. Skippable
   * with any key/click; skipped entirely under reduced motion.
   * ------------------------------------------------------------------ */

  let bootState = null; // {done, timer, onDone}

  function endBoot(s, delay) {
    if (bootState && bootState.timer) clearTimeout(bootState.timer);
    if (bootState && bootState.onDone) {
      const fn = bootState.onDone;
      if (delay) bootState.timer = setTimeout(fn, delay);
      else { bootState = null; fn(); }
    } else {
      bootState = null;
    }
    const root = s && s.root;
    if (root) {
      const boot = root.querySelector("[data-vhs-boot]");
      if (boot) {
        boot.classList.add("is-inserting");
        setTimeout(() => { boot.remove(); }, 650);
      }
      root.classList.remove("is-booting");
    }
  }

  function startBoot(s, onDone) {
    if (s.reducedMotion || !s.root) { onDone(); return; }
    const boot = s.root.querySelector("[data-vhs-boot]");
    if (!boot) { onDone(); return; }
    bootState = { done: false, timer: 0, onDone: onDone };
    s.root.classList.add("is-booting");

    // Random snow duration: the deck takes its time to lock on.
    const snowMs = 350 + Math.floor(Math.random() * 850);
    boot.dataset.snow = String(snowMs);
    boot.style.setProperty("--snow-ms", snowMs + "ms");

    const skip = (event) => {
      if (bootState && !bootState.done) endBoot(s, 120);
      else endBoot(s, 0);
    };
    s.root.addEventListener("keydown", skip, { once: true });
    s.root.addEventListener("pointerdown", skip, { once: true });

    bootState.timer = setTimeout(() => endBoot(s, 0), snowMs + 1050);
  }

  function bootStage(s, stage) {
    const boot = s.root && s.root.querySelector("[data-vhs-boot]");
    if (boot) boot.dataset.stage = stage;
  }

  function observe(s) {
    // 1. Root removed from the document (loader closes by hiding nodes).
    if (typeof MutationObserver === "function") {
      const removal = new MutationObserver(() => {
        if (live(s) && !s.root.isConnected) close();
      });
      removal.observe(document.documentElement, { childList: true, subtree: true });
      s.cleanups.push(() => removal.disconnect());

      // 2. Live language switch (the layer i18n rewrites text nodes; the
      //    statuses here are re-rendered from the keys, so they follow too).
      const language = new MutationObserver(() => { if (live(s)) applyI18n(s); });
      language.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
      s.cleanups.push(() => language.disconnect());
    }

    // 3. Screen size changes.
    if (typeof ResizeObserver === "function") {
      const screen = q(s, "[data-vhs-screen]");
      const resize = new ResizeObserver(() => { if (live(s)) resizeCanvas(s); });
      if (screen) resize.observe(screen);
      s.cleanups.push(() => resize.disconnect());
    }

    // 4. Root hidden but not removed (loader hides the layer): stop everything.
    if (typeof IntersectionObserver === "function") {
      const visibility = new IntersectionObserver((entries) => {
        if (!live(s)) return;
        const entry = entries[entries.length - 1];
        const visible = !!entry.isIntersecting;
        if (visible === s.rootVisible) return;
        s.rootVisible = visible;
        if (!visible) pauseAllMedia(s);
        syncLoop(s);
      });
      visibility.observe(s.root);
      s.cleanups.push(() => visibility.disconnect());
    }

    // 5. Tab visibility: no drawing for a hidden tab.
    on(s, document, "visibilitychange", () => syncLoop(s));

    // 6. prefers-reduced-motion, live.
    if (window.matchMedia) {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      const onChange = () => {
        if (!live(s)) return;
        s.reducedMotion = mq.matches;
        s.root.classList.toggle("is-reduced-motion", mq.matches);
        s.dirty = true;
      };
      if (mq.addEventListener) {
        mq.addEventListener("change", onChange);
        s.cleanups.push(() => mq.removeEventListener("change", onChange));
      } else if (mq.addListener) {
        mq.addListener(onChange);
        s.cleanups.push(() => mq.removeListener(onChange));
      }
    }
  }

  /* ------------------------------------------------------------------ *
   * Lifecycle
   * ------------------------------------------------------------------ */

  function readConfig() {
    const c = window.INSERTKOIN_VHS_CONFIG || {};
    const legacy = window.INSERTKOIN_VHS_FILES;
    return {
      standard: c.standard === "NTSC" ? "NTSC" : "PAL",
      source: c.source === "local" || c.source === "youtube" ? c.source : null,
      files: Array.isArray(c.files) ? c.files : (Array.isArray(legacy) ? legacy : []),
      noCookie: c.youtubeNoCookie !== false,
    };
  }

  function init(root) {
    const s = makeState();
    state = s;
    s.root = root;
    s.destroyed = false;

    // The loader watches the panel's visibility but never shows it: like the
    // other panels, the cabinet slides itself in (and back out on close).
    root.classList.add("open");
    root.style.pointerEvents = ""; // close() set it only for the slide-out
    s.opened = true;

    const cfg = readConfig();
    s.standard = cfg.standard;
    s.noCookie = cfg.noCookie;
    s.video = q(s, "[data-vhs-video]");
    s.canvas = q(s, "[data-vhs-canvas]");
    s.reducedMotion = !!(window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    root.classList.toggle("is-reduced-motion", s.reducedMotion);

    // The KG layer is 0x0 with touch-action:none (the canvas games need that).
    // The VHS panel scrolls, so give the layer back its touch panning while the
    // cabinet is open; the stylesheet rule restores it on close.
    const layer = root.closest ? root.closest(".kg-layer") : null;
    if (layer && !layer.style.touchAction) {
      layer.style.touchAction = "auto";
      s.layerTouch = layer;
    }

    normaliseTracks(s);
    normaliseFiles(s, cfg.files);
    renderLists(s);

    applyI18n(s);

    on(s, root, "click", (event) => onRootClick(s, event));
    on(s, root, "keydown", (event) => onRootKeydown(s, event));

    // Releasing a held arrow stops the picture search. A quick tap falls
    // back to the classic behaviour: jump to the previous / next track.
    on(s, root, "keyup", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      if (!s.scanHeld) return;
      s.scanHeld = false;
      const dir = s.scanDir;
      const heldLong = dir && performance.now() - (s.scanStartT || 0) > 350;
      if (dir) stopScan(s);
      if (dir && !heldLong) nudge(s, dir); // quick tap: tape nudge ±5 s
    });

    // Hold the deck's REW / FFW buttons for a picture search; a quick
    // tap nudges the tape ±5 s with a burst of noise.
    // REW / FFW: a tap nudges ±5 s; keeping the button held keeps pulling
    // the tape in the same direction (another 5 s, then 10, 10, 15…), the
    // noise shielding the jumps — like a deck that rewinds faster while
    // you hold the key down.
    ["prev", "next"].forEach((name) => {
      const button = q(s, "[data-vhs-action='" + name + "']");
      if (!button) return;
      const scanDir = name === "prev" ? -1 : 1;
      s.holdNudge = s.holdNudge || {};
      const hold = s.holdNudge;
      hold[scanDir] = { step: 5, repeat: 0, timer: 0, pull: 0, wasHolding: false };
      const stopHold = () => {
        const h = hold[scanDir];
        if (h.timer) { clearTimeout(h.timer); h.timer = 0; }
        if (h.pull) { clearInterval(h.pull); h.pull = 0; }
        h.step = 5; h.repeat = 0;
      };
      const release = () => {
        const h = hold[scanDir];
        const held = h.wasHolding;
        stopHold();
        h.wasHolding = false;
        if (held) {
          // End of a hold: swallow the click so the finger lift does not
          // add one spurious extra nudge on top of the pulled tape.
          s.suppressClick = true;
          setTimeout(() => { s.suppressClick = false; }, 0);
        } else if (s.scanDir === scanDir) {
          stopScan(s);
          s.suppressClick = true;
          setTimeout(() => { s.suppressClick = false; }, 0);
        }
      };
      on(s, button, "pointerdown", () => {
        const h = hold[scanDir];
        if (h.timer || h.pull) return; // already holding
        // Fast pull reactive on double-click or on third tap.
        h.timer = setTimeout(() => {
          h.timer = 0;
          // Key still down after 900 ms: keep pulling the tape.
          h.wasHolding = true;
          nudge(s, scanDir, h.step);
          h.pull = setInterval(() => {
            if (h.repeat % 2 === 1) h.step = Math.min(30, h.step + 5);
            h.repeat++;
            nudge(s, scanDir, h.step);
          }, 700);
        }, 900);
      });
      on(s, button, "pointerup", release);
      on(s, button, "pointerleave", release);
      on(s, button, "pointercancel", release);
    });
    wireVideo(s);
    observe(s);

    // Files-first when masters exist (they are the only ones that get the
    // VHS treatment); otherwise the catalogue.
    const initial = cfg.source || (s.localFiles.length ? "local" : "youtube");
    setSource(s, initial);

    // Cassette boot: random snow burst, then the tape slides in. The panels
    // underneath stay usable: the overlay only covers the screen area.
    startBoot(s, () => {});

    try { root.focus({ preventScroll: true }); } catch (_) { /* ignore */ }
    window.dispatchEvent(new CustomEvent("kg-vhs:open"));
  }

  function tryOpen() {
    const root = document.querySelector(ROOT_SELECTOR);
    if (!root) return false;
    // The loader re-runs the entry on every open: restart cleanly so a
    // reopen always replays the intro with fresh state.
    if (!state.destroyed) close();
    init(root);
    return true;
  }

  function open() {
    cancelAnimationFrame(retryRaf);
    if (tryOpen()) return true;

    // The loader may call us a tick before the fragment is in the DOM.
    let tries = 0;
    const tick = () => {
      if (tryOpen() || ++tries > 120) return;
      retryRaf = requestAnimationFrame(tick);
    };
    retryRaf = requestAnimationFrame(tick);
    return false;
  }

  function close() {
    cancelAnimationFrame(retryRaf);
    const s = state;
    if (s.destroyed) return;
    if (bootState) { clearTimeout(bootState.timer); bootState = null; }
    if (s.scanTimer) { clearTimeout(s.scanTimer); s.scanTimer = 0; }
    if (s.nudgeTimer) { clearTimeout(s.nudgeTimer); s.nudgeTimer = 0; }
    if (s.holdNudge) { Object.values(s.holdNudge).forEach((h) => { if (h.timer) clearTimeout(h.timer); if (h.pull) clearInterval(h.pull); }); }
    s.scanDir = 0;
    s.scanHeld = false;
    s.destroyed = true;

    if (s.root && s.root.classList) {
      s.root.classList.remove("open"); // slide back out (CSS transition)
      s.root.style.pointerEvents = "none"; // nothing clickable during the slide
    }

    // Last VHS roll on the way out (never under reduced motion).
    if (!s.reducedMotion && s.glOk && !s.fallback && s.rollStart === 0) {
      s.rollStart = performance.now();
    }
    window.dispatchEvent(new CustomEvent("kg-vhs:eject"));

    stopLoop(s);
    s.cleanups.splice(0).forEach((fn) => { try { fn(); } catch (_) { /* ignore */ } });
    destroyPlayer(s);

    if (s.video) {
      try { s.video.pause(); } catch (_) { /* ignore */ }
      s.video.removeAttribute("src");
      try { s.video.load(); } catch (_) { /* ignore */ }
    }

    teardownGL(s);
    if (s.layerTouch) {
      s.layerTouch.style.touchAction = "";
      s.layerTouch = null;
    }
    state = makeState();
    window.dispatchEvent(new CustomEvent("kg-vhs:close"));
  }

  function debug() {
    const s = state;
    return {
      version: VERSION,
      open: !s.destroyed,
      source: s.source,
      standard: s.standard,
      speed: s.speed,
      status: s.status,
      gl: !!s.gl,
      glOk: s.glOk,
      fallback: s.fallback,
      contextLost: s.contextLost,
      loop: !!s.raf,
      frames: s.frames,
      player: !!s.player,
      playerReady: s.playerReady,
      tracks: s.tracks.length,
      localFiles: s.localFiles.length,
      localIndex: s.localIndex,
      trackIndex: s.trackIndex,
      intensity: s.destroyed ? null : effectiveIntensity(s),
      reducedMotion: s.reducedMotion,
      rootVisible: s.rootVisible,
      playersCreatedTotal: counters.players,
      contextsCreatedTotal: counters.contexts,
      apiScripts: document.querySelectorAll('script[src="' + YT_API + '"]').length,
      message: s.messageKey,
    };
  }

  /* Re-read the catalogue (readTracks) and rebuild the tracklist — used by
     the cassette library (kg-vhs-recorder.js) after a tape is selected or a
     recording completes. Does not autoplay: the deck keeps its Stop state. */
  function refreshTracks() {
    const s = state;
    if (s.destroyed) return -1;
    normaliseTracks(s);
    renderLists(s);
    s.trackIndex = 0;
    updateTrackUI(s);
    setCounter(s, 0);
    return s.tracks.length;
  }

  // Cassette-library bridge: load (and play) the track whose video id we know,
  // without touching the deck's own selection state otherwise.
  function playByVideoId(videoId) {
    const s = state;
    if (s.destroyed || !videoId) return -1;
    const idx = s.tracks.findIndex((t) => String(t.id) === String(videoId));
    if (idx < 0) return -1;
    selectTrack(s, idx, true);
    return idx;
  }

  window.KGVHS = { open, close, refreshTracks, playByVideoId, debug, version: VERSION };

  // Compatibility with the loader contract.
  window.kgVhsOpen = open;
  window.kgVhsClose = close;
})();
