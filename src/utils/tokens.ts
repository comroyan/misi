/**
 * Token and ID generation utilities
 */

export function generatePublicToken(length = 12): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
  let token = '';
  const array = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      token += chars[array[i] % chars.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return token;
}

export function generateSubmissionCode(): string {
  // Format: MS-XXXXX where X is uppercase alphanumeric avoiding ambiguous characters
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  const array = new Uint8Array(5);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
    for (let i = 0; i < 5; i++) {
      code += chars[array[i] % chars.length];
    }
  } else {
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return `MS-${code}`;
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'v_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}
