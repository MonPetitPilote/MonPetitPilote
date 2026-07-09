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

// Fonction utilitaire pour créer une pause et éviter l'erreur 429 (Rate Limit)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 🗓️ CALENDRIER OFFICIEL DE TON SITE (Saison 2026)
// Les clés à gauche reprennent STRICTEMENT le champ "location" de l'API OpenF1.
// Les chiffres à droite correspondent aux identifiants "course" dans ta base (ex: 2026/12).
const calendrier2026 = {
    "Melbourne": 1,
    "Shanghai": 2,
    "Suzuka": 3,
    // Rounds 4 (Sakhir) et 5 (Jeddah) annulés par la FIA, absents de l'API OpenF1
    "Miami Gardens": 6,
    "Montréal": 7,
    "Monte Carlo": 8,
    "Barcelona": 9,
    "Spielberg": 10,
    "Silverstone": 11,
    "Spa-Francorchamps": 12,
    "Budapest": 13,
    "Zandvoort": 14,
    "Monza": 15,
    "Baku": 16,
    "Marina Bay": 17,
    "Austin": 18,
    "Mexico City": 19,
    "São Paulo": 20,
    "Las Vegas": 21,
    "Lusail": 22,
    "Yas Marina": 23
};

async function demarrer() {
    console.log("🤖 Lancement du cron de calcul automatique OpenF1 2026...");
    
    try {
        // 1. Récupération de toutes les sessions "Race" de 2026
        console.log("📡 Récupération du calendrier des sessions 2026 depuis OpenF1...");
        const resSessions = await axios.get("https://api.openf1.org/v1/sessions?year=2026&session_name=Race", { timeout: 10000 });
        
        if (!resSessions.data || resSessions.data.length === 0) {
            console.log("⚠️ Aucune session de course trouvée pour 2026 sur OpenF1.");
            return;
        }

        // Trier chronologiquement pour traiter les courses dans le bon ordre
        const sessionsChronologiques = resSessions.data.sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
        console.log(`ℹ️ ${sessionsChronologiques.length} sessions réelles détectées dans l'API.`);

        // 2. Boucle sur les sessions de l'API
        for (let index = 0; index < sessionsChronologiques.length; index++) {
            const session = sessionsChronologiques[index];
            const sessionKey = session.session_key;
            
            // Récupération dynamique du numéro de round de ton site via le nom du circuit
            const round = calendrier2026[session.location];
            
            if (!round) {
                console.log(`\nℹ️ Circuit "${session.location}" non configuré ou non requis pour le moment. Passage.`);
                continue;
            }

            const gpId = `2026/${round}`;

            console.log(`\n🏁 --- Analyse : ${session.location} | Associé au Round Site : ${round} | Clé Session : ${sessionKey} ---`);

            // 🛑 SÉCURITÉ RATE-LIMIT : Pause de 2,5 secondes avant les requêtes lourdes
            await sleep(2500);

            // Anti-doublon : On vérifie si ce Round a déjà été calculé et enregistré
            const histoRef = db.collection("historique_courses").doc(`2026_${round}`);
            const histoDoc = await histoRef.get();
            if (histoDoc.exists) {
                console.log(`ℹ️ Le GP ${round} (${session.location}) a déjà été calculé et archivé. Passage au suivant.`);
                continue;
            }

            // 3. Récupération dynamique de l'annuaire des pilotes pour cette course
            console.log(`📡 Récupération des pilotes pour la session ${sessionKey}...`);
            let pilotesSession = [];
            try {
                const resDrivers = await axios.get(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`, { timeout: 10000 });
                pilotesSession = resDrivers.data || [];
            } catch (driverErr) {
                console.error(`❌ Impossible de récupérer les pilotes (Session ${sessionKey}):`, driverErr.message);
                continue;
            }

            const trouverNomPilote = (driverNumber) => {
                const match = pilotesSession.find(p => String(p.driver_number) === String(driverNumber));
                return match ? match.full_name : `Numéro ${driverNumber}`;
            };

            const trouverEcuriePilote = (driverNumber) => {
                const match = pilotesSession.find(p => String(p.driver_number) === String(driverNumber));
                return match ? match.team_name : "";
            };

            // 4. Récupération des données de position
            let resPositions;
            try {
                resPositions = await axios.get(`https://api.openf1.org/v1/position?session_key=${sessionKey}`, { timeout: 15000 });
            } catch (posErr) {
                console.error(`❌ Impossible de charger les positions (Session ${sessionKey}):`, posErr.message);
                continue;
            }

            if (!resPositions.data || resPositions.data.length === 0) {
                console.log(`⚠️ Données de position vides pour ${session.location} (Course non courue ?).`);
                continue;
            }

            // Filtrage pour ne garder que la dernière ligne de position sous le drapeau à damier
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
                console.log(`⚠️ Classement final incomplet pour le GP ${round}.`);
                continue;
            }

            const top10OfficielNoms = top10OfficielNums.map(num => trouverNomPilote(num));
            console.log(`📊 Top 10 réel extrait :`, top10OfficielNoms);

            // 5. Récupération du Poleman
           // 5. Récupération du Poleman (Corrigé pour éviter le premier sorti en Q1)
            let polemanOfficiel = "Inconnu";
            try {
                const resQualif = await axios.get(`https://api.openf1.org/v1/sessions?year=2026&session_name=Qualifying&location=${encodeURIComponent(session.location)}`, { timeout: 10000 });
                if (resQualif.data && resQualif.data.length > 0) {
                    const qSessionKey = resQualif.data[0].session_key;
                    
                    // On demande toutes les lignes où un pilote a été P1 pendant la qualif
                    const resPositionsQ = await axios.get(`https://api.openf1.org/v1/position?session_key=${qSessionKey}&position=1`, { timeout: 10000 });
                    
                    if (resPositionsQ.data && resPositionsQ.data.length > 0) {
                        // 🔥 CORRECTION : On trie par date décroissante pour obtenir le TOUT DERNIER pilote 
                        // ayant obtenu ou conservé la position 1 à la fin de la session (Fin de la Q3)
                        const requetesTriees = resPositionsQ.data.sort((a, b) => new Date(b.date) - new Date(a.date));
                        
                        polemanOfficiel = trouverNomPilote(requetesTriees[0].driver_number);
                    }
                }
            } catch (pErr) {
                console.log(`ℹ️ Poleman introuvable pour la qualif de ${session.location}`);
            }
            // 6. Extraction et calcul des pronostics stockés sous l'id "2026/X"
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

                            // Calcul des grilles pilotes
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

                            // Bonus Écuries
                            if (ecurieGagnanteRelle) {
                                const checkEcurie = (ecJoueur, ecReelle) => ecReelle.toLowerCase().includes(ecJoueur.toLowerCase()) || ecJoueur.toLowerCase().includes(ecReelle.toLowerCase());

                                if (ecuriesTopJoueur[0] && checkEcurie(ecuriesTopJoueur[0], ecurieGagnanteRelle)) pointsDesEcuries += 5;
                                if (ecuriesTopJoueur[1] && checkEcurie(ecuriesTopJoueur[1], ecurieGagnanteRelle)) pointsDesEcuries += 2;
                                if (ecuriesFlopJoueur.some(ef => checkEcurie(ef, ecurieGagnanteRelle))) pointsDesEcuries -= 5;
                            }

                            let pointsGagnes = pointsDuTop10 + bonusPole + pointsDesEcuries;
                            if (pronoData.jokerUtilise === true) pointsGagnes *= 2;

                            // Écriture des résultats
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
                            
                            console.log(`   ✅ Points mis à jour pour [${pseudo}] : +${pointsGagnes} pts`);
                        });
                    } catch (txError) {
                        console.error(`   ❌ Erreur joueur ${doc.id}:`, txError.message);
                    }
                }
            }

            // Clôture définitive du GP dans l'historique
            await histoRef.set({ calculeLe: new Date(), top10: top10OfficielNoms, poleman: polemanOfficiel });
            console.log(`ℹ️ GP ${round} (${session.location}) archivé.`);
        }
        console.log("\n🤖 Fin du traitement global de la saison 2026.");
    } catch (globalErr) {
        console.error("❌ Erreur générale :", globalErr.message);
        process.exit(1);
    }
}

demarrer();
