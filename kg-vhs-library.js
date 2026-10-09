/*
 * Copyright © Mauk Tenieb & Korhogo. All rights reserved. Korhogo™, Korhogo Fauna™, Fauna
 * Masks™, Fauna Chess™, Faunarratik™, Katabatik™, Insert Koin™, Puck You!™ and any related
 * material — including characters, names, symbols, rules, lore and texts, in any form or
 * medium — are the exclusive property of Korhogo™. The source code of this site is
 * published for reading, reflections, additions, requests, etc. - the lore, names, marks
 * and works remain the property of the author. No use for training artificial
 * intelligence. Contact: mauktenieb@gmail.com
 */
/*!
 * KG-VHS Library — tape adapter between CHANNEL.SCRAPE (YouTube scraper) and the VHS cabinet.
 *
 * One completed scrape  = one VHS cassette (a "tape")  = one YouTube channel.
 * Every video on that channel = one track on the cassette ({ id, title }).
 *
 * The cabinet (kg-vhs.js v2.2.0) reads its catalogue through readTracks(),
 * which consumes `window.JUKE_TRACKS` — an array of { id, title } (or bare
 * video ids, or the jukebox's { id, t }). That global ALSO feeds the Motel
 * Sound jukebox, so this module does NOT touch it by default. It publishes
 * to `window.KG_VHS_TRACKS` instead, and the copy of kg-vhs.js in this
 * folder is already patched so readTracks() prefers it:
 *
 *   function readTracks() {
 *     // 1) scraped cassette library (KG_VHS_TRACKS), 2) JUKE_TRACKS.
 *   }
 *
 * Legacy mode (no cabinet patch): set config.mirrorToJukebox = true and the
 * scraped tracks replace JUKE_TRACKS itself — the jukebox then plays the
 * library too. Off by default.
 *
 *   KGVHSLibrary.ready().then(function () {
 *     KGVHSLibrary.selectTape("Lex Fridman"); // one cassette on the deck
 *   });
 *
 * Data sources, in priority order:
 *   1. An injected snapshot (owner-provided JSON / build-time export), if present:
 *      window.KG_VHS_LIBRARY_SNAPSHOT = [{ id, title }, ...] | { tracks: [...] } | { tapes: [...] }
 *   2. The CHANNEL.SCRAPE backend at window.KG_VHS_LIBRARY_API (default local FastAPI).
 *   3. The offline cache (localStorage) from the last successful load.
 *
 * If everything fails, the cabinet's catalogue is left untouched. Zero
 * dependency. ES5-flavoured, defensive, idempotent.
 */
