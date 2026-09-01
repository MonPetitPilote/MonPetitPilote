<template>
  <div class="section-validation-prono">
    <!-- 1. Option Joker -->
    <div class="joker-container" :class="{ 'joker-active': gridStore.joker, 'joker-locked': isLocked }">
      <label class="joker-label" for="check-joker">
        <input
          id="check-joker"
          type="checkbox"
          class="joker-checkbox"
          :checked="gridStore.joker"
          :disabled="isLocked"
          @change="gridStore.setJoker(($event.target as HTMLInputElement).checked)"
        />
        <div class="joker-text-group">
          <span id="joker-status-text" class="joker-title">
            🚀 Activer mon unique Joker (+300% de points !)
          </span>
          <span class="joker-desc">
            Triple tes points sur ce Grand Prix. Utilisable une seule fois dans la saison !
          </span>
        </div>
      </label>
    </div>

    <!-- 2. Statut de complétude du pronostic -->
    <div class="prono-status-card" :class="{ 'prono-complet': gridStore.estPronoComplet }">
      <div class="status-header">
        <div class="status-titre-wrap">
          <span class="status-icone">{{ gridStore.estPronoComplet ? '🎉' : '📋' }}</span>
          <span class="status-titre">
            {{ gridStore.estPronoComplet ? 'Pronostic 100% complet et prêt !' : 'Pronostic en cours de saisie' }}
          </span>
        </div>
        <span class="status-badge" :class="gridStore.estPronoComplet ? 'badge-vert' : 'badge-orange'">
          {{ nbEtapesCompletes }}/{{ totalEtapes }} sections prêtes
        </span>
      </div>

      <!-- Puces d'avancement des blocs de prono -->
      <div class="status-pills-list">
        <!-- Pole -->
        <div class="status-pill" :class="{ ok: gridStore.isPoleComplete, missing: !gridStore.isPoleComplete }">
          <span class="pill-icon">{{ gridStore.isPoleComplete ? '✅' : '⭕' }}</span>
          <span class="pill-label">Pôle Position</span>
          <span class="pill-val">{{ gridStore.isPoleComplete ? gridStore.poleman : 'Non choisie' }}</span>
        </div>

        <!-- Top 10 GP -->
        <div class="status-pill" :class="{ ok: gridStore.isTop10Complete, missing: !gridStore.isTop10Complete }">
          <span class="pill-icon">{{ gridStore.isTop10Complete ? '✅' : '⭕' }}</span>
          <span class="pill-label">Grille Top 10</span>
          <span class="pill-val">{{ gridStore.nbTop10Remplis }}/10</span>
        </div>

        <!-- Sprint Top 5 (si sprint) -->
        <div
          v-if="gridStore.sprintVisible"
          class="status-pill"
          :class="{ ok: gridStore.isSprintComplete, missing: !gridStore.isSprintComplete }"
        >
          <span class="pill-icon">{{ gridStore.isSprintComplete ? '✅' : '⭕' }}</span>
          <span class="pill-label">Sprint Top 5</span>
          <span class="pill-val">{{ gridStore.nbSprintRemplis }}/5</span>
        </div>

        <!-- Écuries Top/Flop -->
        <div class="status-pill" :class="{ ok: gridStore.isEcuriesComplete, missing: !gridStore.isEcuriesComplete }">
          <span class="pill-icon">{{ gridStore.isEcuriesComplete ? '✅' : '⭕' }}</span>
          <span class="pill-label">Écuries Top / Flop</span>
          <span class="pill-val">{{ gridStore.nbEcuriesRemplies }}/4</span>
        </div>

        <!-- Prédictions Bonus -->
        <div class="status-pill" :class="{ ok: gridStore.isBonusComplete, missing: !gridStore.isBonusComplete }">
          <span class="pill-icon">{{ gridStore.isBonusComplete ? '✅' : '⭕' }}</span>
          <span class="pill-label">Bonus Week-end</span>
          <span class="pill-val">{{ gridStore.nbBonusRemplis }}/4</span>
        </div>
      </div>

      <!-- Message d'aide si incomplet -->
      <div v-if="!gridStore.estPronoComplet && !isLocked" class="aide-manquants">
        <span class="aide-icon">💡</span>
        <span>
          <strong>À compléter :</strong> {{ gridStore.elementsManquants.join(" • ") }}
        </span>
      </div>
    </div>

    <!-- 3. Bouton principal de validation -->
    <div class="actions-validation">
      <button
        id="btn-valider"
        type="button"
        class="btn-action-validation"
        :class="{
          'btn-actif': gridStore.estPronoComplet && !isLocked && !isSaving,
          'btn-grise': !gridStore.estPronoComplet || isLocked || isSaving
        }"
        :disabled="!gridStore.estPronoComplet || isLocked || isSaving"
        @click="validerPronostics"
      >
        <span v-if="isSaving" class="loader-valider">⏳ ENREGISTREMENT EN COURS...</span>
        <span v-else-if="isLocked">🔒 PRONOSTICS CLÔTURÉS SUR CE GRAND PRIX</span>
        <span v-else-if="!gridStore.estPronoComplet">
          🔒 COMPLÈTE TOUS LES ÉLÉMENTS POUR VALIDER ({{ totalEtapes - nbEtapesCompletes }} restant{{ totalEtapes - nbEtapesCompletes > 1 ? 's' : '' }})
        </span>
        <span v-else>🏁 VALIDER MES PRONOSTICS</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { doc, setDoc } from "firebase/firestore";
