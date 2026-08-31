import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    arrayUnion,
    deleteField,
    type Firestore
} from "firebase/firestore";
import type { User } from "firebase/auth";
import type { LigueDoc } from "../utils";

export const CODE_LIGUE_MONDIAL = "MONDIAL";

export function genererCodeLigue(): string {
    const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans O/0/I/1 pour éviter les confusions
    let suffixe = "";
    for (let i = 0; i < 4; i++) {
        suffixe += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return `F1-${suffixe}`;
}

export async function assurerExistenceLigueMondial(db: Firestore) {
    const ref = doc(db, "ligues", CODE_LIGUE_MONDIAL);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
        await setDoc(ref, {
            nom: "🌍 Mondial",
            code: CODE_LIGUE_MONDIAL,
            createurUid: "system",
            membres: [],
            creeLe: new Date()
        });
    }
    return ref;
}

export async function rejoindreLigueParCode(
    db: Firestore,
    code: string,
    user: User | null,
    opts: { definirCommeActive?: boolean } = {}
): Promise<string> {
    if (!user) throw new Error("Vous devez être connecté.");
    const codeNormalise = code.trim().toUpperCase();
    const ligueRef = doc(db, "ligues", codeNormalise);
    const ligueSnap = await getDoc(ligueRef);

    if (!ligueSnap.exists()) {
        if (codeNormalise === CODE_LIGUE_MONDIAL) {
            await assurerExistenceLigueMondial(db);
        } else {
            throw new Error("Ce code de ligue n'existe pas.");
        }
    }

    await updateDoc(ligueRef, {
        membres: arrayUnion(user.uid)
    });

    const userRef = doc(db, "utilisateurs", user.uid);
    await setDoc(userRef, {
        ligues: arrayUnion(codeNormalise),
        pseudo: user.displayName || user.email,
        ligueActive: opts.definirCommeActive === false ? deleteField() : codeNormalise
    }, { merge: true });

    return codeNormalise;
}

export async function creerNouvelleLigue(db: Firestore, nomLigue: string, user: User | null): Promise<string> {
    if (!user) throw new Error("Vous devez être connecté.");
    let code = "";
    let disponible = false;
    let tentatives = 0;

    while (!disponible && tentatives < 8) {
        code = genererCodeLigue();
        const snap = await getDoc(doc(db, "ligues", code));
        disponible = !snap.exists();
        tentatives++;
    }
    if (!disponible) throw new Error("Impossible de générer un code unique, réessaie.");

    await setDoc(doc(db, "ligues", code), {
        nom: nomLigue,
        code: code,
        createurUid: user.uid,
        membres: [user.uid],
        creeLe: new Date()
    });

    await setDoc(doc(db, "utilisateurs", user.uid), {
        ligues: arrayUnion(code),
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

export async function recupererLiguesUtilisateur(db: Firestore, user: User | null): Promise<UserLiguesResult> {
    if (!user) return { codes: [CODE_LIGUE_MONDIAL], active: CODE_LIGUE_MONDIAL, ligues: [] };

    const userRef = doc(db, "utilisateurs", user.uid);
    let userSnap = await getDoc(userRef);

    if (!userSnap.exists() || !(userSnap.data()?.ligues || []).length) {
        await assurerExistenceLigueMondial(db);
        await rejoindreLigueParCode(db, CODE_LIGUE_MONDIAL, user);
        userSnap = await getDoc(userRef);
    }

    const donneesUser = userSnap.data() || {};
    const codesLigues: string[] = donneesUser.ligues || [CODE_LIGUE_MONDIAL];
    const ligueActive: string = donneesUser.ligueActive || codesLigues[0] || CODE_LIGUE_MONDIAL;

    const ligueSnaps = await Promise.all(codesLigues.map((c: string) => getDoc(doc(db, "ligues", c))));
    const ligues: LigueDoc[] = ligueSnaps.filter((d) => d.exists()).map((d) => d.data() as LigueDoc);

    return {
        codes: codesLigues,
        active: ligueActive,
        ligues
    };
}