(function (global) {
  "use strict";

  var DEFAULTS = {
    // CHANNEL.SCRAPE backend (FastAPI). Override with window.KG_VHS_LIBRARY_CONFIG.apiUrl.
    apiUrl: "http://127.0.0.1:8001/api",
    // Global holding an optional build-time snapshot.
    snapshotKey: "KG_VHS_LIBRARY_SNAPSHOT",
    // localStorage key for the offline cache (last good tracks).
    cacheKey: "kg.vhs-library.tracks.v1",
    // Maximum tracks loaded into KG_VHS_TRACKS (protects the cabinet memory).
    maxTracks: 600,
    // Replace the shared JUKE_TRACKS global as well (affects the jukebox!).
    mirrorToJukebox: false,
    // Fetch timeout (ms).
    timeoutMs: 8000,
    // How long a backend failure is remembered before retrying (ms).
    failureBackoffMs: 5 * 60 * 1000,
    debug: false
  };

  var config = JSON.parse(JSON.stringify(DEFAULTS));
  var cache = { tracks: [], tapes: [] };
  var currentTape = null; // cassette loaded on the deck (null = all tracks)
  var state = {
    status: "idle", // idle | loading | ready | error
    error: null,
    loadedAt: 0,
    fromCache: false,
    fromBackend: false,
    lastFailureAt: 0
  };

  function log() {
    if (!config.debug) return;
    var args = Array.prototype.slice.call(arguments);
    args.unshift("[vhs-library]");
    if (typeof console !== "undefined" && console.log) console.log.apply(console, args);
  }

  function safeGet(storage, key) {
    try { return storage.getItem(key); } catch (_e) { return null; }
  }
  function safeSet(storage, key, value) {
    try { storage.setItem(key, value); } catch (_e) { /* quota / privacy mode */ }
  }

  function uniqByVideoId(tracks) {
    var seen = {};
    var out = [];
    for (var i = 0; i < tracks.length; i++) {
      var t = tracks[i];
      var id = t && typeof t.id === "string" ? t.id : "";
      if (!id || seen[id]) continue;
      seen[id] = true;
      out.push(t);
    }
    return out;
  }

  /* ------------------------------------------------------------------ *
   *  Normalisation: backend video records -> { id, title }
   * ------------------------------------------------------------------ */

  function cleanTitle(title) {
    return String(title || "")
      .replace(/^\s*\d+\s*[\)\].:-]\s*/i, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function trackFromVideo(v) {
    if (!v) return null;
    var raw = typeof v === "string" ? { video_id: v } : v;
    var id = raw.video_id || raw.id || raw.videoId || "";
    if (!id || typeof id !== "string") return null;
    var title = cleanTitle(raw.title || raw.name || "");
    return { id: id, title: title || id };
  }

  // One tape (scrape) -> tracks.
  function tracksFromTape(item) {
    var videos = (item && item.videos) || (item && item.tracks) || [];
    var out = [];
    for (var i = 0; i < videos.length; i++) {
      var t = trackFromVideo(videos[i]);
      if (t) out.push(t);
    }
    return out;
  }

  // Snapshot tape list -> normalised tapes (each with its own tracks).
  function tracksFromTapeList(list) {
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var src = list[i] || {};
      var tracks = tracksFromTape(src);
      out.push({
        channel: src.channel || src.label || "Unknown",
        channel_url: src.channel_url || "",
        count: src.count || tracks.length,
        tracks: tracks
      });
    }
    return out;
  }

  function normaliseSnapshot(raw) {
    if (Array.isArray(raw)) {
      var arr = [];
      for (var i = 0; i < raw.length; i++) {
        var t = trackFromVideo(raw[i]);
        if (t) arr.push(t);
      }
      return [{ channel: "Snapshot", channel_url: "", count: arr.length, tracks: arr }];
    }
    if (raw && typeof raw === "object") {
      if (Array.isArray(raw.tapes)) return tracksFromTapeList(raw.tapes);
      if (Array.isArray(raw.tracks)) {
        var arr2 = [];
        for (var k = 0; k < raw.tracks.length; k++) {
          var t2 = trackFromVideo(raw.tracks[k]);
          if (t2) arr2.push(t2);
        }
        return [{ channel: "Snapshot", channel_url: "", count: arr2.length, tracks: arr2 }];
      }
    }
    return [];
  }

  /* ------------------------------------------------------------------ *
   *  Backend fetch (CHANNEL.SCRAPE): /history once -> tracks + tapes
   * ------------------------------------------------------------------ */

  function fetchWithTimeout(url, ms) {
    if (typeof AbortController !== "undefined") {
      var ctrl = new AbortController();
      var timer = setTimeout(function () { ctrl.abort(); }, ms);
      return fetch(url, { signal: ctrl.signal })["finally"](function () { clearTimeout(timer); });
    }
    return fetch(url);
  }

  /* [IK] CHANNEL.SCRAPE is the author's workshop: only probed when the arcade runs on his own machine */
  /* [IK] …or on the online site, once this browser has been marked with ?atelier (unmarked with ?atelier=0):
     only the author's browser knocks on 127.0.0.1, visitors are never asked about their local network */
  (function () {
    try {
      var m = /[?#&]atelier(?:=([^&#]*))?/.exec(String(global.location.search) + String(global.location.hash));
      if (m) {
        if (m[1] === "0") global.localStorage.removeItem("kg.atelier");
        else global.localStorage.setItem("kg.atelier", m[1] && /^https?:/i.test(decodeURIComponent(m[1])) ? decodeURIComponent(m[1]) : "1");
      }
      var a = global.localStorage.getItem("kg.atelier");
      if (a && a !== "1") DEFAULTS.apiUrl = config.apiUrl = a.replace(/\/+$/, "");
    } catch (_e) {}
  })();
  function atelier() {
    try {
      var h = global.location && global.location.hostname;
      if (h === "localhost" || h === "127.0.0.1" || h === "" || global.location.protocol === "file:") return true;
      return !!global.localStorage.getItem("kg.atelier");
    }
    catch (_e) { return false; }
  }
  function fetchBackend() {
    if (!atelier()) return Promise.reject(new Error("no workshop here"));
    // GET {apiUrl}/videos/all — aggregate across every scraped channel: one
    // request gives both the flat video list (tracks) and per-channel
    // metadata (tapes). (/history excludes the heavy `videos` field, so it
    // cannot be used here.)
    var url = String(config.apiUrl).replace(/\/+$/, "") + "/videos/all";
    return fetchWithTimeout(url, config.timeoutMs).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    }).then(function (payload) {
      var sources = (payload && payload.sources) || [];
      var videos = (payload && payload.videos) || [];
      // Cassettes are keyed by channel: several scrapes of the same channel
      // merge into one tape (tracks are deduplicated at publish time).
      var byChannel = {};
      var tapes = [];
      for (var i = 0; i < sources.length; i++) {
        var s = sources[i] || {};
        var name = s.channel || "Unknown";
        if (!byChannel[name]) {
          var tape = { channel: name, channel_url: s.channel_url || "", count: 0, tracks: [] };
          byChannel[name] = tape;
          tapes.push(tape);
        } else if (!byChannel[name].channel_url && s.channel_url) {
          byChannel[name].channel_url = s.channel_url;
        }
      }
      for (var j = 0; j < videos.length; j++) {
        var t = trackFromVideo(videos[j]);
        if (!t) continue;
        var owner = byChannel[videos[j].channel];
        if (!owner) {
          // Video whose channel has no source entry: synthesize a tape.
          owner = { channel: videos[j].channel || "Unknown", channel_url: "", count: 0, tracks: [] };
          byChannel[owner.channel] = owner;
          tapes.push(owner);
        }
        owner.tracks.push(t);
        owner.count = owner.tracks.length;
      }
      return { tapes: tapes };
    });
  }

  /* ------------------------------------------------------------------ *
   *  Offline cache
   * ------------------------------------------------------------------ */

  function readCache() {
    var raw = safeGet(global.localStorage, config.cacheKey);
    if (!raw) return null;
    try {
      var parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.tracks)) return parsed;
    } catch (_e) { /* corrupted cache */ }
    return null;
  }

  function writeCache(tracks, tapes) {
    // Debounced: localStorage writes are synchronous and can be large.
    writeCache._pending = { tracks: tracks, tapes: tapes };
    if (writeCache._timer) return;
    writeCache._timer = setTimeout(function () {
      var p = writeCache._pending;
      writeCache._timer = null;
      if (!p) return;
      safeSet(global.localStorage, config.cacheKey, JSON.stringify({
        savedAt: Date.now(),
        tapes: (p.tapes || []), // each tape carries its own tracks
        tracks: (p.tracks || [])
      }));
    }, 800);
  }

  /* ------------------------------------------------------------------ *
   *  Loading
   * ------------------------------------------------------------------ */

  /** Track list for one cassette (by channel name), or all tracks when falsy. */
  function tracksForTape(channel) {
    if (!channel) return cache.tracks;
    for (var i = 0; i < cache.tapes.length; i++) {
      if (cache.tapes[i].channel === channel) return cache.tapes[i].tracks || [];
    }
    return [];
  }

  /* [IK] cassettes recorded in the page (kg-vhs-scrape.js), kept in this browser */
  var LOCAL_KEY = "kg.vhs.tapes.local.v1";
  function readLocal() {
    try { var a = JSON.parse(safeGet(global.localStorage, LOCAL_KEY) || "[]"); return Array.isArray(a) ? a : []; } catch (e) { return []; }
  }
  function writeLocal(a) { safeSet(global.localStorage, LOCAL_KEY, JSON.stringify(a)); }
  function withLocal(tapes) {
    var have = {}, out = (tapes || []).slice();
    out.forEach(function (t) { have[t.channel] = 1; });
    readLocal().forEach(function (t) { if (t && t.channel && !have[t.channel]) { have[t.channel] = 1; out.push(t); } });
    return out;
  }
  function publish(tapes, fromBackend, fromCache) {
    tapes = withLocal(tapes);
    var tracks = [];
    for (var i = 0; i < tapes.length; i++) {
      tracks = tracks.concat((tapes[i] && tapes[i].tracks) || []);
    }
    tracks = uniqByVideoId(tracks).slice(0, config.maxTracks);
    if (!tracks.length) return false;

    global.KG_VHS_TRACKS = tracks;
    if (config.mirrorToJukebox) global.JUKE_TRACKS = tracks;
    cache = { tracks: tracks, tapes: tapes };
    state.status = "ready";
    state.error = null;
    state.loadedAt = Date.now();
    state.fromBackend = !!fromBackend;
    state.fromCache = !!fromCache;
    if (fromBackend) writeCache(tracks, tapes);
    log("published", tracks.length, "tracks /", tapes.length, "tapes",
      fromBackend ? "(backend)" : fromCache ? "(cache)" : "(snapshot)");
    return true;
  }

  function load() {
    if (state.status === "loading" && state.loadPromise) return state.loadPromise;
    state.status = "loading";
    state.error = null;

    var trySnapshot = function () {
      return publish(normaliseSnapshot(global[config.snapshotKey]), false, false);
    };

    var tryBackend = function () {
      return fetchBackend().then(function (data) {
        return publish(data.tapes, true, false);
      });
    };

    var tryCache = function () {
      var cached = readCache();
      if (cached && cached.tracks.length) {
        return publish(cached.tapes || [], false, true);
      }
      if (readLocal().length) return publish([], false, false);
      return false;
    };

    var finish = function (published) {
      if (published) return;
      // Nothing anywhere: leave the cabinet's catalogue untouched.
      state.status = "error";
      state.error = "No tracks available (backend unreachable, no snapshot, no cache).";
      state.lastFailureAt = Date.now();
      log(state.error);
    };

    var seq;
    if (global[config.snapshotKey]) {
      seq = Promise.resolve(trySnapshot()).then(function (ok) {
        if (ok) return;
        return tryBackend().catch(function (e) {
          log("backend failed:", e);
          return tryCache();
        });
      });
    } else {
      seq = tryBackend().catch(function (e) {
        log("backend failed:", e);
        state.lastFailureAt = Date.now();
        return tryCache();
      });
    }

    state.loadPromise = Promise.resolve(seq).then(finish, finish);
    return state.loadPromise;
  }

  /* ------------------------------------------------------------------ *
   *  Public API
   * ------------------------------------------------------------------ */

  global.KGVHSLibrary = {
    /** Load tapes into window.KG_VHS_TRACKS. Resolves when done (never rejects). */
    ready: function () {
      if (state.status === "ready") return Promise.resolve();
      if (Date.now() - state.lastFailureAt < config.failureBackoffMs) {
        return Promise.resolve();
      }
      return load() || Promise.resolve();
    },
    /** Diagnostics. */
    status: function () {
      return {
        status: state.status,
        tracks: cache.tracks.length,
        tapes: cache.tapes.length,
        loadedAt: state.loadedAt,
        fromCache: state.fromCache,
        fromBackend: state.fromBackend,
        error: state.error
      };
    },
    /** Cassette metadata (channel name/url/count + tracks), parallel to KG_VHS_TRACKS. */
    tapes: function () {
      return cache.tapes.slice();
    },
    /** The cassette currently loaded on the deck (null = all tracks). */
    current: function () {
      return currentTape;
    },
    /** Load one cassette into KG_VHS_TRACKS (channel name), or all tracks if falsy. */
    selectTape: function (channel) {
      var tracks = tracksForTape(channel);
      if (tracks.length) {
        currentTape = channel;
        global.KG_VHS_TRACKS = tracks;
        if (config.mirrorToJukebox) global.JUKE_TRACKS = tracks;
      }
      return tracks.slice();
    },
    /** Put the full library back on the deck. */
    selectAll: function () {
      currentTape = null;
      global.KG_VHS_TRACKS = cache.tracks;
      if (config.mirrorToJukebox) global.JUKE_TRACKS = cache.tracks;
      return cache.tracks.slice();
    },
    /** Force a reload on next ready(). */
    invalidate: function () {
      state.lastFailureAt = 0;
      state.status = "idle";
    },
    /** Merge/override defaults. */
    configure: function (overrides) {
      for (var k in overrides) {
        if (Object.prototype.hasOwnProperty.call(overrides, k)) config[k] = overrides[k];
      }
    },
    /** Testing hook. */
    _setCache: function (tracks, tapes) {
      cache = { tracks: tracks || [], tapes: tapes || [] };
    },
    /** [IK] keep a cassette recorded in the page; `over` (a channel) is erased first — record-over */
    saveLocal: function (tape, over) {
      var a = readLocal().filter(function (t) { return t && t.channel !== tape.channel && (!over || t.channel !== over); });
      a.push({ channel: tape.channel, channel_url: tape.channel_url || "", count: tape.tracks.length, tracks: tape.tracks.slice(0, config.maxTracks) });
      writeLocal(a);
      state.lastFailureAt = 0; state.status = "idle";
    },
    /** [IK] erase a cassette recorded in this browser */
    eraseLocal: function (channel) {
      writeLocal(readLocal().filter(function (t) { return t && t.channel !== channel; }));
      var left = cache.tapes.filter(function (t) { return t.channel !== channel; }), tr = [];
      left.forEach(function (t) { tr = tr.concat(t.tracks || []); });
      cache = { tracks: uniqByVideoId(tr), tapes: left };
      if (currentTape === channel) currentTape = null;
      global.KG_VHS_TRACKS = cache.tracks.length ? cache.tracks : undefined;
      state.status = cache.tracks.length ? "ready" : "idle"; state.lastFailureAt = 0;
    },
    /** [IK] a cassette recorded in this browser (with its tracks), or null */
    localTape: function (channel) { var a = readLocal(); for (var i = 0; i < a.length; i++) if (a[i] && a[i].channel === channel) return a[i]; return null; },
    /** [IK] a cassette recorded in this browser? */
    isLocal: function (channel) { return readLocal().some(function (t) { return t && t.channel === channel; }); },
    /** Backend base URL in use (for companion modules, e.g. the recorder). */
    apiUrl: function () {
      return config.apiUrl;
    }
  };

  /* ------------------------------------------------------------------ *
   *  KGI18N — translation layer the cabinet (kg-vhs.js) reads through
   *  t(). The site defines none today, so we supply one: English keys,
   *  French translations, following the site's <html lang> (the cabinet
   *  re-applies i18n on live language switches).
   * ------------------------------------------------------------------ */
  if (!global.KGI18N) {
    var VHS_DICT = {
      en: null, // English keys ARE the source strings
      fr: {
        "CATALOGUE": "CATALOGUE",
        "FILES": "FICHIERS",
        "EJECT": "ÉJECT",
        "REW": "REW",
        "FFW": "FFW",
        "Stop": "STOP",
        "Play": "LECTURE",
        "Pause": "PAUSE",
        "Load": "CHARGE",
        "Video standard": "Norme vidéo",
        "Position": "Position",
        "Source": "Source",
        "Rewind 5 seconds": "Rembobine 5 secondes",
        "Forward 5 seconds": "Avance 5 secondes",
        "Random": "Aléatoire",
        "Tape speed": "Vitesse de bande",
        "Mute / unmute": "Couper / remettre le son",
        "Play / pause": "Lecture / pause",
        "Eject": "Éject",
        "No local VHS files have been supplied.": "Aucun fichier VHS local n'a été fourni.",
        "Feed the cassette with tapes.": "Nourris la cassette de bandes.",
        "The player could not be loaded.": "Le lecteur n'a pas pu être chargé.",
        "The YouTube player could not be loaded.": "Le lecteur YouTube n'a pas pu être chargé.",
        "The local VHS file could not be played.": "Le fichier VHS local n'a pas pu être lu.",
        "WebGL2 unavailable; showing the source video.": "WebGL2 indisponible ; affichage de la vidéo source.",
        "YouTube could not load this video.": "YouTube n'a pas pu charger cette vidéo.",
        /* recorder / shelf (kg-vhs-recorder.js) */
        "CASSETTES": "CASSETTES",
        "Record a YouTube channel onto a cassette": "Enregistrer une chaîne YouTube sur une cassette",
        "YouTube channel or playlist URL": "URL de chaîne ou de playlist YouTube",
        "REC": "REC",
        "CANCEL": "ANNULER",
        "Recording": "Enregistrement",
        "CASSETTE RECORDED": "CASSETTE ENREGISTRÉE",
        "CHANNEL.SCRAPE backend unreachable — start the local server.": "Backend CHANNEL.SCRAPE injoignable — démarre le serveur local.",
        "No cassette yet. Record a channel.": "Aucune cassette. Enregistre une chaîne.",
        "tracks": "pistes",
        "all": "tout",
        "Not a YouTube URL.": "URL YouTube invalide.",
        "Already recording.": "Enregistrement déjà en cours.",
        "Recording cancelled.": "Enregistrement annulé.",
        /* finder / tape tools / teletext */
        "Find a track in the deck": "Chercher une piste dans le deck",
        "CSV": "CSV",
        "JSON": "JSON",
        "XLSX": "XLSX",
        "ERASE": "EFFACER",
        "SURE?": "SÛR ?",
        "TEXT": "TEXT",
        "KRITIK": "KRITIK",
        "Pick a page.": "Choisis une page.",
        "Loading page": "Chargement de la page",
        "No pages on this feed.": "Aucune page sur ce flux.",
        "Feed unavailable.": "Flux indisponible.",
        "Matching reviews with cassettes": "Croiser les critiques et les cassettes",
        "reviews read": "critiques lues",
        "tracks in the library": "pistes en bibliothèque",
        "on cassettes": "sur cassettes",
        "No match on the cassettes.": "Aucune correspondance sur les cassettes.",
        "Match unavailable.": "Croisement indisponible.",
        /* record over the loaded cassette */
        "REC bay": "Baie d'enregistrement",
        "Load a cassette and record a new channel over it: the tape is erased and rewound with fresh tracks.":
          "Charge une cassette puis enregistre une nouvelle chaîne par-dessus : la bande est effacée et rembobinée avec les nouvelles pistes.",
        "ALL": "TOUT",
        "Tape order": "Ordre de bande",
        "Newest first": "Plus récent d'abord",
        "Oldest first": "Plus ancien d'abord",
        "Title A – Z": "Titre A – Z",
        "Title Z – A": "Titre Z – A",
        "Shuffle": "Mélanger",
        "Sort the tracklist": "Trier la liste de pistes",
        "jobs erased": "jobs effacés",
        "Recording over cassette": "Enregistrement par-dessus la cassette",
        "Cassette erased and rewound": "Cassette effacée et rembobinée",
        "well placed": "bien placée(s)",
        "wrong spot": "mal placée(s)",
        "absent": "absente(s)"
      }
    };
    global.KGI18N = {
      t: function (key) {
        var lang = (global.document && global.document.documentElement &&
          global.document.documentElement.lang || "en").slice(0, 2).toLowerCase();
        var table = VHS_DICT[lang];
        if (table && Object.prototype.hasOwnProperty.call(table, key)) return table[key];
        return key; // English keys are the source strings
      }
    };
  }

  // Allow pre-load configuration: window.KG_VHS_LIBRARY_CONFIG = { apiUrl: ... }
  if (global.KG_VHS_LIBRARY_CONFIG) {
    global.KGVHSLibrary.configure(global.KG_VHS_LIBRARY_CONFIG);
  }
})(typeof window !== "undefined" ? window : this);
