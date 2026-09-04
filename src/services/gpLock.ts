import { getCalendrierActuel, getDateLimiteProno } from "./calendarService";

// Un Grand Prix est considéré "clôturé" dès que la séance de qualifications a débuté ou si le statut est annulé
export function courseEstVerrouillee(courseIdString?: string | null): boolean {
    const round = parseInt((courseIdString || "").split('/')[1], 10);
    const calendrier = getCalendrierActuel();
    const gp = calendrier.find(g => g.round === round);
    if (!gp) return false;
    if (gp.statut === 'annule') return true;
    return getDateLimiteProno(gp) <= new Date();
}

export function appliquerVerrouillage(verrouille: boolean, selectPole?: HTMLSelectElement | null): void {
    const banniere = document.getElementById('banniere-verrouillage');
    if (banniere) banniere.style.display = verrouille ? 'flex' : 'none';

    // Verrouillage Top 10
    for (let i = 1; i <= 10; i++) {
        const s = document.getElementById(`select-grid-p${i}`) as HTMLSelectElement | null;
        if (s) s.disabled = verrouille;
    }

    // Verrouillage Sprint Top 5
    for (let i = 1; i <= 5; i++) {
        const s = document.getElementById(`select-sprint-p${i}`) as HTMLSelectElement | null;
        if (s) s.disabled = verrouille;
    }
    const btnSprintAleatoire = document.getElementById('btn-sprint-aleatoire') as HTMLButtonElement | null;
    if (btnSprintAleatoire) btnSprintAleatoire.disabled = verrouille;

    if (selectPole) selectPole.disabled = verrouille;

    ["ecurie-top-1", "ecurie-top-2", "ecurie-flop-1", "ecurie-flop-2"].forEach(id => {
        const conteneur = document.getElementById(id);
        if (!conteneur) return;
        conteneur.style.pointerEvents = verrouille ? 'none' : 'auto';
        conteneur.style.opacity = verrouille ? '0.5' : '1';
    });

    const checkJoker = document.getElementById('check-joker') as HTMLInputElement | null;
    if (checkJoker) checkJoker.disabled = verrouille;
    const btnAleatoire = document.getElementById('btn-aleatoire') as HTMLButtonElement | null;
    if (btnAleatoire) btnAleatoire.disabled = verrouille;

    const inputDNF = document.getElementById('input-nombre-dnf') as HTMLInputElement | null;
    if (inputDNF) inputDNF.disabled = verrouille;
    const sectionBonus = document.querySelector<HTMLElement>('.section-predictions-bonus');
    if (sectionBonus) {
        sectionBonus.style.pointerEvents = verrouille ? 'none' : 'auto';
        sectionBonus.style.opacity = verrouille ? '0.5' : '1';
    }

    const btnValider = document.getElementById('btn-valider') as HTMLButtonElement | null;
    if (btnValider) {
        btnValider.disabled = verrouille;
        btnValider.style.opacity = verrouille ? '0.5' : '1';
        btnValider.style.cursor = verrouille ? 'not-allowed' : 'pointer';
    }
}

// Affiche "il reste Xj Xh" avant la clôture des pronos du GP sélectionné
export function mettreAJourCountdown(selectCourse?: HTMLSelectElement | null): void {
    const zone = document.getElementById('countdown-pronos');
    if (!zone || !selectCourse) return;

    const round = parseInt((selectCourse.value || "").split('/')[1], 10);
    const calendrier = getCalendrierActuel();
    const gp = calendrier.find(g => g.round === round);
    if (!gp) { zone.style.display = 'none'; return; }

    const echeance = getDateLimiteProno(gp).getTime();
    const maintenant = new Date().getTime();
    const diffMs = echeance - maintenant;

    if (diffMs <= 0) {
        zone.style.display = 'none';
        return;
    }

    const jours = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const heures = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);

    let texteRestant: string;
    if (jours > 0) {
        texteRestant = `${jours}j ${heures}h`;
    } else if (heures > 0) {
        texteRestant = `${heures}h ${minutes}min`;
    } else {
        texteRestant = `${minutes}min`;
    }

    const urgent = diffMs < 1000 * 60 * 60 * 24;
    zone.classList.toggle('urgent', urgent);
    zone.style.display = 'flex';
    zone.innerHTML = `⏳ Il reste <span style="margin: 0 4px;">${texteRestant}</span> pour valider ce pronostic (avant les qualifications)`;
}

export function verifierVerrouillageCourse(selectCourse?: HTMLSelectElement | null, selectPole?: HTMLSelectElement | null): boolean {
    if (!selectCourse) return false;
    const verrouille = courseEstVerrouillee(selectCourse.value);
    appliquerVerrouillage(verrouille, selectPole);
    mettreAJourCountdown(selectCourse);
    return verrouille;
}
