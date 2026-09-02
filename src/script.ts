import {
    pilotesData,
    afficherNotification,
    type StatistiquesSaison,
    type GrandPrix
} from "./utils";

import {
    CODE_LIGUE_MONDIAL,
    recupererLiguesUtilisateur,
    calculerStatistiquesEtClassement,
    courseEstVerrouillee,
    mettreAJourDesignSlotSprint,
    controlerDoublonsSprint,
    creerLaGrilleSprintTV,
    estWeekendSprint,
    synchroniserCalendrierDynamique,
    getCalendrierActuel
} from "./services";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirestore as getFirestoreModerne } from "./utils/firebase";
import { useStatsStore, useGridStore } from "./stores";
import { watch } from "vue";

declare const firebase: any;

// ==========================================
// 1. CONFIGURATION ET INITIALISATION FIREBASE
// ==========================================
const firebaseConfig = {
    apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
    authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: (import.meta as any).env.VITE_FIREBASE_APP_ID
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const auth = firebase.auth();
const dbModerne = getFirestoreModerne();
const statsStore = useStatsStore();
const gridStore = useGridStore();

let utilisateurActuel: any = null;
let ligueActiveActuelle: string = CODE_LIGUE_MONDIAL;
let membresLigueActive: Set<string> | null = null;
let derniereStatsSaison: StatistiquesSaison | null = null;
let selectionCourseModifieeParUtilisateur = false;

// ==========================================
// 2. GESTION AUTHENTIFICATION & PROFIL
// ==========================================
// L'affichage connecté/déconnecté, le pseudo et son édition sont désormais
// gérés par TopHeader.vue et WorkspaceProfile.vue (Vue + userStore).
// Ce listener ne garde que ce qui n'est pas encore migré.
auth.onAuthStateChanged(async (user: any) => {
    if (user) {
        utilisateurActuel = user;
        await chargerLiguesUtilisateur();
        chargerPronosticsUtilisateur();
        chargerClassementGeneral();
    } else {
        utilisateurActuel = null;
        afficherEtatLigueDeconnecte();
        chargerClassementGeneral();
    }
});

// ==========================================
// 3. GESTION DU CALENDRIER & DU FORMULAIRE
// ==========================================
// La liste des GP et sa sélection sont désormais gérées par RaceSelector.vue.
// gererAffichageSectionSprint reste ici car pilotée par gridStore.selectedCourse.
function gererAffichageSectionSprint(): void {
    const courseId = gridStore.selectedCourse;
    const aUnSprint = estWeekendSprint(courseId);
    gridStore.setSprintVisible(aUnSprint);
}

// Recalcule le "prochain GP à venir" à partir du calendrier actuellement connu
// (statique au tout premier rendu, puis réel une fois synchroniserCalendrierDynamique terminé).
function calculerProchainGP(): string {
    const aujourdhui = new Date();
    const calendrier = getCalendrierActuel();
    const prochain = calendrier.find(gp => new Date(gp.date) >= aujourdhui && gp.statut !== 'annule');
    return prochain ? `2026/${prochain.round}` : "2026/1";
}

async function chargerPronosticsUtilisateur(): Promise<void> {
    if (!utilisateurActuel) return;
    const courseId = gridStore.selectedCourse;
    gererAffichageSectionSprint();

    const docSnap = await getDoc(doc(dbModerne, "pronostics", `${utilisateurActuel.uid}_${courseId.replace('/', '_')}`));

    // Réinitialisation de la grille Top 10 (gérée par StartingGrid.vue via gridStore)
    gridStore.setTop10(Array(10).fill(""));
    gridStore.setTop5Sprint(Array(5).fill(""));
    gridStore.setPoleman("");
    gridStore.setJoker(false);
    // Réinitialisation de la grille Sprint Top 5
    for (let i = 1; i <= 5; i++) {
        const s = document.getElementById(`select-sprint-p${i}`) as HTMLSelectElement | null;
        if (s) { s.value = ""; mettreAJourDesignSlotSprint(i, ""); }
    }

    gridStore.setEcuries({ top: ["", ""], flop: ["", ""] });

    if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.classementPilotes && data.classementPilotes.length === 10) {
            gridStore.setTop10(data.classementPilotes);
        }

        // Chargement du prono Sprint s'il existe
        if (data.classementSprint && data.classementSprint.length > 0) {
            gridStore.setTop5Sprint(data.classementSprint);
        }
        (data.classementSprint || []).forEach((nom: string, idx: number) => {
            const s = document.getElementById(`select-sprint-p${idx + 1}`) as HTMLSelectElement | null;
            if (s) { s.value = nom; mettreAJourDesignSlotSprint(idx + 1, nom); }
        });

        if (data.poleman) gridStore.setPoleman(data.poleman);
        gridStore.setJoker(!!data.joker);
        const ecuriesTop = data.ecuriesTop || [];
        const ecuriesFlop = data.ecuriesFlop || [];
        gridStore.setEcuries({ top: ecuriesTop, flop: ecuriesFlop });
        gridStore.setBonusPredictions(data.predictionsBonus);
    } else {
        gridStore.setBonusPredictions(null);
        gridStore.setJoker(false);
    }
    controlerDoublonsSprint();
}

