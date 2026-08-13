<template>
  <div id="grille-pronos" class="f1-starting-grid">
    <GridSlot v-for="i in 10" :position="i" />
  </div>
</template>

<script setup lang="js">
import GridSlot from "./startingGrid/GridSlot.vue";
</script>

<style scoped lang="css">
@media (max-width: 576px) {
  #grille-pronos {
    display: block !important;
    width: 100% !important;
  }
}
</style>
