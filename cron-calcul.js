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

// ==========================================
// 🏎️ SOURCE DE VÉRITÉ : LES PILOTES OFFICIELS 2026
// ==========================================
const pilotesData = [
  { nom: "Max Verstappen", ecurie: "Red Bull", numero: "1", pays: "nl", couleur: "#3671C6" },
  { nom: "Isack Hadjar", ecurie: "Red Bull", numero: "6", pays: "fr", couleur: "#3671C6" },
  { nom: "Lewis Hamilton", ecurie: "Ferrari", numero: "44", pays: "gb", couleur: "#E80020" },
  { nom: "Charles Leclerc", ecurie: "Ferrari", numero: "16", pays: "mc", couleur: "#E80020" },
  { nom: "Lando Norris", ecurie: "McLaren", numero: "4", pays: "gb", couleur: "#FF8000" },
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

// ==========================================
// 🗓️ SOURCE DE VÉRITÉ : CALENDRIER LINÉAIRE REEL 2026
// (Mappe le nom exact OpenF1 'location' vers ton index de Round 1 à 20)
// ==========================================
const calendrier2026 = {
    "Shanghai": 1,
    "Suzuka": 2,
    "Miami Gardens": 3,
    "Montréal": 4,
    "Monte Carlo": 5,
    "Barcelona": 6,
    "Spielberg": 7,
    "Silverstone": 8,
    "Spa-Francorchamps": 9,
    "Budapest": 10,
    "Zandvoort": 11,
    "Monza": 12,
    "Baku": 13,
    "Marina Bay": 14,
    "Austin": 15,
    "Mexico City": 16,
    "São Paulo": 17,
    "Las Vegas": 18,
    "Lusail": 19,
    "Yas Marina": 20
};

// Fonctions de correspondance locale
const trouverNomPiloteLocal = (driverNumber) => {
    const match = pilotesData.find(p => String(p.numero) === String(driverNumber));
    return match ? match.nom : `Numéro ${driverNumber}`;
};

const trouverEcuriePiloteLocal = (driverNumber) => {
    const match = pilotesData.find(p => String(p.numero) === String(driverNumber));
    return match ? match.ecurie : "";
};

async function demarrer() {
    console.log("🤖 Lancement du cron avec listes centralisées et méthode /session_result...");
    
    try {
        console.log("📡 Récupération du calendrier des courses depuis OpenF1...");
        const resSessions = await axios.get("https://api.openf1.org/v1/sessions?year=2026&session_name=Race", { timeout: 10000 });
        
        if (!resSessions.data || resSessions.data.length === 0) {
            console.log("⚠️ Aucune session de course trouvée pour 2026.");
            return;
        }

        const sessionsChronologiques = resSessions.data.sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
        
        console.log("📡 Récupération globale du calendrier des qualifications...");
        const resQualifGlobal = await axios.get("https://api.openf1.org/v1/sessions?year=2026&session_name=Qualifying", { timeout: 10000 });
        const qualifsGlobales = resQualifGlobal.data || [];

        for (let index = 0; index < sessionsChronologiques.length; index++) {
            const session = sessionsChronologiques[index];
            const sessionKey = session.session_key;
            const round = calendrier2026[session.location];
            
            if (!round) {
                continue; // Ignore silencieusement les circuits non cartographiés (GP annulés)
            }

            const gpId = `2026/${round}`;
            console.log(`\n🏁 --- Analyse : ${session.location} | Round : ${round} | Clé Session : ${sessionKey} ---`);

            await sleep(2000);

            // Anti-doublon Firestore
            const histoRef = db.collection("historique_courses").doc(`2026_${round}`);
            const histoDoc = await histoRef.get();
            if (histoDoc.exists) {
                console.log(`ℹ️ Le GP ${round} a déjà été calculé. Passage.`);
                continue;
            }

            // Récupération des positions finales de la course
            let resPositions;
            try {
                resPositions = await axios.get(`https://api.openf1.org/v1/position?session_key=${sessionKey}`, { timeout: 15000 });
            } catch (posErr) {
                console.error(`❌ Impossible de charger les positions :`, posErr.message);
                continue;
            }

            if (!resPositions.data || resPositions.data.length === 0) continue;

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

            const top10OfficielNoms = top10OfficielNums.map(num => trouverNomPiloteLocal(num));
            console.log(`📊 Top 10 extrait :`, top10OfficielNoms);

            // 🎯 Recherche Poleman par /session_result
            let polemanOfficiel = "Inconnu";
            const qualifSession = qualifsGlobales.find(q => 
                q.location && q.location.toLowerCase().trim() === session.location.toLowerCase().trim()
            );

            if (qualifSession) {
                const qSessionKey = qualifSession.session_key;
                try {
                    const resResultatQ = await axios.get(`https://api.openf1.org/v1/session_result?session_key=${qSessionKey}&position<=1`, { timeout: 10000 });
                    if (resResultatQ.data && resResultatQ.data.length > 0) {
                        polemanOfficiel = trouverNomPiloteLocal(resResultatQ.data[0].driver_number);
                    }
                } catch (qErr) {
                    console.log(`⚠️ Erreur sur le résultat de la qualif ${qSessionKey}`);
                }
            }

            const vainqueurNumero = top10OfficielNums[0];
            const ecurieGagnanteRelle = trouverEcuriePiloteLocal(vainqueurNumero);

            console.log(`🎯 Validé : P1 = ${top10OfficielNoms[0]} (${ecurieGagnanteRelle}) | Pole = ${polemanOfficiel}`);

            // Traitement des scores dans la collection "pronostics"
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
        }
        console.log("\n🤖 Fin du traitement de la saison.");
    } catch (globalErr) {
        console.error("❌ Erreur générale :", globalErr.message);
        process.exit(1);
    }
}

demarrer();
