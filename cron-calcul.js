const admin = require('firebase-admin');
const axios = require('axios');

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.error("❌ Erreur : Le secret FIREBASE_SERVICE_ACCOUNT est manquant.");
    process.exit(1);
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

const totalRounds = 24; // La saison 2026 comporte 24 Grands Prix

const pilotesData = [
  {nom: "Max Verstappen", ecurie: "Red Bull", statut: "favori"},
  {nom: "Isack Hadjar", ecurie: "Red Bull", statut: "outsider"},
  {nom: "Lewis Hamilton", ecurie: "Ferrari", statut: "favori"},
  {nom: "Charles Leclerc", ecurie: "Ferrari", statut: "favori"},
  {nom: "Lando Norris", ecurie: "McLaren", statut: "favori"},
  {nom: "Oscar Piastri", ecurie: "McLaren", statut: "favori"},
  {nom: "George Russell", ecurie: "Mercedes", statut: "favori"},
  {nom: "Kimi Antonelli", ecurie: "Mercedes", statut: "favori"},
  {nom: "Fernando Alonso", ecurie: "Aston Martin", statut: "outsider"},
  {nom: "Lance Stroll", ecurie: "Aston Martin", statut: "outsider"},
  {nom: "Pierre Gasly", ecurie: "Alpine", statut: "outsider"},
  {nom: "Franco Colapinto", ecurie: "Alpine", statut: "outsider"},
  {nom: "Carlos Sainz", ecurie: "Williams", statut: "outsider"},
  {nom: "Alex Albon", ecurie: "Williams", statut: "outsider"},
  {nom: "Liam Lawson", ecurie: "Racing Bulls", statut: "outsider"},
  {nom: "Arvid Lindblad", ecurie: "Racing Bulls", statut: "outsider"},
  {nom: "Nico Hülkenberg", ecurie: "Audi", statut: "outsider"},
  {nom: "Gabriel Bortoleto", ecurie: "Audi", statut: "outsider"},
  {nom: "Oliver Bearman", ecurie: "Haas", statut: "outsider"},
  {nom: "Esteban Ocon", ecurie: "Haas", statut: "outsider"},
  {nom: "Valtteri Bottas", ecurie: "Cadillac", statut: "outsider"},
  {nom: "Sergio Pérez", ecurie: "Cadillac", statut: "outsider"}
];

