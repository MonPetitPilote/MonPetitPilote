<template>
  <div
    id="bloc-citation-paddock"
    style="
      background: linear-gradient(135deg, #141c2e 0%, #0f131c 100%);
      border: 1px solid #2d3954;
      border-left: 4px solid #ff8000;
      border-radius: 8px;
      padding: 14px 18px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    "
  >
    <div style="flex: 1; min-width: 260px">
      <div
        style="
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: bold;
          color: #ff8000;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 6px;
        "
      >
        <span>🎙️ TA CITATION DU JOUR</span>
      </div>
      <div
        id="texte-citation-paddock"
        style="
          font-size: 0.95rem;
          font-weight: bold;
          color: #f8fafc;
          font-style: italic;
        "
      >
        "MONSIEUR PIERRE GASLY ! ACCÉLÈRE, ACCÉLÈRE !"
      </div>
      <div
        id="auteur-citation-paddock"
        style="font-size: 0.8rem; color: #a5b1c2; margin-top: 2px"
      >
        — Julien Fébreau (GP d'Italie 2020)
      </div>
    </div>
    <button
      id="btn-changer-citation"
      style="
        background: rgba(255, 128, 0, 0.15);
        color: #ff8000;
        border: 1px solid #ff8000;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 0.8rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
      "
    >
      🎲 Une autre citation
    </button>
  </div>
</template>
