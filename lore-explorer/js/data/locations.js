/* Holocron data — locations. coords are galaxy-map positions (x,y in 0..100; Core ~center,
   Sith space upper-right/east, Unknown Regions left/west). */
window.HOLO_DATA = window.HOLO_DATA || {};

HOLO_DATA.locations = [
  {
    id: 'korriban', name: 'Korriban', region: 'Outer Rim — Sith Space (Esstran sector)',
    coords: { x: 79, y: 30 }, alignment: 'sith',
    blurb: 'Sith homeworld and necropolis — the Valley of the Dark Lords, and an academy that opens and closes like a wound across six millennia.',
    detail: 'Arid, red, and saturated with the dark side, Korriban is where the exiled Dark Jedi of 6900 BBY found the Sith species and made themselves gods. Its Valley of the Dark Lords holds the tombs of Ajunta Pall, Tulak Hord, Marka Ragnos, and Naga Sadow, each an active hazard rather than a monument. Whoever claims the Sith mantle eventually comes back here: Revan and Malak seeded their academy at Dreshdae, Vitiate’s Empire made its reconquest in 3681 BBY the opening shot of the Great Galactic War, the Brotherhood of Darkness ran its final academy here, and Darth Krayt founded the One Sith among the same tombs. Between occupations it belongs to the dead, who are not idle.',
    sources: ['Tales of the Jedi: Golden Age of the Sith', 'Knights of the Old Republic (2003)', 'Darth Bane: Path of Destruction', 'Star Wars: Legacy'],
    tags: ['tombs', 'academy', 'sith homeworld']
  },
  {
    id: 'ziost', name: 'Ziost', region: 'Outer Rim — Sith Space',
    coords: { x: 76, y: 26 }, alignment: 'sith',
    blurb: 'Frigid second capital of the old Sith Empire; seat of Dark Lords when Korriban was a graveyard.',
    detail: 'A cold forest world the exiles took alongside Korriban, Ziost grew into the administrative heart of the old Sith Empire — Korriban buried the Dark Lords, Ziost housed them. Marka Ragnos ruled from here; the reconstituted Empire of Vitiate held it as a fortress world through the Great Galactic War. Its final fate is the era’s grimmest footnote: in the years after the Galactic War, Vitiate consumed every living thing on the planet in a single ritual exhalation, leaving a monument to what the Sith Emperor actually was.',
    sources: ['Tales of the Jedi: Golden Age of the Sith', 'The Old Republic'],
    tags: ['sith capital']
  },
  {
    id: 'dromund-kaas', name: 'Dromund Kaas', region: 'Outer Rim — Sith Space (Dromund system)',
    coords: { x: 84, y: 23 }, alignment: 'sith',
    blurb: 'The hidden capital: a lightning-wracked jungle world where the defeated Sith rebuilt for 1,300 years.',
    detail: 'When the Republic’s holocaust scattered the old Empire in 5000 BBY, the fleet led by the sorcerer Vitiate wandered two decades before rediscovering this lost colony. From Kaas City, under a permanent dark-side storm the Emperor himself cultivated, the reconstituted Sith Empire built fleets, academies, and doctrine in absolute secrecy until 3681 BBY. Meetra Surik died here in 3950 BBY, assassinated mid-audience with the Emperor she came to kill; her ghost haunted the citadel for three centuries. Long after, the heretic Darth Millennial led his Prophets of the Dark Side to the same storm-lit ruins — the planet keeps being rediscovered by people the dark side wants kept.',
    sources: ['The Old Republic: Revan', 'The Old Republic', 'Book of Sith'],
    tags: ['sith capital', 'academy', 'hidden world']
  },
  {
    id: 'nathema', name: 'Nathema', region: 'Outer Rim — Sith Space (Chorlian sector)',
    coords: { x: 87, y: 28 }, alignment: 'sith',
    blurb: 'Once Medriaas, breadbasket of the old Empire — now a Void: the planet Vitiate ate.',
    detail: 'In 4999 BBY the young Sith lord Vitiate summoned eight thousand Sith to his homeworld, promising a ritual to break the Republic. Instead the ritual broke them: he devoured every participant, every colonist, every animal, insect, and microbe on the planet, converting a garden world into the galaxy’s only place with no Force at all. Standing on Nathema is described as being deaf, blind, and embalmed at once. It is the proof-of-concept for what the Sith Emperor intended for the entire galaxy, and the reason his own Dark Council eventually helped kill him.',
    sources: ['The Old Republic: Revan', 'Knights of the Fallen Empire'],
    tags: ['void', 'ritual site']
  },
  {
    id: 'coruscant', name: 'Coruscant', region: 'Core Worlds',
    coords: { x: 52, y: 44 }, alignment: 'neutral',
    blurb: 'The Republic’s capital — sacked by Sadow, bombarded by Ulic, seized by Vitiate, ruled by Palpatine and Krayt.',
    detail: 'Every Sith resurgence eventually aims here. Naga Sadow’s illusion-armada reached it in 5000 BBY; Ulic Qel-Droma bombarded it and stood trial in its Senate in 3996 BBY; the Jedi built their Temple here in 4019 BBY — knowingly capping a dark-side shrine — and lost it in the Sacking of 3653 BBY, when Malgus’s strike team leveled it as cover for a false peace. Palpatine ruled the galaxy from its throne for 23 years, and Darth Krayt took the same throne in 130 ABY. The lesson the tool draws across 6,000 years: possession of Coruscant is the scoreboard, never the game.',
    sources: ['Tales of the Jedi', 'The Old Republic: Deceived', 'Star Wars: Legacy'],
    tags: ['republic capital', 'jedi temple']
  },
  {
    id: 'tython', name: 'Tython', region: 'Deep Core',
    coords: { x: 49, y: 47 }, alignment: 'jedi',
    blurb: 'Cradle of the Je’daii and the Jedi; refuge of the Order after the Sacking — and the stage for Bane’s vanishing act.',
    detail: 'The Force-saturated Deep Core world where the precursor Je’daii Order first balanced light and dark, tens of millennia before the Republic. Lost for ages, it was resettled by the Jedi Order after the Sacking of Coruscant in 3653 BBY — a homecoming under duress. Two and a half millennia later it hosted a stranger scene: in 990 BBY, Lord Valenthyne Farfalla’s Jedi cornered “the last two Sith” in its ancient ruins, and none of the hunters survived to correct the record. The Jedi Order’s belief that the Sith died with Kaan was buried here, with the witnesses.',
    sources: ['Dawn of the Jedi', 'The Old Republic', 'Darth Bane: Rule of Two'],
    tags: ['jedi homeworld', 'academy']
  },
  {
    id: 'ossus', name: 'Ossus', region: 'Outer Rim — Adega system (Auril sector)',
    coords: { x: 74, y: 33 }, alignment: 'jedi',
    blurb: 'The Jedi library-world: knowledge of ten thousand years, burned in an afternoon in 3996 BBY.',
    detail: 'Odan-Urr founded the Great Jedi Library here after the Hyperspace War, and for a thousand years Ossus was where Jedi meant “scholar” before it meant “soldier.” In 3996 BBY, Exar Kun’s faction detonated the Cron Cluster to cover their retreat; the stellar shockwave flash-burned the world while Kun landed to loot it, cutting down the ancient Odan-Urr in his own stacks. Refugee vaults from Ossus seeded Jedi libraries for millennia after. In the Legacy era the New Jedi Order rebuilt an academy here — and in 130 ABY Krayt’s One Sith chose it, deliberately, as the site of the Third Jedi Purge’s opening massacre.',
    sources: ['Tales of the Jedi: The Sith War', 'Star Wars: Legacy'],
    tags: ['library', 'academy', 'jedi']
  },
  {
    id: 'dantooine', name: 'Dantooine', region: 'Outer Rim — Raioballo sector',
    coords: { x: 60, y: 12 }, alignment: 'jedi',
    blurb: 'Pastoral world of the Jedi Enclave — where Revan was remade, and where the last masters were unmade.',
    detail: 'The Enclave on Dantooine was the Order’s quiet second campus: a training ground for the patient, far from Coruscant politics. It carries the era’s whole arc: Revan retrained here as a blank-slate padawan in 3957 BBY under Masters Zhar and Vandar; Malak glassed the Enclave a year later specifically to kill that possibility for anyone else; and in 3951 BBY the three surviving members of the Council met in its ruins to judge Meetra Surik — where Darth Traya, arriving uninvited, drained them dead where they stood. The Star Map in its back country was the first breadcrumb on the road to the Star Forge.',
    sources: ['Knights of the Old Republic (2003)', 'Knights of the Old Republic II'],
    tags: ['academy', 'jedi', 'star map']
  },
  {
    id: 'taris', name: 'Taris', region: 'Outer Rim — Ojoster sector',
    coords: { x: 58, y: 16 }, alignment: 'neutral',
    blurb: 'A city-world with a caste system, a rakghoul plague in its undercity — and Malak’s orbital erasure in 3956 BBY.',
    detail: 'Taris was an ecumenopolis in miniature — spires for the rich, a sealed undercity where the rakghoul plague (Karness Muur’s talisman-borne curse) turned outcasts into monsters. During the Jedi Civil War, Darth Malak ordered its entire surface flattened by turbolaser bombardment to kill one escape pod’s worth of fugitives, including the amnesiac Revan and Bastila Shan. It is the era’s exhibit for what the Star Forge fleet made thinkable: a civilization deleted as a search operation. The swoop gangs, the Sith quarantine, and the Outcasts’ promised land all died together.',
    sources: ['Knights of the Old Republic (2003)', 'Knights of the Old Republic: Commencement'],
    tags: ['destroyed city-world', 'rakghouls']
  },
  {
    id: 'onderon', name: 'Onderon', region: 'Inner Rim — Japrael system',
    coords: { x: 66, y: 46 }, alignment: 'gray',
    blurb: 'Walled city Iziz against beast-riders — a world Freedon Nadd bent so hard it stayed bent for four thousand years.',
    detail: 'When the fallen Jedi Freedon Nadd took Onderon around 4400 BBY, he built a dynasty steeped in Sith teachings; the city of Iziz fought its exiled beast-rider kin for centuries after. His tomb made the planet a battery for dark-side cults — the Naddist Uprising of 3998 BBY and the Krath’s seduction both drew from it, until the Jedi entombed him on the war moon Dxun. Onderon’s royal politics stayed combustible through the Dark Wars (Vaklu’s coup against Queen Talia in 3951 BBY). The planet’s last cameo is the saga’s full stop: the reborn Emperor Palpatine died his final death here in 11 ABY.',
    sources: ['Tales of the Jedi', 'Knights of the Old Republic II', 'Dark Empire II / Empire’s End'],
    tags: ['naddist', 'monarchy']
  },
  {
    id: 'dxun', name: 'Dxun', region: 'Inner Rim — moon of Onderon',
    coords: { x: 68, y: 44.5 }, alignment: 'gray',
    blurb: 'Onderon’s jungle war moon: Nadd’s true tomb, graveyard of Mandalore the Indomitable, forge of Mandalore the Preserver.',
    detail: 'A jungle that eats armies. The Jedi moved Freedon Nadd’s remains to a sealed tomb here in 3997 BBY, hoping distance would starve Onderon’s cults — Exar Kun broke in within months. Mandalore the Indomitable crashed here after Ulic’s war collapsed and was eaten by the wildlife; the warriors who recovered his mask crowned Mandalore the Ultimate. The moon’s Mandalorian ruins became the staging ground where Canderous Ordo, as Mandalore the Preserver, rebuilt the clans in 3951 BBY — and where Meetra Surik’s people fought the Sith during the Onderon crisis.',
    sources: ['Tales of the Jedi', 'Knights of the Old Republic II'],
    tags: ['tomb', 'mandalorian']
  },
  {
    id: 'yavin4', name: 'Yavin 4', region: 'Outer Rim — Gordian Reach',
    coords: { x: 71, y: 40 }, alignment: 'gray',
    blurb: 'Sadow’s exile, Kun’s temple-prison, and — four thousand years later — Luke Skywalker’s Jedi Praxeum on the same stones.',
    detail: 'Naga Sadow fled here in 5000 BBY with his Massassi retainers, whose alchemical descendants raised the great temples as instruments of his will. Exar Kun claimed both temples and Massassi in 3997 BBY, and when the Jedi armada came in 3996 BBY his spirit survived the wall of light that consumed his followers, sealed inside his own architecture. He waited four millennia for company: Luke Skywalker founded his Jedi Praxeum in the same temples in 11 ABY, and Kun’s ghost — corrupting students, killing one — was the new Order’s first enemy, destroyed by Luke’s first class in 11 ABY. The Rebel base of 0 BBY is the moon’s least strange tenancy.',
    sources: ['Tales of the Jedi', 'The Jedi Academy Trilogy', 'A New Hope'],
    tags: ['temples', 'academy', 'massassi']
  },
  {
    id: 'malachor', name: 'Malachor V', region: 'Outer Rim — the edge of Mandalorian space',
    coords: { x: 86, y: 47 }, alignment: 'sith',
    blurb: 'Forbidden world of the Trayus Academy; broken by the Mass Shadow Generator, finished off in 3951 BBY.',
    detail: 'Malachor was taboo to the Mandalorians for good reason: the Trayus Academy, an ancient Sith redoubt, soaked the planet in the dark side long before the wars named after it. Revan ended the Mandalorian Wars here in 3960 BBY — the Mass Shadow Generator crushed both fleets into the surface, tearing a wound in the Force and cracking the planet — then quietly kept Trayus as the dark heart of his own Sith conversion pipeline. Darth Traya, Sion, and Nihilus all rose from it. In 3951 BBY Meetra Surik returned, defeated the Triumvirate’s survivors in its halls, and let the reactivated Generator finish the planet entirely.',
    sources: ['Knights of the Old Republic II'],
    tags: ['academy', 'wound in the force', 'destroyed']
  },
  {
    id: 'lehon', name: 'Lehon (Rakata Prime)', region: 'Unknown Regions — Tempered Wastes',
    coords: { x: 18, y: 38 }, alignment: 'gray',
    blurb: 'Capital of the Infinite Empire, anchorage of the Star Forge — where Revan’s war began and ended.',
    detail: 'Homeworld of the Rakata, whose Force-powered Infinite Empire enslaved the galaxy tens of thousands of years before the Republic. Their apex machine, the Star Forge, still orbited here — a factory that feeds on a star and on hunger itself. Revan reached Lehon through the Star Maps, took the Forge, and built a fleet on it; the Republic’s counterstroke in 3956 BBY (the Battle of Rakata Prime) killed Malak and dropped the Forge out of the sky. A thousand years later, Darth Bane walked the same ruins and left with the holocron of Darth Revan — Lehon’s past keeps arming the future.',
    sources: ['Knights of the Old Republic (2003)', 'Darth Bane: Path of Destruction'],
    tags: ['rakata', 'star forge', 'infinite empire']
  },
  {
    id: 'ruusan', name: 'Ruusan', region: 'Mid Rim — Teraab sector',
    coords: { x: 57, y: 55 }, alignment: 'neutral',
    blurb: 'Seven battles, one thought bomb: the world where the New Sith Wars — and, officially, the Sith — ended in 1000 BBY.',
    detail: 'An unremarkable border world that geography made into a meat grinder: Lord Hoth’s Army of Light and Kaan’s Brotherhood of Darkness fought seven battles across its plains from 1002 to 1000 BBY. The last ended when Kaan — fed the ritual by Darth Bane, who wanted every rival on both sides dead — detonated the thought bomb, annihilating a hundred Jedi and every Brotherhood Sith and trapping their souls in a silver egg in a cave. Ruusan gave its name to the Reformation that demilitarized the Republic and the Jedi for a thousand years, and the Valley of the Jedi it left behind became a pilgrimage site of bottled souls.',
    sources: ['Darth Bane: Path of Destruction', 'Jedi Knight: Dark Forces II'],
    tags: ['thought bomb', 'battlefield']
  },
  {
    id: 'ambria', name: 'Ambria', region: 'Inner Rim — Stenness Node',
    coords: { x: 63, y: 50 }, alignment: 'gray',
    blurb: 'A scarred healer’s world — Master Thon’s refuge in one era, the grave of Darth Bane in another.',
    detail: 'Ruined by ancient Sith sorcery and partially cleansed by the Jedi healer-hermits who settled it (Master Thon kept the bottled darkness of Lake Natth penned there in Nomi Sunrider’s day), Ambria stayed a quiet world where broken people went to mend. That is exactly why the healer Caleb lived there — and why Darth Bane came twice. The second visit, in 980 BBY, ended the founder’s story: Bane and Darth Zannah fought their final duel in Caleb’s camp, and the apprentice proved the Rule of Two by winning. Whether Bane’s essence died with his body is a question Zannah’s occasionally twitching hand declined to answer.',
    sources: ['Tales of the Jedi', 'Darth Bane: Dynasty of Evil'],
    tags: ['duel site', 'healers']
  },
  {
    id: 'koros-major', name: 'Empress Teta (Koros Major)', region: 'Deep Core',
    coords: { x: 54, y: 41.5 }, alignment: 'neutral',
    blurb: 'Carbonite-rich throneworld — target of the Hyperspace War’s first blow, cradle of the Krath’s coup.',
    detail: 'Unified by the warrior-empress Teta just before the Hyperspace War, the Koros system (renamed in her honor) was the Republic’s forward bastion in 5000 BBY — first target of Sadow’s invasion, first source of the counterattack. Thirteen centuries of aristocratic drift later, its heirs Satal and Aleema Keto founded the Krath secret society on stolen Sith lore, murdered their elders in a coup in 3997 BBY, and turned the Empress’s system into the Great Sith War’s first conquest. The dark side’s favorite trick, demonstrated twice on one world: it comes back wearing the founders’ grandchildren.',
    sources: ['Tales of the Jedi: The Fall of the Sith Empire', 'Tales of the Jedi: Dark Lords of the Sith'],
    tags: ['deep core', 'krath']
  },
  {
    id: 'telos', name: 'Telos IV', region: 'Outer Rim — Kwymar sector',
    coords: { x: 60, y: 20 }, alignment: 'neutral',
    blurb: 'Bombed dead in the Jedi Civil War, half-restored by 3951 BBY — and the place Darth Nihilus finally starved.',
    detail: 'Saul Karath bought his Sith admiralty by bombarding his own Republic’s Telos into ash in 3958 BBY. The restoration effort that followed — Ithorian herds, orbital shield-wall, the polar academy where Atris hoarded holocrons and bitterness — made Telos the test case for whether the Republic could heal at all. In 3951 BBY Darth Nihilus brought his flagship Ravager to feed on it, misled by the promise of a world of Jedi; Meetra Surik, Visas Marr, and Mandalore boarded him above the planet and cut the Lord of Hunger out of the galaxy. The shield held. The herds came back.',
    sources: ['Knights of the Old Republic II'],
    tags: ['restoration', 'battle']
  },
  {
    id: 'katarr', name: 'Katarr', region: 'Mid Rim — colony of the Miraluka',
    coords: { x: 56, y: 27 }, alignment: 'jedi',
    blurb: 'A world of Force-seers, chosen for a Jedi conclave — devoured whole by Nihilus in 3952 BBY.',
    detail: 'The Miraluka see only through the Force, which made their quiet colony world the worst possible place to gather the surviving Jedi in secret. Darth Nihilus, drawn across space by the concentration of light, tore the life from Katarr in a single act of consumption — Jedi, colonists, biosphere, everything. The conclave the Council hoped would rebuild the Order instead deleted most of it. One Miraluka survived: Visas Marr, taken as trophy and shadow by the thing that ate her world, who lived to help kill him at Telos three years later.',
    sources: ['Knights of the Old Republic II'],
    tags: ['miraluka', 'wound in the force']
  },
  {
    id: 'kesh', name: 'Kesh', region: 'Wild Space',
    coords: { x: 13, y: 62 }, alignment: 'sith',
    blurb: 'Where the Sith ship Omen crashed in 5000 BBY — incubating a marooned Sith civilization for five millennia.',
    detail: 'A Sith dreadnought hauling Naga Sadow’s war matériel blind-jumped to escape the Hyperspace War’s collapse and came down on this remote world. Its stranded crew did what Sith do: they enthroned themselves over the native Keshiri as gods, and their descendants — the Lost Tribe of the Sith — spent five thousand years perfecting a whole society of ritualized ambition, with no Republic, no Jedi, and no idea the war had ended. Rediscovered in the decades after 41 ABY, the Tribe spilled into a galaxy that had believed “Sith” meant two men in robes — and learned about Luke Skywalker the hard way.',
    sources: ['Lost Tribe of the Sith', 'Fate of the Jedi'],
    tags: ['lost tribe', 'isolation']
  },
  {
    id: 'mandalore-planet', name: 'Mandalore', region: 'Outer Rim — Mandalorian space',
    coords: { x: 70, y: 53 }, alignment: 'gray',
    blurb: 'Homeworld of the warrior clans whose crusades kept colliding with the Sith’s wars — as weapon, victim, and heir.',
    detail: 'The clans of Mandalore orbit every era of this atlas without belonging to any of it: Mandalore the Indomitable rode with Ulic Qel-Droma’s Sith brotherhood; Mandalore the Ultimate, goaded by Sith emissaries, launched the wars that made Revan; Revan killed him and hid the mask to decapitate the culture; Canderous Ordo took it back up in 3951 BBY as Mandalore the Preserver to rebuild the clans from Dxun. The pattern — great powers arming the Mandalorians and being surprised by the invoice — repeats into the Galactic Civil War and beyond.',
    sources: ['Tales of the Jedi', 'Knights of the Old Republic II', 'The Old Republic'],
    tags: ['mandalorian', 'clans']
  }
];
