import { Modal } from './Modal';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Privacy & Data Use">
      <div className="space-y-4 text-gray-300">
        <p>This website does not require accounts or passwords.</p>

        <div>
          <p className="mb-2">
            To improve usability, the site stores limited information only in your browser:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>A name or nickname you choose</li>
            <li>Sport, city, or distance preferences</li>
            <li>An anonymous browser-generated identifier</li>
          </ul>
        </div>

        <div>
          <p className="mb-2">This data:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Stays on your device</li>
            <li>Is not sold or shared</li>
            <li>Is not used for cross-site tracking</li>
          </ul>
        </div>

        <p>
          You can remove this data anytime using the &apos;My data&apos; option or by clearing browser storage.
        </p>

        <p>
          Adding a match to your calendar saves the event directly to your calendar provider.
        </p>

        <div className="pt-4 border-t border-gray-700 mt-6">
          <p className="text-sm text-gray-400">
            Contact: <span className="text-gray-300">contact@timap.live</span>
          </p>
        </div>
      </div>
    </Modal>
  );
}
