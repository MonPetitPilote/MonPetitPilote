<template>
  <footer id="site-footer" class="site-footer" role="contentinfo">
    <div class="footer-inner">
      <!-- Ligne supérieure : Vibreur F1 décoratif -->
      <div class="footer-kerb"></div>

      <!-- Grille principale du Footer -->
      <div class="footer-grid">
        <!-- Colonne 1 : Marque & Mission -->
        <div class="footer-col brand-col">
          <div class="footer-brand-title">
            <span class="brand-f1-flag">🏁</span>
            <span class="brand-name">MON PETIT PILOTE</span>
          </div>
          <p class="footer-brand-desc">
            La ligue de pronostics Formule 1 entre amis pour la saison 2026. Affronte tes proches, défie le monde entier et hisse-toi sur la plus haute marche du podium.
          </p>
          <div class="footer-status-badge">
            <span class="status-live-dot"></span>
            <span class="status-label">SAISON 2026 // SERVEURS LIVE</span>
          </div>
        </div>

        <!-- Colonne 2 : Accès rapide -->
        <div class="footer-col links-col">
          <h4 class="footer-heading">PADDOCK & NAVIGATION</h4>
          <ul class="footer-links-list">
            <li>
              <button
                id="btn-footer-rules"
                type="button"
                class="footer-link-btn"
                @click="$emit('open-rules')"
              >
                📜 Règlement & Barème des points
              </button>
            </li>
            <li>
              <button
                id="btn-footer-ranking"
                type="button"
                class="footer-link-btn"
                @click="$emit('open-ranking')"
              >
                🏆 Classement Mondial des Pilotes
              </button>
            </li>
            <li>
              <button
                id="btn-footer-league"
                type="button"
                class="footer-link-btn"
                @click="$emit('open-league')"
              >
                👥 Créer ou rejoindre une Ligue
              </button>
            </li>
          </ul>
        </div>

        <!-- Colonne 3 : Boîte à idées & Radio Stand & Discord -->
        <div class="footer-col contact-col">
          <h4 class="footer-heading">RADIO STAND // CONTACT</h4>
          <p class="contact-desc">
            Une question, une idée ou un problème technique ? Échange directement avec le développeur ou rejoins la communauté.
          </p>
          <div class="contact-buttons-group">
            <button
              id="btn-footer-contact"
              type="button"
              class="btn-radio-stand"
              @click="$emit('open-feedback')"
            >
              <span class="radio-icon">📻</span>
              <span>Contacter le Stand</span>
            </button>
            <a
              id="btn-footer-discord"
              :href="discordInviteUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-footer-discord"
              title="Rejoindre le serveur Discord officiel"
            >
              <span class="discord-icon">💬</span>
              <span>Serveur Discord</span>
            </a>
          </div>
          <div class="footer-direct-mail">
            <span class="mail-icon">✉️</span>
            <a href="mailto:monpetitpilote@proton.me" class="footer-mail-link">monpetitpilote@proton.me</a>
          </div>
        </div>
      </div>

      <!-- Séparateur -->
      <div class="footer-divider"></div>

      <!-- Mention légale obligatoire & Disclaimer F1 -->
      <div class="footer-disclaimer">
        <p class="disclaimer-title">⚖️ MENTIONS LÉGALES & PROPRIÉTÉ INTELLECTUELLE</p>
        <p class="disclaimer-text">
          <strong>Mon Petit Pilote</strong> est un jeu gratuit, bénévole et non-commercial conçu par et pour des passionnés de sport automobile.
          Ce site internet est un projet non officiel et n'est en aucun cas associé, affilié, approuvé ou soutenu par les sociétés du groupe Formula 1, la Fédération Internationale de l'Automobile (FIA), la <em>Formula One Licensing B.V.</em>, ou tout autre promoteur, pilote ou constructeur officiel.
          Les marques F1, FORMULA ONE, FORMULA 1, FIA FORMULA ONE WORLD CHAMPIONSHIP, GRAND PRIX ainsi que tous les noms d'écuries, de circuits et de pilotes associés sont la propriété exclusive de leurs détenteurs respectifs.
        </p>
      </div>

      <!-- Barre de copyright et version châssis -->
      <div class="footer-bottom-bar">
        <span class="copyright-text">
          © 2026 Mon Petit Pilote • Fait avec passion par la communauté F1
        </span>
        <div class="telemetry-tags">
          <span class="footer-tag">CHÂSSIS v1.0</span>
          <span class="footer-tag">CALENDRIER OFFICIEL 2026</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
defineEmits(["open-rules", "open-ranking", "open-league", "open-feedback"]);

