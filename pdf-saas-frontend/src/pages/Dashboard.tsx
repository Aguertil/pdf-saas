import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import type { DocumentItem, User } from '../api';
import { getMe, listDocuments, uploadPdf } from '../api';

export function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const u = await getMe();
        setUser(u);
        setDocs(await listDocuments());
      } catch {
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      const doc = await uploadPdf(file);
      setDocs((d) => [doc, ...d]);
      const u = await getMe();
      setUser(u);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur upload');
    }
  }

  if (loading) return <AppShell><p>Chargement…</p></AppShell>;

  return (
    <AppShell user={user}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Mes documents</h1>
        <label className="btn btn-primary">
          Importer un PDF
          <input type="file" accept="application/pdf" hidden onChange={onUpload} />
        </label>
      </div>
      {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>}
      {docs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>Aucun PDF. Importez votre premier document.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {docs.map((d) => (
            <div key={d.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{d.original_filename}</strong>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{d.page_count} pages</p>
              </div>
              <Link to={`/editor/${d.id}`} className="btn btn-primary">Éditer</Link>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
