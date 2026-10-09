
/*
 * Copyright © Mauk Tenieb & Korhogo. All rights reserved. Korhogo™, Korhogo Fauna™, Fauna
 * Masks™, Fauna Chess™, Faunarratik™, Katabatik™, Insert Koin™, Puck You!™ and any related
 * material — including characters, names, symbols, rules, lore and texts, in any form or
 * medium — are the exclusive property of Korhogo™. The source code of this site is
 * published for reading, reflections, additions, requests, etc. - the lore, names, marks
 * and works remain the property of the author. No use for training artificial
 * intelligence. Contact: mauktenieb@gmail.com
 */

/* KG core -- shared code extracted verbatim from kofa.js (Korhogo) for the KG lazy game loader.
 * Contents: Fauna data (portraits moved to kg/assets/faces/*.jpg and re-attached by kg/loader.js
 * before any game that shows faces runs), audio helpers, Kerema click sound, BakuBoom glitch,
 * motto voice, Republican date. Marked [KG] = adapter code that is NOT from the original. */


// \u2500\u2500 DATA \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// [KG] "face" fields emptied here; filled at load time from kg/assets/faces/*.jpg (same base64 content).
const FAUNA=[{"name": "Honey Buzzard", "c": "#d32f2f", "motto": "Even nothing is something that is nothing", "bio": "Decaying entropist \u2014 a tense rot-bringer with red ring's pull. High WIS and DEX weave his cryptic rot.", "pow": "Buzzard's Oil Rot \u2014 corrosive cloud, gear decay. His oil corrodes with entropic bite \u2014 a buzzard's feast on time's carcass.", "stats": {"STR": 6, "DEX": 8, "INT": 7, "WIS": 10, "CHA": 5, "CON": 8}, "yt": "https://youtube.com/playlist?list=PLFNVt1pqV4QijesGLw9rtnzES4Z1IQESG&si=Ga3HTkvTytOoogHs", "face": "", "z": {"fx0": 0.12619617224880383, "fy0": 0.06376195536663125, "fx1": 0.13875598086124402, "fy1": 0.1179596174282678, "fxc": 0.13247607655502391, "fyc": 0.09086078639744952}}, {"name": "C7H5N3O6", "c": "#4fc3f7", "motto": "Efficiency is...", "bio": "Mechanical churner \u2014 a cold grinder with bug-heart precision. High INT and STR crush with relentless blue-grey clank.", "pow": "Golem's Oil Crush \u2014 smash, crippling force. His oil drives a relentless grind \u2014 churning flesh to dust.", "stats": {"STR": 9, "DEX": 8, "INT": 10, "WIS": 6, "CHA": 4, "CON": 7}, "yt": "https://m.youtube.com/playlist?list=PLFNVt1pqV4Qg5I2OxMez_hJdBchajby9X", "face": "", "z": {"fx0": 0.21650717703349281, "fy0": 0.12539851222104145, "fx1": 0.2553827751196172, "fy1": 0.22954303931987247, "fxc": 0.235944976076555, "fyc": 0.17747077577045697}}, {"name": "Silent Pact", "c": "#78909c", "motto": "...", "bio": "Silent guardian \u2014 a solid oath-keeper with black veil's shroud. High WIS and CON hold his quiet strength.", "pow": "Oath's Oil Shroud \u2014 shadows, obscuring veil. His oil cloaks with silent strength \u2014 an oath carved in stillness.", "stats": {"STR": 7, "DEX": 6, "INT": 8, "WIS": 9, "CHA": 5, "CON": 8}, "yt": null, "face": "", "z": {"fx0": 0.3654306220095694, "fy0": 0.21253985122210414, "fx1": 0.3696172248803828, "fy1": 0.2667375132837407, "fxc": 0.3675239234449761, "fyc": 0.23963868225292242}}, {"name": "Poisoned Well", "c": "#ab47bc", "motto": "Words are venom", "bio": "Twisted whisperer \u2014 a sly venom-child with purple sting. High WIS and INT weave his cunning traps.", "pow": "Venom's Oil Whisper \u2014 lie, psychic twist. His oil twists venom into whispers \u2014 a sly child's deadly game.", "stats": {"STR": 4, "DEX": 6, "INT": 9, "WIS": 10, "CHA": 8, "CON": 5}, "yt": "https://youtube.com/playlist?list=PLFNVt1pqV4QjMtqp6JsTU6OzS74RYFnFi&si=TRU0k8p9YRVidQ_-", "face": "", "z": {"fx0": 0.17523923444976078, "fy0": 0.4962805526036132, "fx1": 0.21650717703349281, "fy1": 0.5037194473963869, "fxc": 0.19587320574162678, "fyc": 0.5}}, {"name": "H\u00e1tra L\u00f6v\u00e9s", "c": "#9e9e9e", "motto": "Surviving is striking from behind", "bio": "Swift ambusher \u2014 a precise rider with grey arrow's edge. High DEX and CON track his ragged endurance.", "pow": "Archer's Crude Shot \u2014 oil arrow, fiery pierce. His oil ignites arrows with lethal aim \u2014 piercing the wild's gut.", "stats": {"STR": 6, "DEX": 10, "INT": 5, "WIS": 7, "CHA": 6, "CON": 8}, "yt": "https://youtube.com/playlist?list=PLFNVt1pqV4QjMtqp6JsTU6OzS74RYFnFi&si=TRU0k8p9YRVidQ_-", "face": "", "z": {"fx0": 0.291866028708134, "fy0": 0.4197662061636557, "fx1": 0.3235645933014354, "fy1": 0.48884165781083955, "fxc": 0.30771531100478466, "fyc": 0.4543039319872476}}, {"name": "Plague of Justinian", "c": "#546e7a", "motto": "In contagion strength", "bio": "Surging rot-bringer \u2014 a dark transformer with black miasma's rush. High CHA and CON spread his plague.", "pow": "Plague's Oil Miasma \u2014 toxic mist, spreading rot. His oil spreads a dark scourge \u2014 a plague's wild gift.", "stats": {"STR": 7, "DEX": 6, "INT": 8, "WIS": 5, "CHA": 10, "CON": 8}, "yt": null, "face": "", "z": {"fx0": 0.8265550239234449, "fy0": 0.22422954303931988, "fx1": 0.8696172248803827, "fy1": 0.3007438894792774, "fxc": 0.8480861244019139, "fyc": 0.2624867162592986}}, {"name": "Maiden Call", "c": "#42a5f5", "motto": "I'll come if you come", "bio": "Haunting binder \u2014 a sweet whisperer with anchor's grasp. High CHA and WIS lure with fragile grace.", "pow": "Siren's Oil Lure \u2014 call, psychic pull. Her oil weaves haunting whispers \u2014 binding souls with fragile grace.", "stats": {"STR": 5, "DEX": 7, "INT": 6, "WIS": 8, "CHA": 10, "CON": 6}, "yt": null, "face": "", "z": {"fx0": 0.44557416267942584, "fy0": 0.461211477151966, "fx1": 0.4706937799043062, "fy1": 0.46865037194473963, "fxc": 0.458133971291866, "fyc": 0.46493092454835283}}, {"name": "Truce", "c": "#ffd54f", "motto": "Do we have an agreement?", "bio": "Harmonious balancers \u2014 keen twins with grey-yellow equilibrium. High DEX and INT sync their scales.", "pow": "Scales' Oil Equilibrium \u2014 stat shift, balanced flow. Their oil weighs fate in tandem \u2014 a twin-born harmony trembling under strain.", "stats": {"STR": 6, "DEX": 8, "INT": 8, "WIS": 7, "CHA": 8, "CON": 6}, "yt": null, "face": "", "z": {"fx0": 0.47787081339712917, "fy0": 0.22741764080765142, "fx1": 0.6094497607655502, "fy1": 0.3538788522848034, "fxc": 0.5436602870813397, "fyc": 0.2906482465462274}}, {"name": "Ts'ui P\u00ean", "c": "#ff7043", "motto": "Infinity breathes wisdom", "bio": "Cryptic weaver \u2014 a tangled sage with butterfly's haze. High WIS and INT spin his coded visions.", "pow": "Butterfly's Oil Haze \u2014 mist, blinding veil. His oil unveils cryptic veils \u2014 a butterfly's dance through fate.", "stats": {"STR": 5, "DEX": 6, "INT": 9, "WIS": 10, "CHA": 7, "CON": 6}, "yt": "https://youtube.com/playlist?list=PLFNVt1pqV4QjgHFqgpxHjt3G0vjcWi9Jn&si=Z9IefciV6XCri69C", "face": "", "z": {"fx0": 0.5293062200956937, "fy0": 0.434643995749203, "fx1": 0.5933014354066986, "fy1": 0.5058448459086079, "fxc": 0.5613038277511961, "fyc": 0.47024442082890544}}, {"name": "Aube", "c": "#f48fb1", "motto": "Light dawns anew", "bio": "Armoured dawnbreaker \u2014 a gutsy visionary wielding oil-slick wrath with pink-handed resolve. High WIS and DEX carve her as a ritual blade, slicing light through shadow.", "pow": "Oil of the Wrathful Dawn \u2014 prismatic slash, chromatic damage. Her anointed touch drives through blood \u2014 a consecration on doubt's edge.", "stats": {"STR": 6, "DEX": 9, "INT": 7, "WIS": 10, "CHA": 7, "CON": 8}, "yt": null, "face": "", "z": {"fx0": 0.6345693779904307, "fy0": 0.2784272051009564, "fx1": 0.6728468899521531, "fy1": 0.36663124335812963, "fxc": 0.6537081339712919, "fyc": 0.32252922422954305}}, {"name": "Grand Colonel", "c": "#90a4ae", "motto": "\ud83d\udc3a", "bio": "Iron enforcer \u2014 a grim warlord with wolfish slash. High STR and CHA command with brutal edge.", "pow": "Wolf's Crude Slash \u2014 oil-blade, bloody cut. His oil tears with iron fury \u2014 a warlord's unyielding edge.", "stats": {"STR": 10, "DEX": 6, "INT": 5, "WIS": 7, "CHA": 9, "CON": 8}, "yt": null, "face": "", "z": {"fx0": 0.6584928229665071, "fy0": 0.18703506907545164, "fx1": 0.7236842105263158, "fy1": 0.30818278427205104, "fxc": 0.6910885167464115, "fyc": 0.24760892667375134}}, {"name": "Malika", "c": "#bf360c", "motto": "I am the debt of the fire", "bio": "Tempered survivor \u2014 a scarred ember with smouldering grit. High CON and WIS endure with fiery scars.", "pow": "Ember's Oil Smoulder \u2014 slick burn, fiery renewal. Her oil smoulders with tempered radiance \u2014 a survivor's renewal through flame.", "stats": {"STR": 7, "DEX": 5, "INT": 8, "WIS": 9, "CHA": 7, "CON": 9}, "yt": null, "face": "", "z": {"fx0": 0.742822966507177, "fy0": 0.4569606801275239, "fx1": 0.7541866028708134, "fy1": 0.47927736450584485, "fxc": 0.7485047846889952, "fyc": 0.4681190223166844}}, {"name": "Auvergne", "c": "#66bb6a", "motto": "Men become equal by covenant and right", "bio": "Volcanic hymnist \u2014 a loud poet chanting oil-fuelled resonance with green lyre's might. High CHA and WIS belt out his earthy roar.", "pow": "Lyre's Oil Resonance \u2014 hymn, psychic force. His oil channels earth's fiery pulse \u2014 breaking foes with molten force.", "stats": {"STR": 7, "DEX": 6, "INT": 8, "WIS": 9, "CHA": 9, "CON": 6}, "yt": "https://m.youtube.com/playlist?list=PLFNVt1pqV4QjCD9sQBk1WZ_T9bvFLR0QK", "face": "", "z": {"fx0": 0.7984449760765551, "fy0": 0.3900106269925611, "fx1": 0.840311004784689, "fy1": 0.4920297555791711, "fxc": 0.819377990430622, "fyc": 0.4410201912858661}}, {"name": "Cadaver Synod", "c": "#8d6e63", "motto": "Judgement is stronger than death!", "bio": "Theatrical arbiter \u2014 a fierce judge with peacock flair and oily verdicts. High CHA and STR stage his dusty reign.", "pow": "Synod's Oil Verdict \u2014 mark, psychic judgement. His oil marks the guilty \u2014 a theatrical stab at dusty souls.", "stats": {"STR": 8, "DEX": 7, "INT": 7, "WIS": 8, "CHA": 9, "CON": 6}, "yt": null, "face": "", "z": {"fx0": 0.7374401913875598, "fy0": 0.24654622741764082, "fx1": 0.7793062200956937, "fy1": 0.3134962805526036, "fxc": 0.7583732057416268, "fyc": 0.28002125398512223}}, {"name": "Croisi\u00e8re Noire", "c": "#bdbdbd", "motto": "Shelter brings expansion", "bio": "Endless conjurer \u2014 a cunning swarm-master with white hive's sprawl. High CON and STR fuel his boundless grind.", "pow": "Hive's Crude Swarm \u2014 drones, relentless assault. His oil conjures a boundless hive \u2014 drowning earth in cunning chaos.", "stats": {"STR": 9, "DEX": 6, "INT": 8, "WIS": 7, "CHA": 5, "CON": 10}, "yt": "https://m.youtube.com/watch?v=hJMnAemzQT0&list=PLFNVt1pqV4Qi2b2evlFraXEw2Hbv7DKyX", "face": "", "z": {"fx0": 0.8833732057416268, "fy0": 0.20191285866099895, "fx1": 0.9168660287081339, "fy1": 0.32093517534537724, "fxc": 0.9001196172248804, "fyc": 0.2614240170031881}}, {"name": "Naphta", "c": "#ef6c00", "motto": "Presence is the essence of power", "bio": "Fiery sovereign \u2014 a steady queen with reptilian blaze. High INT and DEX rule with orange fury.", "pow": "Reptilian Oil Blaze \u2014 inferno, fiery surge. Her oil ignites a primal blaze \u2014 empowering kin with steady might.", "stats": {"STR": 7, "DEX": 8, "INT": 9, "WIS": 7, "CHA": 8, "CON": 6}, "yt": "https://m.youtube.com/playlist?list=PLFNVt1pqV4Qg5I2OxMez_hJdBchajby9X", "face": "", "z": {"fx0": 0.8498803827751196, "fy0": 0.48884165781083955, "fx1": 0.8863636363636364, "fy1": 0.5972369819341127, "fxc": 0.868122009569378, "fyc": 0.5430393198724761}}, {"name": "Unkle Maukie", "c": "#ffa726", "motto": "Decide from the dance floor of things", "bio": "Rhythmic commander \u2014 a noble king with panther's roar. High CHA and STR lead with orange might.", "pow": "Panther's Crude Roar \u2014 sonic pulse, commanding force. His oil unleashes a rhythmic roar \u2014 commanding all with panther's might.", "stats": {"STR": 7, "DEX": 7, "INT": 9, "WIS": 9, "CHA": 9, "CON": 7}, "yt": "https://m.youtube.com/playlist?list=PLFNVt1pqV4QjMtqp6JsTU6OzS74RYFnFi", "face": "", "z": {"fx0": 0.9276315789473685, "fy0": 0.5260361317747078, "fx1": 0.9455741626794258, "fy1": 0.6493092454835282, "fxc": 0.9366028708133971, "fyc": 0.5876726886291179}}, {"name": "dogXim", "c": "#e53935", "motto": "Chaos is the ladder of fuck!", "bio": "Tchah! What's your take, hotshot?! High DEX and CHA fuel his sly cunning.", "pow": "Fox's Crude Jet \u2014 his oil erupts in a scorpion's dance of ruin.", "stats": {"STR": 7, "DEX": 9, "INT": 8, "WIS": 6, "CHA": 8, "CON": 6}, "yt": "https://youtube.com/playlist?list=PLFNVt1pqV4QgMMaIybasFRLJ3xWgGAREV&si=CtzxURt9H2gZkgDz", "face": "", "z": {"fx0": 0.9258373205741627, "fy0": 0.1997874601487779, "fx1": 0.9808612440191388, "fy1": 0.359192348565356, "fxc": 0.9533492822966507, "fyc": 0.27948990435706694}}];
const FP={"Aube": {"formula": "L(t) = L\u2080 \u00b7 e^(\u03b3t) \u2014", "appearance": "Pale-haired lass, sheer gown, barefoot, bright, gutsy, visionary \u2014 progressively seen in full thick armour, short-haired.", "faction": "Pink \u00b7 Liquefactionist \u00b7 Second-Wave Offspring", "emojis": "\u2b50 \ud83d\udc13 \u270b", "attributes": "Faith & Colours \u00b7 Courage & Way Opening.", "motto": "Light dawns anew.", "archetypes": "White Queen \u00b7 Joan of Arc \u00b7 Gorge (Throat) \u00b7 Rosy Fingers \u00b7 Beatrice Portinari \u00b7 Bedtime Story Protagonist \u00b7 Maiden Call's Sister.", "profile": "Armoured dawnbreaker \u2014 a gutsy visionary wielding oil-slick wrath with pink-handed resolve. High WIS and DEX carve her as a ritual blade, slicing light through shadow.", "powers": "Powers: Oil of the Wrathful Dawn, Prismatic Slash, Chromatic Damage. Hand's Anointed Guidance \u2014 allies gain STR and shrug off pain. Her anointed touch drives through blood \u2014 a consecration on doubt's edge.", "cosmo": "The Sun (XIX) \u00b7 Chesed \u00b7 Mithraic Lion \u00b7 Plato's Republic cave-light \u00b7 Plotinus' oil dawn flare-stack glow \u00b7 Kabbalah's Gorge in Zayin might dawn a new light.", "hexagram": "\ud83c\udf05 Hexagram 24 \u2014 Return (\u5fa9) \u00b7 \"Return on the seventh day, Going out and coming in without trouble.\"", "ministories": "Mini-Stories: The Garden of Delight \u00b7 Slab of Raw Colours.", "synergy": "Masks Krewsmatics: Pink Hand + Red Ring = Purpose.", "stats": {"STR": 6, "DEX": 9, "INT": 7, "WIS": 10, "CHA": 7, "CON": 8}}, "Auvergne": {"formula": "C(t) = \u222b\u2080\u1d57 P(s) \u00b7 e^(\u2212\u03bc(t\u2212s)) ds \u2014", "appearance": "Tall, sky-eyed, volcanic sprawl, gloomy, poetic, loud.", "faction": "Green \u00b7 Factualist \u00b7 Second-Wave Offspring", "emojis": "\ud83c\udfbb \ud83e\udd81 \ud83c\udfb6", "attributes": "Tradition & Creation \u00b7 Transmission.", "motto": "Men become equal by covenant and right.", "archetypes": "White Rook \u00b7 Bard \u00b7 Orpheus \u00b7 Shepherd David.", "profile": "Volcanic hymnist \u2014 a loud poet chanting oil-fuelled resonance with green lyre's might. High CHA and WIS belt out his earthy roar.", "powers": "Powers: Lyre's Oil Resonance, Hymn, Psychic Force. Volcanic Crude Eruption \u2014 oil burst, fiery blast. His oil channels earth's fiery pulse \u2014 breaking foes with molten force.", "cosmo": "The Star (XVII) \u00b7 Hod \u00b7 Mithraic Nymphus \u00b7 Plato's Republic rough wisdom \u00b7 Plotinus' oil hum drillers' chants \u00b7 Kabbalah's Bard in Mem might hum new lore.", "hexagram": "\ud83c\udfbb Hexagram 31 \u2014 Influence (\u54b8) \u00b7 \"Mutual influence, The superior person encourages harmony.\"", "ministories": "Mini-Stories: The Factory \u00b7 Ridge of Fading Chants.", "synergy": "Masks Krewsmatics: Green Lyre + Mask = Expressivity.", "stats": {"STR": 7, "DEX": 6, "INT": 8, "WIS": 9, "CHA": 9, "CON": 6}}, "C7H5N3O6": {"formula": "E\u2099 = E\u208d\u2099\u208b\u2081\u208e \u00b7 (1 \u2212 \u03b1) \u2014", "appearance": "Chunky grey golem, bug in chest, blue gear, cold, calculated, executor.", "faction": "Blue \u00b7 Grey \u00b7 Divisionist \u00b7 First-Wave nature force", "emojis": "\ud83c\udfed \ud83e\udeb2 \u2699\ufe0f", "attributes": "Machine \u00b7 Design & Reproduction \u00b7 Adequation & Seriation.", "motto": "Efficiency is...", "archetypes": "White Knight \u00b7 Machine \u00b7 Golem \u00b7 Gear \u00b7 Iode Anacr\u00e9on \u00b7 Hephaistos \u00b7 Naphta's Husband \u00b7 Member of The Invisible College of Sages.", "profile": "Mechanical churner \u2014 a cold grinder with bug-heart precision. High INT and STR crush with relentless blue-grey clank.", "powers": "Powers: Golem's Oil Crush, Smash, Crippling Force. Insect's Oil Swarm \u2014 swarm, poisonous sting. His oil drives a relentless grind \u2014 churning flesh to dust.", "cosmo": "The Magician (I) \u00b7 Binah \u00b7 Mithraic Persian \u00b7 Plato's Timaeus form-receptacle \u00b7 Plotinus' oil grind derrick automation \u00b7 Kabbalah's Gear in Gimel might churn new forms.", "hexagram": "\u2699\ufe0f Hexagram 60 \u2014 Limitation (\u7bc0) \u00b7 \"Water over lake, Limitation, Success.\"", "ministories": "Mini-Stories: Freeland \u00b7 Churn of Singing Iron \u00b7 Den of Clicking Dolls.", "synergy": "Masks Krewsmatics: Gear + White Hive = Work.", "stats": {"STR": 9, "DEX": 8, "INT": 10, "WIS": 6, "CHA": 4, "CON": 7}}, "Cadaver Synod": {"formula": "J(t) = \u03a3\u1d62\u208c\u2081\u207f w\u1d62 \u00b7 S\u1d62(t) \u2014", "appearance": "Dusty stage, ointment stink, fierce, alert \u2014 more and more seen as a tall and muscled masked luchador in a shiny tux, with long peacock feathers in the back, surrounded by red skeletons or headless elegant male dummies.", "faction": "Green \u00b7 Purple \u00b7 Divisionist \u00b7 Second-Wave Offspring", "emojis": "\ud83e\udd9a \ud83c\udfad", "attributes": "Intensity & Verdict \u00b7 Passion & Staging.", "motto": "Judgement is stronger than death!", "archetypes": "Black Rook \u00b7 Mummy \u00b7 Boniface VI \u00b7 Kafka \u00b7 The Syncret \u00b7 Speaker & Master of Ceremonies.", "profile": "Theatrical arbiter \u2014 a fierce judge with peacock flair and oily verdicts. High CHA and STR stage his dusty reign.", "powers": "Powers: Synod's Oil Verdict, Mark, Psychic Judgement. Peacock's Crude Flash \u2014 dazzle, blinding flare. His oil marks the guilty \u2014 a theatrical stab at dusty souls.", "cosmo": "The Judgement (XX) \u00b7 Tiferet \u00b7 Mithraic Lion \u00b7 Plato's Republic soul justice \u00b7 Plotinus' oil ghost old rig bones \u00b7 Kabbalah's ILLbient ILion in Mem might judge new pasts.", "hexagram": "\ud83c\udfad Hexagram 49 \u2014 Revolution (\u9769) \u00b7 \"Fire in the lake, The superior person changes like a Maukian leopard.\"", "ministories": "Mini-Stories: The City of Night.", "synergy": "Masks Krewsmatics: Mask + Green Lyre = Expressivity.", "stats": {"STR": 8, "DEX": 7, "INT": 7, "WIS": 8, "CHA": 9, "CON": 6}}, "Croisi\u00e8re Noire": {"formula": "G(t) = \u222b\u2080\u1d57 c(s) \u00b7 e^(\u03b3s) ds \u2014", "appearance": "Hive or bull, endless, practical, cunning.", "faction": "White \u00b7 Liquefactionist \u00b7 First Wave \u00b7 Second Wave Genitor", "emojis": "\ud83d\udce6 \ud83d\udc02 \ud83d\udc1d", "attributes": "Shelter & Abundant Expansion.", "motto": "Shelter brings expansion.", "archetypes": "Black Knight \u00b7 Bull \u00b7 Bee \u00b7 Hive \u00b7 Baldr \u00b7 Citro\u00ebn's Expedition \u00b7 Melanesian Cargo \u00b7 Recreational Vehicle \u00b7 Motel \u00b7 Cardboard Box \u00b7 Member of The Invisible College of Sages \u00b7 Death of Croisi\u00e8re Noire Protagonist.", "profile": "Endless conjurer \u2014 a cunning swarm-master with white hive's sprawl. High CON and STR fuel his boundless grind.", "powers": "Powers: Hive's Crude Swarm, Drones, Relentless Assault. Bull's Oil Charge \u2014 charge, crushing rush. His oil conjures a boundless hive \u2014 drowning earth in cunning chaos.", "cosmo": "The Chariot (VII) \u00b7 Chesed \u00b7 Mithraic Bull \u00b7 Plato's Timaeus living cosmos \u00b7 Plotinus' oil gush raw field \u00b7 Kabbalah's Bull in Bet might charge new realms.", "hexagram": "\ud83d\udce6 Hexagram 42 \u2014 Increase (\u76ca) \u00b7 \"Wind above thunder, The superior person follows the tide.\"", "ministories": "Mini-Stories: Spire of Endless Echoes.", "synergy": "Masks Krewsmatics: White Hive + Gear = Work.", "stats": {"STR": 9, "DEX": 6, "INT": 8, "WIS": 7, "CHA": 5, "CON": 10}}, "dogXim": {"formula": "S(t) = S\u2080 \u00b7 (1 + r \u00b7 sin(\u03c9t)) \u2014", "appearance": "Young African, odd eyes, wiry, wild, defiant, maker.", "faction": "Red \u00b7 Divisionist \u00b7 First Wave", "emojis": "\ud83e\udd82 \ud83d\udd2b", "attributes": "Energy & Negation \u00b7 Dialectic Fire.", "motto": "Chaos is the ladder of fuck!", "archetypes": "Black King \u00b7 Fox \u00b7 Pre-dynastic Mithra \u00b7 Mazda's Opponent \u00b7 First Wave \u00b7 The Word Hoard \u00b7 Death of Croisi\u00e8re Noire Protagonist.", "profile": "Tchah! What's your take, hotshot?! High DEX and CHA fuel his sly cunning, though low STR limits raw force.", "powers": "Powers: Fox's Crude Jet. His oil erupts in a scorpion's dance of ruin.", "cosmo": "The Fool (0) \u00b7 Gevurah \u00b7 Mithraic Soldier \u00b7 Plato's Sophist illusory forms \u00b7 Plotinus' oil chaos shale gas blasts \u00b7 Kabbalah's Fox in Shin might burn new trails.", "hexagram": "\ud83e\udd82 Hexagram 51 \u2014 Shock (\u9707) \u00b7 \"Thunder repeated, Shock, Then laughter.\"", "ministories": "Mini-Stories: The Word Hoard \u00b7 Sweep of Wild Shatter.", "synergy": "Masks Krewsmatics: Red Gun + Scales = Alternative.", "stats": {"STR": 7, "DEX": 9, "INT": 8, "WIS": 6, "CHA": 8, "CON": 6}}, "H\u00e1tra L\u00f6v\u00e9s": {"formula": "P(t) = \u222b\u2080\u1d57 e^(\u2212\u03bb(t\u2212s)) \u00b7 A(s) ds \u2014", "appearance": "Ragged tribal rider, cowboy edge, precise, exact.", "faction": "Grey \u00b7 Divisionist \u00b7 First Wave", "emojis": "\ud83c\udfaf \ud83d\udc0e \ud83c\udff9", "attributes": "Agility & Endurance \u00b7 Reaction & Dexterity.", "motto": "Surviving is striking from behind.", "archetypes": "Black Knight \u00b7 Saint Sebastian \u00b7 Archer \u00b7 Ulysses \u00b7 Lovas H\u00e1tral\u00f6v\u0151 \u00b7 Baku Military Chief \u00b7 Blonde Warrior Ruler.", "profile": "Swift ambusher \u2014 a precise rider with grey arrow's edge. High DEX and CON track his ragged endurance.", "powers": "Powers: Archer's Crude Shot, Oil Arrow, Fiery Pierce. Rider's Oil Slick \u2014 slick trap, slowing snare. His oil ignites arrows with lethal aim \u2014 piercing the wild's gut.", "cosmo": "Strength (XI) \u00b7 Netzach \u00b7 Mithraic Soldier \u00b7 Plato's Laches gutsy strategy \u00b7 Plotinus' oil jab pipeline snipe \u00b7 Kabbalah's Archer in Nun might snipe new survival arcs.", "hexagram": "\ud83c\udff9 Hexagram 40 \u2014 Release (\u89e3) \u00b7 \"Thunder over water, Deliverance.\"", "ministories": "Mini-Stories: Span of Flying Stitch-Ups.", "synergy": "Masks Krewsmatics: Arrow + Anchor = Exploration.", "stats": {"STR": 6, "DEX": 10, "INT": 5, "WIS": 7, "CHA": 6, "CON": 8}}, "Honey Buzzard": {"formula": "D(t) = \u222b\u2080\u1d57 \u03b3 \u00b7 e^(\u2212\u03bc(t\u2212s)) \u00b7 R(s) ds \u2014", "appearance": "Buzzard head, black tux, red ring, tense, sharp, cryptic.", "faction": "Red \u00b7 Sender \u00b7 First Wave", "emojis": "\ud83e\udeb6 \ud83d\udc26 \ud83d\udc8d", "attributes": "Distance & Decay \u00b7 G-Force & Entropy.", "motto": "Even nothing is something that is nothing.", "archetypes": "White Bishop \u00b7 Virgil \u00b7 Member of The Invisible College of Sages \u00b7 Amertume \u00b7 Dark F(e)ather.", "profile": "Decaying entropist \u2014 a tense rot-bringer with red ring's pull. High WIS and DEX weave his cryptic rot.", "powers": "Powers: Buzzard's Oil Rot, Corrosive Cloud, Gear Decay. Red Ring's Oil Pull \u2014 gravity pull, disorienting force. His oil corrodes with entropic bite \u2014 a buzzard's feast on time's carcass.", "cosmo": "No-Name (XIII) \u00b7 Keter \u00b7 Mithraic Corax \u00b7 Plato's Timaeus first cause \u00b7 Plotinus' oil rot dead wells \u00b7 Kabbalah's Buzzard in Ayin might fade new chants.", "hexagram": "\ud83d\udc8d Hexagram 18 \u2014 Work on What Has Been Spoiled (\u8831) \u00b7 \"The past decays, Correct it with firmness.\"", "ministories": "Mini-Stories: The City of Night \u00b7 The Death of Joan \u00b7 Vault of Lost Voices.", "synergy": "Masks Krewsmatics: Red Ring + Pink Hand = Purpose.", "stats": {"STR": 6, "DEX": 8, "INT": 7, "WIS": 10, "CHA": 5, "CON": 8}}, "Maiden Call": {"formula": "I(t) = \u222b\u2080\u1d57 \u03c6(s) \u00b7 e^(\u03bb(t\u2212s)) ds \u2014", "appearance": "Dark-haired, maybe Asian, old phone or glowing anchor in hands, curious, haunting, sweet.", "faction": "Blue \u00b7 White \u00b7 Sender \u00b7 Second-Wave Offspring", "emojis": "\ud83e\udddc\u200d\u2640\ufe0f \ud83d\udc33 \ud83d\udcde \u2693", "attributes": "Innocence & Relationship \u00b7 Authenticity & Warmth.", "motto": "I'll come if you come.", "archetypes": "Black Bishop \u00b7 Echo (Siren) \u00b7 Mermaid \u00b7 Marie \u00b7 Aube's Sister.", "profile": "Haunting binder \u2014 a sweet whisperer with anchor's grasp. High CHA and WIS lure with fragile grace.", "powers": "Powers: Siren's Oil Lure, Call, Psychic Pull. Anchor's Crude Grasp \u2014 roots, oily grip. Her oil weaves haunting whispers \u2014 binding souls with fragile grace.", "cosmo": "The Lovers (VI) \u00b7 Yesod \u00b7 Mithraic Nymphus \u00b7 Plotinus' oil whisper pipe signals \u00b7 Kabbalah's Echo in Dalet might ring new lures.", "hexagram": "\u2693 Hexagram 6 \u2014 Conflict (\u8a1f) \u00b7 \"Heaven and water move apart, Conflict, But with inner truth.\"", "ministories": "Mini-Stories: Pit of Broken Calls.", "synergy": "Masks Krewsmatics: Anchor + Arrow = Exploration.", "stats": {"STR": 5, "DEX": 7, "INT": 6, "WIS": 8, "CHA": 10, "CON": 6}}, "Naphta": {"formula": "\u03a6(t) = 1 / (1 + e^(\u2212\u03b1t)) \u2014", "appearance": "Knockout African lass, reptile-draped, grounded, gut-led, steady.", "faction": "Orange \u00b7 Factualist \u00b7 First Wave", "emojis": "\ud83d\udd25 \ud83d\udc0a", "attributes": "Chance & Consciousness \u00b7 Presence.", "motto": "Presence is the essence of power.", "archetypes": "Black Queen \u00b7 Shakti \u00b7 Durga \u00b7 Flame \u00b7 Hephaistos' Spouse \u00b7 Death of Croisi\u00e8re Noire Protagonist \u00b7 Plague of Justinian's Lover.", "profile": "Fiery sovereign \u2014 a steady queen with reptilian blaze. High INT and DEX rule with orange fury.", "powers": "Powers: Reptilian Oil Blaze, Inferno, Fiery Surge. Kerema's Oil Gaze \u2014 truth, piercing clarity. Her oil ignites a primal blaze \u2014 empowering kin with steady might.", "cosmo": "The High Priestess (II) \u00b7 Yesod \u00b7 Mithraic Nymphus \u00b7 Plato's Phaedo opposites in tune \u00b7 Plotinus' oil flare conscious crude \u00b7 Kabbalah's Flame in Resh might blaze new truths.", "hexagram": "\ud83d\udd25 Hexagram 34 \u2014 Great Power (\u5927\u58ef) \u00b7 \"Thunder in heaven, Great strength, Do not misuse it.\"", "ministories": "Mini-Stories: The Garden of Delight \u00b7 Husk of Shattered Gleams.", "synergy": "Masks Krewsmatics: Orange Flame + Black Cloud = Intensity.", "stats": {"STR": 7, "DEX": 8, "INT": 9, "WIS": 7, "CHA": 8, "CON": 6}}, "Plague of Justinian": {"formula": "M(t) = \u222b\u2080\u1d57 \u03bd(s) \u00b7 e^(\u2212\u03b4(t\u2212s)) ds \u2014", "appearance": "Guy with a t-shirt, whose head is an exploding cloud.", "faction": "Black \u00b7 Sender \u00b7 Second-Wave Offspring", "emojis": "\ud83c\udf2a\ufe0f \ud83d\udc00 \ud83c\udf29", "attributes": "Surge & Contagion \u00b7 Transformation.", "motto": "In contagion strength.", "archetypes": "White Rook \u00b7 Sultan \u00b7 Aphrodite's Lover.", "profile": "Surging rot-bringer \u2014 a dark transformer with black miasma's rush. High CHA and CON spread his plague.", "powers": "Powers: Plague's Oil Miasma, Toxic Mist, Spreading Rot. Surge's Crude Rush \u2014 speed boost, chaotic surge. His oil spreads a dark scourge \u2014 a plague's wild gift.", "cosmo": "The Wheel (X) \u00b7 Gevurah \u00b7 Mithraic Soldier \u00b7 Plato's Timaeus wild motion \u00b7 Plotinus' oil spill historic mess \u00b7 Kabbalah's Sultan in Aleph might flood new plagues.", "hexagram": "\ud83c\udf29 Hexagram 43 \u2014 Breakthrough (\u592c) \u00b7 \"Lake rising to heaven, One must speak out.\"", "ministories": "Mini-Stories: Flow of Black Reflections.", "synergy": "Masks Krewsmatics: Black Cloud + Orange Flame = Intensity.", "stats": {"STR": 7, "DEX": 6, "INT": 8, "WIS": 5, "CHA": 10, "CON": 8}}, "Poisoned Well": {"formula": "W(t) = P\u2080 \u00b7 e^(\u2212\u03b1t) \u2014", "appearance": "Chubby bald kid, dark trousers, cigar, sly, sharp, luring.", "faction": "Purple \u00b7 Sender \u00b7 Second-Wave Offspring", "emojis": "\ud83d\udde1\ufe0f \ud83d\udc0d", "attributes": "Corruption & Assertiveness.", "motto": "Words are venom. Honey is the pus of the real.", "archetypes": "Black Bishop \u00b7 Pharmakon \u00b7 Insult \u00b7 Baby Face \u00b7 Viper \u00b7 Blonde Warrior Ruler.", "profile": "Twisted whisperer \u2014 a sly venom-child with purple sting. High WIS and INT weave his cunning traps.", "powers": "Powers: Venom's Oil Whisper, Lie, Psychic Twist. Well's Crude Trap \u2014 oil puddle, slowing mire. His oil twists venom into whispers \u2014 a sly child's deadly game.", "cosmo": "The Tower (XVI) \u00b7 Binah \u00b7 Mithraic Serpent \u00b7 Plato's Sophist twisted words \u00b7 Plotinus' oil stain aquifer rot \u00b7 Kabbalah's Insult in Pe might venom new cons.", "hexagram": "\ud83d\udde1\ufe0f Hexagram 47 \u2014 Oppression (\u56f0) \u00b7 \"Water below a lake, Exhaustion, Hidden strength.\"", "ministories": "Mini-Stories: The Word Hoard \u00b7 Gash of Hissing Words \u00b7 The Terminal Bar.", "synergy": "Masks Krewsmatics: Purple Dagger + Black Veil = Analysis.", "stats": {"STR": 4, "DEX": 6, "INT": 9, "WIS": 10, "CHA": 8, "CON": 5}}, "Silent Pact": {"formula": "V(t) = \u222b\u2080\u1d57 \u03bb \u00b7 e^(\u2212\u03bc(t\u2212s)) \u00b7 L(s) ds \u2014", "appearance": "Veiled bloke, quiet, solid, trusty.", "faction": "Black \u00b7 Sender \u00b7 Second-Wave Offspring", "emojis": "\ud83d\udc42 \ud83e\udd89 \ud83d\udc55", "attributes": "Oath & Silence \u00b7 Efficiency & Secrecy.", "motto": "...", "archetypes": "Black Rook \u00b7 De Profundis \u00b7 Oath (Mi\u03b8ra-Harpokrates) \u00b7 Kaves Secret Chief \u00b7 Bedtime Story Protagonist.", "profile": "Silent guardian \u2014 a solid oath-keeper with black veil's shroud. High WIS and CON hold his quiet strength.", "powers": "Powers: Oath's Oil Shroud, Shadows, Obscuring Veil. Silent Crude Strike \u2014 stealth blow, piercing quiet. His oil cloaks with silent strength \u2014 an oath carved in stillness.", "cosmo": "The Moon (XVIII) \u00b7 Chokhmah \u00b7 Mithraic Pater \u00b7 Plato's Meno buried know-how \u00b7 Plotinus' oil flow underground reserves \u00b7 Kabbalah's Oath in Kaf might hush new depths.", "hexagram": "\ud83d\udc55 Hexagram 20 \u2014 Contemplation (\u89c0) \u00b7 \"Wind over earth, The tower watches.\"", "ministories": "Mini-Stories: Trap of Shut Doors \u00b7 The Control Room.", "synergy": "Masks Krewsmatics: Black Veil + Purple Dagger = Analysis.", "stats": {"STR": 7, "DEX": 6, "INT": 8, "WIS": 9, "CHA": 5, "CON": 8}}, "Truce": {"formula": "B(t) = \u222b\u2080\u1d57 \u03b1(t\u2212s) \u00b7 \u03c6(s) ds \u2014", "appearance": "Twin blokes, synced moves, keen, balancer.", "faction": "Grey \u00b7 Yellow \u00b7 Factualist \u00b7 Second-Wave Offspring", "emojis": "\u25b2 \ud83e\udd80 \u2696\ufe0f", "attributes": "Deals & Symmetry \u00b7 Consent & Trade.", "motto": "Do we have an agreement?", "archetypes": "White Knight \u00b7 Scales \u00b7 Anal Market \u00b7 The Two Cheeks.", "profile": "Harmonious balancers \u2014 keen twins with grey-yellow equilibrium. High DEX and INT sync their scales.", "powers": "Powers: Scales' Oil Equilibrium, Stat Shift, Balanced Flow. Twin's Oil Concord \u2014 shared strength, allied bond. Their oil weighs fate in tandem \u2014 a twin-born harmony trembling under strain.", "cosmo": "Temperance (XIV) \u00b7 Tiferet \u00b7 Mithraic Heliodromus \u00b7 Plato's Phaedo soul balance \u00b7 Plotinus' oil tweak flow control \u00b7 Kabbalah's Scales in Lamed might weigh new pacts.", "hexagram": "\u264a Hexagram 12 \u2014 Standstill (\u5426) \u00b7 \"Heaven blocks earth, Stagnation Temporary.\"", "ministories": "Mini-Stories: Souk of Red Dreams.", "synergy": "Masks Krewsmatics: Scales + Red Gun = Alternative.", "stats": {"STR": 6, "DEX": 8, "INT": 8, "WIS": 7, "CHA": 8, "CON": 6}}, "Ts'ui P\u00ean": {"formula": "K(t) = \u222b\u2080\u1d57 \u03ba(s) \u00b7 e^(\u2212\u03b1(t\u2212s)) ds \u2014", "appearance": "Old Asian geezer, slick butterfly vibe, visionary, tangled, coded.", "faction": "Orange \u00b7 Pink \u00b7 Liquefactionist \u00b7 First Wave", "emojis": "\ud83d\udc53 \ud83e\udd8b \ud83d\udc31 \ud83e\uddf1", "attributes": "Knowledge & Mystery \u00b7 Intricacy & Adventure.", "motto": "Infinity breathes wisdom.", "archetypes": "White Bishop \u00b7 Borges \u00b7 Butterfly \u00b7 Member of The Invisible College of Sages \u00b7 D(e)ad Alus \u00b7 Bedtime Storyteller.", "profile": "Cryptic weaver \u2014 a tangled sage with butterfly's haze. High WIS and INT spin his coded visions.", "powers": "Powers: Butterfly's Oil Haze, Mist, Blinding Veil. Konklave's Oil Whisper \u2014 suggestion, coded will. His oil unveils cryptic veils \u2014 a butterfly's dance through fate.", "cosmo": "The Pope (V) \u00b7 Chokhmah \u00b7 Mithraic Heliodromus \u00b7 Plato's Timaeus demiurgic spark \u00b7 Plotinus' oil haze refinery fumes \u00b7 Kabbalah's Butterfly in Kuf might weave new tales.", "hexagram": "\ud83e\udd8b Hexagram 29 \u2014 The Abyss (\u574e) \u00b7 \"Water flows into itself, Repetition deepens.\"", "ministories": "Mini-Stories: Minraud II \u00b7 Interzone.", "synergy": "Masks Krewsmatics: Wall + Orange Panther = Wisdom.", "stats": {"STR": 5, "DEX": 6, "INT": 9, "WIS": 10, "CHA": 7, "CON": 6}}, "Unkle Maukie": {"formula": "E(t) = \u222b\u2080^\u03c0 \u03bb \u00b7 \u03b1 \u00b7 e^(\u2212\u03bc(t\u2212s)) ds \u2014", "appearance": "Hatted bloke, Karl Marx beard, sometimes Senoufo panther-man gear, noble, rhythmic, firm.", "faction": "Orange \u00b7 Factualist \u00b7 First Wave", "emojis": "\ud83c\udfa9 \ud83d\udc06 \u265f\ufe0f", "attributes": "Impulse & Synthesis \u00b7 Integration & Flow.", "motto": "Decide from the dance floor of things.", "archetypes": "White King \u00b7 Majestic Dancer \u00b7 Zeus \u00b7 Baku Leader \u00b7 Member of The Invisible College of Sages \u00b7 Letter K (Kuf) \u00b7 Theater Play Eater \u00b7 First Wave \u00b7 Factualist.", "profile": "Rhythmic commander \u2014 a noble king with panther's roar. High CHA and STR lead with orange might.", "powers": "Powers: Panther's Crude Roar, Sonic Pulse, Commanding Force. Konklave's Oil Feast \u2014 will drain, shadowy feast. His oil unleashes a rhythmic roar \u2014 commanding all with panther's might.", "cosmo": "The World (XXI) \u00b7 Tiferet \u00b7 Mithraic Heliodromus \u00b7 Plato's Republic X Spindle of Necessity \u00b7 Plotinus' oil-spin roughneck synthesis \u00b7 Kabbalah's Dancer in Kaf might spin new fates.", "hexagram": "\ud83d\udc06 Hexagram 1 \u2014 The Creative (\u4e7e) \u00b7 \"Heaven over heaven, Supreme activity.\"", "ministories": "Mini-Stories: Minraud I \u00b7 Souk of Red Dreams \u00b7 Slab of Sliding Shadows \u00b7 Ring of Kings' Dance.", "synergy": "Masks Krewsmatics: Orange Panther + Wall = Wisdom.", "stats": {"STR": 7, "DEX": 7, "INT": 9, "WIS": 9, "CHA": 9, "CON": 7}}, "Grand Colonel": {"formula": "N(t) = C(t) + M(t) + E(t) \u2014", "appearance": "Tall blond brute, grim, resolved, in uniform.", "faction": "Third-Wave eruption from Maukie's unconscious \u00b7 Divisionist \u2014 Maukie's split shadow", "emojis": "\ud83d\udc3a \u2694\ufe0f", "attributes": "Honour & Return of the Repressed.", "motto": "", "archetypes": "Blonde Warrior \u00b7 Yellow King \u00b7 Duke of Montebello \u00b7 Tears in Rain \u00b7 Death of Croisi\u00e8re Noire Witness \u00b7 Hades.", "profile": "Iron enforcer \u2014 a grim warlord with wolfish slash. High STR and CHA command with brutal edge.", "powers": "Powers: Wolf's Crude Slash, Oil-Blade, Bloody Cut. Colonel's Oil Command \u2014 allies boost, iron will. His oil tears with iron fury \u2014 a warlord's unyielding edge.", "cosmo": "The Emperor (IV) \u00b7 Malkuth \u00b7 Mithraic Soldier \u00b7 Plato's Republic ruler undone \u00b7 Plotinus' oil tomb roughneck graves \u00b7 Kabbalah's Blonde Warrior in Tav might bury new foes.", "hexagram": "\ud83d\udc3a Hexagram 44 \u2014 Coming to Meet (\u59e4) \u00b7 \"The feminine force rises uninvited.\"", "ministories": "", "synergy": "", "stats": {"STR": 10, "DEX": 6, "INT": 5, "WIS": 7, "CHA": 9, "CON": 8}}, "Malika": {"formula": "\u03a8(t) = E\u1d66(t) / (1 + D(t)) \u2014", "appearance": "Brunette, rugged frame, wide hips, scars like burnt salt veins, banged-up, born from the rig's wild dance.", "faction": "Third-Wave eruption from Grand Colonel's unconscious", "emojis": "\ud83d\udc3f\ufe0f \ud83d\udeac", "attributes": "Costs & Transcendence.", "motto": "I am the debt of the fire.", "archetypes": "Slag \u00b7 Grisette \u00b7 Quintina \u00b7 Ember \u00b7 Caput Corvi \u00b7 Beata Beatrix \u00b7 Persephone.", "profile": "Tempered survivor \u2014 a scarred ember with smouldering grit. High CON and WIS endure with fiery scars.", "powers": "Powers: Ember's Oil Smoulder, Slick Burn, Fiery Renewal. Slag's Crude Shell \u2014 tough skin, enduring shield. Her oil smoulders with tempered radiance \u2014 a survivor's renewal through flame.", "cosmo": "The Empress (III) \u00b7 Da'at \u00b7 Mithraic Nymphus \u00b7 Plato's Phaedo wisdom through ruin \u00b7 Plotinus' oil haze flare-stack poison \u00b7 Kabbalah's Ember in He might smolder new blooms.", "hexagram": "\ud83d\udc3f\ufe0f Hexagram 36 \u2014 Darkening of the Light (\u660e\u5937) \u00b7 \"Injury, The light retreats to survive.\"", "ministories": "", "synergy": "", "stats": {"STR": 7, "DEX": 5, "INT": 8, "WIS": 9, "CHA": 7, "CON": 9}}};

