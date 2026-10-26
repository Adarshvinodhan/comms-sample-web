import { Avatar } from '@sminfotech/comms-react';
import { useEffect, useState } from 'react';
import { appApi } from '../api';
import type { DemoUser, Session } from '../types';

export function Login({ onLogin }: { onLogin: (s: Session) => void }) {
  const [users, setUsers] = useState<DemoUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    appApi.users().then(setUsers).catch((e) => setError(String(e.message ?? e)));
  }, []);

  const orgs = [...new Set(users.map((u) => u.orgName))];

  async function pick(user: DemoUser) {
    setBusy(user.id);
    setError(null);
    try {
      onLogin(await appApi.session(user.id));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="login">
      <div className="login-card">
        <h1>Comms sample app</h1>
        <p className="muted">
          Pick a demo user. Open a second browser tab (or a private window) as someone else in the same organization to
          test DMs and calls between them.
        </p>
        {orgs.map((org) => (
          <section key={org}>
            <h3>{org}</h3>
            <div className="login-users">
              {users
                .filter((u) => u.orgName === org)
                .map((u) => (
                  <button key={u.id} className="login-user" disabled={busy !== null} onClick={() => pick(u)}>
                    <Avatar name={u.name} color={u.color} />
                    <span>{busy === u.id ? 'Signing in…' : u.name}</span>
                  </button>
                ))}
            </div>
          </section>
        ))}
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
