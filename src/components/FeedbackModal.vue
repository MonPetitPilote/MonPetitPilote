<template>
  <div
    id="modale-feedback"
    class="modal-back"
    @click.self="$emit('close')"
    @keydown.esc="$emit('close')"
  >
    <div class="feedback-card">
      <button
        id="btn-fermer-feedback"
        class="feedback-close"
        title="Fermer"
        @click="$emit('close')"
      >
        &times;
      </button>

      <!-- En-tête Radio Stand -->
      <div class="feedback-header">
        <div class="header-badge">
          <span class="radio-beacon"></span>
          <span class="badge-text">PIT WALL // RADIO STAND</span>
        </div>
        <h3 class="feedback-title">📻 Contacter l'équipe & Boîte à idées</h3>
        <p class="feedback-subtitle">
          Un bug constaté sur la télémétrie ? Une idée pour pimenter la saison ? Envoie ton message directement au stand !
        </p>
      </div>

      <!-- Formulaire -->
      <form class="feedback-form" @submit.prevent="envoyerFeedback">
        <!-- Choix de la catégorie -->
        <div class="form-group">
          <label class="form-label">Type de communication</label>
          <div class="category-grid">
            <button
              v-for="cat in categories"
              :key="cat.id"
              type="button"
              class="cat-chip"
              :class="{ 'is-selected': categorie === cat.id }"
              @click="categorie = cat.id"
            >
              <span class="cat-icon">{{ cat.icon }}</span>
              <span class="cat-label">{{ cat.label }}</span>
            </button>
          </div>
        </div>

        <!-- Pseudo & Email -->
        <div class="form-row">
          <div class="form-group flex-1">
            <label for="feedback-pseudo" class="form-label">Ton pseudo</label>
            <input
              id="feedback-pseudo"
              v-model="pseudo"
              type="text"
              class="form-input"
              placeholder="Ex: Charles16"
              required
            />
          </div>
          <div class="form-group flex-1">
            <label for="feedback-email" class="form-label">
              Email <span class="label-opt">(optionnel)</span>
            </label>
            <input
              id="feedback-email"
              v-model="email"
              type="email"
              class="form-input"
              placeholder="Pour te répondre si besoin"
            />
          </div>
        </div>

        <!-- Message -->
        <div class="form-group">
          <label for="feedback-message" class="form-label">Message pour le stand</label>
          <textarea
            id="feedback-message"
            v-model="message"
            class="form-textarea"
            rows="4"
            :placeholder="placeholderActuel"
            required
            minlength="10"
          ></textarea>
          <div class="textarea-counter">
            {{ message.length }} caractères (min. 10)
          </div>
        </div>

        <!-- Message d'erreur éventuel -->
        <div v-if="erreurMessage" class="feedback-error">
          ⚠️ {{ erreurMessage }}
        </div>

        <!-- Actions -->
        <div class="feedback-actions">
          <button
            type="button"
            class="btn-cancel"
            @click="$emit('close')"
          >
            Annuler
          </button>
          <button
            id="btn-envoyer-feedback"
            type="submit"
            class="btn-submit"
            :disabled="isSending || message.trim().length < 10"
          >
            <span v-if="isSending" class="sending-spinner">⏳ Envoi en cours...</span>
            <span v-else>📻 Transmettre à la radio</span>
          </button>
        </div>
      </form>

      <!-- Canaux directs : Discord & Email -->
      <div class="direct-channels">
        <div class="channels-divider">
          <span>OU REJOINS LE PADDOCK DIRECTEMENT</span>
        </div>

        <div class="channels-grid">
          <!-- Lien Discord -->
          <a
            id="link-discord-feedback"
            :href="discordInviteUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="channel-card channel-discord"
          >
            <div class="channel-icon">💬</div>
            <div class="channel-info">
              <span class="channel-name">Serveur Discord</span>
              <span class="channel-sub">Discussions GP, pronos & suggestions</span>
            </div>
            <span class="channel-arrow">→</span>
          </a>

          <!-- Email direct -->
          <a
            id="link-email-feedback"
            href="mailto:monpetitpilote@proton.me?subject=[Mon%20Petit%20Pilote]%20Message%20Radio%20Stand"
            class="channel-card channel-email"
          >
            <div class="channel-icon">✉️</div>
            <div class="channel-info">
              <span class="channel-name">monpetitpilote@proton.me</span>
              <span class="channel-sub">Réponse sous 24-48h par le développeur</span>
            </div>
            <span class="channel-arrow">→</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { collection, addDoc } from "firebase/firestore";
