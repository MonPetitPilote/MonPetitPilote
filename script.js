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

// Initialisation de l'application
const app = firebase.initializeApp(firebaseConfig);

// 🎯 Initialisation propre de Firestore avec fusion des paramètres (évite le warning et le blocage)
var db = firebase.firestore(app);
db.settings({
    host: "firestore.googleapis.com", // On remet le host par défaut explicitement
    ssl: true,
    experimentalAutoDetectLongPolling: true // Force le polling contre uBlock/AdBlock
});

var auth = firebase.auth();

// Chemins locaux vers tes images AVIF
const LOGOS_2026 = {
    redbull: "images/cars/redbull.avif",
    ferrari: "images/cars/ferrari.avif",
    mclaren: "images/cars/mclaren.avif",
    mercedes: "images/cars/mercedes.avif",
    aston: "images/cars/astonmartin.avif",
    alpine: "images/cars/alpine.avif",
    williams: "images/cars/williams.avif",
    racingbulls: "images/cars/racingbulls.avif",
    audi: "images/cars/audi.avif",
    haas: "images/cars/haas.avif"
};

const designPilotesF1 = {};

// ==========================================
// 2. GESTION DE L'AUTHENTIFICATION (CONNEXION/INSCRIPTION)
// ==========================================

auth.onAuthStateChanged(user => {
    const zoneAuth = document.getElementById('auth-inputs-header');
    const zoneInfo = document.getElementById('user-info-header');
    const nomUser = document.getElementById('user-logged-name');

    if (user) {
        if(zoneAuth) zoneAuth.style.display = 'none';
        if(zoneInfo) zoneInfo.style.display = 'flex';
        if(nomUser) nomUser.innerText = user.email.split('@')[0];

        // Lecture du profil dans "pronostics" au lieu de "utilisateurs"
        db.collection("pronostics").doc(user.uid).get().then(doc => {
            if (doc.exists) {
                const userData = doc.data();
                if(nomUser) nomUser.innerText = userData.pseudo || user.email.split('@')[0];
                
                // Affichage des points réels de la base de données
                const ptsG = userData.points !== undefined ? userData.points : 0;
                const el = document.getElementById('user-logged-points');
                if(el) el.innerText = ptsG + " pts au Général";
                
                const badgeEligible = document.getElementById('badge-eligible');
                if(badgeEligible) {
                    badgeEligible.innerText = userData.eligible ? "👑 ÉLIGIBLE" : "❌ NON ÉLIGIBLE";
                    badgeEligible.style.color = userData.eligible ? "#22c55e" : "#ef4444";
                }
            }
        }).catch(err => {
            console.error("Erreur lors de la récupération des points du profil :", err);
        });

        chargerPronosticsUtilisateur();
    } else {
        if(zoneAuth) zoneAuth.style.display = 'flex';
        if(zoneInfo) zoneInfo.style.display = 'none';
    }
});

// Événement Connexion
document.getElementById('btn-connexion-header')?.addEventListener('click', () => {
    const email = document.getElementById('input-email-header')?.value;
    const pass = document.getElementById('input-pass-header')?.value;
    if(!email || !pass) return alert("Veuillez remplir les deux champs de connexion.");
    
    auth.signInWithEmailAndPassword(email, pass).catch(err => {
        alert("Erreur de connexion : " + err.message);
    });
});

// Événement Inscription
document.getElementById('btn-inscription')?.addEventListener('click', () => {
    const email = document.getElementById('reg-email')?.value;
    const pass = document.getElementById('reg-pass')?.value;
    const pseudo = document.getElementById('reg-pseudo')?.value;

    if(!email || !pass || !pseudo) return alert("Veuillez remplir tous les champs d'inscription.");

    auth.createUserWithEmailAndPassword(email, pass).then(res => {
        db.collection("pronostics").doc(res.user.uid).set({
            pseudo: pseudo,
            email: email,
            points: 0,
            eligible: true
        }).then(() => {
            alert("Compte créé avec succès !");
            location.reload();
        });
    }).catch(err => {
        alert("Erreur d'inscription : " + err.message);
    });
});

// Événement Déconnexion
document.getElementById('btn-deconnexion-header')?.addEventListener('click', () => {
    auth.signOut().then(() => location.reload());
});

