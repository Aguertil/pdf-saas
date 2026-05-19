import { type FormEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import type { DocumentItem, User } from '../api';
import { editText, getMe, listDocuments, ocrPage } from '../api';

export function Editor() {
  const { id } = useParams();
  const docId = Number(id);
  const [user, setUser] = useState<User | null>(null);
  const [doc, setDoc] = useState<DocumentItem | null>(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [page, setPage] = useState(0);
  const [oldText, setOldText] = useState('');
  const [newText, setNewText] = useState('');
  const [ocrResult, setOcrResult] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      const u = await getMe();
      setUser(u);
      const docs = await listDocuments();
      const found = docs.find((d) => d.id === docId);
      if (!found) return;
      setDoc(found);
      const res = await fetch(`/api/pdfs/${docId}/file`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const blob = await res.blob();
      setPdfUrl(URL.createObjectURL(blob));
    })();
  }, [docId]);

  async function onEdit(e: FormEvent) {
    e.preventDefault();
    setMsg('');
    try {
      await editText(docId, page, oldText, newText);
      setMsg('Texte modifié — police et taille préservées.');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Erreur');
    }
  }

  async function runOcr() {
    setMsg('');
    try {
      const r = await ocrPage(docId, page);
      setOcrResult(`${r.source}: ${r.text}`);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'OCR échoué');
    }
  }

  const fonts = doc?.font_metadata?.pages?.[page]?.fonts ?? [];

  return (
    <AppShell user={user}>
      <h1 style={{ marginBottom: '1rem' }}>{doc?.original_filename ?? 'Éditeur'}</h1>
      <div className="grid-2">
        <div className="card" style={{ minHeight: 480 }}>
          {pdfUrl ? (
            <iframe title="PDF" src={pdfUrl} style={{ width: '100%', height: 460, border: 'none', borderRadius: 8 }} />
          ) : (
            <p>Chargement PDF…</p>
          )}
        </div>
        <div>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3>Polices détectées (page {page + 1})</h3>
            <ul style={{ marginTop: '0.5rem', color: 'var(--muted)' }}>
              {fonts.length ? fonts.map((f, i) => (
                <li key={i}>{f.font} — {f.size} pt</li>
              )) : <li>Aucune police détectée</li>}
            </ul>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: '0.75rem' }}>Modifier le texte</h3>
            <form onSubmit={onEdit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label>Page (0-index)<input className="input" type="number" min={0} value={page} onChange={(e) => setPage(Number(e.target.value))} /></label>
              <input className="input" placeholder="Texte à remplacer" value={oldText} onChange={(e) => setOldText(e.target.value)} required />
              <input className="input" placeholder="Nouveau texte" value={newText} onChange={(e) => setNewText(e.target.value)} required />
              <button className="btn btn-primary" type="submit">Appliquer</button>
            </form>
            <button className="btn btn-ghost" style={{ marginTop: '0.75rem', width: '100%' }} type="button" onClick={runOcr}>
              OCR page (Hugging Face)
            </button>
            {msg && <p style={{ marginTop: '0.75rem', color: 'var(--success)' }}>{msg}</p>}
            {ocrResult && <pre style={{ marginTop: '0.75rem', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>{ocrResult}</pre>}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
