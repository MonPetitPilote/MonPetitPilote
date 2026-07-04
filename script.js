// Configuration Firebase (Pense à laisser TES clés ici !)
const firebaseConfig = {
  apiKey: "TON_API_KEY",
  authDomain: "TON_AUTH_DOMAIN",
  projectId: "TON_PROJECT_ID",
  storageBucket: "TON_STORAGE_BUCKET",
  messagingSenderId: "TON_MESSAGING_SENDER_ID",
  appId: "TON_APP_ID"
};

// Initialisation de Firebase
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    var db = firebase.firestore();
}

// Base de données des pilotes F1 2026 avec les cotes de référence
const pilotesData = [
  {nom: "Max Verstappen", ecurie: "Red Bull", cote: 1.2, img: "https://cdn-1.motorsport.com/images/vcl/X0kvd86d/s3/red-bull-racing-rb22.png"},
  {nom: "Isack Hadjar", ecurie: "Red Bull", cote: 3.5, img: "https://cdn-1.motorsport.com/images/vcl/X0kvd86d/s3/red-bull-racing-rb22.png"},
  {nom: "Lewis Hamilton", ecurie: "Ferrari", cote: 1.5, img: "https://cdn-9.motorsport.com/images/vcl/jYNlMJ0D/s3/ferrari-sf-26.png"},
  {nom: "Charles Leclerc", ecurie: "Ferrari", cote: 1.4, img: "https://cdn-9.motorsport.com/images/vcl/jYNlMJ0D/s3/ferrari-sf-26.png"},
  {nom: "Lando Norris", ecurie: "McLaren", cote: 1.3, img: "https://cdn-2.motorsport.com/images/vcl/p2wyqb6Q/s3/mclaren-mcl40.png"},
  {nom: "Oscar Piastri", ecurie: "McLaren", cote: 1.6, img: "https://cdn-2.motorsport.com/images/vcl/p2wyqb6Q/s3/mclaren-mcl40.png"},
  {nom: "George Russell", ecurie: "Mercedes", cote: 1.8, img: "https://cdn-8.motorsport.com/images/vcl/z0qrdy2N/s3/mercedes-mgp-w17.png"},
  {nom: "Kimi Antonelli", ecurie: "Mercedes", cote: 2.0, img: "https://cdn-8.motorsport.com/images/vcl/z0qrdy2N/s3/mercedes-mgp-w17.png"},
  {nom: "Fernando Alonso", ecurie: "Aston Martin", cote: 2.5, img: "https://cdn-2.motorsport.com/images/vcl/vYMl7G2E/s3/aston-martin-amr26.png"},
  {nom: "Lance Stroll", ecurie: "Aston Martin", cote: 4.0, img: "https://cdn-2.motorsport.com/images/vcl/vYMl7G2E/s3/aston-martin-amr26.png"},
  {nom: "Pierre Gasly", ecurie: "Alpine", cote: 3.0, img: "https://cdn-3.motorsport.com/images/vcl/q633Z46A/s3/alpine-a526.png"},
  {nom: "Franco Colapinto", ecurie: "Alpine", cote: 4.5, img: "https://cdn-3.motorsport.com/images/vcl/q633Z46A/s3/alpine-a526.png"},
  {nom: "Carlos Sainz", ecurie: "Williams", cote: 2.8, img: "https://cdn-7.motorsport.com/images/vcl/B2G3Vr29/s3/williams-fw48.png"},
  {nom: "Alex Albon", ecurie: "Williams", cote: 3.5, img: "https://cdn-7.motorsport.com/images/vcl/B2G3Vr29/s3/williams-fw48.png"},
  {nom: "Liam Lawson", ecurie: "Racing Bulls", cote: 4.0, img: "https://cdn-2.motorsport.com/images/vcl/G2ewOP6o/s3/racing-bulls-vcarb03.png"},
  {nom: "Arvid Lindblad", ecurie: "Racing Bulls", cote: 5.5, img: "https://cdn-2.motorsport.com/images/vcl/G2ewOP6o/s3/racing-bulls-vcarb03.png"},
  {nom: "Nico Hülkenberg", ecurie: "Audi", cote: 3.8, img: "https://cdn-8.motorsport.com/images/vcl/x27BRO0E/s3/audi-r26-2.png"},
  {nom: "Gabriel Bortoleto", ecurie: "Audi", cote: 5.0, img: "https://cdn-8.motorsport.com/images/vcl/x27BRO0E/s3/audi-r26-2.png"},
  {nom: "Oliver Bearman", ecurie: "Haas", cote: 4.0, img: "https://cdn-6.motorsport.com/images/vcl/e2dwbn0J/s3/haas-vf-26.png"},
  {nom: "Esteban Ocon", ecurie: "Haas", cote: 3.8, img: "https://cdn-6.motorsport.com/images/vcl/e2dwbn0J/s3/haas-vf-26.png"},
  {nom: "Valtteri Bottas", ecurie: "Cadillac", cote: 5.0, img: "https://cdn-5.motorsport.com/images/vcl/n0mwOGYz/s3/cadillac-2.png"},
  {nom: "Sergio Pérez", ecurie: "Cadillac", cote: 4.2, img: "https://cdn-5.motorsport.com/images/vcl/n0mwOGYz/s3/cadillac-2.png"}
];

