<template>
  <div class="section-grille-depart">
    <div class="grille-entete">
      <div class="titre-grille-container">
        <span class="badge-gp-pill">🏁 GRAND PRIX</span>
        <h3 id="titre-grille" class="titre-grille">
          🏆 TA GRILLE DE DÉPART TOP 10 :
        </h3>
      </div>
      <div class="actions-grille">
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
    </div>

    <!-- Grille des 10 positions -->
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
          :style="{
            borderLeft: getPiloteColor(selections[pos - 1]) ? `5px solid ${getPiloteColor(selections[pos - 1])}` : '1px solid #2f3e56'
          }"
        >
          <img
            v-if="getPiloteCarImg(selections[pos - 1])"
            :id="`car-grid-p${pos}`"
            class="car-bg-image"
            :src="getPiloteCarImg(selections[pos - 1])"
            alt="Monoplace F1"
          />

          <div class="driver-info-block">
            <div class="driver-header-line">
              <span
                :id="`num-f1-p${pos}`"
                class="driver-num-text"
                :style="{ color: getPiloteColor(selections[pos - 1]) || 'rgba(255,255,255,0.2)' }"
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
                {{ p.nom }} ({{ p.ecurie }})
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

          <div class="driver-portrait-container">
            <img
              v-if="getPiloteDriverImg(selections[pos - 1])"
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
import { computed, ref, onMounted } from "vue";
import { pilotesData, type Pilote } from "../utils";
import { resoudrePilote, TEAMS_CONFIG, synchroniserPilotesGP } from "../services/driversService";
import { getFirestore } from "../utils/firebase";
import { useGridStore } from "../stores";

const props = defineProps({
  isLocked: {
    type: Boolean,
    default: false
  }
});

const gridStore = useGridStore();
const selections = gridStore.top10; // même référence réactive que le store

// Toujours initialisé avec les 22 pilotes officiels
const listePilotes = ref<Pilote[]>([...pilotesData]);

const listePilotesAffichee = computed(() => {
  return listePilotes.value.length >= 22 ? listePilotes.value : pilotesData;
});

onMounted(async () => {
  try {
    const db = getFirestore();
    const pilotesSync = await synchroniserPilotesGP(undefined, db);
    if (pilotesSync && pilotesSync.length >= 22) {
      listePilotes.value = pilotesSync;
    }
  } catch (_) {}
});

function getPiloteData(nom?: string | null): Pilote | null {
  if (!nom) return null;
  return listePilotes.value.find(p => p.nom === nom) || pilotesData.find(p => p.nom === nom) || resoudrePilote(nom);
}

function getPiloteColor(nom?: string | null): string | null {
  const p = getPiloteData(nom);
  return p ? p.couleur : null;
}

function getPiloteNumero(nom?: string | null): string | null {
  const p = getPiloteData(nom);
  return p ? p.numero : null;
}

function getPilotePays(nom?: string | null): string | null {
  const p = getPiloteData(nom);
  return p ? p.pays : null;
}

function getPiloteEcurie(nom?: string | null): string | null {
  const p = getPiloteData(nom);
  return p ? p.ecurie : null;
}

function getPiloteDriverImg(nom?: string | null): string {
  const p = getPiloteData(nom);
  return p ? p.driverImg : "";
}

function getPiloteCarImg(nom?: string | null): string {
  const p = getPiloteData(nom);
  return p ? p.carImg : "";
}

function getPiloteLogoImg(nom?: string | null): string {
  const p = getPiloteData(nom);
  if (!p || !p.ecurie) return "";
  return TEAMS_CONFIG[p.ecurie]?.logoImg || "";
}

function isPiloteAlreadySelected(nom: string, currentPosIndex: number): boolean {
  return selections.some((selectedName, idx) => idx !== currentPosIndex && selectedName === nom);
}

function onPiloteChange(posIndex: number, nomPilote: string): void {
  selections[posIndex] = nomPilote;
}

function remplirGrilleAleatoire(): void {
  if (props.isLocked) return;
  const source = listePilotesAffichee.value.length >= 10 ? listePilotesAffichee.value : pilotesData;
  const melange = [...source].sort(() => 0.5 - Math.random());
  for (let i = 0; i < 10; i++) {
    selections[i] = melange[i].nom;
  }
}
</script>

