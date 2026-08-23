/* Holocron data — characters. born/died are years (negative = BBY); approx flags mark rounded dates.
   diedAt references a location id; deathNote is used by the Q&A engine for "how did X die". */
window.HOLO_DATA = window.HOLO_DATA || {};

HOLO_DATA.characters = [

  /* ── Old Sith Empire ─────────────────────────────────────────── */
  {
    id: 'ajunta-pall', name: 'Ajunta Pall', aka: ['First Dark Lord of the Sith'], alignment: 'sith',
    species: 'Human (Dark Jedi exile)', eras: ['era-dawn'], born: null, died: -6900, approx: true, diedAt: 'korriban',
    deathNote: 'Died on Korriban in the early exile era; his regretful spirit lingered in his tomb for millennia, and Revan met it in 3956 BBY.',
    blurb: 'Leader of the exiled Dark Jedi who conquered the Sith species — the first to bear the title Dark Lord of the Sith.',
    bio: 'A champion of the Dark Jedi defeated in the Hundred-Year Darkness, Ajunta Pall led the exiles to Korriban in 6900 BBY, where they overthrew the Sith king and enthroned themselves as god-rulers of the species. He took the first Dark Lordship and founded the empire whose tombs, titles, and grudges drive the next seven thousand years. His spirit, met by Revan in the Valley of the Dark Lords, confessed the whole project had been a mistake — the atlas’s earliest recorded Sith regret.',
    sources: ['Knights of the Old Republic (2003)', 'Book of Sith'], tags: ['dark lord', 'exile', 'founder']
  },
  {
    id: 'karness-muur', name: 'Karness Muur', aka: [], alignment: 'sith',
    species: 'Human (Dark Jedi exile)', eras: ['era-dawn'], born: null, died: null, approx: true,
    deathNote: 'His body died in the exile era, but his spirit persisted inside the Muur Talisman until Cade Skywalker destroyed it in 137 ABY.',
    blurb: 'Exile-era Sith sorcerer who cheated death through his talisman — and cursed Taris with the rakghoul plague.',
    bio: 'One of Ajunta Pall’s fellow exiles and rivals, Karness Muur solved Sith immortality the artifact way: he bound his spirit into the Muur Talisman, which turns the unprotected into rakghouls — a mindless army awaiting a wearer. The talisman’s trail runs through Taris’s undercity plague, the Jedi Covenant’s vaults, Celeste Morne’s four-thousand-year vigil, and a final grab at the Skywalker line in 137 ABY, when Cade burned the talisman and Muur with it. Arguably the longest single villain arc in the atlas.',
    sources: ['Knights of the Old Republic: Vector', 'Star Wars: Legacy — Vector'], tags: ['sorcerer', 'artifact', 'rakghoul']
  },
  {
    id: 'tulak-hord', name: 'Tulak Hord', aka: ['Lord of Hate'], alignment: 'sith',
    species: 'Sith hybrid', eras: ['era-dawn'], born: null, died: -5400, approx: true, diedAt: 'korriban',
    deathNote: 'Died at the height of the old Empire; entombed in the Valley of the Dark Lords with his teachings.',
    blurb: 'The old Empire’s greatest duelist and conqueror — “Lord of Hate,” whose tomb-sealed techniques obsessed later Sith.',
    bio: 'Remembered even by other Dark Lords as the finest lightsaber duelist of the old Empire, Tulak Hord conquered Yn and Chabosh and the dark councils of his rivals with equal efficiency. His mastery of Sith magic and blade-craft was interred with him on Korriban, making his tomb a pilgrimage site for ambitious students from Exar Kun’s day to the Great Galactic War. Kreia’s needling question to her students — “What do you know of Tulak Hord?” — is the standard lesson: technique without understanding is just archaeology.',
    sources: ['Knights of the Old Republic II', 'The Old Republic'], tags: ['dark lord', 'duelist']
  },
  {
    id: 'marka-ragnos', name: 'Marka Ragnos', aka: [], alignment: 'sith',
    species: 'Sith hybrid', eras: ['era-dawn'], born: null, died: -5000, diedAt: 'korriban',
    deathNote: 'Died of age in 5000 BBY at the height of his power; his spirit kept holding court from his tomb.',
    blurb: 'Dark Lord of the golden age — a century of iron rule, and a ghost whose funeral started the Hyperspace War.',
    bio: 'Marka Ragnos out-schemed and out-lived every rival for a hundred years, presiding over the old Empire’s golden age by keeping its ambitions pointed inward. His death in 5000 BBY broke the seal: at his funeral, Naga Sadow and Ludo Kressh split the Empire over succession just as the Daragons’ ship arrived from Republic space. His spirit crowned Sadow Dark Lord — then warned him, uselessly, against the war he chose. Five millennia later a cult of “Disciples of Ragnos” tried to pour his ghost into a new body over the same tomb.',
    sources: ['Tales of the Jedi: Golden Age of the Sith', 'Jedi Knight: Jedi Academy'], tags: ['dark lord', 'golden age']
  },
  {
    id: 'naga-sadow', name: 'Naga Sadow', aka: [], alignment: 'sith',
    species: 'Sith hybrid', eras: ['era-dawn', 'era-ghw'], born: null, died: -4400, approx: true, diedAt: 'yavin4',
    deathNote: 'Entombed himself in stasis on Yavin 4 after the Hyperspace War; roused and destroyed by Freedon Nadd around 4400 BBY.',
    blurb: 'The expansionist Dark Lord who dragged the old Empire into the Great Hyperspace War — and to its destruction.',
    bio: 'A half-breed sorcerer-lord who believed the Empire was rotting in its isolation, Naga Sadow seized the Dark Lordship over Ludo Kressh’s objections the moment the Daragons handed him a route to the Republic. His war was sorcery-first — illusion fleets, battle meditation, a ship that could pull solar flares from stars — and it collapsed the moment the illusions did. He killed Kressh on the way out, fled through the Denarii nova, and sealed himself in stasis beneath Yavin 4’s temples, where his Massassi bred in the dark. Freedon Nadd woke him for his secrets and repaid the tutoring with destruction.',
    sources: ['Tales of the Jedi: Golden Age of the Sith', 'Tales of the Jedi: The Fall of the Sith Empire'], tags: ['dark lord', 'sorcerer', 'invasion']
  },
  {
    id: 'ludo-kressh', name: 'Ludo Kressh', aka: [], alignment: 'sith',
    species: 'Sith hybrid', eras: ['era-dawn', 'era-ghw'], born: null, died: -5000, diedAt: 'korriban',
    deathNote: 'Killed at the Second Battle of Korriban in 5000 BBY when Sadow’s crippled flagship was rammed into his own.',
    blurb: 'Sadow’s conservative rival — right about the war, dead before being proven right.',
    bio: 'The loudest voice for isolation at Marka Ragnos’s funeral, Ludo Kressh read the Daragons’ arrival as the omen it was and fought Sadow’s coronation to the edge of civil war. Outmaneuvered — Sadow faked his own death and framed the Republic — Kressh withdrew, then seized Korriban when the invasion fleet left. He was killed on the day of Sadow’s ruined homecoming, rammed by a sacrificed warship. Every subsequent collapse of an overextended Sith empire is, in effect, Kressh’s told-you-so.',
    sources: ['Tales of the Jedi: Golden Age of the Sith', 'Tales of the Jedi: The Fall of the Sith Empire'], tags: ['rival', 'isolationist']
  },
  {
    id: 'odan-urr', name: 'Odan-Urr', aka: ['Keeper of Antiquities'], alignment: 'jedi',
    species: 'Draethos', eras: ['era-dawn', 'era-ghw', 'era-gsw'], born: -5032, approx: true, died: -3996, diedAt: 'ossus',
    deathNote: 'Cut down by Exar Kun in the Great Library at Ossus in 3996 BBY, defending Naga Sadow’s holocron; he was over a thousand years old.',
    blurb: 'Scholar-Jedi of the Hyperspace War who built the Great Library of Ossus and guarded its darkest volume for a thousand years.',
    bio: 'A young Draethos consular when Sadow invaded, Odan-Urr fought at Koros Major and Kirrek, then spent the next millennium proving the pen matters more: he founded the Great Jedi Library on Ossus around 4996 BBY and served as its Keeper of Antiquities, preserving even Sith works on the principle that ignorance is the greater danger. Among them was Naga Sadow’s holocron — which is what Exar Kun came for in 3996 BBY. The oldest Jedi of his age died protecting a book he had refused to burn, and the question of whether he was right is the library-question of the whole atlas.',
    sources: ['Tales of the Jedi: Golden Age of the Sith', 'Tales of the Jedi: The Sith War'], tags: ['scholar', 'librarian']
  },
  {
    id: 'empress-teta', name: 'Empress Teta', aka: [], alignment: 'neutral',
    species: 'Human', eras: ['era-dawn', 'era-ghw'], born: null, died: null, approx: true,
    blurb: 'Warrior-empress of the Koros system who led the Republic’s survival — and counterstroke — in the Hyperspace War.',
    bio: 'Having unified the seven worlds of Koros just before the invasion, Teta was the Republic’s spine in 5000 BBY: she held her system against the first assault, absorbed the refugees of Kirrek, and led the pursuit fleet into Sith space that broke the old Empire at Korriban. The grateful Republic renamed the Koros system for her. History’s footnote is crueler: thirteen centuries later her own descendants, the Ketos, founded the Krath and handed her system to the dark side she died keeping out.',
    sources: ['Tales of the Jedi: Golden Age of the Sith', 'Tales of the Jedi: The Fall of the Sith Empire'], tags: ['republic', 'commander']
  },
  {
    id: 'jori-daragon', name: 'Jori Daragon', aka: [], alignment: 'neutral',
    species: 'Human', eras: ['era-ghw'], born: null, died: null,
    blurb: 'Hyperspace explorer whose accidental jump to Korriban triggered the Great Hyperspace War — and whose warning saved the Republic.',
    bio: 'Jori and her brother Gav were failing freelance hyperspace scouts who gambled on a blind jump and landed in the middle of Marka Ragnos’s funeral. Held as spies, they became Sadow’s pretext and unwitting guides — Gav as a groomed weapon, Jori as the one who escaped. Her stolen run back to Cinnagar with a Sith tracker aboard gave the Republic its only warning, and Empress Teta believed her. Gav died in the war he was used to start; Jori’s name became shorthand for how thin the wall between eras really is: one navigator’s guess.',
    sources: ['Tales of the Jedi: Golden Age of the Sith'], tags: ['explorer', 'catalyst']
  },

  /* ── Great Sith War era ──────────────────────────────────────── */
  {
    id: 'freedon-nadd', name: 'Freedon Nadd', aka: [], alignment: 'sith',
    species: 'Human', eras: ['era-ghw'], born: null, died: -4350, approx: true, diedAt: 'onderon',
    deathNote: 'Died around 4350 BBY after decades ruling Onderon; his empowered tomb made his ghost more dangerous than his life.',
    blurb: 'The Jedi student who robbed Naga Sadow’s grave, took Onderon, and spent four thousand years as its haunting.',
    bio: 'A brilliant Jedi student denied knighthood, Nadd killed his master and followed dark whispers to Yavin 4, where he roused Naga Sadow from stasis, drained him of the old Empire’s secrets, and destroyed him. He seized Onderon around 4400 BBY and folded Sith teaching into its monarchy so thoroughly that his tomb powered cults for millennia — the Naddists, the Ketos’ tutoring, and finally Exar Kun, whom his ghost personally steered to Korriban before Kun consumed him. Nadd is the atlas’s clearest demonstration that a Sith’s afterlife can out-achieve his reign.',
    sources: ['Tales of the Jedi: Freedon Nadd Uprising', 'Tales of the Jedi'], tags: ['dark lord', 'ghost', 'onderon']
  },
  {
    id: 'exar-kun', name: 'Exar Kun', aka: ['Dark Lord of the Sith'], alignment: 'sith',
    species: 'Human', eras: ['era-gsw'], born: -4025, approx: true, died: -3996, diedAt: 'yavin4',
    deathNote: 'His body was consumed on Yavin 4 in 3996 BBY when he drained the Massassi to escape the Jedi wall of light; his spirit stayed bound in the temples until Luke’s students destroyed it in 11 ABY.',
    blurb: 'Vodo-Siosk Baas’s proudest student, anointed Dark Lord by ancient ghosts — the man who burned Ossus.',
    bio: 'Exar Kun’s fall ran on curiosity and vanity in equal parts: forbidden holocrons, Freedon Nadd’s tomb, Korriban’s ghosts, and finally Yavin 4, where he enslaved the Massassi and built a power base out of Sadow’s leftovers. Crowned Dark Lord by the assembled spirits of the ancient Sith in 3997 BBY — with Ulic Qel-Droma pressed on him as apprentice — he split the Jedi with a corrupting holocron, murdered his own master in the Senate chamber, and covered his retreat from Ossus by detonating the Cron Cluster. The Jedi armada’s wall of light sealed his spirit in his own temples, where it waited four thousand years to menace Luke Skywalker’s first class.',
    sources: ['Tales of the Jedi: Dark Lords of the Sith', 'Tales of the Jedi: The Sith War', 'The Jedi Academy Trilogy'], tags: ['dark lord', 'fallen jedi']
  },
  {
    id: 'ulic-qel-droma', name: 'Ulic Qel-Droma', aka: [], alignment: 'gray',
    species: 'Human', eras: ['era-gsw'], born: -4024, approx: true, died: -3986,
    deathNote: 'Shot in the back by the spacer Hoggon on Rhen Var in 3986 BBY, blind to the Force and newly redeemed; he became one with the Force anyway.',
    blurb: 'The Jedi who tried to infiltrate the dark side and was swallowed — Kun’s apprentice, Coruscant’s bombardier, and the war’s longest penance.',
    bio: 'Arca Jeth’s finest student proposed the classic doomed plan: infiltrate the Krath and break them from inside. Poisoned, seduced, and promoted, Ulic became Exar Kun’s Sith apprentice and led the war machine against the Republic — until, at his captured trial, he was rescued by Kun, watched his master kill Vodo-Siosk Baas, and later struck down his own brother Cay in battle. Nomi Sunrider’s answer was the harshest mercy in Jedi law: she severed him from the Force entirely. Blind, he still led the Jedi to Kun’s door. He spent a decade wandering, taught Vima Sunrider as a Force-blind master, and was murdered by a nobody for the fame of it.',
    sources: ['Tales of the Jedi: Dark Lords of the Sith', 'Tales of the Jedi: Redemption'], tags: ['fallen jedi', 'redeemed']
  },
  {
    id: 'cay-qel-droma', name: 'Cay Qel-Droma', aka: [], alignment: 'jedi',
    species: 'Human', eras: ['era-gsw'], born: null, died: -3996,
    deathNote: 'Struck down by his brother Ulic in a duel during the Battle of the Cron Drift in 3996 BBY — still forgiving him as he died.',
    blurb: 'Ulic’s loyal brother, a cheerful mechanic-Jedi with a droid arm — killed by the person he refused to give up on.',
    bio: 'Cay fought the whole Great Sith War with one goal that wasn’t on any map: retrieving his brother. He followed Ulic into the Krath’s territory, dragged him from wrecks, forgave every escalation, and finally met him blade-to-blade during the Krath’s last fleet action. Ulic killed him in a rage and understood, holding the body, exactly what he had become — grief that Nomi Sunrider’s severing then made permanent. Cay’s death is the war’s moral pivot, and the reason its ending is a trial instead of a triumph.',
    sources: ['Tales of the Jedi: The Sith War'], tags: ['brother', 'loyalty']
  },
  {
    id: 'nomi-sunrider', name: 'Nomi Sunrider', aka: [], alignment: 'jedi',
    species: 'Human', eras: ['era-gsw'], born: null, died: null,
    blurb: 'Widow, battle-meditation master, and the Jedi who did the unthinkable — cutting Ulic off from the Force.',
    bio: 'Nomi came to the Force over her murdered husband’s lightsaber and rose, within a decade, to the war’s moral and strategic center: her battle meditation turned fleets, and her judgment turned the war. At the Cron Drift, over Cay’s body, she reached for a technique the Order barely admits exists and severed Ulic from the Force — winning the war in one act and carrying the cost of it forever. She led the assault on Yavin 4, helped raise the wall of light, and later headed the reconvened Jedi assembly. Her line runs forward: her daughter Vima was redeemed Ulic’s last student.',
    sources: ['Tales of the Jedi', 'Tales of the Jedi: Redemption'], tags: ['battle meditation', 'grand master']
  },
  {
    id: 'vodo-siosk-baas', name: 'Vodo-Siosk Baas', aka: [], alignment: 'jedi',
    species: 'Krevaaki', eras: ['era-gsw'], born: null, died: -3996, diedAt: 'coruscant',
    deathNote: 'Killed by his own student Exar Kun in the Senate chamber on Coruscant in 3996 BBY, dueling him with a wooden staff.',
    blurb: 'Krevaaki master whose greatest student became the Dark Lord — and who faced him armed with a stick and a lesson.',
    bio: 'Vodo-Siosk Baas taught with a carved quarterstaff and a patience his student Exar Kun mistook for weakness. He foresaw Kun’s trajectory and failed to stop it — the atlas’s recurring teacher’s tragedy — then interposed himself one last time when Kun crashed Ulic’s trial on Coruscant. The duel in the Senate chamber, staff against lightsaber in front of the galaxy’s cameras, ended the only way it could; what it bought was witness. His holocron survived him, turning up millennia later still trying to talk students out of the dark.',
    sources: ['Tales of the Jedi: Dark Lords of the Sith', 'Tales of the Jedi: The Sith War'], tags: ['master', 'holocron']
  },
  {
    id: 'arca-jeth', name: 'Arca Jeth', aka: [], alignment: 'jedi',
    species: 'Arkanian', eras: ['era-gsw'], born: null, died: -3997,
    deathNote: 'Killed by Krath war droids during the Conclave at Deneba in 3997 BBY, dying in Ulic’s arms.',
    blurb: 'Watchman of Onderon who broke the Naddist cults — and whose death sent Ulic down the infiltration road.',
    bio: 'Master of the Qel-Droma brothers and Jedi Watchman of the Onderon system, Arca Jeth spent his last years lancing Freedon Nadd’s four-thousand-year infection: the Beast Wars, the Naddist Uprising, and the re-entombment of Nadd on Dxun were his campaign. He was killed at the great Jedi conclave on Deneba when Krath droids dropped from orbit — and his death in Ulic’s arms supplied the grief that made Ulic’s doomed infiltration plan feel like duty. Teacher of the war’s hero and casualty of its opening move.',
    sources: ['Tales of the Jedi', 'Tales of the Jedi: Dark Lords of the Sith'], tags: ['watchman', 'master']
  },
  {
    id: 'satal-keto', name: 'Satal Keto', aka: [], alignment: 'sith',
    species: 'Human', eras: ['era-gsw'], born: null, died: -3996, diedAt: 'koros-major',
    deathNote: 'Killed by Ulic Qel-Droma in 3996 BBY — revenge for the poison that had helped drag Ulic down.',
    blurb: 'Co-founder of the Krath: the bored aristocrat who industrialized dabbling in the dark side.',
    bio: 'Heir to the Empress Teta system, Satal Keto stole a Sith spellbook from a Coruscant museum as a lark, had it translated on Onderon amid the Naddist rising, and came home with his cousin Aleema to murder their family and rule as the Krath. He poisoned Ulic Qel-Droma with a Sith toxin during the Jedi’s infiltration — accelerating exactly the corruption Ulic was pretending to have. When Ulic took over the Krath, killing Satal was his first act as the thing Satal had made him.',
    sources: ['Tales of the Jedi: Dark Lords of the Sith'], tags: ['krath', 'aristocrat']
  },
  {
    id: 'aleema-keto', name: 'Aleema Keto', aka: [], alignment: 'sith',
    species: 'Human', eras: ['era-gsw'], born: null, died: -3996,
    deathNote: 'Killed in 3996 BBY when the ancient Sith warship she commanded tore a star apart at the Cron Cluster — a trap arranged by Kun and Ulic.',
    blurb: 'The Krath’s illusionist queen, handed a doomsday ship as an execution.',
    bio: 'The subtler Keto, Aleema ran the Krath’s sorcery — Sith illusions strong enough to rout fleets — and its intrigues, keeping Ulic as consort and hostage in equal measure. Her ambition outlived its usefulness: after she betrayed Ulic at Coruscant, Kun and Ulic gave her the “honor” of commanding Naga Sadow’s ancient flagship at the Cron Cluster, without mentioning what its stellar-detonation weapon did to its wielder. The blast that killed her also burned Ossus — the war’s cruelest twofer.',
    sources: ['Tales of the Jedi: Dark Lords of the Sith', 'Tales of the Jedi: The Sith War'], tags: ['krath', 'illusionist']
  },
  {
    id: 'mandalore-indomitable', name: 'Mandalore the Indomitable', aka: [], alignment: 'gray',
    species: 'Taung', eras: ['era-gsw'], born: null, died: -3996, diedAt: 'dxun',
    deathNote: 'Shot down over Dxun in 3996 BBY and killed by the jungle’s predators; the warriors who found his mask chose the next Mandalore.',
    blurb: 'The Taung warlord who bet the clans on Ulic Qel-Droma and lost everything but the mask.',
    bio: 'Mandalore the Indomitable led the Crusaders by the old law — rule goes to whoever can take it — and when Ulic Qel-Droma beat him in single combat on Kuar, he kept his word and put the clans at a Sith’s service. He fought the Great Sith War’s biggest set-pieces, took over the Krath war machine after Aleema’s death, and died the most Mandalorian death available: shot down over Dxun and eaten by the moon. The mask his scouts recovered crowned Mandalore the Ultimate, who would spend the next generation preparing a war of revenge.',
    sources: ['Tales of the Jedi: The Sith War'], tags: ['mandalore', 'crusaders']
  },

  /* ── KOTOR era ───────────────────────────────────────────────── */
  {
    id: 'revan', name: 'Revan', aka: ['Darth Revan', 'The Revanchist', 'Prodigal Knight'], alignment: 'gray',
    species: 'Human', eras: ['era-mw', 'era-jcw', 'era-ggw'], born: -3994, approx: true, died: -3637, approx2: true,
    deathNote: 'Endured three centuries of imprisonment by the Sith Emperor; after the Foundry campaign in 3641 BBY he finally found peace years later — one of the strangest death-dates in the atlas.',
    blurb: 'Jedi crusader, Dark Lord, mind-wiped redeemer, and prisoner of the true Sith — the era that bears his name can’t decide if he saved the Republic or broke it.',
    bio: 'Revan led the Jedi who defied the Council into the Mandalorian Wars and won at Malachor V by means the Council feared more than defeat. Chasing the war’s hidden authors into the Unknown Regions, he and Malak found the Sith Emperor — who broke them into his vanguard. As Darth Revan he built an empire on the Star Forge until Malak’s betrayal and a Jedi boarding party left him mind-wiped; rebuilt as a blank-slate padawan, he retraced his own conspiracy, redeemed Bastila Shan, killed Malak, and destroyed the Forge. He flew back into the dark to finish the real war and lost: three hundred years a prisoner, a brief broken rampage at the Foundry, and at last, peace. Both Sith and Jedi still claim the parts of him they like.',
    sources: ['Knights of the Old Republic (2003)', 'The Old Republic: Revan'], tags: ['dark lord', 'redeemed', 'revanchist']
  },
  {
    id: 'malak', name: 'Darth Malak', aka: ['Alek', 'Squint'], alignment: 'sith',
    species: 'Human', eras: ['era-mw', 'era-jcw'], born: -3994, approx: true, died: -3956, diedAt: 'lehon',
    deathNote: 'Killed by the redeemed Revan aboard the Star Forge at the Battle of Rakata Prime in 3956 BBY.',
    blurb: 'Revan’s friend, apprentice, and executioner-by-ambush — the Dark Lord as blunt instrument.',
    bio: 'Alek of Quelii followed Revan into the Mandalorian Wars as his truest believer and into the dark as his first convert. Where Revan ruled by design, Malak — jaw taken by his master’s blade, voice replaced by a vocabulator — understood only escalation: he fired on Revan’s flagship mid-battle to steal the empire, glassed Taris to kill one fugitive, and razed the Dantooine enclave to end the Jedi’s ability to make more Revans. The Star Forge fed his fleet and his hunger equally. He died at his master’s feet, asking, honestly, whether he could have come back too.',
    sources: ['Knights of the Old Republic (2003)'], tags: ['dark lord', 'apprentice']
  },
  {
    id: 'bastila-shan', name: 'Bastila Shan', aka: [], alignment: 'jedi',
    species: 'Human', eras: ['era-jcw'], born: -3976, died: null,
    blurb: 'The Order’s battle-meditation prodigy, bonded to the enemy she captured — briefly his successor, finally his wife.',
    bio: 'Bastila’s battle meditation made her the Republic’s single most valuable asset in the Jedi Civil War, and her boarding of Revan’s flagship — catching his broken mind as Malak’s guns tore the ship apart — created the bond the whole era turns on. She shepherded the amnesiac Revan, was captured and broken by Malak into his apprentice, and was pulled back at the Star Forge’s heart by the man she’d saved. She married Revan, raised their son Vaner through his disappearance, and her blood carried the Shan line to Grand Master Satele three centuries on.',
    sources: ['Knights of the Old Republic (2003)', 'The Old Republic: Revan'], tags: ['battle meditation', 'bond']
  },
  {
    id: 'kreia', name: 'Kreia', aka: ['Darth Traya', 'Lady of Betrayal'], alignment: 'gray',
    species: 'Human', eras: ['era-jcw'], born: null, died: -3951, diedAt: 'malachor',
    deathNote: 'Defeated by Meetra Surik in the Trayus Core in 3951 BBY; she died prophesying, which is exactly how she wanted it.',
    blurb: 'Jedi historian, Revan’s first teacher, Dark Lord of Betrayal — the atlas’s in-house critic of the Force itself.',
    bio: 'Kreia taught Revan first — a fact the Order preferred forgotten when her students kept falling — and followed his trail to Malachor V, where the Trayus Academy made her Darth Traya. Cast down by her own apprentices Nihilus and Sion, she attached herself to the exiled Meetra Surik, the one being in the galaxy who had chosen to live severed from the Force. Everything she did — the manipulations, the lessons, the cruelties — served a heretic’s thesis: that the Force is a god playing dice with living beings, and that Surik’s wound proved it could be refused. She arranged her own death at her student’s hands as a final argument.',
    sources: ['Knights of the Old Republic II'], tags: ['dark lord', 'philosopher', 'traya']
  },
  {
    id: 'darth-nihilus', name: 'Darth Nihilus', aka: ['Lord of Hunger'], alignment: 'sith',
    species: 'Human (formerly)', eras: ['era-jcw'], born: null, died: -3951, diedAt: 'telos',
    deathNote: 'Cut down aboard the Ravager above Telos IV in 3951 BBY by Meetra Surik, Visas Marr, and Mandalore — starved weak by a world that wasn’t the feast he was promised.',
    blurb: 'A survivor of Malachor V hollowed into pure appetite — the wound in the Force given a mask and a flagship.',
    bio: 'Nihilus lost everything at Malachor V except existence: the wound left him a hunger wearing armor, devouring Force and life to hold himself together. Darth Traya found him at Trayus and gave the hunger doctrine; he repaid her by helping Sion cast her down, then took the Purge in his own direction — not killing Jedi but eating them, with the world of Katarr as his monument. His speech survives only as scream-static; his needs had stopped being translatable. He was lured to restored Telos by the promise of Jedi and found the trap too late to matter.',
    sources: ['Knights of the Old Republic II'], tags: ['wound', 'hunger', 'triumvirate']
  },
  {
    id: 'darth-sion', name: 'Darth Sion', aka: ['Lord of Pain'], alignment: 'sith',
    species: 'Human', eras: ['era-gsw', 'era-jcw'], born: null, died: -3951, diedAt: 'malachor',
    deathNote: 'Let go of the pain holding his body together in the Trayus Core in 3951 BBY, persuaded by Meetra Surik that Traya had never valued him.',
    blurb: 'A corpse held together by hatred since Exar Kun’s war — immortal so long as it hurt.',
    bio: 'Sion fought as a Sith Marauder in the Great Sith War and should have died there; instead he learned to knit his shattered body together with pain, becoming unkillable in the least enviable way. At Trayus he was Traya’s blunt student and first betrayer, and through the Purge he was the blade to Nihilus’s maw — the one who broke Jedi rather than devoured them. His obsession with Meetra Surik was half predation, half envy: she had walked away from the Force and lived. She beat him by conceding the duel’s premise — he could not lose — and asking why he wanted to keep paying for it.',
    sources: ['Knights of the Old Republic II'], tags: ['pain', 'immortal', 'triumvirate']
  },
  {
    id: 'meetra-surik', name: 'Meetra Surik', aka: ['The Jedi Exile'], alignment: 'jedi',
    species: 'Human', eras: ['era-mw', 'era-jcw'], born: -3983, approx: true, died: -3950, diedAt: 'dromund-kaas',
    deathNote: 'Assassinated by Lord Scourge on Dromund Kaas in 3950 BBY, mid-strike against the Sith Emperor; her ghost stayed three centuries to finish the job.',
    blurb: 'The general who triggered the Mass Shadow Generator, was exiled for surviving it — and rebuilt the Jedi from a wound.',
    bio: 'Revan’s general at Malachor V gave the order that won the war and tore the Force; where everyone else at the epicenter died or hollowed, Surik survived by severing herself — becoming the “wound that walks.” Exiled by the Council, she returned in 3951 BBY to a murdered Order, gathered the broken (Atton, Visas, the last masters’ students), and killed the Triumvirate in a year: Nihilus starved, Sion talked down, Traya faced in the Trayus Core. Then she followed Revan into the Emperor’s dark and died there — and refused to leave, her spirit guarding Revan’s cell for three hundred years.',
    sources: ['Knights of the Old Republic II', 'The Old Republic: Revan'], tags: ['exile', 'general', 'wound']
  },
  {
    id: 'mandalore-ultimate', name: 'Mandalore the Ultimate', aka: [], alignment: 'gray',
    species: 'Taung', eras: ['era-mw'], born: null, died: -3960, diedAt: 'malachor',
    deathNote: 'Killed by Revan in single combat at Malachor V in 3960 BBY; dying, he revealed the Sith had goaded the clans to war.',
    blurb: 'Last Taung to wear the mask — rebuilt the clans as Neo-Crusaders and spent them against the Republic in one great throw.',
    bio: 'Taking the mask from Dxun’s jungle after the Indomitable’s death, Mandalore the Ultimate spent decades forging the scattered clans into the Neo-Crusaders: standardized armor, mass recruitment across species, total war as culture. Sith emissaries fanned his crusade toward the Republic — a manipulation he only named with his dying breath, to Revan, at Malachor V. His death ended the Taung line of Mandalores and, via Revan’s hiding of the mask, decapitated the clans for a decade. He got the war he wanted; the galaxy got Revan.',
    sources: ['Knights of the Old Republic II', 'The Old Republic: Revan'], tags: ['mandalore', 'neo-crusaders']
  },
  {
    id: 'canderous-ordo', name: 'Canderous Ordo', aka: ['Mandalore the Preserver'], alignment: 'gray',
    species: 'Human (Mandalorian)', eras: ['era-mw', 'era-jcw'], born: -4014, approx: true, died: null,
    blurb: 'Neo-Crusader veteran turned Revan’s companion — who took up the mask to rebuild the clans as their Preserver.',
    bio: 'A clan Ordo veteran of the Mandalorian Wars reduced to exchange-guild muscle on Taris, Canderous attached himself to the amnesiac Revan and fought through the Jedi Civil War at his side — the rare Mandalorian campaign story with a redemption arc. Revan later pointed him at the hidden mask of Mandalore; as Mandalore the Preserver he regathered the clans on Dxun, fought beside Meetra Surik at Onderon and Telos, and set the culture’s course away from being anyone’s hired catastrophe. The clans’ history books call the era a rebirth.',
    sources: ['Knights of the Old Republic (2003)', 'Knights of the Old Republic II'], tags: ['mandalore', 'companion']
  },
  {
    id: 'carth-onasi', name: 'Carth Onasi', aka: [], alignment: 'neutral',
    species: 'Human', eras: ['era-jcw'], born: -3994, approx: true, died: null,
    blurb: 'Republic soldier with a genius for surviving betrayals — Saul Karath’s protégé, then his judge.',
    bio: 'Telos was Carth’s homeworld, and its bombardment — ordered by his own mentor Saul Karath — made him the Jedi Civil War’s conscience-with-a-blaster. He crash-landed on Taris with the amnesiac Revan, flew every leg of the Star Map hunt, and heard Karath’s deathbed revelation of who Revan really was. Staying loyal anyway was his defining choice. He rose to admiral, anchored the Republic’s recovery through the Dark Wars, and spent years quietly keeping a promise to a woman who flew into the Unknown Regions and never came back.',
    sources: ['Knights of the Old Republic (2003)', 'Knights of the Old Republic II'], tags: ['republic', 'companion']
  },
  {
    id: 'jolee-bindo', name: 'Jolee Bindo', aka: [], alignment: 'gray',
    species: 'Human', eras: ['era-gsw', 'era-jcw'], born: -4077, approx: true, died: null,
    blurb: 'The hermit of Kashyyyk’s Shadowlands — a “gray Jedi” whose love story was the Order’s cautionary tale.',
    bio: 'Jolee’s wife, whom he trained against the rules, fell in the Exar Kun war and he could not strike her down; the Council’s pardon offended him more than punishment would have, so he left. Decades of smuggling and hermitage later, he stepped out of Kashyyyk’s undergrowth into Revan’s crew, dispensing war stories with morals hidden in the rambling. He knew who Revan was before anyone said it, and stayed. His heresy — that love is not the danger, losing yourself is — reads, from six thousand years of atlas, like the sanest doctrine on file.',
    sources: ['Knights of the Old Republic (2003)'], tags: ['gray jedi', 'hermit']
  },
  {
    id: 'hk-47', name: 'HK-47', aka: [], alignment: 'sith',
    species: 'Assassin droid', eras: ['era-jcw', 'era-ggw'], born: -3960, approx: true, died: null,
    blurb: 'Revan’s handmade assassin droid — “meatbags” its coinage — still killing on schedule three centuries later.',
    bio: 'Statement: HK-47 was built by Darth Revan as a Jedi-killing assassin protocol droid, and regards this as the highest expression of craftsmanship. Lost, resold, and reacquired by the amnesiac Revan on Tatooine, it served through the Star Forge campaign with lethal cheer, later helped Meetra Surik hunt its own mass-produced HK-50 knockoffs, and survived its maker by centuries — turning up in the Foundry’s defense in 3641 BBY and in vaults beyond. The atlas keeps it as a control sample: one character whose alignment never drifts.',
    sources: ['Knights of the Old Republic (2003)', 'Knights of the Old Republic II', 'The Old Republic'], tags: ['droid', 'assassin']
  },
  {
    id: 'zhar-lestin', name: 'Zhar Lestin', aka: [], alignment: 'jedi',
    species: 'Twi’lek', eras: ['era-mw', 'era-jcw'], born: null, died: null,
    blurb: 'Twi’lek master of the Dantooine enclave — trained Revan twice: once as prodigy, once as amnesiac.',
    bio: 'Zhar sat on the Dantooine council that watched Revan grow from hungry prodigy into the Revanchist — he later admitted he had wanted to believe the hunger was destiny. When the broken Dark Lord was carried back to the enclave in 3957 BBY, Zhar argued for the gamble and personally retrained the blank-slate Revan as a padawan. He is the era’s working answer to whether a person is their memories or their pattern: his student fell, rose, and was, both times, recognizably the same man. He escaped Malak’s razing of the enclave; the archives lose him in the Purge.',
    sources: ['Knights of the Old Republic (2003)'], tags: ['master', 'enclave']
  },
  {
    id: 'vandar-tokare', name: 'Vandar Tokare', aka: [], alignment: 'jedi',
    species: 'Yoda’s species', eras: ['era-mw', 'era-jcw'], born: null, died: -3952, approx: true, diedAt: 'katarr',
    deathNote: 'Believed lost with the Jedi conclave when Nihilus consumed Katarr in 3952 BBY.',
    blurb: 'The small green master of Dantooine — Revan’s judge and sponsor, lost with Katarr.',
    bio: 'Master Vandar led the Dantooine enclave’s council through the era’s worst dilemmas: the Revanchist defiance, the mind-wipe gamble (his casting vote, by most accounts), and the scattering after Malak razed the enclave. Of Yoda’s inexplicable species, he carried the same trick of sounding gentle while ruling hard cases. He survived the Jedi Civil War only to organize the conclave at Katarr in 3952 BBY — the gathering meant to rebuild the Order that instead fed Darth Nihilus. His voice is the one the surviving masters kept quoting afterward.',
    sources: ['Knights of the Old Republic (2003)', 'Knights of the Old Republic II'], tags: ['master', 'council']
  },
  {
    id: 'vrook-lamar', name: 'Vrook Lamar', aka: [], alignment: 'jedi',
    species: 'Human', eras: ['era-mw', 'era-jcw'], born: null, died: -3951, diedAt: 'dantooine',
    deathNote: 'Drained of the Force by Darth Traya at the rebuilt Dantooine enclave in 3951 BBY, with Masters Kavar and Zez-Kai Ell.',
    blurb: 'The council’s permanent dissent — suspicious of Revan, of the Exile, of hope generally; right often enough to sting.',
    bio: 'Vrook voted against everything the era is famous for: against the Revanchists, against retraining Revan, against trusting Meetra Surik. His sourness was earned pattern-recognition — he had watched two generations of brilliant students burn — but it curdled into a policy of hiding, and the Purge hunted the hiders anyway. He survived on Dantooine posing as a settler, judged Surik one last time in the ruined enclave, and died there when Kreia arrived to demonstrate what the masters’ caution had actually protected them from: nothing.',
    sources: ['Knights of the Old Republic (2003)', 'Knights of the Old Republic II'], tags: ['council', 'skeptic']
  },
  {
    id: 'kavar', name: 'Kavar', aka: [], alignment: 'jedi',
    species: 'Human', eras: ['era-mw', 'era-jcw'], born: null, died: -3951, diedAt: 'dantooine',
    deathNote: 'Drained by Darth Traya at Dantooine in 3951 BBY, moments after the masters moved to sever Meetra Surik again.',
    blurb: 'The council’s soldier — Onderon’s hidden guardian, the master the Exile almost followed to war.',
    bio: 'A guardian by temperament in a council of scholars, Kavar was the master young Meetra Surik nearly emulated, and the one whose refusal to sanction the war she took hardest. Through the Purge he hid in plain sight at Iziz as Queen Talia’s advisor, playing kingmaker against General Vaklu’s Sith-backed coup. Reunited with Surik, he chose the council’s old answer one last time — cut the wound off from the Force — and Kreia, of all people, arrived as the objection. He died for underestimating exactly the kind of teacher he had been to no one.',
    sources: ['Knights of the Old Republic II'], tags: ['council', 'guardian']
  },
  {
    id: 'atris', name: 'Atris', aka: [], alignment: 'gray',
    species: 'Human (Echani)', eras: ['era-jcw'], born: null, died: null,
    blurb: 'The Order’s archivist-zealot, hoarding Sith holocrons in a polar vault — corrupted by the library she kept.',
    bio: 'Atris judged Meetra Surik’s exile more harshly than anyone — the fury of someone betrayed by her own ideal of what a Jedi was. After the Order fell she gathered its records (and its captured Sith holocrons) into Telos’s polar academy, styling herself the last keeper of the true way, while the whispering archive worked on her precisely because she believed herself immune. She leaked the conclave’s location, coveted the mantle of Traya, and was beaten — then spared — by the exile she had condemned. Her file is the atlas’s cleanest study of corruption without a single battlefield.',
    sources: ['Knights of the Old Republic II'], tags: ['archivist', 'fallen']
  },
  {
    id: 'atton-rand', name: 'Atton Rand', aka: ['Jaq'], alignment: 'gray',
    species: 'Human', eras: ['era-jcw'], born: null, died: null,
    blurb: 'Deserter, Jedi-breaker, sabacc-brain — the Purge era’s repentant everyman, retrained by the woman he was hiding from.',
    bio: 'Atton fought for Revan in the Mandalorian Wars and stayed for the Sith one — as an interrogator who broke Jedi, until a captured Jedi showed him the Force in himself and he killed her rather than be known. He buried it under years of freighter runs and pazaak played in his head to wall out telepaths. Conscripted into Meetra Surik’s orbit at Peragus, he lied his way through half the galaxy before she trained him anyway. His arc — atrocity, camouflage, unearned second chance taken seriously — is the Dark Wars in one person.',
    sources: ['Knights of the Old Republic II'], tags: ['companion', 'redeemed']
  },
  {
    id: 'visas-marr', name: 'Visas Marr', aka: [], alignment: 'gray',
    species: 'Miraluka', eras: ['era-jcw'], born: null, died: null,
    blurb: 'The last daughter of Katarr — kept as a trophy by the thing that ate her world, and the blade that helped end it.',
    bio: 'When Nihilus consumed Katarr in 3952 BBY, he left exactly one Miraluka alive — Visas Marr, taken aboard the Ravager as proof the feast had happened and bound to him as shadow and scout. Sent to take Meetra Surik, she knelt instead: the wound that walked was also the first thing her Force-sight had found beautiful since her world went dark. She guided the strike on the Ravager at Telos and faced her master with Surik and Mandalore, her sight the map to his heart. Afterward she went home to bury Katarr properly.',
    sources: ['Knights of the Old Republic II'], tags: ['miraluka', 'companion']
  },
  {
    id: 'bao-dur', name: 'Bao-Dur', aka: [], alignment: 'neutral',
    species: 'Zabrak', eras: ['era-mw', 'era-jcw'], born: null, died: null,
    blurb: 'The engineer of the Mass Shadow Generator — serving out a self-imposed sentence of repair.',
    bio: 'Bao-Dur built the weapon that ended the Mandalorian Wars: the Mass Shadow Generator that crushed two fleets into Malachor V when his general gave the word. The arm he lost there he replaced with an energy prosthetic; the guilt he kept as equipment too. He resurfaced at Meetra Surik’s side during the Dark Wars, rebuilding Telos’s shattered ecology — restoration as penance, engineering pointed the other way. It was his remote, left behind at Malachor, that armed the Generator’s final activation and let the planet die for good.',
    sources: ['Knights of the Old Republic II'], tags: ['engineer', 'malachor']
  },
  {
    id: 'darth-bandon', name: 'Darth Bandon', aka: [], alignment: 'sith',
    species: 'Human', eras: ['era-jcw'], born: null, died: -3956,
    deathNote: 'Killed by the amnesiac Revan during the Star Map hunt in 3956 BBY.',
    blurb: 'Malak’s Shadow Hand — the apprenticeship as dead-end job.',
    bio: 'A Jedi padawan who defected in the war’s first wave, Bandon rose to be Darth Malak’s Shadow Hand — the apprentice-of-record in an empire whose master had gotten the job by shooting his own. He led the boarding action that took Bastila’s strike team apart, hunted the Ebon Hawk’s crew across the Star Map worlds, and died mid-hunt at the hands of the amnesiac he was chasing. His file matters as taxonomy: the first entry in the pattern of Sith apprentices as consumables that Bane would later name as the system working correctly.',
    sources: ['Knights of the Old Republic (2003)'], tags: ['shadow hand', 'apprentice']
  },
  {
    id: 'uthar-wynn', name: 'Uthar Wynn', aka: [], alignment: 'sith',
    species: 'Human', eras: ['era-jcw'], born: null, died: -3956, diedAt: 'korriban',
    deathNote: 'Killed in the Korriban academy’s terminal intrigues in 3956 BBY, during the amnesiac Revan’s visit.',
    blurb: 'Headmaster of Revan’s Korriban academy — grading ambition on a curve that always killed.',
    bio: 'Master of the Sith academy at Dreshdae, Uthar Wynn ran admissions for Darth Malak’s empire: prestige for the hungry, tombs for the slow, and an annual “one worthy student” competition designed to teach betrayal as curriculum. He plotted against his own superior, his favorite student Yuthura plotted against him, and the amnesiac Revan — enrolled under a false name — walked the whole pyramid scheme into the ground. His academy did not survive him by much; the Sith Civil War ate faculty first.',
    sources: ['Knights of the Old Republic (2003)'], tags: ['academy', 'headmaster']
  },
  {
    id: 'saul-karath', name: 'Saul Karath', aka: [], alignment: 'neutral',
    species: 'Human', eras: ['era-jcw'], born: null, died: -3956,
    deathNote: 'Shot in the Leviathan’s bridge assault in 3956 BBY; died telling Carth the truth about Revan as revenge.',
    blurb: 'The Republic’s finest admiral, sold to the Sith with Telos as the receipt.',
    bio: 'Saul Karath had mentored half the Republic officer corps — Carth Onasi included — before he defected to Revan’s Sith, buying his admiralty with the bombardment of Telos IV. As commander of the Leviathan he was the fleet’s spine and the empire’s institutional memory: the officer who proved defection was survivable, and who kept proving it by hunting his former students. Captured mid-war by his old protégé’s boarding party, he spent his last breath weaponizing the truth — telling Carth exactly whom he had been traveling with.',
    sources: ['Knights of the Old Republic (2003)'], tags: ['admiral', 'traitor']
  },

  /* ── Great Galactic War era ──────────────────────────────────── */
  {
    id: 'vitiate', name: 'Vitiate', aka: ['Tenebrae', 'Sith Emperor', 'Valkorion', 'Lord of Medriaas'], alignment: 'sith',
    species: 'Sith pureblood (born human-Sith hybrid)', eras: ['era-ghw', 'era-jcw', 'era-ggw'], born: -5113, died: -3630, approx: true,
    deathNote: 'Struck down repeatedly — by the Hero of Tython in 3641 BBY among others — he body-hopped through vessels until his spirit was finally annihilated around 3630 BBY.',
    blurb: 'The immortal Sith Emperor: ate his homeworld at eight, ruled thirteen centuries, and regarded his own empire as kindling.',
    bio: 'Born Tenebrae on Medriaas, he held a dark lordship by ten and by 4999 BBY had lured eight thousand Sith Lords into a ritual that consumed every living thing on the planet — renamed Nathema, the galaxy’s only Force-dead void — in exchange for his immortality. He led the old Empire’s survivors to Dromund Kaas and ruled the reconstituted Sith Empire for 1,300 years as an absent god, breaking Revan and Malak into his vanguard and launching the Great Galactic War when the arithmetic favored it. His actual policy was hunger: the Empire existed to position a second, galaxy-scale Nathema ritual. It took the Republic’s and Empire’s combined champions decades — and several of his bodies — to end him.',
    sources: ['The Old Republic: Revan', 'The Old Republic', 'Knights of the Eternal Throne'], tags: ['emperor', 'immortal', 'void']
  },
  {
    id: 'darth-malgus', name: 'Darth Malgus', aka: ['Veradun', 'The False Emperor'], alignment: 'sith',
    species: 'Human', eras: ['era-ggw'], born: -3703, approx: true, died: -3636, approx2: true,
    deathNote: 'Presumed dead after his False Emperor coup was crushed in 3640 BBY — recovered and rebuilt by the Empire, he fought on decades more.',
    blurb: 'The Sith who burned the Jedi Temple — and later declared his own purified Empire against the Emperor he served.',
    bio: 'Malgus led from the front of every Great Galactic War meat-grinder — Alderaan’s bloodbath among them — and his masterpiece was the Sacking of Coruscant in 3653 BBY: his strike team annihilated the Jedi Temple while diplomats smiled on Alderaan. Peace disgusted him; he spent the Cold War arguing the Empire had gone soft, then acted on it, declaring a New Empire purged of Sith intrigue and alien prejudice in 3640 BBY with himself as emperor. Beaten and entombed in ice, he was too useful to stay dead: the Empire rebuilt him, and he was still killing Jedi a decade later — loyalty and heresy in the same scarred body.',
    sources: ['The Old Republic: Deceived', 'The Old Republic', 'Legacy of the Sith'], tags: ['warlord', 'sacking']
  },
  {
    id: 'satele-shan', name: 'Satele Shan', aka: [], alignment: 'jedi',
    species: 'Human', eras: ['era-ggw'], born: -3699, died: null,
    blurb: 'Bastila and Revan’s descendant — the youngest Grand Master, rebuilding the Order on Tython under a treaty she hated.',
    bio: 'Satele Shan fought the Great Galactic War from its first battle (Korriban’s fall, which she escaped carrying the warning) to its last day, and was named the Order’s youngest Grand Master in the ashes of the Treaty of Coruscant. She led the withdrawal to rediscovered Tython — the Order’s cradle — and rebuilt under cold-war rules she privately regarded as a countdown. Her bloodline runs straight down the atlas’s spine: Revan and Bastila’s line produced her, and her own hidden son, Theron, carried it on outside the Order. Decades later she was still teaching — in exile, to anyone left.',
    sources: ['The Old Republic', 'The Old Republic: Annihilation'], tags: ['grand master', 'shan line']
  },
  {
    id: 'darth-marr', name: 'Darth Marr', aka: [], alignment: 'sith',
    species: 'Human', eras: ['era-ggw'], born: -3702, approx: true, died: -3637,
    deathNote: 'Executed aboard the Eternal Fleet flagship in 3637 BBY for refusing to kneel to Valkorion — the Emperor he had served his whole life, finally seen clearly.',
    blurb: 'The Dark Council’s iron pragmatist — the Sith who chose the Empire over the Emperor.',
    bio: 'Masked, humorless, and incorruptible by Sith standards, Darth Marr held the Dark Council’s defense portfolio through the war, the treaty, and the collapse, becoming the Empire’s de facto spine as flashier lords self-destructed. His heresy was administrative: he concluded the Empire’s survival mattered more than its god, allied with the Republic against the returned Emperor’s hunger, and hunted Vitiate to the galaxy’s edge. Captured by the Eternal Empire and brought before Valkorion — Vitiate in a new crown — he declined, on principle, to kneel. The refusal killed him; his ghost continued to advise. The atlas files him under: Sith, best case.',
    sources: ['The Old Republic', 'Knights of the Fallen Empire'], tags: ['dark council', 'pragmatist']
  },
  {
    id: 'lord-scourge', name: 'Lord Scourge', aka: ['The Emperor’s Wrath'], alignment: 'sith',
    species: 'Sith pureblood', eras: ['era-jcw', 'era-ggw'], born: -3999, approx: true, died: null,
    blurb: 'The Emperor’s immortal executioner — who betrayed Revan, then spent three centuries plotting to finish Revan’s mission.',
    bio: 'Scourge helped capture Revan and Meetra Surik in 3950 BBY, and personally killed Surik mid-assassination attempt — a betrayal committed because a vision told him only a later champion could truly kill the Emperor. Vitiate rewarded him with the title Emperor’s Wrath and an immortality that severed every sense but memory: three hundred years unable to taste, feel, or forget. He defected the moment the vision’s champion existed, handing the Hero of Tython the Emperor’s secrets. The atlas keeps him beside Marr as the second flavor of loyal apostate: the Sith who betrayed everyone, consistently, for one fixed reason.',
    sources: ['The Old Republic: Revan', 'The Old Republic'], tags: ['wrath', 'immortal', 'traitor']
  },

  /* ── New Sith Wars ───────────────────────────────────────────── */
  {
    id: 'darth-ruin', name: 'Darth Ruin', aka: ['Phanius'], alignment: 'sith',
    species: 'Umbaran', eras: ['era-nsw'], born: null, died: -1990, approx: true,
    deathNote: 'Murdered by his own followers within a decade of founding the New Sith — establishing the era’s management style.',
    blurb: 'The Jedi Master whose “perfect solipsism” refounded the Sith in 2000 BBY — and got him promptly murdered.',
    bio: 'Phanius was one of the Order’s celebrated intellects and its most cited apostate: the Fourth Great Schism began when he simply walked out, taking dozens of like-minded Jedi, and returned as Darth Ruin. His philosophy held that only the self is real and other beings are furniture for the will — a doctrine his followers absorbed well enough to kill him with. The movement he lit outlived him by a thousand years as the New Sith Wars: not an empire but a contagion of warlords, each a small Ruin with a red blade.',
    sources: ['Book of Sith', 'The New Essential Chronology'], tags: ['schism', 'philosopher']
  },
  {
    id: 'belia-darzu', name: 'Belia Darzu', aka: [], alignment: 'sith',
    species: 'Shi’ido', eras: ['era-nsw'], born: null, died: -1230,
    deathNote: 'Assassinated in 1230 BBY by Mecrosa Order operatives — poison ending what armies could not.',
    blurb: 'Shapeshifting Dark Lady of the technobeasts — twenty years of nanite-plague warfare in the Sictis Wars.',
    bio: 'A Shi’ido changeling who rose through the New Sith chaos, Belia Darzu fused Sith alchemy with nanotechnology into mechu-deru vitae: a spore that rebuilt living victims into loyal machine-flesh technobeasts. Her Sictis Wars (1250–1230 BBY) made her the era’s defining horror — armies that grew by infecting the armies sent against them — until the Mecrosa assassins solved the problem at the top. Her hidden fortress on Tython, still cultivating spores, waited eight centuries to become a plot point in Darth Bane’s hunt for holocron lore.',
    sources: ['Darth Bane: Rule of Two', 'The New Essential Chronology'], tags: ['technobeasts', 'alchemy']
  },
  {
    id: 'skere-kaan', name: 'Skere Kaan', aka: ['Lord Kaan'], alignment: 'sith',
    species: 'Human', eras: ['era-nsw'], born: -1088, approx: true, died: -1000, diedAt: 'ruusan',
    deathNote: 'Died at the Seventh Battle of Ruusan in 1000 BBY, detonating the thought bomb Bane had fed him — annihilating himself and every Sith and Jedi nearby.',
    blurb: 'Ex-Jedi Master who unified the warlords as the Brotherhood of Darkness — “all are equal,” and all died together.',
    bio: 'A decorated Jedi Master who defected with his convictions intact, Kaan diagnosed the New Sith Wars correctly — the Sith lose to their own hierarchy — and prescribed heresy: a Brotherhood of Darkness where every lord was equal, ambition was suspended, and the war effort came first. It nearly worked; his Brotherhood reopened Korriban’s academy and drove the Jedi to militarize in mirror-image. But suppressed ambition curdles into delusion, and by Ruusan Kaan was holding his coalition together with charm, exhaustion, and increasingly unhinged certainty. Bane, his best product, fed him the thought bomb as a “weapon of victory.” Kaan used it exactly as designed.',
    sources: ['Darth Bane: Path of Destruction', 'Jedi vs. Sith'], tags: ['brotherhood', 'heretic']
  },
  {
    id: 'qordis', name: 'Qordis', aka: [], alignment: 'sith',
    species: 'Human', eras: ['era-nsw'], born: null, died: -1000, diedAt: 'korriban',
    deathNote: 'Killed by Darth Bane at the Korriban academy in 1000 BBY — his star student’s verdict on the Brotherhood’s teaching.',
    blurb: 'Headmaster of the Brotherhood’s Korriban academy — jeweled, political, and fatally mediocre at his one job.',
    bio: 'Qordis ran the reopened Korriban academy for Kaan’s Brotherhood, training the war’s Sith officer class amid incense and gold rings — a courtier’s idea of a Dark Lord. He recognized Bane’s raw power, elevated him, broke him with doctrine when he asked dangerous questions, and never understood that the questions were the talent. When Bane returned from the ancient tombs with the old Sith’s answer — two, not many — he settled accounts with the academy first. Qordis died as a syllabus does: superseded.',
    sources: ['Darth Bane: Path of Destruction'], tags: ['academy', 'headmaster']
  },
  {
    id: 'kasim', name: 'Kas’im', aka: ['Blademaster'], alignment: 'sith',
    species: 'Twi’lek', eras: ['era-nsw'], born: null, died: -1000, diedAt: 'lehon',
    deathNote: 'Killed on Lehon in 1000 BBY when Bane, cornered in a Rakatan temple, brought the building down on him.',
    blurb: 'The Brotherhood’s blademaster — the one teacher Bane respected, sent to kill him anyway.',
    bio: 'Kas’im taught every lightsaber form to every Brotherhood Sith from the Korriban academy’s dueling ring, a former slave whose blade had bought his freedom. Bane was his greatest student, and their bond was the academy’s one honest thing — which is why Kaan chose Kas’im as the assassin when Bane went heretic. He tracked Bane to the Rakatan ruins of Lehon and nearly won; Bane, unable to beat the blademaster’s two sabers, beat the architecture instead. Bane took the lesson permanently: never fight the duel your enemy has trained for.',
    sources: ['Darth Bane: Path of Destruction'], tags: ['blademaster', 'academy']
  },
  {
    id: 'githany', name: 'Githany', aka: [], alignment: 'sith',
    species: 'Human', eras: ['era-nsw'], born: null, died: -1000, diedAt: 'ruusan',
    deathNote: 'Died in the thought bomb’s detonation at Ruusan in 1000 BBY, fleeing a battle she had finally seen clearly.',
    blurb: 'Jedi deserter, academy schemer, Bane’s tutor-rival-poisoner — the Brotherhood’s ambition problem in one person.',
    bio: 'Githany defected from the Jedi mid-battle and arrived at Korriban already fluent in the academy’s real curriculum: leverage. She tutored the struggling Bane in secret — partly investment, partly cultivation of a weapon — and their alliance survived her later attempt to poison him, which he took as tuition. She was the Brotherhood’s best argument against itself: ambition suppressed by doctrine simply went underground and got better at chemistry. At Ruusan she read the end correctly and ran; the thought bomb’s radius was larger than her lead.',
    sources: ['Darth Bane: Path of Destruction'], tags: ['academy', 'schemer']
  },
  {
    id: 'lord-hoth', name: 'Lord Hoth', aka: [], alignment: 'jedi',
    species: 'Human', eras: ['era-nsw'], born: null, died: -1000, diedAt: 'ruusan',
    deathNote: 'Walked knowingly into the thought bomb’s detonation at Ruusan in 1000 BBY, with a hundred volunteers, to force Kaan to spend it.',
    blurb: 'General of the Army of Light — the Jedi as war-leader, ending the war by donating himself to the blast.',
    bio: 'Hoth led the Army of Light through the New Sith Wars’ endgame: a Jedi Lord in fact and title, commanding armies in an era when the Republic had none worth the name. Ruusan was his fixation — seven battles of attrition against Kaan’s Brotherhood — and its end was his calculation: knowing Kaan would trigger the thought bomb, he marched into the cave with a hundred volunteers so the detonation would consume the Brotherhood too. The Reformation that followed dissolved his rank, his army, and his precedent — a monument built by deleting everything he was.',
    sources: ['Darth Bane: Path of Destruction', 'Jedi vs. Sith'], tags: ['army of light', 'general']
  },
  {
    id: 'valenthyne-farfalla', name: 'Valenthyne Farfalla', aka: [], alignment: 'jedi',
    species: 'Half-Bothan', eras: ['era-nsw'], born: null, died: -990, diedAt: 'tython',
    deathNote: 'Killed with his strike team on Tython in 990 BBY by Darth Bane — the deaths that erased the Sith from the record.',
    blurb: 'Hoth’s foppish, golden-curled rival-lieutenant — who hunted the “last two Sith” and became their alibi.',
    bio: 'Farfalla arrived at Ruusan late, gorgeously dressed, and decisive — the relief force that saved the Army of Light’s remnant, after a feud with Hoth that nearly cost the war. After the Reformation he kept working the case the Order had closed: evidence that two Sith had walked away from the thought bomb. He was right. He tracked Bane and Zannah to Tython in 990 BBY with a handpicked team, and none of them returned; the Council filed the silence as confirmation the Sith were extinct. Being correct and becoming the proof of the opposite is the era’s bleakest epitaph.',
    sources: ['Darth Bane: Path of Destruction', 'Darth Bane: Rule of Two'], tags: ['jedi lord', 'hunter']
  },

  /* ── Rule of Two ─────────────────────────────────────────────── */
  {
    id: 'darth-bane', name: 'Darth Bane', aka: ['Dessel'], alignment: 'sith',
    species: 'Human', eras: ['era-nsw', 'era-rot'], born: -1026, died: -980, diedAt: 'ambria',
    deathNote: 'Killed by Darth Zannah in their final duel on Ambria in 980 BBY; his last-second essence transfer failed — probably.',
    blurb: 'The miner who ended the old Sith and founded the new: two, always two — and a thousand-year fuse.',
    bio: 'Dessel of Apatros — cortosis miner, murderer in self-defense, Brotherhood cadet — became the Korriban academy’s most dangerous student by treating doctrine as the enemy. The ancient sources (Revan’s holocron among them, looted from Lehon’s ruins) convinced him the Brotherhood was the Sith’s disease: power shared is power destroyed. So he arranged the cure — feeding Kaan the thought bomb, letting Ruusan consume every rival on both sides — and walked out of the era with a ten-year-old apprentice and a rule: one master to hold power, one apprentice to want it. He wore living orbalisk armor, out-dueled the Jedi who knew he existed, and died correctly by his own doctrine: at his apprentice’s hand, once she was ready.',
    sources: ['Darth Bane: Path of Destruction', 'Darth Bane: Rule of Two', 'Darth Bane: Dynasty of Evil'], tags: ['dark lord', 'rule of two', 'founder']
  },
  {
    id: 'darth-zannah', name: 'Darth Zannah', aka: ['Rain'], alignment: 'sith',
    species: 'Human', eras: ['era-nsw', 'era-rot'], born: -1010, died: null, approx: true,
    blurb: 'The child of Ruusan who became Bane’s apprentice — and, on Ambria, the Rule of Two’s first proof.',
    bio: 'Zannah was “Rain,” a Jedi-recruited child who fell at Ruusan and killed her first two Jedi as a ten-year-old with raw Force instinct. Bane took her as the Rule’s founding apprentice minutes after inventing it. Her specialization inverted his: where Bane was force, she mastered Sith sorcery — illusions that rot minds from inside — and patience so complete her master began to fear she lacked ambition. The fear was the test working. She challenged him at the correct moment, on Ambria in 980 BBY, countered his essence-transfer with sorcery, and took the mantle. Her occasionally twitching hand is the line’s founding ghost story.',
    sources: ['Darth Bane: Rule of Two', 'Darth Bane: Dynasty of Evil'], tags: ['sorcery', 'rule of two']
  },
  {
    id: 'darth-cognus', name: 'Darth Cognus', aka: ['The Huntress'], alignment: 'sith',
    species: 'Iktotchi', eras: ['era-rot'], born: null, died: null, approx: true,
    blurb: 'The precognitive Iktotchi assassin who served both sides of the Ambria duel — then carried the line forward.',
    bio: 'A contract killer whose Iktotchi precognition made her the era’s finest tracker, the Huntress was hired against Bane and impressed enough by the prey to petition for apprenticeship. She swore to whichever of master or apprentice survived Ambria — the Rule of Two treated as a job interview — and served Zannah faithfully before succeeding her. As Darth Cognus she made the line professional: mobile, patient, invisible. Her one recorded failure of judgment was her own apprentice, the three-eyed mystic Millennial, whose heresy she outlived. After her, the record goes silent on purpose.',
    sources: ['Darth Bane: Dynasty of Evil'], tags: ['assassin', 'precognition', 'rule of two']
  },
  {
    id: 'darth-millennial', name: 'Darth Millennial', aka: [], alignment: 'sith',
    species: 'Dathomiri human', eras: ['era-rot'], born: null, died: null, approx: true,
    blurb: 'Cognus’s three-eyed apprentice who rejected the Rule of Two and founded a dark church on Dromund Kaas.',
    bio: 'Born on Dathomir with a third eye and a mystic’s temperament, Millennial chafed against Banite doctrine — secrecy, austerity, murder-succession — and finally fled his master Cognus rather than complete the syllabus. He led followers to the storm-ruined old capital of Dromund Kaas around 950 BBY and founded the Prophets of the Dark Side: prophecy, ritual, and worship where Bane demanded silence. The heresy outlived the heretic by a millennium, surfacing at the Empire’s court as Palpatine’s seers. The atlas files him as proof that even a two-person order can have a schism.',
    sources: ['Darth Bane: Dynasty of Evil', 'The Dark Side Sourcebook'], tags: ['heretic', 'prophets']
  },
  {
    id: 'darth-vectivus', name: 'Darth Vectivus', aka: [], alignment: 'sith',
    species: 'Human', eras: ['era-rot'], born: null, died: null, approx: true,
    deathNote: 'Died of natural causes, at home, wealthy and unhunted — the line’s only recorded peaceful death.',
    blurb: 'The Sith Lord who did nothing wrong: made a fortune, studied the dark side, died in bed.',
    bio: 'Somewhere in the line’s unrecorded centuries sits Darth Vectivus, a businessman who found the dark side the way others find a mineral seam — his fortune came from an asteroid mine over a nexus of dark energy — and treated Sith mastery as a discipline rather than a grievance. He built a mansion in the mine, surrounded himself with family and Force phantoms, harmed no one history recorded, and died naturally. Lumiya later used his home and his example to argue the Sith need not be monsters — a sales pitch aimed at Jacen Solo. Whether Vectivus proves the pitch or just seasons it is left to the reader.',
    sources: ['Legacy of the Force: Betrayal'], tags: ['businessman', 'phantom']
  },
  {
    id: 'darth-tenebrous', name: 'Darth Tenebrous', aka: ['Rugess Nome'], alignment: 'sith',
    species: 'Bith', eras: ['era-rot'], born: null, died: -67, deathNote: 'Crushed by Plagueis under collapsing rock on Bal’demnic in 67 BBY — while running a scheme that outlived him by decades.',
    blurb: 'The Bith engineer-Sith who bred midi-chlorien schemes inside schemes — killed by the apprentice he designed.',
    bio: 'Publicly the celebrated starship designer Rugess Nome, privately Darth Tenebrous, he ran the line in its late style: corporations, bloodlines, and probability. He recruited the Muun banking prodigy Hego Damask — Plagueis — as apprentice while seeding contingencies against him, including a second secret apprentice and a retrovirus meant to bind the Force’s future to his own return. Plagueis dropped a cave on him at Bal’demnic before the contingencies matured. His deathbed vision — glimpsing the Chosen One who would end the line — is the Rule of Two’s built-in irony: every master dies mid-plan.',
    sources: ['Darth Plagueis'], tags: ['engineer', 'schemer']
  },
  {
    id: 'darth-plagueis', name: 'Darth Plagueis', aka: ['Hego Damask', 'Plagueis the Wise'], alignment: 'sith',
    species: 'Muun', eras: ['era-rot'], born: -147, approx: true, died: -32, deathNote: 'Smothered in his sleep by Darth Sidious in 32 BBY, on the eve of their shared triumph — the story Palpatine later told as a tragedy.',
    blurb: 'The banker who tried to buy out death itself — master of Sidious, maker of the Republic’s fall, murdered at intermission.',
    bio: 'As Hego Damask, he ran Damask Holdings and half the Republic’s discreet finance; as Darth Plagueis, he ran experiments on midi-chlorians, hunting the mechanism of life and death — by some tellings provoking the Force’s answer: a child conceived of no father. He recruited Palpatine of Naboo, and together they broke the Rule’s last taboo, planning to rule jointly and openly. Plagueis handled markets and biology; Sidious handled politics; only one of them believed the partnership. On the night of Palpatine’s chancellorship victory, the apprentice let the wine and the sleep do the positioning. The Wise could save others from death, the eulogy runs, but not himself.',
    sources: ['Darth Plagueis', 'Revenge of the Sith'], tags: ['banker', 'midi-chlorians']
  },
  {
    id: 'darth-sidious', name: 'Darth Sidious', aka: ['Palpatine', 'The Emperor', 'Emperor Reborn'], alignment: 'sith',
    species: 'Human', eras: ['era-rot', 'era-empire'], born: -84, died: 11, diedAt: 'onderon',
    deathNote: 'Thrown into the Death Star’s reactor by Vader in 4 ABY; returned in clone bodies until 11 ABY, when his spirit — denied a final host on Onderon — was dragged into the dark forever.',
    blurb: 'The Rule of Two’s payoff: senator, chancellor, Emperor — the Sith who won everything and could not stay dead.',
    bio: 'Palpatine of Naboo was Plagueis’s apprentice, murderer, and improvement: where the master studied power, Sidious simply was it — the finest political operator in the atlas, running the Republic’s destruction as its most trusted servant. He engineered the Naboo crisis, the Clone Wars, Order 66, and the Empire, ruling openly as the first Sith sovereign since Ruusan while collecting apprentices as instruments: Maul the weapon, Tyranus the manager, Vader the leash on the Chosen One. Endor’s death was an inconvenience — clones on Byss carried him to 11 ABY, war-machines and Force storms in hand, until Empire’s End left his spirit hostless above Onderon. The thousand-year plan worked; keeping the winnings did not.',
    sources: ['Darth Plagueis', 'The Prequel & Original Trilogies', 'Dark Empire', 'Empire’s End'], tags: ['emperor', 'politician', 'clone']
  },
  {
    id: 'darth-maul', name: 'Darth Maul', aka: [], alignment: 'sith',
    species: 'Dathomiri Zabrak', eras: ['era-rot', 'era-empire'], born: -54, died: -32, approx: true,
    deathNote: 'Bisected by Obi-Wan Kenobi at Naboo in 32 BBY and presumed dead — though stories of his survival persisted.',
    blurb: 'Sidious’s first blade: a weapon raised from childhood, spent in his first real duel.',
    bio: 'Taken from Dathomir and raised inside Sidious’s program as pure instrument — rage, discipline, and a double-bladed saber — Maul existed to be the Sith’s reveal: the red blade stepping out of a thousand years of shadow on Naboo in 32 BBY. He killed Qui-Gon Jinn and was cut in half by the padawan, which under the Rule of Two made him a successful proof of concept and an acceptable loss in the same stroke. Legends kept him officially dead and unofficially rumored — cults, doubles, and stories of a mad survivor in the deep systems. The atlas lists the bisection and lets the rumors stand as rumors.',
    sources: ['The Phantom Menace', 'Darth Plagueis'], tags: ['assassin', 'weapon']
  },
  {
    id: 'darth-tyranus', name: 'Darth Tyranus', aka: ['Count Dooku'], alignment: 'sith',
    species: 'Human', eras: ['era-rot', 'era-empire'], born: -102, died: -19, diedAt: 'coruscant',
    deathNote: 'Beheaded by Anakin Skywalker aboard the Invisible Hand in 19 BBY, at Palpatine’s smiling instruction — the trap he helped build, closing on him.',
    blurb: 'Yoda’s student, Qui-Gon’s master, the Republic’s aristocrat critic — recruited to run half of Sidious’s war.',
    bio: 'Count Dooku of Serenno left the Jedi Order with his reputation intact — an idealist repelled by Republic rot, in the public telling — and was already Sidious’s when the cameras stopped. As Tyranus he did the war’s administration: hired the clone template, marshaled the Separatists, ran the battles as theater to a script only his master had read fully. He believed himself the indispensable partner and next Emperor; he was scaffolding for the recruitment of the boy who beheaded him. His lineage is the atlas’s tightest knot: trained by Yoda, master of Qui-Gon, executed by Anakin — the light and dark lines braided into one man.',
    sources: ['Attack of the Clones', 'Revenge of the Sith', 'Darth Plagueis'], tags: ['count', 'separatist']
  },
  {
    id: 'darth-vader', name: 'Darth Vader', aka: ['Anakin Skywalker', 'The Chosen One'], alignment: 'sith',
    species: 'Human', eras: ['era-empire'], born: -41, died: 4, deathNote: 'Died at Endor in 4 ABY of wounds taken killing Sidious to save his son — the Chosen One’s prophecy fulfilled a generation late.',
    blurb: 'The Chosen One, conceived by the Force and claimed by the Sith — the armor the galaxy feared for twenty years.',
    bio: 'Anakin Skywalker — possibly the midi-chlorians’ answer to Plagueis’s meddling — was the Jedi’s prophesied Chosen One and Palpatine’s longest recruitment project. Order 66’s executor, the Temple’s butcher, and then, after Mustafar, a burned man rebuilt as the Empire’s black-armored enforcement: Vader spent two decades hunting Jedi and dissidents, unmatched and wholly owned. The prophecy resolved on a technicality of love — at Endor he chose his son over his master and threw Sidious down the reactor shaft, dying redeemed. He balanced the atlas’s longest ledger: the Banite line ended (first) at the hands of its own last weapon.',
    sources: ['The Prequel & Original Trilogies'], tags: ['chosen one', 'apprentice']
  },

  /* ── Jedi of the film era ────────────────────────────────────── */
  {
    id: 'yoda', name: 'Yoda', aka: ['Grand Master Yoda'], alignment: 'jedi',
    species: 'Unknown', eras: ['era-rot', 'era-empire'], born: -896, died: 4, deathNote: 'Died of age on Dagobah in 4 ABY, nine hundred years old, becoming one with the Force.',
    blurb: 'Nine centuries of the Order’s memory in one small master — who trained Dooku, failed to see Sidious, and taught the last hope anyway.',
    bio: 'Yoda trained Jedi for eight hundred years, Count Dooku and (partially) Luke Skywalker among them — the atlas’s longest personal bridge, with one end in the post-Ruusan Order and the other in its rebirth. He presided over the Order at its most institutional and most blind: the Sith operated inside his building for thirteen years. His war record ended in a failed duel with Sidious and a deliberate exile on Dagobah, converting himself from Grand Master to a hermit curriculum for one student. His final lesson list — patience, unlearning, luminous beings — is the light side’s distilled answer to everything else in this database.',
    sources: ['The Prequel & Original Trilogies'], tags: ['grand master']
  },
  {
    id: 'qui-gon', name: 'Qui-Gon Jinn', aka: [], alignment: 'jedi',
    species: 'Human', eras: ['era-rot'], born: -92, died: -32, deathNote: 'Killed by Darth Maul at Naboo in 32 BBY — and became the first of his era to learn to persist as a Force ghost.',
    blurb: 'Dooku’s student, the Order’s gentle heretic — who found the Chosen One and learned what death doesn’t end.',
    bio: 'Qui-Gon Jinn inherited his master Dooku’s independence without the bitterness: a maverick who answered to the living Force over the Council, collected strays, and staked his final mission on a slave boy from Tatooine he declared the Chosen One. Maul’s blade ended him at Naboo — the Sith’s formal reintroduction to history — but his real legacy was posthumous twice over: Obi-Wan trained Anakin because Qui-Gon asked, and the old orders’ lost art of persisting after death as a conscious Force ghost was recovered and taught, in Legends’ telling, through him. The whisper in Yoda’s exile had a name.',
    sources: ['The Phantom Menace', 'Revenge of the Sith'], tags: ['maverick', 'ghost']
  },
  {
    id: 'obi-wan', name: 'Obi-Wan Kenobi', aka: ['Ben Kenobi'], alignment: 'jedi',
    species: 'Human', eras: ['era-rot', 'era-empire'], born: -57, died: 0, deathNote: 'Let Vader’s blade fall aboard the Death Star in 0 BBY, becoming a Force ghost — “more powerful than you can possibly imagine.”',
    blurb: 'The padawan who halved Maul, the master who lost Anakin, the hermit who handed the Skywalkers their inheritance.',
    bio: 'Obi-Wan’s career brackets the Sith’s return: he killed Maul at Naboo as a padawan — the first Jedi to slay a Sith Lord in a millennium — and spent the Clone Wars as the Republic’s most reliable general while his own former padawan was groomed out from under him. After Mustafar, where he left Anakin burning, he kept a twenty-year vigil over the son on Tatooine. His death was a lesson plan: yielding to Vader on the Death Star to become the voice in Luke’s ear. The atlas notes the symmetry — the man who ended the Sith’s first duel-victory also trained the man who ended the Sith.',
    sources: ['The Prequel & Original Trilogies'], tags: ['general', 'hermit']
  },
  {
    id: 'mace-windu', name: 'Mace Windu', aka: [], alignment: 'jedi',
    species: 'Human', eras: ['era-rot'], born: -72, died: -19, diedAt: 'coruscant',
    deathNote: 'Maimed by Anakin’s intervention and blasted from Palpatine’s window in 19 BBY, the arrest that became the Sith’s alibi.',
    blurb: 'The Council’s hardest blade — inventor of Vaapad, wielder of the dark side’s edge in the light’s name.',
    bio: 'Master of the Order and its most formidable duelist, Mace Windu built Vaapad — a lightsaber form that channels the opponent’s darkness, and the practitioner’s — because he believed the coming war would not be won by serenity alone. He was nearly right. His arrest of Chancellor Palpatine in 19 BBY is the era’s hinge: Sidious beaten to the floor, the war one stroke from over, and Anakin’s choice — Windu’s hand, then Windu’s life — converting victory into Order 66’s pretext. The atlas files him as the light side’s last realist, defeated by exactly the attachment he’d warned the Council about.',
    sources: ['The Prequel Trilogy', 'Shatterpoint'], tags: ['council', 'vaapad']
  },
  {
    id: 'luke-skywalker', name: 'Luke Skywalker', aka: ['Grand Master Skywalker'], alignment: 'jedi',
    species: 'Human', eras: ['era-empire', 'era-legacy'], born: -19, died: null,
    blurb: 'The farm boy who redeemed Vader — then spent a century of Legends rebuilding the Jedi and fighting every revenant in this atlas.',
    bio: 'Luke’s original trilogy arc — Yavin, Dagobah, Endor, and the choice to throw away his blade rather than kill his father — ended the Banite line. Legends kept him working: he founded the praxeum on Yavin 4 in 11 ABY (over Exar Kun’s objections, literally), fell briefly to the reborn Emperor and clawed back, married the ex-assassin Mara Jade, lost her to his own nephew’s fall, and led the Order through the Vong war, Caedus, and exile. His New Jedi Order legalized attachment — his own family being the argument. His descendants (Kol, Cade) carry the atlas to its last page.',
    sources: ['The Original Trilogy', 'The Jedi Academy Trilogy', 'Legacy of the Force'], tags: ['grand master', 'skywalker']
  },

  /* ── Legacy era ──────────────────────────────────────────────── */
  {
    id: 'lumiya', name: 'Lumiya', aka: ['Shira Brie', 'Dark Lady of the Sith'], alignment: 'sith',
    species: 'Human (cyborg)', eras: ['era-empire', 'era-legacy'], born: -2, approx: true, died: 40,
    deathNote: 'Killed by Luke Skywalker in 40 ABY — for a murder she claimed, falsely, to have committed; the frame was her final manipulation.',
    blurb: 'Vader’s secret agent rebuilt as a cyborg Dark Lady — the bridge between the old Sith and Jacen Solo.',
    bio: 'Shira Brie was an Imperial deep-cover agent inserted into the Rebellion to destroy Luke Skywalker’s reputation; shot down by Luke himself, she was rebuilt as the cyborg Lumiya and trained in Sith arts by Vader’s circle. For decades she was the ember-keeper — apprentices tried and discarded — until she found the worthy one: Jacen Solo, whom she tutored through his conversion into Darth Caedus, selling him Vectivus’s theory of the benevolent Sith. She died as a chess sacrifice, goading Luke into an execution that would haunt him and shield her student. The old Sith’s last direct hand on the future.',
    sources: ['Marvel Star Wars (Legends)', 'Legacy of the Force'], tags: ['dark lady', 'cyborg']
  },
  {
    id: 'darth-caedus', name: 'Darth Caedus', aka: ['Jacen Solo'], alignment: 'sith',
    species: 'Human', eras: ['era-legacy'], born: 9, died: 41, deathNote: 'Killed by his twin sister Jaina in 41 ABY — mid-death choosing to warn his lover to save their daughter, the last flicker of Jacen.',
    blurb: 'Han and Leia’s son, the Order’s deepest student — who reasoned himself into the Sith to prevent a future only he had seen.',
    bio: 'Jacen Solo came back from five years of postwar Force-pilgrimage as the Order’s most sophisticated mind, and Lumiya was waiting with a tailored argument: a vision of galactic ruin preventable only by a Sith willing to sacrifice everything, including being loved. His fall was a syllogism executed step by step — secret police, a strangled Mandalorian wife-to-be? no: his aunt Mara murdered, a war engineered — each atrocity filed as tuition. As Darth Caedus he ruled the Alliance he’d sworn to protect and was killed by his own twin, the one opponent who knew him too well to duel his reputation. Legends’ bleakest argument that the dark side’s best recruiter is consequentialism.',
    sources: ['Legacy of the Force'], tags: ['solo', 'fallen jedi']
  },
  {
    id: 'darth-krayt', name: 'Darth Krayt', aka: ['A’Sharad Hett'], alignment: 'sith',
    species: 'Human (Tusken-raised)', eras: ['era-legacy'], born: -26, approx: true, died: 137, deathNote: 'Killed by Darth Wyyrlok in 137 ABY, returned from stasis-death, and was finally slain by Cade Skywalker — his body burned to deny the One Sith a relic.',
    blurb: 'Tusken Jedi, Vong prisoner, and founder of the One Sith — who replaced the Rule of Two with an empire of one will.',
    bio: 'A’Sharad Hett was a Jedi raised among Tatooine’s Tuskens, a Clone Wars veteran who survived Order 66, dueled a young Obi-Wan, and was exiled beyond the Rim — where Yuuzhan Vong captivity and grafted living armor broke him into something new. On Korriban around 30 ABY, with Darth Bane’s holocron arguing against him in his hand, he refounded the Sith as the One Sith: many acolytes, one sovereign will, ambition abolished. A century of stasis-patience later he took the galaxy in three years — the Empire hijacked, Ossus massacred, the throne claimed in 130 ABY. He died arguing with his own doctrine: betrayed by his most loyal servant, then killed by a Skywalker who refused to stay retired.',
    sources: ['Star Wars: Legacy', 'Legacy — Vector'], tags: ['one sith', 'emperor']
  },
  {
    id: 'darth-wyyrlok', name: 'Darth Wyyrlok III', aka: [], alignment: 'sith',
    species: 'Chagrian', eras: ['era-legacy'], born: null, died: 137, deathNote: 'Killed by the resurrected Krayt in 137 ABY — the loyalist executed by the god he had preserved, betrayed, and replaced.',
    blurb: 'The One Sith’s loremaster and regent — who killed his dying god to preserve the religion.',
    bio: 'Third of his name in a Chagrian line of Krayt loyalists, Wyyrlok was the One Sith’s scholar-vizier: keeper of doctrine, manager of the Vong-graft sickness eating his master, and regent whenever Krayt slept in stasis. His betrayal was theological rather than ambitious — concluding that Krayt’s decaying obsession with his own survival endangered the One Sith’s mission, Wyyrlok entombed him and ruled in his name, the faith preserved by deleting its founder. Krayt’s return from death made the argument moot in the traditional way. The atlas files him beside Kaan: system-loyal Sith die of their systems too.',
    sources: ['Star Wars: Legacy'], tags: ['loremaster', 'regent']
  },
  {
    id: 'darth-talon', name: 'Darth Talon', aka: [], alignment: 'sith',
    species: 'Lethan Twi’lek', eras: ['era-legacy'], born: 110, approx: true, died: null,
    blurb: 'Krayt’s tattooed Hand — the One Sith ideal made flesh: no ambition, total function.',
    bio: 'Trained on Korriban from childhood and inked head to toe with Sith script by Krayt’s own hand, Talon was elevated to be one of his two Hands — extensions of the Emperor’s will outside the Council structure. She executed her own teacher as a graduation exercise, hunted Cade Skywalker across the era’s whole map, and served the One Sith’s doctrine so purely that the order’s collapse left her its most dangerous loose end. She is the inverse of every ambitious apprentice in this database — proof Krayt actually built what Bane said was impossible: a Sith who wants nothing for herself.',
    sources: ['Star Wars: Legacy'], tags: ['hand', 'enforcer']
  },
  {
    id: 'cade-skywalker', name: 'Cade Skywalker', aka: [], alignment: 'gray',
    species: 'Human', eras: ['era-legacy'], born: 116, approx: true, died: null,
    blurb: 'The last Skywalker of Legends: bounty hunter, addict, healer — dragged back to finish the family argument with the Sith.',
    bio: 'Cade watched his father Kol die covering the Ossus massacre in 130 ABY, deserted the Jedi, and spent seven years as a pirate-hunter with a death-stick habit and a unique, terrifying gift: he could pull the dying back — a healing that flirted with the dark side’s oldest project. Every ghost in the family tree (Luke included) nagged him back into the war. He burned Karness Muur’s talisman out of existence, refused three separate offers of Sith apprenticeship, and killed Darth Krayt — twice, the second time permanently — then cremated him from orbit. He declined, on the record, to become anyone’s symbol afterward.',
    sources: ['Star Wars: Legacy'], tags: ['skywalker', 'bounty hunter']
  },
  {
    id: 'kol-skywalker', name: 'Kol Skywalker', aka: [], alignment: 'jedi',
    species: 'Human', eras: ['era-legacy'], born: 82, approx: true, died: 130, diedAt: 'ossus',
    deathNote: 'Died holding the landing zone at the Ossus massacre in 130 ABY so the academy’s students could escape — his son watching.',
    blurb: 'Master of the Ossus academy and the Council’s voice in a collapsing century — the Skywalker who died buying time.',
    bio: 'Luke’s descendant and the Order’s leading master in the 120s ABY, Kol Skywalker ran the rebuilt Ossus academy and backed the Ossus Project — Vong-derived terraforming meant to heal war-ruined worlds — whose sabotage by the One Sith handed the Empire its pretext for war. When Krayt’s Sith hit Ossus in 130 ABY to open the Third Jedi Purge, Kol held the ground with a handful of masters so the younglings’ transports could lift. His death made his son Cade a deserter for seven years and an avenger at the end — the last generation of the atlas’s oldest surviving bloodline.',
    sources: ['Star Wars: Legacy'], tags: ['skywalker', 'master']
  }
];
