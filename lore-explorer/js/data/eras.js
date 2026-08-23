/* Holocron data — eras (timeline filter bands) and era deep-dives.
   Years are numbers: negative = BBY, positive = ABY. approx flags mark contested/rounded dates. */
window.HOLO_DATA = window.HOLO_DATA || {};

HOLO_DATA.eras = [
  { id: 'era-dawn',   name: 'Old Sith Empire',            from: -7003, to: -5001, color: '#7a3b2e',
    tagline: 'Exiled Dark Jedi conquer Korriban and forge an empire in the dark.' },
  { id: 'era-ghw',    name: 'Hyperspace War & Exile',     from: -5000, to: -4001, color: '#a03c32',
    tagline: 'The Sith collide with the Republic, are shattered, and survive in hiding.' },
  { id: 'era-gsw',    name: 'Great Sith War',             from: -4000, to: -3977, color: '#b5522b',
    tagline: 'Exar Kun and Ulic Qel-Droma nearly burn the Republic down.' },
  { id: 'era-mw',     name: 'Mandalorian Wars',           from: -3976, to: -3960, color: '#8a6d3b',
    tagline: 'The Neo-Crusaders carve up the Rim; Revan answers when the Jedi will not.' },
  { id: 'era-jcw',    name: 'Jedi Civil War & Dark Wars', from: -3959, to: -3950, color: '#93314e',
    tagline: 'Revan and Malak turn; then the Triumvirate hunts the Jedi to the edge of extinction.' },
  { id: 'era-ggw',    name: 'Great Galactic War',         from: -3681, to: -3600, color: '#5b3a8e',
    tagline: 'The True Sith Empire returns from Dromund Kaas and sacks Coruscant.' },
  { id: 'era-nsw',    name: 'New Sith Wars',              from: -2000, to: -1000, color: '#535d74',
    tagline: 'A thousand years of warlords, ending in the thought bomb at Ruusan.' },
  { id: 'era-rot',    name: 'Rule of Two',                from: -999,  to: -33,   color: '#33434f',
    tagline: 'Two there should be: one to embody power, the other to crave it.' },
  { id: 'era-empire', name: 'Empire Ascendant',           from: -32,   to: 11,    color: '#6b2d2d',
    tagline: 'Bane’s thousand-year plan detonates: Sidious takes the galaxy.' },
  { id: 'era-legacy', name: 'Legacy of the Sith',         from: 12,    to: 138,   color: '#3e5a45',
    tagline: 'New Jedi, reborn Emperors, and Darth Krayt’s One Sith.' }
];

