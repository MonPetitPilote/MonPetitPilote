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

// Nombre total de courses à vérifier pour la saison 2026
const totalRounds = 21; 

// Base de données des pilotes pour calculer les cotes (identique au site web)
const pilotesData = [
  {nom: "Max Verstappen", ecurie: "Red Bull", statut: "favori", img: "https://cdn-1.motorsport.com/images/vcl/X0kvd86d/s3/red-bull-racing-rb22.png"},
  {nom: "Isack Hadjar", ecurie: "Red Bull", statut: "outsider", img: "https://cdn-1.motorsport.com/images/vcl/X0kvd86d/s3/red-bull-racing-rb22.png"},
  {nom: "Lewis Hamilton", ecurie: "Ferrari", statut: "favori", img: "https://cdn-9.motorsport.com/images/vcl/jYNlMJ0D/s3/ferrari-sf-26.png"},
  {nom: "Charles Leclerc", ecurie: "Ferrari", statut: "favori", img: "https://cdn-9.motorsport.com/images/vcl/jYNlMJ0D/s3/ferrari-sf-26.png"},
  {nom: "Lando Norris", ecurie: "McLaren", statut: "favori", img: "https://cdn-2.motorsport.com/images/vcl/p2wyqb6Q/s3/mclaren-mcl40.png"},
  {nom: "Oscar Piastri", ecurie: "McLaren", statut: "favori", img: "https://cdn-2.motorsport.com/images/vcl/p2wyqb6Q/s3/mclaren-mcl40.png"},
  {nom: "George Russell", ecurie: "Mercedes", statut: "favori", img: "https://cdn-8.motorsport.com/images/vcl/z0qrdy2N/s3/mercedes-mgp-w17.png"},
  {nom: "Kimi Antonelli", ecurie: "Mercedes", statut: "favori", img: "https://cdn-8.motorsport.com/images/vcl/z0qrdy2N/s3/mercedes-mgp-w17.png"},
  {nom: "Fernando Alonso", ecurie: "Aston Martin", statut: "outsider", img: "https://cdn-2.motorsport.com/images/vcl/vYMl7G2E/s3/aston-martin-amr26.png"},
  {nom: "Lance Stroll", ecurie: "Aston Martin", statut: "outsider", img: "https://cdn-2.motorsport.com/images/vcl/vYMl7G2E/s3/aston-martin-amr26.png"},
  {nom: "Pierre Gasly", ecurie: "Alpine", statut: "outsider", img: "https://cdn-3.motorsport.com/images/vcl/q633Z46A/s3/alpine-a526.png"},
  {nom: "Franco Colapinto", ecurie: "Alpine", statut: "outsider", img: "https://cdn-3.motorsport.com/images/vcl/q633Z46A/s3/alpine-a526.png"},
  {nom: "Carlos Sainz", ecurie: "Williams", statut: "outsider", img: "https://cdn-7.motorsport.com/images/vcl/B2G3Vr29/s3/williams-fw48.png"},
  {nom: "Alex Albon", ecurie: "Williams", statut: "outsider", img: "https://cdn-7.motorsport.com/images/vcl/B2G3Vr29/s3/williams-fw48.png"},
  {nom: "Liam Lawson", ecurie: "Racing Bulls", statut: "fond", img: "https://cdn-2.motorsport.com/images/vcl/G2ewOP6o/s3/racing-bulls-vcarb03.png"},
  {nom: "Arvid Lindblad", ecurie: "Racing Bulls", statut: "fond", img: "https://cdn-2.motorsport.com/images/vcl/G2ewOP6o/s3/racing-bulls-vcarb03.png"},
  {nom: "Nico Hülkenberg", ecurie: "Audi", statut: "fond", img: "https://cdn-8.motorsport.com/images/vcl/x27BRO0E/s3/audi-r26-2.png"},
  {nom: "Gabriel Bortoleto", ecurie: "Audi", statut: "fond", img: "https://cdn-8.motorsport.com/images/vcl/x27BRO0E/s3/audi-r26-2.png"},
  {nom: "Oliver Bearman", ecurie: "Haas", statut: "fond", img: "https://cdn-6.motorsport.com/images/vcl/e2dwbn0J/s3/haas-vf-26.png"},
  {nom: "Esteban Ocon", ecurie: "Haas", statut: "fond", img: "https://cdn-6.motorsport.com/images/vcl/e2dwbn0J/s3/haas-vf-26.png"},
  {nom: "Valtteri Bottas", ecurie: "Cadillac", statut: "fond", img: "https://cdn-5.motorsport.com/images/vcl/n0mwOGYz/s3/cadillac-2.png"},
  {nom: "Sergio Pérez", ecurie: "Cadillac", statut: "fond", img: "https://cdn-5.motorsport.com/images/vcl/n0mwOGYz/s3/cadillac-2.png"}
];

