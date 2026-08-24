import { pilotesData, ecuriesSaison, LOGOS_ECURIES_2026 } from "../utils/f1Data";
import { type EcurieResultatGP, type EcurieSaisonStats, type DetailEcurie } from "../utils/types";

export type GroupeEcurie = 'cador' | 'milieu' | 'outsider';

/**
 * Trouve l'écurie d'un pilote à partir de son nom
 */
export function trouverEcurieDePilote(nomPilote?: string | null): string {
    if (!nomPilote) return "";
    const cleanNom = (nomPilote || "").toLowerCase().trim();
    const p = pilotesData.find(p => {
        const pNom = p.nom.toLowerCase();
        return pNom.includes(cleanNom) || cleanNom.includes(pNom);
    });
    return p ? p.ecurie : "";
}

/**
 * Détermine le groupe d'une écurie selon son rang au championnat constructeurs
 * - Rang 1 à 4 : Cadors (Groupe A)
 * - Rang 5 à 7 : Milieu de peloton (Groupe B)
 * - Rang 8 à 11 : Outsiders (Groupe C)
 */
export function determinerGroupeEcurie(rangConstructeur: number): GroupeEcurie {
    if (rangConstructeur <= 4) return 'cador';
    if (rangConstructeur <= 7) return 'milieu';
    return 'outsider';
}

export function getLabelGroupe(groupe: GroupeEcurie): { label: string; badge: string; color: string } {
    switch (groupe) {
        case 'cador':
            return { label: 'Cador (Top 4)', badge: '🏆 Cador', color: '#ff8000' };
        case 'milieu':
            return { label: 'Milieu (5e-7e)', badge: '🛡️ Milieu', color: '#38bdf8' };
        case 'outsider':
            return { label: 'Outsider (8e-11e)', badge: '⚡ Outsider', color: '#22c55e' };
    }
}

export interface ResultatsGPPourCalculEcuries {
    top10: string[];
    top5Sprint?: string[];
    pilotesDNF?: string[];
    positionsToutes?: Record<string, number>;
}

/**
 * Évalue les pronostics Top et Flop avec l'ordre de priorité strict
 */
