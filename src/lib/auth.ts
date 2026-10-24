import { cookies, headers } from 'next/headers';
import { User, UserRole } from './types';
import { SEED_USERS } from './seed-data';
import { getDb } from './db';

export async function getCurrentUser(): Promise<User> {
  const cookieStore = await cookies();
  const headerList = await headers();

  const roleHeader = headerList.get('x-relieflink-role');
  const roleCookie = cookieStore.get('relieflink_role')?.value;
  const userCookie = cookieStore.get('relieflink_user_id')?.value;

  const targetRole = (roleHeader || roleCookie || 'admin') as UserRole;

  try {
    const db = await getDb();
    if (userCookie) {
      const user = await db.collection<User>('users').findOne({ id: userCookie });
      if (user) return user;
    }
    const userByRole = await db.collection<User>('users').findOne({ role: targetRole });
    if (userByRole) return userByRole;
  } catch (err) {
    console.warn('Database not yet connected in auth check, using seed user fallback:', err);
  }

  // Seed user fallback
  const found = SEED_USERS.find(u => u.role === targetRole) || SEED_USERS[0];
  return found;
}

export function hasPermission(userRole: UserRole, requiredRole: string): boolean {
  if (userRole === 'admin') return true;

  switch (requiredRole) {
    case 'verify_ngo':
      return userRole === 'ngo_reviewer';
    case 'emergency_manage':
      return userRole === 'emergency_coordinator';
    case 'donation_ops':
      return false; // admin already returned true above
    case 'view_analytics':
      return userRole === 'analytics_viewer';
    case 'ngo_operations':
      return userRole === 'ngo_staff';
    case 'donor':
      return userRole === 'donor' || userRole === 'business_donor';
    default:
      return false;
  }
}
