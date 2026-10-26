import type { CommsSession } from '@sminfotech/comms-react';

/** The sample app's own user record (from its backend). */
export interface DemoUser {
  id: string;
  name: string;
  orgId: string;
  orgName: string;
  color: string;
}

/** What the sample backend's POST /api/session returns. */
export interface Session {
  user: DemoUser;
  comms: CommsSession;
}

export interface ReceivedWebhook {
  receivedAt: string;
  verified: boolean;
  event: string;
  payload: unknown;
}
