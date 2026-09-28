# Insert Koin

Insert Koin, an arcade ritual in the browser, by Mauk Tenieb. Puck You! against the eighteen Masks of the Fauna, Fauna Chess, Erratik, Faunarratik, Katabatik, 3615.

**Online: https://mauktenieb.github.io/insertkoin/** · French: https://mauktenieb.github.io/insertkoin/fr.html

- **Puck You!** — air-puck in the tradition of Shufflepuck Café (Brøderbund, 1988), against the eighteen Masks of the Fauna. Each opponent plays by their Korhogo stats (STR, DEX, INT, WIS, CHA, CON) and a signature move. Arcade run: 16 at random, then Aube, then Unkle Maukie; 11 points per match (15 in a chosen duel).
- **Fauna Chess**, **Erratik**, **Faunarratik**, **Katabatik** (a mini-game at random) — the Korhogo games; only the code of the game opened is loaded (`kg-*` files).
- **3615** — the K Terminal, https://mauktenieb.github.io/3615/
- Always there: **Motel Sound** (the Korhogo jukebox), **Kapture** (camera and microphone recorder), **Baku Boom**, FR/EN.

## Koins
One Koin per game (Puck You! match, Korhogo game). A win brings 2 Koins (5 against Aube and Unkle Maukie). At 0, one Koin comes back after 30 seconds, and a connection to the 3615 (**3615**, **3615 KALABASS**, **3615 KOINS**) gives one Koin, once an hour. The balance is shared with the 3615 (same address, `ik.koins` in the browser).

## Files
Everything sits at the top level, no folders, so the site updates in one upload.
- `index.html` — the site (English first); `fr.html` — the same, French first.
- `fauna-*.html` / `fauna-*.webp` — one page per member of the Fauna.
- `sprite-*.webp` — the opponents of Puck You! (8 expressions each); `thumb-*.jpg` — the tiles.
- `kg-*` — the Korhogo games, loaded on demand; `kg-faces.json` — their portraits.
- `poster.*`, `room.*` — the painting and the room; `icon.png`, `favicon.png`, `manifest.webmanifest`, `sw.js` — installation and offline use.
- `robots.txt`, `sitemap.xml`, `llms.txt` — for search engines and answer engines (training crawlers are refused).

## Updating
GitHub › Add file › Upload files: select all the files, drop them, Commit changes. The site follows within a minute or two.

## Rights
Copyright © Mauk Tenieb & Korhogo. All rights reserved. Korhogo™, Korhogo Fauna™, Fauna Masks™, Fauna Chess™, Faunarratik™, Katabatik™, Insert Koin™, Puck You!™ and any related material — including characters, names, symbols, rules, lore and texts, in any form or medium — are the exclusive property of Korhogo™. The source code of this site is published for reading, reflections, additions, requests, etc. - the lore, names, marks and works remain the property of the author.

Puck You! runs on a JavaScript port of PuffleHuck (https://github.com/iconidentify/pufflehuck, MIT licence, see `LICENSE`). Fonts: Bebas Neue, DM Mono, Press Start 2P (SIL Open Font License, via Google Fonts). Characters, images and music: Mauk Tenieb; the Motel Sound jukebox plays through YouTube.

Contact: mauktenieb@gmail.com
