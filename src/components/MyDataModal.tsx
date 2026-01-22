import { Modal } from './Modal';
import { Button } from './Button';
import { getUserInfo, clearUserData } from '../lib/storage';
import { Trash2 } from 'lucide-react';

interface MyDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MyDataModal({ isOpen, onClose }: MyDataModalProps) {
  const userInfo = getUserInfo();

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
      clearUserData();
      window.location.reload();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="My Data">
      <div className="space-y-6">
        <div className="space-y-4 text-gray-300">
          <p className="font-semibold text-white">Stored locally:</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>
              Optional name or nickname: {' '}
              <span className="text-green-400 font-mono">
                {userInfo.name || '(not set)'}
              </span>
            </li>
            <li>
              Sport and city preferences: {' '}
              <span className="text-gray-400">(stored when creating matches)</span>
            </li>
            <li>
              Anonymous browser identifier: {' '}
              <span className="text-green-400 font-mono text-xs break-all">
                {userInfo.id}
              </span>
            </li>
          </ul>
        </div>

        <div className="pt-4 border-t border-gray-700">
          <Button
            onClick={handleClearData}
            variant="secondary"
            className="w-full flex items-center justify-center gap-2"
          >
            <Trash2 size={18} />
            Clear my data
          </Button>
          <p className="mt-2 text-xs text-gray-500 text-center">
            This will remove all stored information and reload the page
          </p>
        </div>
      </div>
    </Modal>
  );
}
