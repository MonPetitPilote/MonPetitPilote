// ==========================================
// CONFIGURATION DU CALENDRIER ET DES PILOTES
// ==========================================
const calendrierCourses = [
  { round: 1, nom: "GP d'Australie", dateCourse: "2026-03-15", limitePole: "2026-03-14T06:00:00Z" },
  { round: 2, nom: "GP de Chine", dateCourse: "2026-03-22", limitePole: "2026-03-21T07:00:00Z" },
  { round: 3, nom: "GP de Suzuka (Japon)", dateCourse: "2026-04-05", limitePole: "2026-04-04T06:00:00Z" },
  { round: 4, nom: "GP de Bahreïn", dateCourse: "2026-04-19", limitePole: "2026-04-18T16:00:00Z" },
  { round: 5, nom: "GP de Miami", dateCourse: "2026-05-03", limitePole: "2026-05-02T20:00:00Z" },
  { round: 6, nom: "GP de Monaco", dateCourse: "2026-05-24", limitePole: "2026-05-23T14:00:00Z" },
  { round: 7, nom: "GP de Barcelone (Espagne)", dateCourse: "2026-06-07", limitePole: "2026-06-06T14:00:00Z" },
  { round: 8, nom: "GP de Spielberg (Autriche)", dateCourse: "2026-06-28", limitePole: "2026-06-27T13:00:00Z" },
  { round: 9, nom: "GP de Grande-Bretagne (Silverstone)", dateCourse: "2026-07-05", limitePole: "2026-07-04T14:00:00Z" },
  { round: 10, nom: "GP de Hongrie", dateCourse: "2026-07-26", limitePole: "2026-07-25T14:00:00Z" },
  { round: 11, nom: "GP de Belgique (Spa)", dateCourse: "2026-08-30", limitePole: "2026-08-29T14:00:00Z" },
  { round: 12, nom: "GP des Pays-Bas (Zandvoort)", dateCourse: "2026-09-06", limitePole: "2026-09-05T13:00:00Z" },
  { round: 13, nom: "GP d'Italie (Monza)", dateCourse: "2026-09-13", limitePole: "2026-09-12T14:00:00Z" },
  { round: 14, nom: "GP d'Azerbaïdjan (Bakou)", dateCourse: "2026-09-20", limitePole: "2026-09-19T13:00:00Z" },
  { round: 15, nom: "GP de Singapour", dateCourse: "2026-10-04", limitePole: "2026-10-03T12:00:00Z" },
  { round: 16, nom: "GP des États-Unis (Austin)", dateCourse: "2026-10-18", limitePole: "2026-10-17T21:00:00Z" },
  { round: 17, nom: "GP du Mexique", dateCourse: "2026-10-25", limitePole: "2026-10-24T20:00:00Z" },
  { round: 18, nom: "GP du Brésil (Interlagos)", dateCourse: "2026-11-01", limitePole: "2026-11-03T18:00:00Z" },
  { round: 19, nom: "GP de Las Vegas", dateCourse: "2026-11-22", limitePole: "2026-11-21T06:00:00Z" },
  { round: 20, nom: "GP de l'Équateur / Qatar (Losail)", dateCourse: "2026-11-29", limitePole: "2026-11-28T16:00:00Z" },
  { round: 21, nom: "GP d'Abou Dabi (Yas Marina)", dateCourse: "2026-12-06", limitePole: "2026-12-05T13:00:00Z" }
];

const pilotesData = [
  {nom: "Max Verstappen", ecurie: "Red Bull", statut: "favori"},
  {nom: "Isack Hadjar", ecurie: "Red Bull", statut: "outsider"},
  {nom: "Lewis Hamilton", ecurie: "Ferrari", statut: "favori"},
  {nom: "Charles Leclerc", ecurie: "Ferrari", statut: "favori"},
  {nom: "Lando Norris", ecurie: "McLaren", statut: "favori"},
  {nom: "Oscar Piastri", ecurie: "McLaren", statut: "favori"},
  {nom: "George Russell", ecurie: "Mercedes", statut: "favori"},
  {nom: "Kimi Antonelli", ecurie: "Mercedes", statut: "favori"},
  {nom: "Fernando Alonso", ecurie: "Aston Martin", statut: "outsider"},
  {nom: "Lance Stroll", ecurie: "Aston Martin", statut: "outsider"},
  {nom: "Pierre Gasly", ecurie: "Alpine", statut: "outsider"},
  {nom: "Franco Colapinto", ecurie: "Alpine", statut: "outsider"},
  {nom: "Carlos Sainz", ecurie: "Williams", statut: "outsider"},
  {nom: "Alex Albon", ecurie: "Williams", statut: "outsider"},
  {nom: "Liam Lawson", ecurie: "Racing Bulls", statut: "fond"},
  {nom: "Arvid Lindblad", ecurie: "Racing Bulls", statut: "fond"},
  {nom: "Nico Hülkenberg", ecurie: "Audi", statut: "fond"},
  {nom: "Gabriel Bortoleto", ecurie: "Audi", statut: "fond"},
  {nom: "Oliver Bearman", ecurie: "Haas", statut: "fond"},
  {nom: "Esteban Ocon", ecurie: "Haas", statut: "fond"},
  {nom: "Valtteri Bottas", ecurie: "Cadillac", statut: "fond"},
  {nom: "Sergio Pérez", ecurie: "Cadillac", statut: "fond"}
];

