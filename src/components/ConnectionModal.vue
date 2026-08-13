<template>
  <div id="modale-connexion" class="modal-back">
    <div class="modal-content-inner modal-auth">
      <span
        class="close-modal"
        id="btn-fermer-connexion"
        @click="$emit('close-connection-modal')"
        >&times;</span
      >

      <div class="auth-tabs">
        <button
          type="button"
          class="auth-tab actif"
          id="tab-connexion"
          data-panel="panneau-connexion"
        >
          Connexion
        </button>
        <button
          type="button"
          class="auth-tab"
          id="tab-inscription"
          data-panel="panneau-inscription"
        >
          Inscription
        </button>
      </div>

      <div id="panneau-connexion" class="auth-panel">
        <div class="auth-field">
          <label for="login-email">Email</label>
          <input
            type="email"
            id="login-email"
            placeholder="toi@exemple.com"
            autocomplete="email"
          />
        </div>
        <div class="auth-field">
          <label for="login-mdp">Mot de passe</label>
          <input
            type="password"
            id="login-mdp"
            placeholder="••••••••"
            autocomplete="current-password"
          />
        </div>
        <div id="login-erreur" class="auth-erreur"></div>
        <button id="btn-connexion" class="inscription-button">
          🏁 Se connecter
        </button>
        <a href="#" id="link-recup-mdp">Mot de passe oublié ?</a>
      </div>

      <div id="panneau-inscription" class="auth-panel" style="display: none">
        <div class="auth-field">
          <label for="inscription-pseudo"
            >Pseudo (affiché aux autres joueurs)</label
          >
          <input
            type="text"
            id="inscription-pseudo"
            placeholder="Ton pseudo entre potes"
            autocomplete="nickname"
          />
        </div>
        <div class="auth-field">
          <label for="inscription-email">Email</label>
          <input
            type="email"
            id="inscription-email"
            placeholder="toi@exemple.com"
            autocomplete="email"
          />
        </div>
        <div class="auth-field">
          <label for="inscription-mdp">Mot de passe</label>
          <input
            type="password"
            id="inscription-mdp"
            placeholder="6 caractères minimum"
            autocomplete="new-password"
          />
        </div>
        <div id="inscription-erreur" class="auth-erreur"></div>
        <button id="btn-inscription" class="inscription-button">
          🏆 Créer mon compte
        </button>
      </div>
    </div>
  </div>
</template>

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
</style>