// Fonction interne pour recalculer la cote exacte d'une position
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
    console.log("🤖 Lancement de la vérification quotidienne des résultats...");
    
    for (let round = 1; round <= totalRounds; round++) {
        const courseId = `2026/${round}`;
        
        try {
            // Récupération des résultats officiels de l'API
            const res = await axios.get(`https://ergast.com/api/f1/2026/${round}/results.json`);
            const race = res.data.MRData.RaceTable.Race[0];
            
            if (!race || !race.Results) {
                console.log(`ℹ️ Le GP numéro ${round} n'est pas encore terminé. Fin de la vérification.`);
                break;
            }

            // Éviter de recalculer si la course est déjà clôturée
            const histoRef = db.collection("courses_calculees").doc(`gp_${round}`);
            const histoDoc = await histoRef.get();
            
            if (histoDoc.exists) {
                console.log(`✅ GP ${round} déjà traité et calculé précédemment. Passage au suivant...`);
                continue; 
            }

            console.log(`🏁 Nouveau GP détecté comme terminé ! Calcul des scores pour le GP ${round}...`);
            
            // Extraction du Top 10 officiel
            const top10Officiel = race.Results.slice(0, 10).map(r => `${r.Driver.givenName} ${r.Driver.familyName}`);
            console.log("🏆 TOP 10 OFFICIEL :", top10Officiel);

            // Détermination du poleman officiel (P1 de la course pour simplification de l'API)
            const polemanOfficiel = top10Officiel[0]; 

            // Comptage des voitures par écurie présentes dans le Top 10
            const compteEcuriesTop10 = {};
            top10Officiel.forEach(piloteNom => {
                const pData = pilotesData.find(p => p.nom === piloteNom);
                if (pData) {
                    compteEcuriesTop10[pData.ecurie] = (compteEcuriesTop10[pData.ecurie] || 0) + 1;
                }
            });

            // Récupération de tous les pronostics des joueurs pour cette manche
            const pronosSnapshot = await db.collection("pronostics").where("course", "==", courseId).get();
            
            if (pronosSnapshot.empty) {
                console.log(`⚠️ Aucun prono enregistré par tes amis pour le GP ${round}.`);
            } else {
                for (const doc of pronosSnapshot.docs) {
                    const prono = doc.data();
                    const uidJoueur = prono.uidJoueur;
                    const pseudo = prono.pseudo;
                    const grilleJoueur = prono.classementPilotes;

                    let pointsGagnes = 0;

                    // 1. CALCUL DU TOP 10 PILOTES + LOGIQUE DU COUP DE POKER (MULTIPLIÉ PAR LA COTE)
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
                                    console.log(`  ⭐ [${pseudo}] COUP DE POKER RÉUSSI : ${piloteProno} P${position} ! Cote x${cote} -> +${pointsPoker} pts`);
                                } else {
                                    pointsGagnes += 10; // Place exacte standard
                                }
                            } else {
                                // Pilote dans le Top 10 mais mauvaise position. Un coup de poker raté donne 0.
                                if (!estCoupPoker) {
                                    pointsGagnes += 3;
                                }
                            }
                        }
                    });

                    // 2. BONUS POLEMAN DU SAMEDI (+15 pts)
                    if (prono.poleman === polemanOfficiel) {
                        pointsGagnes += 15;
                        console.log(`  ⏱️ [${pseudo}] Bonus Poleman réussi ! +15 pts`);
                    }

                    // 3. BONUS ÉCURIES TOPS (Les 2 voitures finissent dans le Top 10 -> +10 pts)
                    if (prono.ecuriesTop && Array.isArray(prono.ecuriesTop)) {
                        prono.ecuriesTop.forEach(ecurie => {
                            if (compteEcuriesTop10[ecurie] === 2) {
                                pointsGagnes += 10;
                                console.log(`  🔥 [${pseudo}] Écurie TOP Validée (${ecurie}) ! +10 pts`);
                            }
                        });
                    }

                    // 4. BONUS ÉCURIES FLOPS (0 voiture dans le Top 10 -> +10 pts)
                    if (prono.ecuriesFlop && Array.isArray(prono.ecuriesFlop)) {
                        prono.ecuriesFlop.forEach(ecurie => {
                            if (!compteEcuriesTop10[ecurie] || compteEcuriesTop10[ecurie] === 0) {
                                pointsGagnes += 10;
                                console.log(`  ⚠️ [${pseudo}] Écurie FLOP Validée (${ecurie}) ! +10 pts`);
                            }
                        });
                    }

                    console.log(`📊 Résultat Week-end : ${pseudo} empoche un total de +${pointsGagnes} pts.`);

                    // Injection et cumul des points dans la fiche de l'utilisateur
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

            // Clôture définitive du Grand Prix pour ne plus repasser dessus
            await histoRef.set({ calculeLe: new Date(), top10: top10Officiel });
            console.log(`🔒 GP ${round} verrouillé et archivé avec succès.`);

        } catch (error) {
            console.error(`❌ Erreur lors de l'analyse du GP ${round}:`, error.message);
            break;
        }
    }
    console.log("🤖 Fin de la tâche automatisée.");
}

demarrer();
