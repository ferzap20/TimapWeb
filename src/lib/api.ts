import { supabase } from './supabase';
import { Match, Participant, CreateMatchData, MatchWithCount } from '../types/database';
import { extractCoordinatesFromLocation } from './location';

export class MatchFullError extends Error {
  constructor() {
    super('This match is already full.');
    this.name = 'MatchFullError';
  }
}

export class MatchNotFoundError extends Error {
  constructor() {
    super('Match not found.');
    this.name = 'MatchNotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor() {
    super('You are not authorized to perform this action.');
    this.name = 'UnauthorizedError';
  }
}

export class AlreadyJoinedError extends Error {
  constructor() {
    super('You have already joined this match.');
    this.name = 'AlreadyJoinedError';
  }
}

export class PastDateError extends Error {
  constructor() {
    super('Match date cannot be in the past.');
    this.name = 'PastDateError';
  }
}

function sanitizeInput(input: string): string {
  return input.replace(/[<>]/g, '').trim().slice(0, 500);
}

function generateInviteCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const values = new Uint8Array(12);
  crypto.getRandomValues(values);
  return Array.from(values, (v) => chars[v % chars.length]).join('');
}

function validateDate(date: string): void {
  const today = new Date().toISOString().split('T')[0];
  if (date < today) {
    throw new PastDateError();
  }
}

export async function createMatch(
  matchData: CreateMatchData,
  creatorId: string,
  creatorName: string
): Promise<Match> {
  validateDate(matchData.date);

  const inviteCode = generateInviteCode();
  const sanitizedLocation = sanitizeInput(matchData.location);
  const coordinates = extractCoordinatesFromLocation(sanitizedLocation);

  const { data, error } = await supabase
    .from('matches')
    .insert({
      title: sanitizeInput(matchData.title),
      sport: matchData.sport,
      location: sanitizedLocation,
      date: matchData.date,
      time: matchData.time,
      max_players: matchData.max_players,
      captain_name: sanitizeInput(matchData.captain_name || ''),
      price_per_person: matchData.price_per_person || 0,
      is_private: matchData.is_private || false,
      lat: coordinates.lat,
      lng: coordinates.lng,
      creator_id: creatorId,
      creator_name: sanitizeInput(creatorName),
      invite_code: inviteCode
    })
    .select()
    .single();

  if (error) throw error;

  const captainName = sanitizeInput(matchData.captain_name || creatorName);
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

export async function getMatches(): Promise<MatchWithCount[]> {
  const { data: matches, error: matchError } = await supabase
    .from('matches')
    .select('*, participants(count)')
    .eq('is_private', false)
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (matchError) throw matchError;

  return (matches || []).map((match: any) => ({
    ...match,
    participant_count: match.participants?.[0]?.count || 0,
    participants: undefined
  }));
}

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

export async function getMatchByInviteCode(inviteCode: string): Promise<MatchWithCount | null> {
  const sanitized = sanitizeInput(inviteCode);

  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('*')
    .eq('invite_code', sanitized)
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

export async function joinMatch(
  matchId: string,
  userId: string,
  userName: string
): Promise<Participant> {
  const match = await getMatchById(matchId);
  if (!match) throw new MatchNotFoundError();

  const participantCount = match.participant_count || 0;
  if (participantCount >= match.max_players) throw new MatchFullError();

  const alreadyJoined = match.participants?.some(p => p.user_id === userId);
  if (alreadyJoined) throw new AlreadyJoinedError();

  const { data, error } = await supabase
    .from('participants')
    .insert({
      match_id: matchId,
      user_id: userId,
      user_name: sanitizeInput(userName),
      position: participantCount,
      is_starter: true
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function leaveMatch(matchId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('participants')
    .delete()
    .eq('match_id', matchId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function hasJoinedMatch(matchId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('participants')
    .select('id')
    .eq('match_id', matchId)
    .eq('user_id', userId)
    .maybeSingle();

  return !!data;
}

export async function deleteMatch(matchId: string, creatorId: string): Promise<void> {
  const { data: match, error: fetchError } = await supabase
    .from('matches')
    .select('creator_id')
    .eq('id', matchId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!match) throw new MatchNotFoundError();
  if (match.creator_id !== creatorId) throw new UnauthorizedError();

  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('id', matchId)
    .eq('creator_id', creatorId);

  if (error) throw error;
}

export async function updateMatch(
  matchId: string,
  updates: Partial<CreateMatchData>,
  creatorId: string
): Promise<Match> {
  const { data: match, error: fetchError } = await supabase
    .from('matches')
    .select('creator_id')
    .eq('id', matchId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!match) throw new MatchNotFoundError();
  if (match.creator_id !== creatorId) throw new UnauthorizedError();

  if (updates.date) validateDate(updates.date);

  const sanitizedUpdates: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  };

  if (updates.title !== undefined) sanitizedUpdates.title = sanitizeInput(updates.title);
  if (updates.sport !== undefined) sanitizedUpdates.sport = updates.sport;
  if (updates.location !== undefined) sanitizedUpdates.location = sanitizeInput(updates.location);
  if (updates.date !== undefined) sanitizedUpdates.date = updates.date;
  if (updates.time !== undefined) sanitizedUpdates.time = updates.time;
  if (updates.max_players !== undefined) sanitizedUpdates.max_players = updates.max_players;
  if (updates.captain_name !== undefined) sanitizedUpdates.captain_name = sanitizeInput(updates.captain_name);
  if (updates.price_per_person !== undefined) sanitizedUpdates.price_per_person = updates.price_per_person;
  if (updates.is_private !== undefined) sanitizedUpdates.is_private = updates.is_private;

  const { data, error } = await supabase
    .from('matches')
    .update(sanitizedUpdates)
    .eq('id', matchId)
    .eq('creator_id', creatorId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getActiveMatchCount(): Promise<number> {
  const { count, error } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true })
    .eq('is_private', false)
    .gte('date', new Date().toISOString().split('T')[0]);

  if (error) throw error;
  return count || 0;
}

export async function getOnlinePlayerCount(): Promise<number> {
  const { data: matches } = await supabase
    .from('matches')
    .select('id')
    .eq('is_private', false)
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
