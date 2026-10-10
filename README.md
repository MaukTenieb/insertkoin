# Insert Koin

An arcade ritual in the browser, by Mauk Tenieb, from the Korhogo universe.

**Play: https://mauktenieb.github.io/insertkoin/** · in French: https://mauktenieb.github.io/insertkoin/fr.html

No account, no installation, no server of ours. Desktop and phone, upright or on its side. English and French.

---

## The arcade

The home screen is the motel painting, then the cabinets. Every visit draws its own arrangement: Reporhogo, Bio, Dive!, Faunarratik and Erratik stand either as big cabinets or as small chips under them, and the rows always come out full.

| Cabinet | What it is |
|---|---|
| **Puck You!** | Air-puck against the eighteen Masks of the Fauna, in the tradition of Shufflepuck Café (Brøderbund, 1988). |
| **Fauna Chess** | Fairy chess against the Fauna. |
| **Erratik** | The memory game. |
| **Faunarratik** | A tale built with the Masks; *Let the Kerema wrap it* saves it as a text file. English only. |
| **Katabatik** | A die is thrown on the cabinet: Konnect4, Sampler, Akasztófa (the Hungarian hangman, on a Hungarian keyboard; a vowel counts with or without its accents; a win brings a short unsigned quotation to guess) or Mastermind. |
| **3615** | The K Terminal, a Minitel emulator: https://mauktenieb.github.io/3615/ |
| **VHS** | A television on a tape deck: Motel Sound and your own YouTube tapes. |
| **Photofauna** | The pocket photo app: take or open a photo, edit it through 44 looks. |
| **FaunaTor** | A browser that carries Tor inside the page, `.onion` included. |
| **Skoporhogo** | The Fauna living in an isometric hotel room. |
| **Reporhogo** | One topic searched across the code forges at once; every related repository's URL is collected. |
| Bio · Dive! · Lore · TL · IG | Mauk Tenieb on GitHub · Korhogo Fauna (katabase) · the Substack · the Threadless store · Instagram. |

Always there, on every screen: **Motel Sound** (the Korhogo jukebox, free), **Kapture** (camera and microphone recorder), **Baku Boom** (back to the menu), **FX** on/off (remembered), **FR/EN**.

### The living home
The painting takes the visitor's hour (bluish night, pink dawn, orange evening). The television is never steady and changes channel in the snow; some visits bring a storm behind the window, with thunder when FX are on; Plague of Justinian's cloud rumbles; the scarab breathes; Aube's hands glint pink, Maiden Call's telephone blue, Auvergne's eyes green; the cigarette smokes; a beetle sometimes crosses the picture; the longer one stays, the more the picture wears (grain, tape tears, scratches). A light runs over the cabinets now and then, or one flickers; the neons of the chips falter; the devices of the motel call (the television leads to VHS, the telephone to 3615, the chessboard to Fauna Chess, the cards to Erratik, Unkle Maukie to Puck You!, the Koins on the floor to 3615 KOINS, the lyre to Motel Sound, the window to FaunaTor, the boxes to Katabatik). Now and then, the sign slips from INSERT KOIN to INTERSEKTION. Each time the title screen opens, it takes the faint colour of one Mask drawn at random: a soft wash over the picture, its lines and golds leaning a little toward it.

### The guide
A few seconds after the title screen opens, then now and then, a guide wanders along the cabinets, shining in its colour when it arrives: C7H5N3O6 (blue), Honey Buzzard (red), Ts'ui Pên (orange) or Croisière Noire (its own grey), drawn from their Puck You! sprites. Touched, it walks every cabinet and chip, then Motel Sound and Kapture, lights each one and names it with one line. A click elsewhere, or Escape, stops it. It can also be grabbed with the mouse or a finger and thrown: it slides and bounces off the edges like the Puck You! puck, silent, lighting up at each impact; after one or two impacts it lays a Koin that goes to the counter by itself (one or two Koins at most per visit, however long one plays). Now and then, hitting an edge, it swears. Thrown in the middle of a visit, it takes it up again a few seconds later. Every visit starts on any tile or menu, at random.

---

## Puck You!

