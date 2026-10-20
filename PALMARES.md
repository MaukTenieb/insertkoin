# Palmarès

The palmarès of Insert Koin keeps the ten best of two games: Korong! (air-puck against the eighteen Masks of the Korhogo Fauna) and FaunInvaders (the Masks in formation, in Katabatik). The 3615 Minitel shows it: 3615 KORHOGO, menu 5, and the first of each game under the home menu.

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

## Checks

- A signature that fails, a figure outside its range, a FaunInvaders score off the ten-point grid: the entry goes.
- Everything stays public and checkable: the events on the relays, the code, the history of `palmares.json` in the commits.
- The arcade runs in the browser, so a determined player can forge a score. The ranges and the limit of three lines per key keep the board readable; the commit history keeps every past state.

Code: MIT licence (see [LICENSE](LICENSE)). nostr-tools: MIT licence, fiatjaf and contributors. Korhogo material: © Korhogo, all rights reserved.
