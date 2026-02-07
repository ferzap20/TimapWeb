import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Target, Share2, Zap, Plus, ClipboardList, LogOut, Menu, X } from 'lucide-react';
import { CreateMatchModal } from './components/CreateMatchModal';
import { MatchDetailsModal } from './components/MatchDetailsModal';
import { MatchCreatedModal } from './components/MatchCreatedModal';
import { MatchCard } from './components/MatchCard';
import { Button } from './components/Button';
import { Footer } from './components/Footer';
import { SearchFilters } from './components/SearchFilters';
import { InstallPrompt } from './components/InstallPrompt';
import { AuthModal } from './components/AuthModal';
import { AboutPage } from './pages/AboutPage';
import { SupportPage } from './pages/SupportPage';
import { MyMatchesPage } from './pages/MyMatchesPage';
import logoAlone from './Images/logo_alone.png';
import logo01 from './Images/logo01.png';
import { Match, MatchWithCount, CreateMatchData, SportType } from './types/database';
import { getUserInfo, setUserName as saveUserName } from './lib/storage';
import {
  createMatch,
  getMatches,
  getMyMatches,
  getMatchById,
  getMatchByInviteCode,
  joinMatch,
  addPlayerToMatch,
  getActiveMatchCount,
  getTotalPlayerCount,
  updateMatch,
  deleteMatch,
  MatchFullError,
  AlreadyJoinedError,
  UnauthorizedError,
  cleanupExpiredMatches
} from './lib/api';
import { supabase } from './lib/supabase';
import { City } from './lib/cities';
import { calculateHaversineDistance } from './lib/location';
import { registerServiceWorker } from './lib/pwa';
import { showToast } from './lib/toast';
import { useAuth } from './lib/auth';

