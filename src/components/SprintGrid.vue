<template>
  <div class="section-grille-sprint">
    <div class="grille-sprint-entete">
      <div class="titre-sprint-container">
        <span class="badge-sprint-pill">⚡ SPRINT WEEK-END</span>
        <h3 id="titre-grille-sprint" class="titre-grille-sprint">
          ⚡ TA GRILLE DE DÉPART TOP 5 SPRINT :
        </h3>
      </div>
      <div class="actions-sprint">
        <button
          id="btn-sprint-aleatoire"
          type="button"
          class="btn-sprint-aleatoire"
          :disabled="isLocked"
          @click="remplirSprintAleatoire"
        >
          🎲 SPRINT ALÉATOIRE
        </button>
        <button
          v-if="asModal"
          type="button"
          class="btn-fermer-sprint"
          @click="$emit('close')"
        >
          ✖
        </button>
      </div>
    </div>

    <!-- Bannière explicative des points Sprint -->
    <div class="banniere-points-sprint">
      <span class="icone-info">ℹ️</span>
      <span>
        <strong>Règles Sprint :</strong> Pronostiquez l'ordre des 5 premiers de la course Sprint.
        <span class="points-detail">(P1: <strong>+5 pts</strong> • P2: <strong>+4 pts</strong> • P3: <strong>+3 pts</strong> • P4: <strong>+2 pts</strong> • P5: <strong>+1 pt</strong> • Dans le Top 5 : <strong>+1 pt</strong>)</span>
      </span>
    </div>

    <div id="grille-sprint-slots" class="sprint-slots-grid">
      <div
        v-for="pos in 5"
        :key="pos"
        class="sprint-slot"
        :data-pos="pos"
      >
        <div
          :id="`badge-sprint-p${pos}`"
          class="sprint-pos-badge"
          :style="{ background: getPiloteColor(selections[pos - 1]) || '#4f46e5' }"
        >
          ⚡ S{{ pos }}
        </div>

        <div
          :id="`card-sprint-p${pos}`"
          class="sprint-card-f1"
          :style="{
            borderLeft: getPiloteColor(selections[pos - 1]) ? `5px solid ${getPiloteColor(selections[pos - 1])}` : '1px solid #3b4263'
          }"
        >
          <img
            v-if="getPiloteCarImg(selections[pos - 1])"
            :id="`car-sprint-p${pos}`"
            class="car-bg-image-sprint"
            :src="getPiloteCarImg(selections[pos - 1])"
            alt="Monoplace F1"
          />

          <div class="driver-info-block-sprint">
            <div class="driver-header-line-sprint">
              <span
                :id="`num-sprint-p${pos}`"
                class="driver-num-text-sprint"
                :style="{ color: getPiloteColor(selections[pos - 1]) || 'rgba(255,255,255,0.2)' }"
              >
                {{ getPiloteNumero(selections[pos - 1]) || '--' }}
              </span>
              <img
                v-if="getPilotePays(selections[pos - 1])"
                :id="`flag-sprint-p${pos}`"
                class="driver-flag-sprint"
                :src="`https://flagcdn.com/w20/${getPilotePays(selections[pos - 1])}.png`"
                alt="Pays"
              />
            </div>

            <select
              :id="`select-sprint-p${pos}`"
              class="sprint-select-paddock"
              :data-position="pos"
              :value="selections[pos - 1]"
              :disabled="isLocked"
              @change="onPiloteChange(pos - 1, ($event.target as HTMLSelectElement).value)"
            >
              <option value="">👉 CHOISIS TON PILOTE SPRINT</option>
              <option
                v-for="p in listePilotesAffichee"
                :key="p.nom"
                :value="p.nom"
                :disabled="isPiloteAlreadySelected(p.nom, pos - 1)"
              >
                {{ p.nom }} ({{ p.ecurie }})
              </option>
            </select>

            <div class="driver-team-line-sprint">
              <img
                v-if="getPiloteLogoImg(selections[pos - 1])"
                :src="getPiloteLogoImg(selections[pos - 1])"
                class="driver-team-logo-sprint"
                alt="Logo Écurie"
              />
              <div
                :id="`team-sprint-p${pos}`"
                class="driver-team-text-sprint"
                :style="{ color: getPiloteEcurie(selections[pos - 1]) ? '#00e6c3' : '#818cf8' }"
              >
                {{ getPiloteEcurie(selections[pos - 1]) || '⚡ PLACE SPRINT À PRENDRE' }}
              </div>
            </div>
          </div>

          <div class="driver-portrait-container-sprint">
            <img
              v-if="getPiloteDriverImg(selections[pos - 1])"
              :id="`img-sprint-p${pos}`"
              :src="getPiloteDriverImg(selections[pos - 1])"
              class="driver-portrait-sprint"
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
import { pilotesData, type Pilote } from "../utils";
import { resoudrePilote, TEAMS_CONFIG, synchroniserPilotesGP } from "../services/driversService";
import { getFirestore } from "../utils/firebase";
import { useGridStore } from "../stores";
import { ref } from "vue";

