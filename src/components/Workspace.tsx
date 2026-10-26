import { CallLayer, DmThread, useInbox, type Notice } from '@sminfotech/comms-react';
import { useState } from 'react';
import { appApi } from '../api';
import type { DemoUser } from '../types';
import { SidePanel } from './SidePanel';
import { Sidebar } from './Sidebar';

interface Props {
  user: DemoUser;
  demoUsers: DemoUser[];
  onLogout: () => void;
  notify: (n: Notice) => void;
}

export function Workspace({ user, demoUsers, onLogout, notify }: Props) {
  const { conversations, reload } = useInbox();
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = conversations.find((c) => c.id === activeId) ?? null;

  /** The app decides who may talk to whom, then asks comms (via its backend) to open the DM. */
  async function openWith(other: DemoUser) {
    try {
      const { conversationId } = await appApi.openConversation(user.id, other.id);
      await reload();
      setActiveId(conversationId);
    } catch (e) {
      notify({ kind: 'error', text: (e as Error).message });
    }
  }

  return (
    <div className={`workspace ${active ? 'has-active' : ''}`}>
      <Sidebar
        user={user}
        demoUsers={demoUsers}
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onOpenWith={openWith}
        onLogout={onLogout}
      />
      <main className="main">
        {active ? (
          <>
            <button className="ghost small mobile-back" onClick={() => setActiveId(null)}>
              ← Inbox
            </button>
            <DmThread
              key={active.id}
              conversation={active}
              headerExtra={typeof active.metadata.orgId === 'string' && <> · org: {active.metadata.orgId}</>}
            />
          </>
        ) : (
          <div className="center muted">Select a conversation, or start one from the list on the left.</div>
        )}
      </main>
      <SidePanel user={user} onLoggedOut={onLogout} />
      <CallLayer />
    </div>
  );
}
