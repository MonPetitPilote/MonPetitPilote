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

// Base de données des pilotes F1 2026
const pilotesData = [
  {nom: "Max Verstappen", ecurie: "Red Bull", statut: "favori", img: "https://cdn-1.motorsport.com/images/vcl/X0kvd86d/s3/red-bull-racing-rb22.png"},
  {nom: "Isack Hadjar", ecurie: "Red Bull", statut: "outsider", img: "https://cdn-1.motorsport.com/images/vcl/X0kvd86d/s3/red-bull-racing-rb22.png"},
  {nom: "Lewis Hamilton", ecurie: "Ferrari", statut: "favori", img: "https://cdn-9.motorsport.com/images/vcl/jYNlMJ0D/s3/ferrari-sf-26.png"},
  {nom: "Charles Leclerc", ecurie: "Ferrari", statut: "favori", img: "https://cdn-9.motorsport.com/images/vcl/jYNlMJ0D/s3/ferrari-sf-26.png"},
  {nom: "Lando Norris", ecurie: "McLaren", statut: "favori", img: "https://cdn-2.motorsport.com/images/vcl/p2wyqb6Q/s3/mclaren-mcl40.png"},
  {nom: "Oscar Piastri", ecurie: "McLaren", statut: "favori", img: "https://cdn-2.motorsport.com/images/vcl/p2wyqb6Q/s3/mclaren-mcl40.png"},
  {nom: "George Russell", ecurie: "Mercedes", statut: "favori", img: "https://cdn-8.motorsport.com/images/vcl/z0qrdy2N/s3/mercedes-mgp-w17.png"},
  {nom: "Kimi Antonelli", ecurie: "Mercedes", statut: "favori", img: "https://cdn-8.motorsport.com/images/vcl/z0qrdy2N/s3/mercedes-mgp-w17.png"},
  {nom: "Fernando Alonso", ecurie: "Aston Martin", statut: "outsider", img: "https://cdn-2.motorsport.com/images/vcl/vYMl7G2E/s3/aston-martin-amr26.png"},
  {nom: "Lance Stroll", ecurie: "Aston Martin", statut: "outsider", img: "https://cdn-2.motorsport.com/images/vcl/vYMl7G2E/s3/aston-martin-amr26.png"},
  {nom: "Pierre Gasly", ecurie: "Alpine", statut: "outsider", img: "https://cdn-3.motorsport.com/images/vcl/q633Z46A/s3/alpine-a526.png"},
  {nom: "Franco Colapinto", ecurie: "Alpine", statut: "outsider", img: "https://cdn-3.motorsport.com/images/vcl/q633Z46A/s3/alpine-a526.png"},
  {nom: "Carlos Sainz", ecurie: "Williams", statut: "outsider", img: "https://cdn-7.motorsport.com/images/vcl/B2G3Vr29/s3/williams-fw48.png"},
  {nom: "Alex Albon", ecurie: "Williams", statut: "outsider", img: "https://cdn-7.motorsport.com/images/vcl/B2G3Vr29/s3/williams-fw48.png"},
  {nom: "Liam Lawson", ecurie: "Racing Bulls", statut: "fond", img: "https://cdn-2.motorsport.com/images/vcl/G2ewOP6o/s3/racing-bulls-vcarb03.png"},
  {nom: "Arvid Lindblad", ecurie: "Racing Bulls", statut: "fond", img: "https://cdn-2.motorsport.com/images/vcl/G2ewOP6o/s3/racing-bulls-vcarb03.png"},
  {nom: "Nico Hülkenberg", ecurie: "Audi", statut: "fond", img: "https://cdn-8.motorsport.com/images/vcl/x27BRO0E/s3/audi-r26-2.png"},
  {nom: "Gabriel Bortoleto", ecurie: "Audi", statut: "fond", img: "https://cdn-8.motorsport.com/images/vcl/x27BRO0E/s3/audi-r26-2.png"},
  {nom: "Oliver Bearman", ecurie: "Haas", statut: "fond", img: "https://cdn-6.motorsport.com/images/vcl/e2dwbn0J/s3/haas-vf-26.png"},
  {nom: "Esteban Ocon", ecurie: "Haas", statut: "fond", img: "https://cdn-6.motorsport.com/images/vcl/e2dwbn0J/s3/haas-vf-26.png"},
  {nom: "Valtteri Bottas", ecurie: "Cadillac", statut: "fond", img: "https://cdn-5.motorsport.com/images/vcl/n0mwOGYz/s3/cadillac-2.png"},
  {nom: "Sergio Pérez", ecurie: "Cadillac", statut: "fond", img: "https://cdn-5.motorsport.com/images/vcl/n0mwOGYz/s3/cadillac-2.png"}
];

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

