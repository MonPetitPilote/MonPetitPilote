<template>
  <div class="section-grille-depart">
    <div class="grille-entete">
      <h2 id="titre-grille" class="titre-grille">
        🏆 TA GRILLE DE DÉPART TOP 10 :
      </h2>
      <button
        id="btn-aleatoire"
        type="button"
        class="btn-aleatoire"
        :disabled="isLocked"
        @click="remplirGrilleAleatoire"
      >
        🎲 PRONO ALÉATOIRE
      </button>
    </div>

    <div id="grille-pronos" class="f1-starting-grid">
      <div
        v-for="pos in 10"
        :key="pos"
        class="grid-slot"
        :data-pos="pos"
      >
        <div
          :id="`badge-p${pos}`"
          class="grid-pos-badge"
          :style="{ background: getPiloteColor(selections[pos - 1]) || '#232e44' }"
        >
          P{{ pos }}
        </div>

        <div
          :id="`card-f1-p${pos}`"
          class="grid-card-f1"
          :style="{ borderLeft: getPiloteColor(selections[pos - 1]) ? `5px solid ${getPiloteColor(selections[pos - 1])}` : '1px solid #2f3e56' }"
        >
          <img
            :id="`car-grid-p${pos}`"
            class="car-bg-image"
            :src="getPiloteCarImg(selections[pos - 1])"
            :style="{ display: getPiloteCarImg(selections[pos - 1]) ? 'block' : 'none' }"
            alt="Monoplace F1"
          />

          <div class="driver-info-block">
            <div class="driver-header-line">
              <span
                :id="`num-f1-p${pos}`"
                class="driver-num-text"
                :style="{ color: getPiloteColor(selections[pos - 1]) || 'rgba(255,255,255,0.15)' }"
              >
                {{ getPiloteNumero(selections[pos - 1]) || '--' }}
              </span>
              <img
                v-if="getPilotePays(selections[pos - 1])"
                :id="`flag-f1-p${pos}`"
                class="driver-flag"
                :src="`https://flagcdn.com/w20/${getPilotePays(selections[pos - 1])}.png`"
                alt="Pays"
              />
            </div>

            <select
              :id="`select-grid-p${pos}`"
              class="grid-select-paddock"
              :data-position="pos"
              :value="selections[pos - 1]"
              :disabled="isLocked"
              @change="onPiloteChange(pos - 1, ($event.target as HTMLSelectElement).value)"
            >
              <option value="">👉 CHOISIS TON PILOTE</option>
              <option
                v-for="p in listePilotesAffichee"
                :key="p.nom"
                :value="p.nom"
                :disabled="isPiloteAlreadySelected(p.nom, pos - 1)"
              >
                {{ p.nom }}
              </option>
            </select>

            <div class="driver-team-line">
              <img
                v-if="getPiloteLogoImg(selections[pos - 1])"
                :src="getPiloteLogoImg(selections[pos - 1])"
                class="driver-team-logo"
                alt="Logo Écurie"
              />
              <div
                :id="`team-grid-p${pos}`"
                class="driver-team-text"
                :style="{ color: getPiloteEcurie(selections[pos - 1]) ? '#ff8000' : '#616e88' }"
              >
                {{ getPiloteEcurie(selections[pos - 1]) || '⚡ PLACE À PRENDRE' }}
              </div>
            </div>
          </div>

          <div
            v-if="getPiloteDriverImg(selections[pos - 1])"
            class="driver-portrait-container"
          >
            <img
              :id="`img-grid-p${pos}`"
              :src="getPiloteDriverImg(selections[pos - 1])"
              class="driver-portrait"
              alt="Pilote"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { pilotesData } from "../utils";
import { resoudrePilote, TEAMS_CONFIG, synchroniserPilotesGP } from "../services/driversService";
import { type Pilote } from "../utils/types";
import { getFirestore } from "../utils/firebase";
import { useGridStore } from "../stores";
import { ref } from "vue";

const props = defineProps({
  isLocked: {
    type: Boolean,
    default: false
  }
});

const gridStore = useGridStore();
const selections = gridStore.top10; // même référence que le store : toute écriture ici met à jour le store directement

const listePilotes = ref<Pilote[]>([...pilotesData]);

const listePilotesAffichee = computed(() => {
  return listePilotes.value.length > 0 ? listePilotes.value : pilotesData;
});

