import { ArrowLeft, Heart } from 'lucide-react';
import { Footer } from '../components/Footer';

interface SupportPageProps {
  onBack: () => void;
}

export function SupportPage({ onBack }: SupportPageProps) {

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

        <section className="relative py-20">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="text-center space-y-12">
              <div className="space-y-6">
                <div className="inline-block">
                  <Heart className="text-red-500 animate-pulse" size={64} />
                </div>
                <h2 className="text-4xl font-black text-white">
                  Made with Love and Effort
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed">
                  TIMAP was built with passion to help you find players and organize matches effortlessly. Your support means everything to us and helps keep this platform running and improving.
                </p>
              </div>

              <div className="flex justify-center">
                <a href="https://www.buymeacoffee.com/ferzap" target="_blank" rel="noopener noreferrer">
                  <img
                    src="https://cdn.buymeacoffee.com/buttons/v2/default-green.png"
                    alt="Buy Me A Coffee"
                    className="h-[60px] w-[217px] hover:opacity-80 transition-opacity"
                  />
                </a>
              </div>

              <div className="bg-gradient-to-r from-green-500/10 to-orange-500/10 border border-green-500/30 rounded-lg p-8 space-y-6">
                <p className="text-lg text-gray-300">
                  If you love TIMAP and want to support our mission, please consider making a donation. Every contribution helps us improve the platform and bring new features to our community.
                </p>
              </div>

              <div className="pt-8 border-t border-gray-800">
                <p className="text-gray-400 text-sm">
                  Thank you for being part of the TIMAP community. Together, we're making sports match organizing fun and easy.
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
