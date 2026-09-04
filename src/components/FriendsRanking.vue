<template>
  <div class="bloc-sub-droite bloc-classement-amis">
    <h2>📊 CLASSEMENT GÉNÉRAL DES AMIS :</h2>
    <p style="margin:0 0 10px 0; font-size:0.8rem; color:#aaa; font-style:italic;">
      💡 Cliquez sur un joueur pour voir son pronostic sur le GP sélectionné ci-contre (visible une fois le week-end terminé).
    </p>
    <div class="tableau-scores">
      <div class="entete-scores">
        <div>Pos</div>
        <div>Joueur</div>
        <div style="text-align: right;">Points</div>
      </div>
      <div id="liste-classement">
        <div v-if="!statsStore.seasonStats" style="color:#616e88; padding:10px;">
          Calcul du classement général...
        </div>
        <div v-else-if="top5.length === 0" style="color:#616e88; padding:10px; text-align:center;">
          Aucun pronostic enregistré sur la saison.
        </div>
        <div
          v-for="(u, index) in top5"
          :key="u.uid"
          style="display:grid; grid-template-columns:50px 1fr 80px; padding:12px; border-bottom:1px solid #1c2437; align-items:center; color:#fff; cursor:pointer;"
          @click="voirProno(u)"
        >
          <div><strong :style="{ color: index === 0 ? '#ff8000' : '#616e88' }">#{{ index + 1 }}</strong></div>
          <div>{{ u.pseudo }}<span v-html="badgesHtmlPourJoueur(u.uid, statsStore.seasonStats?.badges)"></span></div>
          <div style="text-align: right; font-weight: bold; color: #ff8000;">{{ u.points }} pts</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStatsStore, useGridStore } from "../stores";
import { getFirestore } from "../utils/firebase";
import { badgesHtmlPourJoueur, voirPronoJoueur, courseEstVerrouillee } from "../services";

const statsStore = useStatsStore();
const gridStore = useGridStore();
const db = getFirestore();

const top5 = computed(() => (statsStore.seasonStats?.joueurs || []).slice(0, 5));

function voirProno(u: { uid: string; pseudo: string }) {
  const courseId = gridStore.selectedCourse;
  voirPronoJoueur(db, u.uid, u.pseudo, courseId, courseEstVerrouillee(courseId));
}
</script>

<style scoped>
@media (max-width: 1024px) {
  .bloc-classement-amis {
    display: none !important;
  }
}
</style>