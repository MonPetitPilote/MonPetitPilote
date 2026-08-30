import { doc, getDoc, setDoc, type Firestore } from "firebase/firestore";
import { type GrandPrix } from "../utils/types";

// Base compacte par défaut initialisée avant réponse API (24 GP F1 2026)
const CALENDRIER_BASE_2026: GrandPrix[] = [
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

// État en mémoire réactif
let calendrierActuel: GrandPrix[] = [...CALENDRIER_BASE_2026];
const ecouteursChangement: Array<(calendrier: GrandPrix[]) => void> = [];

export function getCalendrierActuel(): GrandPrix[] {
    return calendrierActuel;
}

export const calendrier2026 = CALENDRIER_BASE_2026;

export function onCalendrierChange(callback: (calendrier: GrandPrix[]) => void): () => void {
    ecouteursChangement.push(callback);
    return () => {
        const index = ecouteursChangement.indexOf(callback);
        if (index > -1) ecouteursChangement.splice(index, 1);
    };
}

function notifierEcouteurs(): void {
    ecouteursChangement.forEach(cb => cb(calendrierActuel));
}

// Vérifie si un round donné comporte une course Sprint
export function estWeekendSprint(roundOuCourseId: number | string): boolean {
    const roundNum = typeof roundOuCourseId === 'string'
        ? parseInt(roundOuCourseId.includes('/') ? roundOuCourseId.split('/')[1] : roundOuCourseId, 10)
        : roundOuCourseId;

    const gp = calendrierActuel.find(g => g.round === roundNum);
    return gp?.hasSprint === true;
}

// Récupère les infos d'un Grand Prix par son numéro de round
export function recupererGpParRound(roundOuCourseId: number | string): GrandPrix | undefined {
    const roundNum = typeof roundOuCourseId === 'string'
        ? parseInt(roundOuCourseId.includes('/') ? roundOuCourseId.split('/')[1] : roundOuCourseId, 10)
        : roundOuCourseId;

    return calendrierActuel.find(g => g.round === roundNum);
}

// Synchronise le calendrier dynamiquement (Firestore > Jolpica / Ergast API > Base)
export async function synchroniserCalendrierDynamique(db?: Firestore): Promise<GrandPrix[]> {
    // 1. Tenter de charger depuis Firestore (configuration administrée à chaud)
    if (db) {
        try {
            const configRef = doc(db, "configuration_saison", "calendrier_2026");
            const configSnap = await getDoc(configRef);
            if (configSnap.exists()) {
                const data = configSnap.data();
                if (data && Array.isArray(data.grandsPrix) && data.grandsPrix.length > 0) {
                    calendrierActuel = data.grandsPrix;
                    notifierEcouteurs();
                    return calendrierActuel;
                }
            }
        } catch (err) {
            console.warn("ℹ️ [Calendrier] Configuration Firestore distante, passage à l'API...", err);
        }
    }

    // 2. Synchronisation en direct avec l'API publique F1 Jolpica
    try {
        const response = await fetch("https://api.jolpi.ca/ergast/f1/2026.json", {
            headers: { "Accept": "application/json" },
            signal: AbortSignal.timeout(3500)
        });

        if (response.ok) {
            const data = await response.json();
            const races = data?.MRData?.RaceTable?.Races;

            if (Array.isArray(races) && races.length > 0) {
                const nouveauCalendrier: GrandPrix[] = races.map((r: any) => {
                    const roundNum = parseInt(r.round, 10);
                    const localRef = CALENDRIER_BASE_2026.find(g => g.round === roundNum);

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
                        statut: localRef?.statut || 'programme'
                    };
                });

                calendrierActuel = nouveauCalendrier;
                notifierEcouteurs();

                if (db) {
                    setDoc(doc(db, "configuration_saison", "calendrier_2026"), {
                        grandsPrix: nouveauCalendrier,
                        derniereSync: new Date().toISOString()
                    }, { merge: true }).catch(() => {});
                }

                return calendrierActuel;
            }
        }
    } catch (_) {
        // En cas de coupure réseau, calendrierActuel conserve les 24 GP
    }

    return calendrierActuel;
}