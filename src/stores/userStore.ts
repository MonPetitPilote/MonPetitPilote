import type { User } from "firebase/auth";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore("user", () => {
  const currentUser = ref<User | null>(null);
  const userForecast = ref<string[]>([]);
  const selectedRace = ref("");

  function setUser(user: User | null) {
    currentUser.value = user;
  }

  function setForecast(forecast: string[]) {
    userForecast.value = forecast;
  }

  function setSelectedRace(race: string) {
    selectedRace.value = race;
  }
  return {
    currentUser,
    setUser,
    setForecast,
    userForecast,
    setSelectedRace,
    selectedRace,
  };
});