/* Era deep-dives: curated period studies. battles/figures reference event/character ids. */
HOLO_DATA.deepDives = [
  {
    id: 'dd-ghw', name: 'The Great Hyperspace War', span: [-5000, -4980], era: 'era-ghw',
    summary: 'Two hyperspace explorers, Gav and Jori Daragon, blind-jump into Sith space in 5000 BBY and hand the isolated Sith Empire a map back to the Republic. Naga Sadow, freshly self-crowned Dark Lord over the objections of Ludo Kressh, uses them as pretext and guide for a two-pronged invasion — the Koros system and Coruscant itself. Sith sorcery and battle meditation carry the first assaults, but the illusions collapse when Sadow’s amulet is disrupted; the Republic under Empress Teta counterattacks into Sith space and breaks the empire at Korriban. Sadow flees to Yavin 4 and entombs himself. The Republic’s punitive holocaust scatters the survivors — one fleet, led by the sorcerer-lord Vitiate, escapes into the galactic east and will fester on Dromund Kaas for 1,300 years.',
    battles: ['ev-daragons', 'ev-ghw', 'ev-korriban-battles', 'ev-sadow-yavin', 'ev-sith-holocaust', 'ev-nathema-ritual', 'ev-exodus-dromund'],
    figures: ['naga-sadow', 'ludo-kressh', 'marka-ragnos', 'empress-teta', 'odan-urr', 'jori-daragon', 'vitiate'],
    techState: 'Republic hyperlanes are young and mapped by freelance explorers; war fleets are slow and sublight-heavy. The Sith compensate with sorcery: battle meditation, illusion armadas, and alchemy-grown war beasts. Lightsabers still trail power cables on some worlds — this is the deep past.',
    statusQuo: 'The Jedi are scholars and knight-errants concentrated at Ossus, not a standing army. The Sith Empire is a hermit kingdom that has forgotten the Republic exists — first contact is the war. Outcome: the old empire annihilated, Sith teachings scattered into tombs, holocrons, and one surviving exile fleet.'
  },
  {
    id: 'dd-gsw', name: 'The Great Sith War', span: [-3998, -3986], era: 'era-gsw',
    summary: 'The Sith return not as an invasion but as an inheritance. The Krath — Tetan aristocrats Satal and Aleema Keto — weaponize relics from Onderon’s Naddist cults; the fallen Jedi Ulic Qel-Droma infiltrates them and is devoured instead. Exar Kun, Vodo-Siosk Baas’s proudest student, follows Freedon Nadd’s whispers to Korriban and Yavin 4 and comes back a Dark Lord. In 3996 BBY their combined war — Krath fleets, Massassi terror troops, and Mandalore the Indomitable’s crusaders — reaches Coruscant itself. It ends when Aleema’s stolen superweapon detonates the Cron Cluster, incinerating the Jedi library-world of Ossus; the Jedi bind Kun’s spirit into the Yavin temples and Nomi Sunrider strips Ulic of the Force. Ten years later a broken, redeemed Ulic is shot dead by a nobody on Rhen Var.',
    battles: ['ev-naddist-uprising', 'ev-krath-coup', 'ev-deneba', 'ev-kun-dark-lord', 'ev-gsw', 'ev-coruscant-trial', 'ev-cron-ossus', 'ev-cay-death', 'ev-yavin-assault', 'ev-indomitable-death', 'ev-ulic-death'],
    figures: ['exar-kun', 'ulic-qel-droma', 'nomi-sunrider', 'vodo-siosk-baas', 'aleema-keto', 'satal-keto', 'freedon-nadd', 'arca-jeth', 'cay-qel-droma', 'mandalore-indomitable'],
    techState: 'Republic and Sith war matériel are near-parity; the decisive weapons are ancient — Sith amulets, Naga Sadow’s stellar-detonation ship, alchemy that swells Massassi into monsters. Mandalorian Basilisk war droids make small forces terrifying.',
    statusQuo: 'The Jedi enter the war as the Republic’s unquestioned guardians and leave it traumatized: their great library burned, a Grand-Master-in-waiting fallen, and a generation dead. The Sith “order” here is two ambitious men and borrowed ghosts — but it proves the dark side needs no empire to nearly win.'
  },
  {
    id: 'dd-mw', name: 'The Mandalorian Wars', span: [-3976, -3960], era: 'era-mw',
    summary: 'Mandalore the Ultimate rebuilds the clans as the Neo-Crusaders and spends sixteen years testing the Republic’s rim — the annihilation of Cathar is the atrocity that finally makes it undeniable. The Jedi Council counsels patience, fearing a deeper darkness behind the war (they are right: Sith emissaries goaded Mandalore onto the Republic). A charismatic young Knight the histories call Revan refuses to wait, leads the “Revanchist” Jedi into the line, and wins — brilliantly, and at any cost. At Malachor V in 3960 BBY, Revan kills Mandalore in single combat while the Mass Shadow Generator, triggered by the general later known as the Jedi Exile, crushes both fleets into the planet. The clans are disarmed and scattered; the victors fly into the Unknown Regions and come back Sith.',
    battles: ['ev-mw', 'ev-cathar', 'ev-revanchists', 'ev-malachor-v', 'ev-meetra-exile'],
    figures: ['revan', 'malak', 'meetra-surik', 'mandalore-ultimate', 'canderous-ordo', 'bao-dur'],
    techState: 'Basilisk war droids, mass-produced Neo-Crusader plate, and Republic capital lines slugging along contested hyperlanes. The war ends with a bespoke superweapon — Bao-Dur’s Mass Shadow Generator — whose gravitic slaughter tears a literal wound in the Force.',
    statusQuo: 'Jedi versus Sith is officially quiet — the Sith are extinct, say the records — but the war is their proxy debut: Sith influence pushed Mandalore, and the Jedi who fight come home carrying the dark seed. The Council’s inaction costs it the loyalty of its best generation.'
  },
  {
    id: 'dd-jcw', name: 'Jedi Civil War & the Dark Wars', span: [-3959, -3950], era: 'era-jcw',
    summary: 'Revan and Malak return from the dark with a Sith fleet pouring out of an ancient Rakatan factory, the Star Forge, and half the Republic’s war heroes defect to them. The Jedi fight their own former champions — hence the name. In 3957 BBY Malak fires on his master mid-battle; the Jedi rebuild the amnesiac Revan as their weapon, and the redeemed Revan kills Malak above Rakata Prime in 3956 BBY. Victory solves nothing: the leaderless Sith devour each other, and out of Malachor V’s Trayus Academy crawls a quieter horror — Darth Traya, Darth Sion, and Darth Nihilus, who hunt teachers rather than fleets. By 3951 BBY the Jedi Order is functionally a hundred fugitives; it takes the returned Exile, Meetra Surik, to kill the Triumvirate and shatter Malachor for good.',
    battles: ['ev-star-forge-found', 'ev-jcw', 'ev-korriban-reopened-revan', 'ev-malak-betrayal', 'ev-taris', 'ev-dantooine-razed', 'ev-rakata-prime', 'ev-sith-civil-war', 'ev-purge', 'ev-traya-betrayed', 'ev-katarr', 'ev-peragus', 'ev-dantooine-masters', 'ev-telos-battle', 'ev-malachor-end', 'ev-meetra-follows'],
    figures: ['revan', 'malak', 'bastila-shan', 'kreia', 'darth-nihilus', 'darth-sion', 'meetra-surik', 'visas-marr', 'atris', 'canderous-ordo', 'carth-onasi', 'hk-47'],
    techState: 'The Star Forge converts matter and dark-side hunger into infinite warships — industrial war at a scale the Republic cannot match, ended only by decapitation. Afterward, the galaxy is exhausted: the Dark Wars are fought by individuals, assassins, and the last handful of lightsabers.',
    statusQuo: 'This is the Sith high-water mark of the Old Republic: the Jedi are driven from open existence, their enclaves razed, their masters devoured at Katarr and Dantooine. The Order survives as scattered students of Surik’s circle — and Revan’s true enemy, the Emperor in the dark, remains untouched.'
  },
  {
    id: 'dd-ggw', name: 'The Great Galactic War & Cold War', span: [-3681, -3630], era: 'era-ggw',
    summary: 'Thirteen centuries after the Hyperspace War, the exiles’ descendants come back finished. The reconstituted Sith Empire — ruled continuously by the immortal Emperor Vitiate — retakes Korriban in 3681 BBY and grinds the Republic for twenty-eight years. In 3653 BBY the Sith offer peace talks on Alderaan as cover, sack Coruscant, raze the Jedi Temple, and dictate the Treaty of Coruscant from the smoking capital. The Cold War that follows is proxy skirmishes, an intact Dark Council, and a Jedi Order retreated to its rediscovered homeworld of Tython. When open war resumes, it consumes the Emperor himself: struck down by the Republic’s champion, body-hopping through puppets, finally annihilated decades later — by which point both empires are wreckage.',
    battles: ['ev-ggw', 'ev-korriban-retaken', 'ev-sacking', 'ev-treaty', 'ev-cold-war', 'ev-foundry', 'ev-vitiate-struck-down', 'ev-malgus-new-empire', 'ev-vitiate-end'],
    figures: ['vitiate', 'darth-malgus', 'satele-shan', 'darth-marr', 'lord-scourge', 'revan', 'hk-47'],
    techState: 'Full symmetric superpower war: dreadnought lines, planetary shields, cloaked armadas, cyborg battalions. Sith alchemy persists at the top — the Emperor’s ritual magics can eat worlds — but this era’s decisive weapons are fleets and treaties.',
    statusQuo: 'For the first time since Ruusan’s ancestors, Sith and Jedi exist as peer institutions: a Sith Empire with academies, a Dark Council, and a state religion opposite a Jedi Order serving a weakened Republic. Neither wins; both are hollowed out for the thousand-year cycle to turn again.'
  },
  {
    id: 'dd-nsw', name: 'The New Sith Wars', span: [-2000, -1000], era: 'era-nsw',
    summary: 'The Jedi Master Phanius walks out of the Order in 2000 BBY, renames himself Darth Ruin, and reignites the Sith as a franchise: for a thousand years, any warlord with a red blade can claim the title. The Republic loses ground for centuries — the catastrophic defeat at Mizra, Belia Darzu’s technobeast plagues, a Dark Age in which the Republic collapses to the Core, currency fails, and the Jedi assume direct military rule. Order arrives from the wrong side: Lord Skere Kaan’s Brotherhood of Darkness rationalizes the warlords, reopens the Korriban academy, and nearly wins — until his own academy’s star pupil, Darth Bane, decides the Brotherhood is the disease. Bane feeds Kaan the thought bomb’s lore; at the Seventh Battle of Ruusan in 1000 BBY, Kaan’s ritual annihilates every Sith and Jedi on the field. Exactly as planned — minus two.',
    battles: ['ev-ruin-schism', 'ev-mizra', 'ev-darzu', 'ev-dark-age', 'ev-bod-founded', 'ev-korriban-reopened-bod', 'ev-ruusan-campaign', 'ev-kasim-lehon', 'ev-ruusan7', 'ev-ruusan-reformation', 'ev-rule-of-two'],
    figures: ['darth-ruin', 'belia-darzu', 'skere-kaan', 'darth-bane', 'darth-zannah', 'qordis', 'kasim', 'githany', 'lord-hoth', 'valenthyne-farfalla'],
    techState: 'A millennium of attrition runs technology backwards: by the end, armies fight with whatever the last functioning shipyard produced, lightsaber-carrying generals lead infantry, and the era’s superweapon — the thought bomb — is pure Force ritual, no hardware at all.',
    statusQuo: 'Jedi and Sith become mirror-image armies (Army of Light vs. Brotherhood of Darkness), which is precisely what both orders die of. Aftermath: the Ruusan Reformation strips the Jedi of armies and the Republic of standing forces, the galaxy believes the Sith extinct — and Bane’s Rule of Two makes that belief the Sith’s greatest weapon.'
  },
  {
    id: 'dd-rot', name: 'The Rule of Two', span: [-1000, -33], era: 'era-rot',
    summary: 'Darth Bane’s insight: the Sith lose because they are many. Power concentrated in exactly two — a Master to embody it, an apprentice to crave it — with succession by murder, secrecy as doctrine, and the Jedi left to rot in peacetime. The line survives its own founder (Zannah takes the mantle over his corpse on Ambria in 980 BBY), sheds a heresy (Darth Millennial’s Prophets of the Dark Side), and then disappears from history on purpose: Cognus, Vectivus, and centuries of unrecorded masters compound wealth, influence, and grudges. It resurfaces at the end as Darth Tenebrous, then Darth Plagueis the Wise — banker, biologist, would-be conqueror of death — and his apprentice Sidious, who closes the thousand-year ledger by murdering his master in his sleep and repealing every rule but power.',
    battles: ['ev-rule-of-two', 'ev-tython-duel', 'ev-ambria-duel', 'ev-millennial-schism', 'ev-plagueis-tenebrous', 'ev-sidious-apprenticed', 'ev-plagueis-death'],
    figures: ['darth-bane', 'darth-zannah', 'darth-cognus', 'darth-millennial', 'darth-vectivus', 'darth-tenebrous', 'darth-plagueis', 'darth-sidious', 'darth-maul'],
    techState: 'The galaxy industrializes into the familiar prequel-era machine — droids, corporate armies, a demilitarized Republic. Sith warcraft becomes finance, genetics, and politics: Plagueis manipulates midi-chlorians and banking clans with equal fluency.',
    statusQuo: 'Officially there are no Sith for this entire era — the Jedi guard a peace they no longer understand, senators do the conquering, and the two Sith compound interest. It is the only era the Sith unambiguously win, and they win it without fighting a single open battle until the very end.'
  },
  {
    id: 'dd-gcw', name: 'Rise of the Empire & Galactic Civil War', span: [-32, 11], era: 'era-empire',
    summary: 'Sidious spends 32–19 BBY running both sides of a manufactured war — Darth Tyranus leading the Separatists, Chancellor Palpatine leading the Republic — and ends it with Order 66, a Galactic Empire, and the Chosen One in black armor. The Jedi are exterminated in an afternoon; Vader spends two decades hunting the remainder. The Sith fall the way Bane predicted they would if they ever went public: the apprentice (and his son) kill the master. Vader turns on Sidious at Endor in 4 ABY — but Legends gives the Emperor a coda: clone bodies on Byss, a reborn Empire in 10 ABY, and a final death in 11 ABY on Onderon, where a dying jump into young Anakin Solo is blocked and the spirit is dragged into the dark forever.',
    battles: ['ev-plagueis-death', 'ev-clone-wars', 'ev-order66', 'ev-yavin', 'ev-endor', 'ev-dark-empire', 'ev-praxeum', 'ev-kun-spirit-destroyed'],
    figures: ['darth-sidious', 'darth-vader', 'darth-maul', 'darth-tyranus', 'yoda', 'obi-wan', 'mace-windu', 'qui-gon', 'luke-skywalker'],
    techState: 'Superweapon apex: clone armies, Star Destroyer fleets, two Death Stars, World Devastators, the Galaxy Gun. The dark side’s contribution is scale — battle meditation across fleets, a Force-storm-throwing reborn Emperor — grafted onto industrial totalitarianism.',
    statusQuo: 'The two-man Sith order holds the entire galaxy for 23 years — the Rule of Two’s payoff and its terminus. The Jedi go from ten thousand to two exiles to one farm boy; by 11 ABY Luke Skywalker’s praxeum on Yavin 4 (atop Exar Kun’s tombs, which promptly wake up) begins the New Jedi Order.'
  },
  {
    id: 'dd-legacy', name: 'The Legacy Era & the One Sith', span: [12, 138], era: 'era-legacy',
    summary: 'The Sith idea keeps outliving its orders. Lumiya, an Emperor’s Hand rebuilt as the Dark Lady, grooms Han and Leia’s son Jacen Solo into Darth Caedus (40–41 ABY) — a Sith of one, dead within a year at his twin’s hand. The durable successor is quieter: around 30 ABY the fallen Jedi A’Sharad Hett, reborn as Darth Krayt after torture by the Yuuzhan Vong and tutelage from Darth Bane’s old holocron, refounds the order on Korriban as the One Sith — many Sith, one will, patience measured in decades of stasis. In 127–130 ABY they hijack a resurgent Empire, massacre the Jedi academy at Ossus, and put Krayt on the galactic throne. It takes seven years, a civil war among three governments, and the bounty-hunting Skywalker heir Cade to burn Krayt — twice — and scatter the One Sith by 138 ABY.',
    battles: ['ev-lumiya-rise', 'ev-one-sith', 'ev-caedus', 'ev-lost-tribe-found', 'ev-sith-imperial-war', 'ev-ossus-massacre', 'ev-krayt-death', 'ev-second-imperial-cw-end'],
    figures: ['lumiya', 'darth-caedus', 'darth-krayt', 'darth-wyyrlok', 'darth-talon', 'cade-skywalker', 'kol-skywalker', 'luke-skywalker'],
    techState: 'Post-Vong galaxy: Yuuzhan Vong biotech scars, terraforming as a weapon (the Ossus Project sabotage), sith-alchemy flesh-shaping of Krayt’s own failing body, and three-way fleet war among Empire, Alliance remnant, and Sith.',
    statusQuo: 'Krayt’s Rule of One inverts Bane: an army of Sith bound to a single will, hiding not their existence but their number. The Jedi survive their third near-extermination and outlast him — the running lesson of six thousand years being that neither side ever finishes the other.'
  }
];
