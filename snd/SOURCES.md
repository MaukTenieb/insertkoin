# Sons de la borne

Les sons de `borne-son.js` viennent d'enregistrements réels d'objets : interrupteurs, pièces de monnaie dans un téléphone public, flipper électromécanique, loquets de métal, ronfleur électrique, ventilateur. Chaque son existe en deux fichiers : `.ogg` (Opus) et `.mp3` (repli pour Safari).

## Sources

- SSE Library, Internet Archive (« Sound effects from the USC Cinema and/or the Sunset Editorial Collection »). Licence indiquée dans les métadonnées de chaque élément : `licenseurl` = https://creativecommons.org/publicdomain/zero/1.0/ (CC0 1.0). Auteur : non indiqué.
  - SSE_Library_GAMES : https://archive.org/details/SSE_Library_GAMES
  - SSE_Library_COMMUNICATIONS : https://archive.org/details/SSE_Library_COMMUNICATIONS
  - SSE_Library_MECHANICAL : https://archive.org/details/SSE_Library_MECHANICAL
  - SSE_Library_DOORS : https://archive.org/details/SSE_Library_DOORS
  - SSE_Library_AMBIENCE : https://archive.org/details/SSE_Library_AMBIENCE
- GOLD TAPE, Internet Archive (même collection USC Cinema / Sunset Editorial). Licence indiquée dans les métadonnées : `licenseurl` = https://creativecommons.org/publicdomain/zero/1.0/ (CC0 1.0). Auteur : non indiqué.
  - GOLD_TAPE_19_20_Bells_Buzzers : https://archive.org/details/GOLD_TAPE_19_20_Bells_Buzzers
- D. D. Teoli Jr., Internet Archive. Licence indiquée dans les métadonnées : `licenseurl` = http://creativecommons.org/publicdomain/mark/1.0/ (marque du domaine public 1.0). Auteur : D. D. Teoli Jr. (champ `creator`).
  - ClickSwitchOnLampD.D.TeoliJr. : https://archive.org/details/ClickSwitchOnLampD.D.TeoliJr.
- Kenney (Kenney Vleugels), paquet Impact Sounds, et Benjamin Burnes (Abstraction), paquet « bb - Smol Mechanisms ». Licence : CC0 1.0, d'après le `License.txt` du paquet Kenney et le `_README.txt` du paquet Benjamin Burnes (« These sounds are public domain (Creative Commons 0) »). Fichiers pris dans l'archive `kenney-audio.zip` (SHA-256 `dc7ab0b9d26b4649ade22197e2eed5f33453097fd7b99a11a5e6403a289465df`) publiée sur https://github.com/incorruptibleyt/AAA-GAME-DESIGN/releases/download/audio-pack/kenney-audio.zip, et dans le dépôt https://github.com/lavenderdotpet/CC0-Public-Domain-Sounds, commit `f2b6264f9ab89fabc266914c3654685d68c5a39b`. Pages d'origine : https://kenney.nl/assets/impact-sounds, https://gumroad.com/ben_burnes.

## Traitement commun

Conversion en mono 48 kHz ; filtre passe-haut d'ordre 2 (40 Hz pour les coups, 50 Hz pour le ronfleur, 30 Hz pour la mise sous tension, 25 Hz pour le ronronnement) ; découpe 3 ms avant l'attaque ; fondu d'entrée de 1,5 ms (12 ms pour le ronfleur) et fondu de sortie en cosinus ; niveau ramené à -16 dBFS RMS sur la partie active (trames à moins de 30 dB du maximum), crête plafonnée à -1 dBFS (boucle du ronronnement : -20 dBFS RMS) ; encodage Opus 56 kb/s (boucle : 48 kb/s) et MP3 64 kb/s, métadonnées retirées. Poids total : 228 Ko en Ogg, 267 Ko en MP3.

## Fichiers

Les temps donnent la découpe dans le fichier original.

