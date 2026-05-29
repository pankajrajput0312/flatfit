// Simple client-side session management using localStorage

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  needsOnboarding?: boolean;
}

const SESSION_KEY = 'flatfit_session';

export function setSession(user: SessionUser) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }
}

export function getSession(): SessionUser | null {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(SESSION_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

export function getCurrentUserId(): string | null {
  const session = getSession();
  return session?.id || null;
}
