import { defineStore } from "pinia";
import { ref } from "vue";

export const useGridStore = defineStore("grid", () => {
  const top10 = ref<string[]>(Array(10).fill(""));
  const top5Sprint = ref<string[]>(Array(5).fill(""));
  const sprintVisible = ref(false);

  function setTop10(nouvelleSelection: string[]) {
    top10.value.splice(0, top10.value.length, ...nouvelleSelection);
  }

  function setTop5Sprint(nouvelleSelection: string[]) {
    top5Sprint.value.splice(0, top5Sprint.value.length, ...nouvelleSelection);
  }

  function setSprintVisible(valeur: boolean) {
    sprintVisible.value = valeur;
  }

  return { top10, setTop10, top5Sprint, setTop5Sprint, sprintVisible, setSprintVisible };
});