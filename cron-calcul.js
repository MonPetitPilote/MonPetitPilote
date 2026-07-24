const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const axios = require('axios');

try {
    initializeApp();
    console.log("🚀 [Firebase] Connexion réussie de manière native !");
} catch (e) {
    console.error("❌ Erreur critique d'initialisation de Firebase :", e.message);
    process.exit(1);
}

const db = getFirestore();
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// En-têtes HTTP pour éviter les erreurs 401 d'OpenF1
const axiosHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

// 🗓️ CALENDRIER AVEC TOUTES LES VARIANTES DE NOMS OPENF1
const calendrier2026 = {
    "Melbourne": 1,
    "Shanghai": 2,
    "Suzuka": 3,
    "Miami Gardens": 4, "Miami": 4,
    "Montréal": 5, "Montreal": 5,
    "Monte Carlo": 6, "Monaco": 6,
    "Barcelona": 7, "Montmeló": 7,
    "Spielberg": 8, "Red Bull Ring": 8,
    "Silverstone": 9,
    "Spa-Francorchamps": 10, "Spa": 10,
    "Budapest": 11, "Hungaroring": 11,
    "Zandvoort": 12,
    "Monza": 13,
    "Madrid": 14,
    "Baku": 15,
    "Marina Bay": 16, "Singapore": 16,
    "Austin": 17,
    "Mexico City": 18, "Mexico": 18,
    "São Paulo": 19, "Interlagos": 19,
    "Las Vegas": 20,
    "Lusail": 21, "Qatar": 21,
    "Yas Marina": 22, "Abu Dhabi": 22
};