onMounted(async () => {
  try {
    const db = getFirestore();
    const pilotesSync = await synchroniserPilotesGP(undefined, db);
    if (pilotesSync && pilotesSync.length > 0) {
      listePilotes.value = pilotesSync;
    }
  } catch (_) {}
});

function getPiloteData(nom?: string | null): Pilote | null {
  if (!nom) return null;
  return listePilotes.value.find(p => p.nom === nom) || pilotesData.find(p => p.nom === nom) || resoudrePilote(nom);
}

function getPiloteColor(nom?: string | null) {
  const p = getPiloteData(nom);
  return p ? p.couleur : null;
}

function getPiloteNumero(nom?: string | null) {
  const p = getPiloteData(nom);
  return p ? p.numero : null;
}

function getPilotePays(nom?: string | null) {
  const p = getPiloteData(nom);
  return p ? p.pays : null;
}

function getPiloteEcurie(nom?: string | null) {
  const p = getPiloteData(nom);
  return p ? p.ecurie : null;
}

function getPiloteDriverImg(nom?: string | null) {
  const p = getPiloteData(nom);
  return p ? p.driverImg : "";
}

function getPiloteCarImg(nom?: string | null) {
  const p = getPiloteData(nom);
  return p ? p.carImg : "";
}

function getPiloteLogoImg(nom?: string | null) {
  const p = getPiloteData(nom);
  if (!p || !p.ecurie) return "";
  return TEAMS_CONFIG[p.ecurie]?.logoImg || "";
}

function isPiloteAlreadySelected(nom: string, currentPosIndex: number) {
  return selections.some((selectedName, idx) => idx !== currentPosIndex && selectedName === nom);
}

function onPiloteChange(posIndex: number, nomPilote: string) {
  selections[posIndex] = nomPilote;
}

function remplirGrilleAleatoire() {
  if (props.isLocked) return;
  const source = listePilotesAffichee.value.length >= 10 ? listePilotesAffichee.value : pilotesData;
  const melange = [...source].sort(() => 0.5 - Math.random());
  for (let i = 0; i < 10; i++) {
    selections[i] = melange[i].nom;
  }
}
</script>

<style scoped>
.grid-slot {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
  box-shadow: none !important;
  height: auto !important;
}

.grid-pos-badge {
  min-width: 42px;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 0.95rem;
  border-radius: 8px;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: background 0.3s ease;
}

.grid-card-f1 {
  position: relative;
  background: #1f293d;
  border-radius: 8px;
  padding: 8px 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  flex-grow: 1;
  min-width: 0;
  min-height: 58px;
  border: 1px solid #2f3e56;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.car-bg-image {
  position: absolute;
  right: 0;
  bottom: -10px;
  height: 120%;
  max-width: 60%;
  opacity: 0.35;
  object-fit: contain;
  pointer-events: none;
  z-index: 1;
}

.driver-portrait-container {
  position: relative;
  width: 58px;
  height: 58px;
  display: flex;
  justify-content: center;
  overflow: hidden;
  margin-left: 8px;
  border-radius: 4px;
  z-index: 2;
  flex-shrink: 0;
}

.section-grille-depart {
  margin-top: 15px;
}

.grille-entete {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 10px;
}

.titre-grille {
  margin: 0;
  font-size: 1.3rem;
  color: #fff;
}

.btn-aleatoire {
  background: #3b4b6b;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: bold;
  transition: background 0.2s;
}

.btn-aleatoire:hover:not(:disabled) {
  background: #4a5c82;
}

.btn-aleatoire:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.driver-info-block {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  position: relative;
  z-index: 2;
}

.driver-header-line {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.grid-select-paddock {
  appearance: none;
  -webkit-appearance: none;
  background: transparent !important;
  border: none !important;
  outline: none;
  color: #fff;
  font-size: 0.95rem;
  font-weight: bold;
  cursor: pointer;
  padding: 2px 0;
  width: 100%;
  box-sizing: border-box;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.grid-select-paddock option {
  background: #111622;
  color: #fff;
}

.driver-team-line {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}

.driver-team-logo {
  width: 18px;
  height: 18px;
  object-fit: contain;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
}

.driver-flag {
  width: 18px;
  border-radius: 2px;
}

.driver-portrait {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
}
</style>