<style scoped>
.section-grille-depart {
  background: linear-gradient(135deg, #131927 0%, #1a2236 100%);
  border: 1px solid #28354f;
  border-radius: 10px;
  padding: 16px;
  margin: 18px 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.grille-entete {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}

.titre-grille-container {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.badge-gp-pill {
  background: #e10600;
  color: white;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 999px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.titre-grille {
  margin: 0;
  font-size: 1.15rem;
  color: #f1f5f9;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.actions-grille {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-aleatoire {
  background: linear-gradient(135deg, #2b3853 0%, #3a4b6f 100%);
  color: white;
  border: 1px solid #485c86;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: bold;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.btn-aleatoire:hover:not(:disabled) {
  background: linear-gradient(135deg, #374667 0%, #4a5e8c 100%);
  transform: translateY(-1px);
}

.btn-aleatoire:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.f1-starting-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.grid-slot {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.grid-pos-badge {
  min-width: 48px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-style: italic;
  font-size: 1.15rem;
  letter-spacing: -0.5px;
  border-radius: 8px;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.35);
  transition: all 0.25s ease;
  user-select: none;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.grid-card-f1 {
  position: relative;
  background: linear-gradient(135deg, #182236 0%, #121828 100%);
  display: flex;
  align-items: center;
  flex-grow: 1;
  min-width: 0;
  height: 52px;
  border-radius: 8px;
  padding: 4px 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.25);
  transition: all 0.25s ease;
  overflow: hidden;
}

.grid-card-f1:hover {
  background: linear-gradient(135deg, #1f2b45 0%, #161e32 100%);
  border-color: rgba(255, 255, 255, 0.18);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
}

.car-bg-image {
  position: absolute;
  right: 48px;
  bottom: -6px;
  height: 115%;
  max-width: 50%;
  opacity: 0.25;
  object-fit: contain;
  pointer-events: none;
  z-index: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
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
  gap: 6px;
  margin-bottom: 0px;
  line-height: 1;
}

.driver-num-text {
  font-size: 16px;
  font-weight: 900;
  font-style: italic;
  letter-spacing: -0.5px;
}

.driver-flag {
  width: 16px;
  height: 11px;
  border-radius: 2px;
  object-fit: cover;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.grid-select-paddock {
  width: 100%;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  padding: 1px 0;
  outline: none;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.grid-select-paddock option {
  background-color: #161e30;
  color: #ffffff;
  font-weight: 600;
}

.driver-team-line {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 1px;
  line-height: 1;
}

.driver-team-logo {
  width: 14px;
  height: 14px;
  object-fit: contain;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
}

.driver-team-text {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.driver-portrait-container {
  position: relative;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  overflow: hidden;
  margin-left: 6px;
  border-radius: 4px;
  z-index: 2;
  flex-shrink: 0;
}

.driver-portrait {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
}

/* =======================================================
   MODE ORDINATEUR (Desktop >= 992px) : Grille F1 Staggered
   ======================================================= */
@media (min-width: 992px) {
  .section-grille-depart {
    padding: 20px 24px;
    background: linear-gradient(135deg, #111726 0%, #172036 100%);
    border: 1px solid #283752;
    border-radius: 12px;
  }

  .f1-starting-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 28px;
    row-gap: 18px;
    padding-bottom: 46px; /* Compense le décalage vers le bas de P10 */
    align-items: start;
    position: relative;
  }

  .grid-slot {
    width: 100%;
    transition: transform 0.2s ease;
  }

  /* Colonne 1 (Gauche) : Positions impaires P1, P3, P5, P7, P9 */
  .grid-slot:nth-child(odd) {
    grid-column: 1;
  }

  /* Colonne 2 (Droite) : Positions paires P2, P4, P6, P8, P10
     Décalées vers le bas à mi-hauteur (échelonnage typique de la grille F1) */
  .grid-slot:nth-child(even) {
    grid-column: 2;
    transform: translateY(36px);
  }

  .grid-slot:nth-child(odd):hover {
    transform: translateY(-2px);
  }

  .grid-slot:nth-child(even):hover {
    transform: translateY(34px);
  }
}
</style>
