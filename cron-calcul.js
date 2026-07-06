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

const totalRounds = 24;

const pilotesData = [
  {nom: "Max Verstappen", ecurie: "Red Bull"}, {nom: "Isack Hadjar", ecurie: "Red Bull"},
  {nom: "Lewis Hamilton", ecurie: "Ferrari"}, {nom: "Charles Leclerc", ecurie: "Ferrari"},
  {nom: "Lando Norris", ecurie: "McLaren"}, {nom: "Oscar Piastri", ecurie: "McLaren"},
  {nom: "George Russell", ecurie: "Mercedes"}, {nom: "Kimi Antonelli", ecurie: "Mercedes"},
  {nom: "Fernando Alonso", ecurie: "Aston Martin"}, {nom: "Lance Stroll", ecurie: "Aston Martin"},
  {nom: "Pierre Gasly", ecurie: "Alpine"}, {nom: "Jack Doohan", ecurie: "Alpine"},
  {nom: "Alex Albon", ecurie: "Williams"}, {nom: "Carlos Sainz", ecurie: "Williams"},
  {nom: "Yuki Tsunoda", ecurie: "Racing Bulls"}, {nom: "Liam Lawson", ecurie: "Racing Bulls"},
  {nom: "Nico Hulkenberg", ecurie: "Audi"}, {nom: "Gabriel Bortoleto", ecurie: "Audi"},
  {nom: "Esteban Ocon", ecurie: "Haas"}, {nom: "Oliver Bearman", ecurie: "Haas"}
];

const BAREME_F1 = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

async function demarrer() {
    console.log("🤖 Traitement automatique des résultats de course...");

    for (let round = 1; round <= totalRounds; round++) {
        const histoRef = db.collection("historique_courses").doc(`gp_${round}`);
        const histoDoc = await histoRef.get();

        if (histoDoc.exists) continue; // Déjà calculé, on passe

        try {
            const sessionRes = await axios.get(`https://api.openf1.org/v1/sessions?round=${round}&session_name=Race`);
            if (!sessionRes.data || sessionRes.data.length === 0) {
                console.log(`⏹️ GP ${round} non disponible.`);
                break; 
            }

            const sessionKey = sessionRes.data[0].session_key;
            const positionRes = await axios.get(`https://api.openf1.org/v1/position?session_key=${sessionKey}`);
            if (!positionRes.data || positionRes.data.length === 0) break;

            const triee = positionRes.data.sort((a, b) => a.position - b.position);
            const driversRes = await axios.get(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`);
            
            const driversMap = {};
            driversRes.data.forEach(d => {
                driversMap[d.driver_number] = `${d.first_name} ${d.last_name}`;
            });

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
            } catch (e) { console.warn("Pas de poleman trouvé"); }

            const joueursSnapshot = await db.collection("pronostics").get();
            
            for (let joueurDoc of joueursSnapshot.docs) {
                const userId = joueurDoc.id;
                const userDataBase = joueurDoc.data();

                const pronoRef = db.collection("pronostics").doc(userId).collection("grands_prix").doc(`gp_${round}`);
                const pronoDoc = await pronoRef.get();

                if (pronoDoc.exists) {
                    const pronoData = pronoDoc.data();
                    let pointsDuTop10 = 0;
                    let pointsDesEcuries = 0;
                    let bonusPole = 0;

                    if (pronoData.top10 && Array.isArray(pronoData.top10)) {
                        pronoData.top10.forEach((piloteProno, indexProno) => {
                            const indexOfficiel = top10Officiel.indexOf(piloteProno);
                            if (indexOfficiel !== -1) {
                                pointsDuTop10 += (indexProno === indexOfficiel) ? BAREME_F1[indexProno] : 1;
                            }
                        });
                    }

                    const poleReussie = (pronoData.poleman && polemanOfficiel && pronoData.poleman === polemanOfficiel);
                    if (poleReussie) bonusPole = 5;

                    const ecurieGagnante = pilotesData.find(p => p.nom === top10Officiel[0])?.ecurie;
                    if (pronoData.ecurieTop1 === ecurieGagnante) pointsDesEcuries += 5;
                    if (pronoData.ecurieTop2 === ecurieGagnante) pointsDesEcuries += 2;

                    let pointsTotaux = pointsDuTop10 + bonusPole + pointsDesEcuries;
                    if (pronoData.jokerUtilise) pointsTotaux *= 2;

                    await db.runTransaction(async (transaction) => {
                        const userRef = db.collection("pronostics").doc(userId);
                        const userDoc = await transaction.get(userRef);
                        
                        if (userDoc.exists) {
                            const current = userDoc.data();
                            transaction.update(userRef, { 
                                points: (current.points || 0) + pointsTotaux,
                                polesReussies: (current.polesReussies || 0) + (poleReussie ? 1 : 0)
                            });

                            transaction.set(pronoRef, {
                                bilanCalcul: {
                                    pointsTotaux: pointsTotaux,
                                    detailTop10: pointsDuTop10,
                                    bonusPole: bonusPole,
                                    bonusEcuries: pointsDesEcuries,
                                    jokerApplique: pronoData.jokerUtilise || false,
                                    calculeLe: new Date()
                                }
                            }, { merge: true });
                        }
                    });
                }
            }
            await histoRef.set({ calculeLe: new Date(), top10: top10Officiel, poleman: polemanOfficiel });
        } catch (error) {
            console.error("Erreur calcul :", error.message);
            break; 
        }
    }
}
demarrer();
