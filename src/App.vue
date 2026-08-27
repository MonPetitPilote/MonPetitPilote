<template>
  <NotificationsComponent />
  <div class="container">
    <Logo />
    <TopHeader
      @open-connection-modal="isConnectionModalOpen = true"
      @open-rules-modal="isRulesModalOpen = true"
    />
    <WorkspaceProfile />
    <MainContent @open-league-modal="isLeagueModalOpen = true" />
    <ConnectionModal
      v-show="isConnectionModalOpen"
      @close-connection-modal="isConnectionModalOpen = false"
    />
    <FriendModal />
    <LeagueModal
      v-show="isLeagueModalOpen"
      @close="isLeagueModalOpen = false"
    />
    <RulesModal
      v-show="isRulesModalOpen"
      @close="isRulesModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { onAuthStateChanged } from "firebase/auth";
import { getAuth } from "./utils/firebase";
import { useUserStore } from "./stores";
import ConnectionModal from "./components/ConnectionModal.vue";
import FriendModal from "./components/FriendModal.vue";
import LeagueModal from "./components/LeagueModal.vue";
import Logo from "./components/Logo.vue";
import MainContent from "./components/MainContent.vue";
import NotificationsComponent from "./components/NotificationsComponent.vue";
import RulesModal from "./components/RulesModal.vue";
import TopHeader from "./components/TopHeader.vue";
import WorkspaceProfile from "./components/WorkspaceProfile.vue";

const isConnectionModalOpen = ref(false);
const isLeagueModalOpen = ref(false);
const isRulesModalOpen = ref(false);

const userStore = useUserStore();
let unsubscribeAuth: (() => void) | null = null;

onMounted(() => {
  const auth = getAuth();
  unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
    userStore.setUser(firebaseUser);
  });
});

onUnmounted(() => {
  if (unsubscribeAuth) unsubscribeAuth();
});
</script>