- Move the paddle with the mouse, a finger or the arrow keys. Pull back, then drive through the puck to hit hard; hold the button or Space to catch it. The whole back line is the goal.
- The mouse stays inside the table while playing; Enter or Esc lets it go.
- Each Mask plays by its Korhogo stats (STR power, DEX speed, INT precision, WIS reading, CHA placing, CON stamina) and a signature move, and keeps its own fixed level.
- **Duel**: click a Mask in the room, first to 15. **Kompete!** starts a tournament against the eighteen Masks, first to 11 each time; **Continue** picks a saved one up where it stopped.
- The room is a painted motel room; its two paintings show Fauna drawn at random for each match, and the board on the left wall keeps the score. The CRT on the dresser switches at random and on every point between the Mask's motto, the score, its stats, the rally, its signature, your Koins, the hour, Motel Sound, test cards, snow and a few seconds of a Mauk Tenieb clip.
- **The Kerema decides!** One tournament in two opens with a die that sets the applicant's swing, from −15% (⚀) to +15% (⚅); the face stays by the score. One match in two, a translucent die floats over the table once or twice (*Want Kerema?*, *Got Kerem... ilk?* — *On est joueur ?*, *Koquinette ou Koquinou ?*): touch it with the paddle to take the throw, or let it drift away. The Kerema leans toward those who earned their Koins: the more Koins, the higher the faces (about 7 Koins: even).
- Now and then, after a point, the Kerema's sarcasm comes on the TV, in the visitor's language.
- On a phone held upright, a phone sign turns over the table; on its side, the table takes the whole height; in full screen the score follows inside the table.

## Koins

- One Koin opens a game (a Puck You! duel or run, a Korhogo game). The machines (3615, VHS, Photofauna, FaunaTor, Skoporhogo, Reporhogo) and Motel Sound are free.
- **Every win, in any game, brings one Koin.** A win rains Koins on the screen.
- In the 3615: **1 Koin per connection to 3615 KOINS**; 1 per Fauna profile read to its last page; 1 per message sent (5 a day). No ceiling.
- At 0, one Koin comes back after 30 seconds.
- The balance is shared with the 3615 (same address, `ik.koins` in the browser).

## VHS — REC

Paste a YouTube channel (or playlist) link and press REC: the page records it onto a cassette by itself, with no server (`kg-vhs-scrape.js`). Several roads are tried, the first that answers wins:

1. YouTube's own Data API, when a key is set in `YT_KEY` (whole channel, with dates, durations, views, likes, comments);
2. Piped (api.piped.private.coffee first) and Invidious, raced: the whole channel, page after page, its shorts and streams, and an artist's playlists when the uploads are few;
3. the channel's pages rendered by r.jina.ai;
4. the uploads playlist page or the RSS feed, through public relays or FaunaTor's Tor.

Refused pages are asked again before giving up; a cassette that could not be read to the end says so (for example 56 / 200). Cassettes stay in the visitor's browser. Pick one on the shelf for its tools: CSV, JSON, XLSX, TXT and MD exports (title, link, publication, duration, views, likes, comments), and ERASE (press twice).

## FaunaTor and Tor

FaunaTor carries Tor inside the page: two Tor clients compiled to WebAssembly reach the network through Snowflake, the Tor Project's own bridges (WebSocket first, WebRTC last), with no server of ours.

