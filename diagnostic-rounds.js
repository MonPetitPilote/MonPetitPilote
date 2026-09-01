// Script de DIAGNOSTIC (lecture seule, ne modifie rien) à lancer une fois
// pour identifier précisément quels GP ont été mal calculés à cause du
// mapping "round" codé en dur désynchronisé du vrai calendrier Firestore.
//
// UTILISATION :
//   node diagnostic-rounds.js
//
// Il ne fait AUCUNE modification — il affiche juste un rapport.

const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const axios = require('axios');

initializeApp();
const db = getFirestore();

function normaliserNom(texte) {
    return (texte || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

// L'ANCIEN mapping codé en dur (celui potentiellement fautif)
const calendrier2026ParLieuAncien = {
    "melbourne": 1, "australia": 1,
    "shanghai": 2, "china": 2,
    "suzuka": 3, "japan": 3,
    "miami gardens": 4, "miami": 4, "united states": 4,
    "montreal": 5, "montréal": 5, "canada": 5,
    "monte carlo": 6, "monaco": 6,
    "barcelona": 7, "spain": 7, "espagne": 7,
    "spielberg": 8, "austria": 8, "autriche": 8,
    "silverstone": 9, "great britain": 9, "united kingdom": 9,
    "spa-francorchamps": 10, "spa": 10, "belgium": 10, "belgique": 10,
    "budapest": 11, "hungary": 11, "hongrie": 11,
    "zandvoort": 12, "netherlands": 12, "pays-bas": 12,
    "monza": 13, "italy": 13, "italie": 13,
    "madrid": 14,
    "baku": 15, "azerbaijan": 15, "azerbaidjan": 15,
    "marina bay": 16, "singapore": 16, "singapour": 16,
    "austin": 17,
    "mexico city": 18, "mexico": 18, "mexique": 18,
    "sao paulo": 19, "são paulo": 19, "brazil": 19, "bresil": 19,
    "las vegas": 20,
    "lusail": 21, "qatar": 21,
    "yas marina": 22, "abu dhabi": 22, "united arab emirates": 22
};

function deduireRoundAncien(session) {
    const location = normaliserNom(session.location);
    const country = normaliserNom(session.country_name);
    const circuit = normaliserNom(session.circuit_short_name);
    if (calendrier2026ParLieuAncien[location]) return calendrier2026ParLieuAncien[location];
    if (calendrier2026ParLieuAncien[circuit]) return calendrier2026ParLieuAncien[circuit];
    if (calendrier2026ParLieuAncien[country]) return calendrier2026ParLieuAncien[country];
    for (const [cle, r] of Object.entries(calendrier2026ParLieuAncien)) {
        if (location.includes(cle) || circuit.includes(cle) || country.includes(cle)) return r;
    }
    return null;
}

async function chargerCalendrierDynamique() {
    const docSnap = await db.collection("configuration_saison").doc("calendrier_2026").get();
    if (!docSnap.exists) return null;
    const grandsPrix = docSnap.data().grandsPrix || [];

    const occurrences = {};
    grandsPrix.forEach(gp => {
        [gp.nom, gp.circuit, gp.pays].forEach(valeur => {
            const cle = normaliserNom(valeur);
            if (!cle) return;
            occurrences[cle] = (occurrences[cle] || 0) + 1;
        });
    });

    const table = {};
    grandsPrix.forEach(gp => {
        if (!gp.round) return;
        [gp.nom, gp.circuit, gp.pays].forEach(valeur => {
            const cle = normaliserNom(valeur);
            if (cle && occurrences[cle] === 1) table[cle] = gp.round;
        });
    });
    return { table, grandsPrix };
}

function deduireRoundDynamique(session, table) {
    const location = normaliserNom(session.location);
    const country = normaliserNom(session.country_name);
    const circuit = normaliserNom(session.circuit_short_name);
    if (table[location]) return table[location];
    if (table[circuit]) return table[circuit];
    if (table[country]) return table[country];
    for (const [cle, r] of Object.entries(table)) {
        if (location.includes(cle) || circuit.includes(cle) || country.includes(cle) ||
            cle.includes(location) || cle.includes(circuit)) {
            return r;
        }
    }
    return null;
}

async function diagnostiquer() {
    console.log("🔍 Lancement du diagnostic...\n");

    // 1. Calendrier dynamique
    const dynamique = await chargerCalendrierDynamique();
    if (!dynamique) {
        console.log("❌ Impossible de charger configuration_saison/calendrier_2026 — diagnostic impossible.");
        process.exit(1);
    }
    console.log(`✅ Calendrier dynamique chargé : ${dynamique.grandsPrix.length} GP trouvés.\n`);

    // 2. Sessions de course OpenF1 2026
    const resSessions = await axios.get("https://api.openf1.org/v1/sessions?year=2026&session_name=Race", { timeout: 15000 });
    const sessions = (resSessions.data || []).sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
    console.log(`✅ ${sessions.length} sessions de course trouvées sur OpenF1.\n`);

    // 3. Comparaison ancien vs nouveau round pour chaque session
    console.log("=".repeat(70));
    console.log("COMPARAISON ANCIEN CALCUL (codé en dur) vs NOUVEAU (Firestore dynamique)");
    console.log("=".repeat(70));

    const roundsProblematiques = new Set();

    for (const session of sessions) {
        const roundAncien = deduireRoundAncien(session);
        const roundNouveau = deduireRoundDynamique(session, dynamique.table);
        const lieu = session.location || session.circuit_short_name || "???";

        if (roundAncien !== roundNouveau) {
            console.log(`⚠️  ${lieu.padEnd(20)} | Ancien round: ${String(roundAncien).padEnd(4)} | Nouveau round: ${String(roundNouveau).padEnd(4)} <-- DIVERGENCE`);
            if (roundAncien) roundsProblematiques.add(roundAncien);
            if (roundNouveau) roundsProblematiques.add(roundNouveau);
        } else {
            console.log(`✅  ${lieu.padEnd(20)} | Round: ${roundAncien} (identique dans les deux méthodes)`);
        }
    }

    // 4. Vérifie lesquels de ces rounds problématiques ont déjà un historique_courses calculé
    console.log("\n" + "=".repeat(70));
    console.log("ROUNDS À CORRIGER (déjà calculés ET concernés par une divergence)");
    console.log("=".repeat(70));

    const roundsACorreiger = [];
    for (const round of roundsProblematiques) {
        const histoDoc = await db.collection("historique_courses").doc(`2026_${round}`).get();
        if (histoDoc.exists) {
            const data = histoDoc.data();
            console.log(`🗑️  Round ${round} — déjà calculé (P1 stocké : ${data.top10?.[0] || '?'}) — À NETTOYER`);
            roundsACorreiger.push(round);
        }
    }

    if (roundsACorreiger.length === 0) {
        console.log("Aucun round problématique n'a encore été calculé — rien à nettoyer pour l'instant !");
    } else {
        console.log(`\n👉 Colle cette ligne dans nettoyage-rounds.js :\n`);
        console.log(`const ROUNDS_A_CORRIGER = [${roundsACorreiger.sort((a, b) => a - b).join(', ')}];`);
    }

    process.exit(0);
}

diagnostiquer().catch(err => {
    console.error("❌ Erreur pendant le diagnostic :", err.message);
    process.exit(1);
});