// Liste unique des écuries extraite automatiquement à partir de la base des pilotes
const ecuriesList = [...new Set(pilotesData.map(p => p.ecurie))];

const grille = document.getElementById('grille-pronos');

// 1. Génération automatique des 10 lignes du TOP 10 Pilotes
for (let i = 1; i <= 10; i++) {
    const ligne = document.createElement('div');
    ligne.className = 'ligne-pilote';

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
    ligne.appendChild(img);
    grille.appendChild(ligne);
}

// Lancement des fonctions au chargement initial
mettreAJourListes();
initialiserEcuriesTopFlop();

// 2. Cache les pilotes déjà sélectionnés et applique l'algorithme de cote dynamique
function mettreAJourListes() {
    const tousLesSelects = document.querySelectorAll('.select-pilote');
    const choixFaits = Array.from(tousLesSelects).map(s => s.value).filter(val => val !== "");

    tousLesSelects.forEach(select => {
        const valeurActuelle = select.value;
        const idSelect = select.id;
        const positionNumerique = parseInt(idSelect.split('-')[1]); // Récupère le numéro de la place (1 à 10)

        select.innerHTML = '<option value="">Sélectionner un pilote...</option>';

        pilotesData.forEach(p => {
            if (!choixFaits.includes(p.nom) || p.nom === valeurActuelle) {
                const opt = document.createElement('option');
                opt.value = p.nom;
                
                // --- ALGORITHME DE COTE DYNAMIQUE COHÉRENT ---
                let coteCalculee = p.cote; 

                if (positionNumerique === 1) {
                    // Pour la gagne (P1) : la cote de base est multipliée pour refléter la difficulté
                    coteCalculee = p.cote * p.cote * 10;
                    
                    // Ajustement spécial : Alonso premier = cote de 100.0
                    if (p.nom === "Fernando Alonso") {
                        coteCalculee = 100.0;
                    }
                } else {
                    // Pour les places P2 à P10 : la cote baisse plus la place finale est basse
                    coteCalculee = (p.cote * 3.5) / (positionNumerique * 0.6);
                }

                // La cote ne peut pas être plus basse que x1.1
                if (coteCalculee < 1.1) coteCalculee = 1.1;

                opt.text = `${p.nom} (${p.ecurie}) - Cote: x${coteCalculee.toFixed(1)}`;
                if (p.nom === valeurActuelle) opt.selected = true;
                select.appendChild(opt);
            }
        });
    });
}

// 3. Remplissage automatique des menus déroulants pour le Top/Flop Écuries
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

// 4. Validation générale et envoi des données (Pilotes + Écuries)
document.getElementById('btn-valider').addEventListener('click', () => {
    const courseSelect = document.getElementById('select-course');
    
    // Empêcher de jouer sur un vieux GP
    if (courseSelect.value === "past") {
        alert("🚨 Erreur : Ce Grand Prix est terminé !");
        return;
    }

    // Vérification du Top 10 Pilotes
    const tousLesSelects = document.querySelectorAll('.select-pilote');
    const choixPilotes = Array.from(tousLesSelects).map(s => s.value);

    if (choixPilotes.includes("")) {
        const restants = choixPilotes.filter(v => v === "").length;
        alert(`⚠️ Top 10 incomplet ! Il reste ${restants} places à pronostiquer.`);
        return;
    }

    // Vérification de la section Top/Flop Écuries
    const top1 = document.getElementById('ecurie-top-1').value;
    const top2 = document.getElementById('ecurie-top-2').value;
    const flop1 = document.getElementById('ecurie-flop-1').value;
    const flop2 = document.getElementById('ecurie-flop-2').value;

    if (!top1 || !top2 || !flop1 || !flop2) {
        alert("⚠️ Section Écuries incomplète ! Veuillez choisir 2 Tops et 2 Flops.");
        return;
    }

    // Demande du pseudo
    const pseudo = prompt("Saisis ton pseudo pour valider tes pronostics :");
    if (!pseudo) {
        alert("❌ Enregistrement annulé.");
        return;
    }

    // Structure finale du message de données
    const donneesPronostic = {
        pseudo: pseudo,
        course: courseSelect.value,
        classementPilotes: choixPilotes,
        ecuriesTop: [top1, top2],
        ecuriesFlop: [flop1, flop2],
        date: new Date()
    };

    // Envoi vers Firestore ou exécution locale si non configuré
    if (typeof db !== 'undefined') {
        db.collection("pronostics").add(donneesPronostic)
        .then(() => {
            alert(`🏆 Bravo ${pseudo} ! Tes pronos (Pilotes + Écuries) ont bien été enregistrés !`);
        })
        .catch((error) => {
            console.error("Erreur Firebase: ", error);
            alert("❌ Erreur lors de l'enregistrement en base de données.");
        });
    } else {
        alert(`🏆 Mode démo : Bravo ${pseudo}, tes pronos Pilotes et Écuries sont validés localement !`);
    }
});
