// Script pour réparer les polemen enregistrés comme "Inconnu" dans Firestore
// et créditer rétroactivement les points (+5 pts, ou +10 pts si joker) aux joueurs
//
// UTILISATION :
//   node reparer-poleman.js
// ou via GitHub Actions avec les credentials Firebase Admin

const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const axios = require('axios');

try {
    initializeApp();
} catch (e) {
    // Si déjà initialisé
}
const db = getFirestore();

function normaliser(texte) {
    return (texte || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function nomsCorrespondent(nomA, nomB) {
    const a = normaliser(nomA);
    const b = normaliser(nomB);
    if (!a || !b || a === "inconnu" || b === "inconnu") return false;
    return a.includes(b) || b.includes(a);
}

async function recupererVraiPolemanJolpica(round) {
    try {
        const url = `https://api.jolpi.ca/ergast/f1/2026/${round}/qualifying.json`;
        console.log(`📡 Requête qualification Jolpica pour Round ${round}...`);
        const res = await axios.get(url, { timeout: 10000 });
        const race = res.data?.MRData?.RaceTable?.Races?.[0];
        const p1 = race?.QualifyingResults?.[0];
        if (p1 && p1.Driver) {
            const driver = p1.Driver;
            const nomComplet = `${driver.givenName || ''} ${driver.familyName || ''}`.trim();
            // Normalisation des cas connus (ex: Andrea Kimi Antonelli -> Kimi Antonelli)
            if (nomsCorrespondent(nomComplet, "Kimi Antonelli") || (driver.code && driver.code.toUpperCase() === "ANT")) {
                return "Kimi Antonelli";
            }
            if (nomsCorrespondent(nomComplet, "George Russell") || (driver.code && driver.code.toUpperCase() === "RUS")) {
                return "George Russell";
            }
            if (nomsCorrespondent(nomComplet, "Max Verstappen") || (driver.code && driver.code.toUpperCase() === "VER")) {
                return "Max Verstappen";
            }
            if (nomsCorrespondent(nomComplet, "Lando Norris") || (driver.code && driver.code.toUpperCase() === "NOR")) {
                return "Lando Norris";
            }
            if (nomsCorrespondent(nomComplet, "Charles Leclerc") || (driver.code && driver.code.toUpperCase() === "LEC")) {
                return "Charles Leclerc";
            }
            if (nomsCorrespondent(nomComplet, "Lewis Hamilton") || (driver.code && driver.code.toUpperCase() === "HAM")) {
                return "Lewis Hamilton";
            }
            if (nomsCorrespondent(nomComplet, "Oscar Piastri") || (driver.code && driver.code.toUpperCase() === "PIA")) {
                return "Oscar Piastri";
            }
            return nomComplet;
        }
    } catch (err) {
        console.warn(`⚠️ Impossible de récupérer les qualifs pour Round ${round} :`, err.message);
    }
    return null;
}

async function reparer() {
    console.log("🔍 Recherche des courses avec Poleman 'Inconnu' ou manquant...");
    const snapshot = await db.collection("historique_courses").get();

    for (const docSnap of snapshot.docs) {
        const id = docSnap.id; // ex: '2026_2'
        const data = docSnap.data();
        const round = id.includes('_') ? id.split('_')[1] : id;

        if (!data.poleman || data.poleman === "Inconnu") {
            console.log(`\n⚙️ Détection du Round ${round} avec Poleman: "${data.poleman}"`);
            const vraiPoleman = await recupererVraiPolemanJolpica(round);

            if (vraiPoleman) {
                console.log(`✅ Vrai Poleman trouvé pour Round ${round} : ${vraiPoleman}`);
                await docSnap.ref.update({ poleman: vraiPoleman });
                console.log(`💾 historique_courses/${id} mis à jour avec poleman: ${vraiPoleman}`);

                // Recherche des pronostics pour ce round
                const pronoSnaps = await db.collection("pronostics").where("course", "==", `2026/${round}`).get();
                for (const pronoDoc of pronoSnaps.docs) {
                    const prono = pronoDoc.data();
                    const bilan = prono.bilanCalcul;
                    if (!bilan) continue;

                    const pronoPole = prono.poleman;
                    const poleCorrecte = pronoPole && nomsCorrespondent(vraiPoleman, pronoPole);

                    if (poleCorrecte && (!bilan.pointsPole || bilan.pointsPole === 0)) {
                        const multiplicateur = (bilan.jokerApplique || prono.joker) ? 2 : 1;
                        const ptsBonusPole = 5 * multiplicateur;
                        const nouveauxPointsTotaux = (bilan.pointsTotaux || 0) + ptsBonusPole;

                        console.log(`🎯 Pronostic gagnant pour ${prono.pseudo || pronoDoc.id} (+${ptsBonusPole} pts)`);

                        await pronoDoc.ref.update({
                            "bilanCalcul.pointsPole": ptsBonusPole,
                            "bilanCalcul.pointsTotaux": nouveauxPointsTotaux
                        });

                        // Mettre à jour le classement général du joueur si présent
                        if (prono.userId) {
                            try {
                                const userRef = db.collection("classement").doc(prono.userId);
                                const userSnap = await userRef.get();
                                if (userSnap.exists) {
                                    const ancPts = userSnap.data().points || 0;
                                    await userRef.update({ points: ancPts + ptsBonusPole });
                                    console.log(`🏆 Classement général incrémenté pour ${prono.pseudo || prono.userId} (+${ptsBonusPole})`);
                                }
                            } catch (uErr) {
                                console.warn(`Erreur maj classement user:`, uErr.message);
                            }
                        }
                    }
                }
            } else {
                console.log(`⚠️ Aucun poleman trouvé pour Round ${round}`);
            }
        }
    }

    console.log("\n🏁 Réparation terminée !");
    process.exit(0);
}

reparer().catch(err => {
    console.error("❌ Erreur générale de réparation :", err.message);
    process.exit(1);
});
