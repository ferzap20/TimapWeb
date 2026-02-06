import { ArrowLeft, Zap } from 'lucide-react';
import { MatchCard } from '../components/MatchCard';
import { Footer } from '../components/Footer';
import { MatchWithCount, CreateMatchData } from '../types/database';
import logoAlone from '../Images/logo_alone.png';

interface MyMatchesPageProps {
  onBack: () => void;
  matches: MatchWithCount[];
  loading: boolean;
  currentUserId: string;
  onMatchClick: (match: MatchWithCount) => void;
  onUpdate: (matchId: string, updates: Partial<CreateMatchData>) => Promise<void>;
  onDelete: (matchId: string) => Promise<void>;
}

export function MyMatchesPage({
  onBack,
  matches,
  loading,
  currentUserId,
  onMatchClick,
}: MyMatchesPageProps) {
  return (
    <div className="min-h-screen bg-black">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 to-transparent" />

        <header className="relative border-b border-green-500/30">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-green-500 hover:text-green-400 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase">BACK HOME</h1>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <img src={logoAlone} alt="TIMAP" className="h-5" />
            </div>
          </div>
        </header>

        <section className="relative py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-center gap-3 mb-12">
              <Zap className="text-green-500" size={32} />
              <h2 className="text-3xl font-black text-green-500">MY MATCHES</h2>
            </div>

            {loading ? (
              <div className="text-center py-12" role="status">
                <div className="inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                <span className="sr-only">Loading matches...</span>
              </div>
            ) : matches.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg mb-4">You haven't created any matches yet.</p>
                <p className="text-gray-500">Create your first match to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.map((match) => (
                  <MatchCard key={match.id} match={match} onJoinClick={onMatchClick} currentUserId={currentUserId} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
