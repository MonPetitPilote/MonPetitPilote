// ==========================================
// 1. CONFIGURATION ET INITIALISATION FIREBASE
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyDw4nHhz1JI9NsVipX4Dw3hu_AY_WyBDj4",
    authDomain: "monpetitpilote.firebaseapp.com",
    projectId: "monpetitpilote",
    storageBucket: "monpetitpilote.firebasestorage.app",
    messagingSenderId: "267371118460",
    appId: "1:267371118460:web:af95dad6fa4368fdffaef9",
    measurementId: "G-TY047XHDXW"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
var auth = firebase.auth();

// Liens de rendu d'images PNG publics (100% compatibles et stables)
const LOGOS_2026 = {
    redbull: "https://upload.wikimedia.org/wikipedia/en/thumb/1/15/Red_Bull_Racing_logo.svg/512px-Red_Bull_Racing_logo.svg.png",
    ferrari: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c0/Scuderia_Ferrari_Logo.svg/388px-Scuderia_Ferrari_Logo.svg.png",
    mclaren: "https://upload.wikimedia.org/wikipedia/en/thumb/6/66/McLaren_Racing_logo.svg/512px-McLaren_Racing_logo.svg.png",
    mercedes: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Mercedes-AMG_Petronas_F1_Team_Logo.svg/512px-Mercedes-AMG_Petronas_F1_Team_Logo.svg.png",
    aston: "https://upload.wikimedia.org/wikipedia/en/thumb/b/b8/Aston_Martin_F1_logo.svg/512px-Aston_Martin_F1_logo.svg.png",
    alpine: "https://upload.wikimedia.org/wikipedia/fr/thumb/7/7e/Alpine_F1_Team_Logo.svg/320px-Alpine_F1_Team_Logo.svg.png",
    williams: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Williams_Racing_logo.svg/512px-Williams_Racing_logo.svg.png",
    racingbulls: "https://upload.wikimedia.org/wikipedia/en/thumb/0/02/Visa_Cash_App_RB_F1_Team_logo.svg/512px-Visa_Cash_App_RB_F1_Team_logo.svg.png",
    audi: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Audi_F1_Team_logo.svg/512px-Audi_F1_Team_logo.svg.png",
    haas: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Haas_F1_Team_logo.svg/512px-Haas_F1_Team_logo.svg.png",
    cadillac: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Cadillac_Automobile_Logo.svg/512px-Cadillac_Automobile_Logo.svg.png"
};

// Silhouette de casque universelle au format PNG stable
const HELMET_PLACEHOLDER = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Helmet_font_awesome.svg/512px-Helmet_font_awesome.svg.png";