// \u2500\u2500 AUDIO \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
var AC=null;
function getAC(){if(!AC)try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}if(AC&&AC.state==='suspended')try{AC.resume();}catch(e){}return AC;}
function hexFreq(h){var r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16),mx=Math.max(r,g,b),mn=Math.min(r,g,b),hh=0;if(mx!==mn){if(mx===r)hh=(g-b)/(mx-mn)%6;else if(mx===g)hh=(b-r)/(mx-mn)+2;else hh=(r-g)/(mx-mn)+4;hh*=60;if(hh<0)hh+=360;}return 220+hh/360*660;}
function beep(f,d,v,t){var a=getAC();if(!a)return;var o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.type=t||'sine';o.frequency.value=f;g.gain.setValueAtTime(v||.1,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+d);o.start();o.stop(a.currentTime+d);}
function sndClick(c){var f=hexFreq(c||'#c9a84c');beep(f,.08,.13);setTimeout(function(){beep(f*4/3,.06,.08);},60);}
function sndClose(){beep(280,.12,.1,'triangle');}
function sndWin(){[528,660,792,880].forEach(function(f,i){setTimeout(function(){beep(f,.2,.1);},i*90);});}
// [KG] guarded: host pages may already define a global sndBtn (e.g. a silent no-op). Original:
// function sndBtn(){beep(440,.05,.08);}
if(typeof window.sndBtn!=='function'){window.sndBtn=function sndBtn(){beep(440,.05,.08);};}
var chInGame=false;


