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
  {nom
