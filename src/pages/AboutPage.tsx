import { ArrowLeft, Users, Share2, Zap, MapPin } from 'lucide-react';
import { Footer } from '../components/Footer';

interface AboutPageProps {
  onBack: () => void;
}

export function AboutPage({ onBack }: AboutPageProps) {
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
          </div>
        </header>

        <section className="relative py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="space-y-12">
              <div>
                <h2 className="text-4xl font-black text-green-500 mb-6">What is TIMAP?</h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  TIMAP is your go-to platform for finding, creating, and joining sports matches. Whether you're looking to play football, volleyball, basketball, or any other sport, TIMAP connects you with players in your area and makes organizing matches effortless.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-black text-orange-500 mb-8">How It Works</h2>
                <div className="space-y-6">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-black font-bold">
                        1
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Create a Match</h3>
                      <p className="text-gray-400">
                        Click "Create Match" and fill in the details: sport type, date, time, location, number of players needed, and optional captain name or price per person.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-black font-bold">
                        2
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Share Instantly</h3>
                      <p className="text-gray-400">
                        Get a shareable link with one click. Your match card opens automatically when someone clicks the link—no codes or searches needed.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-black font-bold">
                        3
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Players Join</h3>
                      <p className="text-gray-400">
                        Players see your match, enter their name, and join instantly. Watch the participant count update in real-time as your squad builds up.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-black font-bold">
                        4
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Play & Win</h3>
                      <p className="text-gray-400">
                        Once your match is full, head to the field and dominate! TIMAP handles the organizing—you handle the game.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-black text-green-500 mb-8">Why TIMAP?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                    <Users className="text-green-500 mb-4" size={32} />
                    <h3 className="text-lg font-bold text-white mb-2">Find Your Squad</h3>
                    <p className="text-gray-400 text-sm">
                      Connect with local players and build your dream team in minutes.
                    </p>
                  </div>

                  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                    <Share2 className="text-orange-500 mb-4" size={32} />
                    <h3 className="text-lg font-bold text-white mb-2">One-Click Sharing</h3>
                    <p className="text-gray-400 text-sm">
                      Share matches with a direct link. No complex codes or manual searching.
                    </p>
                  </div>

                  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                    <Zap className="text-green-500 mb-4" size={32} />
                    <h3 className="text-lg font-bold text-white mb-2">Real-Time Updates</h3>
                    <p className="text-gray-400 text-sm">
                      See live updates as players join your match. Stay informed every step of the way.
                    </p>
                  </div>

                  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                    <MapPin className="text-orange-500 mb-4" size={32} />
                    <h3 className="text-lg font-bold text-white mb-2">Know Your Location</h3>
                    <p className="text-gray-400 text-sm">
                      Set custom locations so players know exactly where to meet.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-8">
                <p className="text-gray-300 text-lg leading-relaxed">
                  TIMAP simplifies sports match organizing. Stop wasting time coordinating—start playing. Create a match, share it, and get your squad together in seconds.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
