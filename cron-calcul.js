const { initializeApp, credential } = require('firebase-admin');
const admin = require('firebase-admin'); 
const axios = require('axios');

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.error("❌ Erreur : Le secret FIREBASE_SERVICE_ACCOUNT est manquant.");
    process.exit(1);
}

try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    
    initializeApp({
        credential: credential.cert(serviceAccount)
    });
} catch (e) {
    console.error("❌ Erreur lors de l'initialisation de Firebase Admin SDK :", e.message);
    process.exit(1);
}

// ON DECLARE LA VARIABLE DB UNE SEULE ET UNIQUE FOIS ICI :
const db = admin.firestore();

const totalRounds = 24; 

const pilotesData = [
  {nom: "Max Verstappen", ecurie: "Red Bull", numero: "1"},
  {nom: "Isack Hadjar", ecurie: "Red Bull", numero: "43"},
  {nom: "Lewis Hamilton", ecurie: "Ferrari", numero: "44"},
  {nom: "Charles Leclerc", ecurie: "Ferrari", numero: "16"},
  {nom: "Lando Norris", ecurie: "McLaren", numero: "4"},
  {nom: "Oscar Piastri", ecurie: "McLaren", numero: "81"},
  {nom: "George Russell", ecurie: "Mercedes", numero: "63"},
  {nom: "Kimi Antonelli", ecurie: "Mercedes", numero: "12"},
  {nom: "Fernando Alonso", ecurie: "Aston Martin", numero: "14"},
  {nom: "Lance Stroll", ecurie: "Aston Martin", numero: "18"},
  {nom: "Pierre Gasly", ecurie: "Alpine", numero: "10"},
  {nom: "Franco Colapinto", ecurie: "Alpine", numero: "43"},
  {nom: "Carlos Sainz", ecurie: "Williams", numero: "55"},
  {nom: "Alex Albon", ecurie: "Williams", numero: "23"},
  {nom: "Liam Lawson", ecurie: "Racing Bulls", numero: "30"},
  {nom: "Arvid Lindblad", ecurie: "Racing Bulls", numero: "40"},
  {nom: "Nico Hülkenberg", ecurie: "Audi", numero: "27"},
  {nom: "Gabriel Bortoleto", ecurie: "Audi", numero: "5"},
  {nom: "Oliver Bearman", ecurie: "Haas", numero: "87"},
  {nom: "Esteban Ocon", ecurie: "Haas", numero: "31"},
  {nom: "Valtteri Bottas", ecurie: "Cadillac", numero: "77"},
  {nom: "Sergio Pérez", ecurie: "Cadillac", numero: "11"}
];