// === MOTTO VOICE (English) ===
var _enVoice=null;
function pickEnglishVoice(){
  if(!('speechSynthesis' in window))return null;
  var voices=window.speechSynthesis.getVoices()||[];
  if(!voices.length)return null;
  // Prefer named English voices (Daniel, Google UK/US English, etc.)
  var named=voices.filter(function(v){return /Daniel|Google UK|Google US|Arthur|Oliver|Serena|Karen|Moira|Tessa|Samantha|Alex/i.test(v.name)&&/en/i.test(v.lang);});
  if(named.length)return named[0];
  var gb=voices.filter(function(v){return /en[-_]GB/i.test(v.lang);});
  if(gb.length)return gb[0];
  var us=voices.filter(function(v){return /en[-_]US/i.test(v.lang);});
  if(us.length)return us[0];
  var anyen=voices.filter(function(v){return /^en/i.test(v.lang);});
  if(anyen.length)return anyen[0];
  // CRITICAL: do NOT fall back to a non-English voice (avoid French accent)
  // Better to return null and force lang='en-GB' on the utterance
  return null;
}
function speakMotto(text){
  if(!text||!('speechSynthesis' in window))return;
  try{
    window.speechSynthesis.cancel();
    var u=new SpeechSynthesisUtterance(text);
    if(!_enVoice)_enVoice=pickEnglishVoice();
    if(_enVoice)u.voice=_enVoice;
    u.lang='en-GB';
    u.rate=0.92;u.pitch=0.85;u.volume=1;
    window.speechSynthesis.speak(u);
  }catch(e){}
}
// Voices load async on some browsers
if('speechSynthesis' in window){
  window.speechSynthesis.onvoiceschanged=function(){_enVoice=pickEnglishVoice();};
}
function stopMotto(){try{if('speechSynthesis' in window)window.speechSynthesis.cancel();}catch(e){}}
window.speakMotto=speakMotto;window.stopMotto=stopMotto;

