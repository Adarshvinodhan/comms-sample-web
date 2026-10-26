import { Avatar, DmInbox, useComms, type Conversation } from '@sminfotech/comms-react';
import type { DemoUser } from '../types';

interface Props {
  user: DemoUser;
  demoUsers: DemoUser[];
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onOpenWith: (user: DemoUser) => void;
  onLogout: () => void;
}

export function Sidebar({ user, demoUsers, conversations, activeId, onSelect, onOpenWith, onLogout }: Props) {
  const { connected } = useComms();
  const others = demoUsers.filter((u) => u.id !== user.id);

  return (
    <aside className="sidebar">
      <header className="me">
        <Avatar name={user.name} color={user.color} />
        <div className="me-info">
          <strong>{user.name}</strong>
          <span className="muted small">
            {user.orgName} · <span className={connected ? 'ok' : 'warn'}>{connected ? 'connected' : 'connecting…'}</span>
          </span>
        </div>
        <button className="ghost small" onClick={onLogout}>
          Switch
        </button>
      </header>

      <section>
        <h4>Start a DM</h4>
        <div className="contacts">
          {others.map((u) => (
            <button
              key={u.id}
              className={`contact ${u.orgId !== user.orgId ? 'other-org' : ''}`}
              title={u.orgId !== user.orgId ? `${u.orgName}: the app will block this DM` : `Message ${u.name}`}
              onClick={() => onOpenWith(u)}
            >
              <Avatar name={u.name} color={u.color} size={28} />
              <span>
                {u.name}
                {u.orgId !== user.orgId && <em className="muted small"> · {u.orgName}</em>}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h4>Inbox</h4>
        <DmInbox conversations={conversations} activeId={activeId} onSelect={(c) => onSelect(c.id)} />
      </section>
    </aside>
  );
}
