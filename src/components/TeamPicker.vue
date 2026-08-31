<template>
  <div>
    <div
      :id="slotId"
      class="carte-selection-team"
      :style="{
        background: '#0f131c',
        border: valeurActuelle ? (isTop ? '2px solid #00e6c3' : '2px solid #ef4444') : '2px dashed #2d3954',
        borderRadius: '8px',
        height: '90px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isLocked ? 'not-allowed' : 'pointer',
        position: 'relative',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
        padding: '5px',
        opacity: isLocked ? 0.5 : 1,
        pointerEvents: isLocked ? 'none' : 'auto'
      }"
      @click="ouvrirModale"
    >
      <div v-if="!valeurActuelle" class="placeholder-team" style="text-align: center; color: #616e88; font-size: 12px; font-weight: bold;">
        ➕ CHOISIR<br /><span style="font-size: 10px; opacity: 0.7;">UNE ÉCURIE</span>
      </div>
      <img
        v-if="valeurActuelle && logoEcurie"
        class="logo-selectionne"
        :src="logoEcurie"
        style="height: 75%; max-width: 90%; object-fit: contain; z-index: 2;"
      />
      <div
        v-if="valeurActuelle"
        class="nom-selectionne"
        style="position: absolute; bottom: 2px; font-size: 10px; font-weight: bold; color: #fff; background: rgba(0,0,0,0.6); padding: 1px 6px; border-radius: 4px; text-transform: uppercase;"
      >
        {{ valeurActuelle }}
      </div>
    </div>

    <div
      v-if="modaleOuverte"
      style="position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:10000; display:flex; align-items:center; justify-content:center;"
      @click.self="fermerModale"
    >
      <div style="background:#1f293d; width:90%; max-width:500px; border-radius:12px; border:1px solid #2f3e56; padding:20px; position:relative; color:#fff;">
        <button
          style="position:absolute; top:12px; right:12px; background:transparent; border:none; color:#616e88; font-size:16px; cursor:pointer;"
          @click="fermerModale"
        >❌</button>
        <h3 style="margin-top:0; color:#ff8000; font-size:16px; margin-bottom:15px; text-transform:uppercase; letter-spacing:0.5px;">
          🏎️ Sélectionner l'écurie
        </h3>
        <p v-if="ecuriesDejaPrises.length" style="font-size:11px; color:#616e88; margin-top:-8px; margin-bottom:12px;">
          🔒 Une écurie déjà choisie ailleurs ne peut pas être reprise.
        </p>

        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; max-height:400px; overflow-y:auto; padding-right:5px;">
          <div
            style="background:rgba(239,68,68,0.1); border:1px dashed #ef4444; border-radius:8px; padding:10px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-weight:bold; color:#ef4444; font-size:12px;"
            @click="choisir('')"
          >
            ❌ VIDER L'EMPLACEMENT
          </div>
          <div
            v-for="ecurie in ecuriesSaison"
            :key="ecurie"
            :style="{
              background: '#111622',
              border: `1px solid ${ecuriesDejaPrises.includes(ecurie) ? '#3b4256' : '#2d3954'}`,
              borderRadius: '8px',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: ecuriesDejaPrises.includes(ecurie) ? 'not-allowed' : 'pointer',
              minHeight: '80px',
              opacity: ecuriesDejaPrises.includes(ecurie) ? 0.35 : 1
            }"
            @click="!ecuriesDejaPrises.includes(ecurie) && choisir(ecurie)"
          >
            <img
              :src="LOGOS_ECURIES_2026[ecurie] || ''"
              :style="{ maxHeight: '45px', maxWidth: '100%', objectFit: 'contain', marginBottom: '6px', filter: ecuriesDejaPrises.includes(ecurie) ? 'grayscale(100%)' : 'none' }"
            />
            <span style="font-size: 11px; font-weight: bold; color: #a0aec0; text-align: center; text-transform: uppercase;">
              {{ ecurie }}{{ ecuriesDejaPrises.includes(ecurie) ? ' 🔒' : '' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ecuriesSaison, LOGOS_ECURIES_2026 } from "../utils";
import { useGridStore } from "../stores";

const props = defineProps<{
  slotId: string; // "ecurie-top-1" | "ecurie-top-2" | "ecurie-flop-1" | "ecurie-flop-2"
  isLocked?: boolean;
}>();

const gridStore = useGridStore();
const modaleOuverte = ref(false);

const isTop = computed(() => props.slotId.includes("top"));
const valeurActuelle = computed(() => gridStore.ecuries[props.slotId]);
const logoEcurie = computed(() => valeurActuelle.value ? LOGOS_ECURIES_2026[valeurActuelle.value] : "");

const ecuriesDejaPrises = computed(() => {
  return Object.entries(gridStore.ecuries)
    .filter(([id, val]) => id !== props.slotId && val)
    .map(([, val]) => val);
});

function ouvrirModale() {
  if (props.isLocked) return;
  modaleOuverte.value = true;
}

function fermerModale() {
  modaleOuverte.value = false;
}

function choisir(nomEcurie: string) {
  gridStore.setEcurie(props.slotId, nomEcurie);
  fermerModale();
}
</script>