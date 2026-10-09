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
 * KG-VHS Scrape — CHANNEL.SCRAPE inside the page, for the public site where no local
 * server runs. A YouTube channel (or playlist) URL becomes a cassette: { channel, channel_url, tracks:[{id,title}] }.
 *
 * Roads, first that answers wins (the same as FaunaTor's):
 *   0. YouTube's own Data API, when a key is set — the whole channel, with views, likes, comments, durations;
 *   1. Invidious and Piped instances (open APIs, CORS), raced — the whole channel, page after page;
 *   2. the channel's uploads playlist page, read through the public relays or Tor — up to ~100;
 *   3. the channel's RSS feed — the latest 15.
 */
(function (g) {
  "use strict";
  var enc = encodeURIComponent;
  var RELAYS = [
    function (u) { return "https://api.allorigins.win/raw?url=" + enc(u); },
    function (u) { return "https://api.cors.lol/?url=" + enc(u); },
    function (u) { return "https://cors.x2u.in/" + u; },
    function (u) { return "https://thingproxy.freeboard.io/fetch/" + u; }
  ];
  /* YouTube's own API (free, a key restricted to the site). Put the key here once it exists: */
  var YT_KEY = "";
  function ytKey() { try { return g.KG_YT_KEY || localStorage.getItem("vhs.ytkey") || YT_KEY; } catch (e) { return YT_KEY; } }
  var WHY = [];
  function why(road, e) { WHY.push(road + ": " + String((e && (e.message || e)) || "no answer").slice(0, 60)); }
  var INVIDIOUS = ["inv.nadeko.net", "invidious.nerdvpn.de", "yewtu.be", "invidious.f5.si", "iv.melmac.space", "invidious.privacyredirect.com", "invidious.materialio.us", "inv.tux.pizza"];

  function timed(url, ms, json) {
    var ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var t = ctl ? setTimeout(function () { try { ctl.abort(); } catch (e) {} }, ms) : null;
    return fetch(url, ctl ? { signal: ctl.signal } : {}).then(function (r) {
      if (t) clearTimeout(t);
      if (!r.ok) throw new Error("http " + r.status);
      return json ? r.json() : r.text();
    }, function (e) { if (t) clearTimeout(t); throw e; });
  }
  /* a refused page is asked again, after a breath, before the road gives up */
  function again(mk, tries, wait) {
    return mk().catch(function (e) { if (tries <= 1) throw e; return new Promise(function (r) { setTimeout(r, wait || 1500); }).then(function () { return again(mk, tries - 1, (wait || 1500) * 2); }); });
  }
  function any(ps) {
    return new Promise(function (res, rej) {
      var n = ps.length, f = 0; if (!n) rej(new Error("none"));
      var last = "";
      ps.forEach(function (p) { p.then(res, function (e) { if (e && e.message && !/^(all|0)$/.test(e.message)) last = e.message; if (++f === n) rej(new Error(last || "all")); }); });
    });
  }
  var torMod = null;
  function tor() { return torMod || (torMod = import("./faunator-tor.js").catch(function () { return null; })); }
  /* a YouTube page, through the relays and Tor at once */
  /* r.jina.ai renders the page in a real browser and hands the HTML back, CORS open */
  function jina(u, ms) {
    var ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var t = ctl ? setTimeout(function () { try { ctl.abort(); } catch (e) {} }, ms || 40000) : null;
    return fetch("https://r.jina.ai/" + u, { headers: { "X-Return-Format": "html" }, signal: ctl ? ctl.signal : undefined }).then(function (r) {
      if (t) clearTimeout(t); if (!r.ok) throw new Error("jina " + r.status); return r.text();
    }, function (e) { if (t) clearTimeout(t); throw e; }).then(function (x) { if (!x || x.length < 500) throw new Error("jina empty"); return x; });
  }
  function page(u) {
    var ps = RELAYS.map(function (f) { return timed(f(u), 12000).then(function (x) { if (!x || x.length < 500) throw 0; return x; }); });
    ps.unshift(jina(u));
    ps.push(tor().then(function (m) { if (!m) throw 0; return m.get(u); }).then(function (r) { if (!r || !r.text || r.text.length < 500) throw 0; return r.text; }));
    return any(ps);
  }
  function unesc(s) {
    try { return JSON.parse('"' + s + '"'); } catch (e) { return s.replace(/\\u0026/g, "&").replace(/\\"/g, '"'); }
  }

  /* the channel's id (UC…) and name, from any channel / handle / video / playlist URL */
  function resolve(url) {
    url = String(url || "").trim();
    var m = /youtube\.com\/channel\/(UC[\w-]{22})/i.exec(url);
    var pl = /[?&]list=([\w-]{10,})/i.exec(url);
    if (pl && !/^UU/.test(pl[1])) return Promise.resolve({ playlist: pl[1], url: url });
    if (m) {
      return page("https://www.youtube.com/channel/" + m[1]).then(function (h) { return { id: m[1], name: nameOf(h), url: url }; },
        function () { return { id: m[1], name: "", url: url }; });
    }
    var u = /^https?:/i.test(url) ? url : "https://www.youtube.com/" + url.replace(/^@?/, "@");
    var hd = /@([^\/?#]+)/.exec(u), us = /\/(?:c|user)\/([^\/?#]+)/.exec(u);
    var viaPiped = (hd || us) ? any(PIPED_FIRST.map(function (host) {
      return timed("https://" + host + (hd ? "/@/" + hd[1] : "/c/" + us[1]), 12000, true).then(function (d) { if (!d || !/^UC[\w-]{22}$/.test(d.id || "")) throw 0; return { id: d.id, name: d.name || "", url: url, piped: d, host: host }; });
    })) : Promise.reject(new Error("no handle"));
    return any([viaPiped, page(u).then(function (h) {
      var id = (/"externalId":"(UC[\w-]{22})"/.exec(h) || /"channelId":"(UC[\w-]{22})"/.exec(h) || /channel\/(UC[\w-]{22})/.exec(h) || [])[1];
      if (!id) throw new Error("no channel");
      return { id: id, name: nameOf(h), url: url };
    })]);
  }
  function nameOf(h) {
    var n = (/<meta property="og:title" content="([^"]+)"/.exec(h) || /"channelMetadataRenderer":\{"title":"([^"]+)"/.exec(h) || [])[1];
    return n ? unesc(n.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"')) : "";
  }

  /* road 0: the YouTube Data API — channel id from a handle, then the uploads playlist, 50 at a time */
  function api(url, prog, stop) {
    var key = ytKey(); if (!key) return Promise.reject(new Error("no key"));
    var A = "https://www.googleapis.com/youtube/v3/";
    url = String(url).trim();
    var pl = /[?&]list=([\w-]{10,})/i.exec(url), ch = /channel\/(UC[\w-]{22})/i.exec(url), h = /@([\w.\-\u00C0-\u024F]+)/.exec(url);
    var q = pl ? Promise.resolve({ list: pl[1], name: "" })
      : timed(A + "channels?part=snippet,contentDetails&key=" + key + (ch ? "&id=" + ch[1] : h ? "&forHandle=" + enc("@" + h[1]) : "&forUsername=" + enc(url.replace(/^.*\//, ""))), 15000, true)
          .then(function (d) { var it = d.items && d.items[0]; if (!it) throw new Error("channel not found");
            return { list: it.contentDetails.relatedPlaylists.uploads, name: it.snippet.title }; });
    return q.then(function (c) {
      var out = [], name = c.name;
      function page(tok, n) {
        if (stop()) throw new Error("cancelled");
        return timed(A + "playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=" + c.list + "&key=" + key + (tok ? "&pageToken=" + tok : ""), 15000, true).then(function (d) {
          (d.items || []).forEach(function (it) { var sn = it.snippet || {}, id = sn.resourceId && sn.resourceId.videoId;
            if (id && sn.title !== "Private video" && sn.title !== "Deleted video") out.push({ id: id, title: sn.title, date: ((it.contentDetails && it.contentDetails.videoPublishedAt) || sn.publishedAt || "").slice(0, 10) }); if (!name) name = sn.channelTitle || ""; });
          prog(out.length, name);
          return d.nextPageToken && n < 60 ? page(d.nextPageToken, n + 1) : out;
        });
      }
      return page("", 0).then(function (t) { if (!t.length) throw new Error("empty"); return details(t, key, stop).then(function () { return { channel: name || c.list, channel_url: url, tracks: t }; }); });
    });
  }

  /* durations, views, likes, comments — 50 videos per call */
  function iso(d) { var m = /P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(d || "") || []; return (+m[1] || 0) * 86400 + (+m[2] || 0) * 3600 + (+m[3] || 0) * 60 + (+m[4] || 0); }
  function details(t, key, stop) {
    var by = {}, ids = t.map(function (x) { by[x.id] = x; return x.id; }), chunks = [];
    for (var i = 0; i < ids.length && i < 3000; i += 50) chunks.push(ids.slice(i, i + 50));
    var k = 0;
    function next() {
      if (k >= chunks.length || stop()) return Promise.resolve();
      return timed("https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=" + chunks[k++].join(",") + "&key=" + key, 15000, true).then(function (d) {
        (d.items || []).forEach(function (v) { var x = by[v.id]; if (!x) return; var st = v.statistics || {};
          x.duration = iso(v.contentDetails && v.contentDetails.duration); x.views = +st.viewCount || 0; x.likes = +st.likeCount || 0; x.comments = +st.commentCount || 0; });
      }).then(next, next);
    }
    return next();
  }

  /* road 1b: Piped — another open API, page after page */
  var PIPED_FIRST = ["api.piped.private.coffee", "pipedapi.kavin.rocks"];
  var PIPED = ["api.piped.private.coffee", "pipedapi.kavin.rocks", "pipedapi.adminforge.de", "pipedapi.r4fo.com", "pipedapi.leptons.xyz", "pipedapi.nosebs.ru", "piped-api.lunar.icu", "pipedapi.drgns.space", "pipedapi.ducks.party", "pipedapi.reallyaweso.me"];
  function livePiped() {
    return timed("https://piped-instances.kavin.rocks/", 8000, true).then(function (a) {
      return a.filter(function (x) { return x && x.api_url && x.up_to_date !== false; }).map(function (x) { return x.api_url.replace(/^https?:\/\//, "").replace(/\/+$/, ""); });
    }).catch(function () { return []; });
  }
  function piped(id, prog, stop, live) {
    var hosts = (live || []).concat(PIPED.filter(function (h) { return (live || []).indexOf(h) < 0; }));
    function from(host) {
      var out = [], seen = {}, name = "";
      function take(d) {
        (d.relatedStreams || []).forEach(function (v) { var m = /v=([\w-]{11})/.exec(v.url || ""); if (m && !seen[m[1]]) { seen[m[1]] = 1;
          out.push({ id: m[1], title: v.title || m[1], author: v.uploaderName || name, date: v.uploadedDate && /ago|il y a/i.test(v.uploadedDate) ? v.uploadedDate : v.uploaded > 0 ? new Date(v.uploaded).toISOString().slice(0, 10) : "", duration: v.duration > 0 ? v.duration : 0, views: v.views > 0 ? v.views : 0 }); } });
        prog(out.length);
      }
      function next(np, n) {
        if (stop()) throw new Error("cancelled");
        return again(function () { return timed("https://" + host + "/nextpage/channel/" + id + "?nextpage=" + enc(np), 20000, true); }, 4).then(function (d) {
          take(d);
          return d.nextpage && (d.relatedStreams || []).length && n < 120 && out.length < 5000 ? next(d.nextpage, n + 1) : out;
        }, function () { out.partial = true; return out; });
      }
      /* channels now keep their videos behind a tab */
      function tab(data, np, n) {
        if (stop()) throw new Error("cancelled");
        return again(function () { return timed("https://" + host + "/channels/tabs?data=" + enc(data) + (np ? "&nextpage=" + enc(np) : ""), 20000, true); }, 4).then(function (d) {
          take({ relatedStreams: d.content || d.relatedStreams || [] });
          return d.nextpage && (d.content || []).length && n < 120 && out.length < 5000 ? tab(data, d.nextpage, n + 1) : out;
        }, function (e) { if (out.length) { out.partial = true; return out; } throw e; });
      }
      return timed("https://" + host + "/channel/" + id, 15000, true).then(function (d) {
        name = d.name || ""; take(d);
        if (out.length) return d.nextpage ? next(d.nextpage, 0) : out;
        var tabs = (d.tabs || []).filter(function (t) { return /video|short|stream|live/i.test(t.name || ""); });
        var pls = (d.tabs || []).filter(function (t) { return /playlist/i.test(t.name || ""); })[0];
        var k = 0;
        function each() { if (k >= tabs.length) return Promise.resolve(out); return tab(tabs[k++].data, "", 0).then(each, each); }
        /* an artist's channel keeps its music in playlists (albums): read them when the uploads are thin */
        function lists() {
          if (!pls || out.length >= 50) return out;
          return timed("https://" + host + "/channels/tabs?data=" + enc(pls.data), 20000, true).then(function (q) {
            var ids = (q.content || []).map(function (c) { return (/list=([\w-]+)/.exec(c.url || "") || [])[1]; }).filter(Boolean).slice(0, 40), j = 0;
            function one() {
              if (j >= ids.length || stop() || out.length >= 3000) return out;
              var L = ids[j++];
              function pg(np, n) {
                return again(function () { return timed("https://" + host + (np ? "/nextpage/playlists/" + L + "?nextpage=" + enc(np) : "/playlists/" + L), 20000, true); }, 3).then(function (z) {
                  take({ relatedStreams: z.relatedStreams || [] });
                  return z.nextpage && (z.relatedStreams || []).length && n < 40 ? pg(z.nextpage, n + 1) : null;
                });
              }
              return pg("", 0).then(one, one);
            }
            return one();
          }, function () { return out; });
        }
        return each().then(lists).then(function (o) { if (!o.length) throw new Error("empty tabs (" + (d.tabs || []).map(function (t) { return t.name; }).join("/") + ")"); return o; });
      });
    }
    return any(hosts.slice(0, 6).map(from)).catch(function () { return any(hosts.slice(6, 16).map(from)); });
  }

  /* every video named in a YouTube page's ytInitialData, whatever the layout of the day */
  function initialData(h) {
    var i = h.indexOf("ytInitialData"); if (i < 0) return null;
    var a = h.indexOf("{", i), depth = 0, q = false, esc = false;
    for (var j = a; j < h.length; j++) {
      var ch = h.charAt(j);
      if (q) { if (esc) esc = false; else if (ch === "\\") esc = true; else if (ch === '"') q = false; continue; }
      if (ch === '"') q = true; else if (ch === "{") depth++; else if (ch === "}") { if (--depth === 0) { try { return JSON.parse(h.slice(a, j + 1)); } catch (e) { return null; } } }
    }
    return null;
  }
  function txt(o) { if (!o) return ""; if (typeof o === "string") return o; if (o.simpleText) return o.simpleText; if (o.content) return o.content; if (o.runs) return o.runs.map(function (r) { return r.text; }).join(""); return ""; }
  function videosIn(data) {
    var out = [], seen = {};
    function add(id, t) { if (id && /^[\w-]{11}$/.test(id) && !seen[id]) { seen[id] = 1; out.push({ id: id, title: t || id }); } }
    (function walk(o, d) {
      if (!o || typeof o !== "object" || d > 60) return;
      if (Array.isArray(o)) { for (var i = 0; i < o.length; i++) walk(o[i], d + 1); return; }
      var r = o.videoRenderer || o.gridVideoRenderer || o.playlistVideoRenderer || o.compactVideoRenderer || o.playlistPanelVideoRenderer;
      if (r && r.videoId) add(r.videoId, txt(r.title));
      if (o.reelItemRenderer && o.reelItemRenderer.videoId) add(o.reelItemRenderer.videoId, txt(o.reelItemRenderer.headline));
      var sl = o.shortsLockupViewModel;
      if (sl) { try { add(sl.onTap.innertubeCommand.reelWatchEndpoint.videoId, txt(sl.overlayMetadata.primaryText)); } catch (e) {} }
      var lv = o.lockupViewModel;
      if (lv && /VIDEO/.test(lv.contentType || "") && lv.contentId) { var md = lv.metadata && lv.metadata.lockupMetadataViewModel; add(lv.contentId, md && txt(md.title)); }
      for (var k in o) if (k !== "frameworkUpdates" && Object.prototype.hasOwnProperty.call(o, k)) walk(o[k], d + 1);
    })(data, 0);
    return out;
  }

  /* road 1c: the channel's videos tab, rendered by r.jina.ai — the latest hundred or so */
  function jinaVideos(id, prog) {
    var all = [], seen = {}, name = "";
    function grab(tabName) {
      return jina("https://www.youtube.com/channel/" + id + "/" + tabName, 60000).then(function (h) {
        if (!name) name = nameOf(h);
        videosIn(initialData(h)).forEach(function (v) { if (!seen[v.id]) { seen[v.id] = 1; all.push(v); } });
        prog(all.length);
      }, function () {});
    }
    return grab("videos").then(function () { return grab("shorts"); }).then(function () { return grab("streams"); }).then(function () {
      if (all.length) return { tracks: all, name: name };
      return jinaVideosDom(id, prog);
    });
  }
  function jinaVideosDom(id, prog) {
    return jina("https://www.youtube.com/channel/" + id + "/videos", 60000).then(function (h) {
      var d = new DOMParser().parseFromString(h, "text/html"), by = {}, order = [];
      Array.prototype.forEach.call(d.querySelectorAll('a[href*="watch?v="]'), function (a) {
        var m = /[?&]v=([\w-]{11})/.exec(a.getAttribute("href") || ""); if (!m) return;
        var t = (a.getAttribute("title") || a.getAttribute("aria-label") || a.textContent || "").replace(/\s+/g, " ").trim();
        if (!(m[1] in by)) { by[m[1]] = ""; order.push(m[1]); }
        if (t.length > by[m[1]].length && t.length < 300) by[m[1]] = t;
      });
      if (!order.length) { var re = /"videoId":"([\w-]{11})"[\s\S]{0,400}?"text":"((?:[^"\\]|\\.)*)"/g, mm; while ((mm = re.exec(h))) if (!(mm[1] in by)) { by[mm[1]] = unesc(mm[2]); order.push(mm[1]); } }
      if (!order.length) throw new Error("empty");
      prog(order.length);
      return { tracks: order.map(function (i) { return { id: i, title: by[i] || i }; }), name: nameOf(h) };
    });
  }

  /* the live list of Invidious instances that open their API to other sites */
  function liveInstances() {
    return timed("https://api.invidious.io/instances.json?sort_by=health", 8000, true).then(function (a) {
      return a.filter(function (x) { var m = x[1] || {}; return m.type === "https" && m.api && m.cors; }).map(function (x) { return x[0]; });
    }).catch(function () { return []; });
  }

  /* road 1: Invidious, every page */
  function invidious(id, prog, stop, live) {
    var hosts = (live || []).concat(INVIDIOUS.filter(function (h) { return (live || []).indexOf(h) < 0; }).sort(function () { return Math.random() - 0.5; }));
    function from(host) {
      var out = [], seen = {};
      function next(cont, n) {
        if (stop()) throw new Error("cancelled");
        var u = "https://" + host + "/api/v1/channels/" + id + "/videos" + (cont ? "?continuation=" + enc(cont) : "");
        return timed(u, 15000, true).then(function (d) {
          var vs = (d && (d.videos || d)) || [];
          vs.forEach(function (v) { if (v && v.videoId && !seen[v.videoId]) { seen[v.videoId] = 1; out.push({ id: v.videoId, title: v.title || v.videoId, author: v.author, date: v.published > 0 ? new Date(v.published * 1000).toISOString().slice(0, 10) : "", duration: v.lengthSeconds || 0, views: v.viewCount || 0 }); } });
          prog(out.length);
          if (d && d.continuation && vs.length && n < 80 && out.length < 3000) return next(d.continuation, n + 1);
          if (!out.length) throw new Error("empty");
          return out;
        });
      }
      return next("", 0);
    }
    return any(hosts.slice(0, 5).map(from)).catch(function () { return any(hosts.slice(5, 14).map(from)); });
  }
  /* road 2: the uploads playlist page */
  function playlist(listId, prog) {
    return page("https://www.youtube.com/playlist?list=" + listId).then(function (h) {
      var out = [], seen = {}, re = /"playlistVideoRenderer":\{"videoId":"([\w-]{11})"[\s\S]*?"title":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"/g, m;
      while ((m = re.exec(h))) if (!seen[m[1]]) { seen[m[1]] = 1; out.push({ id: m[1], title: unesc(m[2]) }); }
      if (!out.length) out = videosIn(initialData(h));
      if (!out.length) throw new Error("empty");
      prog(out.length);
      var title = (/"metadata":\{"playlistMetadataRenderer":\{"title":"((?:[^"\\]|\\.)*)"/.exec(h) || [])[1];
      return { tracks: out, title: title ? unesc(title) : "" };
    });
  }
  /* road 3: the RSS feed */
  function rss(id, prog) {
    return page("https://www.youtube.com/feeds/videos.xml?channel_id=" + id).then(function (x) {
      var d = new DOMParser().parseFromString(x, "text/xml"), out = [];
      Array.prototype.forEach.call(d.getElementsByTagName("entry"), function (e) {
        var v = e.getElementsByTagName("yt:videoId")[0] || e.getElementsByTagNameNS("http://www.youtube.com/xml/schemas/2015", "videoId")[0];
        var t = e.getElementsByTagName("title")[0];
        var pb = e.getElementsByTagName("published")[0], sc = e.getElementsByTagName("media:statistics")[0];
        if (v) out.push({ id: v.textContent, title: t ? t.textContent : v.textContent, date: pb ? pb.textContent.slice(0, 10) : "", views: sc ? +sc.getAttribute("views") || 0 : 0 });
      });
      if (!out.length) throw new Error("empty");
      prog(out.length);
      var a = d.getElementsByTagName("author")[0], nm = a && a.getElementsByTagName("name")[0];
      return { tracks: out, name: nm ? nm.textContent : "" };
    });
  }

  /* record(url, {onProgress(n, name), isCancelled()}) -> Promise<tape> */
  /* road 0: KorhoTube, Mauk Tenieb's own Worker (github.com/MaukTenieb/korhotube): the whole channel straight from YouTube, no third party */
  var KORHOTUBE = "https://korhotube.mauktenieb.workers.dev/";
  function korhotube(url, prog) {
    if (/[?&]list=/.test(url)) return Promise.reject(new Error("playlist"));
    return timed(KORHOTUBE + "?channel=" + enc(url), 45000, false).then(function (x) {
      var d = JSON.parse(x); if (!d || !d.videos || !d.videos.length) throw new Error(d && d.error || "empty");
      prog(d.videos.length, d.channel.name);
      return { channel: d.channel.name || d.channel.id, channel_url: d.channel.url, expected: d.count, tracks: d.videos.map(function (v) {
        var y = { id: v.id, title: v.title || v.id }, vw = /([\d.,]+)\s*([KMB]?)\s*views/i.exec(v.info || "");
        if (v.published) y.date = v.published.slice(0, 10);
        if (v.length) y.duration = v.length;
        if (vw) y.views = Math.round(parseFloat(vw[1].replace(/,/g, "")) * ({ K: 1e3, M: 1e6, B: 1e9 }[vw[2].toUpperCase()] || 1));
        return y; }) };
    });
  }
  function record(url, o) {
    o = o || {};
    var prog = o.onProgress || function () {}, stop = o.isCancelled || function () { return false; };
    WHY = [];
    return korhotube(url, prog).catch(function (e) { why("korhotube", e); if (stop()) throw e; return api(url, prog, stop); }).catch(function (e) { why("api", e); if (stop()) throw e; return Promise.all([liveInstances(), livePiped()]).then(function (l) { return publicRoads(url, prog, stop, { inv: l[0], piped: l[1] }); }); })
      .then(function (tape) { tape.count = tape.tracks.length; return tape; })
      .catch(function (e) { var err = new Error(WHY.join(" · ") || (e && e.message) || "failed"); err.why = WHY.slice(); throw err; });
  }
  /* how many videos the channel says it has (its header, read through r.jina.ai) */
  function expected(id) {
    return jina("https://www.youtube.com/channel/" + id + "/videos", 30000).then(function (h) {
      var m = /"videosCountText":\{"runs":\[\{"text":"([\d.,\s\u00a0\u202f]+)"/.exec(h) || /"content":"([\d.,\s\u00a0\u202f]+)\s*videos?"/.exec(h) || /([\d][\d.,\u00a0\u202f]*)\s+videos\b/.exec(h);
      return m ? parseInt(m[1].replace(/[^\d]/g, ""), 10) || 0 : 0;
    }).catch(function () { return 0; });
  }
  /* the whole uploads playlist: its page gives the first hundred, then a watch page inside the playlist hands its side panel (the next hundred or so), again and again */
  function panelOf(data) {
    try { return (data.contents.twoColumnWatchNextResults.playlist.playlist.contents || []).map(function (c) { var r = c.playlistPanelVideoRenderer; return r && r.videoId ? { id: r.videoId, title: txt(r.title) || r.videoId, duration: r.lengthText ? String(txt(r.lengthText)).split(":").reduce(function (a, x) { return a * 60 + (+x || 0); }, 0) : 0 } : null; }).filter(Boolean); } catch (e) { return []; }
  }
  function uploadsAll(id, want, prog, stop) {
    var L = "UU" + id.slice(2), out = [], seen = {};
    function add(v) { if (v && v.id && !seen[v.id]) { seen[v.id] = 1; out.push(v); return 1; } return 0; }
    return jina("https://www.youtube.com/playlist?list=" + L, 60000).then(function (h) {
      videosIn(initialData(h)).forEach(add); prog(out.length);
      function step(n) {
        if (stop() || out.length >= want || n > 12 || !out.length) return out;
        var last = out[out.length - 1].id;
        return jina("https://www.youtube.com/watch?v=" + last + "&list=" + L + "&index=" + out.length, 60000).then(function (w) {
          var k = 0; panelOf(initialData(w)).forEach(function (v) { k += add(v); }); prog(out.length);
          return k ? step(n + 1) : out;
        }, function () { return out; });
      }
      return step(0);
    });
  }
  function publicRoads(url, prog, stop, live) {
    var exp = null, cid = null;
    return resolve(url).catch(function (e) { why("resolve", e); throw e; }).then(function (c) {
      if (stop()) throw new Error("cancelled");
      if (c.id) { exp = expected(c.id); cid = c.id; }
      return publicRoad(c, url, prog, stop, live);
    }).then(function (tape) {
      if (!exp) return tape;
      return Promise.race([exp, new Promise(function (r) { setTimeout(function () { r(0); }, 9000); })]).then(function (n) {
        if (n) tape.expected = n;
        /* fewer than the channel holds: complete from the uploads playlist, page after page */
        if (!n || tape.tracks.length >= n || !cid || stop()) return tape;
        return uploadsAll(cid, n, function (k) { prog(Math.max(k, tape.tracks.length), tape.channel); }, stop).then(function (u) {
          var have = {}; tape.tracks.forEach(function (t) { have[t.id] = 1; });
          u.forEach(function (v) { if (!have[v.id]) { have[v.id] = 1; tape.tracks.push(v); } });
          return tape;
        }, function () { return tape; });
      });
    });
  }
  function publicRoad(c, url, prog, stop, live) {
    return Promise.resolve().then(function () {
      if (c.playlist) {
        return playlist(c.playlist, function (n) { prog(n, ""); }).then(function (p) {
          return { channel: p.title || c.playlist, channel_url: c.url, tracks: p.tracks };
        });
      }
      var name = c.name || "";
      prog(0, name);
      var best = 0, p2 = function (n) { if (n > best) { best = n; prog(n, name); } };
      var inv = invidious(c.id, p2, stop, live.inv).catch(function (e) { why("invidious", e); throw e; });
      var pip = piped(c.id, p2, stop, live.piped).catch(function (e) { why("piped", e); throw e; });
      return any([inv, pip]).then(function (t) {
        return { channel: name || (t[0] && t[0].author) || c.id, channel_url: c.url, tracks: t.map(function (x) { var y = { id: x.id, title: x.title }; ["date", "duration", "views"].forEach(function (k) { if (x[k]) y[k] = x[k]; }); return y; }) };
      }).catch(function (e) {
        if (stop()) throw e;
        return jinaVideos(c.id, function (n) { prog(n, name); }).then(function (j) {
          return { channel: name || j.name || c.id, channel_url: c.url, tracks: j.tracks };
        }).catch(function (ej) { why("jina", ej); if (stop()) throw ej;
        return playlist("UU" + c.id.slice(2), function (n) { prog(n, name); }).then(function (p) {
          return { channel: name || c.id, channel_url: c.url, tracks: p.tracks };
        }); }).catch(function (e2) {
          why("playlist", e2);
          return rss(c.id, function (n) { prog(n, name); }).then(function (r) {
            return { channel: name || r.name || c.id, channel_url: c.url, tracks: r.tracks };
          }).catch(function (e3) { why("rss", e3); throw e3; });
        });
      });
    });
  }
  g.KGVHSScrape = { record: record, resolve: resolve, page: page, timed: timed, any: any };
})(window);
