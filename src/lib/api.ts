import { Match, Participant, CreateMatchData, MatchWithCount } from '../types/database';

const API_BASE = '/api';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function createMatch(
  matchData: CreateMatchData,
  creatorId: string,
  creatorName: string
): Promise<Match> {
  return apiFetch<Match>('/matches', {
    method: 'POST',
    body: JSON.stringify({
      ...matchData,
      creator_id: creatorId,
      creator_name: creatorName,
    }),
  });
}

export async function getMatches(): Promise<MatchWithCount[]> {
  return apiFetch<MatchWithCount[]>('/matches');
}

export async function getMatchById(matchId: string): Promise<MatchWithCount | null> {
  try {
    return await apiFetch<MatchWithCount>(`/matches/${matchId}`);
  } catch {
    return null;
  }
}

export async function getMatchByInviteCode(inviteCode: string): Promise<MatchWithCount | null> {
  try {
    return await apiFetch<MatchWithCount>(`/matches/invite/${inviteCode}`);
  } catch {
    return null;
  }
}

export async function updateMatch(
  matchId: string,
  updates: Partial<CreateMatchData>,
  creatorId: string
): Promise<Match> {
  return apiFetch<Match>(`/matches/${matchId}`, {
    method: 'PUT',
    body: JSON.stringify({ ...updates, creator_id: creatorId }),
  });
}

export async function deleteMatch(matchId: string, creatorId: string): Promise<void> {
  await apiFetch<{ success: boolean }>(`/matches/${matchId}`, {
    method: 'DELETE',
    body: JSON.stringify({ creator_id: creatorId }),
  });
}

export async function joinMatch(
  matchId: string,
  userId: string,
  userName: string
): Promise<Participant> {
  return apiFetch<Participant>(`/matches/${matchId}/join`, {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, user_name: userName }),
  });
}

export async function leaveMatch(matchId: string, userId: string): Promise<void> {
  await apiFetch<{ success: boolean }>(`/matches/${matchId}/leave`, {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
}

export async function hasJoinedMatch(matchId: string, userId: string): Promise<boolean> {
  const result = await apiFetch<{ joined: boolean }>(
    `/matches/${matchId}/joined?userId=${encodeURIComponent(userId)}`
  );
  return result.joined;
}

interface Stats {
  activeMatches: number;
  onlinePlayers: number;
}

async function getStats(): Promise<Stats> {
  return apiFetch<Stats>('/stats');
}

export async function getActiveMatchCount(): Promise<number> {
  const stats = await getStats();
  return stats.activeMatches;
}

export async function getOnlinePlayerCount(): Promise<number> {
  const stats = await getStats();
  return stats.onlinePlayers;
}