// Initialisation de la liste déroulante avec gestion des dates
function initialiserSelectCourse() {
    const select = document.getElementById('select-course');
    if (!select) return;

    select.innerHTML = "";
    const maintenant = new Date();
    let courseActiveTrouvee = false;

    calendrierCourses.forEach(c => {
        const option = document.createElement('option');
        option.value = `2026/${c.round}`;

        const optionsDate = { day: 'numeric', month: 'short' };
        const dateFormatee = new Date(c.dateCourse).toLocaleDateString('fr-FR', optionsDate);

        let statut = `(${dateFormatee})`;
        const dateCourseFinie = new Date(c.dateCourse + "T23:59:59Z");

        if (maintenant > dateCourseFinie) {
            statut = `🏁 Terminé`;
        } else if (maintenant >= new Date(c.limitePole)) {
            statut = `🔒 Qualifs en cours`;
        }

        option.text = `${String(c.round).padStart(2, '0')}. ${c.nom} — ${statut}`;
        
        if (maintenant <= dateCourseFinie && !courseActiveTrouvee) {
            option.selected = true;
            courseActiveTrouvee = true;
        }
        select.appendChild(option);
    });

    if (!courseActiveTrouvee && select.options.length > 0) {
        select.options[select.options.length - 1].selected = true;
    }
}

// Fonction de verrouillage intelligent
window.verifierStatutDuGrandPrix = function() {
    const selectCourse = document.getElementById('select-course');
    if (!selectCourse) return;

    const courseActuelle = selectCourse.value;
    const roundNumber = parseInt(courseActuelle.split('/')[1]);
    const courseData = calendrierCourses.find(c => c.round === roundNumber);

    const btnValider = document.getElementById('btn-valider');
    const selectPole = document.getElementById('select-pole');
    const maintenant = new Date();
    
    const dateCourseFinie = new Date(courseData.dateCourse + "T23:59:59Z");
    const dateLimitePole = new Date(courseData.limitePole);

    if (maintenant > dateCourseFinie) {
        if (btnValider) {
            btnValider.disabled = true;
            btnValider.innerText = "🔒 WEEK-END CLOS";
            btnValider.style.backgroundColor = "#555";
        }
    } else {
        if (btnValider) {
            btnValider.disabled = false;
            btnValider.innerText = "🏁 VALIDER MES PRONOSTICS";
            btnValider.style.backgroundColor = "#E10600";
        }
        
        if (maintenant >= dateLimitePole && selectPole) {
            selectPole.disabled = true;
            if (selectPole.selectedIndex !== -1 && !selectPole.options[selectPole.selectedIndex].text.includes("🔒")) {
                selectPole.options[selectPole.selectedIndex].text += " 🔒 (Bloqué !)";
            }
        }
    }
}

// Fonction pour afficher le classement général avec les badges automatiques 👑 et 🚜
function afficherClassementGeneral(listeUtilisateurs) {
    const corps = document.getElementById('corps-classement');
    if (!corps) return;
    corps.innerHTML = "";

    // Tri décroissant par points
    listeUtilisateurs.sort((a, b) => (b.points || 0) - (a.points || 0));

    listeUtilisateurs.forEach((user, index) => {
        let badge = "";
        if (index === 0) {
            badge = " 👑"; 
        } else if (index === listeUtilisateurs.length - 1 && listeUtilisateurs.length > 1) {
            badge = " 🚜"; 
        }

        const ligne = `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${user.pseudo}</strong>${badge}</td>
                <td>${user.points || 0} pts</td>
            </tr>
        `;
        corps.innerHTML += ligne;
    });
}

// Lancement au chargement
document.addEventListener("DOMContentLoaded", () => {
    initialiserSelectCourse();
    verifierStatutDuGrandPrix();
    
    // Exemple d'appel fictif avec une fausse liste pour tester le visuel du tableau :
    const fauxJoueurs = [
        { pseudo: "Arthur", points: 240 },
        { pseudo: "Thomas", points: 195 },
        { pseudo: "Julien", points: 110 }
    ];
    afficherClassementGeneral(fauxJoueurs);
});