async function demarrer() {
    console.log("🤖 Lancement du cron de calcul automatique OpenF1 2026...");
    
    try {
        console.log("📡 Récupération du calendrier des sessions 2026 depuis OpenF1...");
        const resSessions = await axios.get("https://api.openf1.org/v1/sessions?year=2026&session_name=Race", { 
            timeout: 10000,
            headers: axiosHeaders
        });
        
        if (!resSessions.data || resSessions.data.length === 0) {
            console.log("⚠️ Aucune session de course trouvée pour 2026 sur OpenF1.");
            return;
        }

        const sessionsChronologiques = resSessions.data.sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
        console.log(`ℹ️ ${sessionsChronologiques.length} sessions réelles détectées dans l'API.`);

        for (let index = 0; index < sessionsChronologiques.length; index++) {
            const session = sessionsChronologiques[index];
            const sessionKey = session.session_key;
            const round = calendrier2026[session.location];
            
            if (!round) {
                console.log(`\nℹ️ Circuit "${session.location}" non configuré ou non requis. Passage.`);
                continue;
            }

            const gpId = `2026/${round}`;
            console.log(`\n🏁 --- Analyse : ${session.location} | Round Site : ${round} | Clé Session : ${sessionKey} ---`);

            await sleep(2500);

            // Anti-doublon
            const histoRef = db.collection("historique_courses").doc(`2026_${round}`);
            const histoDoc = await histoRef.get();
            if (histoDoc.exists) {
                console.log(`ℹ️ Le GP ${round} (${session.location}) a déjà été calculé. Passage.`);
                continue;
            }

            // Récupération des pilotes
            console.log(`📡 Récupération des pilotes pour la session ${sessionKey}...`);
            let pilotesSession = [];
            try {
                const resDrivers = await axios.get(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`, { 
                    timeout: 10000,
                    headers: axiosHeaders
                });
                pilotesSession = resDrivers.data || [];
            } catch (driverErr) {
                console.error(`❌ Impossible de récupérer les pilotes :`, driverErr.message);
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

            // Positions de Course
            let resPositions;
            try {
                resPositions = await axios.get(`https://api.openf1.org/v1/position?session_key=${sessionKey}`, { 
                    timeout: 15000,
                    headers: axiosHeaders
                });
            } catch (posErr) {
                console.error(`❌ Impossible de charger les positions :`, posErr.message);
                continue;
            }

            if (!resPositions.data || resPositions.data.length === 0) {
                console.log(`⚠️ Données de position vides pour ${session.location}.`);
                continue;
            }

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

            // Recherche du Poleman
            let polemanOfficiel = "Inconnu";
            try {
                const resQualif = await axios.get(`https://api.openf1.org/v1/sessions?year=2026&session_name=Qualifying&location=${encodeURIComponent(session.location)}`, { 
                    timeout: 10000,
                    headers: axiosHeaders
                });
                if (resQualif.data && resQualif.data.length > 0) {
                    const qSessionKey = resQualif.data[0].session_key;
                    const resPositionsQ = await axios.get(`https://api.openf1.org/v1/position?session_key=${qSessionKey}&position=1`, { 
                        timeout: 10000,
                        headers: axiosHeaders
                    });
                    
                    if (resPositionsQ.data && resPositionsQ.data.length > 0) {
                        const requetesTriees = resPositionsQ.data.sort((a, b) => new Date(b.date) - new Date(a.date));
                        polemanOfficiel = trouverNomPilote(requetesTriees[0].driver_number);
                    }
                }
            } catch (pErr) {
                console.log(`ℹ️ Poleman introuvable pour la qualif de ${session.location}`);
            }

            const vainqueurNumero = top10OfficielNums[0];
            const ecurieGagnanteRelle = trouverEcuriePilote(vainqueurNumero);

            console.log(`🎯 Résultats validés : P1 = ${top10OfficielNoms[0]} (${ecurieGagnanteRelle}) | Pole = ${polemanOfficiel}`);

            // Traitement des pronostics des joueurs dans Firestore
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
                            let tableauDetailPilotes = [];
                            let bonusPole = 0;
                            let pointsDesEcuries = 0;

                            const baremeF1 = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

                            grilleJoueur.forEach((piloteChoisi, indexJoueur) => {
                                const indexReel = top10OfficielNoms.findIndex(pReel => 
                                    pReel.toLowerCase().includes(piloteChoisi.toLowerCase()) || 
                                    piloteChoisi.toLowerCase().includes(pReel.toLowerCase())
                                );

                                let ptsPilote = 0;
                                if (indexReel !== -1) {
                                    if (indexJoueur === indexReel) {
                                        ptsPilote = baremeF1[indexJoueur] || 0;
                                    } else {
                                        ptsPilote = 2; // Bonus présence dans le Top 10
                                    }
                                }
                                pointsDuTop10 += ptsPilote;
                                tableauDetailPilotes.push({ pilote: piloteChoisi, points: ptsPilote });
                            });

                            if (polemanJoueur && polemanOfficiel !== "Inconnu" && (polemanOfficiel.toLowerCase().includes(polemanJoueur.toLowerCase()) || polemanJoueur.toLowerCase().includes(polemanOfficiel.toLowerCase()))) {
                                bonusPole = 5;
                            }

                            if (ecurieGagnanteRelle) {
                                const checkEcurie = (ecJoueur, ecReelle) => ecReelle.toLowerCase().includes(ecJoueur.toLowerCase()) || ecJoueur.toLowerCase().includes(ecReelle.toLowerCase());
                                if (ecuriesTopJoueur[0] && checkEcurie(ecuriesTopJoueur[0], ecurieGagnanteRelle)) pointsDesEcuries += 5;
                                if (ecuriesTopJoueur[1] && checkEcurie(ecuriesTopJoueur[1], ecurieGagnanteRelle)) pointsDesEcuries += 2;
                                if (ecuriesFlopJoueur.some(ef => checkEcurie(ef, ecurieGagnanteRelle))) pointsDesEcuries -= 5;
                            }

                            let pointsGagnes = pointsDuTop10 + bonusPole + pointsDesEcuries;
                            if (pronoData.jokerUtilise === true) pointsGagnes *= 2;

                            transaction.set(pronoRef, {
                                bilanCalcul: {
                                    pointsTotaux: pointsGagnes,
                                    detailTop10: pointsDuTop10,
                                    detailPilotes: tableauDetailPilotes,
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

            await histoRef.set({ calculeLe: new Date(), top10: top10OfficielNoms, poleman: polemanOfficiel });
            console.log(`ℹ️ GP ${round} (${session.location}) archivé.`);
        }
        console.log("\n🤖 Fin du traitement global de la saison 2026.");
    } catch (globalErr) {
        console.error("❌ ERREUR DÉTAILLÉE :", globalErr.response ? JSON.stringify(globalErr.response.data) : globalErr.message);
        process.exit(1);
    }
}

demarrer();
