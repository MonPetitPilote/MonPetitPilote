import {
    pilotesData,
    calendrier2026,
    afficherNotification,
    type StatistiquesSaison,
    type GrandPrix
} from "./utils";

import {
    CODE_LIGUE_MONDIAL,
    rejoindreLigueParCode,
    creerNouvelleLigue,
    recupererLiguesUtilisateur,
    initialiserBoutonsBonus,
    lireFormulaireBonus,
    appliquerFormulaireBonus,
    calculerStatistiquesEtClassement,
    courseEstVerrouillee,
    verifierVerrouillageCourse,
    mettreAJourDesignSlotSprint,
    controlerDoublonsSprint,
    creerLaGrilleSprintTV,
    appliquerSelectionEcurieVisuelle,
    initialiserEcuriesTopFlop,
    getCalendrierActuel,
    onCalendrierChange,
    estWeekendSprint,
    synchroniserCalendrierDynamique
} from "./services";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirestore as getFirestoreModerne } from "./utils/firebase";
import { useStatsStore, useGridStore } from "./stores";

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

const selectCourse = document.getElementById('select-course') as HTMLSelectElement | null;
const selectPole = document.getElementById('select-pole') as HTMLSelectElement | null;
const selectLigue = document.getElementById('select-ligue') as HTMLSelectElement | null;

// ==========================================
// 2. GESTION AUTHENTIFICATION & PROFIL
// ==========================================
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
function initialiserSelectCourse(): void {
    if (!selectCourse) return;
    const valeurSelectionneePrecedente = selectCourse.value;
    selectCourse.innerHTML = "";
    const aujourdhui = new Date();
    let prochainRoundValue = "2026/1";
    let roundTrouve = false;

    const calendrier = getCalendrierActuel();

    calendrier.forEach(gp => {
        const opt = document.createElement('option');
        opt.value = `2026/${gp.round}`;
        const dateObj = new Date(gp.date);
        const dateFormatee = dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
        const tagSprint = gp.hasSprint ? ' ⚡ [SPRINT]' : '';
        const tagStatut = gp.statut === 'annule' ? ' ⚠️ [ANNULÉ]' : (gp.statut === 'remplace' ? ' 🔄 [REMPLACÉ]' : '');
        opt.innerText = `Round ${gp.round} : ${gp.nom} - ${gp.circuit} (${gp.pays})${tagSprint}${tagStatut} — 📅 ${dateFormatee}`;
        selectCourse.appendChild(opt);

        if (!roundTrouve && dateObj >= aujourdhui && gp.statut !== 'annule') {
            prochainRoundValue = `2026/${gp.round}`;
            roundTrouve = true;
        }
    });

    if (valeurSelectionneePrecedente && Array.from(selectCourse.options).some(o => o.value === valeurSelectionneePrecedente)) {
        selectCourse.value = valeurSelectionneePrecedente;
    } else {
        selectCourse.value = prochainRoundValue;
    }

    gererAffichageSectionSprint();
}

function gererAffichageSectionSprint(): void {
    const courseId = selectCourse?.value || "2026/1";
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
    if (!utilisateurActuel || !selectCourse) return;
    const courseId = selectCourse.value;
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

    ["ecurie-top-1", "ecurie-top-2", "ecurie-flop-1", "ecurie-flop-2"].forEach(id => {
        appliquerSelectionEcurieVisuelle(id, "");
    });

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
        appliquerSelectionEcurieVisuelle("ecurie-top-1", ecuriesTop[0] || "");
        appliquerSelectionEcurieVisuelle("ecurie-top-2", ecuriesTop[1] || "");
        appliquerSelectionEcurieVisuelle("ecurie-flop-1", ecuriesFlop[0] || "");
        appliquerSelectionEcurieVisuelle("ecurie-flop-2", ecuriesFlop[1] || "");
        appliquerFormulaireBonus(data.predictionsBonus);
    } else {
        appliquerFormulaireBonus(null);
    }
    controlerDoublonsSprint();
}

