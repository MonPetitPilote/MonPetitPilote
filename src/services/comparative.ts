import { calendrier2026, trouverPiloteLocalParNom, nomsCorrespondentLocal, type PronosticDoc, type BonusReelData } from "../utils";
import { construireComparatifBonusHtml } from "./bonus";

// Construit le HTML du comparatif "prono vs résultat réel" pour un pronostic donné.
export async function construireComparatifHtml(db: any, data: Partial<PronosticDoc> & Record<string, any>): Promise<string> {
    const bilan = data.bilanCalcul || {};
    const detailPilotes = bilan.detailPilotes || [];
    const dejaCalcule = bilan.pointsTotaux !== undefined;

    const courseIdString = data.course || "2026/12";
    const roundNumero = courseIdString.includes('/') ? courseIdString.split('/')[1] : courseIdString;

    const gpInfo = calendrier2026.find(gp => gp.round === Number(roundNumero));
    const nomCompletGP = gpInfo ? `${gpInfo.nom} (${gpInfo.circuit})` : `ROUND ${roundNumero}`;

    const listePilotesPronostiques: string[] = data.classementPilotes || [];

    // Résultat officiel du GP
    let officialTop10: string[] = [];
    let officialPoleman: string | null = null;
    let ecurieGagnante: string | null = null;
    let bonusReelGP: BonusReelData | null = null;
    try {
        const histoDoc = await db.collection("historique_courses").doc(`2026_${roundNumero}`).get();
        if (histoDoc.exists) {
            const histo = histoDoc.data();
            officialTop10 = histo.top10 || [];
            officialPoleman = histo.poleman || null;
            bonusReelGP = histo.bonusReel || null;
            if (officialTop10[0]) {
                const local = trouverPiloteLocalParNom(officialTop10[0]);
                ecurieGagnante = local ? local.ecurie : null;
            }
        }
    } catch (error) {
        console.error("Erreur chargement résultat officiel pour comparatif :", error);
    }

    let top10Html = "";
    if (listePilotesPronostiques.length === 0) {
        top10Html = `<li style="color: #616e88; font-style: italic;">Aucune grille enregistrée</li>`;
    } else {
        top10Html = listePilotesPronostiques.map((pilote, index) => {
            const resultatReel = officialTop10[index] || "—";

            if (!dejaCalcule) {
                return `<li style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #2d3954; font-size: 0.9rem;">
                    <span><strong>P${index + 1} :</strong> ${pilote}</span>
                    <span style="color: #616e88; font-weight: bold;">-- pts</span>
                </li>`;
            }

            const infoPilote = detailPilotes[index] || { points: 0, statut: "hors_top10" };
            let icone = "❌";
            let precision = "";
            if (infoPilote.statut === "position_exacte") {
                icone = "✅";
            } else if (infoPilote.statut === "dans_le_top10") {
                icone = "➕";
                const positionReelle = officialTop10.findIndex(p => nomsCorrespondentLocal(p, pilote));
                if (positionReelle !== -1) precision = ` (fini P${positionReelle + 1})`;
            }
            const colorPoints = infoPilote.points > 0 ? `#4cd137` : `#ef4444`;

            return `<li style="display: flex; align-items: center; gap: 8px; padding: 7px 0; border-bottom: 1px dashed #2d3954; font-size: 0.85rem;">
                <span style="min-width: 26px;">${icone}</span>
                <span style="flex: 1;"><strong>P${index + 1} :</strong> ${pilote}${precision ? `<span style="color:#616e88;">${precision}</span>` : ''}</span>
                <span style="flex: 1; text-align: right; color: #616e88;">Réel : ${resultatReel}</span>
                <span style="min-width: 55px; text-align: right; color: ${colorPoints}; font-weight: bold;">+${infoPilote.points} pts</span>
            </li>`;
        }).join('');
    }

    const ptsTotaux = bilan.pointsTotaux || 0;
    const ptsGrille = bilan.pointsGrille || 0;
    const ptsPole = bilan.pointsPole || 0;
    const ptsEcuries = bilan.pointsEcuries || 0;
    const ptsBonus = bilan.pointsBonus || 0;

    const ecoTop1 = (data.ecuriesTop && data.ecuriesTop[0]) || 'Aucune';
    const ecoTop2 = (data.ecuriesTop && data.ecuriesTop[1]) || 'Aucune';
    const ecoFlop1 = (data.ecuriesFlop && data.ecuriesFlop[0]) || 'Aucune';
    const ecoFlop2 = (data.ecuriesFlop && data.ecuriesFlop[1]) || 'Aucune';

    let ligneComparatifPole = `<div style="display: flex; justify-content: space-between; padding: 4px 0;"><span>⚡ Poleman :</span> <strong>${data.poleman || 'Aucun'}</strong></div>`;
    if (dejaCalcule) {
        const poleCorrecte = data.poleman && officialPoleman && nomsCorrespondentLocal(officialPoleman, data.poleman);
        ligneComparatifPole = `<div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0;">
            <span>${poleCorrecte ? '✅' : '❌'} Poleman : <strong>${data.poleman || 'Aucun'}</strong></span>
            <span style="color: #616e88;">Réel : ${officialPoleman || '—'}</span>
        </div>`;
    }

    function ligneEcurie(label: string, nomEcurie: string, estUnTop: boolean): string {
        if (!dejaCalcule || !nomEcurie || nomEcurie === 'Aucune' || !ecurieGagnante) {
            return `<div style="display: flex; justify-content: space-between; padding: 4px 0;"><span>${label} :</span> <strong>${nomEcurie}</strong></div>`;
        }
        const correspond = nomsCorrespondentLocal(ecurieGagnante, nomEcurie);
        const bonPari = estUnTop ? correspond : !correspond;
        return `<div style="display: flex; justify-content: space-between; padding: 4px 0;">
            <span>${bonPari ? '✅' : '❌'} ${label} : <strong>${nomEcurie}</strong></span>
        </div>`;
    }

    return `
        <h4 style="color: #ff8000; margin-bottom: 5px; text-transform: uppercase; font-size: 1.1rem; letter-spacing: 0.5px;">🏁 ${nomCompletGP}</h4>
        <p style="font-size: 0.85rem; color: #aaa; margin-top:0;">Statut : <strong style="color: ${dejaCalcule ? '#4cd137' : '#ff8000'};">${dejaCalcule ? 'Calculé' : 'En attente du calcul'}</strong></p>

        <div style="background: rgba(255,255,255,0.02); border: 1px solid #2f3e56; border-radius: 8px; padding: 15px; margin-bottom: 15px; text-align: center;">
            <div style="font-size: 0.85rem; color: #616e88; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Score obtenu</div>
            <div style="font-size: 2rem; font-weight: 900; color: #4cd137; margin: 5px 0;">${ptsTotaux} <span style="font-size: 1rem; font-weight: bold;">pts</span></div>
        </div>

        <h5 style="margin: 0 0 10px 0; color: #00d2d3; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.5px;">📊 Répartition des Points</h5>
        <div style="font-size: 0.9rem; color: #e2e8f0; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; padding: 5px 0;"><span>🏎️ Prono Grille Top 10 :</span> <strong style="color: #fff;">+${ptsGrille} pts</strong></div>
            <div style="display: flex; justify-content: space-between; padding: 5px 0;"><span>⚡ Bonus Pole Position :</span> <strong style="color: #fff;">+${ptsPole} pts</strong></div>
            <div style="display: flex; justify-content: space-between; padding: 5px 0;"><span>🏁 Bonus Écuries (Top/Flop) :</span> <strong style="color: #fff;">+${ptsEcuries} pts</strong></div>
            <div style="display: flex; justify-content: space-between; padding: 5px 0;"><span>🎲 Prédictions Bonus :</span> <strong style="color: #fff;">+${ptsBonus} pts</strong></div>
        </div>

        <hr style="border: 0; border-top: 1px solid #2d3954; margin: 15px 0;">

        <h5 style="margin: 0 0 10px 0; color: #ff8000; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.5px;">📋 Choix vs le résultat réel</h5>
        <div style="font-size: 0.9rem; color: #e2e8f0; margin-bottom: 15px;">
            ${ligneComparatifPole}
            ${ligneEcurie('🚀 Écurie Top 1', ecoTop1, true)}
            ${ligneEcurie('🚀 Écurie Top 2', ecoTop2, true)}
            ${ligneEcurie('⚠️ Écurie Flop 1', ecoFlop1, false)}
            ${ligneEcurie('⚠️ Écurie Flop 2', ecoFlop2, false)}
        </div>

        <h5 style="margin: 20px 0 10px 0; color: #00d2d3; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.5px;">🎲 Prédictions Bonus</h5>
        <div style="font-size: 0.9rem; color: #e2e8f0; margin-bottom: 15px;">
            ${construireComparatifBonusHtml(data.predictionsBonus, bonusReelGP, dejaCalcule, bilan.detailBonus)}
        </div>

        <h5 style="margin: 20px 0 10px 0; color: #00d2d3; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.5px;">🏎️ Grille Top 10 vs le résultat réel</h5>
        <ul style="margin: 0; padding: 0; list-style: none;">
            ${top10Html}
        </ul>
    `;
}

