/* Holocron data — artifacts and concepts. */
window.HOLO_DATA = window.HOLO_DATA || {};

HOLO_DATA.artifacts = [
  {
    id: 'star-forge', name: 'The Star Forge', alignment: 'sith', eras: ['era-dawn', 'era-jcw'], loc: 'lehon',
    blurb: 'The Rakata’s factory-god: a station that eats a star and its wielder’s hunger, and exhales fleets.',
    detail: 'Built by the Infinite Empire around 30,000 BBY, the Star Forge draws matter from Lehon’s sun and will from the dark side — a semi-living machine that amplifies its master’s ambition and feeds on it. The Rakata lost themselves to it; Revan, warned by that history, used it as a shipyard and refused to sit at its heart, which Malak read as weakness and repeated as policy. It powered the Jedi Civil War’s bottomless Sith fleets until the redeemed Revan killed Malak aboard it in 3956 BBY and the Republic fleet dropped it into the sun it had been eating.',
    sources: ['Knights of the Old Republic (2003)'], tags: ['rakata', 'superweapon', 'factory']
  },
  {
    id: 'star-maps', name: 'The Star Maps', alignment: 'sith', eras: ['era-jcw'], loc: 'dantooine',
    blurb: 'Five Rakatan waypoints — Dantooine, Kashyyyk, Manaan, Tatooine, Korriban — that together point to Lehon.',
    detail: 'Terminals left by the Infinite Empire on five scattered worlds, each holding a fragment of the route to Lehon and the Star Forge. Revan and Malak followed them in 3960–3959 BBY; the amnesiac Revan followed his own cold trail through them again with the Ebon Hawk’s crew. The maps’ corrupted guardians — a mad droid on Kashyyyk, a starved terentatek on Korriban — made each retrieval a small referendum on the seeker’s methods, which was probably the Rakata’s idea of a filter.',
    sources: ['Knights of the Old Republic (2003)'], tags: ['rakata', 'waypoint']
  },
  {
    id: 'mass-shadow-generator', name: 'Mass Shadow Generator', alignment: 'neutral', eras: ['era-mw', 'era-jcw'], loc: 'malachor',
    blurb: 'Bao-Dur’s gravity weapon: it ended the Mandalorian Wars in one activation and tore a wound in the Force doing it.',
    detail: 'Designed by the Zabrak engineer Bao-Dur as the Republic’s war-ending contingency, the Generator collapsed mass shadows across Malachor V’s battlespace — crushing both fleets, Mandalorian and Republic alike, into the planet when General Meetra Surik gave the order in 3960 BBY. The gravitic massacre cracked the planet and tore a wound in the Force that hollowed survivors (Nihilus) and defined Surik herself. Its final activation in 3951 BBY, via Bao-Dur’s surviving remote, finished Malachor and buried the Trayus Academy with it.',
    sources: ['Knights of the Old Republic II'], tags: ['superweapon', 'gravity']
  },
  {
    id: 'muur-talisman', name: 'Muur Talisman', alignment: 'sith', eras: ['era-dawn', 'era-legacy'], loc: 'taris',
    blurb: 'Karness Muur’s soul-anchor: an amulet that makes rakghouls of the unprotected and a puppet of its wearer.',
    detail: 'The exile-era sorcerer Karness Muur bound his spirit into this talisman as his immortality scheme, paired with its cruelest feature: it transforms nearby beings without Force protection into rakghouls under the wearer’s command — the plague that haunted Taris’s undercity for millennia. The Jedi Covenant’s shadows recovered it in 3963 BBY; Celeste Morne carbonite-froze herself with it to keep Muur contained, surfacing at intervals across four thousand years (once opposite Darth Vader) until Cade Skywalker burned talisman and spirit to nothing in 137 ABY.',
    sources: ['Knights of the Old Republic: Vector', 'Star Wars: Legacy — Vector'], tags: ['amulet', 'rakghoul', 'spirit-anchor']
  },
  {
    id: 'bane-holocron', name: 'Holocron of Darth Bane', alignment: 'sith', eras: ['era-rot', 'era-legacy'], loc: 'korriban',
    blurb: 'The founder’s teaching machine — which spent the Legacy era arguing doctrine with the man who superseded it.',
    detail: 'Darth Bane encoded his gatekeeper-self into a holocron so the Rule of Two would survive accidents of succession. Its most consequential student came a millennium late: A’Sharad Hett found it in Korriban’s tombs around 30 ABY, and Bane’s simulacrum tutored him through his rebirth as Darth Krayt — then spent the next century objecting, acidly and correctly by its own lights, to Krayt’s Rule of One. Krayt kept it anyway, half syllabus and half trophy: the old Sith kept as a heckler.',
    sources: ['Star Wars: Legacy', 'Book of Sith'], tags: ['holocron', 'rule of two']
  },
  {
    id: 'telos-holocron', name: 'Telos Holocron', alignment: 'sith', eras: ['era-jcw', 'era-empire'], loc: 'telos',
    blurb: 'A migrating compendium of Sith teaching — pages of Sorzus Syn, Bane, and Malgus, annotated by every thief.',
    detail: 'A Sith holocron-archive associated with Telos IV, accreting doctrine across eras: foundational alchemy from the exiles’ chronicler Sorzus Syn, campaign notes from Darth Malgus, Banite commentary, and marginalia from later hands (Sidious among them, in the Book of Sith’s conceit). Less a single artifact than the atlas’s idea of Sith scholarship itself: stolen, annotated, contradicted, and never destroyed because every faction that captures it decides it is too useful to burn.',
    sources: ['Book of Sith', 'Knights of the Old Republic II (Telos)'], tags: ['holocron', 'archive']
  },
  {
    id: 'mask-of-mandalore', name: 'Mask of Mandalore', alignment: 'gray', eras: ['era-gsw', 'era-mw', 'era-jcw'], loc: 'dxun',
    blurb: 'The clans’ portable throne: whoever holds the mask is Mandalore — which is why Revan hid it.',
    detail: 'The Taung mask passes rule of the clans by possession: recovered from Dxun’s jungle after the Indomitable’s death, it crowned Mandalore the Ultimate and launched the Mandalorian Wars. Revan understood the mechanism exactly — after killing the Ultimate at Malachor V in 3960 BBY, he hid the mask, decapitating Mandalorian society for a decade without firing another shot. He later pointed Canderous Ordo at its hiding place, a deliberate act of cultural restoration: Mandalore the Preserver rebuilt the clans as something the Republic could survive.',
    sources: ['Tales of the Jedi', 'Knights of the Old Republic II', 'The Old Republic: Revan'], tags: ['mask', 'mandalorian', 'regalia']
  },
  {
    id: 'mask-of-nihilus', name: 'Mask of Darth Nihilus', alignment: 'sith', eras: ['era-jcw'], loc: 'telos',
    blurb: 'The white face of the Lord of Hunger — less a mask than the lid on a wound.',
    detail: 'The bone-white, weeping-streaked mask is the only stable surface of Darth Nihilus: beneath it, the man consumed at Malachor V persists as appetite bound into a shape. His utterances through it survive only as distorted shrieks — meaning had stopped surviving translation. When Visas Marr looked beneath it at Telos in 3951 BBY she saw, by her own account, "a man… and yet nothing." The mask outlasted its wearer as a relic hunted by collectors who mostly did not understand what the object had been holding shut.',
    sources: ['Knights of the Old Republic II'], tags: ['mask', 'hunger']
  },
  {
    id: 'sword-of-ragnos', name: 'Sword of Marka Ragnos', alignment: 'sith', eras: ['era-dawn', 'era-empire'], loc: 'korriban',
    blurb: 'The golden-age Dark Lord’s blade — five millennia later, the wick of his attempted resurrection.',
    detail: 'Interred with Marka Ragnos in the Valley of the Dark Lords, the sword anchored his lingering spirit’s claim on the living world. In 14 ABY the Disciples of Ragnos cult, having siphoned dark-side energy from sites across the galaxy, used the sword in his tomb as the vessel of resurrection — briefly raising the old Dark Lord’s shade into the blade itself before Jedi students shattered the ritual. The atlas keeps it as the type specimen of a recurring genre: Sith regalia as unexploded ordnance.',
    sources: ['Jedi Knight: Jedi Academy', 'Tales of the Jedi: Golden Age of the Sith'], tags: ['sword', 'resurrection', 'tomb']
  }
];