const ecuriesList = [...new Set(pilotesData.map(p => p.ecurie))];
const selectCourse = document.getElementById('select-course');
let utilisateurActuel = null;

function initialiserSelectCourse() {
    if (!selectCourse) return;
    selectCourse.innerHTML = "";
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
            statut = `🔒 Qualifs lancées`;
        }

        option.text = `${String(c.round).padStart(2, '0')}. ${c.nom} — ${statut}`;
        
        if (maintenant <= dateCourseFinie && !courseActiveTrouvee) {
            option.selected = true;
            courseActiveTrouvee = true;
        }
        selectCourse.appendChild(option);
    });

    if (!courseActiveTrouvee && selectCourse.options.length > 0) {
        selectCourse.options[selectCourse.options.length - 1].selected = true;
    }
}

function verifierStatutDuGrandPrix() {
    if (!selectCourse) return;
    const courseActuelle = selectCourse.value;
    const roundNumber = parseInt(courseActuelle.split('/')[1]);
    const courseData = calendrierCourses.find(c => c.round === roundNumber);

    const titreGrille = document.getElementById('titre-grille');
    const btnAleatoire = document.getElementById('btn-aleatoire');
    const btnValider = document.getElementById('btn-valider');
    const selectPole = document.getElementById('select-pole');

    const maintenant = new Date();
    const dateCourseFinie = new Date(courseData.dateCourse + "T23:59:59Z");
    const dateLimitePole = new Date(courseData.limitePole);

    if (maintenant > dateCourseFinie) {
        if (titreGrille) titreGrille.innerText = "🏁 RÉSULTATS DE LA COURSE :";
        if (btnAleatoire) btnAleatoire.style.display = 'none';
        if (btnValider) {
            btnValider.disabled = true;
            btnValider.innerText = "🔒 WEEK-END CLOS";
            btnValider.style.backgroundColor = "#555";
        }
        desactiverFormulaire(true);
        chargerResultatsOfficielsApi(courseActuelle);
    } else {
        if (titreGrille) titreGrille.innerText = "🏆 TON TOP 10 PILOTES :";
        if (btnAleatoire) btnAleatoire.style.display = 'block';
        if (btnValider) {
            btnValider.disabled = false;
            btnValider.innerText = "🏁 VALIDER MES PRONOSTICS";
            btnValider.style.backgroundColor = "#E10600";
        }
        desactiverFormulaire(false);
        mettreAJourListes();

        if (maintenant >= dateLimitePole && selectPole) {
            selectPole.disabled = true;
            const optSel = selectPole.options[selectPole.selectedIndex];
            if (optSel && !optSel.text.includes("🔒")) optSel.text += " 🔒 (Verrouillé)";
        }
    }
}

function chargerResultatsOfficielsApi(courseActuelle) {
    fetch(`https://ergast.com/api/f1/${courseActuelle}/results.json`)
        .then(res => res.json())
        .then(data => {
            const results = data.MRData.RaceTable.Race[0]?.Results;
            if (results) {
                for (let i = 1; i <= 10; i++) {
                    const selectElement = document.getElementById(`pos-${i}`);
                    const apiDriver = results[i-1]?.Driver;
                    if (selectElement && apiDriver) {
                        const monPilote = pilotesData.find(p => p.nom.toLowerCase().includes(apiDriver.familyName.toLowerCase()));
                        if (monPilote) {
                            selectElement.innerHTML = `<option value="${monPilote.nom}" selected>${monPilote.nom}</option>`;
                            const img = selectElement.parentElement.querySelector('.img-monoplace');
                            if (img) { img.src = monPilote.img; img.style.display = 'block'; }
                        }
                    }
                }
            }
        }).catch(err => console.log("Pas d'API disponible.", err));
}

