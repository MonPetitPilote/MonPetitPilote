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

// 🗓️ CALENDRIER ALIGNÉ AVEC OPENF1 (Sans les GP annulés)
const calendrier2026 = {
    "Melbourne": 1,
    "Shanghai": 2,
    "Suzuka": 3,
    "Miami Gardens": 4,
    "Montréal": 5,
    "Monte Carlo": 6,
    "Barcelona": 7,
    "Spielberg": 8,
    "Silverstone": 9,
    "Spa-Francorchamps": 10,
    "Budapest": 11,
    "Zandvoort": 12,
    "Monza": 13,
    "Madrid": 14,
    "Baku": 15,
    "Marina Bay": 16,
    "Austin": 17,
    "Mexico City": 18,
    "São Paulo": 19,
    "Las Vegas": 20,
    "Lusail": 21,
    "Yas Marina": 22
};
// 🏎️ TABLEAU DES PILOTES CENTRALISÉ ET SYNCHRONISÉ AVEC LE CRON
// ==========================================
// 🏎️ SOURCE DE VÉRITÉ : LES PILOTES OFFICIELS 2026 (Version épurée pour le Cron)
// ==========================================
const pilotesData = [
  { nom: "Max Verstappen", ecurie: "Red Bull", numero: "3", pays: "nl", couleur: "#3671C6" },
  { nom: "Isack Hadjar", ecurie: "Red Bull", numero: "6", pays: "fr", couleur: "#3671C6" },
  { nom: "Lewis Hamilton", ecurie: "Ferrari", numero: "44", pays: "gb", couleur: "#E80020" },
  { nom: "Charles Leclerc", ecurie: "Ferrari", numero: "16", pays: "mc", couleur: "#E80020" },
  { nom: "Lando Norris", ecurie: "McLaren", numero: "1", pays: "gb", couleur: "#FF8000" },
  { nom: "Oscar Piastri", ecurie: "McLaren", numero: "81", pays: "au", couleur: "#FF8000" },
  { nom: "George Russell", ecurie: "Mercedes", numero: "63", pays: "gb", couleur: "#27CCB4" },
  { nom: "Kimi Antonelli", ecurie: "Mercedes", numero: "12", pays: "it", couleur: "#27CCB4" },
  { nom: "Fernando Alonso", ecurie: "Aston Martin", numero: "14", pays: "es", couleur: "#229971" },
  { nom: "Lance Stroll", ecurie: "Aston Martin", numero: "18", pays: "ca", couleur: "#229971" },
  { nom: "Pierre Gasly", ecurie: "Alpine", numero: "10", pays: "fr", couleur: "#0093CC" },
  { nom: "Franco Colapinto", ecurie: "Alpine", numero: "43", pays: "ar", couleur: "#0093CC" },
  { nom: "Carlos Sainz", ecurie: "Williams", numero: "55", pays: "es", couleur: "#37BEDD" },
  { nom: "Alex Albon", ecurie: "Williams", numero: "23", pays: "th", couleur: "#37BEDD" },
  { nom: "Liam Lawson", ecurie: "Racing Bulls", numero: "30", pays: "nz", couleur: "#6692FF" },
  { nom: "Arvid Lindblad", ecurie: "Racing Bulls", numero: "41", pays: "gb", couleur: "#6692FF" },
  { nom: "Nico Hülkenberg", ecurie: "Audi", numero: "27", pays: "de", couleur: "#00E6C3" },
  { nom: "Gabriel Bortoleto", ecurie: "Audi", numero: "5", pays: "br", couleur: "#00E6C3" },
  { nom: "Oliver Bearman", ecurie: "Haas", numero: "87", pays: "gb", couleur: "#B6BABD" },
  { nom: "Esteban Ocon", ecurie: "Haas", numero: "31", pays: "fr", couleur: "#B6BABD" },
  { nom: "Valtteri Bottas", ecurie: "Cadillac", numero: "77", pays: "fi", couleur: "#900C3F" },
  { nom: "Sergio Pérez", ecurie: "Cadillac", numero: "11", pays: "mx", couleur: "#900C3F" }
];

async function demarrer() {
    console.log("🤖 Lancement du cron de calcul automatique OpenF1 2026 (Mode Linéaire)...");
    
    try {
        console.log("📡 Récupération du calendrier des sessions 2026 depuis OpenF1...");
        const resSessions = await axios.get("https://api.openf1.org/v1/sessions?year=2026&session_name=Race", { timeout: 10000 });
        
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

            // Pilotes
            console.log(`📡 Récupération des pilotes pour la session ${sessionKey}...`);
            let pilotesSession = [];
            try {
                const resDrivers = await axios.get(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`, { timeout: 10000 });
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

            // Positions Course
            let resPositions;
            try {
                resPositions = await axios.get(`https://api.openf1.org/v1/position?session_key=${sessionKey}`, { timeout: 15000 });
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

            // 🎯 RECHERCHE DU POLEMAN CORRIGÉE (Prend la fin de la Q3, pas le début de la Q1)
            let polemanOfficiel = "Inconnu";
            try {
                const resQualif = await axios.get(`https://api.openf1.org/v1/sessions?year=2026&session_name=Qualifying&location=${encodeURIComponent(session.location)}`, { timeout: 10000 });
                if (resQualif.data && resQualif.data.length > 0) {
                    const qSessionKey = resQualif.data[0].session_key;
                    const resPositionsQ = await axios.get(`https://api.openf1.org/v1/position?session_key=${qSessionKey}&position=1`, { timeout: 10000 });
                    
                    if (resPositionsQ.data && resPositionsQ.data.length > 0) {
                        // Tri par date décroissante pour attraper le tout dernier P1 sous le drapeau à damier
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

            // Traitement des pronostics
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
        console.error("❌ Erreur générale :", globalErr.message);
        process.exit(1);
    }
}

demarrer();