| Fichier | Ce que c'est | Original | Élément | Adresse | Licence | Retouche |
|---|---|---|---|---|---|---|
| `press-1` | interrupteur mural qui bascule | SWITCH/MECHSwtch_Footsteps; turning off several light switches_CS_USC.flac | SSE_Library_MECHANICAL | https://archive.org/download/SSE_Library_MECHANICAL/SWITCH/MECHSwtch_Footsteps%3B%20turning%20off%20several%20light%20switches_CS_USC.flac | CC0 1.0 | 1,551-1,711 s |
| `press-2` | interrupteur mural qui bascule | idem | SSE_Library_MECHANICAL | idem | CC0 1.0 | 2,279-2,439 s |
| `press-3` | interrupteur mural qui bascule | idem | SSE_Library_MECHANICAL | idem | CC0 1.0 | 3,085-3,245 s |
| `press-4` | interrupteur mural qui bascule | idem | SSE_Library_MECHANICAL | idem | CC0 1.0 | 3,831-3,991 s |
| `press-5` | interrupteur mural qui bascule | idem | SSE_Library_MECHANICAL | idem | CC0 1.0 | 4,445-4,605 s |
| `release-1` | déclic sec d'un interrupteur de lampe | Click switch on lamp D.D. Teoli Jr..mp3 | ClickSwitchOnLampD.D.TeoliJr. | https://archive.org/download/ClickSwitchOnLampD.D.TeoliJr./Click%20switch%20on%20lamp%20D.D.%20Teoli%20Jr..mp3 | marque du domaine public 1.0 | 1,108-1,168 s |
| `release-2` | déclic sec d'un interrupteur de lampe | idem | ClickSwitchOnLampD.D.TeoliJr. | idem | marque du domaine public 1.0 | 2,239-2,299 s |
| `release-3` | déclic sec d'un interrupteur de lampe | idem | ClickSwitchOnLampD.D.TeoliJr. | idem | marque du domaine public 1.0 | 4,177-4,237 s |
| `release-4` | déclic sec d'un interrupteur de lampe | idem | ClickSwitchOnLampD.D.TeoliJr. | idem | marque du domaine public 1.0 | 5,456-5,516 s |
| `release-5` | déclic sec d'un interrupteur de lampe | idem | ClickSwitchOnLampD.D.TeoliJr. | idem | marque du domaine public 1.0 | 7,617-7,677 s |
| `release-6` | déclic sec d'un interrupteur de lampe | idem | ClickSwitchOnLampD.D.TeoliJr. | idem | marque du domaine public 1.0 | 8,575-8,635 s |
| `tick-1` | clic de métal | CLICK/MECHClik_Metal clicks; several takes_CS_USC.flac | SSE_Library_MECHANICAL | https://archive.org/download/SSE_Library_MECHANICAL/CLICK/MECHClik_Metal%20clicks%3B%20several%20takes_CS_USC.flac | CC0 1.0 | 4,372-4,492 s |
| `tick-2` | clic de métal | idem | SSE_Library_MECHANICAL | idem | CC0 1.0 | 8,183-8,303 s |
| `tick-3` | clic de métal | idem | SSE_Library_MECHANICAL | idem | CC0 1.0 | 10,489-10,609 s |
| `tick-4` | clic de métal | idem | SSE_Library_MECHANICAL | idem | CC0 1.0 | 6,495-6,615 s |
| `detent-1` | cliquet étouffé | Ratchet Muted 1.wav | bb - Smol Mechanisms (May 2021), Benjamin Burnes | https://raw.githubusercontent.com/lavenderdotpet/CC0-Public-Domain-Sounds/f2b6264f9ab89fabc266914c3654685d68c5a39b/bb%20-%20Smol%20Mechanisms%20%28May%202021%29/Ratchet%20Muted%201.wav | CC0 1.0 | clic seul, à 0,026 s |
| `detent-2` | cliquet étouffé | Ratchet Muted 1.wav | bb - Smol Mechanisms (May 2021), Benjamin Burnes | idem | CC0 1.0 | clic seul, à 0,063 s |
| `detent-3` | cliquet étouffé | Ratchet Muted 1.wav | bb - Smol Mechanisms (May 2021), Benjamin Burnes | idem | CC0 1.0 | clic seul, à 0,107 s |
| `detent-4` | cliquet étouffé | Ratchet Muted 2.wav | bb - Smol Mechanisms (May 2021), Benjamin Burnes | https://raw.githubusercontent.com/lavenderdotpet/CC0-Public-Domain-Sounds/f2b6264f9ab89fabc266914c3654685d68c5a39b/bb%20-%20Smol%20Mechanisms%20%28May%202021%29/Ratchet%20Muted%202.wav | CC0 1.0 | clic seul, à 0,065 s |
| `detent-5` | cliquet étouffé | Ratchet Muted 2.wav | bb - Smol Mechanisms (May 2021), Benjamin Burnes | idem | CC0 1.0 | clic seul, à 0,108 s |
| `detent-6` | cliquet étouffé | Ratchet Muted 2.wav | bb - Smol Mechanisms (May 2021), Benjamin Burnes | idem | CC0 1.0 | clic seul, à 0,156 s |
| `detent-7` | cliquet étouffé | Ratchet Muted 3.wav | bb - Smol Mechanisms (May 2021), Benjamin Burnes | https://raw.githubusercontent.com/lavenderdotpet/CC0-Public-Domain-Sounds/f2b6264f9ab89fabc266914c3654685d68c5a39b/bb%20-%20Smol%20Mechanisms%20%28May%202021%29/Ratchet%20Muted%203.wav | CC0 1.0 | clic seul, à 0,188 s |
| `detent-8` | cliquet étouffé | Ratchet Muted 3.wav | bb - Smol Mechanisms (May 2021), Benjamin Burnes | idem | CC0 1.0 | clic seul, à 0,220 s |
| `detent-9` | cliquet étouffé | Ratchet Muted 3.wav | bb - Smol Mechanisms (May 2021), Benjamin Burnes | idem | CC0 1.0 | clic seul, à 0,364 s |
| `knock-1` | flipper : contact du bouton et coup de bobine | ARCADE/GAMEArcd_Pinball machine sequence 2_CS_USC.flac | SSE_Library_GAMES | https://archive.org/download/SSE_Library_GAMES/ARCADE/GAMEArcd_Pinball%20machine%20sequence%202_CS_USC.flac | CC0 1.0 | 10,007-10,247 s |
| `knock-2` | flipper : contact du bouton et coup de bobine | idem | SSE_Library_GAMES | idem | CC0 1.0 | 10,637-10,877 s |
| `knock-3` | flipper : coup de bobine | idem | SSE_Library_GAMES | idem | CC0 1.0 | 47,897-48,117 s |
| `knock-4` | flipper : coup de bobine | ARCADE/GAMEArcd_Pinball machine sequence 1_CS_USC.flac | SSE_Library_GAMES | https://archive.org/download/SSE_Library_GAMES/ARCADE/GAMEArcd_Pinball%20machine%20sequence%201_CS_USC.flac | CC0 1.0 | 65,299-65,469 s |
| `twang-1` | lame à ressort | Spring Loaded Blade 1.wav | bb - Smol Mechanisms (May 2021), Benjamin Burnes | https://raw.githubusercontent.com/lavenderdotpet/CC0-Public-Domain-Sounds/f2b6264f9ab89fabc266914c3654685d68c5a39b/bb%20-%20Smol%20Mechanisms%20%28May%202021%29/Spring%20Loaded%20Blade%201.wav | CC0 1.0 | 0,55 s premières |
| `twang-2` | lame à ressort | Spring Loaded Blade 2.wav | bb - Smol Mechanisms (May 2021), Benjamin Burnes | https://raw.githubusercontent.com/lavenderdotpet/CC0-Public-Domain-Sounds/f2b6264f9ab89fabc266914c3654685d68c5a39b/bb%20-%20Smol%20Mechanisms%20%28May%202021%29/Spring%20Loaded%20Blade%202.wav | CC0 1.0 | 0,55 s premières |
| `twang-3` | lame à ressort | Spring Loaded Blade 3.wav | bb - Smol Mechanisms (May 2021), Benjamin Burnes | https://raw.githubusercontent.com/lavenderdotpet/CC0-Public-Domain-Sounds/f2b6264f9ab89fabc266914c3654685d68c5a39b/bb%20-%20Smol%20Mechanisms%20%28May%202021%29/Spring%20Loaded%20Blade%203.wav | CC0 1.0 | 0,55 s premières |
| `twang-4` | lame à ressort | Spring Loaded Blade 4.wav | bb - Smol Mechanisms (May 2021), Benjamin Burnes | https://raw.githubusercontent.com/lavenderdotpet/CC0-Public-Domain-Sounds/f2b6264f9ab89fabc266914c3654685d68c5a39b/bb%20-%20Smol%20Mechanisms%20%28May%202021%29/Spring%20Loaded%20Blade%204.wav | CC0 1.0 | 0,55 s premières |
| `twang-5` | lame à ressort | Spring Loaded Blade 5.wav | bb - Smol Mechanisms (May 2021), Benjamin Burnes | https://raw.githubusercontent.com/lavenderdotpet/CC0-Public-Domain-Sounds/f2b6264f9ab89fabc266914c3654685d68c5a39b/bb%20-%20Smol%20Mechanisms%20%28May%202021%29/Spring%20Loaded%20Blade%205.wav | CC0 1.0 | 0,55 s premières |
| `coin-1` | pièce qui tourne et roule sur le métal du téléphone public | TELEPHONE/COMTelph_Coin return from pay telephone_CS_USC.flac | SSE_Library_COMMUNICATIONS | https://archive.org/download/SSE_Library_COMMUNICATIONS/TELEPHONE/COMTelph_Coin%20return%20from%20pay%20telephone_CS_USC.flac | CC0 1.0 | 0,125-1,075 s |
| `coin-2` | pièce qui roule dans le téléphone public | idem | SSE_Library_COMMUNICATIONS | idem | CC0 1.0 | 13,571-14,321 s |
| `coin-3` | pièce qui roule dans le téléphone public | idem | SSE_Library_COMMUNICATIONS | idem | CC0 1.0 | 19,711-20,311 s |
| `drop-1` | pièce qui rebondit dans le godet de métal et sonne | idem | SSE_Library_COMMUNICATIONS | idem | CC0 1.0 | 2,441-3,441 s |
| `drop-2` | pièce qui frappe le godet de métal | idem | SSE_Library_COMMUNICATIONS | idem | CC0 1.0 | 7,563-7,843 s |
| `drop-3` | pièces qui tombent dans le godet de métal | idem | SSE_Library_COMMUNICATIONS | idem | CC0 1.0 | 15,131-15,981 s |
| `drop-4` | pièces qui tombent dans le godet de métal | idem | SSE_Library_COMMUNICATIONS | idem | CC0 1.0 | 23,060-23,860 s |
| `buzz-1` | ronfleur électrique sur secteur (120 Hz) | G20-36-Short Buzz.wav | GOLD_TAPE_19_20_Bells_Buzzers | https://archive.org/download/GOLD_TAPE_19_20_Bells_Buzzers/G20-36-Short%20Buzz.wav | CC0 1.0 | 1,467-2,087 s |
| `buzz-2` | ronfleur électrique sur secteur (120 Hz) | idem | GOLD_TAPE_19_20_Bells_Buzzers | idem | CC0 1.0 | 2,369-3,009 s |
| `buzz-3` | ronfleur électrique sur secteur (120 Hz) | idem | GOLD_TAPE_19_20_Bells_Buzzers | idem | CC0 1.0 | 3,380-3,980 s |
| `buzz-4` | ronfleur électrique sur secteur (120 Hz) | idem | GOLD_TAPE_19_20_Bells_Buzzers | idem | CC0 1.0 | 4,749-5,699 s |
| `thump-1` | claquement lourd d'une grande armoire de métal | METAL/DOORMetl_Elevator doors or large metal cabinet; latches_CS_USC.flac | SSE_Library_DOORS | https://archive.org/download/SSE_Library_DOORS/METAL/DOORMetl_Elevator%20doors%20or%20large%20metal%20cabinet%3B%20latches_CS_USC.flac | CC0 1.0 | 13,357-13,807 s |
| `thump-2` | flipper : coup de bobine | ARCADE/GAMEArcd_Pinball machine sequence 2_CS_USC.flac | SSE_Library_GAMES | https://archive.org/download/SSE_Library_GAMES/ARCADE/GAMEArcd_Pinball%20machine%20sequence%202_CS_USC.flac | CC0 1.0 | 44,037-44,437 s |
| `suck-1` | choc léger sur métal, à l'envers | impactMetal_light_000.ogg | Kenney Impact Sounds | https://github.com/incorruptibleyt/AAA-GAME-DESIGN/releases/download/audio-pack/kenney-audio.zip (impact-sounds/impactMetal_light_000.ogg) ; https://kenney.nl/assets/impact-sounds | CC0 1.0 | inversé, 0,22 s finales gardées |
| `suck-2` | choc léger sur métal, à l'envers | impactMetal_light_003.ogg | Kenney Impact Sounds | https://github.com/incorruptibleyt/AAA-GAME-DESIGN/releases/download/audio-pack/kenney-audio.zip (impact-sounds/impactMetal_light_003.ogg) ; https://kenney.nl/assets/impact-sounds | CC0 1.0 | inversé, 0,22 s finales gardées |
| `clack-1` | loquet d'une grande armoire de métal | METAL/DOORMetl_Elevator doors or large metal cabinet; latches_CS_USC.flac | SSE_Library_DOORS | https://archive.org/download/SSE_Library_DOORS/METAL/DOORMetl_Elevator%20doors%20or%20large%20metal%20cabinet%3B%20latches_CS_USC.flac | CC0 1.0 | 4,717-4,917 s |
| `clack-2` | loquet d'une grande armoire de métal | idem | SSE_Library_DOORS | idem | CC0 1.0 | 18,637-18,887 s |
| `clack-3` | pêne de porte | HARDWARE/DOORHdwr_Short door latch_CS_USC.flac | SSE_Library_DOORS | https://archive.org/download/SSE_Library_DOORS/HARDWARE/DOORHdwr_Short%20door%20latch_CS_USC.flac | CC0 1.0 | 0,014-0,294 s |
| `clack-4` | pêne de porte | idem | SSE_Library_DOORS | idem | CC0 1.0 | 0,325-0,605 s |
| `clack-5` | serrure qui s'ouvre | LOCK/MECHLock_Lock opens; could be door; gun or other small_CS_USC.flac | SSE_Library_MECHANICAL | https://archive.org/download/SSE_Library_MECHANICAL/LOCK/MECHLock_Lock%20opens%3B%20could%20be%20door%3B%20gun%20or%20other%20small_CS_USC.flac | CC0 1.0 | 24,282-24,482 s |
| `power-1` | mise sous tension d'un flipper : choc, bourdon du transformateur, relais | ARCADE/GAMEArcd_Pinball machine sequence 1_CS_USC.flac | SSE_Library_GAMES | https://archive.org/download/SSE_Library_GAMES/ARCADE/GAMEArcd_Pinball%20machine%20sequence%201_CS_USC.flac | CC0 1.0 | 1,692-3,292 s, fondu de sortie de 0,7 s |
| `hum-1` | ventilateur d'une grande salle, bourdon du transformateur d'un flipper | PRISON/AMBPrisn_Interior prison background; mostly fan noise_CS_USC.flac + ARCADE/GAMEArcd_Pinball machine sequence 1_CS_USC.flac | SSE_Library_AMBIENCE ; SSE_Library_GAMES | https://archive.org/download/SSE_Library_AMBIENCE/PRISON/AMBPrisn_Interior%20prison%20background%3B%20mostly%20fan%20noise_CS_USC.flac ; https://archive.org/download/SSE_Library_GAMES/ARCADE/GAMEArcd_Pinball%20machine%20sequence%201_CS_USC.flac | CC0 1.0 | ventilateur 7,0-20,2 s, boucle de 12 s par fondu enchaîné de 1 s à puissance constante ; bourdon du flipper au repos 67,95-69,10 s, ralenti au rapport 5/6 (60 Hz secteur américain ramené à 50 Hz), boucle de 1,2 s répétée dix fois, mêlé 8 dB sous le ventilateur ; 0,1 s de fin placées en tête et 0,3 s de reprise ajoutées en fin |
