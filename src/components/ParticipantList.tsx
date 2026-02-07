/**
 * Participant List Component
 *
 * Displays a sorted list of match participants with captain designation.
 * Used in both view and edit modes of MatchDetailsModal.
 */

import { Participant } from '../types/database';

interface ParticipantListProps {
  participants: Participant[];
  captainName?: string;
  className?: string;
}

export function ParticipantList({ participants, captainName, className = '' }: ParticipantListProps) {
  // Sort participants with captain first
  const sortedParticipants = [...participants].sort((a, b) => {
    const aIsCaptain = a.user_name === captainName && captainName;
    const bIsCaptain = b.user_name === captainName && captainName;
    if (aIsCaptain && !bIsCaptain) return -1;
    if (!aIsCaptain && bIsCaptain) return 1;
    return 0;
  });

  if (participants.length === 0) {
    return (
      <div className={`text-center text-gray-500 text-sm py-4 ${className}`}>
        No participants yet
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {sortedParticipants.map((participant, index) => {
        const isCaptain = participant.user_name === captainName && captainName;
        const displayName = isCaptain
          ? `${participant.user_name} (C)`
          : participant.user_name;

        return (
          <div
            key={participant.id}
            className="bg-gray-800 rounded px-3 py-2 text-sm text-gray-300"
          >
            {index + 1}. {displayName || 'Anonymous Player'}
          </div>
        );
      })}
    </div>
  );
}
