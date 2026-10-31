# Provenance des ressources de FotoFauna (pf/)

Chaque image de ces dossiers sort d'un générateur procédural écrit pour FotoFauna (Python : numpy, OpenCV, Pillow ; graine fixe par fichier, rendu reproductible). Les noms, dimensions relatives, canaux alpha et valeurs neutres suivent ce que le moteur de `fotofauna.html` attend pour chaque calque (manifestes `MAN`, gabarits `MAG`, modes de fusion). Les polices viennent du dépôt public google/fonts sur GitHub, avec leur licence à côté du fichier. Licence des images générées : MIT, comme le code de la borne.

Générateurs : dépôt de travail, dossier `shots/foto/tex/` (`fxcommon.py` pour le bruit, les poussières, les fuites et l'écriture WebP ; `lutgen.py` pour les tables de couleurs).

| Dossier | Contenu | Fabrication |
|---|---|---|
| `analogfilm/` | `GrainTexture` (gris neutre raccordable, overlay), `DUST-01…50` (poussières, fibres, rayures blanc sur noir, écran) | `gen_analogfilm.py` |
| `cameraplus/23`, `611`, `30` | fuites de lumière, masques de pellicule, étoiles, nébuleuse, grains, vignettes, bokeh, halos, rayures Super 8 ; bordures découpées dans un cadre complet (passe-partout, instantané, papier dentelé, bords brûlés, impression offset avec repères et gamme, pliure, grain, pellicule perforée, viseur) ; cadres Hollywood (affiche, téléviseur cathodique, boîtiers DVD et VHS, téléviseur plat, Super 8, 16 mm, Super 35) avec leurs masques | `gen_cameraplus.py` ; fichiers 611 de même nom et mêmes dimensions qu'en 2.3 : copies |
| `camly/` | calques de filtres `media/` (fuites, caméra de surveillance, couleurs, pellicule et cadres), masques d'outils `res/` (flou, fisheye, dégradé de ligne, vignette en 8 pièces, formes), bruit, fonds tuilés `res/edit_size_texture_pack_*` et `bg/pack-*`, cadres `frames/1…28`, `manifest.json` | `gen_camly.py` |
| `camly/fonts/` | `BebasNeue.otf` (Bebas Neue, Dharma Type), `Pacifico.ttf` (Pacifico, Vernon Adams) | github.com/google/fonts, SIL Open Font License 1.1 (`*-OFL.txt`) |
| `lotogram/film/` | 10 tables 512×512 `FM-*` | `gen_lotogram.py` : interpolation trilinéaire des grilles 9³ déjà présentes dans `fotofauna.html` (`FF.lotogram`, repli du moteur) ; même rendu que ce repli |
| `moldiv/` | 13 tables `lut/lut_*` (étalonnages paramétriques), textures de filtres `texture/`, motifs de fond `pattern/frame_bg_ptn_01…80`, images des 100 gabarits `magazine/` (fonds, surimpressions hors des cases photo, titres KORHOGO, numéros, gris typographique, codes-barres) | `gen_moldiv.py` |
| `pixlromatic/` | overlays et bordures aux dimensions du manifeste, `air10/` pour la version 1.0 | `gen_pixlromatic.py` |
| `polamatic/301`, `423` | calques d'effets et du pack de couleurs, fuites `_0000…_0099_leak`, cadres instantanés neufs, usés et colorés, ombres, tables de couleurs 4.2.3, textures des recettes (grain, émulsion, bords, teintes), flux d'émulsion, voile de développement | `gen_polamatic.py` |
| `polamatic/fonts/` | Permanent Marker, Rock Salt (Font Diner) ; Reenie Beanie (James Grieshaber) ; Covered By Your Grace, Nothing You Could Do (Kimberly Geswein) | github.com/google/fonts ; Apache License 2.0 (`*-LICENSE.txt`) pour Permanent Marker et Rock Salt, SIL Open Font License 1.1 (`*-OFL.txt`) pour les trois autres |
| `luts/`, `tex/` | tables de pellicules et matières | voir `CREDITS.txt` |

Les noms de pellicules, de marques et d'applications désignent le rendu imité ; ils appartiennent à leurs propriétaires.
