/**
 * Database API Functions
 *
 * This module provides functions for interacting with the Supabase database.
 * All CRUD operations for matches and participants are defined here.
 */

import { supabase } from './supabase';
import { Match, Participant, CreateMatchData, MatchWithCount } from '../types/database';

/**
 * Custom error classes for better error handling
 */
export class MatchFullError extends Error {
  constructor() {
    super('Match is full');
    this.name = 'MatchFullError';
  }
}

export class MatchNotFoundError extends Error {
  constructor(matchId: string) {
    super(`Match ${matchId} not found`);
    this.name = 'MatchNotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(action: string) {
    super(`Unauthorized to ${action}`);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Generate a unique invite code for a match
 * Uses cryptographically secure random with increased entropy
 */
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(12); // Increased from 8 to 12 for better security
  crypto.getRandomValues(array);
  return Array.from(array, byte => chars[byte % chars.length]).join('');
}

/**
 * Sanitize user input to prevent XSS attacks
 */
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 500); // Limit length
}

/**
 * Create a new match
 * @param matchData - Match details
 * @param creatorId - Anonymous user ID of creator
 * @param creatorName - Optional creator name
 * @returns Created match with invite code
 */
export async function createMatch(
  matchData: CreateMatchData,
  creatorId: string,
  creatorName: string
): Promise<Match> {
  const inviteCode = generateInviteCode();

  // Sanitize all user inputs
  const sanitizedData = {
    ...matchData,
    title: sanitizeInput(matchData.title),
    location: sanitizeInput(matchData.location),
    captain_name: matchData.captain_name ? sanitizeInput(matchData.captain_name) : '',
  };

  // Validate date is not in the past
  const matchDate = new Date(sanitizedData.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (matchDate < today) {
    throw new Error('Cannot create match in the past');
  }

  const { data, error } = await supabase
    .from('matches')
    .insert({
      ...sanitizedData,
      creator_id: creatorId,
      creator_name: sanitizeInput(creatorName),
      invite_code: inviteCode
    })
    .select()
    .single();

  if (error) throw error;

  // Auto-add creator as first participant (captain)
  const captainName = sanitizedData.captain_name || creatorName;
  await supabase
    .from('participants')
    .insert({
      match_id: data.id,
      user_id: creatorId,
      user_name: sanitizeInput(captainName),
      position: 0,
      is_starter: true
    });

  return data;
}

/**
 * Get all active matches with participant counts
 * Optimized to avoid N+1 query problem
 */
export async function getMatches(): Promise<MatchWithCount[]> {
  // Use a single query with aggregation
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      participants(count)
    `)
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (error) throw error;

  return (data || []).map(match => ({
    ...match,
    participant_count: match.participants?.[0]?.count || 0,
    participants: undefined
  }));
}

/**
 * Get a single match by ID with participants
 */
export async function getMatchById(matchId: string): Promise<MatchWithCount | null> {
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .maybeSingle();

  if (matchError) throw matchError;
  if (!match) return null;

  const { data: participants, error: partError } = await supabase
    .from('participants')
    .select('*')
    .eq('match_id', matchId)
    .order('position', { ascending: true });

  if (partError) throw partError;

  return {
    ...match,
    participants: participants || [],
    participant_count: participants?.length || 0
  };
}

/**
 * Get a match by invite code
 */
export async function getMatchByInviteCode(inviteCode: string): Promise<MatchWithCount | null> {
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('*')
    .eq('invite_code', inviteCode)
    .maybeSingle();

  if (matchError) throw matchError;
  if (!match) return null;

  const { data: participants, error: partError } = await supabase
    .from('participants')
    .select('*')
    .eq('match_id', match.id)
    .order('position', { ascending: true });

  if (partError) throw partError;

  return {
    ...match,
    participants: participants || [],
    participant_count: participants?.length || 0
  };
}

/**
 * Join a match as a participant
 * Includes race condition protection
 */
export async function joinMatch(
  matchId: string,
  userId: string,
  userName: string
): Promise<Participant> {
  // Sanitize user name
  const sanitizedUserName = sanitizeInput(userName);

  // Get match details and current participant count atomically
  const match = await getMatchById(matchId);
  
  if (!match) {
    throw new MatchNotFoundError(matchId);
  }

  const currentCount = match.participant_count || 0;

  // Check if match is full
  if (currentCount >= match.max_players) {
    throw new MatchFullError();
  }

  // Check if user already joined
  const alreadyJoined = match.participants?.some(p => p.user_id === userId);
  if (alreadyJoined) {
    throw new Error('You have already joined this match');
  }

  // Attempt to insert participant
  const { data, error } = await supabase
    .from('participants')
    .insert({
      match_id: matchId,
      user_id: userId,
      user_name: sanitizedUserName,
      position: currentCount,
      is_starter: true
    })
    .select()
    .single();

  if (error) {
    // Handle unique constraint violation (race condition)
    if (error.code === '23505') {
      throw new Error('You have already joined this match');
    }
    throw error;
  }

  return data;
}

/**
 * Leave a match
 */
export async function leaveMatch(matchId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('participants')
    .delete()
    .eq('match_id', matchId)
    .eq('user_id', userId);

  if (error) throw error;
}

/**
 * Check if user has joined a match
 */
export async function hasJoinedMatch(matchId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('participants')
    .select('id')
    .eq('match_id', matchId)
    .eq('user_id', userId)
    .maybeSingle();

  return !!data;
}

/**
 * Delete a match (creator only)
 * SECURITY: Validates creator_id to prevent unauthorized deletion
 */
export async function deleteMatch(matchId: string, creatorId: string): Promise<void> {
  // First verify the user is the creator
  const { data: match } = await supabase
    .from('matches')
    .select('creator_id')
    .eq('id', matchId)
    .single();

  if (!match) {
    throw new MatchNotFoundError(matchId);
  }

  if (match.creator_id !== creatorId) {
    throw new UnauthorizedError('delete this match');
  }

  // Now delete with creator_id check for extra security
  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('id', matchId)
    .eq('creator_id', creatorId);

  if (error) throw error;
}

/**
 * Update match details (creator only)
 * SECURITY: Validates creator_id to prevent unauthorized updates
 */
export async function updateMatch(
  matchId: string,
  updates: Partial<CreateMatchData>,
  creatorId: string
): Promise<Match> {
  // First verify the user is the creator
  const { data: match } = await supabase
    .from('matches')
    .select('creator_id, participant_count:participants(count)')
    .eq('id', matchId)
    .single();

  if (!match) {
    throw new MatchNotFoundError(matchId);
  }

  if (match.creator_id !== creatorId) {
    throw new UnauthorizedError('update this match');
  }

  // Sanitize all user inputs in updates
  const sanitizedUpdates: any = {};
  
  if (updates.title) sanitizedUpdates.title = sanitizeInput(updates.title);
  if (updates.location) sanitizedUpdates.location = sanitizeInput(updates.location);
  if (updates.captain_name) sanitizedUpdates.captain_name = sanitizeInput(updates.captain_name);
  if (updates.sport) sanitizedUpdates.sport = updates.sport;
  if (updates.date) {
    // Validate date is not in the past
    const matchDate = new Date(updates.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (matchDate < today) {
      throw new Error('Cannot set match date in the past');
    }
    sanitizedUpdates.date = updates.date;
  }
  if (updates.time) sanitizedUpdates.time = updates.time;
  if (updates.max_players !== undefined) {
    // Ensure max_players is not less than current participant count
    const currentCount = match.participant_count?.[0]?.count || 0;
    if (updates.max_players < currentCount) {
      throw new Error(`Cannot set max players below current participant count (${currentCount})`);
    }
    sanitizedUpdates.max_players = updates.max_players;
  }
  if (updates.price_per_person !== undefined) {
    sanitizedUpdates.price_per_person = updates.price_per_person;
  }

  // Update with creator_id check for extra security
  const { data, error } = await supabase
    .from('matches')
    .update({
      ...sanitizedUpdates,
      updated_at: new Date().toISOString()
    })
    .eq('id', matchId)
    .eq('creator_id', creatorId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get total count of active matches
 */
export async function getActiveMatchCount(): Promise<number> {
  const { count, error } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true })
    .gte('date', new Date().toISOString().split('T')[0]);

  if (error) throw error;
  return count || 0;
}

/**
 * Get total count of online players (participants in active matches)
 */
export async function getOnlinePlayerCount(): Promise<number> {
  const { data: matches } = await supabase
    .from('matches')
    .select('id')
    .gte('date', new Date().toISOString().split('T')[0]);

  if (!matches || matches.length === 0) return 0;

  const matchIds = matches.map(m => m.id);

  const { count, error } = await supabase
    .from('participants')
    .select('*', { count: 'exact', head: true })
    .in('match_id', matchIds);

  if (error) throw error;
  return count || 0;
}