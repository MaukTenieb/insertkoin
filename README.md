# Insert Koin

Insert Koin, an arcade ritual in the browser, by Mauk Tenieb. Puck You! against the eighteen Masks of the Fauna, Fauna Chess, Erratik, Faunarratik, Katabatik, 3615, VHS, Photofauna, TOR.

**Online: https://mauktenieb.github.io/insertkoin/** · French: https://mauktenieb.github.io/insertkoin/fr.html

- **Puck You!** — air-puck in the tradition of Shufflepuck Café (Brøderbund, 1988), against the eighteen Masks of the Fauna. Each opponent plays by their Korhogo stats (STR, DEX, INT, WIS, CHA, CON) and a signature move. Each Mask has its own fixed level, the one its stats and signature give in play. Arcade run: the 16 others climb in four bands of four, shuffled inside each band, then Aube, then Unkle Maukie; 11 points per match (15 in a chosen duel).
- **Fauna Chess**, **Erratik**, **Faunarratik**, **Katabatik** (a mini-game at random) — the Korhogo games; only the code of the game opened is loaded (`kg-*` files).
- **3615** — the K Terminal, https://mauktenieb.github.io/3615/
- **VHS** — the Korhogo deck: a television on a tape deck (slot, fluorescent counter, piano keys, motor and eject noises). The Motel Sound catalogue plays through YouTube under a layer of tape wear (grain, tracking band, head-switching noise); local files go through the WebGL tape shader. Quick REW/FFW taps nudge ±5 s, holding runs the picture search. The workshop (REC onto cassettes, KRITIK teletext, tape tools and exports) only appears when the arcade runs on the author's machine with the CHANNEL.SCRAPE server: visitors never see it and the page never calls it.
- **Photofauna** — the pocket photo emulator, honouring the photo apps of 2008–2019: 45 tribute cabinets (film, toy cameras, instant, glitch, painting…), including the **Réviseur des 16** (a complete editor for the 16 engine operators that stayed without a cabinet: framing, distortion, selective colour, posterize, quantize, datamosh, pixel sort, relief, wear, blend, stickers, style transfer, capture aids…), the Pocket Studio editor (filters, selective retouch, brush), recipes kept inside the saved PNG, GIF export, deterministic renders. One self-contained file, `fotofauna.html`.
- **TOR** — the Fauna browser: one self-contained file, `tor.html`. Real browsing of the burrow's own pages (the eighteen Fauna pages, index, fr, llms.txt, README), the frameable web, and a real navigation window (↗) for everything else — web addresses and `.onion` alike; the network answers, or it doesn't. FR/EN.
- Always there: **Motel Sound** (the Korhogo jukebox), **Kapture** (camera and microphone recorder), **Baku Boom**, FR/EN.

## Koins
One Koin per game: a Puck You! duel, an arcade run (all eighteen), a Korhogo game. The machines (3615, VHS, Photofauna, FaunaTor) are free. A win doubles the total (x2); Katabatik's four games, Erratik, Fauna Chess and a sealed Faunarratik tale all count. At 0, one Koin comes back after 30 seconds. In the 3615: 1 Koin per connection to **3615 KOINS**; 1 per Fauna profile read to its last page; 1 per message sent (5 a day). No ceiling. The balance is shared with the 3615 (same address, `ik.koins` in the browser).

## Files
Everything sits at the top level, no folders, so the site updates in one upload.
- `index.html` — the site; `fr.html` — the same page opening in French (generated from `index.html`: edit `index.html` only).
- `fonts.css`, `font-*.woff2` — the fonts, served by the site itself.
- `fauna-*.html` / `fauna-*.webp` — one page per member of the Fauna.
- `sprite-*.webp` — the opponents of Puck You! (8 expressions each); `thumb-*.jpg` — the tiles.
- `kg-*` — the Korhogo games, loaded on demand; `kg-faces.json` — their portraits. `kg-vhs.js/css/html` — the VHS deck; `kg-vhs-library.js` — the cassette library bridge (CHANNEL.SCRAPE → `KG_VHS_TRACKS`, offline cache, EN/FR); `kg-vhs-recorder.js` — the shelf and the REC bay.
- `fotofauna.html` — FOTOFAUNA, the pocket photo emulator: one self-contained file (engine, registry, i18n and demo photo inline), opened by the arcade in its own frame. Changed here: `app.revueur16` (45th cabinet) + `PANELS.revueur16` — same edits on the Desktop master (`Desktop/fotofauna.html`).
- `poster.*`, `room.*` — the painting and the room; `icon.png`, `favicon.png`, `manifest.webmanifest`, `sw.js` — installation and offline use.
- `robots.txt`, `sitemap.xml`, `llms.txt` — for search engines and answer engines (training crawlers are refused).

## Updating
GitHub › Add file › Upload files: select all the files, drop them, Commit changes. The site follows within a minute or two.

## Rights
Copyright © Mauk Tenieb & Korhogo. All rights reserved. Korhogo™, Korhogo Fauna™, Fauna Masks™, Fauna Chess™, Faunarratik™, Katabatik™, Insert Koin™, Puck You!™ and any related material — including characters, names, symbols, rules, lore and texts, in any form or medium — are the exclusive property of Korhogo™. The source code of this site is published for reading, reflections, additions, requests, etc. - the lore, names, marks and works remain the property of the author.

Puck You! runs on a JavaScript port of PuffleHuck (https://github.com/iconidentify/pufflehuck, MIT licence, see `LICENSE`). Fonts: Bebas Neue, DM Mono, Press Start 2P, Archivo (SIL Open Font License), served from the site. Characters, images and music: Mauk Tenieb; the Motel Sound jukebox plays through YouTube.

Contact: mauktenieb@gmail.com

## FaunaTor and Tor

FaunaTor carries Tor inside the page: two Tor clients compiled to WebAssembly reach the network through Snowflake, the Tor Project's own bridges, with no server of ours.
- the web, through Tor exits: [privacy-ethereum/webtor-rs](https://github.com/privacy-ethereum/webtor-rs) (MIT) → `tor-web.js`, `tor-web_bg.wasm`
- `.onion` (v3, http://): [andrewtheguy/webtor-rs](https://github.com/andrewtheguy/webtor-rs) (MIT) → `tor-onion.js`, `tor-onion_bg.wasm`

The workflow `.github/workflows/faunator-tor.yml` builds both and commits them at the top level (it runs by itself once, or from Actions → FaunaTor Tor → Run workflow). Until then, the web client loads from its author's CDN and `.onion` falls back on the public gateways. Glue: `faunator-tor.js`. Optional own relay for the plain web: `faunator-worker.js` (Cloudflare Worker).
