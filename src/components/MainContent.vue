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

      <!-- Section Écuries Top / Flop déplacée sous la grille Top 10 -->
      <div
        class="section-top-flop"
        style="
          margin-top: 22px;
          background: linear-gradient(135deg, #111726 0%, #172036 100%);
          padding: 20px 24px;
          border-radius: 14px;
          border: 1px solid #283752;
          border-left: 5px solid #e10600;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
        "
      >
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 16px;
          "
        >
          <h3
            style="
              margin: 0;
              color: #fff;
              font-size: 1.15rem;
              font-weight: 800;
              letter-spacing: 0.5px;
              display: flex;
              align-items: center;
              gap: 8px;
            "
          >
            🏎️ PRONOSTIC ÉCURIES (TOP / FLOP)
          </h3>
          <span
            style="
              font-size: 11px;
              color: #a5b1c2;
              background: rgba(255, 255, 255, 0.06);
              padding: 4px 10px;
              border-radius: 6px;
              font-weight: 600;
            "
          >
            2 écuries Top &amp; 2 écuries Flop
          </span>
        </div>

        <div
          class="ecuries-block"
          style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 16px;
          "
        >
          <!-- Top Écuries -->
          <div
            style="
              background: rgba(0, 230, 195, 0.04);
              border: 1px solid rgba(0, 230, 195, 0.22);
              border-radius: 10px;
              padding: 14px;
            "
          >
            <div
              style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 10px;
              "
            >
              <h4
                style="
                  color: #00e6c3;
                  font-size: 13px;
                  font-weight: 800;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                  margin: 0;
                  display: flex;
                  align-items: center;
                  gap: 6px;
                "
              >
                🚀 Top Écuries (Bonus)
              </h4>
              <span
                style="
                  font-size: 10px;
                  font-weight: 700;
                  color: #00e6c3;
                  background: rgba(0, 230, 195, 0.15);
                  padding: 2px 7px;
                  border-radius: 4px;
                "
              >
                + POINTS
              </span>
            </div>
            <div
              style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px"
            >
              <TeamPicker slot-id="ecurie-top-1" :is-locked="gridStore.isLocked" />
              <TeamPicker slot-id="ecurie-top-2" :is-locked="gridStore.isLocked" />
            </div>
          </div>

          <!-- Flop Écuries -->
          <div
            style="
              background: rgba(239, 68, 68, 0.04);
              border: 1px solid rgba(239, 68, 68, 0.22);
              border-radius: 10px;
              padding: 14px;
            "
          >
            <div
              style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 10px;
              "
            >
              <h4
                style="
                  color: #ef4444;
                  font-size: 13px;
                  font-weight: 800;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                  margin: 0;
                  display: flex;
                  align-items: center;
                  gap: 6px;
                "
              >
                ⚠️ Flop Écuries (Malus)
              </h4>
              <span
                style="
                  font-size: 10px;
                  font-weight: 700;
                  color: #ef4444;
                  background: rgba(239, 68, 68, 0.15);
                  padding: 2px 7px;
                  border-radius: 4px;
                "
              >
                MALUS
              </span>
            </div>
            <div
              style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px"
            >
              <TeamPicker slot-id="ecurie-flop-1" :is-locked="gridStore.isLocked" />
              <TeamPicker slot-id="ecurie-flop-2" :is-locked="gridStore.isLocked" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="colonne-droite"
      style="display: flex; flex-direction: column; gap: 30px"
    >
      <FriendsRanking />
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