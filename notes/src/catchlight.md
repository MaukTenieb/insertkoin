---
slug: catchlight
title: Catchlight, lights in the eyes of eighteen Masks
title_fr: Catchlight, des lumières dans les yeux de dix-huit Masks
date: 2026-10-10
rep: 19 vendémiaire an 235
description: How Insert Koin places the lights in the eyes of drawn characters on a sprite strip, with MediaPipe Face Mesh, a relative eyelid test and template tracking for beaks and muzzles.
links: [Detour on GitHub](https://github.com/MaukTenieb/detour) · [Catchlight, the page](https://github.com/MaukTenieb/detour/blob/main/catchlight.html) · [Detour, the cut-out](detour.html) · [Insert Koin](../)
---
In Puck You!, the shufflepuck game of Insert Koin, each of the eighteen Masks of the Korhogo Fauna plays from a strip of eight portraits. A small glow sits on the eyes of six of them: Auvergne, dogXim, C7H5N3O6, Honey Buzzard, Croisière Noire and Cadaver Synod. On 10 October 2026 Mauk Tenieb spots catchlights on brows, noses and foreheads.

Claude, the AI assistant that writes the code of Insert Koin with Mauk Tenieb, first places the lights by hand: it reads eye positions by sight on six-times enlargements of every face, over two rounds. That method sets the right-eye light of C7H5N3O6 6.5 cell units right of the pupil, and it switches off the lights of frame 2 of the same Mask, whose eyes stand open. A cell unit is one pixel of the sprite at game size.

MediaPipe Face Mesh, Google's face landmark model, takes over. It runs in the browser and returns 478 points per face, one of them at the centre of each iris (points 468 and 473). The tool sends every frame to the model on a grey margin of 100 pixels, at three scales (1.6, 2.4 and 1.1), then sends its mirror image; profiles and small faces need the extra tries. This search finds a face on all 32 frames of Auvergne, dogXim, C7H5N3O6 and Cadaver Synod, three-quarter profiles among them. Two of these faces are masks: the jade face of C7H5N3O6 and the wrestling hood of Cadaver Synod.

The same model reads a beak and a muzzle as faces. On Honey Buzzard, a bird-headed Mask, it reports a face on one frame out of eight, centred on a closed eye. On Croisière Noire, a bull, it reports a face on six frames out of eight and sets the irises on the brow ridges. For these two Masks a switch turns the face model off, and the lights follow the points Mauk Tenieb places.

The model also returns the eyelids. The tool divides the gap between the lids by the width of the eye: shut lids measure 0.02 to 0.09 on Auvergne, dogXim and C7H5N3O6, and 0.15 and 0.18 on Cadaver Synod; the squinting eyes of Auvergne measure 0.18 and 0.22, those of C7H5N3O6 0.17 and 0.24. One threshold for every character mixes these cases. The tool takes the mean of the two eyes and compares it with the character's median: below 55 % of that median, with a floor at 0.10, the frame turns dark. This rule darkens frame 1 of Auvergne, dogXim, C7H5N3O6 and Cadaver Synod, the four frames with shut lids, and keeps every squint lit.

Where the face model returns zero points or stays switched off, a template follows each eye: an 11 × 11 pixel patch around the light searches the next frame within a radius of 12 % of the cell width, and the match holds above a normalised correlation of 0.55.

dogXim has one blue eye, and the light belongs to that eye alone. A setting keeps one eye per frame: the one closest to the light's position on the previous frame.

The page writes catchlights.json, in cell units. Insert Koin reads the file at start-up and rebuilds its table of lights, frame by frame. The artist moves a light with the mouse, downloads the file and drops it into the repository.

On C7H5N3O6, the face model moves the right-eye light 6.5 cell units back onto the pupil and relights frame 2.

## En français

Dans Puck You!, le jeu de palet d'Insert Koin, chacun des dix-huit Masks de la Korhogo Fauna joue depuis une bande de huit portraits. Six d'entre eux portent une lueur dans les yeux : Auvergne, dogXim, C7H5N3O6, Honey Buzzard, Croisière Noire et Cadaver Synod. Le 10 octobre 2026, Mauk Tenieb repère des reflets sur des sourcils, des nez et des fronts.

Claude, l'assistant d'IA qui écrit le code d'Insert Koin avec Mauk Tenieb, place d'abord les lumières à la main : il lit à l'œil la position des yeux sur des agrandissements au sextuple, en deux passes. Cette méthode pose la lumière de l'œil droit de C7H5N3O6 à 6,5 unités de case à droite de la pupille et éteint l'image 2 du même Mask, aux yeux ouverts. Une unité de case vaut un pixel du sprite à la taille du jeu.

MediaPipe Face Mesh, le modèle de repères faciaux de Google, prend le relais. Il tourne dans le navigateur et rend 478 points par visage, dont le centre de chaque iris (points 468 et 473). L'outil envoie chaque image au modèle sur une marge grise de 100 pixels, à trois échelles (1,6 ; 2,4 et 1,1), puis son reflet en miroir ; les profils et les petits visages demandent ces essais en plus. Cette recherche trouve un visage sur les 32 images d'Auvergne, dogXim, C7H5N3O6 et Cadaver Synod, trois-quarts compris. Deux de ces visages sont des masques : la face de jade de C7H5N3O6 et la cagoule de catcheur de Cadaver Synod.

Le même modèle prend un bec et un mufle pour des visages. Sur Honey Buzzard, un Mask à tête d'oiseau, il signale un visage sur une seule des huit images, centré sur un œil clos. Sur Croisière Noire, un taureau, il signale un visage sur six images et pose les iris sur les arcades. Pour ces deux Masks, un interrupteur coupe le modèle, et les lumières suivent les points que pose Mauk Tenieb.

Le modèle rend aussi les paupières. L'outil divise l'écart des paupières par la largeur de l'œil : des paupières closes mesurent 0,02 à 0,09 chez Auvergne, dogXim et C7H5N3O6, et 0,15 et 0,18 chez Cadaver Synod ; les yeux plissés d'Auvergne mesurent 0,18 et 0,22, ceux de C7H5N3O6 0,17 et 0,24. Un seuil unique pour tous les personnages mêle ces cas. L'outil prend la moyenne des deux yeux et la compare à la médiane du personnage : sous 55 % de cette médiane, avec un plancher à 0,10, l'image s'éteint. Cette règle éteint l'image 1 d'Auvergne, dogXim, C7H5N3O6 et Cadaver Synod, les quatre images aux paupières closes, et garde allumé chaque plissement.

Là où le modèle rend zéro point ou reste coupé, un gabarit suit chaque œil : une vignette de 11 × 11 pixels autour de la lumière explore l'image suivante dans un rayon de 12 % de la largeur de la case, et la correspondance tient au-dessus d'une corrélation normalisée de 0,55.

dogXim a un œil bleu, et la lumière appartient à cet œil seul. Un réglage garde un œil par image : le plus proche de la position de la lumière sur l'image précédente.

La page écrit catchlights.json, en unités de case. Insert Koin lit ce fichier au démarrage et reconstruit sa table de lumières, image par image. L'artiste déplace une lumière à la souris, télécharge le fichier et le dépose dans le dépôt.

Sur C7H5N3O6, le modèle de visage ramène la lumière de l'œil droit de 6,5 unités de case sur la pupille et rallume l'image 2.
