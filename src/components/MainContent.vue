<template>
  <div id="main-content-pronos" class="main-layout">
    <div class="colonne-gauche">
      <div
        class="section-ligue"
        style="
          margin-bottom: 18px;
          background: #1b2436;
          padding: 14px;
          border-radius: 8px;
          border-left: 4px solid #ff8000;
        "
      >
        <label
          for="select-ligue"
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
            font-weight: bold;
            font-size: 0.9rem;
            color: #ff8000;
          "
        >
          <span>🏆 MA LIGUE ACTIVE :</span>
          <button
            id="btn-gerer-ligues"
            type="button"
            style="
              background: #3b4b6b;
              color: white;
              border: none;
              padding: 5px 10px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 0.75rem;
              font-weight: bold;
            "
            @click="$emit('open-league-modal')"
          >
            ⚙️ CRÉER / REJOINDRE
          </button>
        </label>
        <select
          id="select-ligue"
          style="width: 100%; box-sizing: border-box"
        ></select>
      </div>

      <div class="section-course">
        <label
          for="select-course"
          style="display: block; margin-bottom: 8px; font-weight: bold"
          >SÉLECTIONNER LE WEEK-END :</label
        >
        <select id="select-course"></select>
      </div>

      <div
        id="banniere-verrouillage"
        style="
          display: none;
          align-items: center;
          gap: 10px;
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid #ef4444;
          color: #ef4444;
          padding: 10px 14px;
          border-radius: 6px;
          margin-top: 10px;
          font-weight: bold;
          font-size: 0.85rem;
        "
      >
        🔒 Les pronostics pour ce Grand Prix sont clôturés (le week-end a déjà
        eu lieu).
      </div>

      <div id="countdown-pronos" style="display: none"></div>

      <div
        class="section-pole"
        style="
          margin-top: 20px;
          background: #222c43;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #00d2d3;
        "
      >
        <label
          for="select-pole"
          style="
            color: #00d2d3;
            display: block;
            font-weight: bold;
            margin-bottom: 8px;
            font-size: 0.9rem;
          "
          >⚡ PRONO FLASH : QUI FERA LA POLE POSITION LE SAMEDI ?</label
        >
        <select id="select-pole"></select>
      </div>

      <!-- Section Week-end Sprint Top 5 -->
      <div
        id="section-sprint-container"
        style="
          display: none;
          margin-top: 20px;
          background: linear-gradient(135deg, #171f38 0%, #1f274a 100%);
          border: 1px solid #3730a3;
          border-radius: 10px;
          padding: 16px;
          box-shadow: 0 8px 24px rgba(79, 70, 229, 0.15);
        "
      >
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 12px;
          "
        >
          <div style="display: flex; align-items: center; gap: 8px;">
            <span
              style="
                background: #6366f1;
                color: white;
                font-size: 0.7rem;
                font-weight: 800;
                padding: 3px 8px;
                border-radius: 999px;
                letter-spacing: 0.5px;
                text-transform: uppercase;
              "
              >⚡ WEEK-END SPRINT</span
            >
            <h3
              id="titre-grille-sprint"
              style="margin: 0; font-size: 1.15rem; color: #a5b4fc; font-weight: 800;"
            >
              🏆 TA GRILLE DE DÉPART TOP 5 SPRINT :
            </h3>
          </div>
          <button
            id="btn-sprint-aleatoire"
            type="button"
            style="
              background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
              color: white;
              border: none;
              padding: 6px 12px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 0.8rem;
              font-weight: bold;
              box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
            "
          >
            🎲 SPRINT ALÉATOIRE
          </button>
        </div>

        <div
          style="
            background: rgba(99, 102, 241, 0.12);
            border-left: 3px solid #818cf8;
            padding: 8px 12px;
            border-radius: 6px;
            margin-bottom: 14px;
            font-size: 0.8rem;
            color: #c7d2fe;
          "
        >
          ℹ️ <strong>Règles Sprint :</strong> Pronostiquez les 5 premiers de la course Sprint.
          <span style="color: #93c5fd; margin-left: 4px;"
            >(P1: <strong>+5 pts</strong> • P2: <strong>+4 pts</strong> • P3: <strong>+3 pts</strong> • P4: <strong>+2 pts</strong> • P5: <strong>+1 pt</strong> • Présence Top 5: <strong>+1 pt</strong>)</span
          >
        </div>

        <div id="grille-sprint-slots" class="sprint-slots-grid"></div>
      </div>

      <StartingGrid ref="startingGridRef" />

      <div
        style="
          margin: 20px 0;
          background: #1b2436;
          padding: 12px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px dashed #ff8000;
        "
      >
        <input
          type="checkbox"
          id="check-joker"
          style="transform: scale(1.4); cursor: pointer; flex-shrink: 0"
        />
        <span
          id="joker-status-text"
          style="color: #ff8000; font-weight: bold; font-size: 0.9rem"
          >🚀 Activer mon unique Joker (+300% de points !)</span
        >
      </div>

      <button id="btn-valider">🏁 VALIDER MES PRONOSTICS</button>
    </div>

    <div
      class="colonne-droite"
      style="display: flex; flex-direction: column; gap: 30px"
    >
      <FriendsRanking />
      <div
        class="section-top-flop"
        style="
          background: #222c43;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #e10600;
        "
      >
        <h3
          style="
            margin-top: 0;
            color: #fff;
            font-size: 1.1rem;
            letter-spacing: 0.5px;
          "
        >
          🏎️ PRONOSTIC ÉCURIES (TOP / FLOP)
        </h3>
        <div
          class="ecuries-block"
          style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-top: 15px;
          "
        >
          <div>
            <h4
              style="
                color: #00e6c3;
                font-size: 13px;
                text-transform: uppercase;
                margin-bottom: 8px;
              "
            >
              🚀 Top Écuries (Bonus)
            </h4>
            <div
              style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px"
            >
              <div id="ecurie-top-1" class="carte-selection-team"></div>
              <div id="ecurie-top-2" class="carte-selection-team"></div>
            </div>
          </div>

          <div>
            <h4
              style="
                color: #ef4444;
                font-size: 13px;
                text-transform: uppercase;
                margin-bottom: 8px;
              "
            >
              ⚠️ Flop Écuries (Malus)
            </h4>
            <div
              style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px"
            >
              <div id="ecurie-flop-1" class="carte-selection-team"></div>
              <div id="ecurie-flop-2" class="carte-selection-team"></div>
            </div>
          </div>
        </div>
      </div>
      <div
        class="section-predictions-bonus"
        style="
          background: #222c43;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #00d2d3;
        "
      >
        <h3
          style="
            margin-top: 0;
            color: #fff;
            font-size: 1.1rem;
            letter-spacing: 0.5px;
          "
        >
          🎲 PRÉDICTIONS BONUS DU WEEK-END
        </h3>
        <p
          style="
            margin: 0 0 15px 0;
            font-size: 0.78rem;
            color: #aaa;
            font-style: italic;
          "
        >
          +2 points par bonne réponse (x2 avec le Joker).
        </p>

        <div style="display: flex; flex-direction: column; gap: 14px">
          <div class="ligne-bonus">
            <label
              style="
                display: block;
                font-size: 0.85rem;
                font-weight: bold;
                margin-bottom: 6px;
              "
              >🚨 Y aura-t-il une Safety Car ?</label
            >
            <div class="toggle-oui-non" data-bonus="safetyCar">
              <button type="button" class="btn-toggle-bonus" data-valeur="true">
                OUI
              </button>
              <button
                type="button"
                class="btn-toggle-bonus"
                data-valeur="false"
              >
                NON
              </button>
            </div>
          </div>

          <div class="ligne-bonus">
            <label
              style="
                display: block;
                font-size: 0.85rem;
                font-weight: bold;
                margin-bottom: 6px;
              "
              >🔴 Y aura-t-il un Drapeau Rouge ?</label
            >
            <div class="toggle-oui-non" data-bonus="drapeauRouge">
              <button type="button" class="btn-toggle-bonus" data-valeur="true">
                OUI
              </button>
              <button
                type="button"
                class="btn-toggle-bonus"
                data-valeur="false"
              >
                NON
              </button>
            </div>
          </div>

          <div class="ligne-bonus">
            <label
              for="input-nombre-dnf"
              style="
                display: block;
                font-size: 0.85rem;
                font-weight: bold;
                margin-bottom: 6px;
              "
              >💥 Nombre d'abandons (DNF) ?</label
            >
            <input
              type="number"
              id="input-nombre-dnf"
              min="0"
              max="20"
              placeholder="Ex : 3"
              style="width: 100%; box-sizing: border-box"
            />
          </div>

          <div class="ligne-bonus">
            <label
              style="
                display: block;
                font-size: 0.85rem;
                font-weight: bold;
                margin-bottom: 6px;
              "
              >🏆 Le poleman finira-t-il sur le podium ?</label
            >
            <div class="toggle-oui-non" data-bonus="polemanPodium">
              <button type="button" class="btn-toggle-bonus" data-valeur="true">
                OUI
              </button>
              <button
                type="button"
                class="btn-toggle-bonus"
                data-valeur="false"
              >
                NON
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FriendsRanking from "./FriendsRanking.vue";
import StartingGrid from "./StartingGrid.vue";
import { ref } from "vue";
import { useGridStore } from "../stores";

const gridStore = useGridStore();
const startingGridRef = ref<InstanceType<typeof StartingGrid> | null>(null);

defineExpose({ startingGridRef });

defineEmits(["open-league-modal"]);
</script>