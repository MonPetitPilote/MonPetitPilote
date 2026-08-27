<template>
  <div id="workspace-profil" v-show="profilVisible" style="margin-bottom: 35px;">
    <div class="colonne-gauche" style="width: 100%;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2d3954; padding-bottom: 10px; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #ff8000;">🏁 VOTRE ESPACE PERFORMANCES</h2>
        <button id="btn-retour-pronos" style="background: #242f46; color: white; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-weight: bold;" @click="basculerVersPronos">← RETOUR AUX PRONOS</button>
      </div>

      <div id="profil-infos" style="background: #0f131c; padding: 20px; border-radius: 10px; border: 1px solid #2d3954; margin-bottom: 20px;">
        <h3 style="margin-top: 0; margin-bottom: 15px; color: #00d2d3;">👤 Mon profil</h3>
        <p style="color: #aaa; font-size: 0.85rem; margin: 0 0 4px 0;">Email : <span id="profil-email">{{ userStore.currentUser?.email }}</span></p>
        <p style="color: #aaa; font-size: 0.85rem; margin: 0 0 15px 0;">Pseudo actuel : <span id="profil-pseudo-actuel">{{ pseudoActuel }}</span></p>
        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
          <input
            id="profil-input-pseudo"
            type="text"
            v-model="pseudoInput"
            placeholder="Nouveau pseudo"
            style="flex: 1; min-width: 180px; padding: 8px 12px; border-radius: 6px; border: 1px solid #2d3954; background: #141c2e; color: #fff;"
          />
          <button
            id="btn-sauvegarder-pseudo"
            style="background: #ff8000; color: #fff; border: none; padding: 9px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;"
            @click="sauvegarderPseudo(pseudoInput)"
          >
            Enregistrer
          </button>
        </div>
      </div>

      <div id="profil-badges" style="background: #0f131c; padding: 20px; border-radius: 10px; border: 1px solid #2d3954; margin-bottom: 20px;">
        <h3 style="margin-top: 0; margin-bottom: 5px; color: #00d2d3;">🎖️ Vos badges de la saison</h3>
        <p style="font-size: 0.8rem; color: #aaa; margin-top: 0; margin-bottom: 15px;">Un badge s'obtient en étant, à date, le joueur (ou l'un des joueurs) en tête sur ce critère. Il peut donc changer de mains au fil de la saison.</p>
        <div id="profil-badges-liste" style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 20px;">
          <p style="color: #aaa; font-style: italic;">Chargement...</p>
        </div>

        <h3 style="margin-bottom: 5px; color: #ff8000; border-top: 1px solid #2d3954; padding-top: 15px;">🏅 Qui est en tête sur chaque critère ?</h3>
        <p style="font-size: 0.8rem; color: #aaa; margin-top: 0; margin-bottom: 15px;">Le classement complet, badge par badge — de quoi savoir qui est devant qui, et grâce à quoi.</p>
        <div id="profil-classement-badges" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
          <p style="color: #aaa; font-style: italic;">Chargement...</p>
        </div>
      </div>

      <!-- GRAPHIQUE D'ÉVOLUTION DU CLASSEMENT -->
      <div id="bloc-graphique-evolution" style="background: #0f131c; padding: 20px; border-radius: 10px; border: 1px solid #2d3954; margin-bottom: 20px; display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 15px; border-bottom: 1px solid #242f46; padding-bottom: 12px;">
          <div>
            <h3 style="margin: 0; color: #ff8000; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
              📈 ÉVOLUTION DU CLASSEMENT AU FIL DE LA SAISON
            </h3>
            <p id="graphique-sous-titre" style="font-size: 0.8rem; color: #a5b1c2; margin: 4px 0 0 0;">
              Comparatif de vos performances avec vos rivaux directs au classement.
            </p>
          </div>
          <div style="display: flex; background: #141c2e; padding: 3px; border-radius: 6px; border: 1px solid #2d3954;">
            <button id="btn-graph-mode-points" class="btn-graph-mode active" style="background: #ff8000; color: #fff; border: none; padding: 5px 12px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; cursor: pointer; transition: all 0.2s;">
              📊 Points Cumulés
            </button>
            <button id="btn-graph-mode-rang" class="btn-graph-mode" style="background: transparent; color: #a5b1c2; border: none; padding: 5px 12px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; cursor: pointer; transition: all 0.2s;">
              🏆 Position (#1, #2...)
            </button>
          </div>
        </div>

        <div style="position: relative; height: 280px; width: 100%;">
          <canvas id="graphique-classement"></canvas>
        </div>
      </div>

      <ProfileHistory ref="profileHistoryRef" :db="db" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useUserStore } from "../stores";
import { getFirestore } from "../utils/firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { afficherNotification } from "../utils";
import { CODE_LIGUE_MONDIAL } from "../services";
import ProfileHistory from "./ProfileHistory.vue";

const emit = defineEmits(["profil-affiche"]);

const userStore = useUserStore();
const db = getFirestore();

const profilVisible = ref(false);
const profileHistoryRef = ref<InstanceType<typeof ProfileHistory> | null>(null);
const pseudoInput = ref("");
const pseudoActuel = ref("");

// Création du document utilisateur à la première connexion (équivalent script.ts section 2)
watch(
  () => userStore.currentUser,
  async (user) => {
    if (!user) return;
    const pseudoFinal = user.displayName || user.email?.split("@")[0] || "Joueur";
    pseudoActuel.value = pseudoFinal;
    pseudoInput.value = pseudoFinal;
    const refUser = doc(db, "utilisateurs", user.uid);
    const docUser = await getDoc(refUser);
    if (!docUser.exists()) {
      await setDoc(refUser, {
        pseudo: pseudoFinal,
        email: user.email,
        dateInscription: new Date(),
        ligues: [CODE_LIGUE_MONDIAL],
        ligueActive: CODE_LIGUE_MONDIAL
      });
    }
  },
  { immediate: true }
);

async function sauvegarderPseudo(nouveauPseudo: string) {
  const user = userStore.currentUser;
  if (!nouveauPseudo?.trim()) {
    afficherNotification("Le pseudo ne peut pas être vide.", "erreur");
    return;
  }
  if (!user) return;

  try {
    await updateProfile(user, { displayName: nouveauPseudo });
    await setDoc(doc(db, "utilisateurs", user.uid), { pseudo: nouveauPseudo }, { merge: true });

    const q = query(collection(db, "pronostics"), where("uidJoueur", "==", user.uid));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.forEach((d) => batch.update(d.ref, { pseudo: nouveauPseudo }));
    await batch.commit();

    pseudoActuel.value = nouveauPseudo;
    afficherNotification("Pseudo mis à jour avec succès !", "succes");
  } catch (error) {
    afficherNotification("Erreur lors du changement de pseudo.", "erreur");
  }
}

function basculerVersProfil() {
  profilVisible.value = true;
  emit("profil-affiche");
  const user = userStore.currentUser;
  if (user) {
    profileHistoryRef.value?.chargerHistorique(db, user.uid);
  }
}

function basculerVersPronos() {
  profilVisible.value = false;
}

defineExpose({
  basculerVersProfil,
  basculerVersPronos,
  sauvegarderPseudo
});
</script>