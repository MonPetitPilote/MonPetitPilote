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

// Base de données des pilotes F1 2026 avec les cotes estimées
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

const grille = document.getElementById('grille-pronos');

// 1. Génération automatique des 10 lignes (TOP 10)
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
        
        // Trouver le pilote sélectionné par son nom unique
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

mettreAJourListes();

// 2. Cache les pilotes déjà sélectionnés et affiche la cote
function mettreAJourListes() {
    const tousLesSelects = document.querySelectorAll('.select-pilote');
    const choixFaits = Array.from(tousLesSelects).map(s => s.value).filter(val => val !== "");

    tousLesSelects.forEach(select => {
        const valeurActuelle = select.value;
        select.innerHTML = '<option value="">Sélectionner un pilote...</option>';

        pilotesData.forEach(p => {
            if (!choixFaits.includes(p.nom) || p.nom === valeurActuelle) {
                const opt = document.createElement('option');
                opt.value = p.nom;
                // On affiche le nom, l'écurie et la cote dans le menu déroulant
                opt.text = `${p.nom} (${p.ecurie}) - Cote: x${p.cote.toFixed(1)}`;
                if (p.nom === valeurActuelle) opt.selected = true;
                select.appendChild(opt);
            }
        });
    });
}

// 3. Validation et envoi Firebase
document.getElementById('btn-valider').addEventListener('click', () => {
    const courseSelect = document.getElementById('select-course');
    
    if (courseSelect.value === "past") {
        alert("🚨 Erreur : Ce Grand Prix est terminé !");
        return;
    }

    const tousLesSelects = document.querySelectorAll('.select-pilote');
    const choix = Array.from(tousLesSelects).map(s => s.value);

    if (choix.includes("")) {
        const restants = choix.filter(v => v === "").length;
        alert(`⚠️ Top 10 incomplet ! Il reste ${restants} places à pronostiquer.`);
        return;
    }

    const pseudo = prompt("Saisis ton pseudo pour valider ton Top 10 :");
    if (!pseudo) {
        alert("❌ Enregistrement annulé.");
        return;
    }

    if (typeof db !== 'undefined') {
        db.collection("pronostics").add({
            pseudo: pseudo,
            course: courseSelect.value,
            classement: choix,
            date: new Date()
        })
        .then(() => {
            alert(`🏆 Bravo ${pseudo} ! Ton prono Top 10 a bien été enregistré !`);
        })
        .catch((error) => {
            console.error("Erreur Firebase: ", error);
            alert("❌ Erreur lors de l'enregistrement en base de données.");
        });
    } else {
        alert(`🏆 Mode démo : Bravo ${pseudo}, ton prono est validé localement (Firebase non configuré).`);
    }
});
