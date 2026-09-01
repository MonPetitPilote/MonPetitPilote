// Script à lancer UNE SEULE FOIS pour purger les GP dont le round a été mal
// calculé par l'ancienne version du cron (mapping codé en dur désynchronisé
// du vrai calendrier Firestore).
//
// UTILISATION :
//   1. Modifie la liste ROUNDS_A_CORRIGER ci-dessous avec les rounds concernés
//   2. node nettoyage-rounds.js
//   3. Relance ensuite le cron normalement (node cron-calcul.js, ou
//      workflow_dispatch sur GitHub Actions) pour qu'il recalcule ces GP
//      avec le bon round.

const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

initializeApp();
const db = getFirestore();

// 👉 Modifie cette liste avec les rounds à réinitialiser
const ROUNDS_A_CORRIGER = [15];

async function nettoyer() {
    for (const round of ROUNDS_A_CORRIGER) {
        await db.collection("historique_courses").doc(`2026_${round}`).delete();
        console.log(`🗑️  historique_courses/2026_${round} supprimé.`);

        const snapshot = await db.collection("pronostics").where("course", "==", `2026/${round}`).get();
        for (const doc of snapshot.docs) {
            await doc.ref.update({ bilanCalcul: FieldValue.delete() });
        }
        console.log(`🗑️  bilanCalcul retiré de ${snapshot.size} pronostic(s) pour le round ${round}.`);
    }
    console.log("\n✅ Nettoyage terminé. Tu peux relancer le cron pour recalculer ces GP.");
    process.exit(0);
}

nettoyer().catch(err => {
    console.error("❌ Erreur pendant le nettoyage :", err.message);
    process.exit(1);
});
