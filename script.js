// Configuration Firebase (Pense à laisser TES clés ici !)
const firebaseConfig = {
  apiKey: "TON_API_KEY",
  authDomain: "TON_AUTH_DOMAIN",
  projectId: "TON_PROJECT_ID",
  storageBucket: "TON_STORAGE_BUCKET",
  messagingSenderId: "TON_MESSAGING_SENDER_ID",
  appId: "TON_APP_ID"
};

if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    var db = firebase.firestore();
}

// Base de données des pilotes F1 2026 avec statut de performance équitable
// Catégories : "favori" (Top Teams), "outsider" (Milieu), "fond" (Fin de grille)
const pilotesData = [
  {nom: "Max Verstappen", ecurie: "Red Bull", statut: "favori", img: "https://cdn-1.motorsport.com/images/vcl/X0kvd86d/s3/red-bull-racing-rb22.png"},
  {nom: "Isack Hadjar", ecurie: "Red Bull", statut: "outsider", img: "https://cdn-1.motorsport.com/images/vcl/X0kvd86d/s3/red-bull-racing-rb22.png"},
  {nom: "Lewis Hamilton", ecurie: "Ferrari", statut: "favori", img: "https://cdn-9.motorsport.com/images/vcl/jYNlMJ0D/s3/ferrari-sf-26.png"},
  {nom: "Charles Leclerc", ecurie: "Ferrari", statut: "favori", img: "https://cdn-9.motorsport.com/images/vcl/jYNlMJ0D/s3/ferrari-sf-26.png"},
  {nom: "Lando Norris", ecurie: "McLaren", statut: "favori", img: "https://cdn-2.motorsport.com/images/vcl/p2wyqb6Q/s3/mclaren-mcl40.png"},
  {nom: "Oscar Piastri", ecurie: "McLaren", statut: "favori", img: "https://cdn-2.motorsport.com/images/vcl/p2wyqb6Q/s3/mclaren-mcl40.png"},
  {nom: "George Russell", ecurie: "Mercedes", statut: "favori", img: "https://cdn-8.motorsport.com/images/vcl/z0qrdy2N/s3/mercedes-mgp-w17.png"},
  {nom: "Kimi Antonelli", ecurie: "Mercedes", statut: "favori", img: "https://cdn-8.motorsport.com/images/vcl/z0qrdy2N/s3/mercedes-mgp-w17.png"},
  {nom: "Fernando Alonso", ecurie: "Aston Martin", statut: "outsider", img: "https://cdn-2.motorsport.com/images/vcl/vYMl7G2E/s3/aston-martin-amr26.png"},
  {nom: "Lance Stroll", ecurie: "Aston Martin", statut: "outsider", img: "https://cdn-2.motorsport.com/images/vcl/vYMl7G2E/s3/aston-martin-amr26.png"},
  {nom: "Pierre Gasly", ecurie: "Alpine", statut: "outsider", img: "https://cdn-3.motorsport.com/images/vcl/q633Z46A/s3/alpine-a526.png"},
  {nom: "Franco Colapinto", ecurie: "Alpine", statut: "outsider", img: "https://cdn-3.motorsport.com/images/vcl/q633Z46A/s3/alpine-a526.png"},
  {nom: "Carlos Sainz", ecurie: "Williams", statut: "outsider", img: "https://cdn-7.motorsport.com/images/vcl/B2G3Vr29/s3/williams-fw48.png"},
  {nom: "Alex Albon", ecurie: "Williams", statut: "outsider", img: "https://cdn-7.motorsport.com/images/vcl/B2G3Vr29/s3/williams-fw48.png"},
  {nom: "Liam Lawson", ecurie: "Racing Bulls", statut: "fond", img: "https://cdn-2.motorsport.com/images/vcl/G2ewOP6o/s3/racing-bulls-vcarb03.png"},
  {nom: "Arvid Lindblad", ecurie: "Racing Bulls", statut: "fond", img: "https://cdn-2.motorsport.com/images/vcl/G2ewOP6o/s3/racing-bulls-vcarb03.png"},
  {nom: "Nico Hülkenberg", ecurie: "Audi", statut: "fond", img: "https://cdn-8.motorsport.com/images/vcl/x27BRO0E/s3/audi-r26-2.png"},
  {nom: "Gabriel Bortoleto", ecurie: "Audi", statut: "fond", img: "https://cdn-8.motorsport.com/images/vcl/x27BRO0E/s3/audi-r26-2.png"},
  {nom: "Oliver Bearman", ecurie: "Haas", statut: "fond", img: "https://cdn-6.motorsport.com/images/vcl/e2dwbn0J/s3/haas-vf-26.png"},
  {nom: "Esteban Ocon", ecurie: "Haas", statut: "fond", img: "https://cdn-6.motorsport.com/images/vcl/e2dwbn0J/s3/haas-vf-26.png"},
  {nom: "Valtteri Bottas", ecurie: "Cadillac", statut: "fond", img: "https://cdn-5.motorsport.com/images/vcl/n0mwOGYz/s3/cadillac-2.png"},
  {nom: "Sergio Pérez", ecurie: "Cadillac", statut: "fond", img: "https://cdn-5.motorsport.com/images/vcl/n0mwOGYz/s3/cadillac-2.png"}
];

