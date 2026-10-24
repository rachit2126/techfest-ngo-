import { NextResponse } from 'next/server';
import { SEED_USERS } from '@/lib/seed-data';

export async function POST(req: Request) {
  try {
    const { role } = await req.json();
    const user = SEED_USERS.find(u => u.role === role) || SEED_USERS[0];

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
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
