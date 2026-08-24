import type { Pilote, GrandPrix, BadgeInfo, BonusLabelInfo } from "./types";

// Chemins locaux vers les images AVIF de monoplaces
export const LOGOS_2026: Record<string, string> = {
    redbull: "images/cars/redbull.avif",
    ferrari: "images/cars/ferrari.avif",
    mclaren: "images/cars/mclaren.avif",
    mercedes: "images/cars/mercedes.avif",
    aston: "images/cars/astonmartin.avif",
    alpine: "images/cars/alpine.avif",
    williams: "images/cars/williams.avif",
    racingbulls: "images/cars/racingbulls.avif",
    audi: "images/cars/audi.avif",
    haas: "images/cars/haas.avif",
    cadillac: "images/cars/cadillac.avif"
};

// Chemins vers les logos officiels des écuries (dossier images/team)
export const LOGOS_ECURIES_2026: Record<string, string> = {
    "Red Bull": "images/team/redbull.avif",
    "Ferrari": "images/team/ferrari.avif",
    "McLaren": "images/team/mclaren.avif",
    "Mercedes": "images/team/mercedes.avif",
    "Aston Martin": "images/team/astonmartin.avif",
    "Alpine": "images/team/alpine.avif",
    "Williams": "images/team/williams.avif",
    "Racing Bulls": "images/team/racingbulls.avif",
    "Audi": "images/team/audi.avif",
    "Haas": "images/team/haas.avif",
    "Cadillac": "images/team/cadillac.avif"
};

// Base de données des pilotes enrichie avec Numéros, Pays et Couleurs écuries
export const pilotesData: Pilote[] = [
  {nom: "Max Verstappen", ecurie: "Red Bull", numero: "3", pays: "nl", couleur: "#3671C6", carImg: LOGOS_2026.redbull, driverImg: "images/drivers/ver.avif"},
  {nom: "Isack Hadjar", ecurie: "Red Bull", numero: "43", pays: "fr", couleur: "#3671C6", carImg: LOGOS_2026.redbull, driverImg: "images/drivers/had.avif"},
  {nom: "Lewis Hamilton", ecurie: "Ferrari", numero: "44", pays: "gb", couleur: "#E80020", carImg: LOGOS_2026.ferrari, driverImg: "images/drivers/ham.avif"},
  {nom: "Charles Leclerc", ecurie: "Ferrari", numero: "16", pays: "mc", couleur: "#E80020", carImg: LOGOS_2026.ferrari, driverImg: "images/drivers/lec.avif"},
  {nom: "Lando Norris", ecurie: "McLaren", numero: "1", pays: "gb", couleur: "#FF8000", carImg: LOGOS_2026.mclaren, driverImg: "images/drivers/nor.avif"},
  {nom: "Oscar Piastri", ecurie: "McLaren", numero: "81", pays: "au", couleur: "#FF8000", carImg: LOGOS_2026.mclaren, driverImg: "images/drivers/pia.avif"},
  {nom: "George Russell", ecurie: "Mercedes", numero: "63", pays: "gb", couleur: "#27CCB4", carImg: LOGOS_2026.mercedes, driverImg: "images/drivers/rus.avif"},
  {nom: "Kimi Antonelli", ecurie: "Mercedes", numero: "12", pays: "it", couleur: "#27CCB4", carImg: LOGOS_2026.mercedes, driverImg: "images/drivers/ant.avif"},
  {nom: "Fernando Alonso", ecurie: "Aston Martin", numero: "14", pays: "es", couleur: "#229971", carImg: LOGOS_2026.aston, driverImg: "images/drivers/alo.avif"},
  {nom: "Lance Stroll", ecurie: "Aston Martin", numero: "18", pays: "ca", couleur: "#229971", carImg: LOGOS_2026.aston, driverImg: "images/drivers/str.avif"},
  {nom: "Pierre Gasly", ecurie: "Alpine", numero: "10", pays: "fr", couleur: "#0093CC", carImg: LOGOS_2026.alpine, driverImg: "images/drivers/gas.avif"},
  {nom: "Franco Colapinto", ecurie: "Alpine", numero: "43", pays: "ar", couleur: "#0093CC", carImg: LOGOS_2026.alpine, driverImg: "images/drivers/col.avif"},
  {nom: "Carlos Sainz", ecurie: "Williams", numero: "55", pays: "es", couleur: "#37BEDD", carImg: LOGOS_2026.williams, driverImg: "images/drivers/sai.avif"},
  {nom: "Alex Albon", ecurie: "Williams", numero: "23", pays: "th", couleur: "#37BEDD", carImg: LOGOS_2026.williams, driverImg: "images/drivers/alb.avif"},
  {nom: "Liam Lawson", ecurie: "Racing Bulls", numero: "30", pays: "nz", couleur: "#6692FF", carImg: LOGOS_2026.racingbulls, driverImg: "images/drivers/law.avif"},
  {nom: "Arvid Lindblad", ecurie: "Racing Bulls", numero: "40", pays: "gb", couleur: "#6692FF", carImg: LOGOS_2026.racingbulls, driverImg: "images/drivers/lin.avif"},
  {nom: "Nico Hülkenberg", ecurie: "Audi", numero: "27", pays: "de", couleur: "#00E6C3", carImg: LOGOS_2026.audi, driverImg: "images/drivers/hul.avif"},
  {nom: "Gabriel Bortoleto", ecurie: "Audi", numero: "5", pays: "br", couleur: "#00E6C3", carImg: LOGOS_2026.audi, driverImg: "images/drivers/bor.avif"},
  {nom: "Oliver Bearman", ecurie: "Haas", numero: "87", pays: "gb", couleur: "#B6BABD", carImg: LOGOS_2026.haas, driverImg: "images/drivers/bea.avif"},
  {nom: "Esteban Ocon", ecurie: "Haas", numero: "31", pays: "fr", couleur: "#B6BABD", carImg: LOGOS_2026.haas, driverImg: "images/drivers/oco.avif"},
  {nom: "Valtteri Bottas", ecurie: "Cadillac", numero: "77", pays: "fi", couleur: "#900C3F", carImg: LOGOS_2026.cadillac, driverImg: "images/drivers/bot.avif"},
  {nom: "Sergio Pérez", ecurie: "Cadillac", numero: "11", pays: "mx", couleur: "#900C3F", carImg: LOGOS_2026.cadillac, driverImg: "images/drivers/per.avif"}
];

