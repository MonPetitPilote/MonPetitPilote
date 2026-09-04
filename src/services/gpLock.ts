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

