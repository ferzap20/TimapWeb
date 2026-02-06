/**
 * Match Details Modal Component
 *
 * Shows detailed match information and allows users to join.
 * Prompts for username if not set, displays participant list.
 */

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { SportBadge } from './SportBadge';
import { MatchWithCount } from '../types/database';
import { Calendar, MapPin, Users, CreditCard, Award, Edit2, Trash2, Save, X, Share2, Plus, Check } from 'lucide-react';
import { Select } from './Select';
import { SportType } from '../types/database';
import { MatchFullError, AlreadyJoinedError, UnauthorizedError } from '../lib/api';

interface MatchDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: MatchWithCount | null;
  onJoin: (matchId: string, userName: string) => Promise<void>;
  onUpdate?: (matchId: string, updates: any) => Promise<void>;
  onDelete?: (matchId: string) => Promise<void>;
  hasJoined: boolean;
  currentUserName: string;
  currentUserId: string;
}

export function MatchDetailsModal({
  isOpen,
  onClose,
  match,
  onJoin,
  onUpdate,
  onDelete,
  hasJoined,
  currentUserName,
  currentUserId
}: MatchDetailsModalProps) {
  const [userName, setUserName] = useState(currentUserName);
  const [loading, setLoading] = useState(false);
  const [showNameInput, setShowNameInput] = useState(!currentUserName);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [editData, setEditData] = useState({
    title: '',
    sport: 'football' as SportType,
    location: '',
    date: '',
    time: '',
    max_players: 10,
    captain_name: '',
    price_per_person: 0
  });

  useEffect(() => {
    setUserName(currentUserName);
    setShowNameInput(!currentUserName);
    setIsEditMode(false);
    if (match) {
      setEditData({
        title: match.title,
        sport: match.sport,
        location: match.location,
        date: match.date,
        time: match.time,
        max_players: match.max_players,
        captain_name: match.captain_name,
        price_per_person: match.price_per_person
      });
    }
  }, [currentUserName, isOpen, match]);

  if (!match) return null;

  const participantCount = match.participant_count || 0;
  const spotsLeft = match.max_players - participantCount;
  const isCreator = match.creator_id === currentUserId;
  const isOnList = match.participants?.some(p => p.user_id === currentUserId) || false;

  const handleJoin = async () => {
    if (showNameInput && !userName.trim()) {
      alert('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      await onJoin(match.id, userName.trim());
    } catch (error) {
      if (error instanceof MatchFullError) {
        alert('This match is full. No more spots available.');
      } else if (error instanceof AlreadyJoinedError) {
        alert('You have already joined this match.');
      } else {
        alert('Failed to join match. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (onUpdate) {
        await onUpdate(match.id, editData);
      }
      setIsEditMode(false);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        alert('You are not authorized to edit this match.');
      } else {
        alert('Failed to update match. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this match? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      if (onDelete) {
        await onDelete(match.id);
      }
      onClose();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        alert('You are not authorized to delete this match.');
      } else {
        alert('Failed to delete match. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditData({
      title: match.title,
      sport: match.sport,
      location: match.location,
      date: match.date,
      time: match.time,
      max_players: match.max_players,
      captain_name: match.captain_name,
      price_per_person: match.price_per_person
    });
    setIsEditMode(false);
  };

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) {
      alert('Please enter a player name');
      return;
    }

    const playerExists = match.participants?.some(
      p => p.user_name.toLowerCase() === newPlayerName.trim().toLowerCase()
    );

    if (playerExists) {
      alert('This player is already in the match');
      return;
    }

    const participantCount = match.participant_count || 0;
    if (participantCount >= match.max_players) {
      alert('Match is full');
      return;
    }

    try {
      await onJoin(match.id, newPlayerName.trim());
      setNewPlayerName('');
      setShowAddPlayer(false);
    } catch (error) {
      console.error('Error adding player:', error);
      alert('Failed to add player');
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}?match=${match.invite_code}`;
    const text = `Join my match: ${match.title} on ${formatDate(match.date, match.time)} at ${match.location}`;

    if (navigator.share) {
      navigator.share({
        title: match.title,
        text,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Match link copied to clipboard');
    }
  };

  const handleAddToCalendar = () => {
    const startDate = new Date(`${match.date}T${match.time}`);
    const endDate = new Date(startDate.getTime() + 90 * 60000);

    const event = {
      title: match.title,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      description: `Location: ${match.location}`,
      location: match.location
    };

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;

    window.open(googleCalendarUrl);
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
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
      return `${date.toLocaleDateString('en-US', options)} at ${timeStr}`;
    }
  };

  const sports = [
    { value: 'football', label: 'Football' },
    { value: 'basketball', label: 'Basketball' },
    { value: 'tennis', label: 'Tennis' },
    { value: 'baseball', label: 'Baseball' },
    { value: 'volleyball', label: 'Volleyball' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      actions={
        isCreator && !isEditMode ? (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditMode(true)}
              className="p-2 bg-gray-800 hover:bg-gray-700 text-green-500 rounded-lg transition-colors"
              title="Edit match"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="p-2 bg-gray-800 hover:bg-red-900 text-red-500 rounded-lg transition-colors disabled:opacity-50"
              title="Delete match"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ) : undefined
      }
    >
      <div className="space-y-6">
        <div>
          {isEditMode ? (
            <Input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className="text-2xl font-bold mb-2"
            />
          ) : (
            <h2 className="text-2xl font-bold text-white mb-2">{match.title}</h2>
          )}
          {isEditMode ? (
            <Select
              options={sports}
              value={editData.sport}
              onChange={(e) => setEditData({ ...editData, sport: e.target.value as SportType })}
            />
          ) : (
            <SportBadge sport={match.sport} />
          )}
        </div>

        {isEditMode ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date"
                type="date"
                value={editData.date}
                onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
              <Input
                label="Time"
                type="time"
                value={editData.time}
                onChange={(e) => setEditData({ ...editData, time: e.target.value })}
              />
            </div>
            <Input
              label="Location"
              type="text"
              value={editData.location}
              onChange={(e) => setEditData({ ...editData, location: e.target.value })}
            />
            <Input
              label="Max Players"
              type="number"
              value={editData.max_players}
              onChange={(e) => setEditData({ ...editData, max_players: parseInt(e.target.value) || 0 })}
              min={participantCount || 2}
              max={50}
            />
            <Input
              label="Captain Name (Optional)"
              type="text"
              value={editData.captain_name}
              onChange={(e) => setEditData({ ...editData, captain_name: e.target.value })}
            />
            <Input
              label="Price Per Person (Optional)"
              type="number"
              value={editData.price_per_person || ''}
              onChange={(e) => setEditData({ ...editData, price_per_person: parseInt(e.target.value) || 0 })}
              min={0}
            />

            <div className="space-y-2 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase text-gray-400">Participants</h3>
                <button
                  onClick={() => setShowAddPlayer(!showAddPlayer)}
                  className="p-1.5 bg-green-500 hover:bg-green-600 text-black rounded-lg transition-colors"
                  title="Add player"
                >
                  <Plus size={16} />
                </button>
              </div>

              {showAddPlayer && (
                <div className="bg-gray-900 rounded-lg p-3 space-y-2 border border-gray-700">
                  <Input
                    type="text"
                    placeholder="Enter player name"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddPlayer}
                      className="flex-1 flex items-center justify-center gap-2 py-2"
                    >
                      <Check size={16} />
                      Add
                    </Button>
                    <button
                      onClick={() => {
                        setShowAddPlayer(false);
                        setNewPlayerName('');
                      }}
                      className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {match.participants && match.participants.length > 0 && (
                <div className="space-y-1">
                  {match.participants
                    .sort((a, b) => {
                      const aIsCaptain = a.user_name === editData.captain_name && editData.captain_name;
                      const bIsCaptain = b.user_name === editData.captain_name && editData.captain_name;
                      if (aIsCaptain && !bIsCaptain) return -1;
                      if (!aIsCaptain && bIsCaptain) return 1;
                      return 0;
                    })
                    .map((participant, index) => {
                      const isCaptain = participant.user_name === editData.captain_name && editData.captain_name;
                      const displayName = isCaptain ? `${participant.user_name} (C)` : participant.user_name;
                      return (
                        <div
                          key={participant.id}
                          className="bg-gray-900 rounded px-3 py-2 text-sm text-gray-300"
                        >
                          {index + 1}. {displayName || 'Anonymous Player'}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleCancelEdit}
                variant="secondary"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <X size={18} />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-green-500" />
              <div>
                <div className="text-xs font-bold uppercase text-gray-400">Date & Time</div>
                <div className="text-white">{formatDate(match.date, match.time)}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin size={20} className="text-green-500" />
              <div>
                <div className="text-xs font-bold uppercase text-gray-400">Location</div>
                <div className="text-white">{match.location}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users size={20} className="text-green-500" />
              <div>
                <div className="text-xs font-bold uppercase text-gray-400">Players</div>
                <div className="text-white">
                  {participantCount}/{match.max_players} Joined
                </div>
              </div>
            </div>

            {match.captain_name && (
              <div className="flex items-center gap-3">
                <Award size={20} className="text-green-500" />
                <div>
                  <div className="text-xs font-bold uppercase text-gray-400">Captain</div>
                  <div className="text-white">{match.captain_name}</div>
                </div>
              </div>
            )}

            {match.price_per_person > 0 && (
              <div className="flex items-center gap-3">
                <CreditCard size={20} className="text-green-500" />
                <div>
                  <div className="text-xs font-bold uppercase text-gray-400">Price Per Player</div>
                  <div className="text-white">${(match.price_per_person / 100).toFixed(2)}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {!isEditMode && (
          <>
            {isCreator ? (
              <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 text-center">
                <p className="text-green-500 font-bold">You're the captain!</p>
              </div>
            ) : isOnList ? (
              <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 text-center">
                <p className="text-green-500 font-bold">You're on the list!</p>
              </div>
            ) : spotsLeft === 0 ? (
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-center">
                <p className="text-red-500 font-bold">This match is full</p>
              </div>
            ) : (
              <>
                {showNameInput && (
                  <Input
                    label="Your Name (Optional)"
                    type="text"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                )}

                <Button
                  onClick={handleJoin}
                  disabled={loading || spotsLeft === 0}
                  className="w-full"
                >
                  {loading ? 'Joining...' : 'JOIN NOW'}
                </Button>
              </>
            )}
          </>
        )}

        {!isEditMode && match.participants && match.participants.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase text-gray-400">Participants</h3>
            <div className="space-y-1">
              {match.participants
                .sort((a, b) => {
                  const aIsCaptain = a.user_name === match.captain_name && match.captain_name;
                  const bIsCaptain = b.user_name === match.captain_name && match.captain_name;
                  if (aIsCaptain && !bIsCaptain) return -1;
                  if (!aIsCaptain && bIsCaptain) return 1;
                  return 0;
                })
                .map((participant, index) => {
                  const isCaptain = participant.user_name === match.captain_name && match.captain_name;
                  const displayName = isCaptain ? `${participant.user_name} (C)` : participant.user_name;
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
          </div>
        )}

        {!isEditMode && (
          <div className="flex gap-2 pt-4 border-t border-gray-800">
            <Button
              onClick={handleShare}
              variant="secondary"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Share2 size={18} />
              Share
            </Button>
            <Button
              onClick={handleAddToCalendar}
              variant="secondary"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Calendar size={18} />
              Add to Calendar
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
