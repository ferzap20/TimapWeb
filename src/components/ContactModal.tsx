import { Modal } from './Modal';
import { Mail } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Contact">
      <div className="space-y-4 text-gray-300">
        <p>Questions about this site or your data?</p>

        <div className="flex items-center gap-3 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
          <Mail className="text-green-500" size={24} />
          <div>
            <p className="text-sm text-gray-400">Contact us at:</p>
            <p className="text-white font-semibold">support@timap.live</p>
          </div>
        </div>

        <p className="text-sm text-gray-400">
          We typically respond within 24-48 hours.
        </p>
      </div>
    </Modal>
  );
}
