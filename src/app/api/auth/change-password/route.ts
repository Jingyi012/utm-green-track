import { formatResponse } from "@/lib/types/apiResponse";
import { changePassword } from "@/server/services/user.service";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        if (!token || !token.id) {
            return NextResponse.json(formatResponse(null, false, 'Unauthorized'), { status: 401 });
        }

        const { currentPassword, newPassword, confirmNewPassword } = await req.json();
        await changePassword(token.id, currentPassword, newPassword, confirmNewPassword);
        return NextResponse.json({ message: 'Profile updated' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}