<template>
  <div
    id="bloc-graphique-evolution"
    class="bloc-graphique"
    :style="{ display: hasData ? 'block' : 'none' }"
  >
    <div class="graphique-header">
      <div>
        <h3 class="graphique-titre">
          📈 ÉVOLUTION DU CLASSEMENT AU FIL DE LA SAISON
        </h3>
        <p id="graphique-sous-titre" class="graphique-sous-titre">
          Comparatif de vos performances avec vos rivaux directs au classement.
        </p>
      </div>

      <div class="graphique-toggle-container">
        <button
          id="btn-graph-mode-points"
          type="button"
          class="btn-graph-mode"
          :class="{ active: modeActuel === 'points' }"
          @click="setMode('points')"
        >
          📊 Points Cumulés
        </button>
        <button
          id="btn-graph-mode-rang"
          type="button"
          class="btn-graph-mode"
          :class="{ active: modeActuel === 'rang' }"
          @click="setMode('rang')"
        >
          🏆 Position (#1, #2...)
        </button>
      </div>
    </div>

    <div class="graphique-canvas-container">
      <canvas id="graphique-classement" ref="canvasRef"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { recupererGpParRound } from "../services";

const props = defineProps({
  currentUser: {
    type: Object,
    default: null
  }
});

const canvasRef = ref(null);
const modeActuel = ref("points");
const hasData = ref(false);
let chartInstance = null;

const PALETTE = ["#00d2d3", "#4cd137", "#3b82f6", "#a855f7", "#f1c40f", "#e84118"];

function setMode(mode) {
  modeActuel.value = mode;
  if (dernierDonneesCache.joueurs && dernierDonneesCache.donnees) {
    mettreAJourGraphique(dernierDonneesCache.joueurs, dernierDonneesCache.donnees, props.currentUser);
  }
}

let dernierDonneesCache = { joueurs: null, donnees: null };

function mettreAJourGraphique(joueurs, donnees, utilisateurActuel) {
  dernierDonneesCache = { joueurs, donnees };

  if (typeof Chart === "undefined" || !canvasRef.value) {
    hasData.value = false;
    return;
  }

  if (!joueurs || joueurs.length === 0 || !donnees || !donnees.roundsCalcules || donnees.roundsCalcules.length === 0) {
    hasData.value = false;
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    return;
  }

  hasData.value = true;

  const { historiqueParJoueur, roundsCalcules } = donnees;

  // Calcul points cumulés et rangs
  const pointsCumulesParJoueur = {};
  const rangParJoueur = {};

  roundsCalcules.forEach((r, roundIdx) => {
    const scoresAtRound = [];
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

  let paletteIdx = 0;
  const datasets = joueursCibles.map(j => {
    const isUser = (currentUid && j.uid === currentUid);
    const positionActuelle = joueurs.findIndex(item => item.uid === j.uid) + 1;

    let couleur;
    if (isUser) {
      couleur = "#ff8000";
    } else {
      couleur = PALETTE[paletteIdx % PALETTE.length];
      paletteIdx++;
    }

    const dataPoints = roundsCalcules.map(r => {
      if (modeActuel.value === "rang") {
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
      backgroundColor: couleur + "22",
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

  if (chartInstance) {
    chartInstance.destroy();
  }

  const isModeRang = (modeActuel.value === "rang");

  chartInstance = new Chart(canvasRef.value.getContext("2d"), {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "#e2e8f0",
            font: { size: 11, weight: "bold" },
            boxWidth: 12,
            padding: 12
          }
        },
        tooltip: {
          backgroundColor: "#1f293d",
          borderColor: "#2f3e56",
          borderWidth: 1,
          titleColor: "#ff8000",
          bodyColor: "#e2e8f0",
          padding: 10,
          callbacks: {
            label: function(context) {
              const uid = context.dataset.uidJoueur;
              const pseudo = context.dataset.pseudoJoueur;
              const round = roundsCalcules[context.dataIndex];
              const pts = pointsCumulesParJoueur[uid]?.[round] || 0;
              const rank = rangParJoueur[round]?.[uid] || "?";
              
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
          ticks: { color: "#a5b1c2", font: { size: 10 } },
          grid: { color: "#242f46" }
        },
        y: {
          reverse: isModeRang,
          beginAtZero: !isModeRang,
          suggestedMin: isModeRang ? 1 : 0,
          suggestedMax: isModeRang ? Math.max(5, joueurs.length) : undefined,
          ticks: {
            color: "#a5b1c2",
            font: { size: 10 },
            stepSize: isModeRang ? 1 : undefined,
            callback: function(value) {
              return isModeRang ? "#" + value : value;
            }
          },
          grid: { color: "#242f46" },
          title: {
            display: true,
            text: isModeRang ? "Position au classement (#1 en haut)" : "Points Cumulés",
            color: "#a5b1c2",
            font: { size: 11, weight: "bold" }
          }
        }
      }
    }
  });
}

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});

defineExpose({
  mettreAJourGraphique,
  setMode
});
</script>

<style scoped>
.bloc-graphique {
  background: #0f131c;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #2d3954;
  margin-bottom: 20px;
}

.graphique-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
  border-bottom: 1px solid #242f46;
  padding-bottom: 12px;
}

.graphique-titre {
  margin: 0;
  color: #ff8000;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.graphique-sous-titre {
  font-size: 0.8rem;
  color: #a5b1c2;
  margin: 4px 0 0 0;
}

.graphique-toggle-container {
  display: flex;
  background: #141c2e;
  padding: 3px;
  border-radius: 6px;
  border: 1px solid #2d3954;
}

.btn-graph-mode {
  background: transparent;
  color: #a5b1c2;
  border: none;
  padding: 5px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-graph-mode.active {
  background: #ff8000;
  color: #fff;
}

.graphique-canvas-container {
  position: relative;
  height: 280px;
  width: 100%;
}
</style>
