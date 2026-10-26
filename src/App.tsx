import { CommsProvider, type CommsUser, type Notice } from '@sminfotech/comms-react';
import { useCallback, useEffect, useState } from 'react';
import { appApi } from './api';
import { Login } from './components/Login';
import { Workspace } from './components/Workspace';
import type { DemoUser, Session } from './types';

const STORAGE_KEY = 'comms-sample-user';

interface Toast extends Notice {
  id: number;
}

export function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [restoring, setRestoring] = useState(true);
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((n: Notice) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { ...n, id }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const avatarColor = useCallback(
    (u: Pick<CommsUser, 'externalUserId'>) => demoUsers.find((d) => d.id === u.externalUserId)?.color,
    [demoUsers],
  );

  useEffect(() => {
    appApi.users().then(setDemoUsers).catch(() => {});
    // sessionStorage (not localStorage) so two tabs can be signed in as different users.
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return setRestoring(false);
    appApi
      .session(saved)
      .then(setSession)
      .catch(() => sessionStorage.removeItem(STORAGE_KEY))
      .finally(() => setRestoring(false));
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  let content;
  if (restoring) {
    content = <div className="center muted">Loading…</div>;
  } else if (!session) {
    content = (
      <Login
        onLogin={(s) => {
          sessionStorage.setItem(STORAGE_KEY, s.user.id);
          setSession(s);
        }}
      />
    );
  } else {
    const userId = session.user.id;
    content = (
      <CommsProvider
        key={userId}
        initialSession={session.comms}
        getSession={() => appApi.session(userId).then((s) => s.comms)}
        onNotice={notify}
        avatarColor={avatarColor}
        fallback={<div className="center muted">Connecting…</div>}
      >
        <Workspace user={session.user} demoUsers={demoUsers} onLogout={logout} notify={notify} />
      </CommsProvider>
    );
  }

  return (
    <>
      {content}
      <div className="toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.kind}`}>
            {t.text}
          </div>
        ))}
      </div>
    </>
  );
}
