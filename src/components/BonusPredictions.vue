<template>
  <div
    class="section-predictions-bonus"
    :style="{
      pointerEvents: isLocked && !bonusReel ? 'none' : 'auto',
      opacity: isLocked && !bonusReel ? '0.7' : '1'
    }"
  >
    <div class="bonus-header">
      <h3 class="bonus-titre">
        🎲 PRÉDICTIONS BONUS DU WEEK-END
      </h3>
      <div class="bonus-header-right">
        <span v-if="isCalculated" class="badge-calcule">🏁 Résultat validé</span>
        <span class="bonus-pts-badge">+2 pts par bonne réponse</span>
      </div>
    </div>

    <div class="bonus-grid">
      <!-- 1. Safety Car -->
      <div class="bonus-card" :class="{ 'card-calculee': isCalculated }">
        <div class="bonus-question">
          <span>🚗 Y aura-t-il une Safety Car en course ?</span>
        </div>
        
        <!-- Mode saisie / toggle -->
        <div v-if="!isCalculated" class="toggle-oui-non" data-bonus="safetyCar">
          <button
            type="button"
            class="btn-toggle-bonus"
            :class="{ active: predictions.safetyCar === true, isOui: true }"
            data-valeur="true"
            :disabled="isLocked"
            @click="setBooleanPrediction('safetyCar', true)"
          >
            OUI
          </button>
          <button
            type="button"
            class="btn-toggle-bonus"
            :class="{ active: predictions.safetyCar === false, isNon: true }"
            data-valeur="false"
            :disabled="isLocked"
            @click="setBooleanPrediction('safetyCar', false)"
          >
            NON
          </button>
        </div>

        <!-- Mode résultat réel calculé -->
        <div v-else class="resultat-bonus-detail">
          <div class="ligne-prono-joueur">
            <span class="label-info">Ton prono :</span>
            <span class="valeur-joueur">
              {{ predictions.safetyCar === true ? 'OUI' : predictions.safetyCar === false ? 'NON' : 'Non répondu' }}
            </span>
          </div>
          <div class="ligne-resultat-officiel">
            <span class="label-info">Résultat officiel :</span>
            <strong :style="{ color: bonusReel?.safetyCar ? '#4cd137' : '#ef4444' }">
              {{ bonusReel?.safetyCar ? 'OUI (Déployée)' : 'NON' }}
            </strong>
          </div>
          <div v-if="getDetail('safetyCar')" class="badge-statut-pts" :class="{ success: getDetail('safetyCar')?.correct, fail: !getDetail('safetyCar')?.correct }">
            {{ getDetail('safetyCar')?.correct ? `✅ +${getDetail('safetyCar')?.points} pts` : '❌ 0 pt' }}
          </div>
        </div>
      </div>

      <!-- 2. Drapeau Rouge -->
      <div class="bonus-card" :class="{ 'card-calculee': isCalculated }">
        <div class="bonus-question">
          <span>🚩 Y aura-t-il au moins un drapeau rouge ?</span>
        </div>

        <div v-if="!isCalculated" class="toggle-oui-non" data-bonus="drapeauRouge">
          <button
            type="button"
            class="btn-toggle-bonus"
            :class="{ active: predictions.drapeauRouge === true, isOui: true }"
            data-valeur="true"
            :disabled="isLocked"
            @click="setBooleanPrediction('drapeauRouge', true)"
          >
            OUI
          </button>
          <button
            type="button"
            class="btn-toggle-bonus"
            :class="{ active: predictions.drapeauRouge === false, isNon: true }"
            data-valeur="false"
            :disabled="isLocked"
            @click="setBooleanPrediction('drapeauRouge', false)"
          >
            NON
          </button>
        </div>

        <div v-else class="resultat-bonus-detail">
          <div class="ligne-prono-joueur">
            <span class="label-info">Ton prono :</span>
            <span class="valeur-joueur">
              {{ predictions.drapeauRouge === true ? 'OUI' : predictions.drapeauRouge === false ? 'NON' : 'Non répondu' }}
            </span>
          </div>
          <div class="ligne-resultat-officiel">
            <span class="label-info">Résultat officiel :</span>
            <strong :style="{ color: bonusReel?.drapeauRouge ? '#4cd137' : '#ef4444' }">
              {{ bonusReel?.drapeauRouge ? 'OUI (Drapeau Rouge)' : 'NON' }}
            </strong>
          </div>
          <div v-if="getDetail('drapeauRouge')" class="badge-statut-pts" :class="{ success: getDetail('drapeauRouge')?.correct, fail: !getDetail('drapeauRouge')?.correct }">
            {{ getDetail('drapeauRouge')?.correct ? `✅ +${getDetail('drapeauRouge')?.points} pts` : '❌ 0 pt' }}
          </div>
        </div>
      </div>

      <!-- 3. Nombre de DNF -->
      <div class="bonus-card" :class="{ 'card-calculee': isCalculated }">
        <div class="bonus-question">
          <span>💥 Nombre d'abandons (DNF) :</span>
        </div>

        <div v-if="!isCalculated" class="input-dnf-wrapper">
          <input
            id="input-nombre-dnf"
            v-model.number="predictions.nombreDNF"
            type="number"
            min="0"
            max="20"
            placeholder="Ex : 2"
            class="input-dnf"
            :disabled="isLocked"
            @input="emitChange"
          />
        </div>

        <div v-else class="resultat-bonus-detail">
          <div class="ligne-prono-joueur">
            <span class="label-info">Ton prono :</span>
            <span class="valeur-joueur">
              {{ predictions.nombreDNF !== null && predictions.nombreDNF !== undefined ? `${predictions.nombreDNF} abandon(s)` : 'Non répondu' }}
            </span>
          </div>
          <div class="ligne-resultat-officiel">
            <span class="label-info">Résultat officiel :</span>
            <strong style="color: #ff8000;">
              {{ bonusReel?.nombreDNF !== undefined ? `${bonusReel.nombreDNF} abandon(s)` : '—' }}
            </strong>
          </div>
          <div v-if="getDetail('nombreDNF')" class="badge-statut-pts" :class="{ success: getDetail('nombreDNF')?.correct, fail: !getDetail('nombreDNF')?.correct }">
            {{ getDetail('nombreDNF')?.correct ? `✅ +${getDetail('nombreDNF')?.points} pts` : '❌ 0 pt' }}
          </div>
        </div>
      </div>

      <!-- 4. Poleman sur le Podium -->
      <div class="bonus-card" :class="{ 'card-calculee': isCalculated }">
        <div class="bonus-question">
          <span>🏆 Le poleman sera-t-il sur le podium (Top 3) ?</span>
        </div>

        <div v-if="!isCalculated" class="toggle-oui-non" data-bonus="polemanPodium">
          <button
            type="button"
            class="btn-toggle-bonus"
            :class="{ active: predictions.polemanPodium === true, isOui: true }"
            data-valeur="true"
            :disabled="isLocked"
            @click="setBooleanPrediction('polemanPodium', true)"
          >
            OUI
          </button>
          <button
            type="button"
            class="btn-toggle-bonus"
            :class="{ active: predictions.polemanPodium === false, isNon: true }"
            data-valeur="false"
            :disabled="isLocked"
            @click="setBooleanPrediction('polemanPodium', false)"
          >
            NON
          </button>
        </div>

        <div v-else class="resultat-bonus-detail">
          <div class="ligne-prono-joueur">
            <span class="label-info">Ton prono :</span>
            <span class="valeur-joueur">
              {{ predictions.polemanPodium === true ? 'OUI' : predictions.polemanPodium === false ? 'NON' : 'Non répondu' }}
            </span>
          </div>
          <div class="ligne-resultat-officiel">
            <span class="label-info">Résultat officiel :</span>
            <strong :style="{ color: bonusReel?.polemanPodium ? '#4cd137' : '#ef4444' }">
              {{ bonusReel?.polemanPodium ? 'OUI (Sur le podium)' : 'NON' }}
            </strong>
          </div>
          <div v-if="getDetail('polemanPodium')" class="badge-statut-pts" :class="{ success: getDetail('polemanPodium')?.correct, fail: !getDetail('polemanPodium')?.correct }">
            {{ getDetail('polemanPodium')?.correct ? `✅ +${getDetail('polemanPodium')?.points} pts` : '❌ 0 pt' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from "vue";

const props = defineProps({
  isLocked: {
    type: Boolean,
    default: false
  },
  bonusReel: {
    type: Object,
    default: () => null
  },
  detailBonus: {
    type: Array,
    default: () => []
  },
  isCalculated: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["update:predictions"]);

const predictions = reactive({
  safetyCar: null,
  drapeauRouge: null,
  nombreDNF: null,
  polemanPodium: null
});

function setBooleanPrediction(cle, valeur) {
  if (props.isLocked) return;
  if (predictions[cle] === valeur) {
    predictions[cle] = null;
  } else {
    predictions[cle] = valeur;
  }
  emitChange();
}

function emitChange() {
  emit("update:predictions", {
    safetyCar: predictions.safetyCar,
    drapeauRouge: predictions.drapeauRouge,
    nombreDNF: predictions.nombreDNF !== null && predictions.nombreDNF !== "" ? Number(predictions.nombreDNF) : null,
    polemanPodium: predictions.polemanPodium
  });
}

function getDetail(cle) {
  if (!props.detailBonus || props.detailBonus.length === 0) return null;
  return props.detailBonus.find(d => d.cle === cle) || null;
}

defineExpose({
  predictions,
  setPredictions: (donnees) => {
    const d = donnees || {};
    predictions.safetyCar = d.safetyCar !== undefined ? d.safetyCar : null;
    predictions.drapeauRouge = d.drapeauRouge !== undefined ? d.drapeauRouge : null;
    predictions.nombreDNF = (d.nombreDNF !== undefined && d.nombreDNF !== null) ? Number(d.nombreDNF) : null;
    predictions.polemanPodium = d.polemanPodium !== undefined ? d.polemanPodium : null;
  },
  getPredictions: () => ({ ...predictions })
});
</script>

<style scoped>
.section-predictions-bonus {
  margin-top: 25px;
  background: #182234;
  border: 1px solid #2d3954;
  border-radius: 10px;
  padding: 18px;
  transition: opacity 0.3s ease;
}

.bonus-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid #2d3954;
  padding-bottom: 10px;
  flex-wrap: wrap;
  gap: 8px;
}

.bonus-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bonus-titre {
  margin: 0;
  color: #00d2d3;
  font-size: 1.05rem;
  letter-spacing: 0.5px;
}

.badge-calcule {
  background: rgba(76, 209, 55, 0.15);
  color: #4cd137;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
}

.bonus-pts-badge {
  background: rgba(0, 210, 211, 0.15);
  color: #00d2d3;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
}

.bonus-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.bonus-card {
  background: #0f131c;
  border: 1px solid #242f46;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
}

.bonus-card.card-calculee {
  background: #121824;
  border-color: #2f3e5b;
}

.bonus-question {
  font-size: 0.85rem;
  color: #e2e8f0;
  font-weight: 500;
  line-height: 1.3;
}

.toggle-oui-non {
  display: flex;
  gap: 8px;
}

.btn-toggle-bonus {
  flex: 1;
  background: #0f131c;
  border: 1px solid #2d3954;
  color: #a5b1c2;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-toggle-bonus:hover:not(:disabled) {
  border-color: #ff8000;
  color: #fff;
}

.btn-toggle-bonus.active.isOui {
  background: rgba(76, 209, 55, 0.18) !important;
  border-color: #4cd137 !important;
  color: #4cd137 !important;
}

.btn-toggle-bonus.active.isNon {
  background: rgba(239, 68, 68, 0.18) !important;
  border-color: #ef4444 !important;
  color: #ef4444 !important;
}

.input-dnf-wrapper {
  display: flex;
  align-items: center;
}

.input-dnf {
  width: 100%;
  background: #141b29;
  border: 1px solid #2d3954;
  color: #fff;
  padding: 7px 10px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: bold;
  text-align: center;
  outline: none;
}

.input-dnf:focus {
  border-color: #ff8000;
}

.resultat-bonus-detail {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 0.82rem;
  background: rgba(0, 0, 0, 0.25);
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #1c2638;
}

.ligne-prono-joueur, .ligne-resultat-officiel {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label-info {
  color: #8392a5;
  font-size: 0.78rem;
}

.valeur-joueur {
  color: #e2e8f0;
  font-weight: 600;
}

.badge-statut-pts {
  margin-top: 4px;
  padding: 3px 6px;
  border-radius: 4px;
  text-align: center;
  font-size: 0.78rem;
  font-weight: bold;
}

.badge-statut-pts.success {
  background: rgba(76, 209, 55, 0.15);
  color: #4cd137;
  border: 1px solid rgba(76, 209, 55, 0.3);
}

.badge-statut-pts.fail {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.25);
}
</style>

