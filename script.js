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

const designPilotesF1 = {};

// ==========================================
// 2. GESTION DE L'AUTHENTIFICATION & DU PROFIL
// ==========================================
auth.onAuthStateChanged(user => {
    const zoneAuth = document.getElementById('auth-inputs-header');
    const zoneInfo = document.getElementById('user-info-header');
    const nomUser = document.getElementById('user-logged-name');
    const pointsUser = document.getElementById('user-logged-points');
    const badgesContainer = document.getElementById('user-badges-container');
    const blocInscription = document.getElementById('bloc-zone-inscription');

    if (user) {
        if(zoneAuth) zoneAuth.style.display = 'none';
        if(blocInscription) blocInscription.style.display = 'none';
        if(zoneInfo) zoneInfo.style.display = 'flex';

        db.collection("pronostics").doc(user.uid).get().then(doc => {
            if (doc.exists) {
                const userData = doc.data();
                
                // Pseudo & Points
                if(nomUser) nomUser.innerText = userData.pseudo || user.email.split('@')[0];
                const ptsG = userData.points !== undefined ? userData.points : 0;
                if(pointsUser) pointsUser.innerText = ptsG + " pts";
                
                // Attribution des Badges de Prestige
                if(badgesContainer) {
                    badgesContainer.innerHTML = "";
                    const poles = userData.polesReussies || 0;
                    if(poles > 0) {
                        badgesContainer.innerHTML += `
                            <span title="Expert Qualif : ${poles} Pole(s) trouvée(s)" style="cursor:help; background:#3b82f6; color:white; font-size:0.75rem; padding:2px 6px; border-radius:4px; font-weight:bold; display:flex; align-items:center; gap:3px;">
                                ⏱️ ${poles}
                            </span>`;
                    }
                    if(ptsG >= 150) {
                        badgesContainer.innerHTML += `
                            <span title="Pilote d'Élite : Plus de 150 points" style="cursor:help; background:#9333ea; color:white; font-size:0.75rem; padding:2px 6px; border-radius:4px; font-weight:bold;">
                                👑 Élite
                            </span>`;
                    }
                }
                
                // Éligibilité
                const badgeEligible = document.getElementById('badge-eligible');
                if(badgeEligible) {
                    badgeEligible.innerText = userData.eligible ? "👑 ÉLIGIBLE" : "❌ NON ÉLIGIBLE";
                    badgeEligible.style.color = userData.eligible ? "#22c55e" : "#ef4444";
                }
            }
        }).catch(err => {
            console.error("Erreur profil :", err);
        });

        chargerPronosticsUtilisateur();
    } else {
        if(zoneAuth) zoneAuth.style.display = 'flex';
        if(blocInscription) blocInscription.style.display = 'block';
        if(zoneInfo) zoneInfo.style.display = 'none';
    }
});

document.getElementById('btn-connexion-header')?.addEventListener('click', () => {
    const email = document.getElementById('input-email-header')?.value;
    const pass = document.getElementById('input-pass-header')?.value;
    if(!email || !pass) return alert("Veuillez renseigner vos identifiants.");
    auth.signInWithEmailAndPassword(email, pass).catch(err => alert("Erreur : " + err.message));
});

document.getElementById('btn-inscription')?.addEventListener('click', () => {
    const email = document.getElementById('reg-email')?.value;
    const pass = document.getElementById('reg-pass')?.value;
    const pseudo = document.getElementById('reg-pseudo')?.value;

    if(!email || !pass || !pseudo) return alert("Tous les champs sont obligatoires.");

    auth.createUserWithEmailAndPassword(email, pass).then(res => {
        db.collection("pronostics").doc(res.user.uid).set({
            pseudo: pseudo,
            email: email,
            points: 0,
            polesReussies: 0,
            eligible: true
        }).then(() => {
            alert("Compte créé avec succès !");
            location.reload();
        });
    }).catch(err => alert("Erreur : " + err.message));
});

document.getElementById('btn-deconnexion-header')?.addEventListener('click', () => {
    auth.signOut().then(() => location.reload());
});

