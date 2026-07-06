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

const totalRounds = 24; // La saison 2026 comporte généralement 24 Grands Prix

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
    console.log("🤖 Lancement du calcul automatique OpenF1 pour la saison 2026...");
    
    for (let round = 1; round <= totalRounds; round++) {
        const courseId = `2026/${round}`; 
        
        try {
            // 1. Récupérer la session de course (Race) pour le round 2026 demandé
            const sessionRes = await axios.get(`https://api.openf1.org/v1/sessions?year=2026&session_name=Race`);
            const sessions = sessionRes.data;
            
            // On cherche la session qui correspond à l'index du round actuel
            // OpenF1 liste les sessions dans l'ordre chronologique de l'année
            const sessionCourse = sessions[round - 1]; 
            
            if (!sessionCourse) {
                console.log(`ℹ️ Le GP numéro ${round} de 2026 n'est pas encore enregistré ou débuté.`);
                break;
            }

            const sessionKey = sessionCourse.session_key;

            // 2. Récupérer la position finale des pilotes pour cette course spécifique
            const positionsRes = await axios.get(`https://api.openf1.org/v1/position?session_key=${sessionKey}`);
            const ttesPositions = positionsRes.data;

            if (!ttesPositions || ttesPositions.length === 0) {
                console.log(`ℹ️ Les résultats du GP numéro ${round} ne sont pas encore disponibles.`);
                break;
            }

            // Vérifier si le GP est déjà calculé dans ton Firestore
            const histoRef = db.collection("courses_calculees").doc(`gp_${round}`);
            const histoDoc = await histoRef.get();
            
            if (histoDoc.exists) {
                console.log(`ℹ️ Le GP ${round} a déjà été traité.`);
                continue; 
            }

            // Filtrer pour obtenir la dernière position connue de chaque pilote à la fin de la course
            const derniersEtatsPilotes = {};
            ttesPositions.forEach(pos => {
                derniersEtatsPilotes[pos.driver_number] = pos;
            });

            // Classer les pilotes par position montante (1, 2, 3...)
            const classementTrie = Object.values(derniersEtatsPilotes).sort((a, b) => a.position - b.position);

            // Récupérer le dictionnaire des pilotes pour convertir les numéros (ex: 1) en Noms (ex: Max Verstappen)
            const driversRes = await axios.get(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`);
            const driversList = driversRes.data;

            const top10Officiel = [];
            for (let i = 0; i < Math.min(10, classementTrie.length); i++) {
                const numPilote = classementTrie[i].driver_number;
                const dInfo = driversList.find(d => d.driver_number === numPilote);
                if (dInfo) {
                    top10Officiel.push(`${dInfo.first_name} ${dInfo.last_name}`);
                }
            }

            if (top10Officiel.length < 10) {
                console.log(`ℹ️ Attente de la validation définitive du classement final pour le GP ${round}.`);
                break;
            }

            console.log(`🏁 Traitement en cours du GP 2026 Round ${round}. Top 3 officiel :`, top10Officiel.slice(0,3));
            
            // Le premier du Top 10 de la course est considéré comme notre référence de points
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

                    const utiliserJoker = prono.jokerActive || false;
                    if (utiliserJoker) {
                        pointsGagnes = pointsGagnes * 3;
                    }

                    await db.collection("historique_points").add({
                        uidJoueur, pseudo, round, courseId, pointsGagnes,
                        polemanProno: prono.poleman, polemanOfficiel,
                        classementPilotes: grilleJoueur, top10Officiel,
                        jokerApplique: utiliserJoker, dateCalcul: new Date()
                    });

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
                                pseudo, points: pointsGagnes,
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
            console.error(`⚠️ Erreur de connexion ou attente de session pour le GP ${round}:`, error.message);
            break; 
        }
    }
    console.log("🤖 Fin d'exécution.");
}

demarrer();