function kkRepublicanDate(){
  if(window.ikRep){var r=window.ikRep();if(r){var M=['Vendemiaire','Brumaire','Frimaire','Nivose','Pluviose','Ventose','Germinal','Floreal','Prairial','Messidor','Thermidor','Fructidor'];return r.day+' '+(r.month<13?M[r.month-1]:'complementary days')+' an '+r.year;}}
  var months=['Vendemiaire','Brumaire','Frimaire','Nivose','Pluviose','Ventose',
    'Germinal','Floreal','Prairial','Messidor','Thermidor','Fructidor'];
  var d=new Date();
  var year=d.getFullYear();
  var sep22=new Date(year,8,22);
  var yearStart,repYear;
  if(d<sep22){repYear=year-1792;yearStart=new Date(year-1,8,22);}
  else{repYear=year-1791;yearStart=new Date(year,8,22);}
  var delta=Math.floor((d-yearStart)/(1000*60*60*24));
  var mIdx=Math.floor(delta/30);
  var day=delta%30+1;
  var mName=mIdx<12?months[mIdx]:'complementary days';
  return day+' '+mName+' an '+repYear;
}

function kaptureRandomMask(){
  if(typeof FAUNA!=='undefined'&&FAUNA.length){
    return FAUNA[Math.floor(Math.random()*FAUNA.length)];
  }
  return null;
}
var _kaptureRandMask=null;
function getKaptureColor(){
  try{
    if(typeof kkOrder!=='undefined'&&typeof kkIdx!=='undefined'&&typeof FAUNA!=='undefined'){
      var m=FAUNA[kkOrder[kkIdx]];if(m&&m.c) return m.c;
    }
  }catch(e){}
  try{
    var pEl=document.getElementById('prof');
    if(pEl){var c=getComputedStyle(pEl).getPropertyValue('--c').trim();if(c&&c.length>2)return c;}
  }catch(e){}
  // No active mask: pick random
  if(!_kaptureRandMask) _kaptureRandMask=kaptureRandomMask();
  return (_kaptureRandMask&&_kaptureRandMask.c)||'#c9a84c';
}

