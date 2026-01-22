import { SportType } from '../types/database';
import { FootballIcon, OtherIcon, BasketballIcon, TennisIcon, BaseballIcon, VolleyballIcon } from './SportIcons';

interface SportBadgeProps {
  sport: SportType;
  className?: string;
}

const sportConfig = {
  football: {
    label: 'Football',
    icon: FootballIcon,
    bgColor: 'bg-green-500',
    textColor: 'text-black'
  },
  basketball: {
    label: 'Basketball',
    icon: BasketballIcon,
    bgColor: 'bg-orange-500',
    textColor: 'text-black'
  },
  tennis: {
    label: 'Tennis',
    icon: TennisIcon,
    bgColor: 'bg-yellow-500',
    textColor: 'text-black'
  },
  baseball: {
    label: 'Baseball',
    icon: BaseballIcon,
    bgColor: 'bg-blue-500',
    textColor: 'text-white'
  },
  volleyball: {
    label: 'Volleyball',
    icon: VolleyballIcon,
    bgColor: 'bg-purple-500',
    textColor: 'text-white'
  },
  other: {
    label: 'Other',
    icon: OtherIcon,
    bgColor: 'bg-gray-500',
    textColor: 'text-white'
  }
};

export function SportBadge({ sport, className = '' }: SportBadgeProps) {
  const config = sportConfig[sport];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-xs uppercase ${config.bgColor} ${config.textColor} ${className}`}
    >
      <span className="w-4 h-4">
        <Icon />
      </span>
      {config.label}
    </span>
  );
}
