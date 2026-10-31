# Borne Insert Koin, site d'essai

https://mauktenieb.github.io/borne/ range Insert Koin dans une borne d'arcade. L'Insert Koin en ligne (dépôt `insertkoin`) reste intact.

## Fabrication
- Depuis le 30 oct. 2026, la borne est sa propre source : ses programmes divergent d'Insert Koin (Konnect4, Fauna Chess, FaunInvaders, polices, palmarès). La copie automatique depuis insertkoin (`tools/aspire-borne.sh`) est retirée ; une correction d'Insert Koin passe dans la borne à la main, fichier par fichier. `insertkoin.html` reste la base de `borne-build.py`, qui fabrique `index.html` et `fr.html`.
- `tools/borne-controle.py` mesure la borne sur cinq fenêtres avant et après chaque lot.
- `borne-build.py` fabrique `index.html` (la borne) depuis `insertkoin.html` et `skoporhogo-borne.html` depuis `skoporhogo.html`. Il pose les crochets de la borne (`window.__ik`, `__borneGo`, `__borneHome`, `__borneGame`, `__borneBoom`), applique les noms canoniques (FotoFauna, KorhoName, SkopoRhogo), le plafond de 99 et les retouches de la grammaire commune aux copies affichées.

## Le meuble, de haut en bas
- Toit : une plante qui suit les mois du calendrier républicain ; au survol, EAU, SOLEIL, TAILLE l'entretiennent ; la caméra Kapture.
- Fronton : l'enseigne entre deux haut-parleurs ; Motel Sound joue dès l'arrivée, son coupé, une cloche barrée ouvre le son.
- Écran d'attente : une des vingt-sept images de Mauk Tenieb (attente-01 à attente-27), au hasard, le temps que la borne se monte.
- Cadre : l'enseigne Burrows, éclairée, au-dessus de l'écran ; l'autocollant Lore collé de travers au coin ; sous l'écran, les Koins et la dynamite Baku Boom (le mot BAKU BOOM s'allume à l'activation) ; dans un programme, la manette en miroir.
- Écran : la vitre imprimée l'entoure à l'accueil ; l'écran tient entier dans la fenêtre à l'arrivée, sur toute taille ; les Koins au pied de l'écran, avec le décompte de la Koin gratuite à zéro ; SkopoRhogo à la minute exacte de l'heure du visiteur ; FaunInvaders redresse l'écran à la verticale.

## Koins
- Départ à 3, plafond 99 ; une Koin par victoire, quel que soit le jeu ; une par connexion 3615 KOINS.
- La première partie d'un programme se paie au premier geste dans l'écran ; zapper reste gratuit.
- Rejouer dans un programme ouvert (autre mot, autre grille, autre niveau, nouvelle partie) coûte une Koin (borne-arcade.js, __borneReplay).
- À zéro Koin, une Koin gratuite revient au bout de 60 s.

## Deux états
- La borne au repos (accueil) : le meuble entier et ses décors, vitre imprimée, enseigne, bandeau Burrows, plante, caméra, aimant ; les psychopompes la font visiter.
- La visite des psychopompes est obligatoire : elle tient lieu de mode d'emploi. Un geste du visiteur (molette, doigt, clavier) la fige ; quatre secondes sans geste, elle reprend où elle en était. Seule la molette 👣 du bas arrête les psychopompes pour de bon ; elle est sur marche par défaut. Le psychopompe se pose à côté de l'enseigne, du compteur de Koins et de Baku Boom.
- Le jeu (chaque programme) : l'écran seul, à la taille maximale de la fenêtre, sans cadre ni décor ; dessous, une rangée : Koins, son, PL, Kapture, Immersion, Baku Boom. Burrows reste à l'accueil.
- Chaque programme s'ouvre directement sur son propre écran, sans carte-titre de la borne ; au repos, l'écran montre SkopoRhogo en direct.
- En jeu, la page reste immobile : Espace, flèches et molette vont au jeu ; un jeu plus haut que l'écran se réduit d'un bloc et tient entier.
- Le passage : lancer un jeu rapproche la caméra de la borne jusqu'à ce que l'écran remplisse la fenêtre, en une demi-seconde ; Baku Boom fait le tilt, le tube s'éteint, puis la caméra recule de l'écran plein cadre jusqu'à la borne entière.
- Panneau : BC, TL, IG en rangée de départ ; la manette au milieu, entre quatre touches-pavés lumineuses, KorhoGame (grands jeux d'un côté, Katabatik et son dé de l'autre), FaunEye (BakuBook, VHS, FotoFauna, Musik, DiktatFaune), 3615, SURFAUNA (Reporhogo, FaunaTor) ; la plaque émaillée Mauk Tenieb sur le bord avant, qui ouvre https://github.com/mauktenieb.
- Porte : la fente INSERT KOIN (décompte de la Koin gratuite à zéro Koin) ; les molettes 🧤 (skin bois ou métal), 🎶 (tout le son), FR · EN et 👣 (les psychopompes, présents par défaut), sur leur plaque à droite de la porte ; l'aimant Dekonect en bas à droite ; tout en bas, le copyright.

