<template>
  <NotificationsComponent />
  <div class="container">
    <Logo />
    <TopHeader @open-connection-modal="isConnectionModalOpen = true" />
    <WorkspaceProfile />
    <MainContent />
    <ConnectionModal v-show="isConnectionModalOpen" @close-connection-modal="isConnectionModalOpen = false"/>
    <FriendModal />
    <LeagueModal />
    <RulesModal />
  </div>
</template>

<script setup lang="js">
import { ref } from "vue";
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
</script>
