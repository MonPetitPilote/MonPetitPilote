const admin = require('firebase-admin');
const axios = require('axios');

// Connexion sécurisée à Firebase grâce au secret configuré
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.error("❌ Erreur : Le secret FIREBASE_SERVICE_ACCOUNT est manquant.");
    process.exit(1);
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Liste des courses prévues pour l'algorithme automatique
const totalRounds = 13; 

async function demarrer() {
    console.log("🤖 Lancement de la vérification quotidienne des résultats...");
    
    // On va vérifier les courses une par une en partant du début de la saison
    for (let round = 1; round <= totalRounds; round++) {
        const courseId = `2026/${round}`;
        
        try {
            // Interroger l'API Ergast/OpenF1 pour voir si les résultats de cette course existent
            const res = await axios.get(`https://ergast.com/api/f1/2026/${round}/results.json`);
            const race = res.data.MRData.RaceTable.Race[0];
            
            if (!race || !race.Results) {
                // Dès qu'on tombe sur une course sans résultats officiels, on s'arrête : c'est la course en cours ou future !
                console.log(`ℹ️ Le GP numéro ${round} n'est pas encore terminé. Fin de la vérification.`);
                break;
            }

            // Vérifier si on a déjà calculé les scores de ce GP pour éviter de rajouter des points à l'infini
            const histoRef = db.collection("courses_calculees").doc(`gp_${round}`);
            const histoDoc = await histoRef.get();
            
            if (histoDoc.exists) {
                console.log(`✅ GP ${round} déjà traité et calculé précédemment. Passage au suivant...`);
                continue; 
            }

            console.log(`🏁 Nouveau GP détecté comme terminé ! Calcul des scores pour le GP ${round}...`);
            
            // Extraire le Top 10 officiel
            const top10Officiel = race.Results.slice(0, 10).map(r => `${r.Driver.givenName} ${r.Driver.familyName}`);
            console.log("🏆 TOP 10 OFFICIEL :", top10Officiel);

            // Chercher tous les pronostics soumis par tes amis pour ce GP
            const pronosSnapshot = await db.collection("pronostics").where("course", "==", courseId).get();
            
            if (pronosSnapshot.empty) {
                console.log(`⚠️ Aucun prono enregistré par tes amis pour le GP ${round}.`);
            } else {
                // Parcourir les pronostics des joueurs
                for (const doc of pronosSnapshot.docs) {
                    const prono = doc.data();
                    const uidJoueur = prono.uidJoueur;
                    const pseudo = prono.pseudo;
                    const grilleJoueur = prono.classementPilotes;

                    let pointsGagnes = 0;

                    // --- RÈGLE DE CALCUL DE BASE ---
                    grilleJoueur.forEach((piloteProno, indexProno) => {
                        const indexOfficiel = top10Officiel.indexOf(piloteProno);
                        if (indexOfficiel !== -1) {
                            if (indexProno === indexOfficiel) {
                                pointsGagnes += 10; // Position exacte !
                            } else {
                                pointsGagnes += 3;  // Dans le top 10 mais mauvaise place
                            }
                        }
                    });

                    console.log(`📊 ${pseudo} remporte +${pointsGagnes} pts sur ce GP.`);

                    // Ajouter ces points au cumul total du joueur dans la collection "utilisateurs"
                    const userRef = db.collection("utilisateurs").doc(uidJoueur);
                    await db.runTransaction(async (transaction) => {
                        const userDoc = await transaction.get(userRef);
                        if (userDoc.exists) {
                            const pointsActuels = userDoc.data().points || 0;
                            transaction.update(userRef, { points: pointsActuels + pointsGagnes });
                        } else {
                            transaction.set(userRef, { pseudo: pseudo, points: pointsGagnes });
                        }
                    });
                }
            }

            // Marquer ce GP comme définitivement calculé dans l'historique Firestore
            await histoRef.set({ calculeLe: new Date(), top10: top10Officiel });
            console.log(`🔒 GP ${round} clôturé et sauvegardé.`);

        } catch (error) {
            console.error(`❌ Erreur lors de l'analyse du GP ${round}:`, error.message);
            break;
        }
    }
    console.log("🤖 Fin de la tâche automatisée.");
}

demarrer();
