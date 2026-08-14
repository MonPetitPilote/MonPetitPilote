<template>
  <div class="section-course">
    <label
      for="select-course"
      style="display: block; margin-bottom: 8px; font-weight: bold"
      >SÉLECTIONNER LE WEEK-END :</label
    >
    <select
      id="select-course"
      @change="handleSelectedRace"
      v-html="options"
    ></select>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "../stores/userStore.ts";
import { calendrier2026 } from "../utils/data.ts";
const store = useUserStore();

function handleSelectedRace(event: Event) {
  store.setSelectedRace((<HTMLSelectElement>event.target).value);
}

const aujourdhui = new Date();
let prochainRoundValue = "2026/1";
let roundTrouve = false;
let options: string[] = [];
calendrier2026.forEach((gp) => {
  const dateObj = new Date(gp.date);
  const dateFormatee = dateObj.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const isSelected = isNextRound();
  const innerText = `Round ${gp.round} : ${gp.nom} - ${gp.circuit} (${gp.pays}) — 📅 ${dateFormatee}`;
  const optionHtml = `<option value="2026/${gp.round}" ${isSelected ? "selected" : ""}>${innerText}</option>`;
  options.push(optionHtml);
  function isNextRound() {
    if (!roundTrouve && dateObj >= aujourdhui) {
      prochainRoundValue = `2026/${gp.round}`;
      store.setSelectedRace(prochainRoundValue);
      roundTrouve = true;
      return true;
    }
  }
});
</script>