// Validation du pronostic
document.getElementById('btn-valider')?.addEventListener('click', async () => {
    if (!utilisateurActuel) return afficherNotification("Tu dois être connecté !", "erreur");
    if (!selectCourse) return;
    const courseId = selectCourse.value;

    if (courseEstVerrouillee(courseId)) {
        return afficherNotification("🔒 Ce Grand Prix est déjà passé, les pronostics sont clôturés.", "erreur");
    }

    const top10Selection = gridStore.top10;
    for (let i = 0; i < 10; i++) {
        if (!top10Selection[i]) return afficherNotification(`Il manque la position P${i + 1} du GP !`, "erreur");
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
        ecuriesTop: [
            document.getElementById('ecurie-top-1')?.getAttribute('data-ecurie-value') || "",
            document.getElementById('ecurie-top-2')?.getAttribute('data-ecurie-value') || ""
        ],
        ecuriesFlop: [
            document.getElementById('ecurie-flop-1')?.getAttribute('data-ecurie-value') || "",
            document.getElementById('ecurie-flop-2')?.getAttribute('data-ecurie-value') || ""
        ],
        predictionsBonus: lireFormulaireBonus(),
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
function afficherEtatLigueDeconnecte(): void {
    if (!selectLigue) return;
    selectLigue.innerHTML = `<option value="${CODE_LIGUE_MONDIAL}">🌍 Mondial (connectez-vous pour vos ligues)</option>`;
    selectLigue.value = CODE_LIGUE_MONDIAL;
    ligueActiveActuelle = CODE_LIGUE_MONDIAL;
    membresLigueActive = null;
}

async function chargerMembresLigueActive(codeLigue: string): Promise<void> {
    if (!codeLigue || codeLigue === CODE_LIGUE_MONDIAL) {
        membresLigueActive = null;
        return;
    }
    const doc = await db.collection("ligues").doc(codeLigue).get();
    membresLigueActive = doc.exists ? new Set(doc.data().membres || []) : null;
}

async function chargerLiguesUtilisateur(): Promise<void> {
    if (!utilisateurActuel) return;
    const { ligues, active } = await recupererLiguesUtilisateur(dbModerne, utilisateurActuel);

    if (selectLigue) {
        selectLigue.innerHTML = "";
        ligues.forEach(ligue => {
            const opt = document.createElement('option');
            opt.value = ligue.code;
            opt.innerText = ligue.code === CODE_LIGUE_MONDIAL ? ligue.nom : `🏆 ${ligue.nom} (${ligue.code})`;
            selectLigue.appendChild(opt);
        });
        selectLigue.value = active;
    }
    ligueActiveActuelle = active;
    await chargerMembresLigueActive(active);
}

selectLigue?.addEventListener('change', async (e: Event) => {
    const target = e.target as HTMLSelectElement;
    const nouveauCode = target.value;
    ligueActiveActuelle = nouveauCode;
    await chargerMembresLigueActive(nouveauCode);
    if (utilisateurActuel) {
        await db.collection("utilisateurs").doc(utilisateurActuel.uid).set({ ligueActive: nouveauCode }, { merge: true });
    }
    chargerClassementGeneral();
});



// ==========================================
// 6. ESPACE PROFIL & HISTORIQUE
// ==========================================
// Entièrement géré désormais par WorkspaceProfile.vue et ProfileHistory.vue.

// ==========================================
// 7. INITIALISATION AU DÉMARRAGE
// ==========================================
initialiserBoutonsBonus();
afficherEtatLigueDeconnecte();
initialiserSelectCourse();
initialiserPolePosition();
creerLaGrilleSprintTV();
initialiserEcuriesTopFlop();
verifierVerrouillageCourse(selectCourse, selectPole);
setInterval(() => verifierVerrouillageCourse(selectCourse, selectPole), 60 * 1000);

// Écoute des mises à jour dynamiques du calendrier
onCalendrierChange(() => {
    initialiserSelectCourse();
    verifierVerrouillageCourse(selectCourse, selectPole);
});

// Synchronisation asynchrone du calendrier (Firestore / API OpenF1)
synchroniserCalendrierDynamique(dbModerne).catch(err => console.warn("Sync calendrier:", err));

if (selectCourse) {
    selectCourse.addEventListener('change', () => {
        gererAffichageSectionSprint();
        chargerPronosticsUtilisateur();
        chargerClassementGeneral();
        verifierVerrouillageCourse(selectCourse, selectPole);
    });
}