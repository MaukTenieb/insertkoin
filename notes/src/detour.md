---
slug: detour
title: Detour, three judges for one outline
title_fr: Detour, trois juges pour un contour
date: 2026-10-10
rep: 19 vendémiaire an 235
description: How Detour cuts a Midjourney sheet of eight portraits into a transparent sprite strip: two matting networks and a backdrop model vote on every pixel, and each correction answers a failure seen on a sheet.
links: [Detour on GitHub](https://github.com/MaukTenieb/detour) · [Catchlight, the next step](catchlight.html) · [Insert Koin](../)
---
Insert Koin draws its eighteen Masks from Midjourney sheets: one character, eight expressions, a 4 × 2 grid on a painted backdrop. Detour, a Python program by Mauk Tenieb, cuts each sheet into a transparent strip of eight sprites, in about 20 seconds per sheet on a two-core cloud processor, with the same settings for every sheet.

Three judges vote on every pixel. Two matting networks, U²-Net and IS-Net, each draw a figure mask; the third judge models the painted backdrop as a smooth field and claims a backdrop region only where that region reaches the edges of the panel. A majority of two votes decides, and two corrections follow.

The matting networks learn from photographs of people, and they drop drawn accessories: wings, a cloud in place of a head, a telephone receiver. Where the backdrop judge sees texture, Detour keeps those areas in the figure. Detour also removes from the figure any smooth backdrop that an arm or the legs enclose, even where both networks keep it: the pocket rule.

In its first version, the pocket rule removes a hoof of Croisière Noire, a bull whose hoof shares the brightness of the backdrop. A hue test now spares every pocket whose colour departs from the local backdrop by more than 2.8 on the a–b plane of OpenCV's Lab space: the beige hoof runs warmer than the beige floor.

In panel 7 of the test sheets, the character leans on a table. Detour samples the colour of the wood where the networks mark wood, cuts the table at its top edge and keeps the hands resting on it. On sheets with hand-drawn panel borders, Detour steps past the dark border lines, on the top and the sides, before it measures the backdrop.

Within four pixels of the outline, each pixel joins the side whose local colour it matches: the figure's or the backdrop's. Detour removes painted drop shadows and keeps ink lines and the pixels both networks hold with confidence. Detour then turns the outline into a distance field, scales it to the final size and antialiases it there, so the edge carries the figure's own colours. Each row of the sheet matches the first on the silhouette of head and shoulders, and the top of every head sits on one line.

Detour writes a proof with every run: each frame at full size on magenta and on white, a yellow outline around any area where one frame disagrees with the seven others, and a report that counts these doubts.

Detour ends with a blind test. Mauk Tenieb makes four new sheets in Midjourney, outside the set the rules come from, and they go through Detour with the same settings: long loose red hair on pale cream; a lit candle held in hand and a black tuxedo on a dark backdrop; a wide figure touching the panel sides, inside hand-drawn borders, on a gradient; a yellow oilskin and a white beard on grey. On all four, the hands resting on the table stay and the wood goes.

## En français

Insert Koin tire ses dix-huit Masks de planches Midjourney : un personnage, huit expressions, une grille de 4 × 2 sur un fond peint. Detour, un programme Python de Mauk Tenieb, découpe chaque planche en une bande transparente de huit sprites, en vingt secondes environ par planche sur un processeur de serveur à deux cœurs, avec les mêmes réglages pour toutes les planches.

Trois juges votent sur chaque pixel. Deux réseaux de détourage, U²-Net et IS-Net, dessinent chacun un masque de silhouette ; le troisième juge modélise le fond peint comme un champ lisse et revendique une zone de fond seulement là où cette zone touche les bords de la case. Une majorité de deux voix tranche, puis deux corrections suivent.

Les réseaux de détourage apprennent sur des photographies de personnes et perdent les accessoires dessinés : des ailes, un nuage à la place d'une tête, un combiné de téléphone. Là où le juge du fond voit de la texture, Detour garde ces zones dans la silhouette. Detour retire aussi de la silhouette tout fond lisse qu'un bras ou les jambes enferment, même quand les deux réseaux le gardent : la règle des poches.

Dans sa première version, la règle des poches retire un sabot de Croisière Noire, un taureau au sabot aussi clair que le fond. Un test de teinte épargne désormais toute poche dont la couleur s'écarte du fond local de plus de 2,8 sur le plan a–b de l'espace Lab d'OpenCV : le sabot beige tire vers le chaud, le sol beige vers le froid.

Dans la case 7 des planches de test, le personnage s'appuie sur une table. Detour échantillonne la couleur du bois là où les réseaux marquent du bois, coupe la table à son bord supérieur et garde les mains posées dessus. Sur les planches aux bordures dessinées à la main, Detour enjambe les traits sombres du haut et des côtés avant de mesurer le fond.

À moins de quatre pixels du contour, chaque pixel rejoint le côté dont il partage la couleur locale : la silhouette ou le fond. Detour retire les ombres portées peintes et garde les traits d'encre et les pixels sûrs pour les deux réseaux. Detour convertit ensuite le contour en champ de distance, le met à l'échelle finale puis l'anticrénèle à cette taille, et le bord garde les couleurs propres de la silhouette. Chaque rangée de la planche s'aligne sur la première d'après la silhouette de la tête et des épaules, et le sommet de chaque tête tient sur une seule ligne.

Detour écrit une épreuve à chaque passage : chaque image en taille réelle sur magenta et sur blanc, un contour jaune autour de toute zone où une image contredit les sept autres, et un rapport qui compte ces doutes.

Detour finit par un test à l'aveugle. Mauk Tenieb crée quatre nouvelles planches dans Midjourney, hors du jeu d'où viennent les règles, et elles passent dans Detour avec les mêmes réglages : de longs cheveux roux défaits sur un fond crème pâle ; une bougie allumée tenue en main et un smoking noir sur un fond sombre ; une large silhouette qui touche les côtés de la case, dans des bordures dessinées, sur un dégradé ; un ciré jaune et une barbe blanche sur du gris. Sur les quatre, les mains posées sur la table restent et le bois part.
