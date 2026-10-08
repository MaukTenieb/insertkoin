/*!
 * KG-VHS Recorder — records YouTube channels onto cassettes via CHANNEL.SCRAPE,
 * and manages the cassette shelf inside the VHS cabinet.
 *
 * Record-over-the-cassette (classic VCR behaviour): when a cassette is loaded
 * on the deck, REC erases it on success — every backend job of that channel is
 * deleted once the new recording completes, so the tape holds the fresh
 * tracks only. Cancel or failure erases nothing. With no cassette loaded,
 * REC records a new tape. Tape Tools → ERASE still erases without recording.
 *
 * DOM contract (see kg-vhs.html, .vhs-catalogue):
 *   [data-vhs-shelf]         shelf wrapper (hidden when the library is empty)
 *   [data-vhs-tape-all]      "all tapes" button
 *   [data-vhs-shelf-row]     cassette buttons are injected here
 *   [data-vhs-shelf-empty]   "no cassette yet" hint
 *   [data-vhs-rec-input]     channel URL field
 *   [data-vhs-rec-btn]       REC button
 *   [data-vhs-rec-cancel]    cancel button (visible while recording)
 *   [data-vhs-rec-progress]  progress line
 *   [data-vhs-rec-hint]      hint line (injected; REC-over explanation)
 *
 * Autrefois: KGVHSLibrary (kg-vhs-library.js) must be loaded first — it owns
 * the backend URL, the cache and window.KG_VHS_TRACKS. Events:
 *   "kg-vhs:recording"  (detail: {jobId, url})
 *   "kg-vhs:recorded"   (detail: {channel, count})
 *   "kg-vhs:failed"     (detail: {error})
 * Zero dependency. Defensive: every hook is optional.
 */