export const ecuriesSaison: string[] = [
    "Red Bull", "Ferrari", "McLaren", "Mercedes", "Aston Martin",
    "Alpine", "Williams", "Racing Bulls", "Audi", "Haas", "Cadillac"
];

// Écuries considérées comme "outsiders" pour le badge Coup de Folie
export const ECURIES_OUTSIDERS: string[] = [
    "Aston Martin", "Alpine", "Williams", "Racing Bulls", "Audi", "Haas", "Cadillac"
];

// Description des badges de la saison
export const BADGES_INFO: Record<string, BadgeInfo> = {
    pole: { icone: "🎯", nom: "Roi de la Pole", description: "A trouvé le plus de fois le bon pronostic de Pole Position sur la saison." },
    victoire: { icone: "🏆", nom: "Chasseur de Vainqueur", description: "A trouvé le plus de fois le bon vainqueur du Grand Prix (P1 exact)." },
    podium: { icone: "🥇", nom: "Podium Parfait", description: "A trouvé le podium exact (P1, P2 et P3) le plus de fois sur la saison." },
    loupe: { icone: "🥶", nom: "Boulet de la Saison", description: "Cumule le plus grand nombre de pronostics ratés (pilotes hors du top 10 réel)." },
    folie: { icone: "🃏", nom: "Coup de Folie", description: "A misé le plus souvent, avec succès, sur un pilote d'écurie outsider dans son top 10." }
};

// Calendrier complet officiel 2026
export const calendrier2026: GrandPrix[] = [
    { round: 1, nom: "Grand Prix d'Australie", circuit: "Melbourne", pays: "Australie", date: "2026-03-08" },
    { round: 2, nom: "Grand Prix de Chine", circuit: "Shanghai", pays: "Chine", date: "2026-03-15" },
    { round: 3, nom: "Grand Prix du Japon", circuit: "Suzuka", pays: "Japon", date: "2026-03-29" },
    { round: 4, nom: "Grand Prix de Miami", circuit: "Miami Gardens", pays: "USA", date: "2026-05-03" },
    { round: 5, nom: "Grand Prix du Canada", circuit: "Montréal", pays: "Canada", date: "2026-05-24" },
    { round: 6, nom: "Grand Prix de Monaco", circuit: "Monte Carlo", pays: "Monaco", date: "2026-06-07" },
    { round: 7, nom: "Grand Prix d'Espagne (Barcelone)", circuit: "Barcelona", pays: "Espagne", date: "2026-06-14" },
    { round: 8, nom: "Grand Prix d'Autriche", circuit: "Spielberg", pays: "Autriche", date: "2026-06-28" },
    { round: 9, nom: "Grand Prix de Grande-Bretagne", circuit: "Silverstone", pays: "Royaume-Uni", date: "2026-07-05" },
    { round: 10, nom: "Grand Prix de Belgique", circuit: "Spa-Francorchamps", pays: "Belgique", date: "2026-07-19" },
    { round: 11, nom: "Grand Prix de Hongrie", circuit: "Budapest", pays: "Hongrie", date: "2026-07-26" },
    { round: 12, nom: "Grand Prix des Pays-Bas", circuit: "Zandvoort", pays: "Pays-Bas", date: "2026-08-23" },
    { round: 13, nom: "Grand Prix d'Italie (Monza)", circuit: "Monza", pays: "Italie", date: "2026-09-06" },
    { round: 14, nom: "Grand Prix d'Espagne (Madrid)", circuit: "Madrid", pays: "Espagne", date: "2026-09-13" },
    { round: 15, nom: "Grand Prix d'Azerbaïdjan", circuit: "Baku", pays: "Azerbaïdjan", date: "2026-09-27" },
    { round: 16, nom: "Grand Prix de Singapour", circuit: "Marina Bay", pays: "Singapour", date: "2026-10-11" },
    { round: 17, nom: "Grand Prix des États-Unis (Austin)", circuit: "Austin", pays: "USA", date: "2026-10-25" },
    { round: 18, nom: "Grand Prix du Mexique", circuit: "Mexico City", pays: "Mexique", date: "2026-11-01" },
    { round: 19, nom: "Grand Prix du Brésil", circuit: "São Paulo", pays: "Brésil", date: "2026-11-08" },
    { round: 20, nom: "Grand Prix de Las Vegas", circuit: "Las Vegas", pays: "USA", date: "2026-11-21" },
    { round: 21, nom: "Grand Prix du Qatar", circuit: "Lusail", pays: "Qatar", date: "2026-11-29" },
    { round: 22, nom: "Grand Prix d'Abou Dabi", circuit: "Yas Marina", pays: "Émirats Arabes Unis", date: "2026-12-06" }
];

