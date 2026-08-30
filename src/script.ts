import {
    pilotesData,
    calendrier2026,
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
    synchroniserCalendrierDynamique
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

// #select-course et #select-ligue sont désormais gérés par RaceSelector.vue (via gridStore).
// #select-pole reste en DOM natif pour l'instant.
const selectPole = document.getElementById('select-pole') as HTMLSelectElement | null;

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

function initialiserPolePosition(): void {
    if (!selectPole) return;
    selectPole.innerHTML = '<option value="">-- Sélectionne ton poleman --</option>';
    pilotesData.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.nom;
        opt.innerText = p.nom;
        selectPole.appendChild(opt);
    });
}

async function chargerPronosticsUtilisateur(): Promise<void> {
    if (!utilisateurActuel) return;
    const courseId = gridStore.selectedCourse;
    gererAffichageSectionSprint();

    const docSnap = await getDoc(doc(dbModerne, "pronostics", `${utilisateurActuel.uid}_${courseId.replace('/', '_')}`));

    // Réinitialisation de la grille Top 10 (gérée par StartingGrid.vue via gridStore)
    gridStore.setTop10(Array(10).fill(""));
    if (selectPole) selectPole.value = "";

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
        (data.classementSprint || []).forEach((nom: string, idx: number) => {
            const s = document.getElementById(`select-sprint-p${idx + 1}`) as HTMLSelectElement | null;
            if (s) { s.value = nom; mettreAJourDesignSlotSprint(idx + 1, nom); }
        });

        if (selectPole && data.poleman) selectPole.value = data.poleman;

        const ecuriesTop = data.ecuriesTop || [];
        const ecuriesFlop = data.ecuriesFlop || [];
        gridStore.setEcuries({ top: ecuriesTop, flop: ecuriesFlop });
        gridStore.setBonusPredictions(data.predictionsBonus);
    } else {
        gridStore.setBonusPredictions(null);
    }
    controlerDoublonsSprint();
}

// Validation du pronostic
document.getElementById('btn-valider')?.addEventListener('click', async () => {
    if (!utilisateurActuel) return afficherNotification("Tu dois être connecté !", "erreur");
    const courseId = gridStore.selectedCourse;

    if (courseEstVerrouillee(courseId)) {
        return afficherNotification("🔒 Ce Grand Prix est déjà passé, les pronostics sont clôturés.", "erreur");
    }

    const top10Selection = gridStore.top10;
    for (let i = 0; i < 10; i++) {
        if (!top10Selection[i]) return afficherNotification(`Il manque la position P${i + 1} du GP !`, "erreur");
    }

    if (gridStore.premiereEcurieManquante) {
        return afficherNotification(`Il manque le choix "${gridStore.premiereEcurieManquante}" !`, "erreur");
    }

    // Récupération de la sélection Sprint si applicable
    const top5SprintSelection: string[] = [];
    const aUnSprint = estWeekendSprint(courseId);
    if (aUnSprint) {
        for (let i = 1; i <= 5; i++) {
            const val = (document.getElementById(`select-sprint-p${i}`) as HTMLSelectElement | null)?.value;
            if (!val) return afficherNotification(`Il manque la position S${i} de la Course Sprint !`, "erreur");
            top5SprintSelection.push(val);
        }
    }

    const pronoData: Record<string, any> = {
        uidJoueur: utilisateurActuel.uid,
        pseudo: utilisateurActuel.displayName || utilisateurActuel.email,
        course: courseId,
        classementPilotes: top10Selection,
        classementSprint: aUnSprint ? top5SprintSelection : [],
        poleman: selectPole?.value || "",
        ecuriesTop: [gridStore.ecuries["ecurie-top-1"], gridStore.ecuries["ecurie-top-2"]],
        ecuriesFlop: [gridStore.ecuries["ecurie-flop-1"], gridStore.ecuries["ecurie-flop-2"]],
        predictionsBonus: { ...gridStore.bonusPredictions },
        dateEnregistrement: new Date()
    };

    await setDoc(doc(dbModerne, "pronostics", `${utilisateurActuel.uid}_${courseId.replace('/', '_')}`), pronoData, { merge: true });
    afficherNotification(aUnSprint ? "🏁 Grille GP, Course Sprint et Écuries enregistrées avec succès !" : "🏁 Grille et Écuries enregistrées avec succès !", "succes");
    chargerClassementGeneral();
});

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

// Modal Voir le prono d'un ami
document.getElementById('btn-fermer-prono-ami')?.addEventListener('click', () => {
    const modale = document.getElementById('modale-prono-ami');
    if (modale) modale.style.display = 'none';
});
window.addEventListener('click', (e) => {
    const modale = document.getElementById('modale-prono-ami');
    if (e.target === modale) modale.style.display = 'none';
});

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
// RaceSelector.vue calcule lui-même le verrouillage (date du GP) et émet
// 'lock-change' -> gridStore.setLocked(). Ici on applique juste l'état
// aux éléments encore en DOM natif (select-pole, btn-valider).
watch(() => gridStore.isLocked, (verrouille) => {
    if (selectPole) selectPole.disabled = verrouille;
    const btnValider = document.getElementById('btn-valider') as HTMLButtonElement | null;
    if (btnValider) {
        btnValider.disabled = verrouille;
        btnValider.style.opacity = verrouille ? '0.5' : '1';
        btnValider.style.cursor = verrouille ? 'not-allowed' : 'pointer';
    }
}, { immediate: true });

// ==========================================
// 8. INITIALISATION AU DÉMARRAGE
// ==========================================
afficherEtatLigueDeconnecte();
initialiserPolePosition();
creerLaGrilleSprintTV();
gererAffichageSectionSprint();

// Synchronisation asynchrone du calendrier (Firestore / API OpenF1)
synchroniserCalendrierDynamique(dbModerne).catch(err => console.warn("Sync calendrier:", err));

// Réagit aux changements de Grand Prix sélectionné (déclenchés par RaceSelector.vue)
watch(() => gridStore.selectedCourse, () => {
    gererAffichageSectionSprint();
    chargerPronosticsUtilisateur();
    chargerClassementGeneral();
});