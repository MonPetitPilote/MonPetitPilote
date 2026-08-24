import type { LigueDoc } from "../utils";

declare const firebase: any;

export const CODE_LIGUE_MONDIAL = "MONDIAL";

export function genererCodeLigue(): string {
    const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans O/0/I/1 pour éviter les confusions
    let suffixe = "";
    for (let i = 0; i < 4; i++) {
        suffixe += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return `F1-${suffixe}`;
}

export async function assurerExistenceLigueMondial(db: any): Promise<any> {
    const ref = db.collection("ligues").doc(CODE_LIGUE_MONDIAL);
    const doc = await ref.get();
    if (!doc.exists) {
        await ref.set({
            nom: "🌍 Mondial",
            code: CODE_LIGUE_MONDIAL,
            createurUid: "system",
            membres: [],
            creeLe: new Date()
        });
    }
    return ref;
}

export async function rejoindreLigueParCode(db: any, code: string, user: any, opts: { definirCommeActive?: boolean } = {}): Promise<string> {
    if (!user) throw new Error("Vous devez être connecté.");
    const codeNormalise = code.trim().toUpperCase();
    const ligueRef = db.collection("ligues").doc(codeNormalise);
    const ligueDoc = await ligueRef.get();

    if (!ligueDoc.exists) {
        if (codeNormalise === CODE_LIGUE_MONDIAL) {
            await assurerExistenceLigueMondial(db);
        } else {
            throw new Error("Ce code de ligue n'existe pas.");
        }
    }

    await ligueRef.update({
        membres: firebase.firestore.FieldValue.arrayUnion(user.uid)
    });

    const userRef = db.collection("utilisateurs").doc(user.uid);
    await userRef.set({
        ligues: firebase.firestore.FieldValue.arrayUnion(codeNormalise),
        pseudo: user.displayName || user.email,
        ligueActive: opts.definirCommeActive === false ? firebase.firestore.FieldValue.delete() : codeNormalise
    }, { merge: true });

    return codeNormalise;
}

export async function creerNouvelleLigue(db: any, nomLigue: string, user: any): Promise<string> {
    if (!user) throw new Error("Vous devez être connecté.");
    let code = "";
    let disponible = false;
    let tentatives = 0;

    while (!disponible && tentatives < 8) {
        code = genererCodeLigue();
        const doc = await db.collection("ligues").doc(code).get();
        disponible = !doc.exists;
        tentatives++;
    }
    if (!disponible) throw new Error("Impossible de générer un code unique, réessaie.");

    await db.collection("ligues").doc(code).set({
        nom: nomLigue,
        code: code,
        createurUid: user.uid,
        membres: [user.uid],
        creeLe: new Date()
    });

    await db.collection("utilisateurs").doc(user.uid).set({
        ligues: firebase.firestore.FieldValue.arrayUnion(code),
        pseudo: user.displayName || user.email,
        ligueActive: code
    }, { merge: true });

    return code;
}

export interface UserLiguesResult {
    codes: string[];
    active: string;
    ligues: LigueDoc[];
}

export async function recupererLiguesUtilisateur(db: any, user: any): Promise<UserLiguesResult> {
    if (!user) return { codes: [CODE_LIGUE_MONDIAL], active: CODE_LIGUE_MONDIAL, ligues: [] };

    const userRef = db.collection("utilisateurs").doc(user.uid);
    let userDoc = await userRef.get();

    if (!userDoc.exists || !(userDoc.data().ligues || []).length) {
        await assurerExistenceLigueMondial(db);
        await rejoindreLigueParCode(db, CODE_LIGUE_MONDIAL, user);
        userDoc = await userRef.get();
    }

    const donneesUser = userDoc.data() || {};
    const codesLigues: string[] = donneesUser.ligues || [CODE_LIGUE_MONDIAL];
    const ligueActive: string = donneesUser.ligueActive || codesLigues[0] || CODE_LIGUE_MONDIAL;

    const ligueDocs = await Promise.all(codesLigues.map((c: string) => db.collection("ligues").doc(c).get()));
    const ligues: LigueDoc[] = ligueDocs.filter((d: any) => d.exists).map((d: any) => d.data());

    return {
        codes: codesLigues,
        active: ligueActive,
        ligues
    };
}