async function demarrer() {
    console.log("🤖 Lancement du cron de calcul des points...");
    
    try {
        for (let round = 1; round <= totalRounds; round++) {
            const gpId = `2026/${round}`;
            const histoRef = db.collection("historique_courses").doc(`2026_${round}`);
            
            const histoDoc = await histoRef.get();
            if (histoDoc.exists) {
                console.log(`ℹ️ Le GP ${round} a déjà été archivé. Passage au suivant.`);
                continue;
            }

            // --- APPEL API SESSIONS ---
            let resSessions;
            try {
                // Utilisation de year=2023 à des fins de test car l'API n'a pas encore de données 2026 !
                resSessions = await axios.get(`https://api.openf1.org/v1/sessions?year=2023&round=${round}&session_name=Race`, { timeout: 10000 });
            } catch (apiErr) {
                console.error(`❌ Impossible de contacter l'API OpenF1 pour le round ${round}:`, apiErr.message);
                continue;
            }

            if (!resSessions.data || resSessions.data.length === 0) {
                console.log(`⚠️ Aucune session de course trouvée pour le GP ${round} sur l'API (Normal si le GP n'a pas encore eu lieu).`);
                continue; 
            }
            
            const sessionKey = resSessions.data[0].session_key;

            // --- APPEL API POSITIONS ---
            let resPositions;
            try {
                resPositions = await axios.get(`https://api.openf1.org/v1/position?session_key=${sessionKey}`, { timeout: 10000 });
            } catch (posErr) {
                console.error(`❌ Erreur lors de la récupération des positions pour la session ${sessionKey}:`, posErr.message);
                continue;
            }

            if (!resPositions.data || resPositions.data.length === 0) {
                console.log(`⚠️ Données de positions vides pour le GP ${round}.`);
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
                console.log(`⚠️ Grille officielle incomplète (${top10OfficielNums.length}/10 pilotes trouvés) pour le GP ${round}. Calcul suspendu.`);
                continue;
            }

            const top10Officiel = top10OfficielNums.map(num => {
                const match = pilotesData.find(p => p.numero === num);
                return match ? match.nom : `Numéro ${num}`;
            });

            // --- APPEL API QUALIFYING (POLEMAN) ---
            let polemanOfficiel = "Inconnu";
            try {
                const resQualif = await axios.get(`https://api.openf1.org/v1/sessions?year=2023&round=${round}&session_name=Qualifying`, { timeout: 10000 });
                if (resQualif.data && resQualif.data.length > 0) {
                    const qSessionKey = resQualif.data[0].session_key;
                    const resPositionsQ = await axios.get(`https://api.openf1.org/v1/position?session_key=${qSessionKey}&position=1`, { timeout: 10000 });
                    if (resPositionsQ.data && resPositionsQ.data.length > 0) {
                        const numPole = String(resPositionsQ.data[0].driver_number);
                        const matchPole = pilotesData.find(p => p.numero === numPole);
                        if (matchPole) polemanOfficiel = matchPole.nom;
                    }
                }
            } catch (poleErr) {
                console.log(`ℹ️ Impossible de récupérer le poleman pour le GP ${round} (Ignoré) :`, poleErr.message);
            }

            const vainqueurNom = top10Officiel[0];
            const vainqueurInfos = pilotesData.find(p => p.nom === vainqueurNom);
            const ecurieGagnanteRelle = vainqueurInfos ? vainqueurInfos.ecurie : "";

            console.log(`🏁 Résultats validés pour le GP ${round} :`);
            console.log(`🥇 P1: ${vainqueurNom} (${ecurieGagnanteRelle}) | ⚡ Pole: ${polemanOfficiel}`);

            // --- TRAITEMENT DES PRONOSTICS UTILISATEURS ---
            const querySnapshot = await db.collection("pronostics").where("course", "==", gpId).get();
            
            if (querySnapshot.empty) {
                console.log(`💡 Aucun pronostic utilisateur trouvé dans Firestore pour la clé de course "${gpId}".`);
            } else {
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

                            grilleJoueur.forEach((piloteChoisi, indexJoueur) => {
                                const indexReel = top10Officiel.indexOf(piloteChoisi);
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

                            if (polemanJoueur === polemanOfficiel && polemanOfficiel !== "Inconnu") {
                                bonusPole = 5;
                            }

                            if (ecurieGagnanteRelle) {
                                if (ecuriesTopJoueur[0] === ecurieGagnanteRelle) pointsDesEcuries += 5;
                                if (ecuriesTopJoueur[1] === ecurieGagnanteRelle) pointsDesEcuries += 2;
                                if (ecuriesFlopJoueur.includes(ecurieGagnanteRelle)) pointsDesEcuries -= 5;
                            }

                            let pointsGagnes = pointsDuTop10 + bonusPole + pointsDesEcuries;
                            if (pronoData.jokerUtilise === true) {
                                pointsGagnes = pointsGagnes * 2;
                            }

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
                    } catch (txError) {
                        console.error(`❌ Erreur de transaction Firestore pour le joueur ${doc.id}:`, txError.message);
                    }
                }
            }

            await histoRef.set({ calculeLe: new Date(), top10: top10Officiel, poleman: polemanOfficiel });
            console.log(`🔒 GP ${round} archivé avec succès.`);
        }
        
        console.log("🤖 Fin d'exécution du cron avec succès.");
        
    } catch (globalErr) {
        console.error("❌ ERREUR FATALE D'EXÉCUTION DANS LA BOUCLE CRON :", globalErr);
        process.exit(1);
    }
}

demarrer();
