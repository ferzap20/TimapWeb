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

import { CreateMatchData } from '../types/database';

const USER_ID_KEY = 'timap_user_id';
const USER_NAME_KEY = 'timap_user_name';
const PENDING_MATCH_DATA_KEY = 'timap_pending_match_data';
const PENDING_JOIN_DATA_KEY = 'timap_pending_join_data';

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

/**
 * Save pending match creation data
 * Used when an unauthenticated user attempts to create a match
 */
export function setPendingMatchData(data: CreateMatchData): void {
  localStorage.setItem(PENDING_MATCH_DATA_KEY, JSON.stringify(data));
}

/**
 * Get pending match creation data
 * Returns null if no pending data exists
 */
export function getPendingMatchData(): CreateMatchData | null {
  const data = localStorage.getItem(PENDING_MATCH_DATA_KEY);
  return data ? JSON.parse(data) : null;
}

/**
 * Clear pending match creation data
 */
export function clearPendingMatchData(): void {
  localStorage.removeItem(PENDING_MATCH_DATA_KEY);
}

/**
 * Save pending join match data
 * Used when an unauthenticated user attempts to join a match
 */
export function setPendingJoinData(matchId: string, playerName: string): void {
  localStorage.setItem(PENDING_JOIN_DATA_KEY, JSON.stringify({ matchId, playerName }));
}

/**
 * Get pending join match data
 * Returns null if no pending data exists
 */
export function getPendingJoinData(): { matchId: string; playerName: string } | null {
  const data = localStorage.getItem(PENDING_JOIN_DATA_KEY);
  return data ? JSON.parse(data) : null;
}

/**
 * Clear pending join match data
 */
export function clearPendingJoinData(): void {
  localStorage.removeItem(PENDING_JOIN_DATA_KEY);
}
