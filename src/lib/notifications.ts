import { supabase } from './supabase';

export interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export async function saveSubscription(
  userId: string,
  subscription: PushSubscriptionData
): Promise<void> {
  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
    { onConflict: 'endpoint' }
  );

  if (error) throw error;
}

export async function removeSubscription(endpoint: string): Promise<void> {
  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint);

  if (error) throw error;
}

export const NOTIFICATION_TYPES = {
  MATCH_JOINED: 'match_joined',
  MATCH_UPDATED: 'match_updated',
  MATCH_REMINDER: 'match_reminder',
  MATCH_FULL: 'match_full',
} as const;

export function buildNotificationPayload(
  type: string,
  matchTitle: string,
  matchId?: string
): { title: string; body: string; url: string } {
  const url = matchId ? `/?match=${matchId}` : '/';

  switch (type) {
    case NOTIFICATION_TYPES.MATCH_JOINED:
      return {
        title: 'New Player Joined!',
        body: `Someone just joined "${matchTitle}"`,
        url,
      };
    case NOTIFICATION_TYPES.MATCH_UPDATED:
      return {
        title: 'Match Updated',
        body: `"${matchTitle}" has been updated`,
        url,
      };
    case NOTIFICATION_TYPES.MATCH_REMINDER:
      return {
        title: 'Match Starting Soon',
        body: `"${matchTitle}" is starting soon. Get ready!`,
        url,
      };
    case NOTIFICATION_TYPES.MATCH_FULL:
      return {
        title: 'Match Full!',
        body: `"${matchTitle}" is now full. All spots taken!`,
        url,
      };
    default:
      return { title: 'TIMAP', body: matchTitle, url };
  }
}

export async function triggerPushNotification(
  matchId: string,
  type: string,
  matchTitle: string
): Promise<void> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const payload = buildNotificationPayload(type, matchTitle, matchId);

  try {
    await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ matchId, ...payload }),
    });
  } catch {
    // Push delivery is best-effort
  }
}