function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [matches, setMatches] = useState<MatchWithCount[]>([]);
  const [myMatches, setMyMatches] = useState<MatchWithCount[]>([]);
  const [activeMatchCount, setActiveMatchCount] = useState(3);
  const [totalPlayerCount, setTotalPlayerCount] = useState(16);
  const [loading, setLoading] = useState(true);
  const [myMatchesLoading, setMyMatchesLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreatedModal, setShowCreatedModal] = useState(false);

  const [selectedMatch, setSelectedMatch] = useState<MatchWithCount | null>(null);
  const [createdMatch, setCreatedMatch] = useState<Match | null>(null);

  const [currentPage, setCurrentPage] = useState<'home' | 'about' | 'support' | 'mymatches'>('home');

  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedDistance, setSelectedDistance] = useState<number | null>(null);
  const [selectedSport, setSelectedSport] = useState<SportType | null>(null);

  const userInfo = useMemo(() => getUserInfo(), []);
  const selectedMatchRef = useRef(selectedMatch);
  const reloadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  selectedMatchRef.current = selectedMatch;

  const userId = user?.id || userInfo.id;
  const userName = user?.email?.split('@')[0] || userInfo.name;

  const filteredMatches = useMemo(() => {
    let result = matches;

    if (selectedSport) {
      result = result.filter(match => match.sport === selectedSport);
    }

    if (selectedCity && selectedDistance) {
      result = result.filter(match => {
        if (!match.lat || !match.lng) return false;
        const distance = calculateHaversineDistance(
          selectedCity.lat,
          selectedCity.lng,
          match.lat,
          match.lng
        );
        return distance <= selectedDistance;
      });
    }

    return result;
  }, [matches, selectedCity, selectedDistance, selectedSport]);

  const loadMatches = useCallback(async () => {
    try {
      const data = await getMatches();
      setMatches(data);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMyMatches = useCallback(async () => {
    try {
      setMyMatchesLoading(true);
      const data = await getMyMatches(userId);
      setMyMatches(data);
    } catch (error) {
      console.error('Error loading my matches:', error);
    } finally {
      setMyMatchesLoading(false);
    }
  }, [userId]);

  const loadStats = useCallback(async () => {
    try {
      const [matchCount, playerCount] = await Promise.all([
        getActiveMatchCount(),
        getTotalPlayerCount()
      ]);
      setActiveMatchCount(matchCount);
      setTotalPlayerCount(playerCount);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, []);

  const refreshSelectedMatch = useCallback(async (matchId: string) => {
    try {
      const updated = await getMatchById(matchId);
      if (updated) {
        setSelectedMatch(updated);
      }
    } catch (error) {
      console.error('Error refreshing match:', error);
    }
  }, []);

  const debouncedReload = useCallback(() => {
    if (reloadTimeoutRef.current) {
      clearTimeout(reloadTimeoutRef.current);
    }
    reloadTimeoutRef.current = setTimeout(() => {
      loadMatches();
      loadStats();
      const current = selectedMatchRef.current;
      if (current) {
        refreshSelectedMatch(current.id);
      }
    }, 300);
  }, [loadMatches, loadStats, refreshSelectedMatch]);

  useEffect(() => {
    registerServiceWorker();
  }, []);

  useEffect(() => {
    cleanupExpiredMatches().catch(() => {});
    loadMatches();
    loadStats();

    const urlParams = new URLSearchParams(window.location.search);
    const inviteCode = urlParams.get('match');
    if (inviteCode) {
      (async () => {
        try {
          const match = await getMatchByInviteCode(inviteCode);
          if (match) {
            setSelectedMatch(match);
            setShowDetailsModal(true);
          }
        } catch (error) {
          console.error('Error loading match from invite:', error);
        }
      })();
    }

    const matchesSubscription = supabase
      .channel('matches_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => {
        debouncedReload();
      })
      .subscribe();

    const participantsSubscription = supabase
      .channel('participants_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, () => {
        debouncedReload();
      })
      .subscribe();

    return () => {
      matchesSubscription.unsubscribe();
      participantsSubscription.unsubscribe();
      if (reloadTimeoutRef.current) {
        clearTimeout(reloadTimeoutRef.current);
      }
    };
  }, [debouncedReload, loadMatches, loadStats]);

  const handleCreateMatch = async (data: CreateMatchData) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    try {
      const match = await createMatch(data, userId, userName);
      setCreatedMatch(match);
      setShowCreatedModal(true);
      await loadMatches();
      await loadStats();
    } catch (error) {
      console.error('Error creating match:', error);
      throw error;
    }
  };

  const handleMatchClick = async (match: MatchWithCount) => {
    try {
      const fullMatch = await getMatchById(match.id);
      if (fullMatch) {
        setSelectedMatch(fullMatch);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error loading match details:', error);
    }
  };

  const handleJoinMatch = async (matchId: string, playerName: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    try {
      if (playerName && playerName !== userInfo.name) {
        saveUserName(playerName);
      }
      await joinMatch(matchId, userId, playerName);
      await refreshSelectedMatch(matchId);
      await loadMatches();
      await loadStats();
    } catch (error) {
      if (error instanceof MatchFullError) {
        showToast.error('This match is already full.');
      } else if (error instanceof AlreadyJoinedError) {
        showToast.error('You have already joined this match.');
      } else {
        console.error('Error joining match:', error);
        showToast.error('Failed to join match. Please try again.');
      }
      throw error;
    }
  };

  const handleAddPlayer = async (matchId: string, playerName: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    try {
      await addPlayerToMatch(matchId, playerName, userId);
      await refreshSelectedMatch(matchId);
      await loadMatches();
      await loadStats();
    } catch (error) {
      if (error instanceof MatchFullError) {
        showToast.error('This match is already full.');
      } else {
        console.error('Error adding player:', error);
        showToast.error('Failed to add player.');
      }
      throw error;
    }
  };

  const handleUpdateMatch = async (matchId: string, updates: Partial<CreateMatchData>) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    try {
      await updateMatch(matchId, updates, userId);
      await refreshSelectedMatch(matchId);
      await loadMatches();
      await loadStats();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        showToast.error('You are not authorized to edit this match.');
      } else {
        console.error('Error updating match:', error);
        showToast.error('Failed to update match. Please try again.');
      }
      throw error;
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    try {
      await deleteMatch(matchId, userId);
      setShowDetailsModal(false);
      setSelectedMatch(null);
      await loadMatches();
      await loadStats();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        showToast.error('You are not authorized to delete this match.');
      } else {
        console.error('Error deleting match:', error);
        showToast.error('Failed to delete match. Please try again.');
      }
      throw error;
    }
  };

  if (currentPage === 'about') {
    return <AboutPage onBack={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'support') {
    return <SupportPage onBack={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'mymatches') {
    return (
      <>
        <MyMatchesPage
          onBack={() => setCurrentPage('home')}
          matches={myMatches}
          loading={myMatchesLoading}
          currentUserId={userId}
          onMatchClick={handleMatchClick}
          onUpdate={handleUpdateMatch}
          onDelete={handleDeleteMatch}
        />
        <MatchDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedMatch(null);
          }}
          match={selectedMatch}
          onJoin={handleJoinMatch}
          onAddPlayer={handleAddPlayer}
          onUpdate={handleUpdateMatch}
          onDelete={async (matchId) => {
            await handleDeleteMatch(matchId);
            await loadMyMatches();
          }}
          currentUserName={userName}
          currentUserId={userId}
        />
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 to-transparent" aria-hidden="true" />

        <header className="relative border-b border-green-500/30">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={logoAlone} alt="TIMAP" className="h-5" />
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" aria-hidden="true" />
              <span className="px-2 py-0.5 bg-green-500 text-black text-xs font-bold rounded inline-flex items-left gap-1.5">LIVE</span>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-400 hover:text-white transition-colors z-50"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <nav aria-label="Main navigation" className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row items-start md:items-center gap-0 md:gap-6 absolute md:static top-16 left-0 right-0 md:top-auto md:left-auto md:right-auto bg-black md:bg-transparent border-b md:border-b-0 border-green-500/30 md:border-0 p-4 md:p-0 w-full md:w-auto z-40`}>
              {user && (
                <button onClick={() => { setCurrentPage('mymatches'); loadMyMatches(); setMobileMenuOpen(false); }} className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase w-full md:w-auto text-left md:text-center py-2 md:py-0 block">
                  MY MATCHES
                </button>
              )}
              <button onClick={() => { setCurrentPage('about'); setMobileMenuOpen(false); }} className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase w-full md:w-auto text-left md:text-center py-2 md:py-0 block">
                ABOUT
              </button>
              <button onClick={() => { setCurrentPage('support'); setMobileMenuOpen(false); }} className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase w-full md:w-auto text-left md:text-center py-2 md:py-0 block">
                Support this project
              </button>
              {user ? (
                <button onClick={() => { signOut(); setMobileMenuOpen(false); }} className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase inline-flex items-center gap-2 py-2 md:py-0 block">
                  <LogOut size={16} />
                  SIGN OUT
                </button>
              ) : (
                <button onClick={() => { setShowAuthModal(true); setMobileMenuOpen(false); }} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-bold rounded-lg transition-colors text-sm uppercase block">
                  SIGN IN
                </button>
              )}
            </nav>
          </div>
        </header>

        <main>
          <section className="relative py-20" aria-label="Hero">
            <div className="container mx-auto px-4 text-center">
              <div className="inline-block mb-6">
                <span className="px-4 py-2 border-2 border-green-500 rounded-full text-green-500 text-xs font-bold uppercase tracking-wider">
                  Play • Connect • Win
                </span>
              </div>

              <div className="mb-4 flex justify-center">
                <img src={logo01} alt="TIMAP" className="h-90" />
              </div>

              <div className="w-32 h-1 bg-gradient-to-r from-green-500 via-orange-500 to-green-500 mx-auto mb-2" aria-hidden="true" />

              <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                Find players. Create matches. Dominate the field.
              </p>

              <div className="flex gap-4 flex-wrap justify-center">
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="text-lg px-8 py-4 inline-flex items-center gap-2"
                >
                  <Plus size={20} />
                  Create Match
                </Button>
                {user && (
                  <button
                    onClick={() => { setCurrentPage('mymatches'); loadMyMatches(); }}
                    className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-all duration-200 inline-flex items-center gap-2 text-lg"
                  >
                    <ClipboardList size={20} />
                    See My Matches
                  </button>
                )}
              </div>

              <div className="flex items-center justify-center gap-12 mt-12">
                <div>
                  <div className="text-4xl font-black text-green-500">{activeMatchCount}</div>
                  <div className="text-sm text-gray-400 uppercase tracking-wide">Active Matches</div>
                </div>
                <div>
                  <div className="text-4xl font-black text-orange-500">{totalPlayerCount}</div>
                  <div className="text-sm text-gray-400 uppercase tracking-wide">Total Players</div>
                </div>
              </div>
            </div>
          </section>

          <section className="relative py-12 hidden" aria-label="Features">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-green-500/50 transition-all duration-300">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4">
                    <Target className="text-black" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">QUICK SETUP</h3>
                  <p className="text-gray-400 text-sm">Create your match in under 30 seconds</p>
                </div>

                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-orange-500/50 transition-all duration-300">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-4">
                    <Share2 className="text-black" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">INSTANT SHARE</h3>
                  <p className="text-gray-400 text-sm">One-click link sharing with your squad</p>
                </div>

                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-green-500/50 transition-all duration-300">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4">
                    <Zap className="text-black" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">JOIN & PLAY</h3>
                  <p className="text-gray-400 text-sm">Jump into action with one tap</p>
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 bg-gradient-to-b from-black to-gray-900" aria-label="Live matches">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Zap className="text-green-500" size={32} />
                  <h2 className="text-3xl font-black text-white">LIVE MATCHES</h2>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
                  <span className="text-green-500 text-sm font-bold uppercase">
                    {activeMatchCount} Active
                  </span>
                </div>
              </div>

              <p className="text-gray-400 mb-8">Join the action happening right now</p>

              <SearchFilters
                selectedCity={selectedCity}
                selectedDistance={selectedDistance}
                selectedSport={selectedSport}
                onCityChange={setSelectedCity}
                onDistanceChange={setSelectedDistance}
                onSportChange={setSelectedSport}
                matchCount={filteredMatches.length}
              />

              {loading ? (
                <div className="text-center py-12" role="status">
                  <div className="inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                  <span className="sr-only">Loading matches...</span>
                </div>
              ) : matches.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No active matches. Be the first to create one!</p>
                </div>
              ) : filteredMatches.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No matches found with your current filters. Try adjusting your search.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMatches.map((match) => (
                    <MatchCard key={match.id} match={match} onJoinClick={handleMatchClick} currentUserId={userId} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>

        <CreateMatchModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateMatch}
        />

        <MatchDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedMatch(null);
          }}
          match={selectedMatch}
          onJoin={handleJoinMatch}
          onAddPlayer={handleAddPlayer}
          onUpdate={handleUpdateMatch}
          onDelete={handleDeleteMatch}
          currentUserName={userName}
          currentUserId={userId}
        />

        <MatchCreatedModal
          isOpen={showCreatedModal}
          onClose={() => {
            setShowCreatedModal(false);
            setCreatedMatch(null);
          }}
          match={createdMatch}
        />

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>

      <Footer />
      <InstallPrompt />
    </div>
  );
}

export default App;
