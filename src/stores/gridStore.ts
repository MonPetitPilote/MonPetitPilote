import { defineStore } from "pinia";
import { ref, reactive, computed } from "vue";
import { CODE_LIGUE_MONDIAL, getCalendrierActuel } from "../services";

const LABELS_ECURIES: Record<string, string> = {
  "ecurie-top-1": "Écurie Top 1",
  "ecurie-top-2": "Écurie Top 2",
  "ecurie-flop-1": "Écurie Flop 1",
  "ecurie-flop-2": "Écurie Flop 2"
};

function calculerProchainGP(): string {
  const aujourdhui = new Date();
  const calendrier = getCalendrierActuel();
  const prochain = calendrier.find(gp => new Date(gp.date) >= aujourdhui && gp.statut !== 'annule');
  return prochain ? `2026/${prochain.round}` : "2026/1";
}

export const useGridStore = defineStore("grid", () => {
  const top10 = ref<string[]>(Array(10).fill(""));
  const top5Sprint = ref<string[]>(Array(5).fill(""));
  const sprintVisible = ref(false);
  const isLocked = ref(false);
  const selectedCourse = ref(calculerProchainGP());
  const activeLeague = ref(CODE_LIGUE_MONDIAL);
  const poleman = ref("");
  const leaguesList = ref<Array<{ code: string; nom: string }>>([{ code: CODE_LIGUE_MONDIAL, nom: "🌍 Mondial" }]);

  const ecuries = ref<Record<string, string>>({
    "ecurie-top-1": "",
    "ecurie-top-2": "",
    "ecurie-flop-1": "",
    "ecurie-flop-2": ""
  });

  const bonusPredictions = reactive<{
    safetyCar: boolean | null;
    drapeauRouge: boolean | null;
    nombreDNF: number | null;
    polemanPodium: boolean | null;
  }>({
    safetyCar: null,
    drapeauRouge: null,
    nombreDNF: null,
    polemanPodium: null
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

  function setSelectedCourse(courseId: string) {
    selectedCourse.value = courseId;
  }

  function setActiveLeague(code: string) {
    activeLeague.value = code;
  }

  function setPoleman(nom: string) {
    poleman.value = nom;
  }

  function setLeaguesList(nouvelleListe: Array<{ code: string; nom: string }>) {
    leaguesList.value = nouvelleListe;
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

  const premiereEcurieManquante = computed<string | null>(() => {
    for (const slotId of Object.keys(LABELS_ECURIES)) {
      if (!ecuries.value[slotId]) return LABELS_ECURIES[slotId];
    }
    return null;
  });

  function setBonusPredictions(donnees?: Partial<typeof bonusPredictions> | null) {
    const d = donnees || {};
    bonusPredictions.safetyCar = d.safetyCar !== undefined ? d.safetyCar : null;
    bonusPredictions.drapeauRouge = d.drapeauRouge !== undefined ? d.drapeauRouge : null;
    bonusPredictions.nombreDNF = (d.nombreDNF !== undefined && d.nombreDNF !== null) ? Number(d.nombreDNF) : null;
    bonusPredictions.polemanPodium = d.polemanPodium !== undefined ? d.polemanPodium : null;
  }

  return {
    top10, setTop10,
    top5Sprint, setTop5Sprint,
    sprintVisible, setSprintVisible,
    isLocked, setLocked,
    selectedCourse, setSelectedCourse,
    poleman, setPoleman,
    activeLeague, setActiveLeague,
    leaguesList, setLeaguesList,
    ecuries, setEcurie, setEcuries, premiereEcurieManquante,
    bonusPredictions, setBonusPredictions
  };
});