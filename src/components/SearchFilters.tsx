import { useState, useEffect, useRef } from 'react';
import { SUPPORTED_CITIES, City } from '../lib/cities';
import { SportType } from '../types/database';

interface SearchFiltersProps {
  selectedCity: City | null;
  selectedDistance: number | null;
  selectedSport: SportType | null;
  onCityChange: (city: City | null) => void;
  onDistanceChange: (distance: number | null) => void;
  onSportChange: (sport: SportType | null) => void;
  matchCount: number;
}

const SPORTS: { value: SportType; label: string }[] = [
  { value: 'football', label: 'Football' },
  { value: 'basketball', label: 'Basketball' },
  { value: 'tennis', label: 'Tennis' },
  { value: 'baseball', label: 'Baseball' },
  { value: 'volleyball', label: 'Volleyball' },
  { value: 'other', label: 'Other' }
];

const DISTANCES = [5, 10, 15, 20, 30, 50];

export function SearchFilters({
  selectedCity,
  selectedDistance,
  selectedSport,
  onCityChange,
  onDistanceChange,
  onSportChange,
  matchCount
}: SearchFiltersProps) {
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setShowCityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCities = citySearch
    ? SUPPORTED_CITIES.filter(city =>
        city.name.toLowerCase().includes(citySearch.toLowerCase())
      )
    : SUPPORTED_CITIES;

  const hasActiveFilters = selectedCity || selectedSport || selectedDistance;

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-8">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-4">Filter Matches</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* City Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              City
            </label>
            <div className="relative" ref={cityDropdownRef}>
              <button
                onClick={() => setShowCityDropdown(!showCityDropdown)}
                aria-expanded={showCityDropdown}
                aria-haspopup="listbox"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm hover:border-green-500 transition-colors text-left flex items-center justify-between"
              >
                <span>{selectedCity ? selectedCity.name : 'Select a city'}</span>
                <span className="text-gray-400">▼</span>
              </button>

              {showCityDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded shadow-lg z-10">
                  <input
                    type="text"
                    placeholder="Search cities..."
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 text-white text-sm placeholder-gray-400 focus:outline-none border-b border-gray-700"
                    autoFocus
                  />
                  <div className="max-h-48 overflow-y-auto" role="listbox" aria-label="Select a city">
                    <button
                      onClick={() => {
                        onCityChange(null);
                        setShowCityDropdown(false);
                        setCitySearch('');
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                      Clear city filter
                    </button>
                    {filteredCities.map((city) => (
                      <button
                        key={city.name}
                        onClick={() => {
                          onCityChange(city);
                          setShowCityDropdown(false);
                          setCitySearch('');
                        }}
                        className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                          selectedCity?.name === city.name
                            ? 'bg-green-500/30 text-green-300'
                            : 'text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {city.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Distance Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Distance {selectedCity && '(km)'}
            </label>
            <select
              value={selectedDistance ?? ''}
              onChange={(e) => onDistanceChange(e.target.value ? parseInt(e.target.value) : null)}
              disabled={!selectedCity}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm hover:border-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Any distance</option>
              {DISTANCES.map((dist) => (
                <option key={dist} value={dist}>
                  Within {dist} km
                </option>
              ))}
            </select>
          </div>

          {/* Sport Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sport
            </label>
            <select
              value={selectedSport ?? ''}
              onChange={(e) => onSportChange((e.target.value || null) as SportType | null)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm hover:border-green-500 transition-colors"
            >
              <option value="">All sports</option>
              {SPORTS.map((sport) => (
                <option key={sport.value} value={sport.value}>
                  {sport.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm">
        <div>
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-green-400">
                Filters active: showing {matchCount} match{matchCount !== 1 ? 'es' : ''}
              </span>
            </div>
          )}
          {!hasActiveFilters && (
            <span className="text-gray-400">
              No filters applied: showing all {matchCount} match{matchCount !== 1 ? 'es' : ''}
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={() => {
              onCityChange(null);
              onDistanceChange(null);
              onSportChange(null);
            }}
            className="text-green-400 hover:text-green-300 transition-colors text-xs font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}
