/**
 * Local Storage Management for Anonymous Users
 *
 * This module handles all localStorage operations for anonymous user management.
 * It stores user ID and optional name locally without any backend authentication.
 *
 * Privacy:
 * - All data is stored locally in browser localStorage
 * - No server-side tracking or fingerprinting
 * - Users can clear data at any time
 * - No cookies are used
 */

const USER_ID_KEY = 'timap_user_id';
const USER_NAME_KEY = 'timap_user_name';

/**
 * Generate a unique anonymous user ID
 * Uses crypto.randomUUID() for secure random ID generation
 */
function generateUserId(): string {
  return crypto.randomUUID();
}

/**
 * Get or create anonymous user ID
 * Returns existing ID from localStorage or generates a new one
 */
export function getUserId(): string {
  let userId = localStorage.getItem(USER_ID_KEY);

  if (!userId) {
    userId = generateUserId();
    localStorage.setItem(USER_ID_KEY, userId);
  }

  return userId;
}

/**
 * Get user's display name from localStorage
 * Returns empty string if no name is set
 */
export function getUserName(): string {
  return localStorage.getItem(USER_NAME_KEY) || '';
}

/**
 * Set user's display name in localStorage
 * @param name - User's display name
 */
export function setUserName(name: string): void {
  localStorage.setItem(USER_NAME_KEY, name);
}

/**
 * Check if user has set a display name
 */
export function hasUserName(): boolean {
  return !!localStorage.getItem(USER_NAME_KEY);
}

/**
 * Clear all user data from localStorage
 * This allows users to reset their anonymous identity
 */
export function clearUserData(): void {
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USER_NAME_KEY);
}

/**
 * Get complete user info
 */
export function getUserInfo(): { id: string; name: string } {
  return {
    id: getUserId(),
    name: getUserName()
  };
}