function desactiverFormulaire(statut) {
    document.querySelectorAll('.select-pilote').forEach(s => s.disabled = statut);
    document.querySelectorAll('.check-poker').forEach(c => c.disabled = statut);
    document.querySelectorAll('.select-ecurie').forEach(e => e.disabled = statut);
    const selectPole = document.getElementById('select-pole');
    if (selectPole) selectPole.disabled = statut;
}

auth.onAuthStateChanged((user) => {
    const zoneDeconnecte = document.getElementById('auth-deconnecte');
    const zoneConnecte = document.getElementById('auth-connecte');
    const nomUserSpan = document.getElementById('nom-utilisateur');

    if (user) {
        utilisateurActuel = user;
        if(zoneDeconnecte) zoneDeconnecte.style.display = 'none';
        if(zoneConnecte) zoneConnecte.style.display = 'flex';
        if(nomUserSpan) nomUserSpan.innerText = user.displayName || user.email;
    } else {
        utilisateurActuel = null;
        if(zoneDeconnecte) zoneDeconnecte.style.display = 'block';
        if(zoneConnecte) zoneConnecte.style.display = 'none';
    }
});

// ==========================================
// REGISTRE DES INSCRIPTIONS ET CONNEXIONS
// ==========================================
const btnInsc = document.getElementById('btn-inscription');
if(btnInsc) {
    btnInsc.addEventListener('click', () => {
        const pseudo = document.getElementById('auth-pseudo').value.trim();
        const email = document.getElementById('auth-email').value.trim();
        const mdp = document.getElementById('auth-mdp').value.trim();
        if(!pseudo || !email || !mdp) { alert("⚠️ Saisie incomplète !"); return; }
        auth.createUserWithEmailAndPassword(email, mdp)
            .then((uc) => uc.user.updateProfile({ displayName: pseudo }).then(() => alert(`Bienvenue ${pseudo} !`)))
            .catch(err => alert("Erreur : " + err.message));
    });
}

const btnConn = document.getElementById('btn-connexion');
if(btnConn) {
    btnConn.addEventListener('click', () => {
        const email = document.getElementById('auth-email').value.trim();
        const mdp = document.getElementById('auth-mdp').value.trim();
        if(!email || !mdp) { alert("⚠️ Saisie manquante !"); return; }
        auth.signInWithEmailAndPassword(email, mdp).catch(err => alert("Erreur : " + err.message));
    });
}

const btnDeco = document.getElementById('btn-deconnexion');
if(btnDeco) { btnDeco.addEventListener('click', () => auth.signOut()); }

// Réinitialisation du mot de passe oublié
const linkRecup = document.getElementById('link-recup-mdp');
if (linkRecup) {
    linkRecup.addEventListener('click', (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value.trim();
        if (!email) {
            alert("✍️ Entre ton adresse email dans la case correspondante ci-dessus, puis re-clique ici pour recevoir ton lien de réinitialisation.");
            return;
        }
        auth.sendPasswordResetEmail(email)
            .then(() => alert("📨 Un lien de réinitialisation vient de t'être envoyé par e-mail ! Vérifie tes spams si besoin."))
            .catch(err => alert("Erreur : " + err.message));
    });
}