const ecuriesList = [...new Set(pilotesData.map(p => p.ecurie))];
const grille = document.getElementById('grille-pronos');

// 1. Génération de la grille (Top 10) avec l'option Coup de Poker
if (grille) {
    for (let i = 1; i <= 10; i++) {
        const ligne = document.createElement('div');
        ligne.className = 'ligne-pilote';
        ligne.style.display = 'flex';
        ligne.style.alignItems = 'center';
        ligne.style.gap = '10px';

        const badge = document.createElement('div');
        badge.className = 'badge-position';
        badge.innerText = `P${String(i).padStart(2, '0')}`;

        const select = document.createElement('select');
        select.id = `pos-${i}`;
        select.className = 'select-pilote';
        
        const optionVide = document.createElement('option');
        optionVide.value = "";
        optionVide.text = "Sélectionner un pilote...";
        select.appendChild(optionVide);

        const pokerContainer = document.createElement('label');
        pokerContainer.title = "Coup de Poker ⭐ : coche pour doubler tes points sur cette ligne (1 max)";
        pokerContainer.style.cursor = 'pointer';
        pokerContainer.style.fontSize = '1.1rem';
        pokerContainer.innerHTML = `<input type="checkbox" name="coup-poker" class="check-poker" value="${i}" style="margin-right:3px;">⭐`;

        const img = document.createElement('img');
        img.className = 'img-monoplace';
        img.style.display = 'none';

        select.addEventListener('change', () => {
            mettreAJourListes();
            const piloteTrouve = pilotesData.find(p => p.nom === select.value);
            if (piloteTrouve) {
                img.src = piloteTrouve.img;
                img.style.display = 'block';
            } else {
                img.src = "";
                img.style.display = 'none';
            }
        });

        ligne.appendChild(badge);
        ligne.appendChild(select);
        ligne.appendChild(pokerContainer);
        ligne.appendChild(img);
        grille.appendChild(ligne);
    }

    // Force la coche d'une SEULE case coup de poker au maximum
    grille.addEventListener('change', (e) => {
        if (e.target.classList.contains('check-poker')) {
            const checkboxes = document.querySelectorAll('.check-poker');
            checkboxes.forEach(cb => { if (cb !== e.target) cb.checked = false; });
        }
    });
}

// Lancement au démarrage de la page
initialiserPolePosition();
mettreAJourListes();
initialiserEcuriesTopFlop();

