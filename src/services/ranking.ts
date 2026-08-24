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
export async function calculerStatistiquesEtClassement(db: any, membresLigueActive?: Set<string> | null): Promise<StatistiquesSaison> {
    const snapshot = await Promise.race([
        db.collection("pronostics").get(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Délai dépassé : impossible de contacter la base de données.")), 10000))
    ]) as any;
    const parJoueur: Record<string, JoueurClassement> = {};
    const historiqueParJoueur: Record<string, Record<number, number>> = {};

    snapshot.forEach((doc: any) => {
        const data = doc.data();
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

// Affiche, pour chaque badge, le top 3 des joueurs sur ce critère
export function afficherClassementBadges(stats?: StatistiquesSaison | null, utilisateurActuel?: any): void {
    const zone = document.getElementById('profil-classement-badges');
    if (!zone || !stats) return;

    zone.innerHTML = Object.keys(BADGES_INFO).map(cle => {
        const info = BADGES_INFO[cle];
        const statKey = BADGES_STAT_KEY[cle];

        const top3 = [...(stats.joueurs || [])]
            .filter(j => j[statKey] > 0)
            .sort((a, b) => b[statKey] - a[statKey])
            .slice(0, 3);

        const ligneJoueurs = top3.length === 0
            ? `<p style="color:#616e88; font-size:0.78rem; font-style:italic; margin:4px 0 0 0;">Personne pour l'instant.</p>`
            : top3.map((j, idx) => {
                const estMoi = utilisateurActuel && j.uid === utilisateurActuel.uid;
                return `<div style="display:flex; justify-content:space-between; font-size:0.82rem; padding:3px 0; ${estMoi ? 'color:#ff8000; font-weight:bold;' : 'color:#e2e8f0;'}">
                    <span>${idx + 1}. ${j.pseudo}${estMoi ? ' (vous)' : ''}</span>
                    <span>${j[statKey]}</span>
                </div>`;
            }).join('');

        return `
            <div style="background:rgba(255,255,255,0.02); border:1px solid #2d3954; border-radius:8px; padding:12px 14px;">
                <div style="font-weight:bold; color:#00d2d3; font-size:0.85rem; margin-bottom:6px;">${info.icone} ${info.nom}</div>
                ${ligneJoueurs}
            </div>
        `;
    }).join('');
}

// Affiche les badges obtenus par le joueur connecté
export function afficherBadgesProfil(stats?: StatistiquesSaison | null, utilisateurActuel?: any): void {
    const zone = document.getElementById('profil-badges-liste');
    if (!zone || !utilisateurActuel || !stats) return;

    const monJoueur = (stats.joueurs || []).find(j => j.uid === utilisateurActuel.uid);

    const compteurs: Record<string, number> = {
        pole: monJoueur?.nbPoleCorrecte || 0,
        victoire: monJoueur?.nbVictoireCorrecte || 0,
        podium: monJoueur?.nbPodiumExact || 0,
        loupe: monJoueur?.nbLoupes || 0,
        folie: monJoueur?.nbCoupDeFolie || 0
    };

    zone.innerHTML = Object.keys(BADGES_INFO).map(cle => {
        const info = BADGES_INFO[cle];
        const possede = monJoueur && stats.badges[cle]?.includes(monJoueur.uid);
        return `
            <div title="${info.description}" style="text-align:center; background:${possede ? 'rgba(255,128,0,0.12)' : 'rgba(255,255,255,0.02)'}; border:1px solid ${possede ? '#ff8000' : '#2d3954'}; border-radius:8px; padding:12px 14px; min-width:110px; opacity:${possede ? '1' : '0.5'};">
                <div style="font-size:1.8rem;">${info.icone}</div>
                <div style="font-size:0.72rem; font-weight:bold; text-transform:uppercase; margin-top:4px; color:${possede ? '#ff8000' : '#a0aec0'};">${info.nom}</div>
                <div style="font-size:0.7rem; color:#616e88; margin-top:4px;">${compteurs[cle]}</div>
            </div>
        `;
    }).join('');

    afficherClassementBadges(stats, utilisateurActuel);
}
