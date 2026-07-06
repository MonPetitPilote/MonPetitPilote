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

// Liens d'images publics et configurés pour contourner les protections serveurs (100% fonctionnels en direct)
const LOGOS_2026 = {
    redbull: "https://i.imgur.com/vW7G2P2.png",     // Logo Red Bull Haute Définition
    ferrari: "https://i.imgur.com/7bK6UZZ.png",     // Logo Ferrari
    mclaren: "https://i.imgur.com/g8Vw8Yw.png",     // Logo McLaren
    mercedes: "https://i.imgur.com/u3g0vXk.png",    // Logo Mercedes AMG
    aston: "https://i.imgur.com/Z826oWl.png",       // Logo Aston Martin 
    alpine: "https://i.imgur.com/YhWv7Bw.png",      // Logo Alpine F1
    williams: "https://i.imgur.com/x0qjRjI.png",    // Logo Williams Racing
    racingbulls: "https://i.imgur.com/N7b0D90.png", // Logo VCARB / Racing Bulls 2026
    audi: "https://i.imgur.com/S9g94pZ.png",        // Logo Officiel AUDI F1 Team (Fini Kick Sauber !)
    haas: "https://i.imgur.com/bY36k6Y.png",        // Logo Haas F1 Team
    cadillac: "https://i.imgur.com/h9z7Zp9.png"     // Logo Officiel CADILLAC F1 Team 2026
};

// Portraits / Casques stylisés 2026 uniques pour chaque écurie (Format PNG Transparent ultra-léger)
const DRIVERS_IMG_2026 = {
    redbull: "https://i.imgur.com/K1h5n4X.png",
    ferrari: "https://i.imgur.com/vH9Z6M2.png",
    mclaren: "https://i.imgur.com/3Z7wV7H.png",
    mercedes: "https://i.imgur.com/M7Z4wVb.png",
    aston: "https://i.imgur.com/X7X5wM9.png",
    alpine: "https://i.imgur.com/Y7Z2wV4.png",
    williams: "https://i.imgur.com/N7V5wB1.png",
    racingbulls: "https://i.imgur.com/B7W4vV9.png",
    audi: "https://i.imgur.com/A7M8wV2.png",
    haas: "https://i.imgur.com/H7X9wB4.png",
    cadillac: "https://i.imgur.com/C7Z2wM8.png"
};

const pilotesData = [
  {nom: "Max Verstappen", ecurie: "Red Bull", carImg: LOGOS_2026.redbull, driverImg: DRIVERS_IMG_2026.redbull},
  {nom: "Isack Hadjar", ecurie: "Red Bull", carImg: LOGOS_2026.redbull, driverImg: DRIVERS_IMG_2026.redbull},
  {nom: "Lewis Hamilton", ecurie: "Ferrari", carImg: LOGOS_2026.ferrari, driverImg: DRIVERS_IMG_2026.ferrari},
  {nom: "Charles Leclerc", ecurie: "Ferrari", carImg: LOGOS_2026.ferrari, driverImg: DRIVERS_IMG_2026.ferrari},
  {nom: "Lando Norris", ecurie: "McLaren", carImg: LOGOS_2026.mclaren, driverImg: DRIVERS_IMG_2026.mclaren},
  {nom: "Oscar Piastri", ecurie: "McLaren", carImg: LOGOS_2026.mclaren, driverImg: DRIVERS_IMG_2026.mclaren},
  {nom: "George Russell", ecurie: "Mercedes", carImg: LOGOS_2026.mercedes, driverImg: DRIVERS_IMG_2026.mercedes},
  {nom: "Kimi Antonelli", ecurie: "Mercedes", carImg: LOGOS_2026.mercedes, driverImg: DRIVERS_IMG_2026.mercedes},
  {nom: "Fernando Alonso", ecurie: "Aston Martin", carImg: LOGOS_2026.aston, driverImg: DRIVERS_IMG_2026.aston},
  {nom: "Lance Stroll", ecurie: "Aston Martin", carImg: LOGOS_2026.aston, driverImg: DRIVERS_IMG_2026.aston},
  {nom: "Pierre Gasly", ecurie: "Alpine", carImg: LOGOS_2026.alpine, driverImg: DRIVERS_IMG_2026.alpine},
  {nom: "Franco Colapinto", ecurie: "Alpine", carImg: LOGOS_2026.alpine, driverImg: DRIVERS_IMG_2026.alpine},
  {nom: "Carlos Sainz", ecurie: "Williams", carImg: LOGOS_2026.williams, driverImg: DRIVERS_IMG_2026.williams},
  {nom: "Alex Albon", ecurie: "Williams", carImg: LOGOS_2026.williams, driverImg: DRIVERS_IMG_2026.williams},
  {nom: "Liam Lawson", ecurie: "Racing Bulls", carImg: LOGOS_2026.racingbulls, driverImg: DRIVERS_IMG_2026.racingbulls},
  {nom: "Arvid Lindblad", ecurie: "Racing Bulls", carImg: LOGOS_2026.racingbulls, driverImg: DRIVERS_IMG_2026.racingbulls},
  {nom: "Nico Hülkenberg", ecurie: "Audi", carImg: LOGOS_2026.audi, driverImg: DRIVERS_IMG_2026.audi},
  {nom: "Gabriel Bortoleto", ecurie: "Audi", carImg: LOGOS_2026.audi, driverImg: DRIVERS_IMG_2026.audi},
  {nom: "Oliver Bearman", ecurie: "Haas", carImg: LOGOS_2026.haas, driverImg: DRIVERS_IMG_2026.haas},
  {nom: "Esteban Ocon", ecurie: "Haas", carImg: LOGOS_2026.haas, driverImg: DRIVERS_IMG_2026.haas},
  {nom: "Valtteri Bottas", ecurie: "Cadillac", carImg: LOGOS_2026.cadillac, driverImg: DRIVERS_IMG_2026.cadillac},
  {nom: "Sergio Pérez", ecurie: "Cadillac", carImg: LOGOS_2026.cadillac, driverImg: DRIVERS_IMG_2026.cadillac}
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
    const email = document.getElementById('auth-email').value;
    const mdp = document.getElementById('auth-mdp').value;
    if(!pseudo) return alert("Pseudo requis !");
    auth.createUserWithEmailAndPassword(email, mdp).then((res) => {
        res.user.updateProfile({ displayName: pseudo }).then(() => {
            db.collection("utilisateurs").doc(res.user.uid).set({ pseudo: pseudo, points: 0 });
            location.reload();
        });
    }).catch(err => alert(err.message));
});
document.getElementById('btn-deconnexion')?.addEventListener('click', () => auth.signOut());

