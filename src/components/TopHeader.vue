<template>
  <header class="brand-header">
    <div class="brand-actions">
      <button
        id="btn-reglement"
        class="btn-brand-action btn-brand-orange"
        @click="$emit('open-rules-modal')"
      >
        📜 RÈGLEMENT
      </button>
      <button
        id="btn-classement-modal"
        class="btn-brand-action btn-brand-blue btn-classement-mobile"
        @click="$emit('open-ranking-modal')"
      >
        📊 CLASSEMENT
      </button>
      <button
        id="btn-radio-header"
        class="btn-brand-action btn-brand-radio"
        title="Contacter le stand / Boîte à idées"
        @click="$emit('open-feedback-modal')"
      >
        📻 RADIO STAND
      </button>
      <button
        id="btn-discord-header"
        type="button"
        class="btn-brand-action btn-brand-radio btn-brand-discord"
        title="Rejoindre le serveur Discord officiel"
        @click="ouvrirDiscord"
      >
        💬 DISCORD
      </button>
    </div>

    <div id="bloc-auth-header" class="bloc-auth-header">
      <div id="auth-deconnecte" class="auth-deconnecte" v-show="!userStore.currentUser">
        <button id="btn-ouvrir-connexion" class="btn-header-auth btn-insc" @click="$emit('open-connection-modal')">
          🔑 CONNEXION / INSCRIPTION
        </button>
      </div>
      <div id="auth-connecte" class="auth-connecte" v-show="userStore.currentUser">
        <button id="btn-vers-profil" class="btn-header-auth btn-conn" @click="$emit('vers-profil')">
          👤 MON PROFIL
        </button>
        <div class="user-profile-badge">
          <span class="status-dot"></span>
          <span id="nom-utilisateur">{{ pseudoAffiche }}</span>
        </div>
        <button id="btn-deconnexion" class="btn-logout btn-header-auth" @click="deconnexion">
          DÉCONNEXION
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { signOut } from "firebase/auth";
import { useUserStore } from "../stores";
import { getAuth } from "../utils/firebase";

defineEmits([
  "open-rules-modal",
  "open-ranking-modal",
  "open-connection-modal",
  "vers-profil",
  "open-feedback-modal"
]);

const userStore = useUserStore();

const discordInviteUrl = import.meta.env.VITE_DISCORD_INVITE_URL || "https://discord.gg/gsQ5mgukFN";

const pseudoAffiche = computed(() => {
  const user = userStore.currentUser;
  if (!user) return "";
  return user.displayName || user.email?.split("@")[0] || "";
});

async function deconnexion() {
  await signOut(getAuth());
}

function ouvrirDiscord() {
  window.open(discordInviteUrl, "_blank", "noopener,noreferrer");
}
</script>