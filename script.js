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

// Base locale de référence (Noms à faire matcher avec OpenF1)
const pilotesData = [
  {nom: "Max Verstappen", ecurie: "Red Bull"},
  {nom: "Isack Hadjar", ecurie: "Red Bull"},
  {nom: "Lewis Hamilton", ecurie: "Ferrari"},
  {nom: "Charles Leclerc", ecurie: "Ferrari"},
  {nom: "Lando Norris", ecurie: "McLaren"},
  {nom: "Oscar Piastri", ecurie: "McLaren"},
  {nom: "George Russell", ecurie: "Mercedes"},
  {nom: "Kimi Antonelli", ecurie: "Mercedes"},
  {nom: "Fernando Alonso", ecurie: "Aston Martin"},
  {nom: "Lance Stroll", ecurie: "Aston Martin"},
  {nom: "Pierre Gasly", ecurie: "Alpine"},
  {nom: "Franco Colapinto", ecurie: "Alpine"},
  {nom: "Carlos Sainz", ecurie: "Williams"},
  {nom: "Alex Albon", ecurie: "Williams"},
  {nom: "Liam Lawson", ecurie: "Racing Bulls"},
  {nom: "Arvid Lindblad", ecurie: "Racing Bulls"},
  {nom: "Nico Hülkenberg", ecurie: "Audi"},
  {nom: "Gabriel Bortoleto", ecurie: "Audi"},
  {nom: "Oliver Bearman", ecurie: "Haas"},
  {nom: "Esteban Ocon", ecurie: "Haas"},
  {nom: "Valttes Bottas", ecurie: "Cadillac"},
  {nom: "Sergio Pérez", ecurie: "Cadillac"}
];

const ecuriesSaison = ["Red Bull", "Ferrari", "McLaren", "Mercedes", "Aston Martin", "Alpine", "Williams", "Racing Bulls", "Audi", "Haas", "Cadillac"];

let utilisateurActuel = null;
let designPilotesF1 = {}; // Dictionnaire pour stocker les images OpenF1

// Éléments HTML
const selectCourse = document.getElementById('select-course');
const selectPole = document.getElementById('select-pole');

// ==========================================
// 2. GESTION AUTHENTIFICATION (CORRIGÉE)
// ==========================================
auth.onAuthStateChanged((user) => {
    const zoneDeconnecte = document.getElementById('auth-deconnecte');
    const zoneConnecte = document.getElementById('auth-connecte');
    const nomUserSpan = document.getElementById('nom-utilisateur');

    if (user) {
        utilisateurActuel = user;
        if(zoneDeconnecte) zoneDeconnecte.style.display = 'none';
        if(zoneConnecte) zoneConnecte.style.display = 'flex';
        if(nomUserSpan) nomUserSpan.innerText = user.displayName || user.email;
        verifierDisponibiliteJoker();
        chargerPronosticsUtilisateur();
    } else {
        utilisateurActuel = null;
        if(zoneDeconnecte) zoneDeconnecte.style.display = 'block';
        if(zoneConnecte) zoneConnecte.style.display = 'none';
    }
});

// Écouteurs Connexion/Inscription/Déconnexion standard
document.getElementById('btn-connexion')?.addEventListener('click', () => {
    const email = document.getElementById('auth-email').value;
    const mdp = document.getElementById('auth-mdp').value;
    auth.signInWithEmailAndPassword(email, mdp).catch(err => alert("Erreur: " + err.message));
});

document.getElementById('btn-inscription')?.addEventListener('click', () => {
    const pseudo = document.getElementById('auth-pseudo').value;
    const email = document.getElementById('auth-email').value;
    const mdp = document.getElementById('auth-mdp').value;
    if(!pseudo) return alert("Pseudo obligatoire !");
    
    auth.createUserWithEmailAndPassword(email, mdp).then((res) => {
        res.user.updateProfile({ displayName: pseudo }).then(() => {
            db.collection("utilisateurs").doc(res.user.uid).set({ pseudo: pseudo, points: 0 });
            location.reload();
        });
    }).catch(err => alert("Erreur: " + err.message));
});

document.getElementById('btn-deconnexion')?.addEventListener('click', () => auth.signOut());