export const pilotesParEcurie: Record<string, string[]> = {
    "Red Bull": ["Max Verstappen", "Isack Hadjar"],
    "Ferrari": ["Lewis Hamilton", "Charles Leclerc"],
    "McLaren": ["Lando Norris", "Oscar Piastri"],
    "Mercedes": ["George Russell", "Kimi Antonelli"],
    "Aston Martin": ["Fernando Alonso", "Lance Stroll"],
    "Alpine": ["Pierre Gasly", "Franco Colapinto"],
    "Williams": ["Carlos Sainz", "Alex Albon"],
    "Racing Bulls": ["Liam Lawson", "Arvid Lindblad"],
    "Audi": ["Nico Hülkenberg", "Gabriel Bortoleto"],
    "Haas": ["Oliver Bearman", "Esteban Ocon"],
    "Cadillac": ["Valtteri Bottas", "Sergio Pérez"]
};

export const DESIGN_DEFAULT_GRID: Record<string, { couleur: string }> = {
    "Max Verstappen": { couleur: "#3671C6" },
    "Isack Hadjar": { couleur: "#3671C6" },
    "Lewis Hamilton": { couleur: "#E80020" },
    "Charles Leclerc": { couleur: "#E80020" },
    "Lando Norris": { couleur: "#FF8000" },
    "Oscar Piastri": { couleur: "#FF8000" },
    "George Russell": { couleur: "#27CCB4" },
    "Kimi Antonelli": { couleur: "#27CCB4" },
    "Fernando Alonso": { couleur: "#229971" },
    "Lance Stroll": { couleur: "#229971" },
    "Pierre Gasly": { couleur: "#0093CC" },
    "Franco Colapinto": { couleur: "#0093CC" },
    "Carlos Sainz": { couleur: "#37BEDD" },
    "Alex Albon": { couleur: "#37BEDD" },
    "Liam Lawson": { couleur: "#6692FF" },
    "Arvid Lindblad": { couleur: "#6692FF" },
    "Nico Hülkenberg": { couleur: "#00E6C3" },
    "Gabriel Bortoleto": { couleur: "#00E6C3" },
    "Oliver Bearman": { couleur: "#B6BABD" },
    "Esteban Ocon": { couleur: "#B6BABD" },
    "Valtteri Bottas": { couleur: "#900C3F" },
    "Sergio Pérez": { couleur: "#900C3F" }
};

export const LABELS_BONUS: Record<string, BonusLabelInfo> = {
    safetyCar: { icone: "🚨", nom: "Safety Car" },
    drapeauRouge: { icone: "🔴", nom: "Drapeau Rouge" },
    nombreDNF: { icone: "💥", nom: "Nombre de DNF" },
    polemanPodium: { icone: "🏆", nom: "Poleman sur le podium" }
};

// Fonctions utilitaires de normalisation et recherche
export function normaliserNom(texte?: string | null): string {
    return (texte || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

export function trouverPiloteLocalParNom(nomOfficiel?: string | null): Pilote | undefined {
    const cible = normaliserNom(nomOfficiel);
    return pilotesData.find(p => {
        const local = normaliserNom(p.nom);
        return local.includes(cible) || cible.includes(local);
    });
}

export function nomsCorrespondentLocal(nomA?: string | null, nomB?: string | null): boolean {
    const a = normaliserNom(nomA);
    const b = normaliserNom(nomB);
    return a.includes(b) || b.includes(a);
}