import { useGridStore, useUserStore, useStatsStore } from "../stores";
import { getFirestore } from "../utils/firebase";
import { afficherNotification } from "../utils";
import { courseEstVerrouillee, estWeekendSprint, calculerStatistiquesEtClassement } from "../services";

const props = defineProps({
  isLocked: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["validated"]);

const gridStore = useGridStore();
const userStore = useUserStore();
const statsStore = useStatsStore();
const isSaving = ref(false);

const totalEtapes = computed(() => (gridStore.sprintVisible ? 5 : 4));

const nbEtapesCompletes = computed(() => {
  let count = 0;
  if (gridStore.isPoleComplete) count++;
  if (gridStore.isTop10Complete) count++;
  if (gridStore.sprintVisible) {
    if (gridStore.isSprintComplete) count++;
  }
  if (gridStore.isEcuriesComplete) count++;
  if (gridStore.isBonusComplete) count++;
  return count;
});

async function validerPronostics(): Promise<void> {
  const utilisateur = userStore.currentUser;
  if (!utilisateur) {
    afficherNotification("Tu dois être connecté pour enregistrer tes pronostics !", "erreur");
    return;
  }

  const courseId = gridStore.selectedCourse;

  if (courseEstVerrouillee(courseId)) {
    afficherNotification("🔒 Ce Grand Prix est déjà passé, les pronostics sont clôturés.", "erreur");
    return;
  }

  // Vérification rigoureuse de chaque bloc
  if (!gridStore.isPoleComplete) {
    afficherNotification("Il manque le choix du Poleman !", "erreur");
    return;
  }

  for (let i = 0; i < 10; i++) {
    if (!gridStore.top10[i]) {
      afficherNotification(`Il manque la position P${i + 1} du GP !`, "erreur");
      return;
    }
  }

  const aUnSprint = estWeekendSprint(courseId);
  if (aUnSprint) {
    for (let i = 0; i < 5; i++) {
      if (!gridStore.top5Sprint[i]) {
        afficherNotification(`Il manque la position S${i + 1} de la Course Sprint !`, "erreur");
        return;
      }
    }
  }

  if (gridStore.premiereEcurieManquante) {
    afficherNotification(`Il manque le choix "${gridStore.premiereEcurieManquante}" !`, "erreur");
    return;
  }

  if (!gridStore.isBonusComplete) {
    afficherNotification("Merci de répondre à toutes les questions bonus !", "erreur");
    return;
  }

  isSaving.value = true;
  try {
    const db = getFirestore();
    const pronoData: Record<string, any> = {
      uidJoueur: utilisateur.uid,
      pseudo: utilisateur.displayName || utilisateur.email || "Pilote",
      course: courseId,
      classementPilotes: [...gridStore.top10],
      classementSprint: aUnSprint ? [...gridStore.top5Sprint] : [],
      poleman: gridStore.poleman || "",
      ecuriesTop: [gridStore.ecuries["ecurie-top-1"] || "", gridStore.ecuries["ecurie-top-2"] || ""],
      ecuriesFlop: [gridStore.ecuries["ecurie-flop-1"] || "", gridStore.ecuries["ecurie-flop-2"] || ""],
      predictionsBonus: { ...gridStore.bonusPredictions },
      joker: !!gridStore.joker,
      dateModification: new Date()
    };

    const docId = `${utilisateur.uid}_${courseId.replace("/", "_")}`;
    await setDoc(doc(db, "pronostics", docId), pronoData, { merge: true });

    afficherNotification(
      aUnSprint
        ? "🏁 Grille GP, Course Sprint, Écuries et Bonus enregistrés avec succès !"
        : "🏁 Grille GP, Écuries et Bonus enregistrés avec succès !",
      "succes"
    );

    // Recalcul des stats générales en tâche de fond
    try {
      const stats = await calculerStatistiquesEtClassement(db);
      statsStore.setSeasonStats(stats);
    } catch (_) {}

    emit("validated");
  } catch (err: any) {
    console.error("Erreur lors de l'enregistrement des pronostics :", err);
    afficherNotification("Erreur lors de l'enregistrement de tes pronostics.", "erreur");
  } finally {
    isSaving.value = false;
  }
}
</script>

<style scoped>
.section-validation-prono {
  margin-top: 25px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

/* 1. Bloc Joker */
.joker-container {
  background: #182234;
  border: 1px dashed #ff8000;
  border-radius: 10px;
  padding: 14px 18px;
  transition: all 0.25s ease;
}

.joker-container.joker-active {
  background: rgba(255, 128, 0, 0.12);
  border: 1px solid #ff8000;
  box-shadow: 0 0 16px rgba(255, 128, 0, 0.2);
}

.joker-container.joker-locked {
  opacity: 0.6;
  pointer-events: none;
}

.joker-label {
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  user-select: none;
}

.joker-checkbox {
  width: 20px;
  height: 20px;
  accent-color: #ff8000;
  cursor: pointer;
  flex-shrink: 0;
}

.joker-text-group {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.joker-title {
  color: #ff8000;
  font-weight: 800;
  font-size: 0.95rem;
  letter-spacing: 0.3px;
}

.joker-desc {
  color: #94a3b8;
  font-size: 0.78rem;
}

/* 2. Statut Card */
.prono-status-card {
  background: #141b29;
  border: 1px solid #242f46;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.3s ease;
}

.prono-status-card.prono-complet {
  border-color: #00d2d3;
  background: linear-gradient(135deg, #141f2f 0%, #101a28 100%);
  box-shadow: 0 4px 18px rgba(0, 210, 211, 0.08);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.status-titre-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-icone {
  font-size: 1.1rem;
}

.status-titre {
  font-weight: 700;
  font-size: 0.95rem;
  color: #f1f5f9;
}

.status-badge {
  font-size: 0.78rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.status-badge.badge-orange {
  background: rgba(255, 128, 0, 0.15);
  color: #ff8000;
  border: 1px solid rgba(255, 128, 0, 0.35);
}

.status-badge.badge-vert {
  background: rgba(76, 209, 55, 0.18);
  color: #4cd137;
  border: 1px solid rgba(76, 209, 55, 0.4);
}

.status-pills-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 8px;
}

.status-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.82rem;
  transition: all 0.2s ease;
}

.status-pill.ok {
  background: rgba(76, 209, 55, 0.1);
  border: 1px solid rgba(76, 209, 55, 0.3);
  color: #d1fae5;
}

.status-pill.missing {
  background: #0f131c;
  border: 1px solid #28354d;
  color: #94a3b8;
}

.pill-icon {
  font-size: 0.85rem;
}

.pill-label {
  font-weight: 600;
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pill-val {
  font-weight: 800;
  font-size: 0.78rem;
  color: #cbd5e1;
  white-space: nowrap;
}

.status-pill.ok .pill-val {
  color: #4cd137;
}

.aide-manquants {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: rgba(255, 128, 0, 0.08);
  border-left: 3px solid #ff8000;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #fed7aa;
}

.aide-icon {
  font-size: 0.9rem;
}

/* 3. Bouton principal de validation */
.actions-validation {
  width: 100%;
}

.btn-action-validation {
  width: 100%;
  padding: 16px 24px;
  font-size: 1.05rem;
  font-weight: 900;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
}

.btn-action-validation.btn-actif {
  background: linear-gradient(135deg, #e10600 0%, #ff4d4d 50%, #b30500 100%);
  color: #ffffff;
  box-shadow: 0 6px 20px rgba(225, 6, 0, 0.35);
  cursor: pointer;
}

.btn-action-validation.btn-actif:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(225, 6, 0, 0.5);
  background: linear-gradient(135deg, #f01a14 0%, #ff6666 50%, #c40702 100%);
}

.btn-action-validation.btn-grise {
  background: #1c2436;
  color: #64748b;
  border: 1px solid #2c3a54;
  cursor: not-allowed;
  box-shadow: none;
}

.loader-valider {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
</style>
