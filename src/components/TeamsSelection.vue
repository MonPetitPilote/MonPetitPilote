<template>
  <div class="section-selection-ecuries">
    <!-- Top 2 Écuries -->
    <div class="groupe-ecuries">
      <div class="ecuries-header">
        <span class="ecuries-titre-top">🚀 TES 2 ÉCURIES TOP</span>
        <span class="badge-points-top">+5 pts si gagnante</span>
      </div>
      <div class="slots-ecuries-grid">
        <div
          id="ecurie-top-1"
          class="slot-ecurie slot-top"
          :class="{ selected: !!ecuriesTop[0] }"
          :data-ecurie-value="ecuriesTop[0]"
          :style="{ pointerEvents: isLocked ? 'none' : 'auto', opacity: isLocked ? '0.5' : '1' }"
          @click="ouvrirSelecteur('top', 0)"
        >
          <div v-if="!ecuriesTop[0]" class="placeholder-team">
            ➕ CHOISIR<br /><span class="sub">TOP 1</span>
          </div>
          <img
            v-if="ecuriesTop[0]"
            class="logo-selectionne"
            :src="getLogo(ecuriesTop[0])"
            :alt="ecuriesTop[0]"
          />
          <div v-if="ecuriesTop[0]" class="nom-selectionne">
            {{ ecuriesTop[0] }}
          </div>
        </div>

        <div
          id="ecurie-top-2"
          class="slot-ecurie slot-top"
          :class="{ selected: !!ecuriesTop[1] }"
          :data-ecurie-value="ecuriesTop[1]"
          :style="{ pointerEvents: isLocked ? 'none' : 'auto', opacity: isLocked ? '0.5' : '1' }"
          @click="ouvrirSelecteur('top', 1)"
        >
          <div v-if="!ecuriesTop[1]" class="placeholder-team">
            ➕ CHOISIR<br /><span class="sub">TOP 2</span>
          </div>
          <img
            v-if="ecuriesTop[1]"
            class="logo-selectionne"
            :src="getLogo(ecuriesTop[1])"
            :alt="ecuriesTop[1]"
          />
          <div v-if="ecuriesTop[1]" class="nom-selectionne">
            {{ ecuriesTop[1] }}
          </div>
        </div>
      </div>
    </div>

    <!-- Flop 2 Écuries -->
    <div class="groupe-ecuries">
      <div class="ecuries-header">
        <span class="ecuries-titre-flop">⚠️ TES 2 ÉCURIES FLOP</span>
        <span class="badge-points-flop">+3 pts si elle ne gagne pas</span>
      </div>
      <div class="slots-ecuries-grid">
        <div
          id="ecurie-flop-1"
          class="slot-ecurie slot-flop"
          :class="{ selected: !!ecuriesFlop[0] }"
          :data-ecurie-value="ecuriesFlop[0]"
          :style="{ pointerEvents: isLocked ? 'none' : 'auto', opacity: isLocked ? '0.5' : '1' }"
          @click="ouvrirSelecteur('flop', 0)"
        >
          <div v-if="!ecuriesFlop[0]" class="placeholder-team">
            ➕ CHOISIR<br /><span class="sub">FLOP 1</span>
          </div>
          <img
            v-if="ecuriesFlop[0]"
            class="logo-selectionne"
            :src="getLogo(ecuriesFlop[0])"
            :alt="ecuriesFlop[0]"
          />
          <div v-if="ecuriesFlop[0]" class="nom-selectionne">
            {{ ecuriesFlop[0] }}
          </div>
        </div>

        <div
          id="ecurie-flop-2"
          class="slot-ecurie slot-flop"
          :class="{ selected: !!ecuriesFlop[1] }"
          :data-ecurie-value="ecuriesFlop[1]"
          :style="{ pointerEvents: isLocked ? 'none' : 'auto', opacity: isLocked ? '0.5' : '1' }"
          @click="ouvrirSelecteur('flop', 1)"
        >
          <div v-if="!ecuriesFlop[1]" class="placeholder-team">
            ➕ CHOISIR<br /><span class="sub">FLOP 2</span>
          </div>
          <img
            v-if="ecuriesFlop[1]"
            class="logo-selectionne"
            :src="getLogo(ecuriesFlop[1])"
            :alt="ecuriesFlop[1]"
          />
          <div v-if="ecuriesFlop[1]" class="nom-selectionne">
            {{ ecuriesFlop[1] }}
          </div>
        </div>
      </div>
    </div>

    <!-- Modale de sélection d'écurie -->
    <div
      v-if="isModalOpen"
      id="modale-choix-ecurie"
      class="modale-ecurie-overlay"
      @click.self="isModalOpen = false"
    >
      <div class="modale-ecurie-boite">
        <button
          type="button"
          class="btn-fermer-ecurie"
          @click="isModalOpen = false"
        >
          ❌
        </button>

        <h3 class="modale-titre">
          🏎️ Sélectionner l'écurie
        </h3>
        <p v-if="toutesEcuriesPrises.length" class="modale-notice">
          🔒 Une écurie déjà choisie ailleurs ne peut pas être reprise.
        </p>

        <div class="grille-tuiles-ecuries">
          <div
            class="tuile-ecurie tuile-vider"
            @click="choisirEcurie('')"
          >
            ❌ VIDER L'EMPLACEMENT
          </div>

          <div
            v-for="ecurie in ecuriesSaison"
            :key="ecurie"
            class="tuile-ecurie"
            :class="{ verrouillee: estEcurieVerrouillee(ecurie) }"
            @click="!estEcurieVerrouillee(ecurie) && choisirEcurie(ecurie)"
          >
            <img
              :src="getLogo(ecurie)"
              :alt="ecurie"
              class="logo-tuile"
            />
            <span class="nom-tuile">
              {{ ecurie }}{{ estEcurieVerrouillee(ecurie) ? ' 🔒' : '' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ecuriesSaison, LOGOS_ECURIES_2026 } from "../utils";

const props = defineProps({
  isLocked: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["update:ecuriesTop", "update:ecuriesFlop"]);

const ecuriesTop = ref(["", ""]);
const ecuriesFlop = ref(["", ""]);

const isModalOpen = ref(false);
const cibleSlotType = ref("top"); // "top" ou "flop"
const cibleSlotIndex = ref(0); // 0 ou 1

function getLogo(nomEcurie) {
  return LOGOS_ECURIES_2026[nomEcurie] || "";
}

const toutesEcuriesPrises = computed(() => {
  const prises = [];
  ecuriesTop.value.forEach((nom, i) => {
    if (nom && !(cibleSlotType.value === "top" && cibleSlotIndex.value === i)) {
      prises.push(nom);
    }
  });
  ecuriesFlop.value.forEach((nom, i) => {
    if (nom && !(cibleSlotType.value === "flop" && cibleSlotIndex.value === i)) {
      prises.push(nom);
    }
  });
  return prises;
});

function estEcurieVerrouillee(ecurie) {
  return toutesEcuriesPrises.value.includes(ecurie);
}

function ouvrirSelecteur(type, index) {
  if (props.isLocked) return;
  cibleSlotType.value = type;
  cibleSlotIndex.value = index;
  isModalOpen.value = true;
}

function choisirEcurie(nomEcurie) {
  if (cibleSlotType.value === "top") {
    ecuriesTop.value[cibleSlotIndex.value] = nomEcurie;
    emit("update:ecuriesTop", [...ecuriesTop.value]);
  } else {
    ecuriesFlop.value[cibleSlotIndex.value] = nomEcurie;
    emit("update:ecuriesFlop", [...ecuriesFlop.value]);
  }
  isModalOpen.value = false;
}

defineExpose({
  ecuriesTop,
  ecuriesFlop,
  setEcuries: (top, flop) => {
    ecuriesTop.value = [(top && top[0]) || "", (top && top[1]) || ""];
    ecuriesFlop.value = [(flop && flop[0]) || "", (flop && flop[1]) || ""];
  }
});
</script>

<style scoped>
.section-selection-ecuries {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.groupe-ecuries {
  background: #182234;
  border: 1px solid #2d3954;
  border-radius: 8px;
  padding: 12px;
}

.ecuries-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.ecuries-titre-top {
  font-weight: bold;
  font-size: 0.85rem;
  color: #00e6c3;
}

.ecuries-titre-flop {
  font-weight: bold;
  font-size: 0.85rem;
  color: #ef4444;
}

.badge-points-top {
  font-size: 0.72rem;
  color: #00e6c3;
  background: rgba(0, 230, 195, 0.12);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
}

.badge-points-flop {
  font-size: 0.72rem;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
}

.slots-ecuries-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.slot-ecurie {
  background: #0f131c;
  border-radius: 8px;
  height: 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  overflow: hidden;
  padding: 5px;
}

.slot-top {
  border: 2px dashed #2d3954;
}

.slot-top.selected {
  border: 2px solid #00e6c3;
  background: rgba(255, 255, 255, 0.02);
}

.slot-flop {
  border: 2px dashed #2d3954;
}

.slot-flop.selected {
  border: 2px solid #ef4444;
  background: rgba(255, 255, 255, 0.02);
}

.placeholder-team {
  text-align: center;
  color: #616e88;
  font-size: 12px;
  font-weight: bold;
}

.placeholder-team .sub {
  font-size: 10px;
  opacity: 0.7;
}

.logo-selectionne {
  height: 75%;
  max-width: 90%;
  object-fit: contain;
  z-index: 2;
}

.nom-selectionne {
  position: absolute;
  bottom: 2px;
  font-size: 10px;
  font-weight: bold;
  color: #fff;
  background: rgba(0, 0, 0, 0.6);
  padding: 1px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}

.modale-ecurie-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modale-ecurie-boite {
  background: #1f293d;
  width: 90%;
  max-width: 500px;
  border-radius: 12px;
  border: 1px solid #2f3e56;
  padding: 20px;
  position: relative;
  color: #fff;
}

.btn-fermer-ecurie {
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  border: none;
  color: #616e88;
  font-size: 16px;
  cursor: pointer;
}

.modale-titre {
  margin-top: 0;
  color: #ff8000;
  font-size: 16px;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.modale-notice {
  font-size: 11px;
  color: #616e88;
  margin-top: -8px;
  margin-bottom: 12px;
}

.grille-tuiles-ecuries {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 5px;
}

.tuile-ecurie {
  background: #111622;
  border: 1px solid #2d3954;
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 80px;
}

.tuile-ecurie:hover:not(.verrouillee) {
  border-color: #ff8000;
}

.tuile-ecurie.verrouillee {
  cursor: not-allowed;
  opacity: 0.35;
  border-color: #3b4256;
}

.tuile-ecurie.verrouillee .logo-tuile {
  filter: grayscale(100%);
}

.tuile-vider {
  background: rgba(239, 68, 68, 0.1);
  border: 1px dashed #ef4444;
  font-weight: bold;
  color: #ef4444;
  font-size: 12px;
  text-align: center;
}

.logo-tuile {
  max-height: 45px;
  max-width: 100%;
  object-fit: contain;
  margin-bottom: 6px;
}

.nom-tuile {
  font-size: 11px;
  font-weight: bold;
  color: #a0aec0;
  text-align: center;
  text-transform: uppercase;
}
</style>
