import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, reauthenticateWithCredential, updatePassword, EmailAuthProvider, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/firebaseClient';
import type { RegistrationFormData, User } from '@/lib/types/user';

export async function registerUser(data: RegistrationFormData): Promise<void> {
    const { email, password, confirmPassword, ...profile } = data;

    if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;

        await setDoc(doc(db, 'users', userId), {
            ...profile,
            email,
            createdAt: new Date().toISOString(),
        });

    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function loginUser(email: string, password: string): Promise<any> {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;

        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
            throw new Error('User profile not found');
        }

        const token = await userCredential.user.getIdToken();

        return {
            token,
            user: {
                id: userId,
                ...userDoc.data()
            }
        };
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function resetPassword(email: string): Promise<void> {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('No user logged in');

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
}

export async function logout() {
    await signOut(auth);
}