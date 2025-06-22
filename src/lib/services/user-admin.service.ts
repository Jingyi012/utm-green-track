import { authAdmin, db } from '@/lib/firebase/firebaseAdmin';
import type { RegistrationFormData, User } from '@/lib/types/user';
import { Timestamp } from 'firebase/firestore';

export async function registerUser(data: RegistrationFormData): Promise<void> {
    const { email, password, confirmPassword, ...profile } = data;

    if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
    }

    try {
        const userRecord = await authAdmin.createUser({ email, password });
        const userId = userRecord.uid;

        await db.collection('users').doc(userId).set({
            ...profile,
            email,
            createdAt: Timestamp.now(),
        });
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function getUserByEmail(email: string): Promise<User> {
    try {
        const userRecord = await authAdmin.getUserByEmail(email);
        const userId = userRecord.uid;
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            throw new Error('User profile not found');
        }

        return {
            ...(userDoc.data() as User),
            id: userDoc.id,
        };
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function resetPassword(email: string): Promise<string> {
    try {
        const link = await authAdmin.generatePasswordResetLink(email);
        return link;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function deleteUser(uid: string): Promise<void> {
    try {
        await authAdmin.deleteUser(uid);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function getUserByUID(uid: string): Promise<User> {
    try {
        const userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists) throw new Error('User not found');
        return {
            ...(userDoc.data() as User),
            id: userDoc.id,
        };
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function updateUserProfile(uid: string, data: Partial<User>): Promise<void> {
    try {
        await db.collection('users').doc(uid).update(data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}
