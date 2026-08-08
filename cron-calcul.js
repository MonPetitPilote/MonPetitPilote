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

// Compare deux noms sans tenir compte des accents ni de la casse
function normaliserNom(texte) {
    return (texte || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}
function nomsCorrespondent(nomA, nomB) {
    const a = normaliserNom(nomA);
    const b = normaliserNom(nomB);
    return a.includes(b) || b.includes(a);
}

const calendrier2026 = {
    "Melbourne": 1, "Shanghai": 2, "Suzuka": 3, "Miami Gardens": 4, "Montréal": 5,
    "Monte Carlo": 6, "Barcelona": 7, "Spielberg": 8, "Silverstone": 9, "Spa-Francorchamps": 10,
    "Budapest": 11, "Zandvoort": 12, "Monza": 13, "Madrid": 14, "Baku": 15,
    "Marina Bay": 16, "Austin": 17, "Mexico City": 18, "São Paulo": 19, "Las Vegas": 20,
    "Lusail": 21, "Yas Marina": 22
};

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

// ==========================================================
// MODULE PRÉDICTIONS BONUS — détection via OpenF1
// ==========================================================

// Interroge race_control pour détecter Safety Car et Drapeau Rouge sur la session.
// ⚠️ À VÉRIFIER : le format exact des champs "category"/"flag" peut varier.
// Teste avec un session_key connu avant de faire confiance à ce résultat en prod.
async function detecterEvenementsRaceControl(sessionKey) {
    let safetyCar = false;
    let drapeauRouge = false;

    try {
        const res = await axios.get(`https://api.openf1.org/v1/race_control?session_key=${sessionKey}`, { timeout: 10000 });
        const messages = res.data || [];

        messages.forEach(msg => {
            const categorie = (msg.category || "").toLowerCase();
            const flag = (msg.flag || "").toLowerCase();
            const message = (msg.message || "").toLowerCase();

            if (categorie === "safetycar" || message.includes("safety car")) {
                safetyCar = true;
            }
            if (flag === "red" || message.includes("red flag")) {
                drapeauRouge = true;
            }
        });
    } catch (err) {
        console.log(`ℹ️ Impossible de récupérer race_control pour la session ${sessionKey} : ${err.message}`);
    }

    return { safetyCar, drapeauRouge };
}

// Calcule le nombre de DNF par déduction : nombre de pilotes ayant pris le départ
// (présents dans les données de position) moins nombre de pilotes classés dans le
// top 10 officiel... en réalité on compare le nombre total de pilotes avec position
// finale valide vs le nombre total de pilotes ayant starté la course.
// ⚠️ APPROXIMATION : à valider sur un GP réel avant de faire confiance à 100%.
function calculerNombreDNF(classementTrie, nombrePilotesAuDepart) {
    const nombreClasses = classementTrie.length;
    const dnf = Math.max(0, nombrePilotesAuDepart - nombreClasses);
    return dnf;
}

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

            const histoRef = db.collection("historique_courses").doc(`2026_${round}`);
            const histoDoc = await histoRef.get();
            if (histoDoc.exists) {
                console.log(`ℹ️ Le GP ${round} (${session.location}) a déjà été calculé. Passage.`);
                continue;
            }

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

            // --- Poleman ---
            let polemanOfficiel = "Inconnu";
            try {
                const resQualif = await axios.get(`https://api.openf1.org/v1/sessions?year=2026&session_name=Qualifying&location=${encodeURIComponent(session.location)}`, { timeout: 10000 });
                if (resQualif.data && resQualif.data.length > 0) {
                    const qSessionKey = resQualif.data[0].session_key;
                    const resPositionsQ = await axios.get(`https://api.openf1.org/v1/position?session_key=${qSessionKey}&position=1`, { timeout: 10000 });
                    
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

            // --- BONUS : Safety Car / Drapeau Rouge ---
            const evenements = await detecterEvenementsRaceControl(sessionKey);

            // --- BONUS : Nombre de DNF (approximation par déduction) ---
            const nombrePilotesAuDepart = pilotesSession.length || classementTrie.length;
            const nombreDNFReel = calculerNombreDNF(classementTrie, nombrePilotesAuDepart);

            // --- BONUS : Poleman sur le podium ---
            const top3Noms = top10OfficielNoms.slice(0, 3);
            const polemanSurPodiumReel = polemanOfficiel !== "Inconnu" &&
                top3Noms.some(nom => nomsCorrespondent(nom, polemanOfficiel));

            const bonusReel = {
                safetyCar: evenements.safetyCar,
                drapeauRouge: evenements.drapeauRouge,
                nombreDNF: nombreDNFReel,
                polemanPodium: polemanSurPodiumReel
            };

            console.log(`🎯 Résultats validés : P1 = ${top10OfficielNoms[0]} (${ecurieGagnanteRelle}) | Pole = ${polemanOfficiel}`);
            console.log(`🎲 Bonus réels :`, bonusReel);

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
                            const bonusJoueur = pronoData.predictionsBonus || {};
                            const pseudo = pronoData.pseudo || "Anonyme";

                            const BAREME_POSITION_EXACTE = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
                            const POINTS_CONSOLATION = 2;
                            const POINTS_BONUS = 2;

                            let pointsDuTop10 = 0;
                            let bonusPole = 0;
                            let pointsDesEcuries = 0;
                            const detailPilotes = [];

                            grilleJoueur.forEach((piloteChoisi, indexJoueur) => {
                                const indexReel = top10OfficielNoms.findIndex(pReel => nomsCorrespondent(pReel, piloteChoisi));

                                let pointsPosition = 0;
                                let statut = "hors_top10";

                                if (indexReel !== -1) {
                                    if (indexJoueur === indexReel) {
                                        pointsPosition = BAREME_POSITION_EXACTE[indexJoueur];
                                        statut = "position_exacte";
                                    } else {
                                        pointsPosition = POINTS_CONSOLATION;
                                        statut = "dans_le_top10";
                                    }
                                }

                                pointsDuTop10 += pointsPosition;
                                detailPilotes.push({ pilote: piloteChoisi, points: pointsPosition, statut });
                            });

                            if (polemanJoueur && polemanOfficiel !== "Inconnu" && nomsCorrespondent(polemanOfficiel, polemanJoueur)) {
                                bonusPole = 5;
                            }

                            if (ecurieGagnanteRelle) {
                                const checkEcurie = (ecJoueur, ecReelle) => nomsCorrespondent(ecReelle, ecJoueur);
                                if (ecuriesTopJoueur[0] && checkEcurie(ecuriesTopJoueur[0], ecurieGagnanteRelle)) pointsDesEcuries += 5;
                                if (ecuriesTopJoueur[1] && checkEcurie(ecuriesTopJoueur[1], ecurieGagnanteRelle)) pointsDesEcuries += 2;
                                if (ecuriesFlopJoueur.some(ef => checkEcurie(ef, ecurieGagnanteRelle))) pointsDesEcuries -= 5;
                            }

                            // --- Calcul des points bonus ---
                            let pointsDesBonus = 0;
                            const detailBonus = [];

                            const evaluerBonusBooleen = (cle) => {
                                const reponduPar = bonusJoueur[cle];
                                if (reponduPar === undefined || reponduPar === null) {
                                    detailBonus.push({ cle, correct: false, points: 0 });
                                    return;
                                }
                                const correct = reponduPar === bonusReel[cle];
                                const points = correct ? POINTS_BONUS : 0;
                                pointsDesBonus += points;
                                detailBonus.push({ cle, correct, points });
                            };

                            evaluerBonusBooleen('safetyCar');
                            evaluerBonusBooleen('drapeauRouge');
                            evaluerBonusBooleen('polemanPodium');

                            // Cas particulier : nombreDNF est un nombre, pas un booléen
                            if (bonusJoueur.nombreDNF !== undefined && bonusJoueur.nombreDNF !== null) {
                                const correct = Number(bonusJoueur.nombreDNF) === Number(bonusReel.nombreDNF);
                                const points = correct ? POINTS_BONUS : 0;
                                pointsDesBonus += points;
                                detailBonus.push({ cle: 'nombreDNF', correct, points });
                            } else {
                                detailBonus.push({ cle: 'nombreDNF', correct: false, points: 0 });
                            }

                            const jokerActif = pronoData.jokerUtilise === true;
                            const multiplicateur = jokerActif ? 2 : 1;

                            const pointsGrilleFinal = pointsDuTop10 * multiplicateur;
                            const pointsPoleFinal = bonusPole * multiplicateur;
                            const pointsEcuriesFinal = pointsDesEcuries * multiplicateur;
                            const pointsBonusFinal = pointsDesBonus * multiplicateur;
                            const pointsGagnes = pointsGrilleFinal + pointsPoleFinal + pointsEcuriesFinal + pointsBonusFinal;
                            const detailPilotesFinal = detailPilotes.map(d => ({ ...d, points: d.points * multiplicateur }));
                            const detailBonusFinal = detailBonus.map(d => ({ ...d, points: d.points * multiplicateur }));

                            transaction.set(pronoRef, {
                                bilanCalcul: {
                                    pointsTotaux: pointsGagnes,
                                    pointsGrille: pointsGrilleFinal,
                                    pointsPole: pointsPoleFinal,
                                    pointsEcuries: pointsEcuriesFinal,
                                    pointsBonus: pointsBonusFinal,
                                    detailPilotes: detailPilotesFinal,
                                    detailBonus: detailBonusFinal,
                                    jokerApplique: pronoData.jokerUtilise || false,
                                    calculeLe: new Date()
                                }
                            }, { merge: true });
                            
                            console.log(`   ✅ Points mis à jour pour [${pseudo}] : +${pointsGagnes} pts (dont bonus: +${pointsBonusFinal})`);
                        });
                    } catch (txError) {
                        console.error(`   ❌ Erreur joueur ${doc.id}:`, txError.message);
                    }
                }
            }

            await histoRef.set({
                calculeLe: new Date(),
                top10: top10OfficielNoms,
                poleman: polemanOfficiel,
                bonusReel: bonusReel
            });
            console.log(`ℹ️ GP ${round} (${session.location}) archivé.`);
        }
        console.log("\n🤖 Fin du traitement global de la saison 2026.");
    } catch (globalErr) {
        console.error("❌ Erreur générale :", globalErr.message);
        process.exit(1);
    }
}

demarrer();
