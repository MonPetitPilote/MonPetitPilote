<template>
  <div id="conteneur-notifications"></div>
  <div class="container">
    <Logo />
    <TopHeader />
    <WorkspaceProfile />
    <QuoteComponent />
    <MainContent />
    <ConnectionModal />
    <ResultsModal />
    <FriendModal />
    <LeagueModal />
    <RulesModal />
  </div>
</template>

<script setup lang="js">
import ConnectionModal from "./components/ConnectionModal.vue";
import FriendModal from "./components/FriendModal.vue";
import FriendsRanking from "./components/FriendsRanking.vue";
import LeagueModal from "./components/LeagueModal.vue";
import Logo from "./components/Logo.vue";
import MainContent from "./components/MainContent.vue";
import QuoteComponent from "./components/QuoteComponent.vue";
import ResultsModal from "./components/ResultsModal.vue";
import RulesModal from "./components/RulesModal.vue";
import TopHeader from "./components/TopHeader.vue";
import WorkspaceProfile from "./components/WorkspaceProfile.vue";
</script>
