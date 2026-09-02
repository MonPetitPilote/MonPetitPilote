<template>
  <div v-if="userStore.currentUser" id="bloc-anecdote-paddock" class="anecdote-card" :class="themeClass">
    <!-- En-tête de la bannière dynamique -->
    <div class="anecdote-header">
      <div class="anecdote-titre-zone">
        <span class="anecdote-icone-radio">📻</span>
        <div class="anecdote-titres">
          <span class="anecdote-label">{{ titreDynamiqueHeader }}</span>
          <span v-if="dernierGpNom" class="anecdote-contexte">
            <strong>{{ dernierGpNom }}</strong> — 
            <span class="score-brut" :style="{ color: couleurBadge }">{{ dernierGpScore }} pts</span>
            <span v-if="faitMarquantCourse" class="anecdote-fait-gp"> • {{ faitMarquantCourse }}</span>
          </span>
          <span v-else class="anecdote-contexte">
            En attente du premier drapeau à damier 2026
          </span>
        </div>
      </div>

      <div class="anecdote-actions">
        <!-- Badge de performance -->
        <span class="badge-perf" :style="{ borderColor: couleurBadge, color: couleurBadge }">
          {{ badgeTexte }}
        </span>

        <!-- Bouton autre anecdote (si plusieurs disponibles dans la même catégorie) -->
        <button
          v-if="nbAnecdotesDispo > 1 && !estReduit"
          class="btn-action-anecdote"
          title="Découvrir une autre anecdote de cette catégorie"
          @click="changerAnecdote"
        >
          🎲 Autre fait
        </button>

        <!-- Bouton Réduire / Dérouler -->
        <button
          class="btn-action-anecdote btn-reduire"
          :title="estReduit ? 'Dérouler' : 'Réduire'"
          @click="estReduit = !estReduit"
        >
          {{ estReduit ? '▼ Dérouler' : '▲ Réduire' }}
        </button>
      </div>
    </div>

    <!-- Corps de l'anecdote (si non réduit) -->
    <div v-show="!estReduit" class="anecdote-body">
      <!-- Visuel personnalisé utilisateur -->
      <div class="anecdote-visuel-wrapper" :style="{ borderColor: couleurBadge }">
        <img
          :src="anecdoteCourante.image"
          :alt="anecdoteCourante.titre"
          class="anecdote-visuel"
          @error="surErreurImage"
        />
        <span class="anecdote-visuel-tag" :style="{ background: couleurBadge }">
          {{ anecdoteCourante.tagline }}
        </span>
      </div>

      <!-- Contenu textuel & radio légendaire -->
      <div class="anecdote-contenu">
        <div class="anecdote-top-row">
          <h4 class="anecdote-titre">{{ anecdoteCourante.titre }}</h4>
        </div>

        <p class="anecdote-soustitre">{{ anecdoteCourante.sousTitre }}</p>

        <!-- Citation radio mythique -->
        <div v-if="anecdoteCourante.radioCitation" class="anecdote-radio-box" :style="{ borderLeftColor: couleurBadge }">
          <div class="radio-quote">
            <span class="radio-waves">🎙️</span>
            <em>{{ anecdoteCourante.radioCitation }}</em>
          </div>
          <div v-if="anecdoteCourante.auteurCitation" class="radio-auteur">
            — {{ anecdoteCourante.auteurCitation }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { useUserStore } from "../stores";
import { getFirestore } from "../utils/firebase";
import { recupererGpParRound } from "../services";
import {
  ANECDOTES_F1,
  determinerCategorieScore,
  type AnecdoteF1
} from "../utils/anecdotesData";

const userStore = useUserStore();
const db = getFirestore();

const estReduit = ref(false);
const indexVariante = ref(0);
const chargement = ref(false);

const dernierGpNom = ref<string | null>(null);
const dernierGpScore = ref<number | null>(null);
const vainqueurDernierGp = ref<string | null>(null);
const polemanDernierGp = ref<string | null>(null);
const dnfDernierGp = ref<number | null>(null);
const safetyCarDernierGp = ref<boolean | null>(null);

// Chargement du dernier pronostic calculé de l'utilisateur connecté et des faits du GP
async function chargerDernierScoreJoueur() {
  const user = userStore.currentUser;
  if (!user) {
    dernierGpNom.value = null;
    dernierGpScore.value = null;
    vainqueurDernierGp.value = null;
    polemanDernierGp.value = null;
    return;
  }

  chargement.value = true;
  try {
    const q = query(collection(db, "pronostics"), where("uidJoueur", "==", user.uid));
    const snap = await getDocs(q);

    let dernierRound = -1;
    let scoreTrouve: number | null = null;
    let courseTrouvee = "";

    snap.forEach((docSnap) => {
      const d = docSnap.data();
      const courseStr = d.course || "";
      const roundNum = Number(courseStr.includes("/") ? courseStr.split("/")[1] : courseStr);

      const aBilan = d.bilanCalcul && typeof d.bilanCalcul.pointsTotaux === "number";
      const aPoints = typeof d.pointsTotaux === "number";

      // On recherche le GP calculé le plus récent
      if ((aBilan || aPoints) && roundNum >= dernierRound) {
        dernierRound = roundNum;
        courseTrouvee = courseStr;
        scoreTrouve = aBilan ? d.bilanCalcul.pointsTotaux : d.pointsTotaux;
      }
    });

    if (scoreTrouve !== null && courseTrouvee) {
      const gp = recupererGpParRound(courseTrouvee);
      dernierGpNom.value = gp ? gp.nom : `Round ${dernierRound}`;
      dernierGpScore.value = scoreTrouve;

      // Charger également les faits de course archivés pour ce Grand Prix
      try {
        const roundId = courseTrouvee.replace("/", "_");
        const docHisto = await getDoc(doc(db, "historique_courses", roundId));
        if (docHisto.exists()) {
          const hData = docHisto.data();
          if (hData.top10 && Array.isArray(hData.top10) && hData.top10.length > 0) {
            vainqueurDernierGp.value = hData.top10[0];
          }
          if (hData.poleman && hData.poleman !== "Inconnu") {
            polemanDernierGp.value = hData.poleman;
          }
          if (hData.bonusReel) {
            dnfDernierGp.value = typeof hData.bonusReel.nombreDNF === "number" ? hData.bonusReel.nombreDNF : null;
            safetyCarDernierGp.value = typeof hData.bonusReel.safetyCar === "boolean" ? hData.bonusReel.safetyCar : null;
          }
        }
      } catch (errHisto) {
        console.warn("Impossible de charger les détails de course :", errHisto);
      }
    } else {
      dernierGpNom.value = null;
      dernierGpScore.value = null;
      vainqueurDernierGp.value = null;
      polemanDernierGp.value = null;
    }
  } catch (err) {
    console.warn("Impossible de charger le dernier score pour l'anecdote :", err);
  } finally {
    chargement.value = false;
  }
}

// Catégorie déterminée par le score (par défaut 20 pts si aucun GP terminé)
const categorieActive = computed(() => {
  const score = dernierGpScore.value !== null ? dernierGpScore.value : 20;
  return determinerCategorieScore(score);
});

// Titre de l'en-tête adapté à ce qui s'est passé lors du dernier Grand Prix
const titreDynamiqueHeader = computed(() => {
  if (!dernierGpNom.value) {
    return "L'HUMEUR DU PADDOCK • VOS PRONOS";
  }

  const score = dernierGpScore.value || 0;
  if (score <= 15) {
    return `DÉBRIEF DU GP • COUP DUR AU ${dernierGpNom.value.toUpperCase()}`;
  } else if (score <= 30) {
    return `DÉBRIEF DU GP • BON RYTHME AU ${dernierGpNom.value.toUpperCase()}`;
  } else {
    return `DÉBRIEF DU GP • CARTON PLEIN AU ${dernierGpNom.value.toUpperCase()}`;
  }
});

// Résumé concis de ce qui s'est passé en piste lors de ce GP
const faitMarquantCourse = computed(() => {
  const morceaux: string[] = [];
  if (vainqueurDernierGp.value) {
    morceaux.push(`Victoire de ${vainqueurDernierGp.value}`);
  }
  if (polemanDernierGp.value && polemanDernierGp.value !== vainqueurDernierGp.value) {
    morceaux.push(`Pole de ${polemanDernierGp.value}`);
  }
  if (safetyCarDernierGp.value === true) {
    morceaux.push("Safety Car");
  }
  if (dnfDernierGp.value !== null && dnfDernierGp.value > 0) {
    morceaux.push(`${dnfDernierGp.value} DNF`);
  }
  return morceaux.join(" • ");
});

// Liste des anecdotes disponibles pour la catégorie
const anecdotesDisponibles = computed(() => {
  return ANECDOTES_F1.filter((a) => a.categorie === categorieActive.value);
});

const nbAnecdotesDispo = computed(() => anecdotesDisponibles.value.length);

// Anecdote sélectionnée
const anecdoteCourante = computed<AnecdoteF1>(() => {
  const liste = anecdotesDisponibles.value;
  if (liste.length === 0) return ANECDOTES_F1[0];
  const idx = Math.abs(indexVariante.value) % liste.length;
  return liste[idx];
});

const couleurBadge = computed(() => anecdoteCourante.value.badgeCouleur);
const badgeTexte = computed(() => anecdoteCourante.value.badgeTexte);

const themeClass = computed(() => {
  return `theme-${categorieActive.value}`;
});

function changerAnecdote() {
  indexVariante.value = (indexVariante.value + 1) % Math.max(1, nbAnecdotesDispo.value);
}

// Fallback discret en cas d'image personnalisée manquante ou en attente d'upload
function surErreurImage(e: Event) {
  const img = e.target as HTMLImageElement;
  if (img && !img.dataset.fallbackApplied) {
    img.dataset.fallbackApplied = "true";
    img.style.opacity = "0.7";
  }
}

watch(
  () => userStore.currentUser,
  (nouveauUser) => {
    if (nouveauUser) {
      chargerDernierScoreJoueur();
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (userStore.currentUser) {
    chargerDernierScoreJoueur();
  }
});
</script>

<style scoped>
.anecdote-card {
  background: linear-gradient(135deg, #111726 0%, #0d121e 100%);
  border-radius: 12px;
  border: 1px solid #23304a;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.45);
  margin: 18px 0 25px 0;
  overflow: hidden;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.theme-low,
.theme-peu-de-points {
  border-color: rgba(225, 6, 0, 0.35);
  box-shadow: 0 8px 24px rgba(225, 6, 0, 0.12);
}

.theme-mid,
.theme-un-peu-de-points {
  border-color: rgba(243, 156, 18, 0.35);
  box-shadow: 0 8px 24px rgba(243, 156, 18, 0.12);
}

.theme-high,
.theme-beaucoup-de-points {
  border-color: rgba(46, 213, 115, 0.4);
  box-shadow: 0 8px 24px rgba(46, 213, 115, 0.15);
}

/* En-tête */
.anecdote-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid #1e293f;
  flex-wrap: wrap;
  gap: 10px;
}

.anecdote-titre-zone {
  display: flex;
  align-items: center;
  gap: 12px;
}

.anecdote-icone-radio {
  font-size: 1.4rem;
  background: #182236;
  border-radius: 8px;
  padding: 6px 8px;
  border: 1px solid #2a3854;
}

.anecdote-titres {
  display: flex;
  flex-direction: column;
}

.anecdote-label {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #8b9bb4;
}

.anecdote-contexte {
  font-size: 0.9rem;
  color: #e2e8f0;
}

.anecdote-fait-gp {
  color: #94a3b8;
  font-size: 0.84rem;
  font-weight: 500;
}

.score-brut {
  font-weight: 900;
  margin-left: 4px;
}

.anecdote-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.badge-perf {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.8px;
  padding: 4px 10px;
  border-radius: 20px;
  border: 1.5px solid;
  background: rgba(0, 0, 0, 0.35);
  text-transform: uppercase;
}

.btn-action-anecdote {
  background: #192338;
  color: #cbd5e1;
  border: 1px solid #2d3e5e;
  border-radius: 6px;
  padding: 6px 11px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-action-anecdote:hover {
  background: #24324f;
  color: #fff;
  border-color: #3b82f6;
}

.btn-reduire {
  color: #94a3b8;
}

/* Corps */
.anecdote-body {
  display: flex;
  padding: 18px;
  gap: 20px;
  align-items: center;
}

.anecdote-visuel-wrapper {
  position: relative;
  flex-shrink: 0;
  width: 170px;
  height: 140px;
  background: #090c14;
  border: 2px solid #2d3e5e;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.7);
}

.anecdote-visuel {
  max-width: 95%;
  max-height: 95%;
  object-fit: contain;
}

.anecdote-visuel-tag {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #ffffff;
  padding: 2px 4px;
  letter-spacing: 0.5px;
}

.anecdote-contenu {
  flex: 1;
  min-width: 0;
}

.anecdote-top-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.anecdote-titre {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.3px;
}

.anecdote-soustitre {
  margin: 0 0 10px 0;
  color: #a5b4fc;
  font-size: 0.88rem;
  font-weight: 600;
}

.anecdote-radio-box {
  background: rgba(0, 0, 0, 0.4);
  border-left: 3px solid #ff8000;
  padding: 8px 12px;
  border-radius: 0 6px 6px 0;
}

.radio-quote {
  color: #f1f5f9;
  font-size: 0.95rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
}

.radio-waves {
  font-size: 1rem;
}

.radio-auteur {
  color: #94a3b8;
  font-size: 0.75rem;
  margin-top: 3px;
  font-style: italic;
}

/* Responsiveness */
@media (max-width: 768px) {
  .anecdote-body {
    flex-direction: column;
    text-align: center;
  }
  .anecdote-visuel-wrapper {
    width: 100%;
    max-width: 220px;
    height: 140px;
    margin: 0 auto;
  }
  .anecdote-top-row {
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .anecdote-radio-box {
    border-left: none;
    border-top: 2px solid;
    border-radius: 6px;
  }
  .radio-quote {
    justify-content: center;
  }
}
</style>
