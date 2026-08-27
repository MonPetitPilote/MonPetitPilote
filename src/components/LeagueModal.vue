<template>
  <div id="modale-ligues" class="modal-back" @click.self="$emit('close')">
    <div class="modal-content-inner" style="max-width: 420px">
      <span class="close-modal" id="btn-fermer-ligues" @click="$emit('close')">&times;</span>

      <div class="auth-tabs">
        <button
          type="button"
          :class="['auth-tab', { actif: activeTab === 'creer' }]"
          id="tab-creer-ligue"
          @click="activeTab = 'creer'"
        >
          Créer une ligue
        </button>
        <button
          type="button"
          :class="['auth-tab', { actif: activeTab === 'rejoindre' }]"
          id="tab-rejoindre-ligue"
          @click="activeTab = 'rejoindre'"
        >
          Rejoindre
        </button>
      </div>

      <div v-show="activeTab === 'creer'" id="panneau-creer-ligue" class="auth-panel">
        <div class="auth-field">
          <label for="nom-nouvelle-ligue">Nom de la ligue</label>
          <input
            type="text"
            id="nom-nouvelle-ligue"
            v-model="nomLigue"
            placeholder="Ex : Les Copains du Garage"
          />
        </div>
        <div id="creer-ligue-erreur" class="auth-erreur">{{ erreurCreer }}</div>
        <button
          id="btn-creer-ligue"
          class="create-league-button"
          :disabled="isSubmittingCreer"
          @click="onCreerLigue"
        >
          🏁 Créer ma ligue
        </button>
      </div>

      <div
        v-show="activeTab === 'rejoindre'"
        id="panneau-rejoindre-ligue"
        class="auth-panel"
      >
        <div class="auth-field">
          <label for="code-ligue-rejoindre">Code d'invitation</label>
          <input
            type="text"
            id="code-ligue-rejoindre"
            v-model="codeLigue"
            placeholder="Ex : F1-X7K2"
            style="text-transform: uppercase"
          />
        </div>
        <div id="rejoindre-ligue-erreur" class="auth-erreur">{{ erreurRejoindre }}</div>
        <button
          id="btn-rejoindre-ligue"
          class="create-league-button"
          :disabled="isSubmittingRejoindre"
          @click="onRejoindreLigue"
        >
          🤝 Rejoindre la ligue
        </button>
      </div>

      <div
        v-if="codePartage"
        id="ligue-code-partage"
        style="
          margin-top: 16px;
          background: #111622;
          border: 1px dashed #ff8000;
          border-radius: 8px;
          padding: 12px;
          text-align: center;
        "
      >
        <p style="margin: 0 0 6px 0; font-size: 0.8rem; color: #a5b1c2">
          Partage ce code à tes potes :
        </p>
        <p
          style="
            margin: 0;
            font-size: 1.4rem;
            font-weight: 900;
            color: #ff8000;
            letter-spacing: 2px;
          "
          id="texte-code-partage"
        >{{ codePartage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useUserStore } from "../stores";
import { getFirestore } from "../utils/firebase";
import { creerNouvelleLigue, rejoindreLigueParCode } from "../services";

const emit = defineEmits(["close", "ligue-rejointe"]);

const userStore = useUserStore();
const db = getFirestore();

const activeTab = ref("creer");
const nomLigue = ref("");
const codeLigue = ref("");
const erreurCreer = ref("");
const erreurRejoindre = ref("");
const codePartage = ref("");
const isSubmittingCreer = ref(false);
const isSubmittingRejoindre = ref(false);

async function onCreerLigue() {
  erreurCreer.value = "";
  const nom = nomLigue.value.trim();
  if (!nom) {
    erreurCreer.value = "Veuillez saisir un nom de ligue.";
    return;
  }

  isSubmittingCreer.value = true;
  try {
    const code = await creerNouvelleLigue(db, nom, userStore.currentUser);
    nomLigue.value = "";
    codePartage.value = code;
    emit("ligue-rejointe");
  } catch (err) {
    erreurCreer.value = err instanceof Error ? err.message : "Erreur lors de la création.";
  } finally {
    isSubmittingCreer.value = false;
  }
}

async function onRejoindreLigue() {
  erreurRejoindre.value = "";
  const code = codeLigue.value.trim().toUpperCase();
  if (!code) {
    erreurRejoindre.value = "Veuillez saisir un code de ligue.";
    return;
  }

  isSubmittingRejoindre.value = true;
  try {
    await rejoindreLigueParCode(db, code, userStore.currentUser);
    codeLigue.value = "";
    emit("ligue-rejointe");
  } catch (err) {
    erreurRejoindre.value = err instanceof Error ? err.message : "Erreur lors de la tentative.";
  } finally {
    isSubmittingRejoindre.value = false;
  }
}
</script>

<style lang="css" scoped>
.create-league-button {
  width: 100%;
  background: linear-gradient(135deg, #e10600 0%, #b30500 100%);
  color: white;
  border: none;
  padding: 13px;
  font-size: 1rem;
  font-weight: 700;
  border-radius: 6px;
  cursor: pointer;
  text-transform: uppercase;
}
.create-league-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-erreur {
  color: #ef4444;
  font-size: 0.8rem;
  margin: -4px 0 14px 0;
  min-height: 1em;
}
</style>