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

      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 25px;
          flex-wrap: wrap;
          gap: 10px;
        "
      >
        <h2 style="margin: 0; font-size: 1.3rem" id="titre-grille">
          🏆 TA GRILLE DE DÉPART TOP 10 :
        </h2>
        <button
          id="btn-aleatoire"
          style="
            background: #3b4b6b;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.85rem;
            font-weight: bold;
            transition: background 0.2s;
          "
        >
          🎲 PRONO ALÉATOIRE
        </button>
      </div>

      <div id="grille-pronos" class="f1-starting-grid"></div>

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

<script setup lang="js">
import FriendsRanking from "./FriendsRanking.vue";
</script>