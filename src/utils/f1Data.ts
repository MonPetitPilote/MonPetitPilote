import type { Pilote, GrandPrix, BadgeInfo, BonusLabelInfo } from "./types";
import { 
    TEAMS_CONFIG, 
    genererPilotesInitiaux, 
    resoudrePilote, 
    trouverEcuriePourPilote,
    pilotesActifs 
} from "../services/driversService";

// Chemins locaux vers les images AVIF de monoplaces (dérivés automatiquement des écuries)
export const LOGOS_2026: Record<string, string> = Object.fromEntries(
    Object.values(TEAMS_CONFIG).map(t => [t.key, t.carImg])
);

// Chemins vers les logos officiels des écuries (dossier /images/team)
export const LOGOS_ECURIES_2026: Record<string, string> = Object.fromEntries(
    Object.values(TEAMS_CONFIG).map(t => [t.nom, t.logoImg])
);

// Base de données des pilotes générée automatiquement via le service des écuries
export const pilotesData: Pilote[] = genererPilotesInitiaux();

export const ecuriesSaison: string[] = Object.keys(TEAMS_CONFIG);

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

export { calendrier2026, getCalendrierActuel } from "../services/calendarService";

export const pilotesParEcurie: Record<string, string[]> = Object.fromEntries(
    Object.values(TEAMS_CONFIG).map(t => [t.nom, t.pilotesDefaut])
);

export const DESIGN_DEFAULT_GRID: Record<string, { couleur: string }> = Object.fromEntries(
    pilotesData.map(p => [p.nom, { couleur: p.couleur }])
);

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
    }) || (nomOfficiel ? resoudrePilote(nomOfficiel) : undefined);
}

export function nomsCorrespondentLocal(nomA?: string | null, nomB?: string | null): boolean {
    const a = normaliserNom(nomA);
    const b = normaliserNom(nomB);
    return a.includes(b) || b.includes(a);
}
