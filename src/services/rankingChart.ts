import { type StatistiquesSaison, type JoueurClassement } from "../utils";
import { recupererGpParRound } from "./calendarService";

declare const Chart: any;

let instanceGraphiqueClassement: any = null;
let modeGraphiqueActuel: 'points' | 'rang' = 'points';

const PALETTE_GRAPHIQUE = ['#00d2d3', '#4cd137', '#3b82f6', '#a855f7', '#f1c40f', '#e84118'];

export function getModeGraphiqueActuel(): 'points' | 'rang' {
    return modeGraphiqueActuel;
}

export function setModeGraphiqueActuel(mode: 'points' | 'rang'): void {
    modeGraphiqueActuel = mode;
}

// Construit et affiche (ou masque) le graphique d'évolution du classement dans le temps.
export function afficherGraphiqueEvolution(joueurs?: JoueurClassement[] | null, donnees?: StatistiquesSaison | null, utilisateurActuel?: any): void {
    const bloc = document.getElementById('bloc-graphique-evolution');
    const canvas = document.getElementById('graphique-classement') as HTMLCanvasElement | null;
    if (!bloc || !canvas) return;

    if (typeof Chart === 'undefined') {
        console.warn("Chart.js n'est pas chargé — impossible d'afficher le graphique d'évolution.");
        bloc.style.display = 'none';
        return;
    }

    if (!joueurs || joueurs.length === 0 || !donnees || !donnees.roundsCalcules || donnees.roundsCalcules.length === 0) {
        bloc.style.display = 'none';
        if (instanceGraphiqueClassement) {
            instanceGraphiqueClassement.destroy();
            instanceGraphiqueClassement = null;
        }
        return;
    }

    bloc.style.display = 'block';

    const { historiqueParJoueur, roundsCalcules } = donnees;

    // 1. Calculer les points cumulés et les positions à chaque round pour TOUS les joueurs
    const pointsCumulesParJoueur: Record<string, Record<number, number>> = {};
    const rangParJoueur: Record<number, Record<string, number>> = {};

    roundsCalcules.forEach((r, roundIdx) => {
        const scoresAtRound: { uid: string; points: number }[] = [];
        joueurs.forEach(j => {
            let cumul = 0;
            for (let i = 0; i <= roundIdx; i++) {
                const rd = roundsCalcules[i];
                cumul += (historiqueParJoueur[j.uid]?.[rd] || 0);
            }
            if (!pointsCumulesParJoueur[j.uid]) pointsCumulesParJoueur[j.uid] = {};
            pointsCumulesParJoueur[j.uid][r] = cumul;
            scoresAtRound.push({ uid: j.uid, points: cumul });
        });

        scoresAtRound.sort((a, b) => b.points - a.points);
        scoresAtRound.forEach((item, index) => {
            if (!rangParJoueur[r]) rangParJoueur[r] = {};
            rangParJoueur[r][item.uid] = index + 1;
        });
    });

    // 2. Sélectionner le joueur connecté et les rivaux proches
    const currentUid = utilisateurActuel ? utilisateurActuel.uid : null;
    let userIdx = currentUid ? joueurs.findIndex(j => j.uid === currentUid) : 0;
    if (userIdx === -1) userIdx = 0;

    let startIndex = Math.max(0, userIdx - 2);
    let endIndex = startIndex + 5;
    if (endIndex > joueurs.length) {
        endIndex = joueurs.length;
        startIndex = Math.max(0, endIndex - 5);
    }

    const joueursCibles = joueurs.slice(startIndex, endIndex);

    const labels = roundsCalcules.map(r => {
        const gp = recupererGpParRound(r);
        return gp ? (gp.circuit || gp.nom) : `R${r}`;
    });

    // 3. Préparer les datasets Chart.js
    let paletteIdx = 0;
    const datasets = joueursCibles.map(j => {
        const isUser = (currentUid && j.uid === currentUid);
        const positionActuelle = joueurs.findIndex(item => item.uid === j.uid) + 1;

        let couleur: string;
        if (isUser) {
            couleur = '#ff8000';
        } else {
            couleur = PALETTE_GRAPHIQUE[paletteIdx % PALETTE_GRAPHIQUE.length];
            paletteIdx++;
        }

        const dataPoints = roundsCalcules.map(r => {
            if (modeGraphiqueActuel === 'rang') {
                return rangParJoueur[r]?.[j.uid] || positionActuelle;
            } else {
                return pointsCumulesParJoueur[j.uid]?.[r] || 0;
            }
        });

        const labelTexte = isUser 
            ? `⭐ ${j.pseudo} (Toi - #${positionActuelle})` 
            : `${j.pseudo} (#${positionActuelle})`;

        return {
            label: labelTexte,
            data: dataPoints,
            borderColor: couleur,
            backgroundColor: couleur + '22',
            tension: 0.25,
            fill: false,
            borderWidth: isUser ? 3.5 : 2,
            pointRadius: isUser ? 5 : 3,
            pointHoverRadius: isUser ? 8 : 6,
            pointBackgroundColor: couleur,
            uidJoueur: j.uid,
            pseudoJoueur: j.pseudo
        };
    });

    if (instanceGraphiqueClassement) {
        instanceGraphiqueClassement.destroy();
    }

    const isModeRang = (modeGraphiqueActuel === 'rang');

    instanceGraphiqueClassement = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#e2e8f0',
                        font: { size: 11, weight: 'bold' },
                        boxWidth: 12,
                        padding: 12
                    }
                },
                tooltip: {
                    backgroundColor: '#1f293d',
                    borderColor: '#2f3e56',
                    borderWidth: 1,
                    titleColor: '#ff8000',
                    bodyColor: '#e2e8f0',
                    padding: 10,
                    callbacks: {
                        label: function(context: any) {
                            const uid = context.dataset.uidJoueur;
                            const pseudo = context.dataset.pseudoJoueur;
                            const round = roundsCalcules[context.dataIndex];
                            const pts = pointsCumulesParJoueur[uid]?.[round] || 0;
                            const rank = rangParJoueur[round]?.[uid] || '?';
                            
                            if (isModeRang) {
                                return ` ${pseudo} : Position #${context.parsed.y} (${pts} pts)`;
                            } else {
                                return ` ${pseudo} : ${pts} pts (Rang #${rank})`;
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#a5b1c2', font: { size: 10 } },
                    grid: { color: '#242f46' }
                },
                y: {
                    reverse: isModeRang,
                    beginAtZero: !isModeRang,
                    suggestedMin: isModeRang ? 1 : 0,
                    suggestedMax: isModeRang ? Math.max(5, joueurs.length) : undefined,
                    ticks: {
                        color: '#a5b1c2',
                        font: { size: 10 },
                        stepSize: isModeRang ? 1 : undefined,
                        callback: function(value: any) {
                            return isModeRang ? '#' + value : value;
                        }
                    },
                    grid: { color: '#242f46' },
                    title: {
                        display: true,
                        text: isModeRang ? 'Position au classement (#1 en haut)' : 'Points Cumulés',
                        color: '#a5b1c2',
                        font: { size: 11, weight: 'bold' }
                    }
                }
            }
        }
    });
}

// Initialise les écouteurs de bascule mode points / rang
export function initialiserEcouteursGraphique(onModeChange?: () => void): void {
    document.getElementById('btn-graph-mode-points')?.addEventListener('click', () => {
        modeGraphiqueActuel = 'points';
        const btnPts = document.getElementById('btn-graph-mode-points');
        const btnRang = document.getElementById('btn-graph-mode-rang');
        if (btnPts) { btnPts.style.background = '#ff8000'; btnPts.style.color = '#fff'; }
        if (btnRang) { btnRang.style.background = 'transparent'; btnRang.style.color = '#a5b1c2'; }
        if (onModeChange) onModeChange();
    });

    document.getElementById('btn-graph-mode-rang')?.addEventListener('click', () => {
        modeGraphiqueActuel = 'rang';
        const btnPts = document.getElementById('btn-graph-mode-points');
        const btnRang = document.getElementById('btn-graph-mode-rang');
        if (btnPts) { btnPts.style.background = 'transparent'; btnPts.style.color = '#a5b1c2'; }
        if (btnRang) { btnRang.style.background = '#00d2d3'; btnRang.style.color = '#000'; }
        if (onModeChange) onModeChange();
    });
}
