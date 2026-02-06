import { useState, useEffect, useCallback } from 'react';
import { Download, Bell, X } from 'lucide-react';
import {
  getInstallPromptAvailable,
  getIsInstalled,
  getNotificationPermission,
  onInstallPromptChange,
  promptInstall,
  requestNotificationPermission,
  subscribeToPush,
} from '../lib/pwa';

const DISMISSED_KEY = 'timap_install_dismissed';
const SHOW_DELAY = 5000;

export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [installAvailable, setInstallAvailable] = useState(getInstallPromptAvailable());
  const [notifPermission, setNotifPermission] = useState(getNotificationPermission());
  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    const wasDismissed = localStorage.getItem(DISMISSED_KEY);
    if (wasDismissed) return;

    const unsubscribe = onInstallPromptChange((available) => {
      setInstallAvailable(available);
    });

    const timer = setTimeout(() => {
      const installed = getIsInstalled();
      const permission = getNotificationPermission();
      setNotifPermission(permission);

      if (!installed || permission !== 'granted') {
        setVisible(true);
      }
    }, SHOW_DELAY);

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const dismiss = useCallback(() => {
    setAnimateOut(true);
    setTimeout(() => {
      setVisible(false);
      localStorage.setItem(DISMISSED_KEY, '1');
    }, 300);
  }, []);

  const handleInstall = useCallback(async () => {
    const accepted = await promptInstall();
    if (accepted) dismiss();
  }, [dismiss]);

  const handleEnableNotifications = useCallback(async () => {
    const result = await requestNotificationPermission();
    setNotifPermission(result);

    if (result === 'granted') {
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (vapidKey) {
        await subscribeToPush(vapidKey);
      }
    }
  }, []);

  if (!visible) return null;

  const showInstall = installAvailable;
  const showNotif = notifPermission !== 'granted' && notifPermission !== 'unsupported';

  if (!showInstall && !showNotif) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 p-4 transition-all duration-300 ${
        animateOut ? 'translate-y-full opacity-0' : 'animate-slideUp'
      }`}
    >
      <div className="max-w-lg mx-auto bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Get the full experience
          </span>
          <button
            onClick={dismiss}
            className="p-1 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-4 pb-4 space-y-3">
          {showInstall && (
            <button
              onClick={handleInstall}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center shrink-0">
                <Download size={20} className="text-black" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white group-hover:text-green-400 transition-colors">
                  Install TIMAP
                </p>
                <p className="text-xs text-gray-400">
                  Add to your home screen for quick access
                </p>
              </div>
            </button>
          )}

          {showNotif && (
            <button
              onClick={handleEnableNotifications}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center shrink-0">
                <Bell size={20} className="text-black" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                  Enable Notifications
                </p>
                <p className="text-xs text-gray-400">
                  Get alerts when players join your matches
                </p>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