// 2. SYSTEME DE COTES EQUITABLE ET BALANCE
function mettreAJourListes() {
    const tousLesSelects = document.querySelectorAll('.select-pilote');
    if (tousLesSelects.length === 0) return;

    const choixFaits = Array.from(tousLesSelects).map(s => s.value).filter(val => val !== "");

    tousLesSelects.forEach(select => {
        const valeurActuelle = select.value;
        const idSelect = select.id;
        const position = parseInt(idSelect.split('-')[1]); // Récupère le chiffre de 1 à 10

        select.innerHTML = '<option value="">Sélectionner un pilote...</option>';

        pilotesData.forEach(p => {
            if (!choixFaits.includes(p.nom) || p.nom === valeurActuelle) {
                const opt = document.createElement('option');
                opt.value = p.nom;
                
                let cote = 1.5;

                // Calcul équitable basé sur le statut et la cohérence de la place visée
                if (p.statut === "favori") {
                    if (position === 1) cote = 1.3;
                    else if (position <= 3) cote = 1.1;
                    else if (position <= 6) cote = 1.8;
                    else cote = 2.5 + (position * 0.1); // Un favori descend rarement en P10, mais la cote reste raisonnable pour éviter les tricheries
                } 
                else if (p.statut === "outsider") {
                    if (position === 1) {
                        cote = 35.0; 
                        if (p.nom === "Fernando Alonso") cote = 100.0; // Le clin d'œil légendaire
                    } 
                    else if (position <= 3) cote = 10.0;
                    else if (position <= 6) cote = 3.5;
                    else cote = 1.6; // Très logique qu'il soit en fin de top 10
                } 
                else if (p.statut === "fond") {
                    if (position === 1) cote = 120.0;
                    else if (position <= 3) cote = 60.0;
                    else if (position <= 6) cote = 18.0;
                    else if (position <= 8) cote = 5.0;
                    else cote = 1.3; // Sa place habituelle (P9 ou P10), donc petite cote logique
                }

                opt.text = `${p.nom} (${p.ecurie}) - Cote: x${cote.toFixed(1)}`;
                if (p.nom === valeurActuelle) opt.selected = true;
                select.appendChild(opt);
            }
        });
    });
}

// 3. Initialisation de la Pole Position (Samedi)
function initialiserPolePosition() {
    const selectPole = document.getElementById('select-pole');
    if (!selectPole) return;
    selectPole.innerHTML = '<option value="">Choisir le poleman du samedi...</option>';
    pilotesData.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.nom;
        opt.text = `${p.nom} (${p.ecurie})`;
        selectPole.appendChild(opt);
    });
}

// 4. Initialisation des Écuries
function initialiserEcuriesTopFlop() {
    const selectsEcurie = document.querySelectorAll('.select-ecurie');
    selectsEcurie.forEach(select => {
        select.innerHTML = '<option value="">Choisir une écurie...</option>';
        ecuriesList.forEach(ecurie => {
            const opt = document.createElement('option');
            opt.value = ecurie;
            opt.text = ecurie;
            select.appendChild(opt);
        });
    });
}

// 5. Logique du Bouton Aléatoire 🎲
const btnAleatoire = document.getElementById('btn-aleatoire');
if (btnAleatoire) {
    btnAleatoire.addEventListener('click', () => {
        const tousLesSelects = document.querySelectorAll('.select-pilote');
        const pilotesMelanges = [...pilotesData].sort(() => 0.5 - Math.random());
        
        tousLesSelects.forEach((select, index) => {
            select.value = pilotesMelanges[index].nom;
            const img = select.parentElement.querySelector('.img-monoplace');
            if (img) {
                img.src = pilotesMelanges[index].img;
                img.style.display = 'block';
            }
        });
        mettreAJourListes();
    });
}

// 6. Enregistrement final des données vers Firebase Firestore
const btnValider = document.getElementById('btn-valider');
if (btnValider) {
    btnValider.addEventListener('click', () => {
        const courseSelect = document.getElementById('select-course');
        if (courseSelect && courseSelect.value === "past") {
            alert("🚨 Erreur : Ce Grand Prix est terminé !");
            return;
        }

        const poleman = document.getElementById('select-pole').value;
        if (!poleman) {
            alert("⚠️ N'oublie pas de choisir le Poleman du samedi !");
            return;
        }

        const tousLesSelects = document.querySelectorAll('.select-pilote');
        const choixPilotes = Array.from(tousLesSelects).map(s => s.value);
        if (choixPilotes.includes("")) {
            alert(`⚠️ Ton Top 10 est incomplet !`);
            return;
        }

        const checkPokerCocha = document.querySelector('.check-poker:checked');
        const positionCoupPoker = checkPokerCocha ? parseInt(checkPokerCocha.value) : null;

        const top1 = document.getElementById('ecurie-top-1').value;
        const top2 = document.getElementById('ecurie-top-2').value;
        const flop1 = document.getElementById('ecurie-flop-1').value;
        const flop2 = document.
