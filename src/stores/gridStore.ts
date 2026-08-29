import { defineStore } from "pinia";
import { ref } from "vue";

export const useGridStore = defineStore("grid", () => {
  const top10 = ref<string[]>(Array(10).fill(""));
  const top5Sprint = ref<string[]>(Array(5).fill(""));
  const sprintVisible = ref(false);
  const isLocked = ref(false);

  // Écuries Top/Flop : clés fixes ecurie-top-1, ecurie-top-2, ecurie-flop-1, ecurie-flop-2
  const ecuries = ref<Record<string, string>>({
    "ecurie-top-1": "",
    "ecurie-top-2": "",
    "ecurie-flop-1": "",
    "ecurie-flop-2": ""
  });

  function setTop10(nouvelleSelection: string[]) {
    top10.value.splice(0, top10.value.length, ...nouvelleSelection);
  }

  function setTop5Sprint(nouvelleSelection: string[]) {
    top5Sprint.value.splice(0, top5Sprint.value.length, ...nouvelleSelection);
  }

  function setSprintVisible(valeur: boolean) {
    sprintVisible.value = valeur;
  }

  function setLocked(valeur: boolean) {
    isLocked.value = valeur;
  }

  function setEcurie(slotId: string, nomEcurie: string) {
    ecuries.value[slotId] = nomEcurie;
  }

  function setEcuries(nouvellesEcuries: { top?: string[]; flop?: string[] }) {
    ecuries.value["ecurie-top-1"] = nouvellesEcuries.top?.[0] || "";
    ecuries.value["ecurie-top-2"] = nouvellesEcuries.top?.[1] || "";
    ecuries.value["ecurie-flop-1"] = nouvellesEcuries.flop?.[0] || "";
    ecuries.value["ecurie-flop-2"] = nouvellesEcuries.flop?.[1] || "";
  }

  return {
    top10, setTop10,
    top5Sprint, setTop5Sprint,
    sprintVisible, setSprintVisible,
    isLocked, setLocked,
    ecuries, setEcurie, setEcuries
  };
});