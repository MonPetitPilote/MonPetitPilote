import { collection, getDocs, type Firestore } from "firebase/firestore";
import { BADGES_INFO, ECURIES_OUTSIDERS, trouverPiloteLocalParNom, type StatistiquesSaison, type JoueurClassement } from "../utils";

export const BADGES_STAT_KEY: Record<string, string> = {
    pole: 'nbPoleCorrecte',
    victoire: 'nbVictoireCorrecte',
    podium: 'nbPodiumExact',
    loupe: 'nbLoupes',
    folie: 'nbCoupDeFolie'
};

// Parcourt tous les pronostics de la saison une seule fois pour calculer :
// - le classement cumulé (points par joueur)
// - les compteurs qui déterminent chaque badge
export async function calculerStatistiquesEtClassement(db: Firestore, membresLigueActive?: Set<string> | null): Promise<StatistiquesSaison> {
    const snapshot = await Promise.race([
        getDocs(collection(db, "pronostics")),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Délai dépassé : impossible de contacter la base de données.")), 10000))
    ]) as any;
    const parJoueur: Record<string, JoueurClassement> = {};
    const historiqueParJoueur: Record<string, Record<number, number>> = {};

    snapshot.forEach((docSnap: any) => {
        const data = docSnap.data();
        const uid = data.uidJoueur;
        if (!uid) return;
        if (membresLigueActive && !membresLigueActive.has(uid)) return;

        if (!parJoueur[uid]) {
            parJoueur[uid] = {
                uid, pseudo: data.pseudo || 'Pilote Anonyme',
                points: 0, nbPoleCorrecte: 0, nbVictoireCorrecte: 0,
                nbPodiumExact: 0, nbLoupes: 0, nbCoupDeFolie: 0
            };
        }
        const stats = parJoueur[uid];
        stats.pseudo = data.pseudo || stats.pseudo;

        const bilan = data.bilanCalcul;
        if (!bilan || bilan.pointsTotaux === undefined) return;

        stats.points += Number(bilan.pointsTotaux) || 0;
        if (bilan.pointsPole > 0) stats.nbPoleCorrecte++;

        const courseIdString = data.course || "";
        const round = parseInt(courseIdString.includes('/') ? courseIdString.split('/')[1] : courseIdString, 10);
        if (!isNaN(round)) {
            if (!historiqueParJoueur[uid]) historiqueParJoueur[uid] = {};
            historiqueParJoueur[uid][round] = Number(bilan.pointsTotaux) || 0;
        }

        const detail = bilan.detailPilotes || [];
        if (detail[0] && detail[0].statut === "position_exacte") stats.nbVictoireCorrecte++;
        if (detail[0]?.statut === "position_exacte" && detail[1]?.statut === "position_exacte" && detail[2]?.statut === "position_exacte") {
            stats.nbPodiumExact++;
        }
        detail.forEach((d: any) => {
            if (d.statut === "hors_top10") {
                stats.nbLoupes++;
            } else {
                const local = trouverPiloteLocalParNom(d.pilote);
                if (local && ECURIES_OUTSIDERS.includes(local.ecurie)) stats.nbCoupDeFolie++;
            }
        });
    });

    const joueurs = Object.values(parJoueur);
    joueurs.sort((a, b) => b.points - a.points);

    function leaders(cle: string): string[] {
        const max = Math.max(0, ...joueurs.map(j => (j[cle] as number) || 0));
        if (max === 0) return [];
        return joueurs.filter(j => j[cle] === max).map(j => j.uid);
    }

    const badges: Record<string, string[]> = {
        pole: leaders('nbPoleCorrecte'),
        victoire: leaders('nbVictoireCorrecte'),
        podium: leaders('nbPodiumExact'),
        loupe: leaders('nbLoupes'),
        folie: leaders('nbCoupDeFolie')
    };

    const setRounds = new Set<number>();
    Object.values(historiqueParJoueur).forEach(rounds => {
        Object.keys(rounds).forEach(r => setRounds.add(Number(r)));
    });
    const roundsCalcules = Array.from(setRounds).sort((a, b) => a - b);

    return { joueurs, badges, historiqueParJoueur, roundsCalcules };
}

// Construit les icônes de badges à afficher à côté du nom d'un joueur
export function badgesHtmlPourJoueur(uid: string, badges?: Record<string, string[]> | null): string {
    if (!badges) return '';
    return Object.keys(BADGES_INFO).map(cle => {
        if (!badges[cle] || !badges[cle].includes(uid)) return '';
        const info = BADGES_INFO[cle];
        return `<span title="${info.nom} — ${info.description}" style="margin-left:4px; cursor:help;">${info.icone}</span>`;
    }).join('');
}