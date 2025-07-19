import { prisma } from '@/lib/prisma/prisma';
import bcrypt from 'bcrypt';
import type { RegistrationFormData, User } from '@/lib/types/user';

export async function registerUser(data: RegistrationFormData): Promise<void> {
    const { email, password, confirmPassword, ...profile } = data;

    if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) throw new Error("User already exists");

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                email,
                passwordHash: hashedPassword,
                role: profile.role,
                profile: {
                    create: {
                        name: profile.name,
                        contactNo: profile.contactNo,
                        staffMatricNo: profile.staffMatricNo,
                        department: profile.department,
                        position: profile.position,
                    },
                },
            },
        });
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function getUserByEmail(email: string): Promise<User> {
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error('User not found');
        return user as User;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function getUserByUID(uid: number) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: uid },
            select: {
                id: true,
                email: true,
                role: true,
                profile: {
                    select: {
                        name: true,
                        contactNo: true,
                        staffMatricNo: true,
                        department: true,
                        position: true,
                    },
                },
            },
        });

        if (!user) throw new Error("User not found");

        // Flatten profile into top-level fields
        const { profile, ...baseUser } = user;
        return {
            ...baseUser,
            ...(profile || {})
        };

    } catch (error: any) {
        throw new Error(error.message);
    }
}


export async function updateUserProfile(
    uid: number,
    data: Record<string, any>
): Promise<void> {
    try {
        const userFields = ['email', 'role'];
        const profileFields = ['name', 'department', 'staffMatricNo', 'position', 'contactNo'];

        const userData: Record<string, any> = {};
        const profileData: Record<string, any> = {};

        for (const key in data) {
            if (userFields.includes(key) && data[key] !== undefined) {
                userData[key] = data[key];
            }
            if (profileFields.includes(key) && data[key] !== undefined) {
                profileData[key] = data[key];
            }
        }

        // Update user table
        if (Object.keys(userData).length > 0) {
            await prisma.user.update({
                where: { id: uid },
                data: userData,
            });
        }

        // Update userProfile table
        if (Object.keys(profileData).length > 0) {
            await prisma.userProfile.update({
                where: { userId: uid },
                data: profileData,
            });
        }
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function deleteUser(uid: string): Promise<void> {
    try {
        await prisma.user.delete({ where: { id: uid } });
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function resetPassword(email: string): Promise<string> {
    // Simulate sending reset link — you should implement email logic here
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error("User not found");

        // Normally you'd generate a token + email logic here
        return `Reset link for ${email} (simulate in dev)`;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function changePassword(
    uid: number,
    currentPassword: string,
    newPassword: string,
    confirmNewPassword: string
): Promise<void> {
    if (newPassword !== confirmNewPassword) {
        throw new Error("New passwords do not match");
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: uid } });
        if (!user) throw new Error("User not found");

        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
            throw new Error("Current password is incorrect");
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: uid },
            data: { passwordHash: hashedNewPassword },
        });
    } catch (error: any) {
        throw new Error(error.message);
    }
}