// ==========================================
// CONSTRUIRE LA ZONE DU TOP 10 PILOTES
// ==========================================
const grille = document.getElementById('grille-pronos');
if (grille) {
    for (let i = 1; i <= 10; i++) {
        const ligne = document.createElement('div');
        ligne.className = 'ligne-pilote';
        ligne.style.display = 'flex';
        ligne.style.alignItems = 'center';
        ligne.style.gap = '10px';

        const badge = document.createElement('div');
        badge.className = 'badge-position';
        badge.innerText = `P${String(i).padStart(2, '0')}`;

        const select = document.createElement('select');
        select.id = `pos-${i}`;
        select.className = 'select-pilote';
        select.innerHTML = '<option value="">Sélectionner un pilote...</option>';

        const pokerContainer = document.createElement('label');
        pokerContainer.innerHTML = `<input type="checkbox" name="coup-poker" class="check-poker" value="${i}" style="margin-right:3px;">⭐`;

        const img = document.createElement('img');
        img.className = 'img-monoplace';
        img.style.display = 'none';

        select.addEventListener('change', () => {
            mettreAJourListes();
            const p = pilotesData.find(pilote => pilote.nom === select.value);
            if (p) { img.src = p.img; img.style.display = 'block'; } else { img.src = ""; img.style.display = 'none'; }
        });

        ligne.appendChild(badge);
        ligne.appendChild(select);
        ligne.appendChild(pokerContainer);
        ligne.appendChild(img);
        grille.appendChild(ligne);
    }

    grille.addEventListener('change', (e) => {
        if (e.target.classList.contains('check-poker')) {
            document.querySelectorAll('.check-poker').forEach(cb => { if (cb !== e.target) cb.checked = false; });
        }
    });
}

function mettreAJourListes() {
    const tousLesSelects = document.querySelectorAll('.select-pilote');
    if (tousLesSelects.length === 0 || tousLesSelects[0].disabled) return;
    const choixFaits = Array.from(tousLesSelects).map(s => s.value).filter(val => val !== "");

    tousLesSelects.forEach(select => {
        const valeurActuelle = select.value;
        const position = parseInt(select.id.split('-')[1]);
        select.innerHTML = '<option value="">Sélectionner un pilote...</option>';

        pilotesData.forEach(p => {
            if (!choixFaits.includes(p.nom) || p.nom === valeurActuelle) {
                const opt = document.createElement('option');
                opt.value = p.nom;
                let _cote = 1.5;
                if (p.statut === "favori") {
                    if (position === 1) _cote = 1.3;
                    else if (position <= 3) _cote = 1.1;
                    else if (position <= 6) _cote = 1.8;
                    else _cote = 2.5 + (position * 0.1);
                } else if (p.statut === "outsider") {
                    if (position === 1) _cote = p.nom === "Fernando Alonso" ? 100.0 : 35.0;
                    else if (position <= 3) _cote = 10.0;
                    else if (position <= 6) _cote = 3.5;
                    else _cote = 1.6;
                } else if (p.statut === "fond") {
                    if (position === 1) _cote = 120.0;
                    else if (position <= 3) _cote = 60.0;
                    else if (position <= 6) _cote = 18.0;
                    else if (position <= 8) _cote = 5.0;
                    else _cote = 1.3;
                }
                opt.text = `${p.nom} - Cote: x${_cote.toFixed(1)}`;
                if (p.nom === valeurActuelle) opt.selected = true;
                select.appendChild(opt);
            }
        });
    });
}

function initialiserPolePosition() {
    const selectPole = document.getElementById('select-pole');
    if (!selectPole) return;
    selectPole.innerHTML = '<option value="">Choisir le poleman...</option>';
    pilotesData.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.nom; opt.text = p.nom;
        selectPole.appendChild(opt);
    });
}

function initialiserEcuriesTopFlop() {
    document.querySelectorAll('.select-ecurie').forEach(select => {
        select.innerHTML = '<option value="">Choisir une écurie...</option>';
        ecuriesList.forEach(ecurie => {
            const opt = document.createElement('option');
            opt.value = ecurie; opt.text = ecurie;
            select.appendChild(opt);
        });
    });
}

const btnAleatoire = document.getElementById('btn-aleatoire');
if (btnAleatoire) {
    btnAleatoire.addEventListener('click', () => {
        const tousLesSelects = document.querySelectorAll('.select-pilote');
        const m = [...pilotesData].sort(() => 0.5 - Math.random());
        tousLesSelects.forEach((select, index) => {
            select.value = m[index].nom;
            const img = select.parentElement.querySelector('.img-monoplace');
            if (img) { img.src = m[index].img; img.style.display = 'block'; }
        });
        mettreAJourListes();
    });
}

