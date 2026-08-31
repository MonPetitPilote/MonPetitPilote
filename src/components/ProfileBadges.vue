<template>
  <div id="profil-badges" class="profil-badges-conteneur">
    <h3 class="titre-badges">
      🎖️ Vos badges de la saison
    </h3>
    <p class="description-badges">
      Un badge s'obtient en étant, à date, le joueur (ou l'un des joueurs) en tête sur ce critère. Il peut donc changer de mains au fil de la saison.
    </p>

    <div id="profil-badges-liste" class="grille-mes-badges">
      <div
        v-for="(info, cle) in BADGES_INFO"
        :key="cle"
        class="tuile-badge"
        :class="{ possede: aLeBadge(cle) }"
        :title="info.description"
      >
        <div class="icone-badge">{{ info.icone }}</div>
        <div class="nom-badge">{{ info.nom }}</div>
        <div class="compteur-badge">{{ getMonCompteur(cle) }}</div>
      </div>
    </div>

    <h3 class="titre-classement-badges">
      🏅 Qui est en tête sur chaque critère ?
    </h3>
    <p class="description-badges">
      Le classement complet, badge par badge — de quoi savoir qui est devant qui, et grâce à quoi.
    </p>

    <div id="profil-classement-badges" class="grille-classement-badges">
      <div
        v-for="(info, cle) in BADGES_INFO"
        :key="`classement-${cle}`"
        class="carte-classement-badge"
      >
        <div class="entete-carte-badge">
          {{ info.icone }} {{ info.nom }}
        </div>
        <div class="liste-joueurs-badge">
          <div
            v-if="getTop3Badge(cle).length === 0"
            class="badge-vide"
          >
            Personne pour l'instant.
          </div>
          <div
            v-for="(j, idx) in getTop3Badge(cle)"
            :key="j.uid"
            class="ligne-joueur-badge"
            :class="{ estMoi: currentUser && j.uid === currentUser.uid }"
          >
            <span>{{ idx + 1 }}. {{ j.pseudo }}{{ currentUser && j.uid === currentUser.uid ? ' (vous)' : '' }}</span>
            <span class="valeur-stat">{{ j[BADGES_STAT_KEY[cle]] }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { BADGES_INFO } from "../utils";
import { BADGES_STAT_KEY } from "../services";

const props = defineProps({
  currentUser: {
    type: Object,
    default: null
  },
  seasonStats: {
    type: Object,
    default: () => ({ joueurs: [], badges: {} })
  }
});

const monJoueur = computed(() => {
  if (!props.currentUser || !props.seasonStats?.joueurs) return null;
  return props.seasonStats.joueurs.find(j => j.uid === props.currentUser.uid) || null;
});

function aLeBadge(cle) {
  if (!monJoueur.value || !props.seasonStats?.badges?.[cle]) return false;
  return props.seasonStats.badges[cle].includes(monJoueur.value.uid);
}

function getMonCompteur(cle) {
  if (!monJoueur.value) return 0;
  const statKey = BADGES_STAT_KEY[cle];
  return monJoueur.value[statKey] || 0;
}

function getTop3Badge(cle) {
  if (!props.seasonStats?.joueurs) return [];
  const statKey = BADGES_STAT_KEY[cle];
  return [...props.seasonStats.joueurs]
    .filter(j => j[statKey] > 0)
    .sort((a, b) => b[statKey] - a[statKey])
    .slice(0, 3);
}
</script>

<style scoped>
.profil-badges-conteneur {
  background: #0f131c;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #2d3954;
  margin-bottom: 20px;
}

.titre-badges {
  margin-top: 0;
  margin-bottom: 5px;
  color: #00d2d3;
}

.description-badges {
  font-size: 0.8rem;
  color: #aaa;
  margin-top: 0;
  margin-bottom: 15px;
}

.grille-mes-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}

.tuile-badge {
  text-align: center;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid #2d3954;
  border-radius: 8px;
  padding: 12px 14px;
  min-width: 110px;
  opacity: 0.5;
  transition: all 0.2s ease;
}

.tuile-badge.possede {
  background: rgba(255, 128, 0, 0.12);
  border-color: #ff8000;
  opacity: 1;
}

.icone-badge {
  font-size: 1.8rem;
}

.nom-badge {
  font-size: 0.72rem;
  font-weight: bold;
  text-transform: uppercase;
  margin-top: 4px;
  color: #a0aec0;
}

.tuile-badge.possede .nom-badge {
  color: #ff8000;
}

.compteur-badge {
  font-size: 0.7rem;
  color: #616e88;
  margin-top: 4px;
}

.titre-classement-badges {
  margin-bottom: 5px;
  color: #ff8000;
  border-top: 1px solid #2d3954;
  padding-top: 15px;
}

.grille-classement-badges {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.carte-classement-badge {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid #2d3954;
  border-radius: 8px;
  padding: 12px 14px;
}

.entete-carte-badge {
  font-weight: bold;
  color: #00d2d3;
  font-size: 0.85rem;
  margin-bottom: 6px;
}

.badge-vide {
  color: #616e88;
  font-size: 0.78rem;
  font-style: italic;
  margin: 4px 0 0 0;
}

.ligne-joueur-badge {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  padding: 3px 0;
  color: #e2e8f0;
}

.ligne-joueur-badge.estMoi {
  color: #ff8000;
  font-weight: bold;
}

.valeur-stat {
  font-weight: bold;
}
</style>