async function demarrer() {
    console.log("🤖 Lancement du cron de calcul des points...");
    
    for (let round = 1; round <= totalRounds; round++) {
        const gpId = `2026/${round}`;
        const histoRef = db.collection("historique_courses").doc(`2026_${round}`);
        
        // On vérifie si ce GP a déjà été calculé et verrouillé par le passé
        const histoDoc = await histoRef.get();
        if (histoDoc.exists) {
            console.log(`ℹ️ Le GP ${round} a déjà été archivé. Passage au suivant.`);
            continue;
        }

        try {
            // 1. Appel de l'API OpenF1 pour obtenir les données de la course (Session Race)
            const resSessions = await axios.get(`https://api.openf1.org/v1/sessions?year=2026&round=${round}&session_name=Race`);
            if (!resSessions.data || resSessions.data.length === 0) {
                console.log(`⚠️ Aucune session de course trouvée pour le GP ${round} (en attente que le GP ait lieu).`);
                continue; 
            }
            
            const sessionKey = resSessions.data[0].session_key;

            // 2. Récupération des positions finales réelles (Classement final de la course)
            const resPositions = await axios.get(`https://api.openf1.org/v1/position?session_key=${sessionKey}`);
            if (!resPositions.data || resPositions.data.length === 0) {
                console.log(`⚠️ Données de positions vides pour le GP ${round}.`);
                continue;
            }

            // Extraction et tri des pilotes du premier au dernier
            const records = resPositions.data;
            const derniersPositions = {};
            records.forEach(rec => {
                const driverNum = rec.driver_number;
                if (!derniersPositions[driverNum] || new Date(rec.date) > new Date(derniersPositions[driverNum].date)) {
                    derniersPositions[driverNum] = rec;
                }
            });

            const classementTrie = Object.values(derniersPositions).sort((a, b) => a.position - b.position);
            const top10OfficielNums = classementTrie.slice(0, 10).map(p => String(p.driver_number));

            if (top10OfficielNums.length < 10) {
                console.log(`⚠️ Grille officielle incomplète pour le GP ${round}. Calcul suspendu.`);
                continue;
            }

            // Traduction des numéros en noms complets textuels
            const top10Officiel = top10OfficielNums.map(num => {
                const match = pilotesData.find(p => p.numero === num);
                return match ? match.nom : `Numéro ${num}`;
            });

            // 3. Récupération du Poleman officiel (Session Qualifying)
            let polemanOfficiel = "Inconnu";
            const resQualif = await axios.get(`https://api.openf1.org/v1/sessions?year=2026&round=${round}&session_name=Qualifying`);
            if (resQualif.data && resQualif.data.length > 0) {
                const qSessionKey = resQualif.data[0].session_key;
                const resPositionsQ = await axios.get(`https://api.openf1.org/v1/position?session_key=${qSessionKey}&position=1`);
                if (resPositionsQ.data && resPositionsQ.data.length > 0) {
                    const numPole = String(resPositionsQ.data[0].driver_number);
                    const matchPole = pilotesData.find(p => p.numero === numPole);
                    if (matchPole) polemanOfficiel = matchPole.nom;
                }
            }

            const vainqueurNom = top10Officiel[0];
            const vainqueurInfos = pilotesData.find(p => p.nom === vainqueurNom);
            const ecurieGagnanteRelle = vainqueurInfos ? vainqueurInfos.ecurie : "";

            console.log(`🏁 Résultats validés pour le GP ${round} :`);
            console.log(`🥇 P1: ${vainqueurNom} (${ecurieGagnanteRelle}) | ⚡ Pole: ${polemanOfficiel}`);

            // 4. Parcours des pronostics des joueurs pour ce Grand Prix précis
            const querySnapshot = await db.collection("pronostics").where("course", "==", gpId).get();
            
            if (querySnapshot.empty) {
                console.log(`💡 Aucun pronostic utilisateur trouvé pour le GP ${round}.`);
            } else {
                // CORRECTION SÉCURISÉE : Utilisation d'un for...of pour gérer correctement l'asynchronisme
                for (const doc of querySnapshot.docs) {
                    const pronoRef = doc.ref;
                    
                    await db.runTransaction(async (transaction) => {
                        const pronoDoc = await transaction.get(pronoRef);
                        if (!pronoDoc.exists) return;
                        
                        const pronoData = pronoDoc.data();
                        const grilleJoueur = pronoData.classementPilotes || [];
                        const polemanJoueur = pronoData.poleman || "";
                        const ecuriesTopJoueur = pronoData.ecuriesTop || [];
                        const ecuriesFlopJoueur = pronoData.ecuriesFlop || [];
                        const pseudo = pronoData.pseudo || "Anonyme";

                        let pointsDuTop10 = 0;
                        let bonusPole = 0;
                        let pointsDesEcuries = 0;

                        // Barème Prono Grille Top 10
                        grilleJoueur.forEach((piloteChoisi, indexJoueur) => {
                            const indexReel = top10Officiel.indexOf(piloteChoisi);
                            if (indexReel !== -1) {
                                if (indexJoueur === indexReel) {
                                    // Position exacte trouvée
                                    if (indexJoueur === 0) pointsDuTop10 += 25;
                                    else if (indexJoueur === 1) pointsDuTop10 += 18;
                                    else if (indexJoueur === 2) pointsDuTop10 += 15;
                                    else if (indexJoueur === 3) pointsDuTop10 += 12;
                                    else if (indexJoueur === 4) pointsDuTop10 += 10;
                                    else if (indexJoueur === 5) pointsDuTop10 += 8;
                                    else if (indexJoueur === 6) pointsDuTop10 += 6;
                                    else if (indexJoueur === 7) pointsDuTop10 += 4;
                                    else if (indexJoueur === 8) pointsDuTop10 += 2;
                                    else if (indexJoueur === 9) pointsDuTop10 += 1;
                                } else {
                                    // Présent dans le top 10 mais mauvaise place
                                    pointsDuTop10 += 2;
                                }
                            }
                        });

                        // Barème Bonus Pole Position (+5 points)
                        if (polemanJoueur === polemanOfficiel && polemanOfficiel !== "Inconnu") {
                            bonusPole = 5;
                        }

                        // Barème Bonus Écuries Constructeurs (basé sur l'écurie gagnante réelle de la course)
                        if (ecurieGagnanteRelle) {
                            if (ecuriesTopJoueur[0] === ecurieGagnanteRelle) pointsDesEcuries += 5;
                            if (ecuriesTopJoueur[1] === ecurieGagnanteRelle) pointsDesEcuries += 2;
                            if (ecuriesFlopJoueur.includes(ecurieGagnanteRelle)) pointsDesEcuries -= 5;
                        }

                        // Calcul global avec application du multiplicateur Joker (x2)
                        let pointsGagnes = pointsDuTop10 + bonusPole + pointsDesEcuries;
                        if (pronoData.jokerUtilise === true) {
                            pointsGagnes = pointsGagnes * 2;
                        }

                        // 🎯 ÉCRITURE DU BILAN CALCULÉ DANS LE GRAND PRIX DE L'UTILISATEUR
                        transaction.set(pronoRef, {
                            bilanCalcul: {
                                pointsTotaux: pointsGagnes,
                                detailTop10: pointsDuTop10,
                                bonusPole: bonusPole,
                                bonusEcuries: pointsDesEcuries,
                                jokerApplique: pronoData.jokerUtilise || false,
                                calculeLe: new Date()
                            }
                        }, { merge: true });
                        
                        console.log(`✅ Score calculé pour ${pseudo} : +${pointsGagnes} pts`);
                    });
                }
            }

            // Archivage final de la course pour éviter un re-calcul au prochain lancement du cron
            await histoRef.set({ calculeLe: new Date(), top10: top10Officiel, poleman: polemanOfficiel });
            console.log(`🔒 GP ${round} archivé et validé avec succès.`);

        } catch (error) {
            console.error(`⚠️ Erreur lors du calcul réseau pour le GP ${round}:`, error.message);
            break; 
        }
    }
    console.log("🤖 Fin d'exécution du cron avec succès.");
}

demarrer();
