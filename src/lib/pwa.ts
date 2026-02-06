import { saveSubscription, removeSubscription } from './notifications';
import { getUserId } from './storage';

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let isInstalled = false;

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type InstallPromptListener = (available: boolean) => void;
const listeners: InstallPromptListener[] = [];

function notifyListeners(available: boolean) {
  listeners.forEach((fn) => fn(available));
}

export function onInstallPromptChange(fn: InstallPromptListener): () => void {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export function getIsInstalled(): boolean {
  return isInstalled || window.matchMedia('(display-mode: standalone)').matches;
}

export function getInstallPromptAvailable(): boolean {
  return deferredPrompt !== null && !getIsInstalled();
}

export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) return false;

  try {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    notifyListeners(false);
    return outcome === 'accepted';
  } catch {
    return false;
  }
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!('Notification' in window)) return 'unsupported';
  const result = await Notification.requestPermission();
  return result;
}

export async function subscribeToPush(vapidPublicKey: string): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const existing = await registration.pushManager.getSubscription();
    if (existing) return true;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    const json = subscription.toJSON();
    await saveSubscription(getUserId(), {
      endpoint: subscription.endpoint,
      p256dh: json.keys?.p256dh || '',
      auth: json.keys?.auth || '',
    });

    return true;
  } catch {
    return false;
  }
}

export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return true;

    await subscription.unsubscribe();
    await removeSubscription(subscription.endpoint);
    return true;
  } catch {
    return false;
  }
}

export async function showLocalNotification(
  title: string,
  body: string,
  url?: string
): Promise<void> {
  if (getNotificationPermission() !== 'granted') return;

  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification(title, {
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: { url: url || '/' },
  } as NotificationOptions);
}

export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    notifyListeners(true);
  });

  window.addEventListener('appinstalled', () => {
    isInstalled = true;
    deferredPrompt = null;
    notifyListeners(false);
  });

  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    arr[i] = raw.charCodeAt(i);
  }
  return arr;
}
