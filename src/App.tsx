/**
 * Main App Component
 *
 * Root component that manages the entire application state and UI.
 * Handles match creation, listing, joining, and real-time updates.
 */

import { useState, useEffect } from 'react';
import { Target, Share2, Zap, Plus } from 'lucide-react';
import { CreateMatchModal } from './components/CreateMatchModal';
import { MatchDetailsModal } from './components/MatchDetailsModal';
import { MatchCreatedModal } from './components/MatchCreatedModal';
import { MatchCard } from './components/MatchCard';
import { Button } from './components/Button';
import { Footer } from './components/Footer';
import { AboutPage } from './pages/AboutPage';
import { SupportPage } from './pages/SupportPage';
import logoAlone from './Images/logo_alone.png';
import logo01 from './Images/logo01.png';
import { Match, MatchWithCount, CreateMatchData } from './types/database';
import { getUserInfo, setUserName as saveUserName } from './lib/storage';
import {
  createMatch,
  getMatches,
  getMatchById,
  getMatchByInviteCode,
  joinMatch,
  hasJoinedMatch,
  getActiveMatchCount,
  getOnlinePlayerCount,
  updateMatch,
  deleteMatch
} from './lib/api';
import { supabase } from './lib/supabase';

function App() {
  const [matches, setMatches] = useState<MatchWithCount[]>([]);
  const [activeMatchCount, setActiveMatchCount] = useState(3);
  const [onlinePlayerCount, setOnlinePlayerCount] = useState(16);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreatedModal, setShowCreatedModal] = useState(false);

  const [selectedMatch, setSelectedMatch] = useState<MatchWithCount | null>(null);
  const [createdMatch, setCreatedMatch] = useState<Match | null>(null);
  const [hasJoined, setHasJoined] = useState(false);

  const [currentPage, setCurrentPage] = useState<'home' | 'about' | 'support'>('home');

  const userInfo = getUserInfo();

  useEffect(() => {
    loadMatches();
    loadStats();

    const urlParams = new URLSearchParams(window.location.search);
    const inviteCode = urlParams.get('match');
    if (inviteCode) {
      handleInviteLink(inviteCode);
    }

    const matchesSubscription = supabase
      .channel('matches_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => {
        loadMatches();
        loadStats();
      })
      .subscribe();

    const participantsSubscription = supabase
      .channel('participants_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, () => {
        loadMatches();
        loadStats();
        if (selectedMatch) {
          refreshSelectedMatch();
        }
      })
      .subscribe();

    return () => {
      matchesSubscription.unsubscribe();
      participantsSubscription.unsubscribe();
    };
  }, []);

  const loadMatches = async () => {
    try {
      const data = await getMatches();
      setMatches(data);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const [matchCount, playerCount] = await Promise.all([
        getActiveMatchCount(),
        getOnlinePlayerCount()
      ]);
      setActiveMatchCount(matchCount);
      setOnlinePlayerCount(playerCount);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const refreshSelectedMatch = async () => {
    if (!selectedMatch) return;
    try {
      const updated = await getMatchById(selectedMatch.id);
      if (updated) {
        setSelectedMatch(updated);
        const joined = await hasJoinedMatch(updated.id, userInfo.id);
        setHasJoined(joined);
      }
    } catch (error) {
      console.error('Error refreshing match:', error);
    }
  };

  const handleInviteLink = async (inviteCode: string) => {
    try {
      const match = await getMatchByInviteCode(inviteCode);
      if (match) {
        setSelectedMatch(match);
        const joined = await hasJoinedMatch(match.id, userInfo.id);
        setHasJoined(joined);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error loading match from invite:', error);
    }
  };

  const handleCreateMatch = async (data: CreateMatchData) => {
    try {
      const match = await createMatch(data, userInfo.id, userInfo.name);
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
        const joined = await hasJoinedMatch(match.id, userInfo.id);
        setHasJoined(joined);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error loading match details:', error);
    }
  };

  const handleJoinMatch = async (matchId: string, userName: string) => {
    try {
      if (userName && userName !== userInfo.name) {
        saveUserName(userName);
      }
      await joinMatch(matchId, userInfo.id, userName);
      setHasJoined(true);
      await refreshSelectedMatch();
      await loadMatches();
      await loadStats();
    } catch (error) {
      console.error('Error joining match:', error);
      throw error;
    }
  };

  const handleUpdateMatch = async (matchId: string, updates: any) => {
    try {
      await updateMatch(matchId, updates);
      await refreshSelectedMatch();
      await loadMatches();
      await loadStats();
    } catch (error) {
      console.error('Error updating match:', error);
      throw error;
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    try {
      await deleteMatch(matchId);
      setShowDetailsModal(false);
      setSelectedMatch(null);
      await loadMatches();
      await loadStats();
    } catch (error) {
      console.error('Error deleting match:', error);
      throw error;
    }
  };

  if (currentPage === 'about') {
    return <AboutPage onBack={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'support') {
    return <SupportPage onBack={() => setCurrentPage('home')} />;
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 to-transparent" />

        <header className="relative border-b border-green-500/30">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={logoAlone} alt="TIMAP" className="h-5" />
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> </div>
              <span className="px-2 py-0.5 bg-green-500 text-black text-xs font-bold rounded inline-flex items-left gap-1.5">LIVE</span>
           
            <nav className="flex items-center gap-6">
              <button onClick={() => setCurrentPage('about')} className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase">
                ABOUT
              </button>
              <button onClick={() => setCurrentPage('support')} className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase">
                DONATE
              </button>
            </nav>
          </div>
        </header>

        <section className="relative py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 border-2 border-green-500 rounded-full text-green-500 text-xs font-bold uppercase tracking-wider">
                Play • Connect • Win
              </span>
            </div>

            <div className="mb-4 flex justify-center">
              <img src={logo01} alt="TIMAP" className="h-90" />
            </div>
     
            <div className="w-32 h-1 bg-gradient-to-r from-green-500 via-orange-500 to-green-500 mx-auto mb-2" />

            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Find players. Create matches. Dominate the field.
            </p>

            <Button
              onClick={() => setShowCreateModal(true)}
              className="text-lg px-8 py-4 inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Create Match
            </Button>

            <div className="flex items-center justify-center gap-12 mt-12">
              <div>
                <div className="text-4xl font-black text-green-500">{activeMatchCount}</div>
                <div className="text-sm text-gray-400 uppercase tracking-wide">Active Matches</div>
              </div>
              <div>
                <div className="text-4xl font-black text-orange-500">{onlinePlayerCount}</div>
                <div className="text-sm text-gray-400 uppercase tracking-wide">Players Online</div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-12">
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
      </div>

      <section className="py-16 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Zap className="text-green-500" size={32} />
              <h2 className="text-3xl font-black text-white">LIVE MATCHES</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-500 text-sm font-bold uppercase">
                {activeMatchCount} Active
              </span>
            </div>
          </div>

          <p className="text-gray-400 mb-8">Join the action happening right now</p>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No active matches. Be the first to create one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((match) => (
                <MatchCard key={match.id} match={match} onJoinClick={handleMatchClick} currentUserId={userInfo.id} />
              ))}
            </div>
          )}
        </div>
      </section>

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
        onUpdate={handleUpdateMatch}
        onDelete={handleDeleteMatch}
        hasJoined={hasJoined}
        currentUserName={userInfo.name}
        currentUserId={userInfo.id}
      />

      <MatchCreatedModal
        isOpen={showCreatedModal}
        onClose={() => {
          setShowCreatedModal(false);
          setCreatedMatch(null);
        }}
        match={createdMatch}
      />

      <Footer />
    </div>
  );
}

export default App;
