import { useEffect, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { adminStats, adminUsers, getMe, type User } from '../api';

export function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [users, setUsers] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    (async () => {
      const u = await getMe();
      if (!u.is_admin) {
        window.location.href = '/dashboard';
        return;
      }
      setUser(u);
      setStats(await adminStats());
      setUsers(await adminUsers());
    })();
  }, []);

  return (
    <AppShell user={user}>
      <h1 style={{ marginBottom: '1.5rem' }}>Dashboard administrateur</h1>
      {stats && (
        <div className="grid-2" style={{ marginBottom: '2rem' }}>
          <div className="card"><h3>Utilisateurs</h3><p style={{ fontSize: '2rem' }}>{String(stats.total_users)}</p></div>
          <div className="card"><h3>Documents</h3><p style={{ fontSize: '2rem' }}>{String(stats.total_documents)}</p></div>
        </div>
      )}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Utilisateurs</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--muted)' }}>
              <th>Email</th><th>Plan</th><th>PDF/mois</th><th>Actif</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={String(u.id)} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '0.5rem 0' }}>{String(u.email)}</td>
                <td>{String(u.plan)}</td>
                <td>{String(u.pdfs_used_this_month)}</td>
                <td>{u.is_active ? 'Oui' : 'Non'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