HOLO_DATA.concepts = [
  {
    id: 'rule-of-two', name: 'Rule of Two', alignment: 'sith', eras: ['era-rot', 'era-empire'],
    blurb: '“Two there should be; no more, no less. One to embody power, the other to crave it.” — Bane’s answer to a thousand years of Sith self-destruction.',
    detail: 'Darth Bane’s doctrine, declared on Ruusan’s ashes in 1000 BBY: exactly two Sith at a time — a Master to embody power, an apprentice to crave it — with succession only by the apprentice out-growing and killing the Master. Corollaries: absolute secrecy (the Jedi must believe the Sith extinct), patience across generations, and the treatment of every apprentice as both heir and test. It traded armies for compound interest and paid out, a millennium later, in Palpatine. Its failure mode was built in: a Master who cheats succession (Sidious’s clones) breaks the engine that made him.',
    sources: ['Darth Bane: Path of Destruction', 'Darth Plagueis', 'Book of Sith'], tags: ['doctrine']
  },
  {
    id: 'rule-of-one', name: 'Rule of One', alignment: 'sith', eras: ['era-legacy'],
    blurb: 'Krayt’s heresy against Bane: many Sith, one will — an order of instruments instead of heirs.',
    detail: 'Darth Krayt’s founding doctrine for the One Sith (c. 30 ABY): unlimited Sith bound in absolute obedience to a single Dark Lord, ambition abolished, succession replaced by the sovereign’s immortality project. It solved the Rule of Two’s throughput problem — one apprentice per generation cannot staff a conquest — at the cost Bane’s holocron kept naming: an order whose members want nothing is an order that cannot survive its center. When Krayt died his final death in 137 ABY, the One Sith did not fracture into rivals; it evaporated.',
    sources: ['Star Wars: Legacy', 'Book of Sith'], tags: ['doctrine']
  },
  {
    id: 'sith-code', name: 'The Sith Code', alignment: 'sith', eras: ['era-dawn', 'era-nsw', 'era-rot'],
    blurb: '“Peace is a lie, there is only passion…” — the creed that frames the dark side as liberation through strength.',
    detail: 'Peace is a lie, there is only passion. / Through passion, I gain strength. / Through strength, I gain power. / Through power, I gain victory. / Through victory, my chains are broken. / The Force shall free me. Attributed to the exile-era chronicler Sorzus Syn as a deliberate inversion of the Jedi Code, the creed survives every organizational collapse in this atlas because it is not an organization — it is a promise about hunger. Every era’s Sith (Kun’s converts, Korriban’s academies, Bane’s two, Krayt’s many) recite the same six lines and mean something slightly different by "chains."',
    sources: ['Book of Sith', 'Knights of the Old Republic (2003)'], tags: ['creed']
  },
  {
    id: 'jedi-code', name: 'The Jedi Code', alignment: 'jedi', eras: ['era-dawn', 'era-rot'],
    blurb: '“There is no emotion, there is peace…” — the discipline the Sith Code was written to invert.',
    detail: 'There is no emotion, there is peace. / There is no ignorance, there is knowledge. / There is no passion, there is serenity. / There is no chaos, there is harmony. / There is no death, there is the Force. The Order’s mantra of surrender over craving, held (with variations — Odan-Urr’s formulation among them) across every era of this atlas. Its critics inside the tool’s own data are notable: Jolee Bindo argued love was never the danger; Kreia argued the Code outsources conscience; Luke’s New Jedi Order eventually amended its practice on attachment. The lines survived all of them.',
    sources: ['The Jedi Path', 'Knights of the Old Republic (2003)'], tags: ['creed']
  },
  {
    id: 'thought-bomb', name: 'Thought Bomb', alignment: 'sith', eras: ['era-nsw'],
    blurb: 'A ritual of massed Sith will that annihilates every Force-user in range — souls included. Used once.',
    detail: 'An ancient Sith ritual requiring many Lords to merge their power into a single detonation of will: within its radius, every Force-sensitive being — Sith and Jedi alike — is annihilated, their souls bound together in the blast’s residue. Darth Bane retrieved the lore and fed it to Lord Kaan precisely because it cannot discriminate: at the Seventh Battle of Ruusan (1000 BBY), Kaan’s Brotherhood detonated it against Hoth’s hundred volunteers and completed Bane’s purge of both establishments at once. The bound souls persisted in Ruusan’s cave — the Valley of the Jedi — for a millennium.',
    sources: ['Darth Bane: Path of Destruction', 'Jedi Knight: Dark Forces II'], tags: ['ritual', 'superweapon']
  },
  {
    id: 'sith-alchemy', name: 'Sith Alchemy & Sorcery', alignment: 'sith', eras: ['era-dawn', 'era-gsw', 'era-nsw'],
    blurb: 'The old Empire’s craft of reshaping flesh, matter, and minds — war beasts, Massassi giants, technobeasts, unkillable armor.',
    detail: 'The exiles fused Dark Jedi discipline with the Sith species’ native magic into a technology of corruption: alchemically swollen Massassi warriors, Naga Sadow’s illusion armadas and star-cracking ship, Exar Kun’s creature-shaping on Yavin 4, Belia Darzu’s nanite-fused technobeasts, Zannah’s mind-rotting illusions, and the orbalisk armor Bane wore. It is the dark side as engineering discipline — and the atlas’s recurring warning label: every alchemical masterpiece in the record eventually consumed, betrayed, or outlived its maker.',
    sources: ['Book of Sith', 'Tales of the Jedi', 'Darth Bane trilogy'], tags: ['craft']
  },
  {
    id: 'battle-meditation', name: 'Battle Meditation', alignment: 'neutral', eras: ['era-ghw', 'era-jcw'],
    blurb: 'One mind tilting a whole battlespace: morale, coordination, and luck bent fleet-wide. Bastila’s gift — and Sadow’s.',
    detail: 'A rare Force discipline that projects the user’s will across an entire engagement — bolstering one side’s coordination and resolve while eroding the enemy’s. Naga Sadow drove the Hyperspace War’s illusion-assaults with it; Bastila Shan’s battle meditation was the Republic’s decisive asset in the Jedi Civil War, which is why Revan’s capture of her (and Malak’s later re-capture) functioned as fleet actions in themselves. The technique’s strategic lesson recurs: when one person is worth a fleet, wars become kidnappings.',
    sources: ['Tales of the Jedi', 'Knights of the Old Republic (2003)'], tags: ['discipline']
  },
  {
    id: 'wound-in-the-force', name: 'Wound in the Force', alignment: 'neutral', eras: ['era-mw', 'era-jcw'],
    blurb: 'Where too much death tears the Force itself: Malachor V, Katarr — and the walking case, Meetra Surik.',
    detail: 'Mass death concentrated in a moment can tear the Force, leaving places — and people — that hunger or echo. Malachor V’s gravitic massacre (3960 BBY) made the type site; Nihilus, hollowed there, became a mobile wound that fed at Katarr; and Meetra Surik, who gave the activation order, survived by instinctively severing herself — becoming "the wound that walks," a hole in the Force that other holes resonated with. Kreia built her entire heresy on Surik’s existence: proof a being could live, choose, and matter with the Force subtracted.',
    sources: ['Knights of the Old Republic II'], tags: ['phenomenon']
  },
  {
    id: 'force-bond', name: 'Force Bond', alignment: 'neutral', eras: ['era-jcw'],
    blurb: 'Two minds tied through the Force — Bastila and Revan, Kreia and the Exile: intimacy as strategy and leash.',
    detail: 'A durable psychic link between Force-users, formed in crisis (Bastila catching the dying Revan’s mind) or cultivated deliberately (Kreia’s bond with Meetra Surik, which she claimed made their deaths mutual). Bonds transmit emotion, pain, strength, and influence, and the era’s masters used them as tools: the Jedi Council used the Revan–Bastila bond as a targeting system for redemption; Kreia used hers as pedagogy and hostage-taking at once. The atlas treats bonds as the connective tissue of the KOTOR era — its wars are personal because its physics were.',
    sources: ['Knights of the Old Republic (2003)', 'Knights of the Old Republic II'], tags: ['phenomenon']
  },
  {
    id: 'sithari', name: 'The Sith’ari', alignment: 'sith', eras: ['era-nsw', 'era-rot'],
    blurb: 'The Sith’s prophesied perfect being: one who will destroy the Sith — and make them stronger by it.',
    detail: 'An old Sith prophecy of a perfect lord, free of all restriction, who will lead the Sith by destroying them: he will raise them from death and make them stronger than before. The Brotherhood-era academies debated it; Bane’s career reads as a deliberate application — he destroyed the Sith as they existed (Ruusan) and rebuilt them stronger (the Rule of Two), which is why later commentators name Bane the likeliest Sith’ari. The prophecy’s structure — destruction as renewal — is the Sith’s one piece of genuine theology, and every reformer in this atlas implicitly claims it.',
    sources: ['Darth Bane: Path of Destruction', 'Book of Sith'], tags: ['prophecy']
  },
  {
    id: 'darth-title', name: 'The “Darth” Title', alignment: 'sith', eras: ['era-jcw', 'era-rot'],
    blurb: 'The honorific that marks a Sith Lord’s rebirth — Revan took it, Bane systematized it, Sidious franchised it.',
    detail: 'A title of dark lordship whose origin the in-universe scholars argue about — contractions of "Dark Lord of the Sith," Rakatan loan-words ("darr tah," victory over death), or pure invention. The record’s first great bearers are Revan and Malak (3959 BBY); the Triumvirate carried it through the Purge; Ruin’s schism revived it; and under the Banite line it became the sacrament of succession — the new name that kills the old person (Dessel becomes Bane, Palpatine becomes Sidious, Anakin becomes Vader). To take the Darth name is, doctrinally, to declare the previous self dead.',
    sources: ['Book of Sith', 'Darth Plagueis', 'Knights of the Old Republic (2003)'], tags: ['title']
  },
  {
    id: 'dark-lord-title', name: 'Dark Lord of the Sith', alignment: 'sith', eras: ['era-dawn', 'era-gsw', 'era-nsw', 'era-rot'],
    blurb: 'The Sith sovereignty itself — a crown passed by murder, ritual, or acclamation from Ajunta Pall to Darth Krayt.',
    detail: 'The supreme title of the Sith, first taken by Ajunta Pall in 6900 BBY and claimed — by inheritance, coup, spirit-anointment (Exar Kun), self-declaration (Ruin), collective heresy (Kaan’s "all are Dark Lords"), or doctrine (one per generation under Bane) — down to Darth Krayt. The atlas tracks it as the Sith’s one continuous institution: orders, empires, and codes all die, but someone always picks the title back up. Its formal plural under Kaan and its strict singular under Bane are the era-defining arguments of the last two millennia BBY.',
    sources: ['Tales of the Jedi', 'Darth Bane: Path of Destruction', 'Book of Sith'], tags: ['title']
  }
];