import { getFirestore } from "../utils/firebase";
import { useUserStore } from "../stores";
import { afficherNotification } from "../utils";

const emit = defineEmits(["close"]);
const userStore = useUserStore();

const discordInviteUrl = import.meta.env.VITE_DISCORD_INVITE_URL || "https://discord.gg/monpetitpilote";
const discordWebhookUrl = import.meta.env.VITE_DISCORD_WEBHOOK_URL || "";

const categories = [
  { id: "bug", icon: "🐛", label: "Signaler un bug", placeholder: "Explique ce qui s'est produit (sur quel Grand Prix, bouton, etc.)..." },
  { id: "idee", icon: "💡", label: "Idée d'amélioration", placeholder: "Partage ton idée de nouvelle règle, statistique, ou design..." },
  { id: "question", icon: "❓", label: "Question / Points", placeholder: "Pose ta question sur le barème, le calcul des points ou un classement..." },
  { id: "autre", icon: "💬", label: "Autre mot doux", placeholder: "Un petit encouragement ou une remarque générale pour l'équipe..." }
];

const categorie = ref("bug");
const pseudo = ref("");
const email = ref("");
const message = ref("");
const isSending = ref(false);
const erreurMessage = ref("");

const placeholderActuel = computed(() => {
  const cat = categories.find(c => c.id === categorie.value);
  return cat ? cat.placeholder : "Écris ton message ici...";
});

onMounted(() => {
  const u = userStore.currentUser;
  if (u) {
    pseudo.value = u.displayName || u.email?.split("@")[0] || "";
    if (u.email) email.value = u.email;
  }
});

async function envoyerFeedback() {
  if (message.value.trim().length < 10) {
    erreurMessage.value = "Ton message doit faire au moins 10 caractères.";
    return;
  }

  isSending.value = true;
  erreurMessage.value = "";

  const payload = {
    uid: userStore.currentUser?.uid || null,
    pseudo: pseudo.value.trim() || "Anonyme",
    email: email.value.trim() || "Non renseigné",
    categorie: categorie.value,
    message: message.value.trim(),
    dateCreation: new Date(),
    statut: "nouveau",
    navigateur: typeof navigator !== "undefined" ? navigator.userAgent : "inconnu"
  };

  try {
    // 1. Sauvegarde principale dans Firestore
    const db = getFirestore();
    await addDoc(collection(db, "feedbacks"), payload);

    // 2. Transfert automatique par Email à monpetitpilote@proton.me (via FormSubmit AJAX)
    try {
      await fetch("https://formsubmit.co/ajax/monpetitpilote@proton.me", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          _subject: `[Radio Stand MPP] ${categorie.value.toUpperCase()} de ${payload.pseudo}`,
          Pilote: payload.pseudo,
          Email: payload.email,
          Categorie: categorie.value,
          Message: payload.message,
          Date: new Date().toLocaleString("fr-FR"),
          _template: "box"
        })
      });
    } catch (mailErr) {
      console.warn("Transfert email:", mailErr);
    }

    // 3. Notification Discord si un webhook est configuré
    if (discordWebhookUrl) {
      try {
        await fetch(discordWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "Radio Stand MPP",
            embeds: [
              {
                title: `📻 Nouveau message Radio Stand : [${categorie.value.toUpperCase()}]`,
                description: payload.message,
                color: 16744192,
                fields: [
                  { name: "👤 Pilote", value: payload.pseudo, inline: true },
                  { name: "📧 Email", value: payload.email, inline: true },
                  { name: "📂 Catégorie", value: payload.categorie, inline: true }
                ],
                footer: { text: "Mon Petit Pilote 2026 // Alertes Stand" },
                timestamp: new Date().toISOString()
              }
            ]
          })
        });
      } catch (discordErr) {
        console.warn("Notification Discord webhook:", discordErr);
      }
    }

    afficherNotification("📻 Message bien transmis à monpetitpilote@proton.me et aux ingénieurs du stand !", "succes");
    message.value = "";
    emit("close");
  } catch (err: any) {
    console.error("Erreur feedback:", err);
    erreurMessage.value = "Impossible d'envoyer le message pour le moment. Réessaie dans un instant ou écris directement à monpetitpilote@proton.me.";
  } finally {
    isSending.value = false;
  }
}
</script>

<style scoped>
.feedback-card {
  background: #182030;
  color: #fff;
  padding: 24px;
  border-radius: 12px;
  max-width: 520px;
  width: 90%;
  border: 1px solid #2d3d59;
  position: relative;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
  max-height: 90vh;
  overflow-y: auto;
  box-sizing: border-box;
}

