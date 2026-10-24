/*
 * Code: MIT licence, Copyright (c) 2026 Mauk Tenieb (see LICENSE).
 * Korhogo material: Copyright © Mauk Tenieb & Korhogo, all rights reserved. Korhogo™,
 * Korhogo Fauna™, Fauna Masks™, Fauna Chess™, Faunarratik™, Katabatik™, Insert Koin™,
 * Korong!™ and any related material — characters, names, symbols, rules, lore, texts,
 * images and music, in any form or medium, including inside this file — stay out of the
 * MIT licence and remain the property of the author. No use of that material for
 * training artificial intelligence. Contact: mauktenieb@gmail.com
 */
/*
 * Écran — the one screen of Insert Koin. v2.0.0
 *
 * One screen for every program: the same 4:3 picture, the same size, the same place
 * in the program's view, the same frame. Only two things change from one program to
 * the next: the rendering of the glass (a profile: VHS tape wear, the Minitel's
 * bulging tube with its reflection and phosphor, the clean viewfinder of the camera,
 * the camcorder's REC and counter, a plain glass…) and the surroundings, which the
 * program lays in the controls slot (the deck of the VHS, the keyboard of the
 * Minitel, the modes, shutter, looks and settings of Photofauna).
 *
 * Layout (IKEcran.layout): the program view is a box (an <iframe>'s window, or the
 * panel of a KG module laid over the calque: both fill the same frame of the site,
 * under its bar). IKEcran.geometry(width, height) gives the rectangles in it:
 *  - wide view (width >= 700 and width >= height): the screen on the left, as large
 *    as the height allows; the controls on the right, 300 to 460 px wide (30 %);
 *  - narrow view (phone, portrait tablet): the screen on top, full width; the
 *    controls below, scrolling.
 * The numbers are whole pixels and depend on the box alone, so two programs shown in
 * the same frame put their screen on the very same pixels.
 *
 * Rendering (IKEcran.mount), two modes chosen by the source:
 *  - GL: a <canvas>, <video> or <img> source goes through one WebGL2 pass drawn on
 *    a canvas laid over it (the VHS shader of kg-vhs.js v2.2.0, generalised: with
 *    the "vhs" profile it computes the same picture).
 *  - DOM: no source (a DOM program, a cross-origin frame such as YouTube): CSS
 *    layers and a small grain canvas over the content, plus a CSS filter on the
 *    elements named in `content`.
 *
 * The screen is dressing only. The module draws on its own layers (all marked
 * data-ike-dress) and never writes into the source: a program's saved images stay
 * clean. A program that means to record the dressed screen calls handle.snapshot().
 *
 * Levels: FX OFF (the arcade switch, window.__ikFx or localStorage "ik.fx") and
 * prefers-reduced-motion give "calm": the look stays, the motion stops (frozen
 * noise, no tracking band, no roll, no flicker, no blinking). A phone gives "lite":
 * lower internal resolution, no phosphor mask, no bloom, no backdrop-filter bands,
 * slower grain. `?ecran=full|lite|calm` in the address, or IKEcran.force(), sets it.
 *
 * Public API (window.IKEcran):
 *   IKEcran.layout(root, opts) -> layout      root: element or selector, the program view
 *     opts.screen    the element that becomes the screen (placed on the screen rectangle)
 *     opts.controls  the element that becomes the controls slot
 *     opts.onlayout  function(geometry), after every placement
 *   layout.update() layout.geometry -> { mode: "wide"|"narrow", frame, screen, controls } layout.destroy()
 *   IKEcran.geometry(width, height) -> the same rectangles, {x, y, w, h} each, in the view
 *   IKEcran.mount(screen, opts) -> handle     screen: element or selector, the box of the picture
 *     opts.program   "vhs" | "terminal" | "photo" | "kapture" | "korong" | "katabatik" | "chess" | …
 *     opts.profile   profile name or object (wins over program)
 *     opts.source    canvas | video | img | null      (null: DOM mode)
 *     opts.canvas    an existing canvas for the GL output (default: one is created)
 *     opts.fit       "contain" (default for video/img) | "fill" (default for canvas)
 *     opts.content   element or selector inside screen: gets the DOM-mode filter and wobble
 *     opts.z         z-index of the glass, marks and OSD (default 7)
 *     opts.zUnder    z-index of the scanlines, mask, grain and bands (default: z)
 *     opts.lines     cap on the internal line count (GL)
 *     opts.state     function returning per-frame params ({ pause, intensity, std })
 *     opts.onfallback function(off): GL lost (true) or back (false)
 *   handle.setSource(src) handle.set(params) handle.osd({ rec, counter, text })
 *   handle.pulse("roll" | "wobble") handle.resize() handle.snapshot() -> canvas | null
 *   handle.sleep() handle.wake() handle.destroy() handle.debug()
 *   IKEcran.profiles, IKEcran.programs, IKEcran.level(), IKEcran.force(level|null), IKEcran.get(screen)
 *
 * Programs:
 *   VHS (kg-vhs.*): layout(#vhs, { screen: .vhs-screen, controls: .vhs-shell }), profile "vhs".
 *   Photofauna (fotofauna.html, same folder): loads ik-ecran.js when served (not from file://);
 *     #stage becomes the screen, the camera keys, shutter, looks, settings and FaunAI the
 *     controls; profile "photo" (gl: null: the pixels stay as Photofauna draws them), and
 *     "camescope" while a video plays (REC, counter). Without ik-ecran.js it keeps its own page.
 *   3615 (3615-local.html here; the 3615 repository at /3615/ can load /insertkoin/ik-ecran.js):
 *     the Videotex page is the screen, the keyboard the controls; profile "minitel".
 *   Kapture (kg-kapture.*): the live view is the screen, the shutter keys the controls.
 *
 * Third-party code: none. YIQ matrices: standard NTSC constants; integer hash:
 * MurmurHash3 32-bit finalizer (public domain).
 */
