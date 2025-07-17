import { NextRequest, NextResponse } from 'next/server';
import { getUserByUID, updateUserProfile } from '@/server/services/user-admin.service';
import { verifyToken } from '@/lib/firebase/verifyToken';

export async function GET(req: NextRequest) {
    try {
        const { uid } = await verifyToken(req);
        const user = await getUserByUID(uid);
        return NextResponse.json(user);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 401 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { uid } = await verifyToken(req);
        const data = await req.json();
        await updateUserProfile(uid, data);
        return NextResponse.json({ message: 'Profile updated' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
