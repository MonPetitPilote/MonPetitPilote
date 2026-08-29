<template>
  <div id="main-content-pronos" class="main-layout">
    <div class="colonne-gauche">
      <div
        class="section-ligue"
        style="
          margin-bottom: 18px;
          background: #1b2436;
          padding: 14px;
          border-radius: 8px;
          border-left: 4px solid #ff8000;
        "
      >
        <label
          for="select-ligue"
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
            font-weight: bold;
            font-size: 0.9rem;
            color: #ff8000;
          "
        >
          <span>🏆 MA LIGUE ACTIVE :</span>
          <button
            id="btn-gerer-ligues"
            type="button"
            style="
              background: #3b4b6b;
              color: white;
              border: none;
              padding: 5px 10px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 0.75rem;
              font-weight: bold;
            "
            @click="$emit('open-league-modal')"
          >
            ⚙️ CRÉER / REJOINDRE
          </button>
        </label>
        <select
          id="select-ligue"
          style="width: 100%; box-sizing: border-box"
        ></select>
      </div>

      <div class="section-course">
        <label
          for="select-course"
          style="display: block; margin-bottom: 8px; font-weight: bold"
          >SÉLECTIONNER LE WEEK-END :</label
        >
        <select id="select-course"></select>
      </div>

      <div
        id="banniere-verrouillage"
        style="
          display: none;
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
        "
      >
        🔒 Les pronostics pour ce Grand Prix sont clôturés (le week-end a déjà
        eu lieu).
      </div>

      <div id="countdown-pronos" style="display: none"></div>

      <div
        class="section-pole"
        style="
          margin-top: 20px;
          background: #222c43;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #00d2d3;
        "
      >
        <label
          for="select-pole"
          style="
            color: #00d2d3;
            display: block;
            font-weight: bold;
            margin-bottom: 8px;
            font-size: 0.9rem;
          "
          >⚡ PRONO FLASH : QUI FERA LA POLE POSITION LE SAMEDI ?</label
        >
        <select id="select-pole"></select>
      </div>

      <SprintGrid v-show="gridStore.sprintVisible" />

      <StartingGrid ref="startingGridRef" />

      <div
        style="
          margin: 20px 0;
          background: #1b2436;
          padding: 12px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px dashed #ff8000;
        "
      >
        <input
          type="checkbox"
          id="check-joker"
          style="transform: scale(1.4); cursor: pointer; flex-shrink: 0"
        />
        <span
          id="joker-status-text"
          style="color: #ff8000; font-weight: bold; font-size: 0.9rem"
          >🚀 Activer mon unique Joker (+300% de points !)</span
        >
      </div>

      <button id="btn-valider">🏁 VALIDER MES PRONOSTICS</button>
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
  </div>
</template>

<script setup lang="ts">
import FriendsRanking from "./FriendsRanking.vue";
import StartingGrid from "./StartingGrid.vue";
import SprintGrid from "./SprintGrid.vue";
import TeamPicker from "./TeamPicker.vue";
import BonusPredictions from "./BonusPredictions.vue";
import { ref } from "vue";
import { useGridStore } from "../stores";

const gridStore = useGridStore();
const startingGridRef = ref<InstanceType<typeof StartingGrid> | null>(null);

defineExpose({ startingGridRef });

defineEmits(["open-league-modal"]);
</script>