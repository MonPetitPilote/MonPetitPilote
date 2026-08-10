<template>
  <div id="modale-resultats" class="modal-back" style="display: none">
    <div
      class="modal-content-inner"
      style="max-width: 520px; max-height: 85vh; overflow-y: auto"
    >
      <span class="close-modal" id="btn-fermer-resultats">&times;</span>
      <h3
        style="
          color: #00d2d3;
          margin-top: 0;
          font-size: 1.3rem;
          border-bottom: 2px solid #2f3e56;
          padding-bottom: 10px;
          margin-bottom: 15px;
        "
      >
        📊 Résultats Officiels de la Saison
      </h3>

      <select
        id="select-resultats-course"
        style="width: 100%; margin-bottom: 18px"
      ></select>

      <div id="zone-resultat-gp">
        <p style="color: #aaa; font-style: italic; text-align: center">
          Sélectionne un Grand Prix pour voir le résultat officiel.
        </p>
      </div>
    </div>
  </div>
</template>