const discordInviteUrl = import.meta.env.VITE_DISCORD_INVITE_URL || "https://discord.gg/monpetitpilote";
</script>

<style scoped>
.site-footer {
  margin-top: 50px;
  background: linear-gradient(180deg, rgba(17, 23, 36, 0.7) 0%, #0d121c 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 30px;
}

/* Liseré haut façon bordure de piste / vibreur F1 */
.footer-kerb {
  height: 4px;
  width: 100%;
  background: repeating-linear-gradient(
    90deg,
    #e10600,
    #e10600 24px,
    #ffffff 24px,
    #ffffff 48px,
    #182030 48px,
    #182030 72px
  );
  margin-bottom: 30px;
  opacity: 0.85;
}

/* Grille 3 colonnes */
.footer-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1.1fr;
  gap: 36px;
  margin-bottom: 28px;
}

.footer-col {
  display: flex;
  flex-direction: column;
}

.footer-brand-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.brand-f1-flag {
  font-size: 1.3rem;
}

.brand-name {
  font-size: 1.1rem;
  font-weight: 900;
  color: #f8fafc;
  letter-spacing: 0.8px;
}

.footer-brand-desc {
  font-size: 0.82rem;
  color: #8392ab;
  line-height: 1.55;
  margin: 0 0 16px 0;
}

.footer-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  padding: 5px 10px;
  border-radius: 20px;
  width: fit-content;
}

.status-live-dot {
  width: 8px;
  height: 8px;
  background-color: #22c55e;
  border-radius: 50%;
  box-shadow: 0 0 8px #22c55e;
  animation: pulseDot 2s infinite ease-in-out;
}

@keyframes pulseDot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}

.status-label {
  font-size: 0.68rem;
  font-weight: 800;
  color: #4ade80;
  letter-spacing: 0.6px;
}

.footer-heading {
  font-size: 0.78rem;
  font-weight: 900;
  color: #ff8000;
  letter-spacing: 1px;
  margin: 0 0 14px 0;
  text-transform: uppercase;
}

.footer-links-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-link-btn {
  background: transparent;
  border: none;
  color: #cbd5e1;
  font-size: 0.83rem;
  padding: 0;
  cursor: pointer;
  text-align: left;
  transition: color 0.15s, transform 0.15s;
  display: inline-block;
}

.footer-link-btn:hover {
  color: #ff8000;
  transform: translateX(3px);
}

.contact-desc {
  font-size: 0.82rem;
  color: #8392ab;
  line-height: 1.5;
  margin: 0 0 14px 0;
}

.contact-buttons-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}

.btn-radio-stand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #1e293b;
  border: 1px solid #334155;
  color: #f1f5f9;
  padding: 9px 14px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-radio-stand:hover {
  background: #27354a;
  border-color: #ff8000;
  color: #ff8000;
  box-shadow: 0 0 12px rgba(255, 128, 0, 0.2);
}

.btn-footer-discord {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(88, 101, 242, 0.15);
  border: 1px solid rgba(88, 101, 242, 0.4);
  color: #a5b4fc;
  padding: 9px 14px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-footer-discord:hover {
  background: #5865f2;
  color: #ffffff;
  border-color: #5865f2;
  box-shadow: 0 0 12px rgba(88, 101, 242, 0.4);
}

.radio-icon,
.discord-icon {
  font-size: 1rem;
}

.footer-direct-mail {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  color: #94a3b8;
}

.mail-icon {
  font-size: 0.9rem;
}

.footer-mail-link {
  color: #38bdf8;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.15s;
}

.footer-mail-link:hover {
  color: #7dd3fc;
  text-decoration: underline;
}

.footer-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.07);
  margin: 20px 0;
}

/* Disclaimer légal */
.footer-disclaimer {
  background: rgba(10, 14, 22, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 14px 18px;
  margin-bottom: 20px;
}

.disclaimer-title {
  margin: 0 0 6px 0;
  font-size: 0.7rem;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 0.8px;
}

.disclaimer-text {
  margin: 0;
  font-size: 0.72rem;
  color: #64748b;
  line-height: 1.55;
}

.disclaimer-text strong {
  color: #94a3b8;
}

.disclaimer-text em {
  font-style: normal;
  color: #94a3b8;
}

/* Bas de footer */
.footer-bottom-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 0.76rem;
  color: #64748b;
}

.telemetry-tags {
  display: flex;
  gap: 8px;
}

.footer-tag {
  background: rgba(255, 255, 255, 0.05);
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.68rem;
  font-weight: 700;
  color: #8392ab;
  letter-spacing: 0.5px;
}

@media (max-width: 900px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>
