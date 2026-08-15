<template>
  <NotificationsComponent />
  <div class="container">
    <Logo />
    <TopHeader @open-connection-modal="isConnectionModalOpen = true" />
    <WorkspaceProfile />
    <MainContent />
    <ConnectionModal
      v-show="isConnectionModalOpen"
      @close-connection-modal="isConnectionModalOpen = false"
    />
    <FriendModal />
    <LeagueModal />
    <RulesModal />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onAuthStateChanged } from "firebase/auth";
import ConnectionModal from "./components/ConnectionModal.vue";
import FriendModal from "./components/FriendModal.vue";
import LeagueModal from "./components/LeagueModal.vue";
import Logo from "./components/Logo.vue";
import MainContent from "./components/MainContent.vue";
import NotificationsComponent from "./components/NotificationsComponent.vue";
import RulesModal from "./components/RulesModal.vue";
import TopHeader from "./components/TopHeader.vue";
import WorkspaceProfile from "./components/WorkspaceProfile.vue";
import { getAuth } from "./utils/firebase.ts";
import { loadForecast } from "./services/users.ts";
import { useUserStore } from "./stores/userStore.ts";

const isConnectionModalOpen = ref(false);
const store = useUserStore()

onAuthStateChanged(getAuth(), (user) => {
  if (user) {
    store.setUser(user)
    loadForecast(user)
  }
});
</script>
