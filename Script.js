// Base de données des pilotes F1 2026 avec les liens d'images exacts
const pilotesData = [
  {nom: "Max Verstappen", ecurie: "Red Bull", img: "https://cdn-1.motorsport.com/images/vcl/X0kvd86d/s3/red-bull-racing-rb22.png"},
  {nom: "Isack Hadjar", ecurie: "Red Bull", img: "https://cdn-1.motorsport.com/images/vcl/X0kvd86d/s3/red-bull-racing-rb22.png"},
  {nom: "Lewis Hamilton", ecurie: "Ferrari", img: "https://cdn-9.motorsport.com/images/vcl/jYNlMJ0D/s3/ferrari-sf-26.png"},
  {nom: "Charles Leclerc", ecurie: "Ferrari", img: "https://cdn-9.motorsport.com/images/vcl/jYNlMJ0D/s3/ferrari-sf-26.png"},
  {nom: "Lando Norris", ecurie: "McLaren", img: "https://cdn-2.motorsport.com/images/vcl/p2wyqb6Q/s3/mclaren-mcl40.png"},
  {nom: "Oscar Piastri", ecurie: "McLaren", img: "https://cdn-2.motorsport.com/images/vcl/p2wyqb6Q/s3/mclaren-mcl40.png"},
  {nom: "George Russell", ecurie: "Mercedes", img: "https://cdn-8.motorsport.com/images/vcl/z0qrdy2N/s3/mercedes-mgp-w17.png"},
  {nom: "Kimi Antonelli", ecurie: "Mercedes", img: "https://cdn-8.motorsport.com/images/vcl/z0qrdy2N/s3/mercedes-mgp-w17.png"},
  {nom: "Fernando Alonso", ecurie: "Aston Martin", img: "https://cdn-2.motorsport.com/images/vcl/vYMl7G2E/s3/aston-martin-amr26.png"},
  {nom: "Lance Stroll", ecurie: "Aston Martin", img: "https://cdn-2.motorsport.com/images/vcl/vYMl7G2E/s3/aston-martin-amr26.png"},
  {nom: "Pierre Gasly", ecurie: "Alpine", img: "https://cdn-3.motorsport.com/images/vcl/q633Z46A/s3/alpine-a526.png"},
  {nom: "Franco Colapinto", ecurie: "Alpine", img: "https://cdn-3.motorsport.com/images/vcl/q633Z46A/s3/alpine-a526.png"},
  {nom: "Carlos Sainz", ecurie: "Williams", img: "https://cdn-7.motorsport.com/images/vcl/B2G3Vr29/s3/williams-fw48.png"},
  {nom: "Alex Albon", ecurie: "Williams", img: "https://cdn-7.motorsport.com/images/vcl/B2G3Vr29/s3/williams-fw48.png"},
  {nom: "Liam Lawson", ecurie: "Racing Bulls", img: "https://cdn-2.motorsport.com/images/vcl/G2ewOP6o/s3/racing-bulls-vcarb03.png"},
  {nom: "Arvid Lindblad", ecurie: "Racing Bulls", img: "https://cdn-2.motorsport.com/images/vcl/G2ewOP6o/s3/racing-bulls-vcarb03.png"},
  {nom: "Nico Hülkenberg", ecurie: "Audi", img: "https://cdn-8.motorsport.com/images/vcl/x27BRO0E/s3/audi-r26-2.png"},
  {nom: "Gabriel Bortoleto", ecurie: "Audi", img: "https://cdn-8.motorsport.com/images/vcl/x27BRO0E/s3/audi-r26-2.png"},
  {nom: "Oliver Bearman", ecurie: "Haas", img: "https://cdn-6.motorsport.com/images/vcl/e2dwbn0J/s3/haas-vf-26.png"},
  {nom: "Esteban Ocon", ecurie: "Haas", img: "https://cdn-6.motorsport.com/images/vcl/e2dwbn0J/s3/haas-vf-26.png"},
  {nom: "Valtteri Bottas", ecurie: "Cadillac", img: "https://cdn-5.motorsport.com/images/vcl/n0mwOGYz/s3/cadillac-2.png"},
  {nom: "Sergio Pérez", ecurie: "Cadillac", img: "https://cdn-5.motorsport.com/images/vcl/n0mwOGYz/s3/cadillac-2.png"}
];

const grille = document.getElementById('grille-pronos');

// 1. Génération automatique des 22 lignes de formulaire
for (let i = 1; i <= 22; i++) {
    const ligne = document.createElement('div');
    ligne.className = 'ligne-pilote';

    const badge = document.createElement('div');
    badge.className = 'badge-position';
    badge.innerText = `P${String(i).padStart(2, '0')}`;

    const select = document.createElement('select');
    select.id = `pos-${i}`;
    select.className = 'select-pilote';
    
    // Option vide par défaut (Libre)
    const optionVide = document.createElement('option');
    optionVide.value = "";
    optionVide.text = "Sélectionner...";
    select.appendChild(optionVide);

    // Image cachée par défaut
    const img = document.createElement('img');
    img.className = 'img-monoplace';
    img.style.display = 'none';

    // Événement quand l'utilisateur choisit un pilote
    select.addEventListener('change', () => {
        mettreAJourListes();
        
        // Gérer l'affichage de la monoplace
        const piloteTrouve = pilotesData.find(p => `${p.nom} (${p.ecurie})` === select.value);
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

// Populate initial des listes déroulantes
mettreAJourListes();

// 2. Fonction magique qui cache les pilotes déjà pronostiqués sans toucher aux sélections actuelles
function mettreAJourListes() {
    const tousLesSelects = document.querySelectorAll('.select-pilote');
    
    // On récupère toutes les valeurs actuellement sélectionnées sur le site
    const choixFaits = Array.from(tousLesSelects).map(s => s.value).filter(val => val !== "");

    tousLesSelects.forEach(select => {
        const valeurActuelle = select.value;

        // On vide les options sauf la première ("Sélectionner...")
        select.innerHTML = '<option value="">Sélectionner...</option>';

        // On ré-injecte uniquement les pilotes dispos (ou celui déjà choisi sur CETTE ligne)
        pilotesData.forEach(p => {
            const textePilote = `${p.nom} (${p.ecurie})`;
            if (!choixFaits.includes(textePilote) || textePilote === valeurActuelle) {
                const opt = document.createElement('option');
                opt.value = textePilote;
                opt.text = textePilote;
                if (textePilote === valeurActuelle) opt.selected = true;
                select.appendChild(opt);
            }
        });
    });
}

// 3. Validation du formulaire
document.getElementById('btn-valider').addEventListener('click', () => {
    const courseSelect = document.getElementById('select-course');
    
    if (courseSelect.value === "past") {
        alert("🚨 Erreur : Ce Grand Prix est terminé, impossible d'enregistrer !");
        return;
    }

    const tousLesSelects = document.querySelectorAll('.select-pilote');
    const choix = Array.from(tousLesSelects).map(s => s.value);

    if (choix.includes("")) {
        const restants = choix.filter(v => v === "").length;
        alert(`⚠️ Classement incomplet ! Il te reste ${restants} pilote(s) à placer.`);
        return;
    }

    const pseudo = prompt("Saisis ton pseudo pour enregistrer ton prono :");
    if (!pseudo) {
        alert("❌ Enregistrement annulé (pseudo requis).");
        return;
    }

    alert(`🏆 Parfait ${pseudo} ! Ton prono de 22 pilotes pour Silverstone est validé localement.`);
    console.log("Données prêtes à être envoyées :", { pseudo: pseudo, course: courseSelect.value, classement: choix });
});