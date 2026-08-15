import type { User } from "firebase/auth";
import { defineStore } from "pinia";
import { ref } from "vue";

type UserForecast = {
  classementPilotes: string[];
  poleman: string;
  ecuriesTop: string[];
  ecuriesFlop: string[];
  predictionsBonus: any;
}
export const useUserStore = defineStore("user", () => {
  const currentUser = ref<User | null>(null);
  const userForecast = ref<UserForecast>();
  const selectedRace = ref("");

  function setUser(user: User | null) {
    currentUser.value = user;
  }

  function setForecast(forecast: UserForecast) {
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
