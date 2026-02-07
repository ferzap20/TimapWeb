/**
 * Match Created Success Modal Component
 *
 * Displays success message after match creation with shareable link.
 * Allows users to copy link and share via native share API.
 */

import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Match } from '../types/database';
import { CheckCircle2, Copy, Share2 } from 'lucide-react';

interface MatchCreatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match | null;
}

export function MatchCreatedModal({ isOpen, onClose, match }: MatchCreatedModalProps) {
  const [copied, setCopied] = useState(false);

  if (!match) return null;

  const shareUrl = `${window.location.origin}/?match=${match.invite_code}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: match.title,
          text: `Join my ${match.sport} match!`,
          url: shareUrl
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false}>
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle2 className="text-black" size={32} />
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-2">
            <span className="text-white">MATCH </span>
            <span className="text-green-500">LIVE!</span>
          </h2>
          <p className="text-gray-400">Your match is ready! Share this link to rally your team:</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center gap-3">
          <code className="flex-1 text-sm text-green-400 break-all text-left">{shareUrl}</code>
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title="Copy link"
            aria-label={copied ? "Link copied" : "Copy match link"}
          >
            {copied ? (
              <CheckCircle2 className="text-green-500" size={20} />
            ) : (
              <Copy className="text-gray-400" size={20} />
            )}
          </button>
        </div>

        <div className="flex gap-3">
          {typeof navigator.share === 'function' && (
            <Button
              onClick={handleShare}
              variant="secondary"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Share2 size={18} />
              Share
            </Button>
          )}
          <Button onClick={onClose} variant="primary" className="flex-1">
            Let's Go!
          </Button>
        </div>
      </div>
    </Modal>
  );
}