// Bouton Grille Aléatoire Sprint Top 5
document.getElementById('btn-sprint-aleatoire')?.addEventListener('click', () => {
    const tri = [...pilotesData].sort(() => 0.5 - Math.random());
    for (let i = 1; i <= 5; i++) {
        const s = document.getElementById(`select-sprint-p${i}`) as HTMLSelectElement | null;
        if (s) { s.value = tri[i - 1].nom; mettreAJourDesignSlotSprint(i, tri[i - 1].nom); }
    }
    controlerDoublonsSprint();
});

// ==========================================
// 4. CLASSEMENT GÉNÉRAL & STATISTIQUES
// ==========================================
// L'affichage de la liste est désormais géré par FriendsRanking.vue (via statsStore).
async function chargerClassementGeneral(): Promise<void> {
    try {
        const stats = await calculerStatistiquesEtClassement(dbModerne, membresLigueActive);
        derniereStatsSaison = stats;
        statsStore.setSeasonStats(stats);
    } catch (error) {
        console.error("Erreur lors du calcul du classement général :", error);
    }
}


// ==========================================
// 5. GESTION DES LIGUES
// ==========================================
// La liste des ligues et sa sélection sont désormais gérées par RaceSelector.vue (via gridStore).
function afficherEtatLigueDeconnecte(): void {
    gridStore.setLeaguesList([{ code: CODE_LIGUE_MONDIAL, nom: "🌍 Mondial (connectez-vous pour vos ligues)" }]);
    gridStore.setActiveLeague(CODE_LIGUE_MONDIAL);
    ligueActiveActuelle = CODE_LIGUE_MONDIAL;
    membresLigueActive = null;
}

async function chargerMembresLigueActive(codeLigue: string): Promise<void> {
    if (!codeLigue || codeLigue === CODE_LIGUE_MONDIAL) {
        membresLigueActive = null;
        return;
    }
    const docSnap = await getDoc(doc(dbModerne, "ligues", codeLigue));
    membresLigueActive = docSnap.exists() ? new Set(docSnap.data()?.membres || []) : null;
}

async function chargerLiguesUtilisateur(): Promise<void> {
    if (!utilisateurActuel) return;
    const { ligues, active } = await recupererLiguesUtilisateur(dbModerne, utilisateurActuel);

    gridStore.setLeaguesList(ligues.map((ligue: any) => ({ code: ligue.code, nom: ligue.nom })));
    gridStore.setActiveLeague(active);
    ligueActiveActuelle = active;
    await chargerMembresLigueActive(active);
}

// Réagit aux changements de ligue active déclenchés par RaceSelector.vue
watch(() => gridStore.activeLeague, async (nouveauCode, ancienCode) => {
    if (!nouveauCode || nouveauCode === ancienCode) return;
    ligueActiveActuelle = nouveauCode;
    await chargerMembresLigueActive(nouveauCode);
    if (utilisateurActuel) {
        await setDoc(doc(dbModerne, "utilisateurs", utilisateurActuel.uid), { ligueActive: nouveauCode }, { merge: true });
    }
    chargerClassementGeneral();
});

// ==========================================
// 6. ESPACE PROFIL & HISTORIQUE
// ==========================================
// Entièrement géré désormais par WorkspaceProfile.vue et ProfileHistory.vue.

// ==========================================
// 7. VERROUILLAGE (piloté par RaceSelector.vue via gridStore.isLocked)
// ==========================================
// RaceSelector.vue calcule lui-même le verrouillage (date du GP) et met à jour
// gridStore.isLocked. Les composants Vue réagissent automatiquement.

// ==========================================
// 8. INITIALISATION AU DÉMARRAGE
// ==========================================
afficherEtatLigueDeconnecte();
creerLaGrilleSprintTV();
gererAffichageSectionSprint();

// Détecte si l'utilisateur change lui-même de GP, pour ne plus jamais
// écraser son choix après une synchro (voir plus bas).
let premierChangementIgnore = false;
watch(() => gridStore.selectedCourse, () => {
    if (!premierChangementIgnore) {
        // Le tout premier "changement" correspond à l'initialisation du store, pas un vrai choix utilisateur.
        premierChangementIgnore = true;
    } else {
        selectionCourseModifieeParUtilisateur = true;
    }
    gererAffichageSectionSprint();
    chargerPronosticsUtilisateur();
    chargerClassementGeneral();
});

// Synchronisation asynchrone du calendrier (Firestore / API F1)
synchroniserCalendrierDynamique(dbModerne)
    .then(() => {
        // Une fois le vrai calendrier connu, on recalcule le "prochain GP" par défaut,
        // sauf si l'utilisateur a déjà changé la sélection lui-même entre-temps.
        if (!selectionCourseModifieeParUtilisateur) {
            const prochainGpReel = calculerProchainGP();
            if (prochainGpReel !== gridStore.selectedCourse) {
                gridStore.setSelectedCourse(prochainGpReel);
            }
        }
    })
    .catch(err => console.warn("Sync calendrier:", err));