// Affiche dans une modale le prono d'un ami
export async function voirPronoJoueur(db: any, uid: string, pseudo: string, courseId: string, verrouille: boolean): Promise<void> {
    const modale = document.getElementById('modale-prono-ami');
    const zone = document.getElementById('zone-prono-ami');
    if (!modale || !zone) return;

    modale.style.display = 'flex';
    const round = parseInt((courseId || "").split('/')[1], 10);
    const gpInfo = calendrier2026.find(g => g.round === round);
    const nomGP = gpInfo ? gpInfo.nom : courseId;

    if (!verrouille) {
        zone.innerHTML = `
            <h4 style="color:#ff8000; margin-top:0;">👤 ${pseudo}</h4>
            <p style="color:#ef4444; font-weight:bold;">🔒 Les pronostics des autres joueurs restent secrets tant que le week-end "${nomGP}" n'a pas commencé, pour préserver l'équité du jeu.</p>
        `;
        return;
    }

    zone.innerHTML = `<p style="color:#aaa; text-align:center;">Chargement...</p>`;

    try {
        const doc = await db.collection("pronostics").doc(`${uid}_${courseId.replace('/', '_')}`).get();
        if (!doc.exists) {
            zone.innerHTML = `<h4 style="color:#ff8000; margin-top:0;">👤 ${pseudo}</h4><p style="color:#aaa; font-style:italic;">Ce joueur n'a soumis aucun pronostic pour ce Grand Prix.</p>`;
            return;
        }
        const comparatifHtml = await construireComparatifHtml(db, doc.data());
        zone.innerHTML = `<h4 style="color:#ff8000; margin-top:0;">👤 ${pseudo}</h4>` + comparatifHtml;
    } catch (error) {
        console.error("Erreur chargement prono ami :", error);
        zone.innerHTML = `<p style="color:#ef4444;">Erreur lors du chargement du pronostic.</p>`;
    }
}
