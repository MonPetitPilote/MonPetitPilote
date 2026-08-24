import { LABELS_BONUS, type BonusPredictionsData, type BonusReelData, type DetailBonusItem } from "../utils";

// Applique (ou retire) le style visuel "actif" à un bouton OUI/NON.
export function definirStyleBoutonBonus(bouton: HTMLElement, actif: boolean): void {
    const estOui = bouton.getAttribute('data-valeur') === 'true';
    if (actif) {
        bouton.style.background = estOui ? 'rgba(76, 209, 55, 0.15)' : 'rgba(239, 68, 68, 0.15)';
        bouton.style.borderColor = estOui ? '#4cd137' : '#ef4444';
        bouton.style.color = estOui ? '#4cd137' : '#ef4444';
        bouton.setAttribute('data-actif', 'true');
    } else {
        bouton.style.background = '#0f131c';
        bouton.style.borderColor = '#2d3954';
        bouton.style.color = '#a5b1c2';
        bouton.setAttribute('data-actif', 'false');
    }
}

// Initialise la gestion des boutons OUI/NON via délégation d'événements
export function initialiserBoutonsBonus(): void {
    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement | null;
        if (!target) return;
        const bouton = target.closest<HTMLElement>('.btn-toggle-bonus');
        if (!bouton) return;
        const sectionBonus = bouton.closest<HTMLElement>('.section-predictions-bonus');
        if (sectionBonus?.style.pointerEvents === 'none') return;

        const groupe = bouton.closest<HTMLElement>('.toggle-oui-non');
        if (!groupe) return;

        groupe.querySelectorAll<HTMLElement>('.btn-toggle-bonus').forEach(b => definirStyleBoutonBonus(b, false));
        definirStyleBoutonBonus(bouton, true);
    });
}

// Lit l'état actuel des 4 prédictions bonus depuis le formulaire
export function lireFormulaireBonus(): BonusPredictionsData {
    const lireToggle = (cle: string): boolean | null => {
        const groupe = document.querySelector(`.toggle-oui-non[data-bonus="${cle}"]`);
        const actif = groupe?.querySelector('.btn-toggle-bonus[data-actif="true"]');
        return actif ? actif.getAttribute('data-valeur') === 'true' : null;
    };

    const inputDNF = document.getElementById('input-nombre-dnf') as HTMLInputElement | null;
    const nombreDNF = inputDNF && inputDNF.value !== '' ? parseInt(inputDNF.value, 10) : null;

    return {
        safetyCar: lireToggle('safetyCar'),
        drapeauRouge: lireToggle('drapeauRouge'),
        nombreDNF: nombreDNF,
        polemanPodium: lireToggle('polemanPodium')
    };
}

// Réinitialise / pré-remplit le formulaire bonus à partir de données sauvegardées
export function appliquerFormulaireBonus(predictionsBonus?: Partial<BonusPredictionsData> | null): void {
    const donnees = predictionsBonus || {};

    (['safetyCar', 'drapeauRouge', 'polemanPodium'] as const).forEach(cle => {
        const groupe = document.querySelector(`.toggle-oui-non[data-bonus="${cle}"]`);
        if (!groupe) return;
        groupe.querySelectorAll<HTMLElement>('.btn-toggle-bonus').forEach(b => definirStyleBoutonBonus(b, false));
        if (donnees[cle] === true || donnees[cle] === false) {
            const bouton = groupe.querySelector<HTMLElement>(`.btn-toggle-bonus[data-valeur="${donnees[cle]}"]`);
            if (bouton) definirStyleBoutonBonus(bouton, true);
        }
    });

    const inputDNF = document.getElementById('input-nombre-dnf') as HTMLInputElement | null;
    if (inputDNF) inputDNF.value = (donnees.nombreDNF !== undefined && donnees.nombreDNF !== null) ? String(donnees.nombreDNF) : '';
}

// Construit le petit bloc HTML de comparatif "bonus" utilisé dans construireComparatifHtml()
export function construireComparatifBonusHtml(
    predictionsJoueur?: Partial<BonusPredictionsData> | null,
    bonusReel?: BonusReelData | null,
    dejaCalcule: boolean = false,
    bilanBonusDetail?: DetailBonusItem[] | null
): string {
    const donnees: Record<string, any> = predictionsJoueur || {};
    const reel: Record<string, any> = bonusReel || {};

    const rendreLigne = (cle: string): string => {
        const info = LABELS_BONUS[cle] || { icone: "🎲", nom: cle };
        const valeurJoueur = donnees[cle];
        const aRepondu = valeurJoueur !== undefined && valeurJoueur !== null && valeurJoueur !== "";

        const formatValeur = (v: any): string => {
            if (v === null || v === undefined || v === "") return '—';
            if (typeof v === 'boolean') return v ? 'Oui' : 'Non';
            if (cle === 'nombreDNF') return `${v} abandon(s)`;
            return String(v);
        };

        if (!aRepondu) {
            return `<div class="ligne-comparatif-bonus" style="display:flex; justify-content:space-between; padding:4px 0;">
                <span>${info.icone} ${info.nom} :</span>
                <span style="color:#616e88;">Non répondu</span>
            </div>`;
        }

        if (!dejaCalcule && Object.keys(reel).length === 0) {
            return `<div class="ligne-comparatif-bonus" style="display:flex; justify-content:space-between; padding:4px 0;">
                <span>${info.icone} ${info.nom} :</span>
                <span><strong>${formatValeur(valeurJoueur)}</strong></span>
            </div>`;
        }

        const detail = (bilanBonusDetail || []).find(d => d.cle === cle);
        let correct = false;
        let points = 0;

        if (detail) {
            correct = detail.correct;
            points = detail.points || (correct ? 2 : 0);
        } else if (reel[cle] !== undefined && reel[cle] !== null) {
            if (cle === 'nombreDNF') {
                correct = Number(valeurJoueur) === Number(reel[cle]);
            } else {
                correct = Boolean(valeurJoueur) === Boolean(reel[cle]);
            }
            points = correct ? 2 : 0;
        }

        const colorPoints = points > 0 ? `#4cd137` : `#ef4444`;
        const iconeResultat = correct ? '✅' : '❌';

        return `<div class="ligne-comparatif-bonus" style="display:flex; justify-content:space-between; align-items:center; padding:4px 0;">
            <span>${iconeResultat} ${info.icone} ${info.nom} : <strong>${formatValeur(valeurJoueur)}</strong></span>
            <span style="color:#616e88; font-size:0.85rem;">
                Réel : <strong style="color:#e2e8f0;">${formatValeur(reel[cle])}</strong>
                &nbsp;<span style="color:${colorPoints}; font-weight:bold;">(+${points} pts)</span>
            </span>
        </div>`;
    };

    return Object.keys(LABELS_BONUS).map(rendreLigne).join('');
}
