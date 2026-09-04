import {
    type StatistiquesSaison
} from "./utils";

import {
    CODE_LIGUE_MONDIAL,
    recupererLiguesUtilisateur,
    calculerStatistiquesEtClassement,
    estWeekendSprint,
    synchroniserCalendrierDynamique,
    getCalendrierActuel
} from "./services";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { getFirestore, getAuth } from "./utils/firebase";
import { useStatsStore, useGridStore } from "./stores";
import { watch } from "vue";

// ==========================================
// 1. CONFIGURATION ET INITIALISATION FIREBASE
// ==========================================
const db = getFirestore();
const auth = getAuth();
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
onAuthStateChanged(auth, async (user: any) => {
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

    const docSnap = await getDoc(doc(db, "pronostics", `${utilisateurActuel.uid}_${courseId.replace('/', '_')}`));

    // Réinitialisation de la grille Top 10 et Sprint (gérée réactivement via gridStore)
    gridStore.setTop10(Array(10).fill(""));
    gridStore.setTop5Sprint(Array(5).fill(""));
    gridStore.setPoleman("");
    gridStore.setJoker(false);
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
}

// ==========================================
// 4. CLASSEMENT GÉNÉRAL & STATISTIQUES
// ==========================================
// L'affichage de la liste est désormais géré par FriendsRanking.vue (via statsStore).
async function chargerClassementGeneral(): Promise<void> {
    try {
        const stats = await calculerStatistiquesEtClassement(db, membresLigueActive);
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
    const docSnap = await getDoc(doc(db, "ligues", codeLigue));
    membresLigueActive = docSnap.exists() ? new Set(docSnap.data()?.membres || []) : null;
}

async function chargerLiguesUtilisateur(): Promise<void> {
    if (!utilisateurActuel) return;
    const { ligues, active } = await recupererLiguesUtilisateur(db, utilisateurActuel);

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
        await setDoc(doc(db, "utilisateurs", utilisateurActuel.uid), { ligueActive: nouveauCode }, { merge: true });
    }
    chargerClassementGeneral();
});

// ==========================================
// 6. INITIALISATION AU DÉMARRAGE
// ==========================================
afficherEtatLigueDeconnecte();
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
synchroniserCalendrierDynamique(db)
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