// ==========================================
// 3. BASE DE DONNÉES DU CHAMPIONNAT (PILOTES ET ÉCURIES)
// ==========================================
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
    {nom: "Jack Doohan", ecurie: "Alpine", statut: "outsider"},
    {nom: "Alex Albon", ecurie: "Williams", statut: "outsider"},
    {nom: "Carlos Sainz", ecurie: "Williams", statut: "outsider"},
    {nom: "Yuki Tsunoda", ecurie: "Racing Bulls", statut: "outsider"},
    {nom: "Liam Lawson", ecurie: "Racing Bulls", statut: "outsider"},
    {nom: "Nico Hulkenberg", ecurie: "Audi", statut: "outsider"},
    {nom: "Gabriel Bortoleto", ecurie: "Audi", statut: "outsider"},
    {nom: "Esteban Ocon", ecurie: "Haas", statut: "outsider"},
    {nom: "Oliver Bearman", ecurie: "Haas", statut: "outsider"}
];

const ecuriesListe = [
    "Red Bull", "Ferrari", "McLaren", "Mercedes", "Aston Martin", 
    "Alpine", "Williams", "Racing Bulls", "Audi", "Haas"
];

// ==========================================
// 4. CHARGEMENT ET TRI DU CLASSEMENT GÉNÉRAL
// ==========================================
async function chargerClassementGeneral() {
    const liste = document.getElementById('liste-classement') || document.getElementById('ranking-list') || document.querySelector('.liste-classement'); 
    if(!liste) return;
    
    liste.innerHTML = "<div style='color:#616e88; padding:10px;'>Chargement du classement...</div>";
    
    try {
        const snapshot = await db.collection("pronostics").get();
        liste.innerHTML = "";
        
        if (snapshot.empty) {
            liste.innerHTML = "<div style='color:#616e88; padding:10px;'>Aucun joueur enregistré.</div>";
            return;
        }

        let joueurs = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.pseudo) {
                joueurs.push({
                    pseudo: data.pseudo,
                    points: data.points !== undefined ? Number(data.points) : 0
                });
            }
        });

        // Tri décroissant pour mettre le premier du championnat en haut
        joueurs.sort((a, b) => b.points - a.points);

        joueurs.forEach((u, index) => {
            const pos = index + 1;
            const div = document.createElement('div');
            div.style = 'display:grid; grid-template-columns:50px 1fr 80px; padding:12px; border-bottom:1px solid #1c2437; align-items:center; color:#fff;';
            div.innerHTML = `
                <div><strong style="color:${pos <= 3 ? '#ff8000' : '#616e88'}">#${pos}</strong></div>
                <div>${u.pseudo}</div>
                <div style="text-align:right; font-weight:bold; color:#ff8000;">${u.points} pts</div>
            `;
            liste.appendChild(div); 
        });

    } catch (error) {
        console.error("Erreur classement :", error);
        liste.innerHTML = "<div style='color:#ef4444; padding:10px;'>Erreur d'accès au classement.</div>";
    }
}

// ==========================================
// 5. INITIALISATION DES SÉLECTEURS ET GRILLE
// ==========================================
function initialiserSelectCourse() {
    const select = document.getElementById('select-course');
    if(!select) return;
    select.innerHTML = "";
    for(let i = 1; i <= 24; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.innerText = `Grand Prix ${i}`;
        select.appendChild(opt);
    }
}

function initialiserPolePosition() {
    const select = document.getElementById('select-poleman');
    if(!select) return;
    select.innerHTML = '<option value="">-- Choisir le Poleman --</option>';
    pilotesData.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.nom;
        opt.innerText = p.nom;
        select.appendChild(opt);
    });
}

function initialiserEcuriesTopFlop() {
    const ids = ['ecurie-top-1', 'ecurie-top-2', 'ecurie-flop-1', 'ecurie-flop-2'];
    ids.forEach(id => {
        const select = document.getElementById(id);
        if(!select) return;
        select.innerHTML = `<option value="">-- Sélectionner --</option>`;
        ecuriesListe.forEach(ec => {
            const opt = document.createElement('option');
            opt.value = ec;
            opt.innerText = ec;
            select.appendChild(opt);
        });
    });
}

// ==========================================
// 6. LOGIQUE OPENF1 ET ESTHÉTIQUE DE LA GRILLE
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
        console.error("OpenF1 hors-ligne ou bloqué par CORS :", e);
    }
    creerLaGrilleDeDepartTV();
}

