import { defineStore } from "pinia";
import { ref } from "vue";

export const useGridStore = defineStore("grid", () => {
  const top10 = ref<string[]>(Array(10).fill(""));

  function setTop10(nouvelleSelection: string[]) {
    top10.value.splice(0, top10.value.length, ...nouvelleSelection);
  }

  return { top10, setTop10 };
});