<template>
  <div
    id="modale-classement-general"
    class="modal-back"
    @click.self="$emit('close')"
  >
    <div
      style="
        background: #1f293d;
        padding: 24px;
        border-radius: 12px;
        max-width: 520px;
        width: 92%;
        max-height: 85vh;
        overflow-y: auto;
        border: 1px solid #2f3e56;
        color: #fff;
        position: relative;
        font-family: sans-serif;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        box-sizing: border-box;
      "
    >
      <button
        id="btn-fermer-classement"
        style="
          position: absolute;
          top: 15px;
          right: 15px;
          background: transparent;
          border: none;
          color: #a5b1c2;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 4px;
        "
        @click="$emit('close')"
      >
        ❌
      </button>

      <h3
        style="
          color: #ff8000;
          margin-top: 0;
          font-size: 1.3rem;
          border-bottom: 2px solid #2f3e56;
          padding-bottom: 10px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        "
      >
        📊 CLASSEMENT GÉNÉRAL
      </h3>

      <p
        style="
          margin: 0 0 14px 0;
          font-size: 0.8rem;
          color: #a0aec0;
          font-style: italic;
          line-height: 1.3;
        "
      >
        💡 Cliquez sur un joueur pour voir son pronostic sur le GP sélectionné (visible une fois la course verrouillée).
      </p>

      <div class="tableau-scores" style="border: 1px solid #2d3954; border-radius: 8px; overflow: hidden; background: #0f131c;">
        <div class="entete-scores" style="background: #242f46; padding: 12px; font-weight: 700; font-size: 0.85rem; color: #a5b1c2; display: grid; grid-template-columns: 45px 1fr 75px;">
          <div>Pos</div>
          <div>Joueur</div>
          <div style="text-align: right;">Points</div>
        </div>

        <div id="liste-classement-modale">
          <div
            v-if="!statsStore.seasonStats"
            style="color: #616e88; padding: 16px; text-align: center;"
          >
            Calcul du classement général...
          </div>
          <div
            v-else-if="listeJoueurs.length === 0"
            style="color: #616e88; padding: 16px; text-align: center;"
          >
            Aucun pronostic enregistré sur la saison.
          </div>
          <div
            v-for="(u, index) in listeJoueurs"
            :key="u.uid"
            style="
              display: grid;
              grid-template-columns: 45px 1fr 75px;
              padding: 12px;
              border-bottom: 1px solid #1c2437;
              align-items: center;
              color: #fff;
              cursor: pointer;
              transition: background 0.2s ease;
            "
            @click="voirProno(u)"
          >
            <div>
              <strong :style="{ color: getRankColor(index) }">
                #{{ index + 1 }}
              </strong>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              <span style="font-weight: 600;">{{ u.pseudo }}</span>
              <span v-html="badgesHtmlPourJoueur(u.uid, statsStore.seasonStats?.badges)"></span>
            </div>
            <div style="text-align: right; font-weight: bold; color: #ff8000;">
              {{ u.points }} pts
            </div>
          </div>
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

const emit = defineEmits(["close"]);

const statsStore = useStatsStore();
const gridStore = useGridStore();
const db = getFirestore();

const listeJoueurs = computed(() => statsStore.seasonStats?.joueurs || []);

function getRankColor(index: number): string {
  if (index === 0) return "#ff8000"; // 1er Or/Orange
  if (index === 1) return "#00d2d3"; // 2e Cyan
  if (index === 2) return "#4cd137"; // 3e Vert
  return "#616e88";
}

function voirProno(u: { uid: string; pseudo: string }) {
  const courseId = gridStore.selectedCourse;
  voirPronoJoueur(db, u.uid, u.pseudo, courseId, courseEstVerrouillee(courseId));
  emit("close");
}
</script>
