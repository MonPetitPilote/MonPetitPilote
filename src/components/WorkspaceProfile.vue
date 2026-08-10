<template>
    <div id="workspace-profil" style="display: none; margin-bottom: 35px;">
        <div class="colonne-gauche" style="width: 100%;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2d3954; padding-bottom: 10px; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #ff8000;">🏁 VOTRE ESPACE PERFORMANCES</h2>
                <button id="btn-retour-pronos" style="background: #242f46; color: white; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-weight: bold;">← RETOUR AUX PRONOS</button>
            </div>

            <div id="profil-badges" style="background: #0f131c; padding: 20px; border-radius: 10px; border: 1px solid #2d3954; margin-bottom: 20px;">
                <h3 style="margin-top: 0; margin-bottom: 5px; color: #00d2d3;">🎖️ Vos badges de la saison</h3>
                <p style="font-size: 0.8rem; color: #aaa; margin-top: 0; margin-bottom: 15px;">Un badge s'obtient en étant, à date, le joueur (ou l'un des joueurs) en tête sur ce critère. Il peut donc changer de mains au fil de la saison.</p>
                <div id="profil-badges-liste" style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 20px;">
                    <p style="color: #aaa; font-style: italic;">Chargement...</p>
                </div>

                <h3 style="margin-bottom: 5px; color: #ff8000; border-top: 1px solid #2d3954; padding-top: 15px;">🏅 Qui est en tête sur chaque critère ?</h3>
                <p style="font-size: 0.8rem; color: #aaa; margin-top: 0; margin-bottom: 15px;">Le classement complet, badge par badge — de quoi savoir qui est devant qui, et grâce à quoi.</p>
                <div id="profil-classement-badges" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                    <p style="color: #aaa; font-style: italic;">Chargement...</p>
                </div>
            </div>

            <!-- GRAPHIQUE D'ÉVOLUTION DU CLASSEMENT -->
            <div id="bloc-graphique-evolution" style="background: #0f131c; padding: 20px; border-radius: 10px; border: 1px solid #2d3954; margin-bottom: 20px; display: none;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 15px; border-bottom: 1px solid #242f46; padding-bottom: 12px;">
                    <div>
                        <h3 style="margin: 0; color: #ff8000; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
                            📈 ÉVOLUTION DU CLASSEMENT AU FIL DE LA SAISON
                        </h3>
                        <p id="graphique-sous-titre" style="font-size: 0.8rem; color: #a5b1c2; margin: 4px 0 0 0;">
                            Comparatif de vos performances avec vos rivaux directs au classement.
                        </p>
                    </div>
                    <div style="display: flex; background: #141c2e; padding: 3px; border-radius: 6px; border: 1px solid #2d3954;">
                        <button id="btn-graph-mode-points" class="btn-graph-mode active" style="background: #ff8000; color: #fff; border: none; padding: 5px 12px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; cursor: pointer; transition: all 0.2s;">
                            📊 Points Cumulés
                        </button>
                        <button id="btn-graph-mode-rang" class="btn-graph-mode" style="background: transparent; color: #a5b1c2; border: none; padding: 5px 12px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; cursor: pointer; transition: all 0.2s;">
                            🏆 Position (#1, #2...)
                        </button>
                    </div>
                </div>
                
                <div style="position: relative; height: 280px; width: 100%;">
                    <canvas id="graphique-classement"></canvas>
                </div>
            </div>

            <div class="main-layout profil-layout">
                <div class="profil-analyse-col">
                    <h3 style="margin-top: 0; color: #00d2d3;">📊 Analyse du GP sélectionné</h3>
                    <div id="profil-detail-gp">
                        <p style="color: #aaa; font-style: italic;">Sélectionnez un week-end ci-dessous pour voir le détail de vos points.</p>
                    </div>
                </div>

                <div class="profil-historique-col">
                    <h3 style="margin-top: 0; color: #ff8000;">🕒 Historique de la saison</h3>
                    <div class="tableau-scores">
                        <div class="entete-scores" style="grid-template-columns: 1fr 100px;">
                            <div>Grand Prix</div>
                            <div style="text-align: right;">Points</div>
                        </div>
                        <div id="profil-liste-gps">
                            <div style="padding: 15px; text-align: center; color: #aaa;">Aucune donnée enregistrée.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>