export function evaluerPronosticsEcuriesComplet(
    ecuriesTopJoueur: string[],
    ecuriesFlopJoueur: string[],
    resultatsGP: ResultatsGPPourCalculEcuries,
    statsConstructeurs: Record<string, { rang: number; pointsTotal: number }>
): {
    pointsTotaux: number;
    details: DetailEcurie[];
} {
    const top10 = resultatsGP.top10 || [];
    const dnfList = resultatsGP.pilotesDNF || [];
    const vainqueurNom = top10[0] || "";
    const ecurieVainqueur = trouverEcurieDePilote(vainqueurNom);
    
    // Identifier les écuries sur le podium (Top 3)
    const ecuriesPodium = top10.slice(0, 3).map(p => trouverEcurieDePilote(p)).filter(Boolean);

    // Calculer les positions des pilotes de chaque écurie dans le Top 10
    const pilotesTop10ParEcurie: Record<string, number[]> = {};
    const dnfParEcurie: Record<string, number> = {};

    ecuriesSaison.forEach(ec => {
        pilotesTop10ParEcurie[ec] = [];
        dnfParEcurie[ec] = 0;
    });

    top10.forEach((piloteNom, idx) => {
        const ec = trouverEcurieDePilote(piloteNom);
        if (ec && pilotesTop10ParEcurie[ec]) {
            pilotesTop10ParEcurie[ec].push(idx + 1); // 1-indexed position
        }
    });

    dnfList.forEach(piloteNom => {
        const ec = trouverEcurieDePilote(piloteNom);
        if (ec && dnfParEcurie[ec] !== undefined) {
            dnfParEcurie[ec]++;
        }
    });

    let pointsTotaux = 0;
    const details: DetailEcurie[] = [];

    // ==========================================
    // 🚀 ÉVALUATION DES ÉCURIES TOP (Top 1 & Top 2)
    // ==========================================
    ecuriesTopJoueur.forEach((ecurie, idx) => {
        if (!ecurie || ecurie === "Aucune") return;
        const typePari: 'top1' | 'top2' = idx === 0 ? 'top1' : 'top2';
        const rang = statsConstructeurs[ecurie]?.rang || (idx + 1);
        const groupe = determinerGroupeEcurie(rang);
        const positionsTop10 = pilotesTop10ParEcurie[ecurie] || [];
        const nbPilotesTop10 = positionsTop10.length;
        const meilleurPos = positionsTop10.length > 0 ? Math.min(...positionsTop10) : 99;

        let points = 0;
        let correct = false;
        let description = "";

        if (groupe === 'outsider') {
            // PRIORITÉ 1 : Exploit Outsider (8e à 11e)
            if (nbPilotesTop10 >= 2) {
                points = 6;
                correct = true;
                description = `🌟 Masterclass Outsider : 2 pilotes dans le Top 10 ! (+6 pts)`;
            } else if (nbPilotesTop10 >= 1) {
                points = 4;
                correct = true;
                description = `⚡ Exploit Outsider : Pilote classé P${meilleurPos} (+4 pts)`;
            } else {
                description = `Aucun pilote de l'outsider dans le Top 10 (0 pt)`;
            }
        } else if (groupe === 'milieu') {
            // PRIORITÉ 2 : Coup d'éclat Milieu de peloton (5e à 7e)
            if (nbPilotesTop10 >= 2) {
                points = 5;
                correct = true;
                description = `🔥 Superbe Tir Groupé : 2 pilotes dans le Top 10 (+5 pts)`;
            } else if (meilleurPos <= 6) {
                points = 3;
                correct = true;
                description = `🎯 Coup d'Éclat Milieu : Pilote classé P${meilleurPos} (+3 pts)`;
            } else {
                description = `Pas d'exploit ni de Top 6 pour ce milieu de peloton (0 pt)`;
            }
        } else {
            // PRIORITÉ 3 : Victoire / Domination Cador (1er à 4e)
            if (ecurie === ecurieVainqueur) {
                points = typePari === 'top1' ? 5 : 3;
                correct = true;
                description = `🏆 Victoire du Grand Prix (P1) pour le Cador (+${points} pts)`;
            } else if (positionsTop10.filter(p => p <= 5).length >= 2) {
                points = 3;
                correct = true;
                description = `🚀 Double Top 5 validé pour le Cador (+3 pts)`;
            } else {
                description = `Le Cador ne gagne pas et ne réalise pas de double Top 5 (0 pt)`;
            }
        }

        pointsTotaux += points;
        details.push({ ecurie, typePari, correct, points, description });
    });

    // ==========================================
    // ⚠️ ÉVALUATION DES ÉCURIES FLOP (Flop 1 & Flop 2)
    // ==========================================
    ecuriesFlopJoueur.forEach((ecurie, idx) => {
        if (!ecurie || ecurie === "Aucune") return;
        const typePari: 'flop1' | 'flop2' = idx === 0 ? 'flop1' : 'flop2';
        const rang = statsConstructeurs[ecurie]?.rang || 8;
        const groupe = determinerGroupeEcurie(rang);
        const positionsTop10 = pilotesTop10ParEcurie[ecurie] || [];
        const nbPilotesTop10 = positionsTop10.length;
        const dnfCount = dnfParEcurie[ecurie] || 0;
        const meilleurPos = positionsTop10.length > 0 ? Math.min(...positionsTop10) : 99;

        let points = 0;
        let correct = false;
        let description = "";

        // MALUS ULTIME : L'écurie en Flop gagne ou monte sur le podium
        if (ecurie === ecurieVainqueur || ecuriesPodium.includes(ecurie)) {
            points = -4;
            correct = false;
            description = `❌ Pénalité Flop : L'écurie est montée sur le podium / victoire ! (-4 pts)`;
        } else if (groupe === 'cador') {
            // PRIORITÉ 1 : Défaillance majeure d'un Cador (Top 4)
            if (nbPilotesTop10 === 0 || dnfCount >= 2) {
                points = 5;
                correct = true;
                description = `💥 Déroute Totale du Cador : 0 point / double DNF (+5 pts)`;
            } else if (dnfCount >= 1 && meilleurPos >= 7) {
                points = 4;
                correct = true;
                description = `⚠️ Crash & Contre-performance Cador : 1 DNF et meilleur pilote P${meilleurPos} (+4 pts)`;
            } else if (positionsTop10.filter(p => p <= 5).length === 0) {
                points = 3;
                correct = true;
                description = `📉 Échec Cador : Aucun pilote dans le Top 5 (+3 pts)`;
            } else {
                description = `Le Cador a assuré ses positions aux avant-postes (0 pt)`;
            }
        } else if (groupe === 'milieu') {
            // PRIORITÉ 2 : Zéro pointé du Milieu de peloton (5e à 7e)
            if (nbPilotesTop10 === 0) {
                points = 3;
                correct = true;
                description = `📉 Zéro pointé pour le milieu de peloton (+3 pts)`;
            } else {
                description = `Le milieu de peloton a marqué des points (0 pt)`;
            }
        } else {
            // PRIORITÉ 3 : Zéro pointé de l'Outsider (8e à 11e)
            if (nbPilotesTop10 === 0) {
                points = 2;
                correct = true;
                description = `⚪ Zéro pointé de l'outsider en fond de grille (+2 pts)`;
            } else {
                description = `L'outsider a réussi à entrer dans le Top 10 (0 pt)`;
            }
        }

        pointsTotaux += points;
        details.push({ ecurie, typePari, correct, points, description });
    });

    return {
        pointsTotaux: Math.max(0, pointsTotaux),
        details
    };
}