- the web, through Tor exits: [privacy-ethereum/webtor-rs](https://github.com/privacy-ethereum/webtor-rs) (MIT) → `tor-web.js`, `tor-web_bg.wasm`
- `.onion` (v3): [andrewtheguy/webtor-rs](https://github.com/andrewtheguy/webtor-rs) (MIT) → `tor-onion.js`, `tor-onion_bg.wasm`
- the Tor consensus is fetched from the directory authorities twice a day and published on this site (`tor/`), so the web client reads it from here.

When a page cannot be reached: *Your Kalabass was rejected. Apply later.* — with the reason, small, underneath.

## Photofauna

A pocket photo app honouring the photo apps of 2008–2019: 44 looks (simulated film, toy cameras, historical processes, instants, glitch, painting, shapes…), an editor with adjustments, recipes kept inside the saved PNG, GIF export, deterministic renders. The camera opens on a Mask drawn at random. Every shot is saved at once, untouched. Looks pile up: **Keep** fixes the current look into the picture and the next one goes on top; **Undo** steps back, last look first, then last layer. The saved PNG carries the fixed layers in its recipe. One self-contained file: `fotofauna.html`.

## Saved files

Everything Insert Koin saves (Photofauna, Faunarratik, the Sampler, Kapture, VHS exports, the Motel Sound list) is named by the French Republican calendar, then the program, then a counter of the day: `18-vendemiaire-235_photofauna_001.jpg`. The day is the visitor's own; years III, VII, XI and XV are sextile as they were kept, then Romme's rule (`ik-name.js`).

---

## Files

Everything sits at the top level, no folders (except `tor/` and `.github/`), so the site updates in one upload.

| Files | Role |
|---|---|
| `index.html` | the site |
| `fr.html` | the same page opening in French — **generated**: edit `index.html`, then run `python3 build-fr.py` |
| `fauna-*.html`, `fauna-*.webp` | one page per member of the Fauna |
| `sprite-*.webp` | the Masks of Puck You! (8 expressions each) |
| `mask-*.webp` | the Masks' portraits (Photofauna, the paintings of the room) |
| `thumb-*.jpg` | the cabinets (`thumb-bio-*.jpg`: the Bio cabinet draws one of the eighteen Masks) |
| `poster*.{jpg,webp}`, `room.webp` | the painting and the pixel room |
| `room-puck.webp` | the painted motel room of Puck You! (the table, the Mask, the window's sky, the TV, the portraits and the score board are laid over it by the game) |
| `kg-hang-ja.json` | Akasztófa's stanzas |
| `kg-*` | the Korhogo games, loaded on demand (`kg-loader.js`, `kg-core.*`, `kg-chess.*`, `kg-erratic.*`, `kg-faunarratics.*`, `kg-katabatik.*`, `kg-kapture.*`); `kg-faces.json` their portraits |
| `kg-vhs.*`, `kg-vhs-library.js`, `kg-vhs-recorder.js`, `kg-vhs-scrape.js` | VHS: the deck, the cassette library, the shelf and REC bay, the in-page recorder |
| `fotofauna.html` | Photofauna |
| `tor.html`, `faunator-tor.js`, `tor-web*`, `tor-onion*`, `tor/` | FaunaTor and its Tor clients; `faunator-worker.js`, an optional Cloudflare Worker relay |
| `skoporhogo.html`, `three.min.js` | Skoporhogo and three.js r128 |
| `reporhogo.html` | Reporhogo |
| `fonts.css`, `font-*.woff2` | the fonts, served by the site |
| `manifest.webmanifest`, `sw.js`, `icon.png`, `favicon.png` | installation and offline use (`sw.js`: pages and code from the network first, images from the cache) |
| `robots.txt`, `sitemap.xml`, `llms.txt` | search and answer engines are welcome; training crawlers are refused |
| `ik-name.js` | names every saved file by the Republican calendar (`fotofauna.html` carries its own copy) |
| `build-fr.py` | builds `fr.html` from `index.html` |

### Workflows (`.github/workflows/`)
- `faunator-tor.yml` — builds the two Tor clients and commits them.
- `tor-consensus.yml` — refreshes the Tor consensus in `tor/` twice a day.
- `vhs-probe.yml` — runs a real browser against the live site (every cabinet, desktop, French, phone upright and on its side, a real REC) and writes the result to the `probe-results` branch. Run it from Actions → vhs-probe → Run workflow.

## Updating

Edit, then commit to `main`: GitHub Pages publishes within a minute or two. After any change to `index.html`, run `python3 build-fr.py` so the French page follows, and bump the cache name at the top of `sw.js` so returning visitors get the new code.

<!-- network:start -->
## Korhogo Fauna

Mauk Tenieb's transmedia world. [Katabase](https://mauktenieb.github.io/katabase): concept albums, the 18 Masks, the lore · [3615 KORHOGO](https://mauktenieb.github.io/3615/): the Minitel terminal.

[Bandcamp](https://mauktenieb.bandcamp.com): music and sales · [Substack](https://korhogo.substack.com): the journal · [YouTube](https://www.youtube.com/@mauktenieb): clips and mini-films.

Start here: https://mauktenieb.github.io/
<!-- network:end -->

---

## Rights

Copyright © Mauk Tenieb & Korhogo. All rights reserved. Korhogo™, Korhogo Fauna™, Fauna Masks™, Fauna Chess™, Faunarratik™, Katabatik™, Insert Koin™, Puck You!™ and any related material — including characters, names, symbols, rules, lore and texts, in any form or medium — are the exclusive property of Korhogo™. The source code of this site is published for reading, reflections, additions, requests, etc. — the lore, names, marks and works remain the property of the author.

No reproduction or reuse without written permission, including for training or use by artificial-intelligence systems.

Third-party components:
- Puck You! runs on a JavaScript port of [PuffleHuck](https://github.com/iconidentify/pufflehuck) (MIT, see `LICENSE`).
- FaunaTor's Tor clients: webtor-rs by privacy-ethereum and by andrewtheguy (MIT, see `TOR-LICENSES.txt`).
- Akasztófa's stanzas: József Attila's poems up to 1928, in verse and in prose (public domain), taken from the [ELTE Poetry Corpus](https://github.com/ELTE-DH/poetry-corpus) (MEK edition) → `kg-hang-ja.json`.
- Skoporhogo uses [three.js](https://threejs.org) r128 (MIT).
- Fonts: Bebas Neue, DM Mono, Press Start 2P, Archivo (SIL Open Font License), served from the site.

Characters, images and music: Mauk Tenieb. Motel Sound plays through YouTube.

Contact: mauktenieb@gmail.com