const props = defineProps({
  isLocked: {
    type: Boolean,
    default: false
  },
  asModal: {
    type: Boolean,
    default: false
  }
});

defineEmits(["close"]);

const gridStore = useGridStore();
const selections = gridStore.top5Sprint; // même référence réactive que le store

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
  return selections.some((selectedNom, idx) => selectedNom === nom && idx !== currentPosIndex);
}

function onPiloteChange(index: number, nom: string): void {
  selections[index] = nom;
}

function remplirSprintAleatoire(): void {
  if (props.isLocked) return;
  const source = listePilotesAffichee.value.length >= 5 ? listePilotesAffichee.value : pilotesData;
  const melange = [...source].sort(() => 0.5 - Math.random());
  for (let i = 0; i < 5; i++) {
    selections[i] = melange[i].nom;
  }
}
</script>

<style scoped>
.section-grille-sprint {
  background: linear-gradient(135deg, #171f38 0%, #1f274a 100%);
  border: 1px solid #3730a3;
  border-radius: 10px;
  padding: 16px;
  margin: 18px 0;
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.15);
}

.grille-sprint-entete {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}

.titre-sprint-container {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.badge-sprint-pill {
  background: #6366f1;
  color: white;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 999px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.titre-grille-sprint {
  margin: 0;
  font-size: 1.15rem;
  color: #a5b4fc;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.actions-sprint {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-sprint-aleatoire {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: bold;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.btn-sprint-aleatoire:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-fermer-sprint {
  background: #2a3454;
  color: #94a3b8;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.banniere-points-sprint {
  background: rgba(99, 102, 241, 0.12);
  border-left: 3px solid #818cf8;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 14px;
  font-size: 0.8rem;
  color: #c7d2fe;
  display: flex;
  align-items: center;
  gap: 8px;
}

.points-detail {
  color: #93c5fd;
  margin-left: 4px;
}

.sprint-slots-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sprint-slot {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sprint-pos-badge {
  min-width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 0.85rem;
  border-radius: 8px;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: background 0.3s ease;
}

.sprint-card-f1 {
  position: relative;
  background: #1e2640;
  display: flex;
  align-items: center;
  flex-grow: 1;
  min-width: 0;
  border-radius: 8px;
  padding: 6px 12px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.car-bg-image-sprint {
  position: absolute;
  right: 0;
  bottom: -8px;
  height: 120%;
  max-width: 55%;
  opacity: 0.28;
  object-fit: contain;
  pointer-events: none;
  z-index: 1;
}

.driver-info-block-sprint {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  position: relative;
  z-index: 2;
}

.driver-header-line-sprint {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.driver-num-text-sprint {
  font-size: 18px;
  font-weight: 900;
  font-style: italic;
}

.driver-flag-sprint {
  width: 18px;
  border-radius: 2px;
}

.sprint-select-paddock {
  width: 100%;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  padding: 2px 0;
  outline: none;
  text-overflow: ellipsis;
}

.driver-team-line-sprint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}

.driver-team-logo-sprint {
  width: 16px;
  height: 16px;
  object-fit: contain;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
}

.driver-team-text-sprint {
  font-size: 11px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.driver-portrait-container-sprint {
  position: relative;
  width: 55px;
  height: 55px;
  display: flex;
  justify-content: center;
  overflow: hidden;
  margin-left: 10px;
  border-radius: 4px;
  z-index: 2;
  flex-shrink: 0;
}

.driver-portrait-sprint {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
}
</style>