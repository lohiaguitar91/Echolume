/* Holocron data — factions and orders. */
window.HOLO_DATA = window.HOLO_DATA || {};

HOLO_DATA.factions = [
  {
    id: 'jedi-order', name: 'Jedi Order', alignment: 'jedi', from: -25783, to: null, approx: true,
    eras: ['era-dawn','era-ghw','era-gsw','era-mw','era-jcw','era-ggw','era-nsw','era-rot','era-empire','era-legacy'],
    blurb: 'Guardians of peace and the light side — scholars at Ossus, generals at Ruusan, martyrs everywhere, and never quite extinct.',
    detail: 'Across this atlas the Jedi Order dies four times and won’t stay dead: gutted at Ossus (3996 BBY), hunted to a hundred survivors in the First Purge (3951 BBY), demilitarized into complacency after Ruusan (1000 BBY), exterminated by Order 66 (19 BBY), and massacred again at Ossus (130 ABY). Its structure swings between library, army, and monastery depending on which catastrophe came last. The Order’s deepest pattern: its greatest failures are its own students — Nadd, Kun, Ruin, Revan, Vader, Caedus, Krayt were all Jedi first.',
    sources: ['Tales of the Jedi', 'The Jedi Path', 'Star Wars: Legacy']
  },
  {
    id: 'republic', name: 'Galactic Republic', alignment: 'neutral', from: -25053, to: -19,
    eras: ['era-dawn','era-ghw','era-gsw','era-mw','era-jcw','era-ggw','era-nsw','era-rot','era-empire'],
    blurb: 'Twenty-five thousand years of flawed, durable democracy — the thing every Sith project exists to break.',
    detail: 'The Republic is this database’s constant: rich enough to be worth conquering, slow enough to be nearly conquerable, resilient enough to outlast almost everyone who tries. It survives Sadow, Kun, Revan, Vitiate, and a thousand years of New Sith warlords — shrinking to the Core during the Dark Age, handing the Jedi direct military rule — before Darth Sidious ends it from the inside in 19 BBY, by winning an election. Its Ruusan Reformation (1000 BBY) traded standing armies for trust; Sidious’s career is the invoice for that trade.',
    sources: ['Tales of the Jedi', 'Darth Bane: Path of Destruction', 'Revenge of the Sith']
  },
  {
    id: 'sith-empire-old', name: 'Old Sith Empire', alignment: 'sith', from: -6900, to: -5000,
    eras: ['era-dawn','era-ghw'],
    blurb: 'The original empire of the exiled Dark Jedi and the Sith species — sorcery-fed, tomb-building, and doomed by its own succession.',
    detail: 'Founded when the exiles of the Hundred-Year Darkness enthroned themselves over the Sith species in 6900 BBY, the old Empire fused Dark Jedi discipline with Sith blood-magic into a civilization of god-kings: Ajunta Pall, Tulak Hord, Marka Ragnos. Isolated from the Republic for two millennia, it re-encountered the galaxy in 5000 BBY exactly the way Marka Ragnos’s ghost warned against — mid-succession-crisis, led by its most reckless lord — and was annihilated inside a year. Its true legacy is its diaspora: tombs, holocrons, Yavin 4, Kesh, and the exile fleet that became Vitiate’s Empire.',
    sources: ['Tales of the Jedi: Golden Age of the Sith', 'Book of Sith']
  },
  {
    id: 'infinite-empire', name: 'Infinite Empire (Rakata)', alignment: 'sith', from: -35000, to: -25200, approx: true,
    eras: ['era-dawn'],
    blurb: 'The prehistoric Force-industrial empire whose leftover machines — Star Maps, Star Forge — keep restarting history.',
    detail: 'The Rakata built hyperdrives powered by the Force itself and enslaved the primordial galaxy, seeding Korriban, Dantooine, Kashyyyk, and Lehon with infrastructure. Plague and slave revolt collapsed them over 25 millennia before this atlas begins — but their apex artifact, the Star Forge, waited in orbit of Lehon, and their Star Maps waited as breadcrumbs. Revan’s empire is, mechanically, a Rakatan revival: the Forge’s hunger wearing a new crown. Even Darth Bane’s curriculum ran through Lehon’s ruins.',
    sources: ['Knights of the Old Republic (2003)', 'Darth Bane: Path of Destruction']
  },
  {
    id: 'lost-tribe', name: 'Lost Tribe of the Sith', alignment: 'sith', from: -5000, to: 44, approx: true,
    eras: ['era-ghw','era-legacy'],
    blurb: 'Castaway Sith of the crashed Omen, evolving in isolation on Kesh for five thousand years.',
    detail: 'When the Hyperspace War collapsed, the dreadnought Omen crash-landed on remote Kesh; its Sith crew enthroned themselves over the native Keshiri and bred a complete Sith civilization — courts, purges, art, doctrine — sealed off from galactic history. They missed Ruusan, the Rule of Two, and the Empire entirely. Rediscovery in the decades after 41 ABY dropped a whole society of trained Sith into Luke Skywalker’s era, proving the atlas’s recurring rule: the Sith are never as extinct as the records say.',
    sources: ['Lost Tribe of the Sith', 'Fate of the Jedi']
  },
  {
    id: 'krath', name: 'The Krath', alignment: 'sith', from: -3997, to: -3996,
    eras: ['era-gsw'],
    blurb: 'Tetan aristocrats playing with real grimoires — the secret society that lit the Great Sith War’s fuse.',
    detail: 'Satal and Aleema Keto, bored heirs of the Empress Teta system, founded the Krath as an occult salon and then made it a state: armed with Sith lore looted via Onderon’s Naddist cults, they murdered their way to the throne in 3997 BBY. Their real historical function was as a gateway drug — the Krath corrupted Ulic Qel-Droma (who came to infiltrate them) and gave Exar Kun a rival to absorb. Both Ketos were dead within a year of the war they started, which is very Krath.',
    sources: ['Tales of the Jedi: Dark Lords of the Sith']
  },
  {
    id: 'kun-brotherhood', name: 'Brotherhood of the Sith', alignment: 'sith', from: -3997, to: -3996,
    eras: ['era-gsw'],
    blurb: 'Exar Kun’s war coalition — fallen Jedi, Massassi, Krath, and Mandalorians under a self-crowned Dark Lord.',
    detail: 'Less an order than a hostile takeover of the Sith brand: Kun, anointed Dark Lord by ancient spirits in 3997 BBY, bound fallen Jedi converts (seduced via a stolen holocron), the Krath, Mandalore the Indomitable’s crusaders, and Yavin 4’s Massassi into a single war machine with Ulic Qel-Droma as apprentice and field marshal. It nearly worked — Coruscant burned, Ossus died — and then collapsed in the usual way: the apprentice was captured, the allies were spent, and the Dark Lord ended as a ghost sealed in his own temples.',
    sources: ['Tales of the Jedi: The Sith War']
  },
  {
    id: 'mandalorians', name: 'Mandalorian Clans / Neo-Crusaders', alignment: 'gray', from: -3996, to: null,
    eras: ['era-gsw','era-mw','era-jcw'],
    blurb: 'The warrior culture every Sith project tries to hire and every Republic war has to survive.',
    detail: 'Under Mandalore the Indomitable the Crusaders fought for Ulic’s brotherhood; under Mandalore the Ultimate the Neo-Crusaders — goaded by Sith emissaries — launched the wars that broke the Republic’s rim and forged Revan. Revan beheaded the culture at Malachor V and hid the mask; Canderous Ordo restored it in 3951 BBY as Mandalore the Preserver, rebuilding the clans from Dxun as something closer to a sword kept sheathed. The clans’ throughline: honor as ideology, war as sacrament, and a genius for being on history’s losing side magnificently.',
    sources: ['Tales of the Jedi', 'Knights of the Old Republic II']
  },
  {
    id: 'revan-empire', name: 'Revan’s Sith Empire', alignment: 'sith', from: -3959, to: -3950,
    eras: ['era-jcw'],
    blurb: 'A Sith state built from Republic defectors and Star Forge output — designed, its founder later claimed, as a shield.',
    detail: 'Revan’s empire inverted the usual model: instead of alien legions it ran on converted Republic veterans, captured shipyards, a reopened Korriban academy for turning Jedi, and the Star Forge’s bottomless production. Revan governed with an engineer’s restraint — infrastructure spared, the Trayus pipeline hidden — which his apprentice mistook for weakness. Under Malak it became pure appetite (Taris, Dantooine), and after his death it ate itself in the Sith Civil War, leaving the Triumvirate as its executor. The Revan novel’s revelation: the whole project began as a corrupted bulwark against the true Empire in the dark.',
    sources: ['Knights of the Old Republic (2003)', 'The Old Republic: Revan']
  },
  {
    id: 'sith-triumvirate', name: 'Sith Triumvirate', alignment: 'sith', from: -3955, to: -3951,
    eras: ['era-jcw'],
    blurb: 'Traya, Nihilus, Sion: a philosophy, a hunger, and a wound, running the First Jedi Purge from Malachor V.',
    detail: 'What crawled out of Revan’s Trayus Academy after his fall wasn’t an empire but a triple predicate: Darth Traya (betrayal as teaching method), Darth Nihilus (consumption incarnate), Darth Sion (pain as immortality). After Sion and Nihilus cast Traya out, the two lords ran the Purge as assassination-and-devouring rather than warfare — Katarr being their masterpiece — reducing the Jedi to fugitives without fielding an army. Meetra Surik killed all three in 3951 BBY, in three very different ways: battle, starvation, and persuasion.',
    sources: ['Knights of the Old Republic II']
  },
  {
    id: 'true-sith', name: 'Reconstituted Sith Empire (True Sith)', alignment: 'sith', from: -4980, to: -3630, approx: true,
    eras: ['era-ghw','era-jcw','era-ggw'],
    blurb: 'The exile fleet’s empire on Dromund Kaas — 1,300 years of secret rebuilding under one immortal Emperor.',
    detail: 'The survivors of the old Empire’s fall, led to Dromund Kaas by the sorcerer-lord Vitiate around 4980 BBY, built the most institutionally complete Sith state ever fielded: a Dark Council, service academies, an intelligence apparat, a citizen navy — all pointed at revenge and all owned by an Emperor who ate his own homeworld for immortality. It broke Revan and Malak into its vanguard, launched the Great Galactic War in 3681 BBY, took Coruscant’s surrender in 3653 BBY, and then spent decades discovering that its founder regarded the Empire itself as fuel for a galaxy-consuming ritual.',
    sources: ['The Old Republic: Revan', 'The Old Republic', 'The Old Republic: Deceived']
  },
  {
    id: 'new-sith', name: 'New Sith (Ruin’s Schism)', alignment: 'sith', from: -2000, to: -1010,
    eras: ['era-nsw'],
    blurb: 'Darth Ruin’s breakaway movement — which decayed into a thousand years of franchise warlords.',
    detail: 'The Fourth Great Schism: the Umbaran Jedi Master Phanius left the Order in 2000 BBY with a cohort of like-minded Jedi, took the name Darth Ruin, and refounded the Sith — then was murdered by his own followers almost immediately, setting the era’s tone. The “New Sith” that followed was less an order than an ecosystem: rival lords, pocket empires (Belia Darzu’s technobeast reign among them), and a Republic ground down for ten centuries. Its endpoint was Kaan’s attempt to impose structure — the Brotherhood of Darkness.',
    sources: ['Darth Bane: Path of Destruction', 'Book of Sith', 'The New Essential Chronology']
  },
  {
    id: 'brotherhood-darkness', name: 'Brotherhood of Darkness', alignment: 'sith', from: -1010, to: -1000,
    eras: ['era-nsw'],
    blurb: 'Kaan’s rationalized Sith: all Lords equal, academies reopened, victory in sight — and one student who saw the flaw.',
    detail: 'Lord Skere Kaan, ex-Jedi Master, unified the warlords around 1010 BBY with a heresy of equality: every Brotherhood Sith a “Dark Lord,” none supreme, ambition suppressed for the war effort. It worked militarily — the Brotherhood reopened Korriban’s academy around 1006 BBY, fielded real armies, and pushed the Jedi to form the Army of Light — and failed philosophically: a Sith order that forbids ambition is, per its own best student, no longer Sith. Darth Bane arranged its perfect death at Ruusan: the thought bomb consumed Kaan and every loyal Lord at once, leaving the brand to Bane alone.',
    sources: ['Darth Bane: Path of Destruction', 'Jedi vs. Sith']
  },
  {
    id: 'army-of-light', name: 'Army of Light', alignment: 'jedi', from: -1010, to: -1000,
    eras: ['era-nsw'],
    blurb: 'Lord Hoth’s militarized Jedi host — the light side’s mirror-image answer to the Brotherhood, and its co-casualty.',
    detail: 'By the New Sith Wars’ last decade the Jedi Order had stopped pretending: Lord Hoth led a formal Jedi army — knights as generals, padawans as soldiers, ranks borrowed from the enemy — against Kaan’s Brotherhood, culminating in the seven battles of Ruusan. Its victory was real and pyrrhic in the fullest sense: Hoth and a hundred Jedi died inside the thought bomb, and the Order was so horrified by what it had become that the Ruusan Reformation dissolved Jedi military rank entirely. The Army of Light won the war and abolished itself.',
    sources: ['Darth Bane: Path of Destruction', 'Jedi vs. Sith']
  },
  {
    id: 'banite-sith', name: 'Order of the Sith Lords (Banite Sith)', alignment: 'sith', from: -1000, to: 4,
    eras: ['era-rot','era-empire'],
    blurb: 'Two, always two — Bane’s secret order, which spent a thousand invisible years compounding toward Sidious.',
    detail: 'Founded on Ruusan’s ashes in 1000 BBY on three principles: exactly two Sith (master and apprentice), succession by the apprentice outgrowing and killing the master, and absolute secrecy while the Jedi decayed in peacetime. The line — Bane, Zannah, Cognus, the unrecorded centuries, Tenebrous, Plagueis, Sidious — traded armies for banks, senates, and bloodlines. It achieved everything: the Republic’s throne, the Jedi’s extermination, a galaxy governed by the dark side — and then died of its own succession rule at Endor, when the apprentice’s son proved a better lever than the apprentice.',
    sources: ['Darth Bane trilogy', 'Darth Plagueis', 'Return of the Jedi']
  },
  {
    id: 'prophets-dark-side', name: 'Prophets of the Dark Side', alignment: 'sith', from: -950, to: 4, approx: true,
    eras: ['era-rot','era-empire'],
    blurb: 'Darth Millennial’s heretic seers on Dromund Kaas — the Rule of Two’s excommunicated cousin sect.',
    detail: 'When Darth Cognus’s three-eyed apprentice Millennial rejected Bane’s doctrine, he fled to storm-wracked Dromund Kaas and founded a dark-side church in the ruins of the old Empire’s capital — prophecy and worship where Bane demanded secrecy and succession. The Prophets persisted in obscurity for a millennium, surfacing at the end as Emperor Palpatine’s pet seers under Supreme Prophet Kadann. A heresy of a heresy, they demonstrate the atlas’s taxonomy problem: the dark side always speciates.',
    sources: ['Darth Bane: Dynasty of Evil', 'The Dark Side Sourcebook']
  },
  {
    id: 'galactic-empire', name: 'Galactic Empire', alignment: 'sith', from: -19, to: 11,
    eras: ['era-empire'],
    blurb: 'The Republic, repossessed: Sidious’s prize, run for 23 years as the first openly Sith galactic state since Ruusan.',
    detail: 'Declared in 19 BBY over the Jedi Order’s corpse, the Empire was the Banite line’s cash-out — a Sith theocracy disguised as secular order, with the Rule of Two operating from the throne room. Its machinery (Death Stars, Inquisitors, the Tarkin Doctrine) needed no Force at all, which was the point: Sidious built a dark-side state that would run on fear even where he couldn’t reach. It fractured at Endor in 4 ABY, ran on warlords and a cloned Emperor through 11 ABY, and its remnant a century later became the vehicle Krayt’s One Sith hijacked.',
    sources: ['Revenge of the Sith', 'Dark Empire', 'Star Wars: Legacy']
  },
  {
    id: 'rebel-alliance', name: 'Rebel Alliance / New Republic', alignment: 'neutral', from: -2, to: 130,
    eras: ['era-empire','era-legacy'],
    blurb: 'The restoration project — which inherits the Republic’s role of being what Sith empires break themselves against.',
    detail: 'The Alliance that killed the Death Stars and outlived Palpatine restored the Republic in name and, gradually, in function — then spent a century absorbing the same lessons: a reborn Emperor (10–11 ABY), a Yuuzhan Vong invasion, a Second Galactic Civil War sparked by a Sith apprentice at its own helm (Darth Caedus, 40–41 ABY), and eventual eclipse by a resurgent Empire. In this atlas it plays the Republic’s old part: the durable, flawed light-side state whose survival is the actual scoreboard.',
    sources: ['Return of the Jedi', 'Dark Empire', 'Legacy of the Force'],
  },
  {
    id: 'new-jedi-order', name: 'New Jedi Order', alignment: 'jedi', from: 11, to: null,
    eras: ['era-empire','era-legacy'],
    blurb: 'Luke Skywalker’s rebuilt Order — founded on Yavin 4 over Exar Kun’s prison, tested by every ghost in this database.',
    detail: 'Luke’s praxeum opened in 11 ABY on Yavin 4 and was immediately attacked from below — Exar Kun’s bound spirit corrupted and killed students before the first class destroyed him, an on-the-nose inheritance ceremony. The New Order fought the Vong, lost Jacen Solo to Lumiya’s Sith tutelage, rebuilt academies on Ossus, and survived Krayt’s Third Purge. Doctrinally it broke with the old Order — marriage, family, attachment — betting that love handled honestly corrupts less than love forbidden. Six thousand years of this atlas suggest that was the right call.',
    sources: ['The Jedi Academy Trilogy', 'The New Jedi Order', 'Star Wars: Legacy']
  },
  {
    id: 'one-sith', name: 'One Sith', alignment: 'sith', from: 30, to: 138, approx: true,
    eras: ['era-legacy'],
    blurb: 'Darth Krayt’s heresy: many Sith, one will — patient enough to hide for a century, strong enough to take the throne.',
    detail: 'Founded on Korriban around 30 ABY by the fallen Jedi A’Sharad Hett — reborn as Darth Krayt with Darth Bane’s own holocron arguing against him the whole way — the One Sith replaced the Rule of Two with the Rule of One: unlimited Sith, zero ambition, every acolyte an extension of Krayt’s will. It waited out the Vong war and the Legacy century in stasis and secrecy, then hijacked the Fel Empire, massacred the Jedi at Ossus in 130 ABY, and ruled from Coruscant for seven years. It died with its founder’s final death in 137 ABY — ambition, suppressed by doctrine, returned with interest.',
    sources: ['Star Wars: Legacy', 'Book of Sith']
  }
];