function creerLaGrilleDeDepartTV() {
    const container = document.getElementById('paddock-grid-slots');
    if(!container) return;
    container.innerHTML = "";

    for(let i = 1; i <= 10; i++) {
        const divSlot = document.createElement('div');
        divSlot.className = 'grid-slot-card';
        divSlot.id = `card-slot-p${i}`;
        
        divSlot.innerHTML = `
            <div class="grid-badge-position">P${i}</div>
            <div class="grid-driver-info">
                <select id="select-grid-p${i}" class="grid-select-paddock" onchange="gererChangementPiloteGrille(${i}, this.value)">
                    <option value="">-- Choisir Pilote --</option>
                </select>
                <div id="team-badge-p${i}" class="grid-driver-team">--</div>
            </div>
        `;
        container.appendChild(divSlot);

        const select = document.getElementById(`select-grid-p${i}`);
        pilotesData.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.nom;
            opt.innerText = p.nom;
            select.appendChild(opt);
        });
    }
}

function gererChangementPiloteGrille(position, nomPilote) {
    mettreAJourDesignSlot(position, nomPilote);
    controlerDoublonsPilotes();
}

function mettreAJourDesignSlot(pos, nomPilote) {
    const card = document.getElementById(`card-slot-p${pos}`);
    const badgeTeam = document.getElementById(`team-badge-p${pos}`);
    if(!card) return;

    if(!nomPilote) {
        card.style.borderLeft = "5px solid #2d3954";
        if(badgeTeam) badgeTeam.innerText = "--";
        return;
    }

    const piloteObj = pilotesData.find(p => p.nom === nomPilote);
    
    let couleurEcurie = "#ff8000";
    if(designPilotesF1[nomPilote] && designPilotesF1[nomPilote].couleur) {
        couleurEcurie = designPilotesF1[nomPilote].couleur;
    }

    card.style.borderLeft = `5px solid ${couleurEcurie}`;
    if(badgeTeam && piloteObj) badgeTeam.innerText = piloteObj.ecurie;
}

// Contrôle visuel des pilotes sélectionnés en double
function controlerDoublonsPilotes() {
    const selectionnes = [];
    for(let i = 1; i <= 10; i++) {
        const s = document.getElementById(`select-grid-p${i}`);
        if(s && s.value) selectionnes.push(s.value);
    }

    for(let i = 1; i <= 10; i++) {
        const s = document.getElementById(`select-grid-p${i}`);
        if(!s) continue;
        const valeur = s.value;
        
        const doublons = selectionnes.filter(v => v === valeur).length;
        if(valeur && doublons > 1) {
            s.style.color = "#ef4444";
            s.style.borderColor = "#ef4444";
        } else {
            s.style.color = "white";
            s.style.borderColor = "#2d3954";
        }
    }
}

// Bouton Aléatoire
document.getElementById('btn-aleatoire')?.addEventListener('click', () => {
    let tri = [...pilotesData].sort(() => 0.5 - Math.random());
    for(let i=1; i<=10; i++) {
        const s = document.getElementById(`select-grid-p${i}`);
        if(s) { 
            s.value = tri[i-1].nom; 
            mettreAJourDesignSlot(i, tri[i-1].nom); 
        }
    }
    controlerDoublonsPilotes();
});

