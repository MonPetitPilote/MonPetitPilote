<template>
  <div
    style="
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 25px;
      flex-wrap: wrap;
      gap: 10px;
    "
  >
    <h2 style="margin: 0; font-size: 1.3rem" id="titre-grille">
      🏆 TA GRILLE DE DÉPART TOP 10 :
    </h2>
    <button
      id="btn-aleatoire"
      style="
        background: #3b4b6b;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.85rem;
        font-weight: bold;
        transition: background 0.2s;
      "
      @click="buildRandomGrid"
    >
      🎲 PRONO ALÉATOIRE
    </button>
  </div>
  <div id="grille-pronos" class="f1-starting-grid">
    <GridSlot
      v-for="i in 10"
      :position="i"
      :selectedDrivers="selectedDrivers"
      :initDriver="initDrivers[i]"
      @selected-driver="handleSelectedDriver"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import GridSlot from "./startingGrid/GridSlot.vue";
import { drivers } from "../utils/data.js";
import { useUserStore } from "../stores/userStore.ts";

const store = useUserStore();

store.$subscribe((mutation, state) => {
  if (state.userForecast.length > 0) {
    initDrivers.value = state.userForecast;
  }
});

const selectedDrivers = ref(new Set());
const initDrivers = ref(Array(10).fill(""));

function handleSelectedDriver({
  added,
  removed,
}: {
  added: string;
  removed: string;
}) {
  if (added) {
    selectedDrivers.value.add(added);
  }
  selectedDrivers.value.delete(removed);
}

function buildRandomGrid() {
  const randomDrivers = [...drivers].sort(() => 0.5 - Math.random());
  const randomDriverNames = randomDrivers.map((driver) => driver.name);
  initDrivers.value = randomDriverNames.slice(0, 11);
}
</script>

<style scoped lang="css">
@media (max-width: 576px) {
  #grille-pronos {
    display: block !important;
    width: 100% !important;
  }
}
</style>
