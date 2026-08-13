<template>
  <div id="grille-pronos" class="f1-starting-grid">
    <GridSlot
      v-for="i in 10"
      :position="i"
      :selectedDrivers="selectedDrivers"
      @selected-driver="handleSelectedDriver"
    />
  </div>
</template>

<script setup lang="js">
import { ref } from "vue";
import GridSlot from "./startingGrid/GridSlot.vue";

const selectedDrivers = ref(new Set());

function handleSelectedDriver({ added, removed }) {
  if (added) {
    selectedDrivers.value.add(added);
  }
  selectedDrivers.value.delete(removed);
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