(function (global) {
  "use strict";

  var VERSION = "1.0.0";
  var RECORDED_KEY = "kg.vhs-library.recorded.v1"; // markers for fresh recordings

  var shelfDone = false;
  // Click handler for tape buttons, shared across re-renders (renderShelf is
  // called from several places, not all of which know the callback).
  var shelfPick = null;

  function t(key) {
    if (global.KGI18N && typeof global.KGI18N.t === "function") {
      try { var out = global.KGI18N.t(key); if (typeof out === "string" && out) return out; } catch (_e) {}
    }
    return key;
  }

  function q(root, sel) { return root ? root.querySelector(sel) : null; }

  function lib() { return global.KGVHSLibrary || null; }

  /* ------------------------------------------------------------------ *
   *  Recorded-markers: remembers this session's fresh recordings so the
   *  shelf can badge them ("REC ●" style) until the page is reloaded.
   * ------------------------------------------------------------------ */
  function readRecorded() {
    try { return JSON.parse(global.localStorage.getItem(RECORDED_KEY) || "[]"); }
    catch (_e) { return []; }
  }
  function writeRecorded(arr) {
    try { global.localStorage.setItem(RECORDED_KEY, JSON.stringify(arr.slice(-20))); } catch (_e) {}
  }
  function markRecorded(channel) {
    var arr = readRecorded();
    if (arr.indexOf(channel) < 0) { arr.push(channel); writeRecorded(arr); }
  }
  function isFresh(channel) { return readRecorded().indexOf(channel) >= 0; }

  /* ------------------------------------------------------------------ *
   *  Shelf
   * ------------------------------------------------------------------ */
  function renderShelf(root, onPick) {
    var L = lib();
    if (!L) return;
    if (typeof onPick === "function") shelfPick = onPick;
    var pick = typeof onPick === "function" ? onPick : shelfPick;
    var tapes = L.tapes();
    var row = q(root, "[data-vhs-shelf-row]");
    var wrap = q(root, "[data-vhs-shelf]");
    var empty = q(root, "[data-vhs-shelf-empty]");
    var allBtn = q(root, "[data-vhs-tape-all]");
    if (!row || !wrap) return;

    var hasTapes = tapes.length > 0;
    wrap.hidden = !hasTapes;
    if (empty) empty.hidden = hasTapes;

    row.textContent = "";
    if (allBtn) allBtn.hidden = !hasTapes;
    if (!hasTapes) return;

    // The REC-over hint follows the page's language on every rebuild.
    var hint = q(root, "[data-vhs-rec-hint]");
    if (hint) hint.textContent = t("Load a cassette and record a new channel over it: the tape is erased and rewound with fresh tracks.");

    tapes.forEach(function (tape) {
      var b = global.document.createElement("button");
      b.type = "button";
      b.className = "vhs-tape";
      b.setAttribute("data-vhs-tape", tape.channel);

      var name = global.document.createElement("span");
      name.className = "vhs-tape-name";
      name.textContent = tape.channel + (isFresh(tape.channel) ? " \u25CF" : "");
      b.appendChild(name);

      var count = global.document.createElement("span");
      count.className = "vhs-tape-count";
      count.textContent = tape.count + " " + t("tracks");
      b.appendChild(count);

      b.addEventListener("click", function () {
        // Select on the library, then push into the deck (no autoplay).
        L.selectTape(tape.channel);
        if (global.KGVHS && typeof global.KGVHS.refreshTracks === "function") {
          global.KGVHS.refreshTracks();
        }
        if (typeof pick === "function") pick(tape);
        Array.prototype.forEach.call(row.querySelectorAll(".vhs-tape"), function (el) {
          el.classList.toggle("is-active", el === b);
        });
        if (allBtn) allBtn.classList.remove("is-active");
      });
      row.appendChild(b);
    });

    if (allBtn) {
      allBtn.onclick = function () {
        L.selectAll();
        if (global.KGVHS && typeof global.KGVHS.refreshTracks === "function") {
          global.KGVHS.refreshTracks();
        }
        if (typeof pick === "function") pick(null);
        Array.prototype.forEach.call(row.querySelectorAll(".vhs-tape"), function (el) {
          el.classList.remove("is-active");
        });
        allBtn.classList.add("is-active");
      };
    }
  }

  /* ------------------------------------------------------------------ *
   *  Backend channel-jobs helpers (shared by record-over and Tape Tools)
   * ------------------------------------------------------------------ */
  /** Delete every backend job of a channel. Resolves with the number of jobs
   *  actually deleted (-1 if the history could not be read: nothing deleted).
   *  Used both by record-over-the-cassette and by Tape Tools → ERASE. */
  function eraseChannelJobs(L, channel) {
    return historyJobsFor(L, channel).then(function (jobs) {
      var base = String(L.apiUrl() || "").replace(/\/+$/, "");
      return Promise.all(jobs.map(function (id) {
        return fetch(base + "/history/" + id, { method: "DELETE" })
          .then(function (r) { return r.ok ? 1 : 0; })
          .catch(function () { return 0; });
      })).then(function (res) {
        return res.reduce(function (a, b) { return a + b; }, 0);
      });
    }).catch(function () { return -1; });
  }

  /* ------------------------------------------------------------------ *
   *  REC bay hint: the classic VCR behaviour, spelled out once
   * ------------------------------------------------------------------ */
  function ensureHint(root) {
    var bay = q(root, "[data-vhs-rec]");
    if (!bay || q(bay, "[data-vhs-rec-hint]")) return;
    var hint = global.document.createElement("div");
    hint.className = "vhs-rec-hint";
    hint.setAttribute("data-vhs-rec-hint", "");
    hint.textContent = t("Load a cassette and record a new channel over it: the tape is erased and rewound with fresh tracks.");
    var progress = q(bay, "[data-vhs-rec-progress]");
    if (progress && progress.nextSibling) bay.insertBefore(hint, progress.nextSibling);
    else bay.appendChild(hint);
  }

  /* ------------------------------------------------------------------ *
   *  Recorder: POST /scrape/start, poll /scrape/status?since=N
   * ------------------------------------------------------------------ */
  var rec = { active: false, jobId: null, pollTimer: 0, received: 0, over: null };
  var tools = { channel: null, jobs: [] };

  function YT_URL_RE() {
    return /youtube\.com|youtu\.be/i;
  }

  function setProgress(root, text, isError) {
    var el = q(root, "[data-vhs-rec-progress]");
    if (!el) return;
    el.textContent = text || "";
    el.classList.toggle("is-error", !!isError);
  }

  function setBusy(root, busy) {
    var btn = q(root, "[data-vhs-rec-btn]");
    var cancel = q(root, "[data-vhs-rec-cancel]");
    var input = q(root, "[data-vhs-rec-input]");
    if (btn) btn.setAttribute("aria-busy", busy ? "true" : "false");
    if (cancel) cancel.hidden = !busy;
    if (input) input.disabled = !!busy;
  }

  function stopPolling() {
    if (rec.pollTimer) { global.clearInterval(rec.pollTimer); rec.pollTimer = 0; }
    rec.active = false;
  }

  function finishRecording(root, ok, channel, count, errKey) {
    stopPolling();
    setBusy(root, false);
    if (ok) {
      markRecorded(channel);
      var L = lib();
      var over = rec.over;
      rec.over = null;
      // Record-over: the loaded cassette is erased once the new take is in —
      // its jobs go away, the fresh tracks replace the whole tape.
      var refresh = function (selectChannel) {
        L.invalidate();
        L.ready().then(function () {
          renderShelf(root);
          // Record-over: the deck loads the fresh take, like a VCR that stops
          // on the tape it just rewound with new content.
          if (selectChannel && typeof L.selectTape === "function") L.selectTape(selectChannel);
          if (global.KGVHS && typeof global.KGVHS.refreshTracks === "function") {
            global.KGVHS.refreshTracks();
          }
        });
      };
      if (over && L.current && L.current() === over) {
        eraseChannelJobs(L, over).then(function (erased) {
          setProgress(root,
            t("Cassette erased and rewound") + " \u2014 " + over +
            (erased >= 0 ? " (" + erased + " " + t("jobs erased") + ")" : "") +
            " \u2192 " + channel + " (" + count + " " + t("tracks") + ")", false);
          refresh(channel);
        });
      } else {
        setProgress(root, t("CASSETTE RECORDED") + " \u2014 " + channel + " (" + count + " " + t("tracks") + ")", false);
        refresh();
      }
      global.dispatchEvent(new CustomEvent("kg-vhs:recorded", { detail: { channel: channel, count: count } }));
    } else {
      rec.over = null;
      setProgress(root, t(errKey || "Recording failed."), true);
      global.dispatchEvent(new CustomEvent("kg-vhs:failed", { detail: { error: errKey } }));
    }
  }

  function pollOnce(root) {
    var L = lib();
    if (!L || !rec.active) return;
    var base = String(L.apiUrl() || "").replace(/\/+$/, "");
    fetch(base + "/scrape/status/" + rec.jobId + "?since=" + rec.received)
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (d) {
        if (!rec.active) return;
        var newCount = (d.new_videos || []).length;
        rec.received += newCount;
        var total = d.total || 0;
        var processed = d.processed || rec.received;
        var line;
        if (d.status === "running" || d.status === "pending" || d.status === "exporting") {
          line = t("Recording") + " \u25B8 " + (processed || "\u2026") + (total ? "/" + total : "") +
            " \u00B7 " + ((d.channel && d.channel.channel) || "");
          setProgress(root, line, false);
        } else if (d.status === "completed") {
          var chName = (d.channel && d.channel.channel) || "";
          finishRecording(root, true, chName, d.processed || rec.received);
        } else if (d.status === "cancelled") {
          finishRecording(root, false, "", 0, "Recording cancelled.");
        } else if (d.status === "failed") {
          finishRecording(root, false, "", 0, d.error || "Recording failed.");
        }
        // Note: completed status means exports are ready too (the backend
        // only flips to completed once CSV/JSON/XLSX exist on disk).
      })
      .catch(function (e) {
        if (!rec.active) return;
        finishRecording(root, false, "", 0, "CHANNEL.SCRAPE backend unreachable \u2014 start the local server.");
      });
  }

  function startRecording(root, url) {
    var L = lib();
    if (!L) { setProgress(root, "kg-vhs-library.js missing.", true); return; }
    if (rec.active) { setProgress(root, t("Already recording."), true); return; }
    if (!YT_URL_RE().test(url)) { setProgress(root, t("Not a YouTube URL."), true); return; }

    var base = String(L.apiUrl() || "").replace(/\/+$/, "");
    setBusy(root, true);
    setProgress(root, t("Recording") + " \u25B8 \u2026", false);

    fetch(base + "/scrape/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel_url: url })
    })
      .then(function (r) { if (!r.ok) return r.json().then(function (x) { throw new Error(x.detail || "HTTP " + r.status); }); return r.json(); })
      .then(function (d) {
        rec.active = true;
        rec.jobId = d.job_id;
        rec.received = 0;
        // Record-over: remember the cassette loaded when REC was pressed.
        // Its jobs are erased only once the new take completes.
        rec.over = (L.current && typeof L.current === "function") ? L.current() : null;
        global.dispatchEvent(new CustomEvent("kg-vhs:recording", { detail: { jobId: d.job_id, url: url } }));
        rec.pollTimer = global.setInterval(function () { pollOnce(root); }, 1500);
        pollOnce(root);
      })
      .catch(function (e) {
        setBusy(root, false);
        setProgress(root, String(e.message || e), true);
        global.dispatchEvent(new CustomEvent("kg-vhs:failed", { detail: { error: String(e.message || e) } }));
      });
  }

  function cancelRecording(root) {
    if (!rec.active || !rec.jobId) return;
    var L = lib();
    var base = String(L.apiUrl() || "").replace(/\/+$/, "");
    fetch(base + "/scrape/cancel/" + rec.jobId, { method: "POST" })
      .then(function () { /* pollOnce will see "cancelled" */ })
      .catch(function () { stopPolling(); setBusy(root, false); setProgress(root, t("Recording cancelled."), true); });
  }

  /* ------------------------------------------------------------------ *
   *  Finder (Explorer -> deck): live filter over the rendered tracklist,
   *  plus the tape-order / date / title / shuffle re-ordering borrowed
   *  from the React Explorer's sort modes.
   *  The tracklist belongs to the cabinet; we only toggle CSS classes and
   *  set style.order on its items (flex column), so the deck logic stays
   *  untouched.
   * ------------------------------------------------------------------ */
  var findState = { needle: "", mode: "native", seed: 1 };

  function trackKey(b) {
    return (b.textContent || "").trim().toLowerCase();
  }

  function sortTrackButtons(buttons, mode) {
    // Returns Map(button -> orderIndex) for the requested mode.
    var arr = Array.prototype.slice.call(buttons);
    var n = arr.length, i;
    if (mode === "native" || !mode) {
      for (i = 0; i < n; i++) arr[i].__ord = i;
      return;
    }
    if (mode === "random") {
      // Deterministic seeded shuffle (same recipe as the React Explorer):
      var s = findState.seed || 1;
      var rand = function () { s = (s * 9301 + 49297) % 233280; return s / 233280; };
      for (i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(rand() * (i + 1));
        var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
      }
      for (i = 0; i < n; i++) arr[i].__ord = i;
      return;
    }
    var keyFn = trackKey;
    var parsed = arr.map(function (b, idx) {
      // Duration like 12:34 or 1:02:03 if the deck prints one in the row.
      var m = (b.textContent || "").match(/\b(\d{1,2}:\d{2}(?::\d{2})?)\b/);
      var secs = 0;
      if (m) {
        var parts = m[1].split(":").map(Number);
        secs = parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts[0] * 60 + parts[1];
      }
      return { b: b, idx: idx, key: keyFn(b), dur: secs, num: parseInt((b.textContent || "").replace(/\D+/g, ""), 10) || 0 };
    });
    var cmp;
    if (mode === "date_desc" || mode === "date_asc") {
      // The deck rows carry no raw date: keep tape order for date modes
      // unless a readable date exists (fallback = tape order = newest first
      // for scraped cassettes, which yt-dlp lists newest-first).
      cmp = function (a, b) { return a.idx - b.idx; };
    } else if (mode === "title_az") {
      cmp = function (a, b) { return a.key < b.key ? -1 : a.key > b.key ? 1 : a.idx - b.idx; };
    } else if (mode === "title_za") {
      cmp = function (a, b) { return a.key > b.key ? -1 : a.key < b.key ? 1 : a.idx - b.idx; };
    } else {
      cmp = function (a, b) { return a.idx - b.idx; };
    }
    parsed.sort(cmp);
    for (i = 0; i < parsed.length; i++) parsed[i].b.__ord = i;
  }

  function applyFind(root) {
    var input = q(root, "[data-vhs-find-input]");
    var count = q(root, "[data-vhs-find-count]");
    var needle = (input && input.value || findState.needle || "").trim().toLowerCase();
    var list = q(root, "[data-vhs-tracklist]");
    if (!list) return;
    var items = list.children; // <li> wrappers (or buttons when flat)
    var shown = 0, total = items.length;
    Array.prototype.forEach.call(items, function (li) {
      var b = li.matches && li.matches("[data-vhs-track]") ? li : li.querySelector ? li.querySelector("[data-vhs-track]") : null;
      var text = (b || li).textContent || "";
      var ok = !needle || text.toLowerCase().indexOf(needle) >= 0;
      (b || li).classList.toggle("vhs-track-hidden", !ok);
      if (ok) shown++;
    });
    sortTrackButtons(root.querySelectorAll("[data-vhs-track]"), findState.mode);
    Array.prototype.forEach.call(items, function (li, i) {
      var b = li.matches && li.matches("[data-vhs-track]") ? li : li.querySelector ? li.querySelector("[data-vhs-track]") : null;
      if (b && typeof b.__ord === "number") li.style.order = b.__ord;
      else li.style.order = i;
    });
    if (count) count.textContent = needle ? (shown + "/" + total) : "";
  }

  function wireFind(root) {
    var input = q(root, "[data-vhs-find-input]");
    var sort = q(root, "[data-vhs-find-sort]");
    if (!input || input.__vhsFind) return;
    input.__vhsFind = true;
    if (findState.needle) input.value = findState.needle;
    if (sort && findState.mode !== "native") sort.value = findState.mode;
    input.addEventListener("input", function () { findState.needle = input.value; applyFind(root); });
    if (sort) {
      sort.addEventListener("change", function () {
        findState.mode = sort.value;
        if (findState.mode === "random") findState.seed = (Date.now() % 233279) + 1;
        applyFind(root);
      });
    }
    // New tracks (refreshTracks) must respect the current filter and sort.
    var obs = new MutationObserver(function () { applyFind(root); });
    var list = q(root, "[data-vhs-tracklist]");
    if (list && global.MutationObserver) obs.observe(list, { childList: true });
  }

  /* ------------------------------------------------------------------ *
   *  Tape tools (History -> deck): exports + erase for one cassette.
   *  Erase removes every job recorded for that channel, then refreshes.
   * ------------------------------------------------------------------ */

  function historyJobsFor(L, channel) {
    var base = String(L.apiUrl() || "").replace(/\/+$/, "");
    return fetch(base + "/history")
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (d) {
        var jobs = [];
        (d.items || []).forEach(function (it) {
          var name = (it.channel && it.channel.channel) || it.channel || "Unknown";
          if (name === channel) jobs.push(it.id);
        });
        return jobs;
      });
  }

  function armEject(root, jobs, channel) {
    var btn = q(root, "[data-vhs-tapetools-eject]");
    if (!btn) return;
    if (btn.__armed) {
      // Second click: erase every job of this cassette, then refresh.
      var L = lib();
      var base = String(L.apiUrl() || "").replace(/\/+$/, "");
      btn.disabled = true;
      Promise.all(jobs.map(function (id) {
        return fetch(base + "/history/" + id, { method: "DELETE" })
          .catch(function () { return null; });
      })).then(function () {
        tools.channel = null; tools.jobs = [];
        showTools(root, null);
        L.invalidate();
        L.ready().then(function () {
          renderShelf(root);
          L.selectAll();
          if (global.KGVHS && typeof global.KGVHS.refreshTracks === "function") global.KGVHS.refreshTracks();
        });
      });
      return;
    }
    btn.__armed = true;
    btn.classList.add("is-armed");
    btn.textContent = t("SURE?");
    global.setTimeout(function () {
      btn.__armed = false;
      btn.classList.remove("is-armed");
      btn.textContent = t("ERASE");
      btn.disabled = false;
    }, 2500);
  }

  function showTools(root, selection) {
    var bar = q(root, "[data-vhs-tapetools]");
    if (!bar) return;
    var L = lib();
    tools.channel = selection ? selection.channel : null;
    bar.hidden = !selection;
    var name = q(root, "[data-vhs-tapetools-name]");
    if (name) name.textContent = selection ? selection.channel + " (" + selection.count + " " + t("tracks") + ")" : "";
    if (!selection || !L) return;
    var base = String(L.apiUrl() || "").replace(/\/+$/, "");
    historyJobsFor(L, selection.channel).then(function (jobs) {
      tools.jobs = jobs;
      var newest = jobs[jobs.length - 1] || jobs[0]; // /history is newest-first
      ["csv", "json", "xlsx", "txt", "md"].forEach(function (fmt) {
        var a = q(root, "[data-vhs-tapetools-" + fmt + "]");
        if (a) a.href = newest ? base + "/scrape/download/" + newest + "/" + fmt : "#";
      });
      var btn = q(root, "[data-vhs-tapetools-eject]");
      if (btn) {
        btn.__armed = false;
        btn.classList.remove("is-armed");
        btn.textContent = t("ERASE");
        btn.disabled = jobs.length === 0;
        btn.onclick = function () { armEject(root, jobs, selection.channel); };
      }
    }).catch(function () { /* tools stay inert offline */ });
  }

  /* ------------------------------------------------------------------ *
   *  Teletext (Critiques -> deck): the review feeds, decoded on P100.
   * ------------------------------------------------------------------ */
  /* Le teletext a besoin d'un backend vivant : sans backend, le bouton
     KRITIK reste caché — pas de mur d'erreurs « injoignable » à l'écran. */
  function ttxGate(root) {
    var openBtn = root && q(root, "[data-vhs-ttx-btn]");
    if (!openBtn) return false;
    var up = false;
    try {
      var L = lib();
      var st = L && L.status();
      up = !!(st && st.fromBackend);
    } catch (_e) { up = false; }
    openBtn.hidden = !up;
    if (!up) {
      var panel = q(root, "[data-vhs-ttx]");
      if (panel) panel.hidden = true;
    }
    return up;
  }

  function wireTeletext(root) {
    var openBtn = q(root, "[data-vhs-ttx-btn]");
    var panel = q(root, "[data-vhs-ttx]");
    var closeBtn = q(root, "[data-vhs-ttx-close]");
    if (!openBtn || openBtn.__vhsTtx) return;
    openBtn.__vhsTtx = true;
    var sourcesEl = q(root, "[data-vhs-ttx-sources]");
    var itemsEl = q(root, "[data-vhs-ttx-items]");

    // Le teletext lit un backend vivant : sans backend, le bouton KRITIK
    // reste caché au lieu d'afficher un mur d'erreurs injoignable.
    ttxGate(root);

    function setStatus(text) {
      if (itemsEl) { var h = global.document.createElement("div"); h.className = "vhs-ttx-status"; h.textContent = text; itemsEl.textContent = ""; itemsEl.appendChild(h); }
    }
    function setError(text) {
      if (itemsEl) { var h = global.document.createElement("div"); h.className = "vhs-ttx-error"; h.textContent = text; itemsEl.textContent = ""; itemsEl.appendChild(h); }
    }
    function markActive(src) {
      Array.prototype.forEach.call(sourcesEl.querySelectorAll(".vhs-ttx-source"), function (b) {
        b.classList.toggle("is-active", b.getAttribute("data-vhs-ttx-source") === src.value);
      });
    }

    function loadFeed(src) {
      var L = lib();
      if (!L || !itemsEl) return;
      markActive(src);
      setStatus(t("Loading page") + " \u25B8 " + src.label + " \u2026");
      var base = String(L.apiUrl() || "").replace(/\/+$/, "");
      fetch(base + "/critiques/feed?source=" + encodeURIComponent(src.value))
        .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
        .then(function (d) {
          var items = d.items || [];
          itemsEl.textContent = "";
          if (!items.length) { setError(t("No pages on this feed.")); return; }
          if (src.value === "videos") {
            // Cassettes page: every line is a track on tape — click plays it.
            items.slice(0, 40).forEach(function (it) {
              var vb = global.document.createElement("button");
              vb.type = "button";
              vb.className = "vhs-ttx-item vhs-ttx-match-track";
              var vidx = global.document.createElement("span");
              vidx.className = "idx";
              vidx.textContent = "\u25B6";
              vb.appendChild(vidx);
              vb.appendChild(global.document.createTextNode((it.channel ? it.channel + " \u2014 " : "") + (it.title || "")));
              vb.addEventListener("click", function () {
                if (it.channel && typeof L.selectTape === "function") {
                  L.selectTape(it.channel);
                  if (global.KGVHS && typeof global.KGVHS.refreshTracks === "function") global.KGVHS.refreshTracks();
                }
                if (global.KGVHS && typeof global.KGVHS.playByVideoId === "function") {
                  global.KGVHS.playByVideoId(it.video_id);
                }
              });
              itemsEl.appendChild(vb);
            });
            return;
          }
          items.slice(0, 40).forEach(function (it, i) {
            var a = global.document.createElement("a");
            a.className = "vhs-ttx-item";
            a.href = it.url || it.link || "#";
            a.target = "_blank";
            a.rel = "noopener";
            var idx = global.document.createElement("span");
            idx.className = "idx";
            idx.textContent = (i + 1 < 10 ? "0" : "") + (i + 1);
            a.appendChild(idx);
            a.appendChild(global.document.createTextNode(it.title || it.url || ""));
            itemsEl.appendChild(a);
          });
        })
        .catch(function (e) { setError(t("Feed unavailable.") + " (" + (e.message || e) + ")"); });
    }

    /* MATCH: the review feed crossed with the cassette library (SensCritique
       data against scraped tracks). A match is two lines: the review (opens
       the source) and the cassette track (loads its tape and plays it). */
    function loadMatch(src) {
      var L = lib();
      if (!L || !itemsEl) return;
      markActive(src);
      setStatus(t("Matching reviews with cassettes") + " \u25B8 " + src.label + " \u2026");
      var base = String(L.apiUrl() || "").replace(/\/+$/, "");
      fetch(base + "/critiques/match?source=" + encodeURIComponent(src.value))
        .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
        .then(function (d) {
          var matches = d.matches || [];
          itemsEl.textContent = "";
          var head = global.document.createElement("div");
          head.className = "vhs-ttx-status";
          head.textContent = t("reviews read") + " : " + (d.reviews || 0) + " \u00B7 " +
            t("tracks in the library") + " : " + (d.library || 0) + " \u00B7 " +
            t("on cassettes") + " : " + matches.length;
          itemsEl.appendChild(head);
          if (!matches.length) { setError(t("No match on the cassettes.")); return; }
          matches.slice(0, 30).forEach(function (m) {
            var row = global.document.createElement("div");
            row.className = "vhs-ttx-match";
            var rev = global.document.createElement("a");
            rev.className = "vhs-ttx-item";
            rev.href = (m.review && m.review.url) || "#";
            rev.target = "_blank"; rev.rel = "noopener";
            var ridx = global.document.createElement("span");
            ridx.className = "idx";
            ridx.textContent = (m.review && m.review.score) || (m.review && m.review.source) || "\u2014";
            rev.appendChild(ridx);
            rev.appendChild(global.document.createTextNode((m.review && m.review.title) || ""));
            row.appendChild(rev);
            var tr = global.document.createElement("button");
            tr.type = "button";
            tr.className = "vhs-ttx-item vhs-ttx-match-track";
            var tidx = global.document.createElement("span");
            tidx.className = "idx";
            tidx.textContent = "\u25B6";
            tr.appendChild(tidx);
            tr.appendChild(global.document.createTextNode(
              (m.track && (m.track.channel + " \u2014 " + m.track.title)) || ""));
            tr.addEventListener("click", function () {
              // Charge la cassette de la piste, puis joue la piste.
              var chan = m.track && m.track.channel;
              if (chan && typeof L.selectTape === "function") {
                L.selectTape(chan);
                if (global.KGVHS && typeof global.KGVHS.refreshTracks === "function") global.KGVHS.refreshTracks();
              }
              if (global.KGVHS) {
                if (typeof global.KGVHS.playByVideoId === "function") {
                  global.KGVHS.playByVideoId(m.track && m.track.video_id);
                } else if (typeof global.KGVHS.playByTitle === "function") {
                  global.KGVHS.playByTitle(m.track && m.track.title);
                }
              }
            });
            row.appendChild(tr);
            itemsEl.appendChild(row);
          });
        })
        .catch(function (e) { setError(t("Match unavailable.") + " (" + (e.message || e) + ")"); });
    }
    function loadSources() {
      var L = lib();
      if (!L || !sourcesEl) return;
      var base = String(L.apiUrl() || "").replace(/\/+$/, "");
      fetch(base + "/critiques/sources")
        .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
        .then(function (d) {
          sourcesEl.textContent = "";
          (d.sources || []).forEach(function (src) {
            var b = global.document.createElement("button");
            b.type = "button";
            b.className = "vhs-ttx-source";
            b.setAttribute("data-vhs-ttx-source", src.value);
            b.textContent = src.label || src.value;
            b.addEventListener("click", function () { loadFeed(src); });
            sourcesEl.appendChild(b);
            // MATCH variant: same source, review↔cassette crossing. The
            // videos source IS the library — it never matches itself.
            if (src.value === "videos") return;
            var mb = global.document.createElement("button");
            mb.type = "button";
            mb.className = "vhs-ttx-source vhs-ttx-source-match";
            mb.setAttribute("data-vhs-ttx-source", src.value + ":match");
            mb.title = t("Matching reviews with cassettes");
            mb.textContent = (src.label || src.value) + " \u21C4";
            mb.addEventListener("click", function () { loadMatch({ value: src.value, label: src.label || src.value }); });
            sourcesEl.appendChild(mb);
          });
        })
        .catch(function () { setError(t("CHANNEL.SCRAPE backend unreachable \u2014 start the local server.")); });
    }
    openBtn.addEventListener("click", function () {
      if (!panel) return;
      panel.hidden = !panel.hidden;
      if (!panel.hidden && sourcesEl && !sourcesEl.childNodes.length) loadSources();
    });
    if (closeBtn) closeBtn.addEventListener("click", function () { if (panel) panel.hidden = true; });
  }

  /* ------------------------------------------------------------------ *
   *  Boot: auto-wire when the cabinet DOM exists, retry while absent
   * ------------------------------------------------------------------ */
  function wire(root) {
    if (!root || root.__vhsRec) return !!root.__vhsRec;
    var recBtn = q(root, "[data-vhs-rec-btn]");
    var cancelBtn = q(root, "[data-vhs-rec-cancel]");
    var input = q(root, "[data-vhs-rec-input]");
    if (!recBtn) return false;

    root.__vhsRec = true;
    ensureHint(root);
    var onPick = function (tape) { showTools(root, tape); };
    recBtn.addEventListener("click", function () {
      var v = (input && input.value || "").trim();
      if (!v) { setProgress(root, t("Not a YouTube URL."), true); return; }
      startRecording(root, v);
    });
    if (input) {
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          var v = input.value.trim();
          if (v) startRecording(root, v);
        }
      });
    }
    if (cancelBtn) cancelBtn.addEventListener("click", function () { cancelRecording(root); });

    wireFind(root);
    wireTeletext(root);

    var onPick = function (tape) { showTools(root, tape); };
    shelfPick = onPick;

    var L = lib();
    if (L) {
      // When the load settles (backend or cache), rebuild the shelf AND push
      // the tracks into the deck — the cabinet may have booted before the
      // fetch answered, in which case its tracklist is still empty.
      L.ready().then(function () {
        renderShelf(root, onPick);
        // La porte du teletext dépend de l'état réel du backend.
        ttxGate(root);
        if (global.KGVHS && typeof global.KGVHS.refreshTracks === "function" &&
            !(global.KGVHS.debug && global.KGVHS.debug().tracks > 0)) {
          global.KGVHS.refreshTracks();
        }
      });
    }
    renderShelf(root, onPick); // cache-only first paint if the backend is down
    return true;
  }

  function boot() {
    var root = global.document.querySelector("[data-vhs-root]");
    if (!root || !wire(root)) {
      global.setTimeout(boot, 400);
    }
  }
  // The cabinet fragment is injected lazily by kg-loader; retry until then.
  boot();

  global.KGVHSRecorder = {
    version: VERSION,
    /** Rebuild the shelf (called after library changes). */
    refresh: function () { renderShelf(global.document.querySelector("[data-vhs-root]")); },
    /** True while a recording is in flight. */
    isRecording: function () { return rec.active; },
    /** Testing hooks. */
    _start: startRecording,
    _wire: wire
  };
})(typeof window !== "undefined" ? window : this);