// ==========================================
// 3. BASE DE DONNÉES DU CHAMPIONNAT
// ==========================================
const pilotesData = [
    {nom: "Max Verstappen", ecurie: "Red Bull"}, {nom: "Isack Hadjar", ecurie: "Red Bull"},
    {nom: "Lewis Hamilton", ecurie: "Ferrari"}, {nom: "Charles Leclerc", ecurie: "Ferrari"},
    {nom: "Lando Norris", ecurie: "McLaren"}, {nom: "Oscar Piastri", ecurie: "McLaren"},
    {nom: "George Russell", ecurie: "Mercedes"}, {nom: "Kimi Antonelli", ecurie: "Mercedes"},
    {nom: "Fernando Alonso", ecurie: "Aston Martin"}, {nom: "Lance Stroll", ecurie: "Aston Martin"},
    {nom: "Pierre Gasly", ecurie: "Alpine"}, {nom: "Jack Doohan", ecurie: "Alpine"},
    {nom: "Alex Albon", ecurie: "Williams"}, {nom: "Carlos Sainz", ecurie: "Williams"},
    {nom: "Yuki Tsunoda", ecurie: "Racing Bulls"}, {nom: "Liam Lawson", ecurie: "Racing Bulls"},
    {nom: "Nico Hulkenberg", ecurie: "Audi"}, {nom: "Gabriel Bortoleto", ecurie: "Audi"},
    {nom: "Esteban Ocon", ecurie: "Haas"}, {nom: "Oliver Bearman", ecurie: "Haas"}
];

const ecuriesListe = ["Red Bull", "Ferrari", "McLaren", "Mercedes", "Aston Martin", "Alpine", "Williams", "Racing Bulls", "Audi", "Haas"];

// ==========================================
// 4. CHARGEMENT DU CLASSEMENT GENERAL
// ==========================================
async function chargerClassementGeneral() {
    const liste = document.getElementById('liste-classement');
    if(!liste) return;
    
    try {
        const snapshot = await db.collection("pronostics").get();
        liste.innerHTML = "";
        
        let joueurs = [];
        snapshot.forEach(doc => {
            const u = doc.data();
            if (u.pseudo) {
                joueurs.push({ pseudo: u.pseudo, points: u.points !== undefined ? Number(u.points) : 0 });
            }
        });

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
    }
}

// ==========================================
// 5. INITIALISATION DE LA GRILLE & SELECTEURS
// ==========================================
function initialiserFormulaires() {
    const selectCourse = document.getElementById('select-course');
    if(selectCourse) {
        selectCourse.innerHTML = "";
        for(let i = 1; i <= 24; i++) {
            const opt = document.createElement('option');
            opt.value = i; opt.innerText = `Grand Prix ${i}`;
            selectCourse.appendChild(opt);
        }
    }

    const selectPole = document.getElementById('select-poleman');
    if(selectPole) {
        selectPole.innerHTML = '<option value="">-- Choisir le Poleman --</option>';
        pilotesData.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.nom; opt.innerText = p.nom;
            selectPole.appendChild(opt);
        });
    }

    ['ecurie-top-1', 'ecurie-top-2'].forEach(id => {
        const selectEc = document.getElementById(id);
        if(!selectEc) return;
        selectEc.innerHTML = `<option value="">-- Sélectionner --</option>`;
        ecuriesListe.forEach(ec => {
            const opt = document.createElement('option');
            opt.value = ec; opt.innerText = ec;
            selectEc.appendChild(opt);
        });
    });
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
        if(select) {
            pilotesData.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.nom; opt.innerText = p.nom;
                select.appendChild(opt);
            });
        }
    }
}

function gererChangementPiloteGrille(position, nomPilote) {
    const card = document.getElementById(`card-slot-p${position}`);
    const badgeTeam = document.getElementById(`team-badge-p${position}`);
    if(!card) return;

    if(!nomPilote) {
        card.style.borderLeft = "5px solid #2d3954";
        if(badgeTeam) badgeTeam.innerText = "--";
        return;
    }

    const piloteObj = pilotesData.find(p => p.nom === nomPilote);
    let couleurEcurie = designPilotesF1[nomPilote]?.couleur || "#ff8000";

    card.style.borderLeft = `5px solid ${couleurEcurie}`;
    if(badgeTeam && piloteObj) badgeTeam.innerText = piloteObj.ecurie;
    controlerDoublonsPilotes();
}

function controlerDoublonsPilotes() {
    const selectionnes = [];
    for(let i = 1; i <= 10; i++) {
        const val = document.getElementById(`select-grid-p${i}`)?.value;
        if(val) selectionnes.push(val);
    }
    for(let i = 1; i <= 10; i++) {
        const s = document.getElementById(`select-grid-p${i}`);
        if(!s) continue;
        const doublons = selectionnes.filter(v => v === s.value).length;
        if(s.value && doublons > 1) {
            s.style.color = "#ef4444"; s.style.borderColor = "#ef4444";
        } else {
            s.style.color = "white"; s.style.borderColor = "#2d3954";
        }
    }
}

