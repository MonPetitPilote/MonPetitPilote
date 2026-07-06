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

const totalRounds = 21; 

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
  {nom: "Liam Lawson", ecurie: "Racing Bulls", statut: "fond"},
  {nom: "Arvid Lindblad", ecurie: "Racing Bulls", statut: "fond"},
  {nom: "Nico Hülkenberg", ecurie: "Audi", statut: "fond"},
  {nom: "Gabriel Bortoleto", ecurie: "Audi", statut: "fond"},
  {nom: "Oliver Bearman", ecurie: "Haas", statut: "fond"},
  {nom: "Esteban Ocon", ecurie: "Haas", statut: "fond"},
  {nom: "Valtteri Bottas", ecurie: "Cadillac", statut: "fond"},
  {nom: "Sergio Pérez", ecurie: "Cadillac", statut: "fond"}
];

function obtenirCote(piloteNom, position) {
    const p = pilotesData.find(pilote => pilote.nom === piloteNom);
    if (!p) return 1.5;
    
    if (p.statut === "favori") {
        if (position === 1) return 1.3;
        if (position <= 3) return 1.1;
        if (position <= 6) return 1.8;
        return 2.5 + (position * 0.1);
    } 
    if (p.statut === "outsider") {
        if (position === 1) return p.nom === "Fernando Alonso" ? 100.0 : 35.0;
        if (position <= 3) return 10.0;
        if (position <= 6) return 3.5;
        return 1.6;
    } 
    if (p.statut === "fond") {
        if (position === 1) return 120.0;
        if (position <= 3) return 60.0;
        if (position <= 6) return 18.0;
        if (position <= 8) return 5.0;
        return 1.3;
    }
    return 1.5;
}

async function demarrer() {
    console.log("🤖 Lancement du calcul automatique des résultats...");
    
    for (let round = 1; round <= totalRounds; round++) {
        // ID de la course pour tes pronostics en base
        const courseId = `2026/${round}`; 
        
        try {
            // Note : Changé temporairement en 2024 pour que l'API trouve de vraies courses pour tes tests
            const res = await axios.get(`https://ergast.com/api/f1/2024/${round}/results.json`);
            
            if (!res.data || !res.data.MRData || !res.data.MRData.RaceTable || !res.data.MRData.RaceTable.Races) {
                console.log(`⚠️ Données API invalides pour le GP numéro ${round}.`);
                break;
            }

            const race = res.data.MRData.RaceTable.Races[0];
            
            if (!race || !race.Results) {
                console.log(`ℹ️ Le GP numéro ${round} n'est pas encore disponible ou terminé.`);
                break; // Arrêt propre sans faire planter GitHub Actions
            }

            const histoRef = db.collection("courses_calculees").doc(`gp_${round}`);
            const histoDoc = await histoRef.get();
            
            if (histoDoc.exists) {
                console.log(`ℹ️ Le GP ${round} a déjà été calculé. Passage au suivant.`);
                continue; 
            }

            console.log(`🏁 Traitement du GP ${round} (${race.raceName})...`);
            const top10Officiel = race.Results.slice(0, 10).map(r => `${r.Driver.givenName} ${r.Driver.familyName}`);
            const polemanOfficiel = top10Officiel[0]; 

            const compteEcuriesTop10 = {};
            top10Officiel.forEach(piloteNom => {
                const pData = pilotesData.find(p => p.nom === piloteNom);
                if (pData) {
                    compteEcuriesTop10[pData.ecurie] = (compteEcuriesTop10[pData.ecurie] || 0) + 1;
                }
            });

            const pronosSnapshot = await db.collection("pronostics").where("course", "==", courseId).get();
            
            if (!pronosSnapshot.empty) {
                for (const doc of pronosSnapshot.docs) {
                    const prono = doc.data();
                    const uidJoueur = prono.uidJoueur;
                    const pseudo = prono.pseudo;
                    const grilleJoueur = prono.classementPilotes;

                    let pointsGagnes = 0;
                    let poleReussie = false;
                    let meilleureCotePari = 0;

                    if (grilleJoueur && Array.isArray(grilleJoueur)) {
                        grilleJoueur.forEach((piloteProno, index) => {
                            const position = index + 1;
                            const indexOfficiel = top10Officiel.indexOf(piloteProno);
                            const positionOfficielle = indexOfficiel + 1;
                            const estCoupPoker = (prono.ligneCoupPoker === position);

                            if (indexOfficiel !== -1) {
                                if (position === positionOfficielle) {
                                    if (estCoupPoker) {
                                        const cote = obtenirCote(piloteProno, position);
                                        const pointsPoker = Math.round(10 * cote);
                                        pointsGagnes += pointsPoker;
                                        meilleureCotePari = cote;
                                    } else {
                                        pointsGagnes += 10;
                                    }
                                } else if (!estCoupPoker) {
                                    pointsGagnes += 3;
                                }
                            }
                        });
                    }

                    if (prono.poleman === polemanOfficiel) {
                        pointsGagnes += 15;
                        poleReussie = true;
                    }

                    if (prono.ecuriesTop && Array.isArray(prono.ecuriesTop)) {
                        prono.ecuriesTop.forEach(ecurie => {
                            if (compteEcuriesTop10[ecurie] === 2) pointsGagnes += 10;
                        });
                    }

                    if (prono.ecuriesFlop && Array.isArray(prono.ecuriesFlop)) {
                        prono.ecuriesFlop.forEach(ecurie => {
                            if (!compteEcuriesTop10[ecurie] || compteEcuriesTop10[ecurie] === 0) pointsGagnes += 10;
                        });
                    }

                    // APPLICATION DU JOKER (TRIPLE LES POINTS)
                    const utiliserJoker = prono.jokerActive || false;
                    if (utiliserJoker) {
                        pointsGagnes = pointsGagnes * 3;
                    }

                    // Enregistrement de l'historique de cette course
                    await db.collection("historique_points").add({
                        uidJoueur,
                        pseudo,
                        round,
                        courseId,
                        pointsGagnes,
                        polemanProno: prono.poleman,
                        polemanOfficiel,
                        classementPilotes: grilleJoueur,
                        top10Officiel,
                        jokerApplique: utiliserJoker,
                        dateCalcul: new Date()
                    });

                    // Mise à jour cumulative du profil utilisateur
                    const userRef = db.collection("utilisateurs").doc(uidJoueur);
                    await db.runTransaction(async (transaction) => {
                        const userDoc = await transaction.get(userRef);
                        if (userDoc.exists) {
                            const data = userDoc.data();
                            const polesTotal = (data.polesReussies || 0) + (poleReussie ? 1 : 0);
                            const maxCote = Math.max((data.meilleureCoteGagnee || 0), meilleureCotePari);
                            
                            transaction.update(userRef, { 
                                points: (data.points || 0) + pointsGagnes,
                                polesReussies: polesTotal,
                                meilleureCoteGagnee: maxCote
                            });
                        } else {
                            transaction.set(userRef, { 
                                pseudo, 
                                points: pointsGagnes,
                                polesReussies: poleReussie ? 1 : 0,
                                meilleureCoteGagnee: meilleureCotePari,
                                jokerSaisonUtilise: utiliserJoker
                            });
                        }
                    });
                }
            }

            await histoRef.set({ calculeLe: new Date(), top10: top10Officiel });
            console.log(`🔒 GP ${round} archivé avec succès.`);

        } catch (error) {
            console.error(`⚠️ Note GP ${round}:`, error.message);
            break; // Quitte proprement la boucle
        }
    }
    console.log("🤖 Fin d'exécution propre.");
}

demarrer();
