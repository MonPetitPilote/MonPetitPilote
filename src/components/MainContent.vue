<template>
  <div id="main-content-pronos" class="main-layout">
    <div class="colonne-gauche">
      <RaceSelector
        :selected-course="gridStore.selectedCourse"
        @update:selected-course="gridStore.setSelectedCourse($event)"
        :active-league="gridStore.activeLeague"
        @update:active-league="gridStore.setActiveLeague($event)"
        :leagues-list="gridStore.leaguesList"
        @open-league-modal="$emit('open-league-modal')"
        @lock-change="gridStore.setLocked($event)"
      />

      <PolePicker />
      <SprintGrid v-show="gridStore.sprintVisible" />
      <StartingGrid ref="startingGridRef" />
    </div>

    <div
      class="colonne-droite"
      style="display: flex; flex-direction: column; gap: 30px"
    >
      <FriendsRanking />
      <div
        class="section-top-flop"
        style="
          background: #222c43;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #e10600;
        "
      >
        <h3
          style="
            margin-top: 0;
            color: #fff;
            font-size: 1.1rem;
            letter-spacing: 0.5px;
          "
        >
          🏎️ PRONOSTIC ÉCURIES (TOP / FLOP)
        </h3>
        <div
          class="ecuries-block"
          style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-top: 15px;
          "
        >
          <div>
            <h4
              style="
                color: #00e6c3;
                font-size: 13px;
                text-transform: uppercase;
                margin-bottom: 8px;
              "
            >
              🚀 Top Écuries (Bonus)
            </h4>
            <div
              style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px"
            >
              <TeamPicker slot-id="ecurie-top-1" :is-locked="gridStore.isLocked" />
              <TeamPicker slot-id="ecurie-top-2" :is-locked="gridStore.isLocked" />
            </div>
          </div>

          <div>
            <h4
              style="
                color: #ef4444;
                font-size: 13px;
                text-transform: uppercase;
                margin-bottom: 8px;
              "
            >
              ⚠️ Flop Écuries (Malus)
            </h4>
            <div
              style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px"
            >
              <TeamPicker slot-id="ecurie-flop-1" :is-locked="gridStore.isLocked" />
              <TeamPicker slot-id="ecurie-flop-2" :is-locked="gridStore.isLocked" />
            </div>
          </div>
        </div>
      </div>
      <BonusPredictions :is-locked="gridStore.isLocked" />
    </div>

    <!-- Section Validation : Positionnée après tous les blocs de pronos (sur PC comme sur Mobile) -->
    <div class="section-validation-complete">
      <ValidationButton :is-locked="gridStore.isLocked" />
    </div>
  </div>
</template>

<script setup lang="ts">
import FriendsRanking from "./FriendsRanking.vue";
import StartingGrid from "./StartingGrid.vue";
import SprintGrid from "./SprintGrid.vue";
import TeamPicker from "./TeamPicker.vue";
import BonusPredictions from "./BonusPredictions.vue";
import RaceSelector from "./RaceSelector.vue";
import PolePicker from "./PolePicker.vue";
import ValidationButton from "./ValidationButton.vue";
import { ref } from "vue";
import { useGridStore } from "../stores";

const gridStore = useGridStore();
const startingGridRef = ref<InstanceType<typeof StartingGrid> | null>(null);

defineExpose({ startingGridRef });

defineEmits(["open-league-modal"]);
</script>

<style scoped>
.section-validation-complete {
  grid-column: 1 / -1;
  width: 100%;
}
</style>