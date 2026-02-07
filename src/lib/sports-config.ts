/**
 * Centralized sports configuration
 * Defines all supported sports with their display properties
 */

import { SportType } from '../types/database';
import {
  FootballIcon,
  BasketballIcon,
  TennisIcon,
  BaseballIcon,
  VolleyballIcon,
  OtherIcon
} from '../components/SportIcons';

export interface SportConfig {
  value: SportType;
  label: string;
  icon: any;
  color: string;
}

export const SPORTS: SportConfig[] = [
  {
    value: 'football',
    label: 'Football',
    icon: FootballIcon,
    color: 'bg-green-500 hover:bg-green-400'
  },
  {
    value: 'basketball',
    label: 'Basketball',
    icon: BasketballIcon,
    color: 'bg-orange-500 hover:bg-orange-400'
  },
  {
    value: 'tennis',
    label: 'Tennis/Paddle',
    icon: TennisIcon,
    color: 'bg-yellow-500 hover:bg-yellow-400'
  },
  {
    value: 'baseball',
    label: 'Baseball',
    icon: BaseballIcon,
    color: 'bg-blue-500 hover:bg-blue-400'
  },
  {
    value: 'volleyball',
    label: 'Volleyball',
    icon: VolleyballIcon,
    color: 'bg-purple-500 hover:bg-purple-400'
  },
  {
    value: 'other',
    label: 'Other',
    icon: OtherIcon,
    color: 'bg-gray-500 hover:bg-gray-400'
  }
];

/**
 * Get sport configuration by value
 */
export function getSportConfig(sport: SportType): SportConfig | undefined {
  return SPORTS.find(s => s.value === sport);
}

/**
 * Get sport label by value
 */
export function getSportLabel(sport: SportType): string {
  return getSportConfig(sport)?.label || sport;
}
