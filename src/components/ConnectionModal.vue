<template>
  <div id="modale-connexion" class="modal-back">
    <div class="modal-content-inner modal-auth">
      <span class="close-modal" @click="$emit('close-connection-modal')"
        >&times;</span
      >

      <div class="auth-tabs">
        <button
          type="button"
          class="auth-tab"
          :class="selectedTab === 0 ? 'actif' : ''"
          id="tab-connexion"
          data-panel="panneau-connexion"
          @click="selectedTab = 0"
        >
          Connexion
        </button>
        <button
          type="button"
          class="auth-tab"
          :class="selectedTab === 1 ? 'actif' : ''"
          id="tab-inscription"
          data-panel="panneau-inscription"
          @click="selectedTab = 1"
        >
          Inscription
        </button>
      </div>

      <div v-if="selectedTab === 0" id="panneau-connexion" class="auth-panel">
        <div class="auth-field">
          <label for="login-email">Email</label>
          <input
            v-model="email"
            type="email"
            id="login-email"
            placeholder="toi@exemple.com"
            autocomplete="email"
          />
        </div>
        <div class="auth-field">
          <label for="login-mdp">Mot de passe</label>
          <input
            v-model="password"
            type="password"
            id="login-mdp"
            placeholder="••••••••"
            autocomplete="current-password"
          />
        </div>
        <div id="login-erreur" class="auth-erreur">{{ errorString }}</div>
        <button
          id="btn-connexion"
          class="inscription-button"
          :disabled="isConnectionButtonDisabled"
          @click="handleConnectionClick"
        >
          {{ connectionButtonLabel }}
        </button>
        <a href="#" id="link-recup-mdp" @click.prevent="handleForgotPassword"
          >Mot de passe oublié ?</a
        >
      </div>

      <div
        v-else
        id="panneau-inscription"
        class="auth-panel"
      >
        <div class="auth-field">
          <label for="inscription-pseudo"
            >Pseudo (affiché aux autres joueurs)</label
          >
          <input
            v-model="nickname"
            type="text"
            id="inscription-pseudo"
            placeholder="Ton pseudo entre potes"
            autocomplete="nickname"
          />
        </div>
        <div class="auth-field">
          <label for="inscription-email">Email</label>
          <input
            v-model="email"
            type="email"
            id="inscription-email"
            placeholder="toi@exemple.com"
            autocomplete="email"
          />
        </div>
        <div class="auth-field">
          <label for="inscription-mdp">Mot de passe</label>
          <input
            v-model="password"
            type="password"
            id="inscription-mdp"
            placeholder="6 caractères minimum"
            autocomplete="new-password"
          />
        </div>
        <div id="inscription-erreur" class="auth-erreur">{{ errorString }}</div>
        <button
          id="btn-inscription"
          class="inscription-button"
          :disabled="isInscriptionButtonDisabled"
          @click="handleInscriptionClick"
        >
          {{ inscriptionButtonLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
import { ref } from "vue";
import {
  createUser,
  logIn,
  resetPassword,
  updateUserNickname,
} from "../services";
import { translateFirebaseError } from "../utils";

const emit = defineEmits(["close-connection-modal"]);

const nickname = ref("");
const email = ref("");
const password = ref("");
const isInscriptionButtonDisabled = ref(false);
const inscriptionButtonLabel = ref("🏆 Créer mon compte");
const isConnectionButtonDisabled = ref(false);
const connectionButtonLabel = ref("🏁 Se connecter");
const errorString = ref("");
const selectedTab = ref(0);

async function handleConnectionClick() {
  if (!email.value || !password.value) {
    errorString.value = "Merci de renseigner ton email et ton mot de passe.";
    return;
  }

  isConnectionButtonDisabled.value = true;
  connectionButtonLabel.value = "Connexion en cours...";
  try {
    await logIn(email.value, password.value);
    emit("close-connection-modal");
  } catch (error) {
    errorString.value = translateFirebaseError(error);
  } finally {
    isConnectionButtonDisabled.value = false;
    connectionButtonLabel.value = "🏁 Se connecter";
  }
}

async function handleInscriptionClick() {
  if (!nickname.value) {
    errorString.value =
      "Le pseudo est obligatoire (c'est ce que verront tes potes).";
    return;
  }
  if (!email.value || !password.value) {
    errorString.value = "Merci de renseigner un email et un mot de passe.";
    return;
  }

  isInscriptionButtonDisabled.value = true;
  inscriptionButtonLabel.value = "Création en cours...";
  try {
    const resultat = await createUser(email.value, password.value);
    await updateUserNickname(nickname.value);

    const nomUserSpan = document.getElementById("nom-utilisateur");
    if (nomUserSpan) {
      nomUserSpan.innerHTML = `<span style="font-weight: bold; color: #fff;">${nickname.value}</span>`;
    }
    emit("close-connection-modal");
  } catch (error) {
    errorString.value = translateFirebaseError(error);
    console.error(error);
  } finally {
    isInscriptionButtonDisabled.value = false;
    inscriptionButtonLabel.value = "🏆 Créer mon compte";
  }
}

async function handleForgotPassword() {
  if (!email.value) {
    errorString.value = "Saisis d'abord ton email ci-dessus.";
    return;
  }
  try {
    await resetPassword(email.value);
    errorString.value = `📨 Email de réinitialisation envoyé à ${email.value} (pense à vérifier tes spams).`;
  } catch {
    errorString.value = traduireErreurFirebase(error);
  }
}
</script>

<style lang="css" scoped>
.inscription-button {
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

.inscription-button:disabled {
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
