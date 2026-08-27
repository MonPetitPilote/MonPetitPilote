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

defineEmits(["open-rules-modal", "open-connection-modal", "vers-profil"]);

const userStore = useUserStore();

const pseudoAffiche = computed(() => {
  const user = userStore.currentUser;
  if (!user) return "";
  return user.displayName || user.email?.split("@")[0] || "";
});

async function deconnexion() {
  await signOut(getAuth());
}
</script>