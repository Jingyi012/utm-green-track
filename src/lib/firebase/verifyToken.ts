import { authAdmin } from './firebaseAdmin';
import { NextRequest } from 'next/server';

export async function verifyToken(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Unauthorized');
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = await authAdmin.verifyIdToken(token);
        return decoded;
    } catch (err) {
        throw new Error('Invalid or expired token');
    }
}