/**
 * Charge les stats constructeurs de la saison (API Jolpica / Firestore / Calcul auto)
 */
export async function chargerStatsConstructeursSaison(db?: any): Promise<EcurieSaisonStats[]> {
    // 1. Tenter l'API publique F1 Jolpica
    try {
        const res = await fetch("https://api.jolpica.com/ergast/f1/2026/constructorStandings.json", {
            signal: AbortSignal.timeout(3000)
        });
        if (res.ok) {
            const data = await res.json();
            const standings = data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings;
            if (Array.isArray(standings) && standings.length > 0) {
                const mapAPI: EcurieSaisonStats[] = standings.map((item: any) => {
                    const nomOfficiel = item.Constructor?.name || "";
                    const ecMatch = ecuriesSaison.find(e => nomOfficiel.toLowerCase().includes(e.toLowerCase()) || e.toLowerCase().includes(nomOfficiel.toLowerCase())) || nomOfficiel;
                    return {
                        ecurie: ecMatch,
                        pointsTotal: parseInt(item.points, 10) || 0,
                        victoires: parseInt(item.wins, 10) || 0,
                        podiums: 0,
                        rang: parseInt(item.position, 10) || 1
                    };
                });
                return mapAPI;
            }
        }
    } catch (_) {}

    // 2. Tenter Firestore
    if (db) {
        try {
            const statsDoc = await db.collection("statistiques_saison").doc("constructeurs_2026").get();
            if (statsDoc.exists && Array.isArray(statsDoc.data()?.constructeurs)) {
                return statsDoc.data().constructeurs;
            }
        } catch (_) {}
    }

    // 3. Classement initial par défaut si saison débutante
    return ecuriesSaison.map((ecurie, idx) => ({
        ecurie,
        pointsTotal: 0,
        victoires: 0,
        podiums: 0,
        rang: idx + 1
    }));
}
