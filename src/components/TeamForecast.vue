<template>
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
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px">
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
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px">
          <div id="ecurie-flop-1" class="carte-selection-team"></div>
          <div id="ecurie-flop-2" class="carte-selection-team"></div>
        </div>
      </div>
    </div>
  </div>
</template>
