<template>
  <div class="section-selection-course">
    <!-- Sélection de la Ligue active -->
    <div class="section-ligue">
      <label for="select-ligue" class="label-ligue">
        <span>🏆 MA LIGUE ACTIVE :</span>
        <button
          id="btn-gerer-ligues"
          type="button"
          class="btn-gerer-ligues"
          @click="$emit('open-league-modal')"
        >
          ⚙️ CRÉER / REJOINDRE
        </button>
      </label>
      <select
        id="select-ligue"
        :value="activeLeague"
        class="select-f1"
        @change="$emit('update:activeLeague', $event.target.value)"
      >
        <option
          v-for="ligue in leaguesList"
          :key="ligue.code"
          :value="ligue.code"
        >
          {{ ligue.code === CODE_LIGUE_MONDIAL ? ligue.nom : `🏆 ${ligue.nom} (${ligue.code})` }}
        </option>
      </select>
    </div>

    <!-- Sélection du GP / Week-end -->
    <div class="section-course">
      <label for="select-course" class="label-course">
        SÉLECTIONNER LE WEEK-END :
      </label>
      <select
        id="select-course"
        :value="selectedCourse"
        class="select-f1"
        @change="$emit('update:selectedCourse', $event.target.value)"
      >
        <option
          v-for="gp in listeCalendrier"
          :key="gp.round"
          :value="`2026/${gp.round}`"
        >
          Round {{ gp.round }} : {{ gp.nom }} - {{ gp.circuit }} ({{ gp.pays }}) {{ gp.hasSprint ? '⚡ [SPRINT]' : '' }} — 📅 {{ formatDate(gp.date) }}
        </option>
      </select>
    </div>

    <!-- Bannière Week-end Sprint si applicable -->
    <div
      v-if="currentGp && currentGp.hasSprint"
      id="banniere-sprint-info"
      class="banniere-sprint-info"
    >
      <span class="badge-sprint-tag">⚡ WEEK-END SPRINT</span>
      <span>Ce Grand Prix comporte une <strong>Course Sprint</strong> ! Pensez à remplir votre <strong>Top 5 Sprint</strong>.</span>
    </div>

    <!-- Bannière de verrouillage si GP passé -->
    <div
      v-if="isLocked"
      id="banniere-verrouillage"
      class="banniere-verrouillage"
    >
      🔒 Les pronostics pour ce Grand Prix sont clôturés (le week-end a déjà eu lieu).
    </div>

    <!-- Compte à rebours avant la clôture -->
    <div
      v-if="!isLocked && countdownText"
      id="countdown-pronos"
      class="countdown-pronos"
      :class="{ urgent: isCountdownUrgent }"
    >
      ⏳ Il reste <span class="countdown-highlight">{{ countdownText }}</span> pour valider ce pronostic
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { type GrandPrix } from "../utils";
import { CODE_LIGUE_MONDIAL, getCalendrierActuel, onCalendrierChange } from "../services";

const props = defineProps({
  selectedCourse: {
    type: String,
    default: "2026/1"
  },
  activeLeague: {
    type: String,
    default: CODE_LIGUE_MONDIAL
  },
  leaguesList: {
    type: Array,
    default: () => [{ code: CODE_LIGUE_MONDIAL, nom: "🌍 Mondial" }]
  }
});

const emit = defineEmits(["update:selectedCourse", "update:activeLeague", "open-league-modal", "lock-change"]);

const listeCalendrier = ref<GrandPrix[]>(getCalendrierActuel());
const countdownText = ref("");
const isCountdownUrgent = ref(false);
let timerInterval: any = null;
let unsubscribeCalendrier: (() => void) | null = null;

const currentGp = computed(() => {
  const round = parseInt((props.selectedCourse || "").split('/')[1]);
  return listeCalendrier.value.find(g => g.round === round) || null;
});

const isLocked = computed(() => {
  if (!currentGp.value) return false;
  return new Date(currentGp.value.date) <= new Date();
});

watch(isLocked, (nouveauVerrouille) => {
  emit("lock-change", nouveauVerrouille);
}, { immediate: true });

function formatDate(dateStr: string) {
  const dateObj = new Date(dateStr);
  return dateObj.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function calculerCountdown() {
  if (!currentGp.value || isLocked.value) {
    countdownText.value = "";
    return;
  }

  const echeance = new Date(currentGp.value.date);
  const maintenant = new Date();
  const diffMs = echeance.getTime() - maintenant.getTime();

  if (diffMs <= 0) {
    countdownText.value = "";
    return;
  }

  const jours = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const heures = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);

  if (jours > 0) {
    countdownText.value = `${jours}j ${heures}h`;
  } else if (heures > 0) {
    countdownText.value = `${heures}h ${minutes}min`;
  } else {
    countdownText.value = `${minutes}min`;
  }

  isCountdownUrgent.value = diffMs < 1000 * 60 * 60 * 24;
}

watch(() => props.selectedCourse, () => {
  calculerCountdown();
});

onMounted(() => {
  unsubscribeCalendrier = onCalendrierChange((nouveau) => {
    listeCalendrier.value = [...nouveau];
    calculerCountdown();
  });
  calculerCountdown();
  timerInterval = setInterval(calculerCountdown, 60 * 1000);
});

onBeforeUnmount(() => {
  if (timerInterval) clearInterval(timerInterval);
  if (unsubscribeCalendrier) unsubscribeCalendrier();
});
</script>

<style scoped>
.section-selection-course {
  margin-bottom: 20px;
}

.section-ligue {
  margin-bottom: 18px;
  background: #1b2436;
  padding: 14px;
  border-radius: 8px;
  border-left: 4px solid #ff8000;
}

.label-ligue {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: bold;
  font-size: 0.9rem;
  color: #ff8000;
}

.btn-gerer-ligues {
  background: #3b4b6b;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: bold;
  transition: background 0.2s;
}

.btn-gerer-ligues:hover {
  background: #4a5c82;
}

.section-course {
  margin-bottom: 10px;
}

.label-course {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #fff;
}

.select-f1 {
  width: 100%;
  box-sizing: border-box;
  background: #1f293d;
  color: #fff;
  border: 1px solid #2f3e56;
  padding: 10px;
  border-radius: 6px;
  font-size: 0.95rem;
}

.banniere-sprint-info {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid #6366f1;
  color: #c7d2fe;
  padding: 9px 12px;
  border-radius: 6px;
  margin-top: 10px;
  font-size: 0.85rem;
}

.badge-sprint-tag {
  background: #6366f1;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 4px;
  white-space: nowrap;
  letter-spacing: 0.5px;
}

.banniere-verrouillage {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid #ef4444;
  color: #ef4444;
  padding: 10px 14px;
  border-radius: 6px;
  margin-top: 10px;
  font-weight: bold;
  font-size: 0.85rem;
}

.countdown-pronos {
  display: flex;
  align-items: center;
  margin-top: 10px;
  padding: 8px 12px;
  background: rgba(0, 210, 211, 0.08);
  border: 1px solid #00d2d3;
  color: #00d2d3;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: bold;
}

.countdown-pronos.urgent {
  background: rgba(255, 128, 0, 0.12);
  border-color: #ff8000;
  color: #ff8000;
}

.countdown-highlight {
  margin: 0 4px;
  text-decoration: underline;
}
</style>
