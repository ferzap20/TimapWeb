/**
 * Create Match Modal Component
 *
 * Modal for creating a new match with form inputs for all match details.
 * Includes sport selection with colored pills and validation.
 */

import { useState, FormEvent } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { SportType, CreateMatchData } from '../types/database';
import { Trophy, MapPin } from 'lucide-react';
import { FootballIcon, BasketballIcon, TennisIcon, BaseballIcon, VolleyballIcon, OtherIcon } from './SportIcons';

interface CreateMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMatchData) => Promise<void>;
}

const sports: { value: SportType; label: string; icon: any; color: string }[] = [
  { value: 'football', label: 'Football', icon: FootballIcon, color: 'bg-green-500 hover:bg-green-400' },
  { value: 'basketball', label: 'Basketball', icon: BasketballIcon, color: 'bg-orange-500 hover:bg-orange-400' },
  { value: 'tennis', label: 'Tennis/Paddle', icon: TennisIcon, color: 'bg-yellow-500 hover:bg-yellow-400' },
  { value: 'baseball', label: 'Baseball', icon: BaseballIcon, color: 'bg-blue-500 hover:bg-blue-400' },
  { value: 'volleyball', label: 'Volleyball', icon: VolleyballIcon, color: 'bg-purple-500 hover:bg-purple-400' },
  { value: 'other', label: 'Other', icon: OtherIcon, color: 'bg-gray-500 hover:bg-gray-400' }
];

export function CreateMatchModal({ isOpen, onClose, onSubmit }: CreateMatchModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateMatchData>({
    title: '',
    sport: 'football',
    location: '',
    date: '',
    time: '',
    max_players: 10,
    captain_name: '',
    price_per_person: 0
  });

  const handleOpenMaps = () => {
    const location = formData.location.trim();
    const searchQuery = location || 'map';
    const encodedLocation = encodeURIComponent(searchQuery);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      const mapsUrl = `maps://maps.google.com/?q=${encodedLocation}`;
      const fallbackUrl = `https://maps.google.com/?q=${encodedLocation}`;

      window.location.href = mapsUrl;
      setTimeout(() => {
        window.location.href = fallbackUrl;
      }, 1000);
    } else {
      window.open(`https://maps.google.com/?q=${encodedLocation}`, '_blank');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Match title is required');
      return;
    }

    if (!formData.location.trim()) {
      alert('Location is required');
      return;
    }

    if (!formData.date) {
      alert('Date is required');
      return;
    }

    if (!formData.time) {
      alert('Time is required');
      return;
    }

    if (!formData.max_players || formData.max_players < 2) {
      alert('Max players must be at least 2');
      return;
    }

    setLoading(true);

    try {
      await onSubmit(formData);
      setFormData({
        title: '',
        sport: 'football',
        location: '',
        date: '',
        time: '',
        max_players: 10,
        captain_name: '',
        price_per_person: 0
      });
      onClose();
    } catch (error) {
      console.error('Error creating match:', error);
      alert('Failed to create match. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
            <Trophy className="text-black" size={24} />
          </div>
          <h2 className="text-2xl font-bold">
            <span className="text-white">CREATE</span>
            <span className="text-green-500">MATCH</span>
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Match Title"
            type="text"
            placeholder="e.g., Friendly Basketball Game"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase text-gray-400 tracking-wide">
              Game Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {sports.map((sport) => {
                const Icon = sport.icon;
                const isSelected = formData.sport === sport.value;
                return (
                  <button
                    key={sport.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, sport: sport.value })}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg font-bold text-sm transition-all ${
                      isSelected
                        ? `${sport.color} text-black`
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <div className="w-5 h-5">
                      <Icon />
                    </div>
                    {sport.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 tracking-wide mb-2">
              Location
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="e.g., Central Park"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="flex-1"
              />
              <button
                type="button"
                onClick={handleOpenMaps}
                className="px-4 py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
                title="Open in Maps"
              >
                <MapPin size={18} />
                Maps
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />

            <Input
              label="Time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
          </div>

          <Input
            label="Max Players"
            type="number"
            placeholder="8 players"
            value={formData.max_players}
            onChange={(e) => setFormData({ ...formData, max_players: parseInt(e.target.value) || 0 })}
            min={2}
            max={50}
          />

          <Input
            label="Your Name (Captain)"
            type="text"
            placeholder="e.g., Alex"
            value={formData.captain_name}
            onChange={(e) => setFormData({ ...formData, captain_name: e.target.value })}
          />

          <Input
            label="Price Per Person (Optional)"
            type="number"
            placeholder="0 for free"
            value={formData.price_per_person || ''}
            onChange={(e) => setFormData({ ...formData, price_per_person: parseInt(e.target.value) || 0 })}
            min={0}
            step={5}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Creating...' : 'Create Match'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
