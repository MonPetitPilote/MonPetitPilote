const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const axios = require('axios');

try {
    // Initialisation native (utilise GOOGLE_APPLICATION_CREDENTIALS du YAML)
    initializeApp();
    console.log("🚀 [Firebase] Connexion réussie de manière native !");
} catch (e) {
    console.error("❌ Erreur critique d'initialisation de Firebase :", e.message);
    process.exit(1);
}

const db = getFirestore();

async function demarrer() {
    console.log("🤖 Lancement du cron de calcul automatique OpenF1 2026 (Mode Dynamique)...");
    
    try {
        // 1. Récupération automatique de toutes les sessions "Race" de 2026 ordonnées par date
        console.log("📡 Récupération du calendrier des sessions 2026...");
        const resSessions = await axios.get("https://api.openf1.org/v1/sessions?year=2026&session_name=Race", { timeout: 10000 });
        
        if (!resSessions.data || resSessions.data.length === 0) {
            console.log("⚠️ Aucune session de course trouvée pour 2026 sur OpenF1.");
            return;
        }

        // Trier les sessions par ordre chronologique
        const sessionsChronologiques = resSessions.data.sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
        console.log(`ℹ️ ${sessionsChronologiques.length} sessions de course détectées.`);

        // 2. Boucle sur les sessions (l'index détermine le numéro du Round)
        for (let index = 0; index < sessionsChronologiques.length; index++) {
            const session = sessionsChronologiques[index];
            const round = index + 1;
            const sessionKey = session.session_key;
            const gpId = `2026/${round}`;

            console.log(`\n🏁 --- Analyse du GP Round ${round} (${session.location}) | Clé Session: ${sessionKey} ---`);
            // Pause de 2 secondes pour ne pas surcharger l'API OpenF1
            await sleep(2000);

            // Anti-doublon : Vérifier si ce GP a déjà été archivé dans Firestore
            const histoRef = db.collection("historique_courses").doc(`2026_${round}`);
            const histoDoc = await histoRef.get();
            if (histoDoc.exists) {
                console.log(`ℹ️ Le GP ${round} a déjà été calculé et archivé. Passage au suivant.`);
                continue;
            }

            // 3. Récupération dynamique de la liste des pilotes pour CETTE session spécifique
            console.log(`📡 Récupération de l'annuaire des pilotes pour la session ${sessionKey}...`);
            let pilotesSession = [];
            try {
                const resDrivers = await axios.get(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`, { timeout: 10000 });
                pilotesSession = resDrivers.data || [];
            } catch (driverErr) {
                console.error(`❌ Impossible de récupérer les pilotes de la session ${sessionKey}:`, driverErr.message);
                continue;
            }

            // Fonction utilitaire pour trouver le nom d'un pilote via son numéro d'après l'API de cette session
            const trouverNomPilote = (driverNumber) => {
                const match = pilotesSession.find(p => String(p.driver_number) === String(driverNumber));
                return match ? match.full_name : `Numéro ${driverNumber}`;
            };

            const trouverEcuriePilote = (driverNumber) => {
                const match = pilotesSession.find(p => String(p.driver_number) === String(driverNumber));
                return match ? match.team_name : "";
            };

            // 4. Récupération des positions en course
            let resPositions;
            try {
                resPositions = await axios.get(`https://api.openf1.org/v1/position?session_key=${sessionKey}`, { timeout: 15000 });
            } catch (posErr) {
                console.error(`❌ Impossible de joindre l'API positions pour la session ${sessionKey}:`, posErr.message);
                continue;
            }

            if (!resPositions.data || resPositions.data.length === 0) {
                console.log(`⚠️ Les données de position pour le GP ${round} sont vides (Course non courue).`);
                continue;
            }

            // Filtrage pour extraire la position finale (la plus récente en date) de chaque pilote
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
                console.log(`⚠️ Classement incomplet pour le GP ${round}.`);
                continue;
            }

            // Traduction des numéros officiels en noms complets issus de l'API
            const top10OfficielNoms = top10OfficielNums.map(num => trouverNomPilote(num));
            console.log(`📊 Classement Top 10 réel calculé :`, top10OfficielNoms);

            // 5. Récupération du Poleman de manière géolocalisée pour 2026
            let polemanOfficiel = "Inconnu";
            try {
                const resQualif = await axios.get(`https://api.openf1.org/v1/sessions?year=2026&session_name=Qualifying&location=${encodeURIComponent(session.location)}`, { timeout: 10000 });
                if (resQualif.data && resQualif.data.length > 0) {
                    const qSessionKey = resQualif.data[0].session_key;
                    const resPositionsQ = await axios.get(`https://api.openf1.org/v1/position?session_key=${qSessionKey}&position=1`, { timeout: 10000 });
                    if (resPositionsQ.data && resPositionsQ.data.length > 0) {
                        polemanOfficiel = trouverNomPilote(resPositionsQ.data[0].driver_number);
                    }
                }
            } catch (pErr) {
                console.log(`ℹ️ Poleman introuvable pour le GP ${round}`);
            }

            const vainqueurNumero = top10OfficielNums[0];
            const ecurieGagnanteRelle = trouverEcuriePilote(vainqueurNumero);

            console.log(`🎯 Résultats validés : P1 = ${top10OfficielNoms[0]} (${ecurieGagnanteRelle}) | Pole = ${polemanOfficiel}`);

            // 6. Traitement des pronostics des joueurs dans Firestore
            const querySnapshot = await db.collection("pronostics").where("course", "==", gpId).get();
            
            if (!querySnapshot.empty) {
                for (const doc of querySnapshot.docs) {
                    const pronoRef = doc.ref;
                    try {
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

                            // Calcul de la grille des pilotes (Comparaison insensible à la casse et souple)
                            grilleJoueur.forEach((piloteChoisi, indexJoueur) => {
                                const indexReel = top10OfficielNoms.findIndex(pReel => 
                                    pReel.toLowerCase().includes(piloteChoisi.toLowerCase()) || 
                                    piloteChoisi.toLowerCase().includes(pReel.toLowerCase())
                                );

                                if (indexReel !== -1) {
                                    if (indexJoueur === indexReel) {
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
                                        pointsDuTop10 += 2;
                                    }
                                }
                            });

                            // Bonus Poleman
                            if (polemanJoueur && polemanOfficiel !== "Inconnu" && (polemanOfficiel.toLowerCase().includes(polemanJoueur.toLowerCase()) || polemanJoueur.toLowerCase().includes(polemanOfficiel.toLowerCase()))) {
                                bonusPole = 5;
                            }

                            // Bonus/Malus Écuries
                            if (ecurieGagnanteRelle) {
                                const checkEcurie = (ecurieJoueur, ecurieReelle) => ecurieReelle.toLowerCase().includes(ecurieJoueur.toLowerCase()) || ecurieJoueur.toLowerCase().includes(ecurieReelle.toLowerCase());

                                if (ecuriesTopJoueur[0] && checkEcurie(ecuriesTopJoueur[0], ecurieGagnanteRelle)) pointsDesEcuries += 5;
                                if (ecuriesTopJoueur[1] && checkEcurie(ecuriesTopJoueur[1], ecurieGagnanteRelle)) pointsDesEcuries += 2;
                                if (ecuriesFlopJoueur.some(ef => checkEcurie(ef, ecurieGagnanteRelle))) pointsDesEcuries -= 5;
                            }

                            let pointsGagnes = pointsDuTop10 + bonusPole + pointsDesEcuries;
                            if (pronoData.jokerUtilise === true) pointsGagnes *= 2;

                            // Injection du bilan dans Firestore
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
                            
                            console.log(`   ✅ Score calculé mis à jour pour ${pseudo} : +${pointsGagnes} pts`);
                        });
                    } catch (txError) {
                        console.error(`   ❌ Erreur transaction joueur ${doc.id}:`, txError.message);
                    }
                }
            }

            // Sauvegarder dans l'historique pour clore le traitement de cette session
            await histoRef.set({ calculeLe: new Date(), top10: top10OfficielNoms, poleman: polemanOfficiel });
            console.log(`ℹ️ GP ${round} archivé avec succès.`);
        }
        console.log("\n🤖 Fin du traitement global de la saison 2026.");
    } catch (globalErr) {
        console.error("❌ Erreur générale de traitement :", globalErr.message);
        process.exit(1);
    }
}

demarrer();
