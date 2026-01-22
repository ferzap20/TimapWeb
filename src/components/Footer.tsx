import { useState } from 'react';
import { PrivacyModal } from './PrivacyModal';
import { MyDataModal } from './MyDataModal';
import { ContactModal } from './ContactModal';

export function Footer() {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showMyDataModal, setShowMyDataModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  return (
    <>
      <footer className="bg-gray-950 border-t border-gray-800 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-sm text-gray-400">
              <span className="font-bold text-white">TIMAP</span> — Find and join local sports matches.
            </div>

            <nav className="flex flex-wrap gap-4 md:gap-6 text-sm">
              <button
                onClick={() => setShowPrivacyModal(true)}
                className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-950 rounded"
                aria-label="Privacy information"
              >
                Privacy
              </button>
              <button
                onClick={() => setShowMyDataModal(true)}
                className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-950 rounded"
                aria-label="My data"
              >
                My data
              </button>
              <button
                onClick={() => setShowContactModal(true)}
                className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-950 rounded"
                aria-label="Contact"
              >
                Contact
              </button>
            </nav>
          </div>
        </div>
      </footer>

      <PrivacyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
      <MyDataModal isOpen={showMyDataModal} onClose={() => setShowMyDataModal(false)} />
      <ContactModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} />
    </>
  );
}