// ==========================================
// 3. CHARGEMENT ET GRILLE DYNAMIQUE OPENF1 TV
// ==========================================
async function chargerDonneesEsthetiquesOpenF1() {
    try {
        const response = await fetch('https://api.openf1.org/v1/drivers?session_key=latest');
        const drivers = await response.json();
        
        drivers.forEach(d => {
            const nomComplet = `${d.first_name} ${d.last_name}`;
            designPilotesF1[nomComplet] = {
                photo: d.headshot_url || 'https://media.formula1.com/d_driver_fallback_image.png',
                couleur: `#${d.team_colour || '2d3954'}`,
                ecurie: d.team_name
            };
        });
        console.log("🏎️ Banque d'images OpenF1 synchronisée.");
    } catch (e) {
        console.error("OpenF1 indisponible. Passage au mode standard.", e);
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

        let optionsHtml = `<option value="">-- Choisir P${i} --</option>`;
        pilotesData.forEach(p => { optionsHtml += `<option value="${p.nom}">${p.nom}</option>`; });

        slot.innerHTML = `
            <div class="grid-pos-badge">P${i}</div>
            <div class="grid-driver-avatar">
                <img id="img-grid-p${i}" src="https://media.formula1.com/d_driver_fallback_image.png" alt="Pilote">
            </div>
            <div class="grid-driver-info">
                <select id="select-grid-p${i}" class="grid-select-paddock" data-position="${i}">
                    ${optionsHtml}
                </select>
                <div id="team-grid-p${i}" class="grid-driver-team">Écurie non définie</div>
            </div>
        `;
        conteneurGrille.appendChild(slot);

        // Changement dynamique au choix
        slot.querySelector('select').addEventListener('change', function() {
            mettreAJourDesignSlot(i, this.value);
        });
    }
}

function mettreAJourDesignSlot(position, nomPilote) {
    const imgTarget = document.getElementById(`img-grid-p${position}`);
    const teamTarget = document.getElementById(`team-grid-p${position}`);
    const slot = document.querySelector(`.grid-slot[data-pos="${position}"]`);
    
    if (nomPilote && designPilotesF1[nomPilote]) {
        imgTarget.src = designPilotesF1[nomPilote].photo;
        teamTarget.innerText = designPilotesF1[nomPilote].ecurie;
        if(slot) slot.style.borderRight = `4px solid ${designPilotesF1[nomPilote].couleur}`;
    } else {
        imgTarget.src = "https://media.formula1.com/d_driver_fallback_image.png";
        teamTarget.innerText = "Écurie non définie";
        if(slot) slot.style.borderRight = `4px solid #2d3954`;
    }
}

// ==========================================
// 4. LOGIQUE DES OPTIONS SÉLECTEURS ET PRONOS
// ==========================================
function initialiserSelectCourse() {
    if (!selectCourse) return;
    for (let i = 1; i <= 24; i++) {
        const opt = document.createElement('option');
        opt.value = `2026/${i}`;
        opt.innerText = `Grand Prix Grand Prix - Round ${i}`;
        selectCourse.appendChild(opt);
    }
}

function initialiserPolePosition() {
    if (!selectPole) return;
    selectPole.innerHTML = '<option value="">-- Sélectionne ton poleman --</option>';
    pilotesData.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.nom; opt.innerText = p.nom;
        selectPole.appendChild(opt);
    });
}

function initialiserEcuriesTopFlop() {
    ["ecurie-top-1", "ecurie-top-2", "ecurie-flop-1", "ecurie-flop-2"].forEach(id => {
        const select = document.getElementById(id);
        if(!select) return;
        select.innerHTML = '<option value="">-- Choisir --</option>';
        ecuriesSaison.forEach(e => {
            const opt = document.createElement('option');
            opt.value = e; opt.innerText = e;
            select.appendChild(opt);
        });
    });
}

// ==========================================
// 5. CHARGEMENT ET SAUVEGARDE FIRESTORE
// ==========================================
async function chargerPronosticsUtilisateur() {
    if (!utilisateurActuel || !selectCourse) return;
    const courseId = selectCourse.value;
    
    const pronoRef = db.collection("pronostics").doc(`${utilisateurActuel.uid}_${courseId.replace('/', '_')}`);
    const doc = await pronoRef.get();
    
    // Réinitialisation par défaut
    for (let i = 1; i <= 10; i++) {
        const s = document.getElementById(`select-grid-p${i}`);
        if(s) { s.value = ""; mettreAJourDesignSlot(i, ""); }
    }
    if(selectPole) selectPole.value = "";
    document.getElementById('check-joker').checked = false;

    if (doc.exists) {
        const data = doc.data();
        if (data.classementPilotes) {
            data.classementPilotes.forEach((nom, idx) => {
                const s = document.getElementById(`select-grid-p${idx+1}`);
                if (s) { s.value = nom; mettreAJourDesignSlot(idx+1, nom); }
            });
        }
        if(selectPole && data.poleman) selectPole.value = data.poleman;
        document.getElementById('check-joker').checked = data.jokerActive || false;
        
        if(data.ecuriesTop) {
            if(document.getElementById('ecurie-top-1')) document.getElementById('ecurie-top-1').value = data.ecuriesTop[0] || "";
            if(document.getElementById('ecurie-top-2')) document.getElementById('ecurie-top-2').value = data.ecuriesTop[1] || "";
        }
        if(data.ecuriesFlop) {
            if(document.getElementById('ecurie-flop-1')) document.getElementById('ecurie-flop-1').value = data.ecuriesFlop[0] || "";
            if(document.getElementById('ecurie-flop-2')) document.getElementById('ecurie-flop-2').value = data.ecuriesFlop[1] || "";
        }
    }
}

