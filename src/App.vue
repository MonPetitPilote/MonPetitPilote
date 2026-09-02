<template>
  <NotificationsComponent />
  <div class="container">
    <Logo @vers-pronos="workspaceProfileRef?.basculerVersPronos()" />
    <TopHeader
      @open-connection-modal="isConnectionModalOpen = true"
      @open-rules-modal="isRulesModalOpen = true"
      @open-ranking-modal="isRankingModalOpen = true"
      @vers-profil="workspaceProfileRef?.basculerVersProfil()"
    />
    <AnecdoteDuJour v-if="userStore.currentUser" />
    <WorkspaceProfile ref="workspaceProfileRef" />
    <MainContent v-show="!workspaceProfileRef?.profilVisible" @open-league-modal="isLeagueModalOpen = true" />
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
    <RankingModal
      v-show="isRankingModalOpen"
      @close="isRankingModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { onAuthStateChanged } from "firebase/auth";
import { getAuth } from "./utils/firebase";
import { useUserStore } from "./stores";
import AnecdoteDuJour from "./components/AnecdoteDuJour.vue";
import ConnectionModal from "./components/ConnectionModal.vue";
import FriendModal from "./components/FriendModal.vue";
import LeagueModal from "./components/LeagueModal.vue";
import Logo from "./components/Logo.vue";
import MainContent from "./components/MainContent.vue";
import NotificationsComponent from "./components/NotificationsComponent.vue";
import RankingModal from "./components/RankingModal.vue";
import RulesModal from "./components/RulesModal.vue";
import TopHeader from "./components/TopHeader.vue";
import WorkspaceProfile from "./components/WorkspaceProfile.vue";

const isConnectionModalOpen = ref(false);
const isLeagueModalOpen = ref(false);
const isRulesModalOpen = ref(false);
const isRankingModalOpen = ref(false);
const workspaceProfileRef = ref<InstanceType<typeof WorkspaceProfile> | null>(null);

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