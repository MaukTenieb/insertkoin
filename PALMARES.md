# Palmarès

The palmarès of Insert Koin keeps the ten best of two games: Korong! (air-puck against the eighteen Masks of the Korhogo Fauna) and FaunInvaders (the Masks in formation, in Katabatik). The 3615 Minitel shows the five first of each game on its home screen (3615 KORHOGO), under the menu.

## Rules

| Game | First criterion | Second criterion |
|---|---|---|
| Korong! | Masks beaten in one run (1 to 18), most first | goals let in over the whole run, continues included, fewest first |
| FaunInvaders | score, highest first | wave reached, highest first |

One line per run: a run that goes further replaces its own line. One browser key holds three lines at most. Equal results keep the order of arrival. The rules sit in one file, [`palmares-rules.js`](palmares-rules.js), read by the arcade, by the Minitel and by the routine.

## Transport

The palmarès travels on Nostr, the open network the Minitel already uses for its messagerie. The program uses four public relays and keeps zero servers of its own.

1. A run ends with a place among the ten: the arcade asks for three initials, once per run.
2. The arcade signs the entry with the key the browser keeps for the Minitel (`vdx.nostr.sk`) and sends it to the four relays. The entry is an event of kind 30078 (NIP-78, application data), tagged `korhogo-palmares`, with the game, the initials and the two figures.
3. Every hour (minute 17), the routine of this repository ([`.github/workflows/palmares.yml`](.github/workflows/palmares.yml), [`tools/palmares.mjs`](tools/palmares.mjs)) reads the four relays, checks each signature and each rule, keeps the ten best of each game and writes [`palmares.json`](palmares.json). An entry already in the ten stays there when a relay drops it.
4. The Minitel and the arcade read `palmares.json`, add the entries the relays hold at that minute, and apply the same rules.

## Hall of Kave

The 3615 shows the twenty best players of all the games, one total per key. Each browser keeps a card (`ik.kave`) and sends it to the relays a few seconds after each change: kind 30078, `d` = `t` = `korhogo-kave`, tag `name` (the 3615 nickname, else the initials), the card as content. Each new card of a key replaces the previous one.

| Game | Card | Points |
|---|---|---|
| Korong!, Kompete! | best run: Masks beaten, goals let in | 100 per Mask minus 1 per goal let in, 0 to 1,800 |
| Korong!, duel | duels won | 20 each |
| FaunInvaders | best score | score ÷ 10 |
| Fauna Chess | levels of the AIs beaten (1 to 3) | 50 per level |
| Erratik | grids finished | 30 each |
| Konnect4, Akasztófa, Mastermind | wins | 20 each |
| Koins | Koins earned since the first visit | zero points since 30 October 2026: each browser holds and rewrites its own balance |

`palmares-rules.js` gives the ranges and the formula (`card`, `points`, `hall`); the hourly routine writes the twenty to `palmares.json` under `kave`.

## Checks

- A signature that fails, a figure outside its range, a FaunInvaders score off the ten-point grid: the entry goes.
- Everything stays public and checkable: the events on the relays, the code, the history of `palmares.json` in the commits.
- From 31 October 2026, each entry and each card carries a proof of work (NIP-13, 16 bits): its id starts with sixteen zero bits. The arcade works it out in a background thread, in about a second.
- A total grows at a human pace: 2,000 points at the first card, then 1,500 points an hour at most since the first event of the key. The routine keeps that first event of each key in `palmares.json` (`first`); the keys listed on 30 October 2026 count from the opening of the palmarès.
- The arcade runs in the browser: the ranges, the proof of work, the pace and the limit of three lines per key keep the board readable; the commit history keeps every past state.

Code: MIT licence, Mauk Tenieb & Korhogo (see [LICENSE](LICENSE)). nostr-tools: public domain (Unlicense), fiatjaf and contributors. Korhogo material: © Mauk Tenieb & Korhogo, all rights reserved.