.feedback-close {
  position: absolute;
  top: 14px;
  right: 14px;
  background: transparent;
  border: none;
  color: #7b8fa9;
  font-size: 1.6rem;
  line-height: 1;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.15s;
}

.feedback-close:hover {
  color: #fff;
}

.feedback-header {
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #283750;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 128, 0, 0.12);
  border: 1px solid rgba(255, 128, 0, 0.35);
  padding: 3px 8px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.radio-beacon {
  width: 7px;
  height: 7px;
  background-color: #ff8000;
  border-radius: 50%;
  box-shadow: 0 0 6px #ff8000;
  display: inline-block;
  animation: beaconPulse 1.6s infinite ease-in-out;
}

@keyframes beaconPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(0.85); }
}

.badge-text {
  font-size: 0.68rem;
  font-weight: 800;
  color: #ff8000;
  letter-spacing: 0.8px;
}

.feedback-title {
  margin: 4px 0 6px;
  font-size: 1.25rem;
  color: #f1f2f6;
  font-weight: 800;
}

.feedback-subtitle {
  margin: 0;
  font-size: 0.82rem;
  color: #8c9eb5;
  line-height: 1.45;
}

.feedback-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.flex-1 {
  flex: 1;
}

.form-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #a3b5ce;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.label-opt {
  color: #64748b;
  text-transform: none;
  font-weight: normal;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.cat-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #111724;
  border: 1px solid #283750;
  color: #c7d2e2;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 600;
  text-align: left;
  transition: all 0.15s ease;
}

.cat-chip:hover {
  background: #1b2438;
  border-color: #3b4f73;
}

.cat-chip.is-selected {
  background: #1e2c45;
  border-color: #ff8000;
  color: #fff;
  box-shadow: 0 0 10px rgba(255, 128, 0, 0.2);
}

.cat-icon {
  font-size: 1rem;
}

.form-input,
.form-textarea {
  background: #111724;
  border: 1px solid #283750;
  border-radius: 6px;
  padding: 10px 12px;
  color: #fff;
  font-family: inherit;
  font-size: 0.85rem;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #ff8000;
  background: #141c2c;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
  line-height: 1.45;
}

.textarea-counter {
  font-size: 0.7rem;
  color: #64748b;
  text-align: right;
}

.feedback-error {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
}

.feedback-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 6px;
}

.btn-cancel {
  background: transparent;
  border: 1px solid #2d3d59;
  color: #a3b5ce;
  padding: 9px 16px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.btn-submit {
  background: linear-gradient(135deg, #ff8000 0%, #e05300 100%);
  border: none;
  color: #fff;
  padding: 9px 18px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
  letter-spacing: 0.4px;
  transition: transform 0.1s, opacity 0.15s;
}

.btn-submit:hover:not(:disabled) {
  opacity: 0.92;
  transform: translateY(-1px);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Canaux directs : Discord & Email */
.direct-channels {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px dashed rgba(255, 255, 255, 0.12);
}

.channels-divider {
  text-align: center;
  margin-bottom: 12px;
}

.channels-divider span {
  font-size: 0.66rem;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.channels-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.channel-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.channel-icon {
  font-size: 1.25rem;
}

.channel-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.channel-name {
  font-size: 0.84rem;
  font-weight: 800;
  color: #ffffff;
}

.channel-sub {
  font-size: 0.72rem;
  color: #94a3b8;
}

.channel-arrow {
  color: #94a3b8;
  font-size: 1rem;
  font-weight: bold;
  transition: transform 0.15s;
}

.channel-card:hover .channel-arrow {
  transform: translateX(3px);
}

.channel-discord {
  background: rgba(88, 101, 242, 0.12);
  border-color: rgba(88, 101, 242, 0.35);
}

.channel-discord:hover {
  background: rgba(88, 101, 242, 0.22);
  border-color: #5865f2;
}

.channel-discord .channel-name {
  color: #7289da;
}

.channel-email {
  background: rgba(14, 165, 233, 0.08);
  border-color: rgba(14, 165, 233, 0.3);
}

.channel-email:hover {
  background: rgba(14, 165, 233, 0.18);
  border-color: #38bdf8;
}

.channel-email .channel-name {
  color: #38bdf8;
}

@media (max-width: 540px) {
  .category-grid {
    grid-template-columns: 1fr;
  }
  .form-row {
    flex-direction: column;
  }
}
</style>
