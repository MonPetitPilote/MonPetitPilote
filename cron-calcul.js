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
  {nom: "Jack Doohan", ecurie: "Alpine", statut: "outsider"},
  {nom: "Alex Albon", ecurie: "Williams", statut: "outsider"},
  {nom: "Carlos Sainz", ecurie: "Williams", statut: "outsider"},
  {nom: "Yuki Tsunoda", ecurie: "Racing Bulls", statut: "outsider"},
  {nom: "Liam Lawson", ecurie: "Racing Bulls", statut: "outsider"},
  {nom: "Nico Hulkenberg", ecurie: "Audi", statut: "outsider"},
  {nom: "Gabriel Bortoleto", ecurie: "Audi", statut: "outsider"},
  {nom: "Esteban Ocon", ecurie: "Haas", statut: "outsider"},
  {nom: "Oliver Bearman", ecurie: "Haas", statut: "outsider"}
];

// Barème de points officiel F1 pour le Top 10
const BAREME_F1 = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

async function demarrer() {
    console.log("🤖 Lancement du traitement des résultats de course...");

    for (let round = 1; round <= totalRounds; round++) {
        const histoRef = db.collection("historique_courses").doc(`gp_${round}`);
        const histoDoc = await histoRef.get();

        if (histoDoc.exists) {
            // Ce Grand Prix a déjà été calculé et clôturé, on passe au suivant
            continue; 
        }

        try {
            console.log(`📡 Vérification des données de session OpenF1 pour le GP ${round}...`);
            
            // Récupération de la session de course la plus récente (ou ajuster selon vos clés de rounds)
            const sessionRes = await axios.get(`https://api.openf1.org/v1/sessions?round=${round}&session_name=Race`);
            if (!sessionRes.data || sessionRes.data.length === 0) {
                console.log(`⏹️ GP ${round} non disponible ou pas encore couru.`);
                break; 
            }

            const sessionKey = sessionRes.data[0].session_key;
            
            // 1. Récupération des positions finales de la course
            const positionRes = await axios.get(`https://api.openf1.org/v1/position?session_key=${sessionKey}`);
            if (!positionRes.data || positionRes.data.length === 0) {
                console.log(`⚠ Pas de données de positions de course pour le GP ${round}.`);
                break;
            }

            // Tri par position croissante pour obtenir le Top 10 final officiel
            const triee = positionRes.data.sort((a, b) => a.position - b.position);
            
            // 2. Récupération des infos pilotes pour faire correspondre le nom complet
            const driversRes = await axios.get(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`);
            const driversMap = {};
            driversRes.data.forEach(d => {
                driversMap[d.driver_number] = `${d.first_name} ${d.last_name}`;
            });

            // =========================================================================
// CONFIGURATION DES CATÉGORIES ET LOGIQUE DE CALCUL DU STATUT DES ÉCURIES
// =========================================================================

const CATEGORIES_ECURIES = {
    "Mercedes": "toptier", "Ferrari": "toptier",
    "Red Bull": "outsider", "McLaren": "outsider",
    "Alpine": "midfield", "Racing Bulls": "midfield",
    "Williams": "unpredictable", "Audi": "unpredictable", "Haas": "unpredictable",
    "Aston Martin": "backmarker", "Cadillac": "backmarker"
};

/**
 * Détermine le statut (Top, Flop ou Neutre) de chaque écurie à la fin d'un GP
 * @param {Array} resultatsComplets - Tableau de tous les pilotes avec leur position finale (ex: 1 à 22) et leur statut (ex: "Finished", "DNF", "Accident")
 * @returns {Object} Un dictionnaire avec le statut de chaque écurie { "Ferrari": "top", "Alpine": "neutre", ... }
 */
function determinerStatutsEcuries(resultatsComplets) {
    let statutsEcuries = {};
    const ecuriesSaison = Object.keys(CATEGORIES_ECURIES);

    ecuriesSaison.forEach(ecurie => {
        const categorie = CATEGORIES_ECURIES[ecurie];
        
        // 1. On filtre les résultats pour récupérer les données des 2 pilotes de cette écurie
        const pilotesEcurie = resultatsComplets.filter(p => p.ecurie === ecurie);
        
        if (pilotesEcurie.length < 2) {
            statutsEcuries[ecurie] = "neutre";
            return;
        }

        const p1 = pilotesEcurie[0];
        const p2 = pilotesEcurie[1];

        // Raccourcis pour les positions (si DNF, on met une position infinie)
        const pos1 = p1.status === "Finished" ? p1.position : 99;
        const pos2 = p2.status === "Finished" ? p2.position : 99;

        // --- RÈGLE UNIVERSELLE : DOUBLE DNF ---
        if (p1.status !== "Finished" && p2.status !== "Finished") {
            statutsEcuries[ecurie] = "flop";
            return;
        }

        // --- APPLICATION DES RÈGLES PAR CATÉGORIE ---
        switch (categorie) {
            case "toptier": // Mercedes, Ferrari
                if (pos1 <= 3 && pos2 <= 3) {
                    statutsEcuries[ecurie] = "top";
                } else if (pos1 > 5 && pos2 > 5) {
                    statutsEcuries[ecurie] = "flop";
                } else {
                    statutsEcuries[ecurie] = "neutre";
                }
                break;

            case "outsider": // Red Bull, McLaren
                const unSurPodium = (pos1 <= 3 || pos2 <= 3);
                const deuxDansTop10 = (pos1 <= 10 && pos2 <= 10);
                
                if (deuxDansTop10 && unSurPodium) {
                    statutsEcuries[ecurie] = "top";
                } else if (pos1 > 10 && pos2 > 10) {
                    statutsEcuries[ecurie] = "flop";
                } else {
                    statutsEcuries[ecurie] = "neutre";
                }
                break;

            case "midfield":        // Alpine, Racing Bulls
            case "unpredictable":   // Williams, Audi, Haas
                if (pos1 <= 10 && pos2 <= 10) {
                    statutsEcuries[ecurie] = "top";
                } else if (pos1 > 12 && pos2 > 12) {
                    statutsEcuries[ecurie] = "flop";
                } else {
                    statutsEcuries[ecurie] = "neutre";
                }
                break;

            case "backmarker": // Aston Martin, Cadillac
                if (pos1 <= 10 || pos2 <= 10) {
                    statutsEcuries[ecurie] = "top";
                } else if (pos1 >= 16 && pos2 >= 16) {
                    statutsEcuries[ecurie] = "flop";
                } else {
                    statutsEcuries[ecurie] = "neutre";
                }
                break;

            default:
                statutsEcuries[ecurie] = "neutre";
        }
    });

    return statutsEcuries;
}



            // Construction du Top 10 Officiel
            const top10Officiel = [];
            const vus = new Set();
            for (let item of triee) {
                const nomComplet = driversMap[item.driver_number];
                if (nomComplet && !vus.has(nomComplet)) {
                    vus.add(nomComplet);
                    top10Officiel.push(nomComplet);
                    if (top10Officiel.length === 10) break;
                }
            }

            if (top10Officiel.length < 10) {
                console.log(`⚠ Top 10 incomplet (${top10Officiel.length}/10). Traitement reporté.`);
                break;
            }

            // 3. Récupération du Poleman officiel (Depuis la session de qualification)
            let polemanOfficiel = "";
            try {
                const qualifRes = await axios.get(`https://api.openf1.org/v1/sessions?round=${round}&session_name=Qualifying`);
                if (qualifRes.data && qualifRes.data.length > 0) {
                    const qualifKey = qualifRes.data[0].session_key;
                    const polePosRes = await axios.get(`https://api.openf1.org/v1/position?session_key=${qualifKey}&position=1`);
                    if (polePosRes.data && polePosRes.data.length > 0) {
                        polemanOfficiel = driversMap[polePosRes.data[0].driver_number] || "";
                    }
                }
            } catch (err) {
                console.warn(` Impossible de récupérer le Poleman pour le GP ${round}.`, err.message);
            }

            console.log(`🏁 Résultats GP ${round} : Poleman = ${polemanOfficiel} | Top 3 = ${top10Officiel.slice(0, 3).join(', ')}`);

            // 4. Parcours des pronostics de tous les utilisateurs pour calculer les points
            const joueursSnapshot = await db.collection("pronostics").get();
            
            for (let joueurDoc of joueursSnapshot.docs) {
                const userId = joueurDoc.id;
                const userDataBase = joueurDoc.data();
                const pseudo = userDataBase.pseudo || "Pilote Anonyme";

                const pronoRef = db.collection("pronostics").doc(userId).collection("grands_prix").doc(`gp_${round}`);
                const pronoDoc = await pronoRef.get();

                if (pronoDoc.exists) {
                    const pronoData = pronoDoc.data();
                    
                    let pointsDuTop10 = 0;
                    let pointsDesEcuries = 0;
                    let bonusPole = 0;
                    let pointsGagnes = 0;

                    // A. Calcul des points du Top 10 Pilotes
                    if (pronoData.top10 && Array.isArray(pronoData.top10)) {
                        pronoData.top10.forEach((piloteProno, indexProno) => {
                            const indexOfficiel = top10Officiel.indexOf(piloteProno);
                            if (indexOfficiel !== -1) {
                                // Cas 1 : Position exacte (Points complets du barème)
                                if (indexProno === indexOfficiel) {
                                    pointsDuTop10 += BAREME_F1[indexProno];
                                } else {
                                    // Cas 2 : Présent dans le Top 10 mais mauvaise position (+1 point de consolation)
                                    pointsDuTop10 += 1;
                                }
                            }
                        });
                    }

                    // B. Calcul du bonus Poleman (+5 points)
                    const poleReussie = (pronoData.poleman && polemanOfficiel && pronoData.poleman === polemanOfficiel);
                    if (poleReussie) {
                        bonusPole = 5;
                    }

                    // C. Calcul simple fictif des Écuries Top / Flop (Exemple : +2 par bonne écurie)
                    // À adapter ou affiner selon vos critères de performance réels
                    const ecurieGagnante = pilotesData.find(p => p.nom === top10Officiel[0])?.ecurie;
                    if (pronoData.ecurieTop1 === ecurieGagnante) pointsDesEcuries += 5;
                    if (pronoData.ecurieTop2 === ecurieGagnante) pointsDesEcuries += 2;

                    // D. Totalisation et application du multiplicateur Joker s'il est activé
                    pointsGagnes = pointsDuTop10 + bonusPole + pointsDesEcuries;
                    if (pronoData.jokerUtilise) {
                        pointsGagnes = pointsGagnes * 2;
                    }

                    // E. Transaction Firestore sécurisée pour mettre à jour le Général et le Bilan Détallé du GP
                    await db.runTransaction(async (transaction) => {
                        const userRef = db.collection("pronostics").doc(userId);
                        const userDoc = await transaction.get(userRef);
                        
                        if (userDoc.exists) {
                            const currentData = userDoc.data();
                            const polesTotal = (currentData.polesReussies || 0) + (poleReussie ? 1 : 0);
                            
                            // Mise à jour du profil Global
                            transaction.update(userRef, { 
                                points: (currentData.points || 0) + pointsGagnes,
                                polesReussies: polesTotal
                            });

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
                            }, { merge: true }); // Important : 'merge: true' préserve la grille saisie d'origine
                        }
                    });
                    
                    console.log(`✅ Score calculé pour ${pseudo} : +${pointsGagnes} pts (Top10: ${pointsDuTop10}, Pole: ${bonusPole}, Écuries: ${pointsDesEcuries})`);
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