function hexToRgbKp(hex){
  hex=(hex||'#c9a84c').replace('#','');
  if(hex.length===3) hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  return{r:parseInt(hex.slice(0,2),16)||201,g:parseInt(hex.slice(2,4),16)||168,b:parseInt(hex.slice(4,6),16)||76};
}

// Color -> musical frequency (pentatonic mapping)
function colorToFreq(hex){
  var rgb=hexToRgbKp(hex);
  var hue=Math.atan2(rgb.g-rgb.b, rgb.r-rgb.g)*180/Math.PI;
  if(hue<0) hue+=360;
  // Map hue to pentatonic scale: C D E G A
  var penta=[130.8,146.8,164.8,196.0,220.0];
  var idx=Math.floor((hue/360)*penta.length)%penta.length;
  return penta[idx];
}


function kkGetAC(){
  if(!window._kkAC){
    try{window._kkAC=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}
  }
  if(window._kkAC&&window._kkAC.state==='suspended'){
    try{window._kkAC.resume();}catch(e){}
  }
  return window._kkAC;
}

function kkClick(){
  var ac=kkGetAC();if(!ac) return;
  var now=ac.currentTime;
  var type=Math.floor(Math.random()*6);
  var corrupt=Math.random()<0.18;
  var out=ac.createGain();
  out.gain.setValueAtTime(0.22+Math.random()*0.18,now);
  out.gain.exponentialRampToValueAtTime(0.001,now+0.12);
  out.connect(ac.destination);
  if(type===0){
    var o=ac.createOscillator();o.type='sine';
    o.frequency.setValueAtTime(1800+Math.random()*1200,now);
    if(corrupt)o.frequency.setValueAtTime(200+Math.random()*3000,now+0.01);
    var g=ac.createGain();g.gain.setValueAtTime(1,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.06);
    o.connect(g);g.connect(out);o.start(now);o.stop(now+0.07);
  } else if(type===1){
    var buf=ac.createBuffer(1,Math.round(ac.sampleRate*0.04),ac.sampleRate);
    var d=buf.getChannelData(0);
    for(var i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*(1-i/d.length);
    if(corrupt)for(var j=0;j<d.length;j+=3)d[j]*=(Math.random()<0.3?3:0.1);
    var s=ac.createBufferSource();s.buffer=buf;
    var f=ac.createBiquadFilter();f.type='highpass';f.frequency.value=2000+Math.random()*4000;
    s.connect(f);f.connect(out);s.start(now);
  } else if(type===2){
    var o2=ac.createOscillator();o2.type='sawtooth';
    o2.frequency.setValueAtTime(80+Math.random()*120,now);
    var g2=ac.createGain();g2.gain.setValueAtTime(1,now);g2.gain.exponentialRampToValueAtTime(0.001,now+0.05);
    var f2=ac.createBiquadFilter();f2.type='bandpass';f2.frequency.value=800+Math.random()*600;f2.Q.value=3;
    o2.connect(f2);f2.connect(g2);g2.connect(out);o2.start(now);o2.stop(now+0.06);
  } else if(type===3){
    var col3=typeof getKaptureColor==='function'?getKaptureColor():'#c9a84c';
    var freq3=typeof colorToFreq==='function'?colorToFreq(col3):440;
    var o3=ac.createOscillator();o3.type='triangle';
    o3.frequency.setValueAtTime(freq3*(1+Math.random()*0.5),now);
    if(corrupt)o3.frequency.exponentialRampToValueAtTime(freq3*0.1,now+0.04);
    var g3=ac.createGain();g3.gain.setValueAtTime(1,now);g3.gain.exponentialRampToValueAtTime(0.001,now+0.08);
    o3.connect(g3);g3.connect(out);o3.start(now);o3.stop(now+0.09);
  } else if(type===4){
    var o4=ac.createOscillator();o4.type='sine';
    o4.frequency.setValueAtTime(60+Math.random()*80,now);
    o4.frequency.exponentialRampToValueAtTime(20,now+0.08);
    var g4=ac.createGain();g4.gain.setValueAtTime(1,now);g4.gain.exponentialRampToValueAtTime(0.001,now+0.1);
    o4.connect(g4);g4.connect(out);o4.start(now);o4.stop(now+0.11);
  } else {
    var steps=corrupt?6:3;
    for(var si=0;si<steps;si++){
      (function(idx2){
        var o5=ac.createOscillator();
        o5.type=['sine','square','sawtooth'][Math.floor(Math.random()*3)];
        o5.frequency.value=100+Math.random()*4000;
        var g5=ac.createGain();
        var t2=now+idx2*0.012;
        g5.gain.setValueAtTime(0.6-idx2*0.1,t2);
        g5.gain.exponentialRampToValueAtTime(0.001,t2+0.01);
        o5.connect(g5);g5.connect(out);o5.start(t2);o5.stop(t2+0.012);
      })(si);
    }
  }
}
window.kkClick=kkClick;


function _bakuGlitch(cb){
  // Flash blanc + secousses sur body + fondu noir
  var flash=document.createElement('div');
  flash.style.cssText='position:fixed;inset:0;z-index:99999;background:#fff;pointer-events:all;opacity:0;transition:opacity .04s;';
  document.body.appendChild(flash);
  setTimeout(function(){flash.style.opacity='1';},10);
  var shakes=0,iv=setInterval(function(){
    var dx=(Math.random()-0.5)*20,dy=(Math.random()-0.5)*14;
    document.body.style.transform='translate('+dx+'px,'+dy+'px)';
    flash.style.opacity=(Math.random()*0.75).toFixed(2);
    shakes++;
    if(shakes>20){
      clearInterval(iv);
      document.body.style.transform='';
      flash.style.background='#000';
      flash.style.transition='opacity 0.5s';
      flash.style.opacity='1';
      setTimeout(function(){
        if(cb)cb();
        flash.style.opacity='0';
        setTimeout(function(){if(flash.parentNode)flash.parentNode.removeChild(flash);},500);
      },200);
    }
  },55);
}


// ============================================================
// [KG] ADAPTERS (not in the original kofa.js)
// ============================================================
// Motel Sound: the original toggleRadio() drives the site jukebox. Here it is a stub that
// forwards to the host page's own #radio-toggle (if the host has one), otherwise does nothing.
if(typeof window.toggleRadio!=='function'){
  window.toggleRadio=function(){
    var t=document.getElementById('radio-toggle');
    if(t&&!(t.closest&&t.closest('.kg-layer'))){try{t.click();}catch(e){}}
  };
}
// data-action delegation: same logic as the original body click handler (kofa.js, onReady block),
// but limited to clicks inside the KG layer so the host page is not affected.
document.addEventListener('click',function(e){
  if(!e.target||!e.target.closest||!e.target.closest('.kg-layer'))return;
  var rub=e.target.closest('[data-rub]');
  if(rub){var lb=rub.getAttribute('data-rub');if(lb&&typeof kkPickRubric==='function'){kkPickRubric(lb);return;}}
  if(typeof kkClick==='function') try{kkClick();}catch(_ce){}
  var t=e.target.closest('[data-action]');
  if(!t)return;
  var act=t.getAttribute('data-action');
  if(act){
    try{
      var fn=new Function('event',act);
      fn.call(t,e);
    }catch(err){console.warn('act:',act,err);}
  }
});
// ESC key: the original handler also tests site-only panels; only the game branches are kept.
document.addEventListener('keydown',function(e){
  if(e.key!=='Escape')return;
  var g=function(id){return document.getElementById(id);};
  if(g('chess-confirm')&&g('chess-confirm').classList.contains('show')){chCancelQuit();return;}
  if(g('chess-over')&&g('chess-over').classList.contains('show')){return;}
  if(g('chess')&&g('chess').classList.contains('open')){chConfirmQuit();return;}
  if(g('mem')&&g('mem').classList.contains('open')){closeMem();return;}
});