## Grammaire commune
1. Toucher = agir.
2. Glisser à gauche ou à droite = suivant ou précédent.
3. Pincer ou molette = zoomer.
4. Faire glisser un objet = le déplacer.
5. Appui long = en voir plus.
6. Baku Boom = revenir, toujours sous l'écran ; Échap fait pareil, programmes en cadre compris.
7. Flèches = glissés ; Espace et Entrée = toucher.

D'un programme à l'autre : les points sous l'écran, la manette, ou Page préc. / Page suiv., dans l'ordre du panneau (les bandes des bords restent masquées depuis le 29 oct. : elles volaient les gestes des jeux) ; la neige d'un changement de chaîne et le nom du programme marquent le passage ; des points sous l'écran montrent les programmes du groupe ; à zéro Koin, le glissé saute les jeux payants. Baku Boom ramène à l'accueil et referme le groupe.

Écran : commandes toujours au même endroit, une icône et un mot au plus, zéro phrase d'explication, cibles de 44 px au moins, état toujours visible. Plafond : 99 pour tout (Koins, cassettes, morceaux d'une cassette, Kuration, livres, récits, poses).

## Fichiers
- `borne-cabinet.css`, `borne-cabinet.js` : le meuble, les habits, le tilt, la porte, la grammaire commune, les éclats et reflets, la Koin qui tourne (à l'accueil, gros plan puis vol vers le compteur ou la fente ; en jeu, elle tourne au compteur seulement, sans gros plan ni pluie).
- `borne-aimant.js` : les blocs aimantés ; souris, appuyer puis glisser ; doigt, appui long ; ramené près de sa place, le bloc s'y recolle ; positions gardées par skin.
- La manette a un ressort : poussée, elle dépasse, cogne sa butée, tremble et revient ; le panneau encaisse le choc ; elle suit la boule saisie, les flèches et les glissés sur l'écran.
- L'écran reste la commande première ; la manette suit en miroir. Saisie, elle pilote le jeu ouvert, en analogique : dans Korong! et FaunInvaders la flèche reste tenue au prorata de l'angle, dans les jeux de cases un pas se répète d'autant plus vite que le levier penche (borne-jeu.js).
- `borne-presence.js` : Online Applicants, une diode et un chiffre au pied de l'écran ; chaque visiteur s'annonce toutes les 20 s sous un numéro tiré au hasard, sur un canal MQTT public (trois relais) ; zéro nom, zéro cookie.
- `borne-son.js` : les sons de la mécanique, enregistrements réels du domaine public (borne/snd/, sources dans snd/SOURCES.md), plusieurs variantes par geste, hauteur et volume tirés au hasard ; synthèse en repli si une prise manque.
- Immersion (bouton au pied de l'écran) : l'écran seul en plein écran ; un glissé parti d'un bord change de programme ; ✕ ou Échap pour sortir. Le Minitel s'affiche plus lumineux ; la Kam de Kapture indique BAK ou FRONT.
- `borne-diktat.html` : DiktatFaune (FaunEye) ; 3, 5 ou 10 s au micro, choisi dans la liste quand il y en a plusieurs, demandé une fois par session ; hauteur et vitesse indépendantes, endroit ou envers ; SAVE en .wav au nom du calendrier républicain.
- `borne-jeu.js` : chaque jeu agrandi et centré à la mesure de l'écran ; la manette choisit et enfonce les touches à l'accueil, envoie flèches et Espace dans les jeux ; son socle la déplace.
- `borne-skopo.js` : SkopoRhogo à l'heure du visiteur.
- `borne-fauneye.html` : BakuBook, le lecteur universel (stock de fac-similés, fichiers du visiteur, Internet Archive, Gutenberg, Wikisource, Google Books ; zoom, loupe, vignettes, typographie).
- `borne-fotofauna.js`, `borne-fotofauna.css` : FotoFauna, le logo et le viseur déclenchent ; caméra avant ou arrière ; Une, Superposer, Pellicule.
- `borne-frames.css` : retouches de Reporhogo et de FaunaTor.
- `borne-bio.html` : la bio, lue en direct du README du profil GitHub.
- `borne-musik.js` : les cinq derniers sons enregistrés ou traités dans DiktatFaune deviennent cinq pistes en bas de Musik (IndexedDB « borne », magasin « diktat ») ; chaque pas joue le son depuis son début, une mesure au plus ; KAVE IT! les mêle à l'export.
- `borne-say.txt` : une phrase des psychopompes pour les arrêts propres à la borne (touches, BC, liseuse, FaunInvaders, Musik) ; leurs répliques d'Insert Koin restent celles de l'artiste.
- `borne-lobby.json` : zones cliquables des 18 Masks sur l'image de l'écran titre, devant Korong!.

Les robots d'indexation passent leur chemin : `Disallow: /borne/` et `noindex` sur chaque page de la borne.
