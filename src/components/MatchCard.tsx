/**
 * Match Card Component
 *
 * Displays a match in card format with all relevant information.
 * Shows sport, date, location, player count, and join status.
 */

import { Calendar, MapPin, Users } from 'lucide-react';
import { MatchWithCount } from '../types/database';
import { SportBadge } from './SportBadge';

interface MatchCardProps {
  match: MatchWithCount;
  onJoinClick: (match: MatchWithCount) => void;
  currentUserId?: string;
}

export function MatchCard({ match, onJoinClick, currentUserId }: MatchCardProps) {
  const isCreator = match.creator_id === currentUserId;
  const participantCount = match.participant_count || 0;
  const spotsLeft = match.max_players - participantCount;
  const fillPercentage = (participantCount / match.max_players) * 100;

  const getProgressBarColor = () => {
    if (spotsLeft === 0) return 'bg-red-500';
    if (spotsLeft <= 2) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const formatDate = (dateStr: string, timeStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${timeStr}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${timeStr}`;
    } else {
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
      return `${date.toLocaleDateString('en-US', options)} at ${timeStr}`;
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4 gap-2">
        <h3 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors line-clamp-2">
          {match.title}
        </h3>
        <SportBadge sport={match.sport} />
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Calendar size={16} className="text-green-500" />
          <span>{formatDate(match.date, match.time)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-400">
          <MapPin size={16} className="text-green-500" />
          <span>{match.location}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Users size={16} className="text-green-500" />
          <span>
            {participantCount}/{match.max_players} players
          </span>
          {isCreator && (
            <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
              You're the captain
            </span>
          )}
        </div>
      </div>

      <div
        className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-3"
        role="progressbar"
        aria-valuenow={participantCount}
        aria-valuemin={0}
        aria-valuemax={match.max_players}
        aria-label={`${participantCount} of ${match.max_players} players joined`}
      >
        <div
          className={`absolute top-0 left-0 h-full ${getProgressBarColor()} transition-all duration-300`}
          style={{ width: `${fillPercentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-sm font-bold ${spotsLeft === 0 ? 'text-red-500' : 'text-green-500'}`}>
          {spotsLeft === 0 ? 'FULL' : `${spotsLeft} LEFT`}
        </span>
        <button
          onClick={() => onJoinClick(match)}
          disabled={spotsLeft === 0}
          className="px-4 py-2 bg-transparent border border-gray-700 hover:border-green-500 text-white text-sm font-bold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {spotsLeft === 0 ? 'FULL' : 'SEE MATCH INFO'}
        </button>
      </div>
    </div>
  );
}
