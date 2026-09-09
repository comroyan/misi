import { generateUUID } from './tokens';
import { normalizeIndonesianPhone } from './formatters';
import { Visitor } from '../types';

const VISITOR_COOKIE_KEY = 'misiku_visitor_id';
const VISITOR_STORAGE_KEY = 'misiku_visitor_profile';

export function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return 'server_session';

  // Check cookie first
  const match = document.cookie.match(new RegExp('(^| )' + VISITOR_COOKIE_KEY + '=([^;]+)'));
  if (match && match[2]) {
    return decodeURIComponent(match[2]);
  }

  // Check localStorage
  const stored = localStorage.getItem(VISITOR_COOKIE_KEY);
  if (stored) {
    // Re-set cookie
    setVisitorCookie(stored);
    return stored;
  }

  // Generate new
  const newId = generateUUID();
  setVisitorCookie(newId);
  try {
    localStorage.setItem(VISITOR_COOKIE_KEY, newId);
  } catch (e) {
    console.warn('localStorage not accessible', e);
  }
  return newId;
}

function setVisitorCookie(id: string) {
  if (typeof document === 'undefined') return;
  const maxAge = 60 * 60 * 24 * 365; // 1 year
  document.cookie = `${VISITOR_COOKIE_KEY}=${encodeURIComponent(id)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function getStoredVisitorProfile(): Visitor | null {
  if (typeof window === 'undefined') return null;
  const visitorId = getOrCreateVisitorId();
  try {
    const raw = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        id: visitorId,
      };
    }
  } catch (e) {
    console.warn('Failed to parse visitor profile', e);
  }
  return null;
}

export function saveVisitorProfile(name: string, phone: string): Visitor {
  const visitorId = getOrCreateVisitorId();
  const phoneNormalized = normalizeIndonesianPhone(phone);
  const now = new Date().toISOString();

  const visitor: Visitor = {
    id: visitorId,
    name: name.trim(),
    phone: phone.trim(),
    phoneNormalized,
    createdAt: now,
    lastSeenAt: now,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(visitor));
    } catch (e) {
      console.warn('Failed to save visitor profile to storage', e);
    }
  }

  return visitor;
}

export function getVisitorSession(): { visitorId: string; profile: Visitor | null } {
  const visitorId = getOrCreateVisitorId();
  const profile = getStoredVisitorProfile();
  return { visitorId, profile };
}

export const saveVisitorIdentity = saveVisitorProfile;