(() => {
  "use strict";
  if (window.IKEcran) return;

  const VERSION = "2.0.0";
  const ROLL_DURATION = 700;

  /* ------------------------------------------------------------------ *
   * Profiles. gl: null keeps the source untouched (overlay only).
   * ------------------------------------------------------------------ */

  const GL_BASE = {
    curve: 0, corner: [0.5, 0.5, 0], tape: 0, k: 0, chroma: 0, std: 0,
    scan: 0, lines: 480, mask: 0, maskType: 0, bloom: 0, vig: 0, vigK: 3.4,
    sat: 1, con: 1, bri: 1, gamma: 1, tint: [1, 1, 1], mono: 0, levels: 0,
    flicker: 0, noise: 0, jitter: 0, calmK: 1, pauseFps: 24, cap: 900,
  };
  const DOM_BASE = {
    filter: "none", scan: "", scanO: 1, mask: "", maskO: 0, grain: 0, snow: 0,
    band: false, head: false, wobble: 0, marks: false, thirds: false,
  };
  const GLASS_BASE = { hi: 0.04, hiAt: "30% 10%", hiShape: "120% 90%", sheen: 0, vig: 0.3, vigFrom: "60%", inset: 24, insetA: 0.5 };

  const P = {
    // The VHS television (kg-vhs). gl = the v2.2.0 shader values, dom = the former tape wear.
    vhs: {
      tube: "4% / 5%",
      gl: { curve: 0.22, corner: [0.488, 0.482, 0.012], tape: 1, k: 0.18, chroma: 1, vig: 0.4, vigK: 3.4, calmK: 0.55, cap: 576 },
      dom: {
        filter: "saturate(.78) contrast(1.08) brightness(1.03) blur(.45px) sepia(.06)",
        scan: "rgba(0,0,0,.22) 0 1px, transparent 1px 3px", grain: 0.07, snow: 0.55,
        band: true, head: true, wobble: 0.003,
      },
      glass: { hi: 0.07, hiAt: "30% 10%", hiShape: "120% 90%", vig: 0.55, vigFrom: "58%", inset: 40, insetA: 0.7 },
    },
    // The Minitel of the 3615: a bulging tube (round corners, dark rim, a reflection on the
    // curve of the glass), one phosphor in eight levels, a visible raster, a halo.
    minitel: {
      tube: "9% / 12%",
      gl: { curve: 0.42, corner: [0.474, 0.466, 0.05], scan: 0.55, lines: 250, bloom: 0.55, vig: 0.5, vigK: 2.6,
            mono: 1, levels: 8, tint: [0.86, 1.0, 0.89], con: 1.08, flicker: 0.035, noise: 0.018, cap: 1000 },
      dom: {
        filter: "drop-shadow(0 0 2.5px rgba(170,255,190,.42)) contrast(1.05)",
        scan: "rgba(0,0,0,.30) 0 2px, transparent 2px 4px", grain: 0.035,
      },
      glass: { hi: 0.14, hiAt: "30% 14%", hiShape: "80% 60%", sheen: 0.045, vig: 0.78, vigFrom: "50%", inset: 70, insetA: 0.85 },
    },
    // Photo viewfinder (Photofauna, Kapture): the picture as it is, sharp, with discreet framing marks.
    photo: {
      tube: "0",
      gl: null,
      dom: { marks: true },
      glass: { hi: 0.02, hiAt: "20% 0%", hiShape: "140% 60%", vig: 0, vigFrom: "70%", inset: 6, insetA: 0.35 },
    },
    // Camcorder viewfinder: REC and counter, light lines, a little tape.
    camescope: {
      tube: "2% / 3%", osd: { rec: true, counter: "auto" },
      gl: { curve: 0.06, corner: [0.492, 0.488, 0.01], tape: 1, k: 0.07, chroma: 0.6, scan: 0.18, lines: 480,
            bloom: 0.15, vig: 0.35, sat: 0.92, con: 1.04, calmK: 0.6 },
      dom: {
        filter: "saturate(.92) contrast(1.05)", scan: "rgba(0,0,0,.12) 0 1px, transparent 1px 3px",
        grain: 0.05, head: true,
      },
      glass: { hi: 0.05, vig: 0.4, vigFrom: "62%", inset: 26, insetA: 0.6 },
    },
    // Korong!: a colour monitor of 1988, the years of Shufflepuck Café.
    korong: {
      tube: "4% / 5%",
      gl: { curve: 0.12, corner: [0.486, 0.481, 0.02], scan: 0.3, lines: 343, mask: 0.22, maskType: 2, bloom: 0.25,
            vig: 0.35, sat: 1.05 },
      dom: {
        scan: "rgba(0,0,0,.16) 0 1px, transparent 1px 3px",
        mask: "repeating-linear-gradient(90deg,rgba(255,60,60,.9) 0 1px,rgba(60,255,60,.9) 1px 2px,rgba(60,60,255,.9) 2px 3px)", maskO: 0.08,
      },
      glass: { hi: 0.06, vig: 0.42, vigFrom: "60%", inset: 34, insetA: 0.6 },
    },
    // Katabatik and FaunInvaders: an arcade tube, aperture grille, bright bloom.
    arcade: {
      tube: "4% / 5%",
      gl: { curve: 0.16, corner: [0.486, 0.48, 0.03], scan: 0.45, lines: 320, mask: 0.32, maskType: 1, bloom: 0.45,
            vig: 0.45, sat: 1.1, con: 1.08 },
      dom: {
        filter: "saturate(1.08) contrast(1.04)", scan: "rgba(0,0,0,.2) 0 1px, transparent 1px 3px",
        mask: "repeating-linear-gradient(90deg,rgba(255,60,60,.9) 0 1px,rgba(60,255,60,.9) 1px 2px,rgba(60,60,255,.9) 2px 3px)", maskO: 0.1,
      },
      glass: { hi: 0.06, vig: 0.5, vigFrom: "56%", inset: 40, insetA: 0.65 },
    },
    // Skoporhogo: the room watched through a monitor, camera and clock on screen.
    skopo: {
      tube: "2% / 3%", osd: { text: "CAM 01", clock: true },
      gl: { curve: 0.1, corner: [0.488, 0.484, 0.016], scan: 0.25, lines: 480, noise: 0.035, jitter: 0.5,
            flicker: 0.03, bloom: 0.1, vig: 0.45, sat: 0.8, con: 1.1 },
      dom: { filter: "saturate(.85) contrast(1.06)", scan: "rgba(0,0,0,.14) 0 1px, transparent 1px 3px", grain: 0.06 },
      glass: { hi: 0.05, vig: 0.5, vigFrom: "58%", inset: 34, insetA: 0.6 },
    },
    // Plain programs: a plain glass.
    neutre: {
      tube: "0",
      gl: null,
      dom: {},
      glass: { hi: 0.025, vig: 0.22, vigFrom: "65%", inset: 18, insetA: 0.4 },
    },
  };

  const PROGRAMS = {
    vhs: "vhs",
    terminal: "minitel", kal: "minitel", "3615": "minitel",
    photo: "photo", photofauna: "photo", kapture: "photo",
    camescope: "camescope",
    puck: "korong", korong: "korong",
    katabatik: "arcade", faunInvaders: "arcade",
    skopo: "skopo", skoporhogo: "skopo",
    chess: "neutre", erratic: "neutre", faunarratics: "neutre",
    tor: "neutre", faunator: "neutre", repo: "neutre", reporhogo: "neutre", visit: "neutre",
  };

  function resolveProfile(opts) {
    let p = opts.profile;
    let name = typeof p === "string" ? p : "";
    if (!p) name = PROGRAMS[opts.program] || "neutre";
    if (typeof p === "string" || !p) p = P[name] || P.neutre;
    else name = p.name || "custom";
    return {
      name,
      tube: p.tube || "0",
      osd: Object.assign({}, p.osd || {}),
      gl: p.gl ? Object.assign({}, GL_BASE, p.gl) : null,
      dom: Object.assign({}, DOM_BASE, p.dom || {}),
      glass: Object.assign({}, GLASS_BASE, p.glass || {}),
    };
  }

  /* ------------------------------------------------------------------ *
   * Level: calm (FX OFF, reduced motion), lite (phones).
   * ------------------------------------------------------------------ */

  let forced = null;
  try {
    const q = new URLSearchParams(location.search).get("ecran");
    if (q === "full" || q === "lite" || q === "calm") forced = q;
  } catch (_) { /* ignore */ }

  function fxOn() {
    const read = (w) => { try { return w && w.__ikFx && typeof w.__ikFx.on === "function" ? !!w.__ikFx.on() : null; } catch (_) { return null; } };
    let v = read(window);
    if (v === null && window.parent !== window) v = read(window.parent);
    if (v !== null) return v;
    try { return localStorage.getItem("ik.fx") !== "off"; } catch (_) { return true; }
  }
  const mq = (s) => { try { return window.matchMedia(s).matches; } catch (_) { return false; } };
  function flags() {
    if (forced === "full") return { calm: false, lite: false };
    if (forced === "lite") return { calm: false, lite: true };
    if (forced === "calm") return { calm: true, lite: false };
    const small = Math.min(screen.width || 9999, screen.height || 9999) < 600;
    return { calm: !fxOn() || mq("(prefers-reduced-motion: reduce)"), lite: mq("(pointer: coarse)") || small };
  }
  let LV = flags();
  function levelName() { return LV.calm ? (LV.lite ? "calm lite" : "calm") : (LV.lite ? "lite" : "full"); }

  /* ------------------------------------------------------------------ *
   * CSS (injected once)
   * ------------------------------------------------------------------ */

  const CSS = `
.ike-screen{overflow:hidden;border-radius:3px;isolation:isolate;background:#000}
.ike-fx{position:absolute;inset:0;pointer-events:none;overflow:hidden;border-radius:inherit}
.ike-fx>*{position:absolute;inset:0;pointer-events:none;z-index:var(--ike-z,7)}
.ike-fx>.ike-u{z-index:var(--ike-z-under,var(--ike-z,7))}
.ike-gl{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none}
.ike-mode-dom .ike-content{filter:var(--ike-filter,none)}
.ike-scan{background:repeating-linear-gradient(0deg,var(--ike-scan));opacity:var(--ike-scan-o,1)}
.ike-mask{background:var(--ike-mask);opacity:var(--ike-mask-o,0);mix-blend-mode:multiply}
.ike-grain{width:100%;height:100%;opacity:var(--ike-grain,0);mix-blend-mode:screen;transition:opacity .4s}
.ike-snow .ike-grain{opacity:var(--ike-snow,.55)}
.ike-band{inset:auto 0 auto 0;height:7%;top:105%;
  backdrop-filter:blur(1.6px) saturate(1.7) brightness(1.18);-webkit-backdrop-filter:blur(1.6px) saturate(1.7) brightness(1.18);
  background:repeating-linear-gradient(0deg,rgba(255,255,255,.10) 0 1px,transparent 1px 4px);animation:ike-band 47s linear infinite}
@keyframes ike-band{0%,95%{top:105%}100%{top:-10%}}
.ike-head{inset:auto 0 0 0;height:3.2%;
  backdrop-filter:blur(2.2px) hue-rotate(-14deg) brightness(1.2);-webkit-backdrop-filter:blur(2.2px) hue-rotate(-14deg) brightness(1.2);
  background:repeating-linear-gradient(0deg,rgba(255,255,255,.18) 0 1px,rgba(0,0,0,.25) 1px 2px)}
.ike-glass{border-radius:var(--ike-tube,0);
  background:radial-gradient(var(--ike-hi-shape,120% 90%) at var(--ike-hi-at,30% 10%),rgba(255,255,255,var(--ike-hi,.05)),transparent 45%),
    linear-gradient(158deg,transparent 52%,rgba(255,255,255,var(--ike-sheen,0)) 60%,transparent 70%),
    radial-gradient(ellipse at center,transparent var(--ike-vig-from,60%),rgba(0,0,0,var(--ike-vig,.3)) 100%);
  box-shadow:0 0 0 60vmax #000,inset 0 0 var(--ike-inset,24px) rgba(0,0,0,var(--ike-inset-a,.5))}
.ike-marks{inset:5%;--m:rgba(255,255,255,.5);
  background:linear-gradient(var(--m),var(--m)) 0 0/16px 1px,linear-gradient(var(--m),var(--m)) 0 0/1px 16px,
    linear-gradient(var(--m),var(--m)) 100% 0/16px 1px,linear-gradient(var(--m),var(--m)) 100% 0/1px 16px,
    linear-gradient(var(--m),var(--m)) 0 100%/16px 1px,linear-gradient(var(--m),var(--m)) 0 100%/1px 16px,
    linear-gradient(var(--m),var(--m)) 100% 100%/16px 1px,linear-gradient(var(--m),var(--m)) 100% 100%/1px 16px;
  background-repeat:no-repeat;filter:drop-shadow(0 0 1px rgba(0,0,0,.8))}
.ike-marks::after{content:"";position:absolute;left:50%;top:50%;width:10px;height:10px;transform:translate(-50%,-50%);
  background:linear-gradient(var(--m),var(--m)) center/10px 1px no-repeat,linear-gradient(var(--m),var(--m)) center/1px 10px no-repeat}
.ike-thirds{--t:rgba(255,255,255,.16);
  background:linear-gradient(90deg,transparent calc(33.333% - .5px),var(--t) calc(33.333% - .5px) calc(33.333% + .5px),transparent calc(33.333% + .5px) calc(66.666% - .5px),var(--t) calc(66.666% - .5px) calc(66.666% + .5px),transparent calc(66.666% + .5px)),
    linear-gradient(0deg,transparent calc(33.333% - .5px),var(--t) calc(33.333% - .5px) calc(33.333% + .5px),transparent calc(33.333% + .5px) calc(66.666% - .5px),var(--t) calc(66.666% - .5px) calc(66.666% + .5px),transparent calc(66.666% + .5px))}
.ike-osd{inset:0;font:400 clamp(10px,2.2vmin,15px)/1 "DM Mono",ui-monospace,monospace;letter-spacing:.12em;color:#f4f1ea;
  text-shadow:0 0 2px rgba(0,0,0,.9),1px 1px 0 rgba(0,0,0,.7)}
.ike-osd>span{position:absolute;white-space:nowrap}
.ike-rec{left:5.5%;top:6%}
.ike-rec::before{content:"";display:inline-block;width:.7em;height:.7em;margin-right:.45em;border-radius:50%;background:#ff2a1a;
  box-shadow:0 0 6px #ff2a1a;vertical-align:-.05em;animation:ike-blink 1s steps(1) infinite}
@keyframes ike-blink{50%{opacity:0}}
.ike-count{right:5.5%;top:6%}
.ike-text{left:5.5%;bottom:6%}
.ike-clock{right:5.5%;bottom:6%}
.ike-mode-gl .ike-scan,.ike-mode-gl .ike-mask,.ike-mode-gl .ike-grain,.ike-mode-gl .ike-band,.ike-mode-gl .ike-head{display:none}
.ike-calm .ike-band,.ike-lite .ike-band,.ike-lite .ike-head,.ike-lite .ike-mask{display:none}
.ike-calm .ike-rec::before{animation:none}
.ike-content.ike-wobble{animation:ike-wobble .18s steps(3) 1}
@keyframes ike-wobble{33%{transform:translateX(-2px)}66%{transform:translateX(1.5px)}}
@media (prefers-reduced-motion:reduce){.ike-band{animation:none;display:none}.ike-rec::before{animation:none}.ike-content.ike-wobble{animation:none}}

/* the layout: one frame, one screen rectangle, one controls slot, the same for every program */
.ike-prog{overflow:hidden}
.ike-prog>.ike-frame{position:absolute;z-index:0;pointer-events:none;border-radius:10px;box-sizing:border-box;
  background:radial-gradient(120% 60% at 50% 0%,rgba(255,255,255,.045),transparent 60%),linear-gradient(180deg,#1c1a17,#100f0d);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.07),inset 0 0 0 1px rgba(201,168,76,.2),0 14px 34px rgba(0,0,0,.55)}
.ike-prog[data-ike-layout="narrow"]>.ike-frame{border-radius:8px}
.ike-prog>.ike-slot-screen{box-sizing:border-box;z-index:1;
  box-shadow:0 0 0 1px #000,0 0 0 2px rgba(255,255,255,.045),inset 0 0 0 1px rgba(0,0,0,.6)}
.ike-prog>.ike-slot-controls{box-sizing:border-box;z-index:1;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain}
`;
  function injectCss(doc) {
    if (doc.getElementById("ike-css")) return;
    const st = doc.createElement("style");
    st.id = "ike-css";
    st.textContent = CSS;
    (doc.head || doc.documentElement).appendChild(st);
  }

  /* ------------------------------------------------------------------ *
   * Shader (GLSL ES 3.00). With the "vhs" profile the uniforms reproduce
   * kg-vhs.js v2.2.0 term for term; the other terms stay at zero there.
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
    uniform float uAspect;     // source width / height
    uniform float uFill;       // 1: stretch to the screen, 0: letterbox
    uniform float uTime;       // seconds; 0 when calm
    uniform float uIntensity;  // tape wear k
    uniform float uStd;        // 0 = PAL, 1 = NTSC
    uniform float uPause;      // 1 when the picture is frozen
    uniform float uRoll;       // 0..1 vertical-hold slip
    uniform float uCurve;      // barrel curvature
    uniform vec3  uCorner;     // tube half-size (xy) and corner radius (z)
    uniform float uTape;       // 1: tape displacement, noise, tracking, dropouts
    uniform float uChroma;     // chroma bleed and delay (1 = VHS)
    uniform float uScan;       // beam scanline depth
    uniform float uLines;      // beam lines over the picture
    uniform float uMask;       // phosphor mask depth
    uniform float uMaskType;   // 1 aperture grille, 2 shadow mask, 3 LCD
    uniform float uBloom;      // halo
    uniform float uVig;        // vignette depth
    uniform float uVigK;       // vignette reach
    uniform vec4  uTone;       // saturation, contrast, brightness, gamma
    uniform vec3  uTint;       // phosphor colour (mono)
    uniform float uMono;       // 1: one phosphor
    uniform float uLevels;     // quantised levels (0 = off)
    uniform float uFlicker;
    uniform float uNoise;
    uniform float uJitter;

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
      const vec3 LUM = vec3(0.299, 0.587, 0.114);

      // --- Tube curvature + rounded mask.
      vec2 c2 = vUV - 0.5;
      vec2 curved = 0.5 + c2 * (1.0 + uCurve * dot(c2, c2));
      vec2 q2 = abs(c2) - uCorner.xy;
      float corner = length(max(q2, 0.0)) + min(max(q2.x, q2.y), 0.0) - uCorner.z;
      if (corner > 0.0) { outColor = vec4(0.0, 0.0, 0.0, 1.0); return; }

      // --- Fit the picture into the screen.
      float canvasAspect = uRes.x / uRes.y;
      vec2 sc = vec2(1.0);
      if (uFill < 0.5) {
        if (uAspect > canvasAspect) sc.y = canvasAspect / uAspect;
        else                        sc.x = uAspect / canvasAspect;
      }
      vec2 p = (curved - 0.5) / sc + 0.5;
      if (p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0) {
        outColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
      }

      float line = floor(vUV.y * uRes.y);
      float t25  = floor(uTime * 25.0);

      // --- Vertical-hold roll (applied before sampling).
      float seam = 1.0;
      if (uRoll > 0.001) {
        float seamDist = abs(p.y - (1.0 - uRoll));
        seam = mix(0.15, 1.0, smoothstep(0.0, 0.04, seamDist));
        p.y = fract(p.y + uRoll);
      }

      // --- Horizontal line displacement (picture-width units).
      float dx = 0.0;
      float band = 0.0;
      float bandC = 0.0;
      if (uTape > 0.5) {
        dx = (rnd(line, t25, 1.0) - 0.5) * 0.009 * k;
        // Tracking band drifting upwards.
        bandC = fract(uTime * 0.035 + 0.35);
        band  = smoothstep(0.07, 0.0, abs(p.y - bandC)) * smoothstep(0.84, 0.88, fract(uTime * 0.021)) * (1.0 - smoothstep(0.97, 1.0, fract(uTime * 0.021)));
        dx += (rnd(line, t25, 2.0) - 0.5) * 0.05 * band * k;
        dx += band * 0.02 * k * sin(p.y * 80.0 + uTime * 5.0);
        // Head-switching skew at the bottom of the picture.
        float hs = smoothstep(0.05, 0.0, p.y);
        dx += hs * hs * 0.07 * k + hs * (rnd(line, t25, 3.0) - 0.5) * 0.02 * k;
      }
      dx += (rnd(line, t25, 9.0)  - 0.5) * 0.03  * uRoll;
      dx += (rnd(line, t25, 10.0) - 0.5) * 0.004 * uPause;
      dx += (rnd(line, t25, 31.0) - 0.5) * 0.004 * uJitter;

      vec3 col;
      if (uChroma > 0.0) {
        // Luma slightly soft; chroma delayed and much blurrier (triangular kernel).
        float ld = 0.0008 + 0.0016 * k;
        float yy = 0.50 * fetchYiq(vec2(p.x + dx,      p.y)).x
                 + 0.25 * fetchYiq(vec2(p.x + dx - ld, p.y)).x
                 + 0.25 * fetchYiq(vec2(p.x + dx + ld, p.y)).x;
        float cShift = mix(0.0018, 0.0034, uStd) * (0.6 + 2.0 * k) * uChroma;
        float cStep  = (0.0026 + 0.004 * k) * uChroma;
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
        col = yiqToRgb(vec3(yy, iq));
      } else {
        col = textureLod(uTex, vec2(p.x + dx, p.y), 0.0).rgb;
      }

      // --- Halo: light spills around bright areas.
      if (uBloom > 0.0) {
        vec3 b = vec3(0.0);
        for (int i = 0; i < 8; i++) {
          float a = float(i) * 0.785398;
          vec2 o = vec2(cos(a), sin(a) * canvasAspect);
          b += textureLod(uTex, p + o * 0.005, 0.0).rgb;
          b += textureLod(uTex, p + o * 0.011, 0.0).rgb;
        }
        b /= 16.0;
        col += max(b - 0.42, 0.0) * uBloom * 1.5 + b * uBloom * 0.10;
      }

      float gx = floor(vUV.x * uRes.x * 0.5);
      if (uTape > 0.5) {
        // Tape noise, smeared horizontally like FM noise.
        col += (rnd(gx, line, t25 + 11.0) - 0.5) * 0.22 * k;
        // Helical scan: the noise follows the diagonal tracks.
        float slant = p.x * 0.10 + p.y * 2.2;
        float stripe = smoothstep(0.55, 1.0, sin(slant * 160.0) * 0.5 + 0.5);
        col += (rnd(gx, line, t25 + 13.0) - 0.5) * 0.10 * k * stripe;
        // Noise burst inside the tracking band.
        float bandStripe = smoothstep(0.45, 1.0, sin((p.x * 0.10 + bandC * 2.2) * 160.0) * 0.5 + 0.5);
        col += band * (rnd(gx, line, t25 + 17.0) - 0.5) * 0.9 * k * (0.55 + 0.45 * bandStripe);
        // Dropouts: short bright streaks on one or two lines.
        float lb = floor(line * 0.5);
        float tb = floor(uTime * 6.0);
        if (rnd(lb, tb, 4.0) < 0.0012 + 0.004 * k) {
          float x0  = rnd(lb, tb, 5.0);
          float len = 0.01 + 0.09 * rnd(lb, tb, 6.0);
          float inside = step(x0, p.x) * step(p.x, x0 + len);
          col = mix(col, vec3(0.92), inside * 0.85);
        }
      }
      // --- Pause: desaturated frozen frame with a drifting noise band.
      if (uPause > 0.5) {
        float pc = fract(uTime * 0.16);
        float pb = smoothstep(0.09, 0.0, abs(p.y - pc));
        float nz = rnd(gx, line, t25 + 23.0);
        col = mix(col, vec3(nz), pb * clamp(0.25 + k, 0.0, 0.7));
        col = mix(col, vec3(dot(col, LUM)), 0.25);
      }

      col *= seam;

      // --- Colour response.
      col = mix(vec3(dot(col, LUM)), col, uTone.x);
      col = (col - 0.5) * uTone.y + 0.5;
      col *= uTone.z;
      if (uMono > 0.5) {
        float m = clamp(dot(col, LUM), 0.0, 1.0);
        if (uLevels > 1.0) m = floor(m * (uLevels - 1.0) + 0.5) / (uLevels - 1.0);
        col = m * uTint;
      } else if (uLevels > 1.0) {
        col = floor(clamp(col, 0.0, 1.0) * (uLevels - 1.0) + 0.5) / (uLevels - 1.0);
      }
      if (uTone.w != 1.0) col = pow(max(col, 0.0), vec3(uTone.w));
      // Fine grain after the levels, so a quantised phosphor keeps its steps.
      col += (rnd(gx, line, t25 + 41.0) - 0.5) * uNoise * (uMono > 0.5 ? uTint : vec3(1.0));

      // --- Beam scanlines: bright pixels widen the beam.
      if (uScan > 0.0) {
        float f = fract(p.y * uLines);
        float beam = sin(3.14159265 * f);
        beam = pow(beam * beam, mix(1.0, 0.35, clamp(dot(col, LUM), 0.0, 1.0)));
        col *= (1.0 - uScan) + uScan * (beam * 1.25 + 0.15);
      }

      // --- Phosphor mask, in canvas pixels.
      if (uMask > 0.0) {
        vec2 fc = gl_FragCoord.xy;
        vec3 m = vec3(0.35);
        if (uMaskType < 1.5) {
          int i = int(mod(fc.x, 3.0));
          m[i] = 1.0;
        } else if (uMaskType < 2.5) {
          float xx = fc.x + mod(floor(fc.y / 2.0), 2.0) * 1.5;
          int i = int(mod(xx, 3.0));
          m[i] = 1.0;
          m *= mod(fc.y, 2.0) < 1.0 ? 0.82 : 1.0;
        } else {
          int i = int(mod(fc.x, 3.0));
          m[i] = 1.0;
          m *= mod(fc.y, 3.0) < 1.0 ? 0.7 : 1.0;
        }
        col *= mix(vec3(1.0), m * 1.45, uMask);
      }

      if (uFlicker > 0.0) col *= 1.0 - uFlicker * rnd(floor(uTime * 50.0), 1.0, 51.0);

      // --- Tube vignette: corners fall into the black bezel.
      float vig = 1.0 - uVig * clamp(dot(c2, c2) * uVigK, 0.0, 1.0);
      col *= vig;

      outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
    }
  `;

  const UNIFORMS = ["uTex", "uRes", "uAspect", "uFill", "uTime", "uIntensity", "uStd", "uPause", "uRoll",
    "uCurve", "uCorner", "uTape", "uChroma", "uScan", "uLines", "uMask", "uMaskType", "uBloom", "uVig", "uVigK",
    "uTone", "uTint", "uMono", "uLevels", "uFlicker", "uNoise", "uJitter"];

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

  function buildGL(gl) {
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
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1]), gl.STATIC_DRAW);
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const posLoc = gl.getAttribLocation(program, "aPosition");
    const uvLoc = gl.getAttribLocation(program, "aUV");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(uvLoc);
    gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 16, 8);
    gl.bindVertexArray(null);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    const u = {};
    UNIFORMS.forEach((n) => { u[n] = gl.getUniformLocation(program, n); });
    return { program, buffer, vao, texture, u };
  }

  /* ------------------------------------------------------------------ *
   * The screen
   * ------------------------------------------------------------------ */

  const registry = new WeakMap();
  const awake = new Set();
  let raf = 0;

  function tickAll(now) {
    raf = 0;
    awake.forEach((h) => { try { h.tick(now); } catch (e) { console.error("[ecran]", e); h.sleep(); } });
    if (awake.size) raf = requestAnimationFrame(tickAll);
  }
  function kick() { if (!raf && awake.size) raf = requestAnimationFrame(tickAll); }

  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function hms(sec) {
    sec = Math.max(0, Math.floor(sec));
    return Math.floor(sec / 3600) + ":" + pad2(Math.floor(sec / 60) % 60) + ":" + pad2(sec % 60);
  }

  class Screen {
    constructor(screen, opts) {
      this.screen = screen;
      this.doc = screen.ownerDocument;
      injectCss(this.doc);
      this.opts = {};
      this.params = { pause: false, intensity: null, std: null, snow: false };
      this.mode = "dom";
      this.gl = null;
      this.res = null;
      this.lost = false;
      this.source = null;
      this.canvas = null;
      this.madeCanvas = false;
      this.frames = 0;
      this.fps = 0;
      this.fpsT = 0;
      this.fpsN = 0;
      this.t0 = performance.now();
      this.rollStart = 0;
      this.lastDraw = 0;
      this.lastT = -1;
      this.dirty = true;
      this.visible = true;
      this.grainT = 0;
      this.osdT = 0;
      this.osdState = { rec: false, counter: null, text: "" };
      this.countStart = performance.now();
      this.cleanups = [];
      this.contents = [];

      screen.classList.add("ike-screen");
      try { if (getComputedStyle(screen).position === "static") { screen.style.position = "relative"; this.posSet = true; } } catch (_) { /* ignore */ }
      const fx = this.doc.createElement("div");
      fx.className = "ike-fx";
      fx.setAttribute("data-ike-dress", "");
      fx.setAttribute("aria-hidden", "true");
      fx.innerHTML = '<i class="ike-u ike-scan"></i><i class="ike-u ike-mask"></i><canvas class="ike-u ike-grain" width="320" height="240"></canvas>' +
        '<i class="ike-u ike-band"></i><i class="ike-u ike-head"></i><i class="ike-thirds"></i><i class="ike-marks"></i><i class="ike-glass"></i>' +
        '<div class="ike-osd"><span class="ike-rec">REC</span><span class="ike-count"></span><span class="ike-text"></span><span class="ike-clock"></span></div>';
      screen.appendChild(fx);
      this.fx = fx;
      this.el = fx;
      this.grain = fx.querySelector(".ike-grain");

      if (typeof IntersectionObserver === "function") {
        const io = new IntersectionObserver((es) => { this.visible = !!es[es.length - 1].isIntersecting; if (this.visible) { this.dirty = true; kick(); } });
        io.observe(screen);
        this.cleanups.push(() => io.disconnect());
      }
      if (typeof ResizeObserver === "function") {
        const ro = new ResizeObserver(() => this.resize());
        ro.observe(screen);
        this.cleanups.push(() => ro.disconnect());
      }
      this.configure(opts || {});
      this.wake();
    }

    configure(opts) {
      Object.assign(this.opts, opts);
      const o = this.opts;
      const pr = resolveProfile(o);
      this.profile = pr;
      const s = this.screen;
      s.dataset.ikeProfile = pr.name;
      s.style.setProperty("--ike-tube", pr.tube);
      s.style.setProperty("--ike-z", String(o.z == null ? 7 : o.z));
      s.style.setProperty("--ike-z-under", String(o.zUnder == null ? (o.z == null ? 7 : o.z) : o.zUnder));
      const d = pr.dom, g = pr.glass;
      s.style.setProperty("--ike-filter", d.filter);
      if (d.scan) s.style.setProperty("--ike-scan", d.scan); else s.style.removeProperty("--ike-scan");
      s.style.setProperty("--ike-scan-o", String(d.scanO));
      s.style.setProperty("--ike-mask", d.mask || "none");
      s.style.setProperty("--ike-mask-o", String(d.maskO));
      s.style.setProperty("--ike-grain", String(d.grain));
      s.style.setProperty("--ike-snow", String(d.snow || d.grain));
      s.style.setProperty("--ike-hi", String(g.hi));
      s.style.setProperty("--ike-hi-at", g.hiAt);
      s.style.setProperty("--ike-hi-shape", g.hiShape);
      s.style.setProperty("--ike-sheen", String(g.sheen));
      s.style.setProperty("--ike-vig", String(g.vig));
      s.style.setProperty("--ike-vig-from", g.vigFrom);
      s.style.setProperty("--ike-inset", g.inset + "px");
      s.style.setProperty("--ike-inset-a", String(g.insetA));
      const show = (sel, on) => { const e = this.fx.querySelector(sel); if (e) e.style.display = on ? "" : "none"; };
      show(".ike-scan", !!d.scan);
      show(".ike-mask", !!d.mask);
      show(".ike-grain", d.grain > 0 || d.snow > 0);
      show(".ike-band", d.band);
      show(".ike-head", d.head);
      show(".ike-marks", d.marks);
      show(".ike-thirds", d.thirds);

      // DOM-mode content (filter + wobble)
      this.contents.forEach((e) => e.classList.remove("ike-content", "ike-wobble"));
      this.contents = [];
      if (o.content) {
        const list = typeof o.content === "string" ? Array.from(s.querySelectorAll(o.content)) : [].concat(o.content);
        list.forEach((e) => { if (e && e.classList) { e.classList.add("ike-content"); this.contents.push(e); } });
      }

      // OSD
      const osd = Object.assign({}, pr.osd);
      this.osdCfg = osd;
      this.osdState.rec = !!osd.rec;
      this.osdState.text = osd.text || "";
      this.renderOsd(performance.now(), true);

      this.applyLevel();
      if ("source" in opts) this.setSource(opts.source);
      else this.setSource(this.source);
    }

    applyLevel() {
      const s = this.screen;
      s.classList.toggle("ike-calm", LV.calm);
      s.classList.toggle("ike-lite", LV.lite);
      const w = LV.lite ? 160 : 320, h = LV.lite ? 120 : 240;
      if (this.grain.width !== w) { this.grain.width = w; this.grain.height = h; this.grainImg = null; }
      if (LV.calm) this.drawGrain();
      this.dirty = true;
      this.resize();
    }

    /* --- source / mode ------------------------------------------------ */

    setSource(src) {
      this.source = src || null;
      const pr = this.profile;
      let mode = "dom";
      if (this.source && pr.gl && !this.lost) mode = this.ensureGL() ? "gl" : "dom";
      this.mode = mode;
      this.screen.classList.toggle("ike-mode-gl", mode === "gl");
      this.screen.classList.toggle("ike-mode-dom", mode === "dom");
      if (this.canvas) {
        this.canvas.setAttribute("data-ike-dress", "");
        if (this.madeCanvas) this.canvas.style.display = mode === "gl" ? "" : "none";
      }
      this.lastT = -1;
      this.dirty = true;
      this.resize();
      kick();
      return mode;
    }

    ensureGL() {
      if (this.gl && this.res) return true;
      if (!this.canvas) {
        if (this.opts.canvas) this.canvas = this.opts.canvas;
        else {
          const cv = this.doc.createElement("canvas");
          cv.className = "ike-gl";
          cv.setAttribute("aria-hidden", "true");
          this.screen.insertBefore(cv, this.fx);
          this.canvas = cv;
          this.madeCanvas = true;
        }
        this.canvas.setAttribute("data-ike-dress", "");
        this.canvas.addEventListener("webglcontextlost", this.onLost = (e) => {
          e.preventDefault(); // otherwise the context never comes back
          this.lost = true;
          this.res = null;
          this.setSource(this.source);
          if (this.opts.onfallback) this.opts.onfallback(true);
        });
        this.canvas.addEventListener("webglcontextrestored", this.onRestored = () => {
          this.lost = false;
          this.res = null; // objects of the lost context are dead: drop them
          this.setSource(this.source);
          if (this.opts.onfallback && this.mode === "gl") this.opts.onfallback(false);
        });
      }
      let gl = this.gl;
      if (!gl) {
        try { gl = this.canvas.getContext("webgl2", { alpha: false, antialias: false, depth: false, stencil: false }); } catch (_) { gl = null; }
      }
      if (!gl) { if (this.opts.onfallback) this.opts.onfallback(true); return false; }
      this.gl = gl;
      try { this.res = buildGL(gl); }
      catch (e) { console.error("[ecran] WebGL init failed:", e); this.res = null; if (this.opts.onfallback) this.opts.onfallback(true); return false; }
      return true;
    }

    releaseGL() {
      const gl = this.gl, r = this.res;
      if (gl && r && !this.lost) {
        try { gl.deleteTexture(r.texture); gl.deleteBuffer(r.buffer); gl.deleteVertexArray(r.vao); gl.deleteProgram(r.program); } catch (_) { /* context may be gone */ }
      }
      // Never loseContext(): a context lost on purpose cannot come back on the same canvas.
      this.res = null;
    }

    resize() {
      const cv = this.canvas;
      if (!cv || this.mode !== "gl" || !this.gl) return;
      const src = this.source;
      // Over a canvas source that sits inside the screen, the output lies exactly over it.
      const fills = src && Math.abs(src.offsetWidth - this.screen.clientWidth) <= 1 && Math.abs(src.offsetHeight - this.screen.clientHeight) <= 1;
      if (this.madeCanvas && fills) {
        cv.style.inset = cv.style.left = cv.style.top = cv.style.width = cv.style.height = "";
      } else if (this.madeCanvas && src && src.tagName === "CANVAS" && src.offsetParent === this.screen) {
        cv.style.inset = "auto";
        cv.style.left = src.offsetLeft + "px";
        cv.style.top = src.offsetTop + "px";
        cv.style.width = src.offsetWidth + "px";
        cv.style.height = src.offsetHeight + "px";
      }
      // Layout size, not the on-screen box (a transform would freeze a squashed canvas).
      const w0 = cv.clientWidth, h0 = cv.clientHeight;
      if (!w0 || !h0 || h0 < 40) return;
      const g = this.profile.gl;
      const dpr = LV.lite ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      let cap = this.opts.lines || g.cap;
      if (LV.lite) cap = Math.min(cap, 480);
      let height = Math.max(120, Math.min(cap, Math.round(h0 * dpr)));
      // Visible raster: two canvas pixels per beam line at least (even in lite, when the
      // display has them), a whole number of them, or the scanlines fade out (no moiré).
      if (g.scan > 0 && height < g.lines * 2) height = Math.max(height, Math.min(g.lines * 2, Math.round(h0 * Math.min(window.devicePixelRatio || 1, 2))));
      if (g.scan > 0 && height >= g.lines * 2) height = Math.floor(height / g.lines) * g.lines;
      this.scanK = g.scan > 0 ? Math.max(0, Math.min(1, height / g.lines - 1)) : 0;
      const width = Math.max(160, Math.round(height * w0 / h0));
      if (cv.width !== width || cv.height !== height) { cv.width = width; cv.height = height; }
      this.gl.viewport(0, 0, width, height);
      this.dirty = true;
    }

    /* --- params ------------------------------------------------------- */

    set(p) {
      if (!p) return;
      Object.keys(p).forEach((key) => { this.params[key] = p[key]; });
      if ("snow" in p) this.screen.classList.toggle("ike-snow", !!p.snow);
      if ("rec" in p) { this.osdState.rec = !!p.rec; this.renderOsd(performance.now(), true); }
      this.dirty = true;
      kick();
    }

    osd(o) {
      if (!o) return;
      if ("rec" in o) this.osdState.rec = !!o.rec;
      if ("counter" in o) this.osdState.counter = o.counter;
      if ("text" in o) this.osdState.text = o.text || "";
      this.renderOsd(performance.now(), true);
    }

    renderOsd(now, force) {
      if (!force && now - this.osdT < 250) return;
      this.osdT = now;
      const f = this.fx;
      const st = this.osdState, cfg = this.osdCfg || {};
      const put = (sel, text) => { const e = f.querySelector(sel); if (!e) return; e.hidden = !text; if (text && e.textContent !== text) e.textContent = text; };
      put(".ike-rec", st.rec ? "REC" : "");
      let counter = st.counter;
      if (counter == null && cfg.counter === "auto") counter = hms((now - this.countStart) / 1000);
      put(".ike-count", counter == null ? "" : String(counter));
      put(".ike-text", st.text);
      let clock = "";
      if (cfg.clock) {
        const d = new Date();
        clock = pad2(d.getDate()) + "." + pad2(d.getMonth() + 1) + " " + pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds());
      }
      put(".ike-clock", clock);
    }

    pulse(kind) {
      if (LV.calm) return;
      if (kind === "roll" && this.mode === "gl") { this.rollStart = performance.now(); this.dirty = true; kick(); }
      if (kind === "wobble") this.contents.forEach((e) => { e.classList.remove("ike-wobble"); void e.offsetWidth; e.classList.add("ike-wobble"); });
    }

    /* --- frame loop --------------------------------------------------- */

    drawGrain() {
      const cv = this.grain;
      const c = cv.getContext("2d");
      if (!this.grainImg) this.grainImg = c.createImageData(cv.width, cv.height);
      const d = this.grainImg.data;
      for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255 | 0; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
      c.putImageData(this.grainImg, 0, 0);
    }

    tick(now) {
      if (!this.visible || this.doc.visibilityState === "hidden") return;
      this.frames++;
      if (now - this.fpsT >= 1000) { this.fps = Math.round(this.fpsN * 1000 / (now - this.fpsT || 1)); this.fpsN = 0; this.fpsT = now; }
      this.fpsN++;
      this.renderOsd(now, false);

      if (this.mode === "dom") {
        const d = this.profile.dom;
        if (LV.calm || !(d.grain > 0 || d.snow > 0)) return;
        if (now - this.grainT < (LV.lite ? 140 : 70)) return;
        this.grainT = now;
        this.drawGrain();
        if (d.wobble && Math.random() < d.wobble) this.pulse("wobble");
        return;
      }
      this.frameGL(now);
    }

    frameGL(now) {
      if (!this.res || this.lost) return;
      const src = this.source;
      if (!src) return;
      const st = typeof this.opts.state === "function" ? (this.opts.state() || {}) : {};
      const pause = st.pause != null ? !!st.pause : !!this.params.pause;
      let ready = true, fresh = false;
      if (src.tagName === "VIDEO") {
        ready = src.readyState >= 2;
        fresh = !src.paused && !src.ended || src.currentTime !== this.lastT;
      } else if (src.tagName === "IMG") {
        ready = src.complete && src.naturalWidth > 0;
        fresh = this.lastT < 0;
      } else {
        ready = src.width > 0 && src.height > 0;
        fresh = this.opts.live !== false;
      }
      if (!ready) return;
      const rolling = this.rollStart && !LV.calm;
      if (!fresh && !this.dirty && !rolling) {
        if (LV.calm) return;
        const fps = pause ? this.profile.gl.pauseFps : 60;
        const animated = this.profile.gl.tape || this.profile.gl.noise || this.profile.gl.flicker || this.profile.gl.jitter || pause;
        if (!animated || now - this.lastDraw < 1000 / fps) return;
      }
      if (fresh || this.dirty) {
        const gl = this.gl;
        try {
          gl.bindTexture(gl.TEXTURE_2D, this.res.texture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
        } catch (e) {
          // SecurityError: a tainted (cross-origin) source cannot reach the shader.
          console.warn("[ecran] texture upload failed:", e && e.name);
          this.setSource(null);
          if (this.opts.onfallback) this.opts.onfallback(true);
          return;
        }
        const w = src.videoWidth || src.naturalWidth || src.width, h = src.videoHeight || src.naturalHeight || src.height;
        if (w && h) this.aspect = w / h;
        this.lastT = src.tagName === "VIDEO" ? src.currentTime : 1;
      }
      this.draw(now, st, pause);
    }

    draw(now, st, pause) {
      const gl = this.gl, r = this.res, u = r.u, g = this.profile.gl, cv = this.canvas;
      st = st || {};
      let roll = 0;
      if (this.rollStart && !LV.calm) {
        const kk = 1 - (now - this.rollStart) / ROLL_DURATION;
        if (kk > 0) roll = kk * kk; else this.rollStart = 0;
      }
      const src = this.source;
      const fit = this.opts.fit || (src && src.tagName === "CANVAS" ? "fill" : "contain");
      let k = st.intensity != null ? st.intensity : (this.params.intensity != null ? this.params.intensity : g.k);
      if (LV.calm) k *= g.calmK;
      const std = st.std != null ? st.std : (this.params.std != null ? this.params.std : g.std);
      gl.useProgram(r.program);
      gl.bindVertexArray(r.vao);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, r.texture);
      gl.uniform1i(u.uTex, 0);
      gl.uniform2f(u.uRes, cv.width, cv.height);
      gl.uniform1f(u.uAspect, this.aspect || 16 / 9);
      gl.uniform1f(u.uFill, fit === "fill" ? 1 : 0);
      gl.uniform1f(u.uTime, LV.calm ? 0 : (now - this.t0) / 1000);
      gl.uniform1f(u.uIntensity, k);
      gl.uniform1f(u.uStd, std);
      gl.uniform1f(u.uPause, pause ? 1 : 0);
      gl.uniform1f(u.uRoll, roll);
      gl.uniform1f(u.uCurve, g.curve);
      gl.uniform3f(u.uCorner, g.corner[0], g.corner[1], g.corner[2]);
      gl.uniform1f(u.uTape, g.tape);
      gl.uniform1f(u.uChroma, g.chroma);
      gl.uniform1f(u.uScan, g.scan * (this.scanK == null ? 1 : this.scanK));
      gl.uniform1f(u.uLines, g.lines);
      gl.uniform1f(u.uMask, LV.lite ? 0 : g.mask);
      gl.uniform1f(u.uMaskType, g.maskType);
      gl.uniform1f(u.uBloom, LV.lite ? 0 : g.bloom);
      gl.uniform1f(u.uVig, g.vig);
      gl.uniform1f(u.uVigK, g.vigK);
      gl.uniform4f(u.uTone, g.sat, g.con, g.bri, g.gamma);
      gl.uniform3f(u.uTint, g.tint[0], g.tint[1], g.tint[2]);
      gl.uniform1f(u.uMono, g.mono);
      gl.uniform1f(u.uLevels, g.levels);
      gl.uniform1f(u.uFlicker, LV.calm ? 0 : g.flicker);
      gl.uniform1f(u.uNoise, g.noise);
      gl.uniform1f(u.uJitter, LV.calm ? 0 : g.jitter);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.bindVertexArray(null);
      this.lastDraw = now;
      this.dirty = false;
    }

    /* The dressed screen as a picture, for a program that records it on purpose. */
    snapshot() {
      if (this.mode !== "gl" || !this.res) return null;
      this.dirty = true;
      this.frameGL(performance.now());
      const c = this.doc.createElement("canvas");
      c.width = this.canvas.width;
      c.height = this.canvas.height;
      c.getContext("2d").drawImage(this.canvas, 0, 0);
      return c;
    }

    refresh() { this.dirty = true; this.lastT = -1; kick(); }

    sleep() {
      awake.delete(this);
      this.releaseGL();
    }

    wake() {
      if (this.mode === "gl" && !this.res) this.setSource(this.source);
      this.t0 = this.t0 || performance.now();
      this.countStart = performance.now();
      awake.add(this);
      this.dirty = true;
      kick();
    }

    destroy() {
      this.sleep();
      this.cleanups.splice(0).forEach((fn) => { try { fn(); } catch (_) { /* ignore */ } });
      this.contents.forEach((e) => e.classList.remove("ike-content", "ike-wobble"));
      this.fx.remove();
      if (this.canvas) {
        if (this.onLost) this.canvas.removeEventListener("webglcontextlost", this.onLost);
        if (this.onRestored) this.canvas.removeEventListener("webglcontextrestored", this.onRestored);
        if (this.madeCanvas) this.canvas.remove();
      }
      const s = this.screen;
      s.classList.remove("ike-screen", "ike-mode-gl", "ike-mode-dom", "ike-calm", "ike-lite", "ike-snow");
      if (this.posSet) s.style.position = "";
      delete s.dataset.ikeProfile;
      registry.delete(s);
    }

    debug() {
      return {
        version: VERSION, profile: this.profile.name, mode: this.mode, gl: !!this.res, lost: this.lost,
        level: levelName(), frames: this.frames, fps: this.fps, awake: awake.has(this),
        canvas: this.canvas ? this.canvas.width + "x" + this.canvas.height : null,
      };
    }
  }

  /* ------------------------------------------------------------------ *
   * Layout: the screen rectangle and the controls slot in the program view
   * ------------------------------------------------------------------ */

  const ASPECT = 4 / 3;
  const LAY = {
    wideMin: 700,                                    // narrower views stack the screen over the controls
    wide: { pad: 12, bezel: 12, gap: 12, ctrlK: 0.3, ctrlMin: 300, ctrlMax: 460 },
    narrow: { pad: 0, bezel: 8, gap: 8 },
  };

  function geometry(W, H) {
    W = Math.max(0, Math.floor(W)); H = Math.max(0, Math.floor(H));
    const wide = W >= LAY.wideMin && W >= H;
    const r = (x, y, w, h) => ({ x, y, w, h });
    if (wide) {
      const o = LAY.wide;
      const ctrl = Math.max(o.ctrlMin, Math.min(o.ctrlMax, Math.round(W * o.ctrlK)));
      const aw = W - 2 * o.pad - o.gap - ctrl, ah = H - 2 * o.pad;
      const inner = Math.max(40, Math.min(aw - 2 * o.bezel, (ah - 2 * o.bezel) * ASPECT));
      const w = Math.floor(inner / 4) * 4, h = w * 3 / 4;
      const fw = w + 2 * o.bezel, fh = h + 2 * o.bezel;
      const fx = o.pad, fy = o.pad + Math.max(0, Math.floor((ah - fh) / 2));
      const cx = fx + fw + o.gap;
      return { mode: "wide", view: r(0, 0, W, H), frame: r(fx, fy, fw, fh), screen: r(fx + o.bezel, fy + o.bezel, w, h), controls: r(cx, o.pad, Math.max(0, W - cx - o.pad), ah) };
    }
    const o = LAY.narrow;
    const w = Math.max(40, Math.floor((W - 2 * o.pad - 2 * o.bezel) / 4) * 4), h = w * 3 / 4;
    const fw = w + 2 * o.bezel, fh = h + 2 * o.bezel;
    const fx = Math.floor((W - fw) / 2), fy = o.pad;
    const cy = fy + fh + o.gap;
    return { mode: "narrow", view: r(0, 0, W, H), frame: r(fx, fy, fw, fh), screen: r(fx + o.bezel, fy + o.bezel, w, h), controls: r(0, cy, W, Math.max(0, H - cy)) };
  }

  const layouts = new WeakMap();
  const pin = (e, q) => {
    if (!e) return;
    const st = e.style;
    ["inset", "right", "bottom", "transform"].forEach((k) => st.removeProperty(k));
    st.setProperty("position", "absolute", "important");
    st.setProperty("left", q.x + "px", "important");
    st.setProperty("top", q.y + "px", "important");
    st.setProperty("right", "auto", "important");
    st.setProperty("bottom", "auto", "important");
    st.setProperty("width", q.w + "px", "important");
    st.setProperty("height", q.h + "px", "important");
    st.setProperty("margin", "0", "important");
    st.setProperty("max-width", "none", "important");
    st.setProperty("max-height", "none", "important");
    st.setProperty("min-width", "0", "important");
    st.setProperty("min-height", "0", "important");
    st.setProperty("aspect-ratio", "auto", "important");
  };
  const PINNED = ["position", "left", "top", "right", "bottom", "width", "height", "margin", "max-width", "max-height", "min-width", "min-height", "aspect-ratio"];

  class Layout {
    constructor(root, opts) {
      this.root = root;
      this.doc = root.ownerDocument;
      injectCss(this.doc);
      root.classList.add("ike-prog");
      try { if (getComputedStyle(root).position === "static") { root.style.position = "relative"; this.posSet = true; } } catch (_) { /* ignore */ }
      root.style.setProperty("overflow", "hidden", "important");
      const fr = this.doc.createElement("div");
      fr.className = "ike-frame";
      fr.setAttribute("data-ike-dress", "");
      fr.setAttribute("aria-hidden", "true");
      root.insertBefore(fr, root.firstChild);
      this.frame = fr;
      this.opts = {};
      this.geometry = null;
      this.onResize = () => this.update();
      if (typeof ResizeObserver === "function") { this.ro = new ResizeObserver(this.onResize); this.ro.observe(root); }
      (this.doc.defaultView || window).addEventListener("resize", this.onResize);
      this.set(opts);
    }

    set(opts) {
      Object.assign(this.opts, opts || {});
      const pick = (v) => (typeof v === "string" ? this.root.querySelector(v) : v) || null;
      const sc = pick(this.opts.screen), ct = pick(this.opts.controls);
      if (this.screen && this.screen !== sc) this.release(this.screen, "ike-slot-screen");
      if (this.controls && this.controls !== ct) this.release(this.controls, "ike-slot-controls");
      this.screen = sc;
      this.controls = ct;
      if (sc) sc.classList.add("ike-slot-screen");
      if (ct) ct.classList.add("ike-slot-controls");
      this.update();
      return this;
    }

    release(e, cls) {
      e.classList.remove(cls);
      PINNED.forEach((k) => e.style.removeProperty(k));
    }

    update() {
      const W = this.root.clientWidth, H = this.root.clientHeight;
      if (!W || !H) return this.geometry;
      const g = geometry(W, H);
      const old = this.geometry;
      this.geometry = g;
      this.root.dataset.ikeLayout = g.mode;
      pin(this.frame, g.frame);
      pin(this.screen, g.screen);
      pin(this.controls, g.controls);
      if (!old || JSON.stringify(old) !== JSON.stringify(g)) {
        if (typeof this.opts.onlayout === "function") { try { this.opts.onlayout(g); } catch (e) { console.error("[ecran]", e); } }
        try { this.root.dispatchEvent(new CustomEvent("ike-layout", { detail: g })); } catch (_) { /* old browsers */ }
      }
      return g;
    }

    destroy() {
      if (this.ro) this.ro.disconnect();
      (this.doc.defaultView || window).removeEventListener("resize", this.onResize);
      if (this.screen) this.release(this.screen, "ike-slot-screen");
      if (this.controls) this.release(this.controls, "ike-slot-controls");
      this.frame.remove();
      this.root.classList.remove("ike-prog");
      this.root.style.removeProperty("overflow");
      if (this.posSet) this.root.style.position = "";
      delete this.root.dataset.ikeLayout;
      layouts.delete(this.root);
    }
  }

  function layout(root, opts) {
    if (typeof root === "string") root = document.querySelector(root);
    if (!root) return null;
    let l = layouts.get(root);
    if (l) return l.set(opts);
    l = new Layout(root, opts || {});
    layouts.set(root, l);
    return l;
  }

  /* ------------------------------------------------------------------ *
   * Public
   * ------------------------------------------------------------------ */

  function mount(screen, opts) {
    if (typeof screen === "string") screen = document.querySelector(screen);
    if (!screen) return null;
    let h = registry.get(screen);
    if (h) { h.configure(opts || {}); h.wake(); return h; }
    h = new Screen(screen, opts || {});
    registry.set(screen, h);
    return h;
  }

  function relevel() {
    const n = flags();
    if (n.calm === LV.calm && n.lite === LV.lite) return;
    LV = n;
    awake.forEach((h) => h.applyLevel());
    kick();
  }
  setInterval(relevel, 1000); // the arcade's FX switch carries no event
  window.addEventListener("storage", (e) => { if (e.key === "ik.fx") relevel(); });
  try { window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", relevel); } catch (_) { /* old browsers */ }

  window.IKEcran = {
    mount,
    layout,
    geometry,
    get: (screen) => registry.get(typeof screen === "string" ? document.querySelector(screen) : screen) || null,
    profiles: P,
    programs: PROGRAMS,
    level: levelName,
    force(level) {
      forced = level === "full" || level === "lite" || level === "calm" ? level : null;
      LV = flags();
      awake.forEach((h) => h.applyLevel());
      kick();
      return levelName();
    },
    version: VERSION,
  };
})();
