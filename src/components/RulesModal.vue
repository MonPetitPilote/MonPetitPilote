<template>
  <div
    id="modale-reglement"
    class="modal-back"
    @click.self="$emit('close')"
  >
    <div
      style="
        background: #1f293d;
        padding: 24px;
        border-radius: 8px;
        max-width: 550px;
        width: 90%;
        max-height: 85vh;
        overflow-y: auto;
        border: 1px solid #2f3e56;
        color: #fff;
        position: relative;
        font-family: sans-serif;
        line-height: 1.4;
        box-sizing: border-box;
      "
    >
      <button
        id="btn-fermer-reglement"
        style="
          position: absolute;
          top: 15px;
          right: 15px;
          background: transparent;
          border: none;
          color: #616e88;
          font-size: 1.2rem;
          cursor: pointer;
        "
        @click="$emit('close')"
      >
        ❌
      </button>

      <h3
        style="
          color: #ff8000;
          margin-top: 0;
          font-size: 1.4rem;
          border-bottom: 2px solid #2f3e56;
          padding-bottom: 10px;
          margin-bottom: 15px;
        "
      >
        📜 Barème & Règlement du Jeu
      </h3>

      <p
        style="
          font-size: 0.85rem;
          color: #a0aec0;
          margin-bottom: 15px;
          font-style: italic;
        "
      >
        🚨 Vos pronostics doivent être validés et enregistrés sur le site avant
        le début officiel de la séance de qualifications de chaque week-end.
      </p>

      <div style="margin-bottom: 15px">
        <h4 style="color: #ff8000; margin: 0 0 5px 0; font-size: 1.05rem">
          1. Le Top 10 Pilotes
        </h4>
        <p style="margin: 0 0 5px 0; font-size: 0.9rem">
          Vos choix pour les 10 premières places de la course sont comparés aux
          résultats officiels :
        </p>
        <ul
          style="
            margin: 0;
            padding-left: 20px;
            font-size: 0.85rem;
            color: #e2e8f0;
            list-style-type: square;
          "
        >
          <li style="margin-bottom: 4px">
            <strong style="color: #22c55e">Position exacte :</strong> Vous
            marquez l'intégralité des points du barème F1 officiel :<br />
            <span
              style="
                color: #cbd5e1;
                font-size: 0.8rem;
                display: block;
                margin-top: 2px;
              "
            >
              P1: 25 | P2: 18 | P3: 15 | P4: 12 | P5: 10 <br />
              P6: 8 &nbsp;| P7: 6 &nbsp;| P8: 4 &nbsp;| P9: 2 &nbsp;| P10: 1
            </span>
          </li>
          <li>
            <strong style="color: #3b82f6">Position erronée :</strong> Si un
            pilote pronostiqué termine dans le Top 10 officiel mais pas à la
            place exacte prévue, vous marquez un
            <strong>point de consolation (+2 pts)</strong>.
          </li>
        </ul>
      </div>

      <div style="margin-bottom: 15px">
        <h4 style="color: #ff8000; margin: 0 0 5px 0; font-size: 1.05rem">
          2. Le Bonus Poleman
        </h4>
        <p style="margin: 0; font-size: 0.9rem">
          Si le pilote sélectionné comme « Poleman » décroche la première place
          (P1) lors de la séance officielle de qualifications, vous empochez un
          bonus fixe de <strong style="color: #22c55e">+5 points</strong>.
        </p>
      </div>

      <div style="margin-bottom: 15px">
        <h4 style="color: #ff8000; margin: 0 0 5px 0; font-size: 1.05rem">
          3. Pronostics Écuries (Top / Flop) 🏎️
        </h4>
        <p style="margin: 0 0 5px 0; font-size: 0.9rem">
          Les écuries sont réparties dynamiquement selon le <strong>classement constructeurs officiel</strong> avant chaque GP :
        </p>
        <div style="background: rgba(15, 23, 42, 0.6); padding: 8px 12px; border-radius: 6px; margin-bottom: 8px; font-size: 0.82rem; border-left: 3px solid #ff8000;">
          <strong>🏆 Cadors :</strong> Top 4 du championnat | 
          <strong>🛡️ Milieu :</strong> 5e à 7e place | 
          <strong>⚡ Outsiders :</strong> 8e à 11e place
        </div>
        <p style="margin: 0 0 4px 0; font-size: 0.85rem; color: #38bdf8; font-weight: bold;">
          🚀 Écuries Top (Top 1 & Top 2) — Par ordre de priorité :
        </p>
        <ul style="margin: 0 0 10px 0; padding-left: 20px; font-size: 0.82rem; color: #e2e8f0; list-style-type: square;">
          <li><strong style="color: #22c55e">Prio 1 (Outsiders) :</strong> <strong>+6 pts</strong> si 2 pilotes dans le Top 10 | <strong>+4 pts</strong> si au moins 1 pilote dans le Top 10.</li>
          <li><strong style="color: #22c55e">Prio 2 (Milieu) :</strong> <strong>+5 pts</strong> si 2 pilotes dans le Top 10 | <strong>+3 pts</strong> si au moins 1 pilote dans le Top 6 / Podium.</li>
          <li><strong style="color: #22c55e">Prio 3 (Cadors) :</strong> <strong>+5 pts</strong> si victoire P1 (+3 pts pour Top 2) | <strong>+3 pts</strong> si 2 voitures dans le Top 5 du GP.</li>
        </ul>
        <p style="margin: 0 0 4px 0; font-size: 0.85rem; color: #f87171; font-weight: bold;">
          ⚠️ Écuries Flop (Flop 1 & Flop 2) — Par ordre de priorité :
        </p>
        <ul style="margin: 0; padding-left: 20px; font-size: 0.82rem; color: #e2e8f0; list-style-type: square;">
          <li><strong style="color: #22c55e">Prio 1 (Cadors) :</strong> <strong>+5 pts</strong> si 0 point ou double DNF | <strong>+4 pts</strong> si 1 DNF et meilleur pilote P7 ou pire | <strong>+3 pts</strong> si 0 pilote dans le Top 5.</li>
          <li><strong style="color: #22c55e">Prio 2 (Milieu) :</strong> <strong>+3 pts</strong> si 0 point marqué sur le GP.</li>
          <li><strong style="color: #22c55e">Prio 3 (Outsiders) :</strong> <strong>+2 pts</strong> si 0 point marqué sur le GP.</li>
          <li><strong style="color: #ef4444">Pénalité Ultime :</strong> <strong>-4 pts</strong> si l'écurie en Flop gagne la course (P1) ou monte sur le podium.</li>
        </ul>
      </div>

      <div style="margin-bottom: 15px">
        <h4 style="color: #ff8000; margin: 0 0 5px 0; font-size: 1.05rem">
          4. Prédictions Bonus du Week-end 🎲
        </h4>
        <p style="margin: 0 0 5px 0; font-size: 0.9rem">
          Quatre questions bonus supplémentaires par Grand Prix, chacune valant
          <strong style="color: #22c55e">+2 points</strong> si la bonne réponse
          est donnée :
        </p>
        <ul
          style="
            margin: 0;
            padding-left: 20px;
            font-size: 0.85rem;
            color: #e2e8f0;
          "
        >
          <li style="margin-bottom: 3px">🚨 Y aura-t-il une Safety Car ?</li>
          <li style="margin-bottom: 3px">🔴 Y aura-t-il un Drapeau Rouge ?</li>
          <li style="margin-bottom: 3px">💥 Nombre exact d'abandons (DNF) ?</li>
          <li>🏆 Le poleman finira-t-il sur le podium ?</li>
        </ul>
      </div>

      <div style="margin-bottom: 15px">
        <h4 style="color: #ff8000; margin: 0 0 5px 0; font-size: 1.05rem">
          5. Le Multiplicateur Joker 👑
        </h4>
        <p style="margin: 0; font-size: 0.9rem">
          Si vous cochez la case Joker sur un Grand Prix, l'intégralité des
          points accumulés lors de ce week-end (Pilotes + Pole + Écuries +
          Bonus) est automatiquement
          <strong style="color: #ff8000">doublée (x2)</strong> !
        </p>
      </div>

      <div style="margin-bottom: 15px">
        <h4 style="color: #ff8000; margin: 0 0 5px 0; font-size: 1.05rem">
          6. Les Ligues 🏆
        </h4>
        <p style="margin: 0; font-size: 0.9rem">
          Vous pouvez créer ou rejoindre des ligues privées entre amis (avec un
          code d'invitation) pour avoir votre propre classement, en plus du
          classement "Mondial" qui regroupe tous les joueurs.
        </p>
      </div>

      <div style="margin-bottom: 15px">
        <h4 style="color: #ff8000; margin: 0 0 5px 0; font-size: 1.05rem">
          7. Les Badges de la Saison 🎖️
        </h4>
        <p style="margin: 0 0 8px 0; font-size: 0.9rem">
          En plus du classement par points, 5 badges récompensent des exploits
          précis sur l'ensemble de la saison. Ils s'affichent à côté du pseudo
          dans le classement et sont visibles dans « Mon Profil ». Un badge peut
          changer de mains à tout moment si un autre joueur prend l'avantage sur
          ce critère :
        </p>
        <ul
          style="
            margin: 0;
            padding-left: 20px;
            font-size: 0.85rem;
            color: #e2e8f0;
          "
        >
          <li style="margin-bottom: 4px">
            🎯 <strong>Roi de la Pole</strong> : le plus de pronostics de Pole
            Position corrects.
          </li>
          <li style="margin-bottom: 4px">
            🏆 <strong>Chasseur de Vainqueur</strong> : le plus de fois où le
            vainqueur du GP (P1) a été deviné.
          </li>
          <li style="margin-bottom: 4px">
            🥇 <strong>Podium Parfait</strong> : le plus de fois où le podium
            complet (P1, P2, P3) a été deviné dans l'ordre exact.
          </li>
          <li style="margin-bottom: 4px">
            🃏 <strong>Coup de Folie</strong> : a misé, avec succès, le plus
            grand nombre de fois sur un pilote d'écurie outsider placé dans son
            Top 10 (ex : un pilote d'une petite écurie qui crée la surprise).
          </li>
          <li>
            🥶 <strong>Boulet de la Saison</strong> : cumule le plus grand
            nombre de pronostics ratés (pilotes finalement hors du Top 10 réel).
            Un badge... qu'on préfère éviter !
          </li>
        </ul>
      </div>

      <div>
        <h4 style="color: #ff8000; margin: 0 0 5px 0; font-size: 1.05rem">
          8. Fair-Play : les pronos des autres joueurs
        </h4>
        <p style="margin: 0; font-size: 0.9rem">
          Vous pouvez consulter le pronostic de n'importe quel ami en cliquant
          sur son nom dans le classement général. Par équité, ceci n'est
          possible
          <strong
            >qu'une fois le week-end du Grand Prix sélectionné terminé</strong
          >
          — impossible de copier un prono avant la clôture !
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits(["close"]);
</script>
