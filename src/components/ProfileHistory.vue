<template>
  <div class="main-layout profil-layout">
    <!-- Analyse du GP sélectionné -->
    <div class="profil-analyse-col">
      <h3 class="col-titre-cyan">📊 Analyse du GP sélectionné</h3>
      <div id="profil-detail-gp" class="profil-detail-zone">
        <div v-if="chargementComparatif" class="message-attente">
          Chargement du comparatif...
        </div>
        <div v-else-if="comparatifHtml" v-html="comparatifHtml"></div>
        <p v-else class="message-attente">
          Sélectionnez un week-end ci-contre pour voir le détail de vos points.
        </p>
      </div>
    </div>

    <!-- Historique de la saison -->
    <div class="profil-historique-col">
      <h3 class="col-titre-orange">🕒 Historique de la saison</h3>
      <div class="tableau-scores">
        <div class="entete-scores" style="grid-template-columns: 1fr 100px;">
          <div>Grand Prix</div>
          <div style="text-align: right;">Points</div>
        </div>

        <div id="profil-liste-gps" class="liste-gps-conteneur">
          <div v-if="historiquePronos.length === 0" class="aucun-prono">
            Aucun prono enregistré pour le moment.
          </div>
          <div
            v-for="item in historiquePronos"
            :key="item.id"
            class="ligne-profil-gp"
            :class="{ actif: gpSelectionneId === item.id }"
            @click="selectionnerGP(item)"
          >
            <div class="gp-nom">🏎️ {{ item.nomAffichage }}</div>
            <div class="gp-points">{{ item.points }} pts</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { calendrier2026 } from "../utils";
import { construireComparatifHtml } from "../services";

const props = defineProps({
  db: {
    type: Object,
    default: null
  }
});

const historiquePronos = ref([]);
const gpSelectionneId = ref(null);
const comparatifHtml = ref("");
const chargementComparatif = ref(false);

async function chargerHistorique(dbInstance, uid) {
  if (!dbInstance || !uid) return;
  try {
    const querySnapshot = await dbInstance.collection("pronostics").where("uidJoueur", "==", uid).get();
    const liste = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      const courseIdString = data.course || "Inconnu";
      const roundNumero = courseIdString.includes('/') ? courseIdString.split('/')[1] : courseIdString;
      const gpInfo = calendrier2026.find(gp => gp.round === Number(roundNumero));
      const nomAffichage = gpInfo ? gpInfo.nom.toUpperCase() : `ROUND ${roundNumero}`;
      const points = (data.bilanCalcul && data.bilanCalcul.pointsTotaux) || 0;

      liste.push({
        id: doc.id,
        data,
        roundNumero,
        nomAffichage,
        points
      });
    });

    liste.sort((a, b) => Number(a.roundNumero) - Number(b.roundNumero));
    historiquePronos.value = liste;

    if (liste.length > 0 && !gpSelectionneId.value) {
      selectionnerGP(liste[liste.length - 1]);
    }
  } catch (error) {
    console.error("Erreur chargement historique profil :", error);
  }
}

async function selectionnerGP(item) {
  gpSelectionneId.value = item.id;
  chargementComparatif.value = true;
  try {
    if (props.db) {
      comparatifHtml.value = await construireComparatifHtml(props.db, item.data);
    }
  } catch (error) {
    console.error("Erreur construction comparatif :", error);
    comparatifHtml.value = `<p style="color:#ef4444;">Erreur lors du calcul du comparatif.</p>`;
  } finally {
    chargementComparatif.value = false;
  }
}

defineExpose({
  chargerHistorique,
  selectionnerGP
});
</script>

<style scoped>
.col-titre-cyan {
  margin-top: 0;
  color: #00d2d3;
  font-size: 1.1rem;
}

.col-titre-orange {
  margin-top: 0;
  color: #ff8000;
  font-size: 1.1rem;
}

.profil-detail-zone {
  background: #0f131c;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #2d3954;
  min-height: 200px;
}

.message-attente {
  color: #aaa;
  font-style: italic;
  text-align: center;
  padding: 20px 0;
}

.liste-gps-conteneur {
  max-height: 450px;
  overflow-y: auto;
}

.aucun-prono {
  padding: 15px;
  text-align: center;
  color: #aaa;
  font-style: italic;
}

.ligne-profil-gp {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid #1c2437;
  cursor: pointer;
  color: #fff;
  transition: background 0.2s ease;
}

.ligne-profil-gp:hover {
  background: #182234;
}

.ligne-profil-gp.actif {
  background: rgba(255, 128, 0, 0.12);
  border-left: 3px solid #ff8000;
}

.gp-nom {
  font-weight: bold;
}

.gp-points {
  text-align: right;
  color: #4cd137;
  font-weight: bold;
}
</style>
