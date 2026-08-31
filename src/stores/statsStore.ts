import { defineStore } from "pinia";
import { ref } from "vue";
import type { StatistiquesSaison } from "../utils";

export const useStatsStore = defineStore("stats", () => {
  const seasonStats = ref<StatistiquesSaison | null>(null);

  function setSeasonStats(stats: StatistiquesSaison | null) {
    seasonStats.value = stats;
  }

  return { seasonStats, setSeasonStats };
});