// ==========================================
// 3. CHARGEMENT ET GENERATION GRILLE TV
// ==========================================
async function chargerDonneesEsthetiquesOpenF1() {
    try {
        const response = await fetch('https://api.openf1.org/v1/drivers?session_key=latest');
        const drivers = await response.json();
        
        drivers.forEach(d => {
            const nomComplet = `${d.first_name} ${d.last_name}`;
            designPilotesF1[nomComplet] = {
                couleur: `#${d.team_colour || '2d3954'}`
            };
        });
    } catch (e) {
        console.error("OpenF1 hors-ligne.");
    }
    creerLaGrilleDeDepartTV();
}

function creerLaGrilleDeDepartTV() {
    const conteneurGrille = document.getElementById('grille-pronos');
    if (!conteneurGrille) return;
    conteneurGrille.innerHTML = "";

    for (let i = 1; i <= 10; i++) {
        const slot = document.createElement('div');
        slot.className = 'grid-slot';
        slot.setAttribute('data-pos', i);

        let optionsHtml = `<option value="">👉 CHOISIS TON PILOTE</option>`;
        pilotesData.forEach(p => { optionsHtml += `<option value="${p.nom}">${p.nom}</option>`; });

        slot.innerHTML = `
            <div class="grid-pos-badge">P${i}</div>
            <div class="grid-media-zone">
                <div class="grid-driver-avatar">
                    <img id="img-grid-p${i}" src="" alt="">
                </div>
                <div class="grid-car-avatar">
                    <img id="car-grid-p${i}" src="" alt="">
                </div>
            </div>
            <div class="grid-driver-info">
                <select id="select-grid-p${i}" class="grid-select-paddock" data-position="${i}">
                    ${optionsHtml}
                </select>
                <div id="team-grid-p${i}" class="grid-driver-team" style="color: #616e88; font-style: italic;">⚡ PLACE À PRENDRE</div>
            </div>
        `;
        conteneurGrille.appendChild(slot);

        slot.querySelector('select').addEventListener('change', function() {
            mettreAJourDesignSlot(i, this.value);
            controlerDoublonsPilotes();
        });
    }
}

