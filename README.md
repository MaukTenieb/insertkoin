# Insert Koin

Insert Koin, an arcade ritual in the browser, by Mauk Tenieb. Puck You! against the eighteen Masks of the Fauna, Fauna Chess, Erratik, Faunarratik, Katabatik, 3615, VHS, Photofauna, TOR.

**Online: https://mauktenieb.github.io/insertkoin/** · French: https://mauktenieb.github.io/insertkoin/fr.html

- **Puck You!** — air-puck in the tradition of Shufflepuck Café (Brøderbund, 1988), against the eighteen Masks of the Fauna. Each opponent plays by their Korhogo stats (STR, DEX, INT, WIS, CHA, CON) and a signature move. Arcade run: 16 at random, then Aube, then Unkle Maukie; 11 points per match (15 in a chosen duel).
- **Fauna Chess**, **Erratik**, **Faunarratik**, **Katabatik** (a mini-game at random) — the Korhogo games; only the code of the game opened is loaded (`kg-*` files).
- **3615** — the K Terminal, https://mauktenieb.github.io/3615/
- **VHS** — the Korhogo deck: the Motel Sound catalogue on a vintage tape machine (WebGL tape wear), plus **cassette recording**: paste a YouTube channel, REC records it via the local CHANNEL.SCRAPE server (see `VIDEO SCRAP/`) and the cassette lands on the shelf. **Record over the loaded cassette** erases it on success — the tape is rewound with the fresh tracks only, classic VCR behaviour (cancel or failure erases nothing; Tape Tools → ERASE erases without recording). Quick **REW/FFW taps nudge the tape ±5 s** with a burst of noise; holding them runs the full picture search. The tracklist has a **sort menu** (tape order, newest/oldest, A–Z, Z–A, shuffle). **Tape Tools exports** the loaded cassette as CSV, JSON, XLSX, **TXT (readable list) or MD (Markdown table)**. The **KRITIK teletext** reads sources from the local CHANNEL.SCRAPE server: the cassettes themselves (click a line to play it), SensCritique/AllMusic/MetaCritic/RYM/RottenTomatoes reviews, **Open Library trending books, Internet Archive (Prelinger) films** — each source also has a review↔cassette match page. Offline, the deck plays the last known library.
- **Photofauna** — the pocket photo emulator, honouring the photo apps of 2008–2019: 45 tribute cabinets (film, toy cameras, instant, glitch, painting…), including the **Réviseur des 16** (a complete editor for the 16 engine operators that stayed without a cabinet: framing, distortion, selective colour, posterize, quantize, datamosh, pixel sort, relief, wear, blend, stickers, style transfer, capture aids…), the Pocket Studio editor (filters, selective retouch, brush), recipes kept inside the saved PNG, GIF export, deterministic renders. One self-contained file, `fotofauna.html`.
- **TOR** — the Fauna browser: one self-contained file, `tor.html`. Real browsing of the burrow's own pages (the eighteen Fauna pages, index, fr, llms.txt, README), the frameable web, and a real navigation window (↗) for everything else — web addresses and `.onion` alike; the network answers, or it doesn't. FR/EN.
- Always there: **Motel Sound** (the Korhogo jukebox), **Kapture** (camera and microphone recorder), **Baku Boom**, FR/EN.

## Koins
One Koin per game (Puck You! match, Korhogo game). A win brings 2 Koins (5 against Aube and Unkle Maukie). At 0, one Koin comes back after 30 seconds, and every connection to the **3615 Koins** service (the **3615Koins** button on the title screen) gives one Koin, as often as wanted. The balance is shared with the 3615 (same address, `ik.koins` in the browser).

## Files
Everything sits at the top level, no folders, so the site updates in one upload.
- `index.html` — the site (English first); `fr.html` — the same, French first.
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

Puck You! runs on a JavaScript port of PuffleHuck (https://github.com/iconidentify/pufflehuck, MIT licence, see `LICENSE`). Fonts: Bebas Neue, DM Mono, Press Start 2P (SIL Open Font License, via Google Fonts). Characters, images and music: Mauk Tenieb; the Motel Sound jukebox plays through YouTube.

Contact: mauktenieb@gmail.com
