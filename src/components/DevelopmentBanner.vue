<template>
  <aside
    id="f1-dev-banner"
    class="f1-side-banner"
    :class="{ 'is-collapsed': isCollapsed, 'is-hidden': isDismissed }"
    aria-label="Informations sur la version en développement"
  >
    <!-- Onglet réduit sur le bord droit -->
    <button
      v-if="isCollapsed && !isDismissed"
      id="btn-expand-f1-banner"
      class="f1-tab-collapsed"
      title="Voir les infos de développement"
      @click="isCollapsed = false"
    >
      <span class="beacon-dot"></span>
      <span class="tab-text">🏎️ PIT LANE // EN RODAGE</span>
    </button>

    <!-- Carte complète du bandeau latéral -->
    <div v-show="!isCollapsed && !isDismissed" class="f1-card-banner">
      <!-- Liseré de vibreur F1 / bord de stand -->
      <div class="f1-kerb-stripe"></div>

      <div class="f1-banner-content">
        <div class="f1-banner-header">
          <div class="f1-header-title">
            <span class="beacon-pulse"></span>
            <span class="f1-tag-badge">PIT LANE // R&amp;D</span>
          </div>
          <div class="f1-header-actions">
            <button
              id="btn-collapse-f1-banner"
              class="f1-btn-icon"
              title="Réduire sur le côté"
              @click="isCollapsed = true"
            >
              −
            </button>
            <button
              id="btn-dismiss-f1-banner"
              class="f1-btn-icon"
              title="Fermer le bandeau"
              @click="dismissBanner"
            >
              ×
            </button>
          </div>
        </div>

        <div class="f1-banner-body">
          <div class="f1-status-line">
            <span class="flag-icon">🟡</span>
            <strong class="f1-status-text">ESSAIS HIVERNAUX EN COURS</strong>
          </div>
          <p class="f1-banner-desc">
            Le site peaufine actuellement ses derniers réglages aéro et télémétrie en soufflerie avant le grand coup d'envoi de la saison 2026.
          </p>
        </div>

        <div class="f1-banner-footer">
          <span class="f1-telemetry-pill">
            <span class="telemetry-label">CHÂSSIS</span>
            <span class="telemetry-val">MPP-2026.BETA</span>
          </span>
          <span class="f1-sub-info">Calibrage actif ⚙️</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const STORAGE_KEY_DISMISSED = "mpp_dev_banner_dismissed";
const STORAGE_KEY_COLLAPSED = "mpp_dev_banner_collapsed";

const isDismissed = ref(false);
const isCollapsed = ref(false);

onMounted(() => {
  const savedDismissed = localStorage.getItem(STORAGE_KEY_DISMISSED);
  if (savedDismissed === "true") {
    isDismissed.value = true;
  } else {
    const savedCollapsed = localStorage.getItem(STORAGE_KEY_COLLAPSED);
    if (savedCollapsed !== null) {
      isCollapsed.value = savedCollapsed === "true";
    } else if (window.innerWidth < 768) {
      isCollapsed.value = true;
    }
  }
});

function dismissBanner() {
  isDismissed.value = true;
  localStorage.setItem(STORAGE_KEY_DISMISSED, "true");
}
</script>

<style scoped>
.f1-side-banner {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 999;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}

.f1-side-banner.is-hidden {
  display: none;
}

.f1-tab-collapsed {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #151b27;
  color: #ffb703;
  border: 1px solid rgba(255, 183, 3, 0.35);
  border-right: none;
  padding: 10px 14px 10px 12px;
  border-radius: 8px 0 0 8px;
  cursor: pointer;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.45);
  transition: all 0.2s ease;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.f1-tab-collapsed:hover {
  background: #1c2436;
  color: #fff;
  border-color: #ffb703;
  padding-left: 16px;
}

.f1-card-banner {
  display: flex;
  background: rgba(18, 23, 34, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 183, 3, 0.3);
  border-right: none;
  border-radius: 12px 0 0 12px;
  box-shadow: -6px 0 24px rgba(0, 0, 0, 0.55);
  width: 290px;
  overflow: hidden;
  animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.f1-kerb-stripe {
  width: 6px;
  flex-shrink: 0;
  background: repeating-linear-gradient(
    -45deg,
    #ffb703,
    #ffb703 10px,
    #151b27 10px,
    #151b27 20px
  );
}

.f1-banner-content {
  flex: 1;
  padding: 12px 14px;
  min-width: 0;
}

.f1-banner-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.f1-header-title {
  display: flex;
  align-items: center;
  gap: 6px;
}

.f1-tag-badge {
  font-size: 0.68rem;
  font-weight: 900;
  color: #ffb703;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.beacon-pulse,
.beacon-dot {
  width: 8px;
  height: 8px;
  background-color: #ffb703;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 8px #ffb703;
  animation: beaconBlink 1.8s infinite ease-in-out;
}

@keyframes beaconBlink {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.35;
    transform: scale(0.85);
  }
}

.f1-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.f1-btn-icon {
  background: transparent;
  border: none;
  color: #8392ab;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.f1-btn-icon:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.f1-banner-body {
  margin-bottom: 10px;
}

.f1-status-line {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 5px;
}

.flag-icon {
  font-size: 0.85rem;
}

.f1-status-text {
  font-size: 0.76rem;
  color: #f1f2f6;
  letter-spacing: 0.5px;
  font-weight: 800;
  text-transform: uppercase;
}

.f1-banner-desc {
  font-size: 0.72rem;
  color: #9aa8bd;
  line-height: 1.45;
  margin: 0;
}

.f1-banner-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 8px;
  margin-top: 4px;
}

.f1-telemetry-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.35);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.telemetry-label {
  font-size: 0.6rem;
  color: #64748b;
  font-weight: 800;
}

.telemetry-val {
  font-size: 0.62rem;
  color: #38bdf8;
  font-family: monospace;
  font-weight: 700;
}

.f1-sub-info {
  font-size: 0.64rem;
  color: #8392ab;
  font-weight: 600;
}

@media (max-width: 768px) {
  .f1-side-banner {
    top: auto;
    bottom: 18px;
    transform: none;
  }

  .f1-card-banner {
    width: 270px;
  }
}
</style>