const btnValiderPr = document.getElementById('btn-valider');
if (btnValiderPr) {
    btnValiderPr.addEventListener('click', () => {
        if (!utilisateurActuel) { alert("⚠️ Connecte-toi avant d'envoyer !"); return; }
        const poleman = document.getElementById('select-pole').value;
        const choixPilotes = Array.from(document.querySelectorAll('.select-pilote')).map(s => s.value);
        if (!poleman || choixPilotes.includes("")) { alert("⚠️ Formulaire incomplet !"); return; }

        const checkPoker = document.querySelector('.check-poker:checked');
        const top1 = document.getElementById('ecurie-top-1').value;
        const top2 = document.getElementById('ecurie-top-2').value;
        const flop1 = document.getElementById('ecurie-flop-1').value;
        const flop2 = document.getElementById('ecurie-flop-2').value;

        db.collection("pronostics").add({
            uidJoueur: utilisateurActuel.uid,
            pseudo: utilisateurActuel.displayName || "Joueur",
            email: utilisateurActuel.email,
            course: selectCourse.value,
            poleman,
            classementPilotes: choixPilotes,
            ligneCoupPoker: checkPoker ? parseInt(checkPoker.value) : null,
            ecuriesTop: [top1, top2],
            ecuriesFlop: [flop1, flop2],
            date: new Date()
        }).then(() => alert("🏆 Pronostic enregistré avec succès !"));
    });
}

// ==========================================
// 3. CLASSEMENT AVEC BADGES ET POPUP HISTORIQUE
// ==========================================
function chargerClassementGeneral() {
    const conteneur = document.getElementById('liste-classement');
    if (!conteneur) return;

    db.collection("utilisateurs").orderBy("points", "desc").onSnapshot((snapshot) => {
        conteneur.innerHTML = ""; 
        if (snapshot.empty) return;

        let maxPoles = -1, maxCote = -1;
        let listeUsers = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            listeUsers.push({ id: doc.id, ...data });
            if ((data.polesReussies || 0) > maxPoles) maxPoles = data.polesReussies || 0;
            if ((data.meilleureCoteGagnee || 0) > maxCote) maxCote = data.meilleureCoteGagnee || 0;
        });

        listeUsers.forEach((user, index) => {
            let badgesHTML = "";
            if (index === 0) badgesHTML += " 👑"; 
            if (index === listeUsers.length - 1 && listeUsers.length > 1) badgesHTML += " 🚜"; 
            if (user.polesReussies > 0 && user.polesReussies === maxPoles) badgesHTML += " ⏱️"; 
            if (user.meilleureCoteGagnee > 0 && user.meilleureCoteGagnee === maxCote) badgesHTML += " 🃏"; 

            const ligne = document.createElement('div');
            ligne.className = 'ligne-joueur';
            ligne.style.cursor = 'pointer';
            ligne.style.padding = '8px';
            ligne.style.borderBottom = '1px solid #333';
            ligne.innerHTML = `
                <div class="pos-podium">${index + 1}</div>
                <div style="flex:1;"><strong>${user.pseudo}</strong>${badgesHTML}</div>
                <div class="score-points">${user.points || 0} pts</div>
            `;
            
            ligne.addEventListener('click', () => ouvrirHistoriqueJoueur(user.id, user.pseudo));
            conteneur.appendChild(ligne);
        });
    });
}

function ouvrirHistoriqueJoueur(uid, pseudo) {
    db.collection("historique_points").where("uidJoueur", "==", uid).orderBy("round", "asc").get()
    .then(snapshot => {
        let contenuHTML = `<div class="modal-content-inner">
            <span class="close-modal" onclick="document.getElementById('modal-historique').remove()">&times;</span>
            <h2>📊 Historique de ${pseudo}</h2>
            <div style="max-height: 400px; overflow-y:auto; margin-top:15px;">`;

        if (snapshot.empty) {
            contenuHTML += `<p>Aucune course calculée disponible pour le moment.</p>`;
        } else {
            snapshot.forEach(doc => {
                const data = doc.data();
                contenuHTML += `
                <div style="background: #111622; padding: 12px; margin-bottom: 10px; border-radius: 6px; border-left: 4px solid #E10600;">
                    <strong>Round ${data.round} : +${data.pointsGagnes} points empochés</strong><br>
                    <small>Prono Poleman: ${data.polemanProno} (Officiel: ${data.polemanOfficiel})</small>
                </div>`;
            });
        }
        contenuHTML += `</div></div>`;

        const modal = document.createElement('div');
        modal.id = 'modal-historique';
        modal.className = 'modal-back';
        modal.innerHTML = contenuHTML;
        document.body.appendChild(modal);
    });
}