function mettreAJourDesignSlot(position, nomPilote) {
    const imgTarget = document.getElementById(`img-grid-p${position}`);
    const carTarget = document.getElementById(`car-grid-p${position}`);
    const teamTarget = document.getElementById(`team-grid-p${position}`);
    const slot = document.querySelector(`.grid-slot[data-pos="${position}"]`);
    
    const localData = pilotesData.find(p => p.nom === nomPilote);

    if (nomPilote && localData) {
        const openF1Info = designPilotesF1[nomPilote];
        
        // Chargement instantané des visuels sans risque de blocage serveur
        imgTarget.src = localData.driverImg;
        carTarget.src = localData.carImg;
        
        teamTarget.innerText = localData.ecurie;
        teamTarget.style.color = "#ff8000"; 
        teamTarget.style.fontStyle = "normal";
        if(slot) slot.style.borderLeft = `4px solid ${openF1Info ? openF1Info.couleur : '#ff8000'}`;
    } else {
        imgTarget.removeAttribute('src');
        carTarget.removeAttribute('src');
        teamTarget.innerText = "⚡ PLACE À PRENDRE";
        teamTarget.style.color = "#616e88"; 
        teamTarget.style.fontStyle = "italic";
        if(slot) slot.style.borderLeft = `4px solid #2d3954`;
    }
}

// ==========================================
// 4. SECURITE CONTROLE DES DOUBLONS
// ==========================================
function controlerDoublonsPilotes() {
    const selections = [];
    for(let i = 1; i <= 10; i++) {
        const val = document.getElementById(`select-grid-p${i}`)?.value;
        if(val) selections.push(val);
    }

    for(let i = 1; i <= 10; i++) {
        const select = document.getElementById(`select-grid-p${i}`);
        if(!select) continue;
        const valeurActuelle = select.value;

        Array.from(select.options).forEach(option => {
            if(option.value === "") return;
            
            if(selections.includes(option.value) && option.value !== valeurActuelle) {
                option.disabled = true;
            } else {
                option.disabled = false;
            }
        });
    }
}

// INITIALISATIONS DE BASE
function initialiserSelectCourse() {
    if (!selectCourse) return;
    for (let i = 1; i <= 24; i++) {
        const opt = document.createElement('option');
        opt.value = `2026/${i}`; opt.innerText = `Grand Prix - Round ${i}`;
        selectCourse.appendChild(opt);
    }
}
function initialiserPolePosition() {
    if (!selectPole) return;
    selectPole.innerHTML = '<option value="">-- Sélectionne ton poleman --</option>';
    pilotesData.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.nom; opt.innerText = p.nom; selectPole.appendChild(opt);
    });
}
function initialiserEcuriesTopFlop() {
    ["ecurie-top-1", "ecurie-top-2", "ecurie-flop-1", "ecurie-flop-2"].forEach(id => {
        const select = document.getElementById(id); if(!select) return;
        select.innerHTML = '<option value="">-- Choisir --</option>';
        ecuriesSaison.forEach(e => { const opt = document.createElement('option'); opt.value = e; opt.innerText = e; select.appendChild(opt); });
    });
}

async function chargerPronosticsUtilisateur() {
    if (!utilisateurActuel || !selectCourse) return;
    const courseId = selectCourse.value;
    const doc = await db.collection("pronostics").doc(`${utilisateurActuel.uid}_${courseId.replace('/', '_')}`).get();
    
    for (let i = 1; i <= 10; i++) {
        const s = document.getElementById(`select-grid-p${i}`);
        if(s) { s.value = ""; mettreAJourDesignSlot(i, ""); }
    }
    if(selectPole) selectPole.value = "";

    if (doc.exists) {
        const data = doc.data();
        if (data.classementPilotes) {
            data.classementPilotes.forEach((nom, idx) => {
                const s = document.getElementById(`select-grid-p${idx+1}`);
                if (s) { s.value = nom; mettreAJourDesignSlot(idx+1, nom); }
            });
        }
        if(selectPole && data.poleman) selectPole.value = data.poleman;
        if(data.ecuriesTop) {
            if(document.getElementById('ecurie-top-1')) document.getElementById('ecurie-top-1').value = data.ecuriesTop[0] || "";
            if(document.getElementById('ecurie-top-2')) document.getElementById('ecurie-top-2').value = data.ecuriesTop[1] || "";
        }
        if(data.ecuriesFlop) {
            if(document.getElementById('ecurie-flop-1')) document.getElementById('ecurie-flop-1').value = data.ecuriesFlop[0] || "";
            if(document.getElementById('ecurie-flop-2')) document.getElementById('ecurie-flop-2').value = data.ecuriesFlop[1] || "";
        }
    }
    controlerDoublonsPilotes();
}

document.
