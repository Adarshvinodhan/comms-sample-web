import type { DemoUser, ReceivedWebhook, Session } from './types';

/** Calls to the sample app's own backend. Everything comms-related in the browser goes through @sminfotech/comms-react. */

/** Empty means same origin (the Vite dev proxy, or a reverse proxy routing /api to the backend). */
const API_URL = "https://sample-backend-rndn.onrender.com" 

function api(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${API_URL}${path}`, init);
}

async function parse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.error?.message ?? res.statusText);
  return data as T;
}

export const appApi = {
  async users(): Promise<DemoUser[]> {
    return (await parse<{ users: DemoUser[] }>(await api('/api/users'))).users;
  },
  async session(userId: string): Promise<Session> {
    return parse(await api('/api/session', { method: 'POST', headers: { 'x-demo-user': userId } }));
  },
  async openConversation(userId: string, otherUserId: string): Promise<{ conversationId: string }> {
    return parse(
      await api('/api/conversations', {
        method: 'POST',
        headers: { 'x-demo-user': userId, 'content-type': 'application/json' },
        body: JSON.stringify({ otherUserId }),
      }),
    );
  },
  async exportMyData(userId: string): Promise<unknown> {
    return parse(await api('/api/me/export', { headers: { 'x-demo-user': userId } }));
  },
  async deleteMyData(userId: string): Promise<unknown> {
    return parse(await api('/api/me/comms-data', { method: 'DELETE', headers: { 'x-demo-user': userId } }));
  },
  async webhookEvents(): Promise<ReceivedWebhook[]> {
    return (await parse<{ events: ReceivedWebhook[] }>(await api('/api/webhook-events'))).events;
  },
};