document.getElementById('btn-valider')?.addEventListener('click', async () => {
    if (!utilisateurActuel) return alert("Tu dois être connecté pour valider tes paris !");
    const courseId = selectCourse.value;

    const top10Selection = [];
    for(let i=1; i<=10; i++) {
        const val = document.getElementById(`select-grid-p${i}`).value;
        if(!val) return alert(`Il te manque le pilote en position P${i} !`);
        top10Selection.push(val);
    }

    const uniqueDrivers = new Set(top10Selection);
    if(uniqueDrivers.size < 10) return alert("Attention, tu as sélectionné plusieurs fois le même pilote dans ton Top 10 !");

    const pman = selectPole.value;
    if(!pman) return alert("N'oublie pas de choisir le vainqueur de la Pole Position !");

    const t1 = document.getElementById('ecurie-top-1').value;
    const t2 = document.getElementById('ecurie-top-2').value;
    const f1 = document.getElementById('ecurie-flop-1').value;
    const f2 = document.getElementById('ecurie-flop-2').value;

    const pronoData = {
        uidJoueur: utilisateurActuel.uid,
        pseudo: utilisateurActuel.displayName || utilisateurActuel.email,
        course: courseId,
        classementPilotes: top10Selection,
        poleman: pman,
        jokerActive: document.getElementById('check-joker').checked,
        ecuriesTop: [t1, t2],
        ecuriesFlop: [f1, f2],
        dateEnregistrement: new Date()
    };

    await db.collection("pronostics").doc(`${utilisateurActuel.uid}_${courseId.replace('/', '_')}`).set(pronoData);
    alert("🏁 Tes pronostics ont bien été enregistrés sur la grille !");
});

// ==========================================
// 6. CLASSEMENTS ET ACTIONS
// ==========================================
async function chargerClassementGeneral() {
    const liste = document.getElementById('liste-classement');
    if(!liste) return;
    liste.innerHTML = "";
    
    const snapshot = await db.collection("utilisateurs").orderBy("points", "desc").get();
    let pos = 1;
    snapshot.forEach(doc => {
        const u = doc.data();
        const div = document.createElement('div');
        div.className = 'ligne-joueur';
        div.style = 'display:grid; grid-template-columns:40px 1fr 60px; padding:12px; border-bottom:1px solid #1c2437; cursor:pointer;';
        div.innerHTML = `<div><strong>#${pos}</strong></div><div>${u.pseudo}</div><div style="text-align:right; font-weight:bold; color:#ff8000;">${u.points || 0} pts</div>`;
        liste.appendChild(div);
        pos++;
    });
}

function verifierDisponibiliteJoker() {}
document.getElementById('btn-aleatoire')?.addEventListener('click', () => {
    let tri = [...pilotesData].sort(() => 0.5 - Math.random());
    for(let i=1; i<=10; i++) {
        const s = document.getElementById(`select-grid-p${i}`);
        if(s) { s.value = tri[i-1].nom; mettreAJourDesignSlot(i, tri[i-1].nom); }
    }
});

// RÈGLEMENT MODAL
document.getElementById('btn-ouvrir-reglement')?.addEventListener('click', () => {
    const modal = document.createElement('div');
    modal.className = 'modal-back';
    modal.innerHTML = `
        <div class="modal-content-inner">
            <span class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2 style="color:#ff8000; margin-top:0;">📜 LE RÈGLEMENT DU PADDOCK</h2>
            <div class="reglement-item"><strong>1. Barème Pilotes :</strong> Position exacte = 10 pts. Pilote dans le Top 10 mais mauvaise place = 3 pts.</div>
            <div class="reglement-item"><strong>2. Pole Position :</strong> Trouver le bon poleman du samedi rapporte +15 pts.</div>
            <div class="reglement-item"><strong>3. Joker unique :</strong> Une seule fois dans l'année, coche le joker pour tripler tes gains du GP.</div>
        </div>`;
    document.body.appendChild(modal);
});

// INITIALISATIONS
initialiserSelectCourse();
initialiserPolePosition();
initialiserEcuriesTopFlop();
chargerClassementGeneral();
chargerDonneesEsthetiquesOpenF1();

if(selectCourse) selectCourse.addEventListener('change', chargerPronosticsUtilisateur);