// Modale Règlement Bon Enfant
const btnReglement = document.getElementById('btn-ouvrir-reglement');
if (btnReglement) {
    btnReglement.addEventListener('click', () => {
        const contenuHTML = `
        <div class="modal-content-inner" style="max-width: 600px;">
            <span class="close-modal" onclick="document.getElementById('modal-reglement').remove()">&times;</span>
            <h2>📜 RÈGLEMENT FUN DES COTES & BONUS 🏎️</h2>
            <div style="max-height: 450px; overflow-y:auto; margin-top:15px; font-size:0.95rem; line-height:1.5;">
                <div class="reglement-item">
                    <strong>1. Le Top 10 classique 🏁</strong><br>
                    Tu trouves la place exacte d'un pilote ? C'est <strong>+10 points</strong>. Le pilote finit dans le Top 10 mais pas à la place que tu voulais ? Tu grattes quand même <strong>+3 points</strong> !
                </div>
                <div class="reglement-item">
                    <strong>2. Le Coup de Poker ⭐ (La folie des cotes !)</strong><br>
                    Coche l'étoile sur une des lignes de ta grille. Si le pilote termine <strong>exactement</strong> à cette place, on prend tes 10 points de base et on les multiplie par la cote du pilote ! Un favori rapporte peu, mais placer un fond de grille gagnant peut te rapporter plus de 1000 points d'un coup ! ⚠️ Si la position est fausse, c'est 0 point sur cette ligne.
                </div>
                <div class="reglement-item">
                    <strong>3. La Pole Position ⏱️</strong><br>
                    Devine qui fera le meilleur temps le samedi. Si c'est bon, tu empoches un bonus fixe de <strong>+15 points</strong>.
                </div>
                <div class="reglement-item">
                    <strong>4. Écuries Tops & Flops 🔥</strong><br>
                    • <strong>Top :</strong> Choisis une écurie. Si ses DEUX voitures finissent dans le Top 10, tu marques <strong>+10 points</strong>.<br>
                    • <strong>Flop :</strong> Choisis une écurie. Si AUCUNE de ses deux voitures n'entre dans le Top 10, tu prends <strong>+10 points</strong>.
                </div>
                <div class="reglement-item">
                    <strong>🎖️ Les Badges de la Gloire (Mis à jour en direct) :</strong><br>
                    👑 <strong>Le Boss :</strong> Premier au classement général.<br>
                    ⏱️ <strong>Le Roi de la Pole :</strong> Celui qui a déniché le plus de Polemans.<br>
                    🃏 <strong>Le Bluffeur :</strong> Le joueur qui a validé le Coup de Poker avec la plus grosse cote.<br>
                    🚜 <strong>La Cuillère de Bois :</strong> Le malheureux dernier du classement (Force à toi !).
                </div>
            </div>
        </div>`;

        const modal = document.createElement('div');
        modal.id = 'modal-reglement';
        modal.className = 'modal-back';
        modal.innerHTML = contenuHTML;
        document.body.appendChild(modal);
    });
}

window.addEventListener('click', (e) => {
    const modalHist = document.getElementById('modal-historique');
    if (e.target === modalHist) modalHist.remove();
    const modalReg = document.getElementById('modal-reglement');
    if (e.target === modalReg) modalReg.remove();
});

// Initialisations globales
initialiserSelectCourse();
initialiserPolePosition();
initialiserEcuriesTopFlop();
verifierStatutDuGrandPrix();
chargerClassementGeneral();

if (selectCourse) {
    selectCourse.addEventListener('change', verifierStatutDuGrandPrix);
}
