import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Réutilise la même base statique de secours que calendarService.ts
const CALENDRIER_BASE_2026 = [
    { round: 1, nom: "Grand Prix d'Australie", circuit: "Melbourne", pays: "Australie", date: "2026-03-08", hasSprint: false, statut: "programme" },
    { round: 2, nom: "Grand Prix de Chine", circuit: "Shanghai", pays: "Chine", date: "2026-03-15", hasSprint: true, sprintDate: "2026-03-14", statut: "programme" },
    { round: 3, nom: "Grand Prix du Japon", circuit: "Suzuka", pays: "Japon", date: "2026-03-29", hasSprint: false, statut: "programme" },
    { round: 4, nom: "Grand Prix de Bahreïn", circuit: "Sakhir", pays: "Bahreïn", date: "2026-04-12", hasSprint: false, statut: "programme" },
    { round: 5, nom: "Grand Prix d'Arabie Saoudite", circuit: "Jeddah", pays: "Arabie Saoudite", date: "2026-04-19", hasSprint: false, statut: "programme" },
    { round: 6, nom: "Grand Prix de Miami", circuit: "Miami", pays: "USA", date: "2026-05-03", hasSprint: true, sprintDate: "2026-05-02", statut: "programme" },
    { round: 7, nom: "Grand Prix du Canada", circuit: "Montréal", pays: "Canada", date: "2026-05-24", hasSprint: true, sprintDate: "2026-05-23", statut: "programme" },
    { round: 8, nom: "Grand Prix de Monaco", circuit: "Monaco", pays: "Monaco", date: "2026-06-07", hasSprint: false, statut: "programme" },
    { round: 9, nom: "Grand Prix d'Espagne (Barcelone)", circuit: "Barcelona", pays: "Espagne", date: "2026-06-14", hasSprint: false, statut: "programme" },
    { round: 10, nom: "Grand Prix d'Autriche", circuit: "Spielberg", pays: "Autriche", date: "2026-06-28", hasSprint: false, statut: "programme" },
    { round: 11, nom: "Grand Prix de Grande-Bretagne", circuit: "Silverstone", pays: "Royaume-Uni", date: "2026-07-05", hasSprint: true, sprintDate: "2026-07-04", statut: "programme" },
    { round: 12, nom: "Grand Prix de Belgique", circuit: "Spa-Francorchamps", pays: "Belgique", date: "2026-07-19", hasSprint: false, statut: "programme" },
    { round: 13, nom: "Grand Prix de Hongrie", circuit: "Budapest", pays: "Hongrie", date: "2026-07-26", hasSprint: false, statut: "programme" },
    { round: 14, nom: "Grand Prix des Pays-Bas", circuit: "Zandvoort", pays: "Pays-Bas", date: "2026-08-23", hasSprint: true, sprintDate: "2026-08-22", statut: "programme" },
    { round: 15, nom: "Grand Prix d'Italie (Monza)", circuit: "Monza", pays: "Italie", date: "2026-09-06", hasSprint: false, statut: "programme" },
    { round: 16, nom: "Grand Prix d'Espagne (Madrid)", circuit: "Madrid", pays: "Espagne", date: "2026-09-13", hasSprint: false, statut: "programme" },
    { round: 17, nom: "Grand Prix d'Azerbaïdjan", circuit: "Baku", pays: "Azerbaïdjan", date: "2026-09-26", hasSprint: false, statut: "programme" },
    { round: 18, nom: "Grand Prix de Singapour", circuit: "Singapour", pays: "Singapour", date: "2026-10-11", hasSprint: true, sprintDate: "2026-10-10", statut: "programme" },
    { round: 19, nom: "Grand Prix des États-Unis (Austin)", circuit: "Austin", pays: "USA", date: "2026-10-25", hasSprint: false, statut: "programme" },
    { round: 20, nom: "Grand Prix du Mexique", circuit: "Mexico City", pays: "Mexique", date: "2026-11-01", hasSprint: false, statut: "programme" },
    { round: 21, nom: "Grand Prix du Brésil", circuit: "São Paulo", pays: "Brésil", date: "2026-11-08", hasSprint: false, statut: "programme" },
    { round: 22, nom: "Grand Prix de Las Vegas", circuit: "Las Vegas", pays: "USA", date: "2026-11-21", hasSprint: false, statut: "programme" },
    { round: 23, nom: "Grand Prix du Qatar", circuit: "Lusail", pays: "Qatar", date: "2026-11-29", hasSprint: false, statut: "programme" },
    { round: 24, nom: "Grand Prix d'Abou Dabi", circuit: "Yas Island", pays: "Émirats Arabes Unis", date: "2026-12-06", hasSprint: false, statut: "programme" }
];

function getAdminApp() {
    if (getApps().length > 0) return getApps()[0];
    return initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            // Les \n littéraux stockés dans la variable d'env doivent être convertis en vrais sauts de ligne
            privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
        }),
    });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Sécurise l'endpoint : seul Vercel Cron (avec le secret configuré) peut le déclencher
    const authHeader = req.headers.authorization;
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: "Non autorisé" });
    }

    try {
        const app = getAdminApp();
        const db = getFirestore(app);

        const response = await fetch("https://api.jolpica.com/ergast/f1/2026.json", {
            headers: { Accept: "application/json" },
            signal: AbortSignal.timeout(8000),
        });

        let nouveauCalendrier = CALENDRIER_BASE_2026;

        if (response.ok) {
            const data = await response.json();
            const races = data?.MRData?.RaceTable?.Races;

            if (Array.isArray(races) && races.length > 0) {
                nouveauCalendrier = races.map((r: any) => {
                    const roundNum = parseInt(r.round, 10);
                    const localRef = CALENDRIER_BASE_2026.find((g) => g.round === roundNum);
                    const hasSprintApi = Boolean(r.Sprint || r.sprint || r.SprintQualifying);
                    const sprintDateApi = r.Sprint?.date || r.sprint?.date || localRef?.sprintDate;

                    return {
                        round: roundNum,
                        nom: r.raceName || localRef?.nom || `Grand Prix Round ${roundNum}`,
                        circuit: r.Circuit?.circuitName || localRef?.circuit || "Circuit Officiel",
                        pays: r.Circuit?.Location?.country || localRef?.pays || "",
                        date: r.date || localRef?.date || "2026-12-31",
                        hasSprint: (localRef?.hasSprint ?? false) || hasSprintApi,
                        sprintDate: sprintDateApi || localRef?.sprintDate,
                        statut: localRef?.statut || "programme",
                    };
                });
            }
        }

        await db.collection("configuration_saison").doc("calendrier_2026").set(
            {
                grandsPrix: nouveauCalendrier,
                derniereSync: new Date().toISOString(),
            },
            { merge: true }
        );

        return res.status(200).json({
            success: true,
            nombreCourses: nouveauCalendrier.length,
            sourceApi: response.ok,
        });
    } catch (error: any) {
        console.error("Erreur sync-calendrier:", error);
        return res.status(500).json({ error: error.message || "Erreur inconnue" });
    }
}