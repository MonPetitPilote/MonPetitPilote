// Stockage des informations esthétiques chargées depuis OpenF1
let designPilotesF1 = {};

// Fonction magique qui va chercher les visages officiels et les couleurs sur OpenF1
async function chargerDonneesEsthetiquesF1() {
    try {
        const response = await fetch('https://api.openf1.org/v1/drivers?session_key=latest');
        const drivers = await response.json();
        
        drivers.forEach(d => {
            const nomComplet = `${d.first_name} ${d.last_name}`;
            designPilotesF1[nomComplet] = {
                photo: d.headshot_url || 'https://media.formula1.com/d_driver_fallback_image.png',
                couleur: `#${d.team_colour || '242f46'}`,
                ecurie: d.team_name
            };
        });
        console.log("🏎️ Base de données visuelle OpenF1 initialisée avec succès !");
        
        // On force le rafraîchissement de la grille avec les visages reçus
        creerLaGrilleDeDepartTV();
    } catch (e) {
        console.error("Impossible de récupérer les images de l'API OpenF1", e);
        // Si l'API échoue, on génère quand même la grille sans visages
        creerLaGrilleDeDepartTV();
    }
}

// Fonction qui construit les 10 slots asymétriques de F1
function creerLaGrilleDeDepartTV() {
    const conteneurGrille = document.getElementById('grille-pronos');
    if (!conteneurGrille) return;
    
    conteneurGrille.innerHTML = ""; // On nettoie

    // On crée les 10 positions de la grille de départ
    for (let i = 1; i <= 10; i++) {
        const slot = document.createElement('div');
        slot.className = 'grid-slot';
        slot.setAttribute('data-pos', i);

        // Variables par défaut si aucun pilote n'est encore sélectionné dans la liste déroulante
        let photoPilote = "https://media.formula1.com/d_driver_fallback_image.png"; 
        let couleurEcurie = "#242f46";
        let nomEcurie = "Écurie non définie";

        // Génération des options du menu déroulant (Select)
        let optionsHtml = `<option value="">-- Choisir P${i} --</option>`;
        pilotesData.forEach(p => {
            optionsHtml += `<option value="${p.nom}">${p.nom}</option>`;
        });

        // HTML final pour l'emplacement sur la grille de départ
        slot.innerHTML = `
            <div class="grid-pos-badge">P${i}</div>
            <div class="grid-driver-avatar">
                <img id="img-grid-p${i}" src="${photoPilote}" alt="Pilote">
            </div>
            <div class="grid-driver-info">
                <select id="select-grid-p${i}" class="grid-select-paddock" data-position="${i}">
                    ${optionsHtml}
                </select>
                <div id="team-grid-p${i}" class="grid-driver-team">${nomEcurie}</div>
            </div>
        `;

        conteneurGrille.appendChild(slot);

        // Écouteur de changement : Dès qu'un joueur choisit un pilote, l'image et la couleur se mettent à jour en direct !
        const selectElement = slot.querySelector('select');
        selectElement.addEventListener('change', function() {
            const piloteSelectionne = this.value;
            const imgTarget = document.getElementById(`img-grid-p${i}`);
            const teamTarget = document.getElementById(`team-grid-p${i}`);
            
            if (piloteSelectionne && designPilotesF1[piloteSelectionne]) {
                const infos = designPilotesF1[piloteSelectionne];
                imgTarget.src = infos.photo;
                teamTarget.innerText = infos.ecurie;
                slot.style.borderRight = `4px solid ${infos.couleur}`;
            } else {
                imgTarget.src = "https://media.formula1.com/d_driver_fallback_image.png";
                teamTarget.innerText = "Écurie non définie";
                slot.style.borderRight = `4px solid #2d3954`;
            }
        });
    }
}

// Lancer le chargement au démarrage du site
chargerDonneesEsthetiquesF1();