// ==========================================
// 6. SYNCHRONISATION DES PRONOSTICS ET BILANS
// ==========================================
function chargerPronosticsUtilisateur() {
    const user = auth.currentUser;
    if(!user) return;

    const round = document.getElementById('select-course').value || '1';
    
    // Éléments d'affichage du bilan
    const zoneBilan = document.getElementById('zone-bilan-gp');
    const txtPilotes = document.getElementById('bilan-points-pilotes');
    const txtPole = document.getElementById('bilan-points-pole');
    const txtEcuries = document.getElementById('bilan-points-ecuries');
    const txtTotal = document.getElementById('bilan-points-total');
    const txtJokerMention = document.getElementById('bilan-joker-mention');

    db.collection("pronostics").doc(user.uid).collection("grands_prix").doc(`gp_${round}`).get().then(doc => {
        if(doc.exists) {
            const data = doc.data();
            
            // Restauration de la grille
            if(data.top10 && Array.isArray(data.top10)) {
                data.top10.forEach((pilote, index) => {
                    const s = document.getElementById(`select-grid-p${index+1}`);
                    if(s) { s.value = pilote; gererChangementPiloteGrille(index+1, pilote); }
                });
            }
            if(document.getElementById('select-poleman')) document.getElementById('select-poleman').value = data.poleman || "";
            if(document.getElementById('ecurie-top-1')) document.getElementById('ecurie-top-1').value = data.ecurieTop1 || "";
            if(document.getElementById('ecurie-top-2')) document.getElementById('ecurie-top-2').value = data.ecurieTop2 || "";
            if(document.getElementById('check-joker')) document.getElementById('check-joker').checked = data.jokerUtilise || false;

            // Affichage du bilan calculé par le CRON
            if (data.bilanCalcul && zoneBilan) {
                zoneBilan.style.display = 'block';
                if(txtPilotes) txtPilotes.innerText = `+${data.bilanCalcul.detailTop10 || 0}`;
                if(txtPole) txtPole.innerText = `+${data.bilanCalcul.bonusPole || 0}`;
                if(txtEcuries) txtEcuries.innerText = `+${data.bilanCalcul.bonusEcuries || 0}`;
                if(txtTotal) txtTotal.innerText = `${data.bilanCalcul.pointsTotaux || 0}`;
                if(txtJokerMention) txtJokerMention.style.display = data.bilanCalcul.jokerApplique ? 'inline' : 'none';
            } else if (zoneBilan) {
                zoneBilan.style.display = 'none';
            }
        } else {
            // Remise à zéro s'il n'y a pas de pronostics sauvegardés
            if(zoneBilan) zoneBilan.style.display = 'none';
            for(let i=1; i<=10; i++) {
                const s = document.getElementById(`select-grid-p${i}`);
                if(s) { s.value = ""; gererChangementPiloteGrille(i, ""); }
            }
            if(document.getElementById('select-poleman')) document.getElementById('select-poleman').value = "";
            if(document.getElementById('ecurie-top-1')) document.getElementById('ecurie-top-1').value = "";
            if(document.getElementById('ecurie-top-2')) document.getElementById('ecurie-top-2').value = "";
            if(document.getElementById('check-joker')) document.getElementById('check-joker').checked = false;
        }
        controlerDoublonsPilotes();
    }).catch(err => console.error("Erreur synchro :", err));
}

document.getElementById('btn-valider')?.addEventListener('click', () => {
    const user = auth.currentUser;
    if(!user) return alert("Veuillez vous connecter.");

    const round = document.getElementById('select-course').value;
    const top10 = [];
    for(let i=1; i<=10; i++) {
        const val = document.getElementById(`select-grid-p${i}`)?.value;
        if(val) top10.push(val);
    }

    if(top10.length < 10) return alert("Complétez votre Top 10 pilotes.");
    if(new Set(top10).size < 10) return alert("Des doublons sont présents dans la grille.");

    db.collection("pronostics").doc(user.uid).collection("grands_prix").doc(`gp_${round}`).set({
        top10: top10,
        poleman: document.getElementById('select-poleman')?.value || "",
        ecurieTop1: document.getElementById('ecurie-top-1')?.value || "",
        ecurieTop2: document.getElementById('ecurie-top-2')?.value || "",
        jokerUtilise: document.getElementById('check-joker')?.checked || false,
        sauvegardeLe: new Date()
    }, { merge: true }).then(() => alert(`🏁 Pronostics enregistrés pour le GP ${round} !`));
});

// Initialisations au chargement global
document.getElementById('btn-reglement')?.addEventListener('click', () => document.getElementById('modale-reglement').style.display = 'flex');
document.getElementById('btn-fermer-reglement')?.addEventListener('click', () => document.getElementById('modale-reglement').style.display = 'none');
document.getElementById('select-course')?.addEventListener('change', chargerPronosticsUtilisateur);

initialiserFormulaires();
creerLaGrilleDeDepartTV();
chargerClassementGeneral();
