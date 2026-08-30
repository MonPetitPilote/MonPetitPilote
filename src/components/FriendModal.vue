<template>
  <div
    id="modale-prono-ami"
    class="modal-back"
    v-show="gridStore.friendModalVisible"
    @click.self="gridStore.setFriendModalVisible(false)"
  >
    <div
      class="modal-content-inner"
      style="max-width: 520px; max-height: 85vh; overflow-y: auto"
    >
      <span
        class="close-modal"
        id="btn-fermer-prono-ami"
        @click="gridStore.setFriendModalVisible(false)"
        >&times;</span
      >
      <div id="zone-prono-ami"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGridStore } from "../stores";

const gridStore = useGridStore();
</script>