const pilotesData = [
  {nom: "Max Verstappen", ecurie: "Red Bull", carImg: LOGOS_2026.redbull, driverImg: HELMET_PLACEHOLDER},
  {nom: "Isack Hadjar", ecurie: "Red Bull", carImg: LOGOS_2026.redbull, driverImg: HELMET_PLACEHOLDER},
  {nom: "Lewis Hamilton", ecurie: "Ferrari", carImg: LOGOS_2026.ferrari, driverImg: HELMET_PLACEHOLDER},
  {nom: "Charles Leclerc", ecurie: "Ferrari", carImg: LOGOS_2026.ferrari, driverImg: HELMET_PLACEHOLDER},
  {nom: "Lando Norris", ecurie: "McLaren", carImg: LOGOS_2026.mclaren, driverImg: HELMET_PLACEHOLDER},
  {nom: "Oscar Piastri", ecurie: "McLaren", carImg: LOGOS_2026.mclaren, driverImg: HELMET_PLACEHOLDER},
  {nom: "George Russell", ecurie: "Mercedes", carImg: LOGOS_2026.mercedes, driverImg: HELMET_PLACEHOLDER},
  {nom: "Kimi Antonelli", ecurie: "Mercedes", carImg: LOGOS_2026.mercedes, driverImg: HELMET_PLACEHOLDER},
  {nom: "Fernando Alonso", ecurie: "Aston Martin", carImg: LOGOS_2026.aston, driverImg: HELMET_PLACEHOLDER},
  {nom: "Lance Stroll", ecurie: "Aston Martin", carImg: LOGOS_2026.aston, driverImg: HELMET_PLACEHOLDER},
  {nom: "Pierre Gasly", ecurie: "Alpine", carImg: LOGOS_2026.alpine, driverImg: HELMET_PLACEHOLDER},
  {nom: "Franco Colapinto", ecurie: "Alpine", carImg: LOGOS_2026.alpine, driverImg: HELMET_PLACEHOLDER},
  {nom: "Carlos Sainz", ecurie: "Williams", carImg: LOGOS_2026.williams, driverImg: HELMET_PLACEHOLDER},
  {nom: "Alex Albon", ecurie: "Williams", carImg: LOGOS_2026.williams, driverImg: HELMET_PLACEHOLDER},
  {nom: "Liam Lawson", ecurie: "Racing Bulls", carImg: LOGOS_2026.racingbulls, driverImg: HELMET_PLACEHOLDER},
  {nom: "Arvid Lindblad", ecurie: "Racing Bulls", carImg: LOGOS_2026.racingbulls, driverImg: HELMET_PLACEHOLDER},
  {nom: "Nico Hülkenberg", ecurie: "Audi", carImg: LOGOS_2026.audi, driverImg: HELMET_PLACEHOLDER},
  {nom: "Gabriel Bortoleto", ecurie: "Audi", carImg: LOGOS_2026.audi, driverImg: HELMET_PLACEHOLDER},
  {nom: "Oliver Bearman", ecurie: "Haas", carImg: LOGOS_2026.haas, driverImg: HELMET_PLACEHOLDER},
  {nom: "Esteban Ocon", ecurie: "Haas", carImg: LOGOS_2026.haas, driverImg: HELMET_PLACEHOLDER},
  {nom: "Valtteri Bottas", ecurie: "Cadillac", carImg: LOGOS_2026.cadillac, driverImg: HELMET_PLACEHOLDER},
  {nom: "Sergio Pérez", ecurie: "Cadillac", carImg: LOGOS_2026.cadillac, driverImg: HELMET_PLACEHOLDER}
];

const ecuriesSaison = ["Red Bull", "Ferrari", "McLaren", "Mercedes", "Aston Martin", "Alpine", "Williams", "Racing Bulls", "Audi", "Haas", "Cadillac"];
let utilisateurActuel = null;
let designPilotesF1 = {}; 

const selectCourse = document.getElementById('select-course');
const selectPole = document.getElementById('select-pole');

// GESTION AUTHENTIFICATION
auth.onAuthStateChanged((user) => {
    const zoneDeconnecte = document.getElementById('auth-deconnecte');
    const zoneConnecte = document.getElementById('auth-connecte');
    const nomUserSpan = document.getElementById('nom-utilisateur');
    if (user) {
        utilisateurActuel = user;
        if(zoneDeconnecte) zoneDeconnecte.style.display = 'none';
        if(zoneConnecte) zoneConnecte.style.display = 'flex';
        if(nomUserSpan) nomUserSpan.innerText = user.displayName || user.email;
        chargerPronosticsUtilisateur();
    } else {
        utilisateurActuel = null;
        if(zoneDeconnecte) zoneDeconnecte.style.display = 'block';
        if(zoneConnecte) zoneConnecte.style.display = 'none';
    }
});

document.getElementById('btn-connexion')?.addEventListener('click', () => {
    const email = document.getElementById('auth-email').value;
    const mdp = document.getElementById('auth-mdp').value;
    auth.signInWithEmailAndPassword(email, mdp).catch(err => alert(err.message));
});
document.getElementById('btn-inscription')?.addEventListener('click', () => {
    const pseudo = document.getElementById('auth-pseudo').value;
    const email = document.getElementById('auth-email
