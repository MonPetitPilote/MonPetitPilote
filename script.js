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

// Liens publics Wikipedia d'écuries et de silhouettes (100% ouverts pour l'intégration web)
const LOGOS_2026 = {
    redbull: "https://upload.wikimedia.org/wikipedia/en/1/15/Red_Bull_Racing_logo.svg",
    ferrari: "https://upload.wikimedia.org/wikipedia/en/c/c0/Scuderia_Ferrari_Logo.svg",
    mclaren: "https://upload.wikimedia.org/wikipedia/en/6/66/McLaren_Racing_logo.svg",
    mercedes: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Mercedes-AMG_Petronas_F1_Team_Logo.svg",
    aston: "https://upload.wikimedia.org/wikipedia/en/b/b8/Aston_Martin_F1_logo.svg",
    alpine: "https://upload.wikimedia.org/wikipedia/fr/7/7e/Alpine_F1_Team_Logo.svg",
    williams: "https://upload.wikimedia.org/wikipedia/commons/6/6c/Williams_Racing_logo.svg",
    racingbulls: "https://upload.wikimedia.org/wikipedia/en/0/02/Visa_Cash_App_RB_F1_Team_logo.svg",
    audi: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Audi_F1_Team_logo.svg",
    haas: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Haas_F1_Team_logo.svg",
    cadillac: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Cadillac_Automobile_Logo.svg"
};

// Silhouette de casque universelle stylisée en attendant les séances photo officielles 2026
const HELMET_PLACEHOLDER = "https://upload.wikimedia.org/wikipedia/commons/e/ee/Helmet_font_awesome.svg";

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

document.getElementById('btn-valider')?.addEventListener('click', async () => {
    if (!utilisateurActuel) return alert("Tu dois être connecté !");
    const courseId = selectCourse.value;
    const top10Selection = [];
    for(let i=1; i<=10; i++) {
        const val = document.getElementById(`select-grid-p${i}`).value;
        if(!val) return alert(`Il manque la position P${i} !`);
        top10Selection.push(val);
    }
    const pronoData = {
        uidJoueur: utilisateurActuel.uid,
        pseudo: utilisateurActuel.displayName || utilisateurActuel.email,
        course: courseId,
        classementPilotes: top10Selection,
        poleman: selectPole.value,
        ecuriesTop: [document.getElementById('ecurie-top-1').value, document.getElementById('ecurie-top-2').value],
        ecuriesFlop: [document.getElementById('ecurie-flop-1').value, document.getElementById('ecurie-flop-2').value],
        dateEnregistrement: new Date()
    };
    await db.collection("pronostics").doc(`${utilisateurActuel.uid}_${courseId.replace('/', '_')}`).set(pronoData);
    alert("🏁 Grille enregistrée avec succès !");
});

async function chargerClassementGeneral() {
    const liste = document.getElementById('liste-classement'); if(!liste) return;
    liste.innerHTML = "";
    const snapshot = await db.collection("utilisateurs").orderBy("points", "desc").get();
    let pos = 1;
    snapshot.forEach(doc => {
        const u = doc.data();
        const div = document.createElement('div');
        div.style = 'display:grid; grid-template-columns:40px 1fr 60px; padding:12px; border-bottom:1px solid #1c2437;';
        div.innerHTML = `<div><strong>#${pos}</strong></div><div>${u.pseudo}</div><div style="text-align:right; font-weight:bold; color:#ff8000;">${u.points || 0} pts</div>`;
        liste.appendChild(div); pos++;
    });
}

document.getElementById('btn-aleatoire')?.addEventListener('click', () => {
    let tri = [...pilotesData].sort(() => 0.5 - Math.random());
    for(let i=1; i<=10; i++) {
        const s = document.getElementById(`select-grid-p${i}`);
        if(s) { s.value = tri[i-1].nom; mettreAJourDesignSlot(i, tri[i-1].nom); }
    }
    controlerDoublonsPilotes();
});

// INITIALISATIONS DE BASE AU CHARGEMENT
initialiserSelectCourse();
initialiserPolePosition();
initialiserEcuriesTopFlop();
chargerClassementGeneral();
chargerDonneesEsthetiquesOpenF1();
if(selectCourse) selectCourse.addEventListener('change', chargerPronosticsUtilisateur);
