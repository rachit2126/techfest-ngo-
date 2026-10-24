import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { User, UserRole } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const { name, email, role, phone } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const db = await getDb();
    const existing = await db.collection<User>('users').findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 400 });
    }

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      email: email.toLowerCase().trim(),
      role: (role || 'donor') as UserRole,
      phone,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    await db.collection('users').insertOne(newUser);

    const response = NextResponse.json({
      success: true,
      user: newUser
    });

    response.cookies.set('relieflink_role', newUser.role, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    response.cookies.set('relieflink_user_id', newUser.id, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
