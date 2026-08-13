<template>
  <header class="brand-header">
    <div class="brand-actions">
      <button id="btn-reglement" class="btn-brand-action btn-brand-orange">
        📜 RÈGLEMENT
      </button>
    </div>

    <div id="bloc-auth-header" class="bloc-auth-header">
      <div id="auth-deconnecte" class="auth-deconnecte">
        <button id="btn-ouvrir-connexion" class="btn-header-auth btn-insc" @click="$emit('open-connection-modal')">
          🔑 CONNEXION / INSCRIPTION
        </button>
      </div>
      <div id="auth-connecte" class="auth-connecte" style="display: none">
        <button id="btn-vers-profil" class="btn-header-auth btn-conn">
          👤 MON PROFIL
        </button>
        <div class="user-profile-badge">
          <span class="status-dot"></span>
          <span id="nom-utilisateur">...</span>
        </div>
        <button id="btn-deconnexion" class="btn-logout btn-header-auth">
          DÉCONNEXION
        </button>
      </div>
    </div>
  </header>
</template>
