import { getServerSession } from 'next-auth/next';

import { authOptions } from './auth';
import { AuthenticationError } from '@/utils/errors';

/**
 * Get current session on server
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Get current user or throw error
 */
export async function getCurrentUser() {
  const session = await getSession();
  
  if (!session?.user) {
    throw new AuthenticationError('Not authenticated');
  }
  
  return session.user;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session?.user;
}

