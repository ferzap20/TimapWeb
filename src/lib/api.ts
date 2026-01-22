/**
 * Database API Functions
 *
 * This module provides functions for interacting with the Supabase database.
 * All CRUD operations for matches and participants are defined here.
 */

import { supabase } from './supabase';
import { Match, Participant, CreateMatchData, MatchWithCount } from '../types/database';
import { extractCoordinatesFromLocation } from './location';

/**
 * Generate a unique invite code for a match
 * Uses a combination of random characters
 */
function generateInviteCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
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
  const coordinates = extractCoordinatesFromLocation(matchData.location);

  const { data, error } = await supabase
    .from('matches')
    .insert({
      ...matchData,
      lat: coordinates.lat,
      lng: coordinates.lng,
      creator_id: creatorId,
      creator_name: creatorName,
      invite_code: inviteCode
    })
    .select()
    .single();

  if (error) throw error;

  // Auto-add creator as first participant (captain)
  const captainName = matchData.captain_name || creatorName;
  await supabase
    .from('participants')
    .insert({
      match_id: data.id,
      user_id: creatorId,
      user_name: captainName,
      position: 0,
      is_starter: true
    });

  return data;
}

/**
 * Get all active matches with participant counts
 * Orders by date ascending
 */
export async function getMatches(): Promise<MatchWithCount[]> {
  const { data: matches, error: matchError } = await supabase
    .from('matches')
    .select('*')
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (matchError) throw matchError;

  // Get participant counts for each match
  const matchesWithCounts = await Promise.all(
    (matches || []).map(async (match) => {
      const { count } = await supabase
        .from('participants')
        .select('*', { count: 'exact', head: true })
        .eq('match_id', match.id);

      return {
        ...match,
        participant_count: count || 0
      };
    })
  );

  return matchesWithCounts;
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
 */
export async function joinMatch(
  matchId: string,
  userId: string,
  userName: string
): Promise<Participant> {
  // Get current participant count for position
  const { count } = await supabase
    .from('participants')
    .select('*', { count: 'exact', head: true })
    .eq('match_id', matchId);

  const { data, error } = await supabase
    .from('participants')
    .insert({
      match_id: matchId,
      user_id: userId,
      user_name: userName,
      position: count || 0,
      is_starter: true
    })
    .select()
    .single();

  if (error) throw error;
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
 * Delete a match (creator only - enforced in frontend)
 */
export async function deleteMatch(matchId: string): Promise<void> {
  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('id', matchId);

  if (error) throw error;
}

/**
 * Update match details
 */
export async function updateMatch(matchId: string, updates: Partial<CreateMatchData>): Promise<Match> {
  const { data, error } = await supabase
    .from('matches')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', matchId)
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
