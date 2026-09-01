<template>
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
    <select
      id="select-pole"
      :value="gridStore.poleman"
      :disabled="gridStore.isLocked"
      @change="gridStore.setPoleman(($event.target as HTMLSelectElement).value)"
    >
      <option value="">-- Sélectionne ton poleman --</option>
      <option v-for="p in pilotesData" :key="p.nom" :value="p.nom">{{ p.nom }} ({{ p.ecurie }})</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { pilotesData } from "../utils";
import { useGridStore } from "../stores";

const gridStore = useGridStore();
</script>