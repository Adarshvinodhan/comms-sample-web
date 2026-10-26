import { CallHistory, timeShort } from '@sminfotech/comms-react';
import { useEffect, useState } from 'react';
import { appApi } from '../api';
import type { DemoUser, ReceivedWebhook } from '../types';

type Tab = 'calls' | 'webhooks' | 'data';

function Webhooks() {
  const [events, setEvents] = useState<ReceivedWebhook[]>([]);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    let stop = false;
    const tick = () =>
      appApi
        .webhookEvents()
        .then((e) => !stop && setEvents(e))
        .catch(() => {});
    void tick();
    const t = setInterval(tick, 3000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, []);

  return (
    <div>
      <p className="muted small">
        Events the comms service delivered to this app's backend (<code>POST /webhooks/comms</code>), verified with the
        HMAC signature.
      </p>
      {!events.length && <p className="muted small">Nothing received yet.</p>}
      <ul className="webhook-list">
        {events.map((e, i) => (
          <li key={`${e.receivedAt}-${i}`}>
            <button className="link" onClick={() => setOpen(open === i ? null : i)}>
              <code>{e.event}</code>
            </button>{' '}
            <span className={e.verified ? 'ok small' : 'warn small'}>{e.verified ? '✓ verified' : '✗ bad signature'}</span>{' '}
            <span className="muted small">{timeShort(e.receivedAt)}</span>
            {open === i && <pre>{JSON.stringify(e.payload, null, 2)}</pre>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MyData({ user, onLoggedOut }: { user: DemoUser; onLoggedOut: () => void }) {
  const [exported, setExported] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function doExport() {
    setError(null);
    try {
      setExported(JSON.stringify(await appApi.exportMyData(user.id), null, 2));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function download() {
    if (!exported) return;
    const url = URL.createObjectURL(new Blob([exported], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `comms-export-${user.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function doDelete() {
    if (!confirm('Delete all of your conversations, messages and call history from the comms service?')) return;
    try {
      await appApi.deleteMyData(user.id);
      onLoggedOut();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="my-data">
      <p className="muted small">
        The app's backend calls the comms service with its tenant API key to export or delete this user's data.
      </p>
      <div className="row gap">
        <button onClick={doExport}>Export my data</button>
        <button className="danger" onClick={doDelete}>
          Delete my data
        </button>
      </div>
      {error && <p className="error small">{error}</p>}
      {exported && (
        <>
          <button className="ghost small" onClick={download}>
            Download JSON
          </button>
          <pre>{exported}</pre>
        </>
      )}
    </div>
  );
}

export function SidePanel({ user, onLoggedOut }: { user: DemoUser; onLoggedOut: () => void }) {
  const [tab, setTab] = useState<Tab>('calls');
  return (
    <aside className="side-panel">
      <nav className="tabs">
        <button className={tab === 'calls' ? 'active' : ''} onClick={() => setTab('calls')}>
          Call history
        </button>
        <button className={tab === 'webhooks' ? 'active' : ''} onClick={() => setTab('webhooks')}>
          Webhooks
        </button>
        <button className={tab === 'data' ? 'active' : ''} onClick={() => setTab('data')}>
          My data
        </button>
      </nav>
      <div className="tab-body">
        {tab === 'calls' && <CallHistory />}
        {tab === 'webhooks' && <Webhooks />}
        {tab === 'data' && <MyData user={user} onLoggedOut={onLoggedOut} />}
      </div>
    </aside>
  );
}
