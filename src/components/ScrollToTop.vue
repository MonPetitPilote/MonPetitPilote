<template>
  <button
    v-show="isVisible"
    id="btn-scroll-to-top"
    type="button"
    class="scroll-to-top-btn"
    title="Retour en haut de grille"
    aria-label="Retour en haut de la page"
    @click="scrollToTop"
  >
    <span class="scroll-arrow">▲</span>
    <span class="scroll-label">TOP</span>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const isVisible = ref(false);

function checkScroll() {
  isVisible.value = window.scrollY > 320;
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

onMounted(() => {
  window.addEventListener("scroll", checkScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("scroll", checkScroll);
});
</script>

<style scoped>
.scroll-to-top-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 900;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 48px;
  background: #141c2c;
  color: #ff8000;
  border: 1px solid rgba(255, 128, 0, 0.4);
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  padding: 0;
}

.scroll-to-top-btn:hover {
  background: #ff8000;
  color: #fff;
  border-color: #ff8000;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(255, 128, 0, 0.4);
}

.scroll-arrow {
  font-size: 0.85rem;
  line-height: 1;
  font-weight: 900;
}

.scroll-label {
  font-size: 0.58rem;
  font-weight: 900;
  letter-spacing: 0.5px;
  margin-top: 2px;
}

@media (max-width: 768px) {
  .scroll-to-top-btn {
    bottom: 74px; /* Évite de chevaucher les éléments bas */
    right: 16px;
    width: 40px;
    height: 44px;
  }
}
</style>