// ==========================================
// 7. CHARGEMENT ET SAUVEGARDE DES PRONOSTICS
// ==========================================
function chargerPronosticsUtilisateur() {
    // 1. Reset visuel complet des champs d'abord, pour que la grille ne disparaisse jamais
    for(let i=1; i<=10; i++) {
        const s = document.getElementById(`select-grid-p${i}`);
        if(s) { s.value = ""; mettreAJourDesignSlot(i, ""); }
    }
    const pole = document.getElementById('select-poleman'); if(pole) pole.value = "";
    const t1 = document.getElementById('ecurie-top-1'); if(t1) t1.value = "";
    const t2 = document.getElementById('ecurie-top-2'); if(t2) t2.value = "";
    const f1 = document.getElementById('ecurie-flop-1'); if(f1) f1.value = "";
    const f2 = document.getElementById('ecurie-flop-2'); if(f2) f2.value = "";
    const jk = document.getElementById('check-joker'); if(jk) jk.checked = false;

    const user = auth.currentUser;
    if(!user) return; // Si pas connecté, on s'arrête là mais les sélecteurs restent affichés et vides !

    const round = document.getElementById('select-course').value;
    const docId = round ? `gp_${round}` : 'gp_1';
    
    db.collection("pronostics").doc(user.uid).collection("grands_prix").doc(docId).get().then(doc => {
        if(doc.exists) {
            const data = doc.data();
            if(data.top10 && Array.isArray(data.top10)) {
                data.top10.forEach((pilote, index) => {
                    const s = document.getElementById(`select-grid-p${index+1}`);
                    if(s) { s.value = pilote; mettreAJourDesignSlot(index+1, pilote); }
                });
            }
            if(pole && data.poleman) pole.value = data.poleman;
            if(t1 && data.ecurieTop1) t1.value = data.ecurieTop1;
            if(t2 && data.ecurieTop2) t2.value = data.ecurieTop2;
            if(f1 && data.ecurieFlop1) f1.value = data.ecurieFlop1;
            if(f2 && data.ecurieFlop2) f2.value = data.ecurieFlop2;
            if(jk && data.jokerUtilise) jk.checked = data.jokerUtilise;
        }
        controlerDoublonsPilotes();
    }).catch(err => {
        console.error("Erreur de chargement des pronos :", err);
    });
}

// Bouton valider les pronos
document.getElementById('btn-valider')?.addEventListener('click', () => {
    const user = auth.currentUser;
    if(!user) return alert("Veuillez vous connecter pour sauvegarder vos pronostics.");

    const round = document.getElementById('select-course').value;
    
    const top10 = [];
    for(let i=1; i<=10; i++) {
        const val = document.getElementById(`select-grid-p${i}`)?.value;
        if(val) top10.push(val);
    }

    if(top10.length < 10) {
        return alert("Veuillez compléter votre Top 10 pilotes avant de valider.");
    }

    const aChanger = new Set(top10);
    if(aChanger.size < 10) return alert("Erreur : Vous avez mis le même pilote plusieurs fois dans votre Top 10.");

    const poleman = document.getElementById('select-poleman')?.value;
    
    // Supporte les ID HTML avec ou sans "s" (ecurie-top-1 vs ecuries-top-1)
    const ecurieTop1 = document.getElementById('ecurie-top-1')?.value || document.getElementById('ecuries-top-1')?.value;
    const ecurieTop2 = document.getElementById('ecurie-top-2')?.value || document.getElementById('ecuries-top-2')?.value;
    const ecurieFlop1 = document.getElementById('ecurie-flop-1')?.value || document.getElementById('ecuries-flop-1')?.value;
    const ecurieFlop2 = document.getElementById('ecurie-flop-2')?.value || document.getElementById('ecuries-flop-2')?.value;
    const jokerUtilise = document.getElementById('check-joker')?.checked || false;

    db.collection("pronostics").doc(user.uid).collection("grands_prix").doc(`gp_${round}`).set({
        top10: top10,
        poleman: poleman || "",
        ecurieTop1: ecurieTop1 || "",
        ecurieTop2: ecurieTop2 || "",
        ecurieFlop1: ecurieFlop1 || "",
        ecurieFlop2: ecurieFlop2 || "",
        jokerUtilise: jokerUtilise,
        sauvegardeLe: new Date()
    }).then(() => {
        alert(`🏁 Vos pronostics pour le Grand Prix ${round} ont bien été enregistrés !`);
    }).catch(err => {
        alert("Erreur de sauvegarde : " + err.message);
    });
});

// Modales Règlement
function adapterEnTeteTitreEtReglement() {
    document.getElementById('btn-reglement')?.addEventListener('click', () => {
        const modal = document.getElementById('modale-reglement');
        if(modal) modal.style.display = 'flex';
    });
    document.getElementById('btn-fermer-reglement')?.addEventListener('click', () => {
        const modal = document.getElementById('modale-reglement');
        if(modal) modal.style.display = 'none';
    });
}

// ==========================================
// 8. INITIALISATIONS DE BASE AU CHARGEMENT
// ==========================================
initialiserSelectCourse();
initialiserPolePosition();
initialiserEcuriesTopFlop();
chargerClassementGeneral();
chargerDonneesEsthetiquesOpenF1();
adapterEnTeteTitreEtReglement();

const selectCourse = document.getElementById('select-course');
if(selectCourse) selectCourse.addEventListener('change', chargerPronosticsUtilisateur);
