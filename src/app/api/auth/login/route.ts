import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { User } from '@/lib/types';
import { SEED_USERS } from '@/lib/seed-data';

export async function POST(req: Request) {
  try {
    const { email, role } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const db = await getDb();
    let user: User | null = await db.collection<User>('users').findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      // Check seed users fallback or create on the fly
      const seedMatch = SEED_USERS.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
      if (seedMatch) {
        user = seedMatch;
      } else {
        const newUser: User = {
          id: `user_${Date.now()}`,
          name: email.split('@')[0],
          email: email.toLowerCase().trim(),
          role: role || 'donor',
          status: 'active',
          createdAt: new Date().toISOString()
        };
        await db.collection('users').insertOne(newUser);
        user = newUser;
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'User could not be initialized' }, { status: 500 });
    }

    const response = NextResponse.json({
      success: true,
      user
    });

    response.cookies.set('relieflink_role', user.role, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    response.cookies.set('relieflink_user_id', user.id, {
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
