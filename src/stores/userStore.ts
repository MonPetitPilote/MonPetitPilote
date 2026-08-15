import type { User } from "firebase/auth";
import { defineStore } from "pinia";
import { ref } from "vue";

// You can name the return value of `defineStore()` anything you want,
// but it's best to use the name of the store and surround it with `use`
// and `Store` (e.g. `useUserStore`, `useCartStore`, `useProductStore`)
// the first argument is a unique id of the store across your application
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
