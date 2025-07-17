import { NextResponse } from 'next/server';
import { resetPassword } from '@/server/services/user-admin.service';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();
        await resetPassword(email);
        return NextResponse.json({ message: 'Reset email sent' }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
