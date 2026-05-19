import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { PdfInlineEditor, type TextBlock } from '../components/PdfInlineEditor';
import type { DocumentItem, User } from '../api';
import { getMe, listDocuments, ocrPage } from '../api';

export function Editor() {
  const { id } = useParams();
  const docId = Number(id);
  const [user, setUser] = useState<User | null>(null);
  const [doc, setDoc] = useState<DocumentItem | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [page, setPage] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [ocrResult, setOcrResult] = useState('');
  const [msg, setMsg] = useState('');

  const loadDoc = useCallback(async () => {
    const u = await getMe();
    setUser(u);
    const docs = await listDocuments();
    const found = docs.find((d) => d.id === docId);
    if (!found) return;
    setDoc(found);
    const res = await fetch(`/api/pdfs/${docId}/file`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    setPdfBlob(await res.blob());
  }, [docId]);

  useEffect(() => {
    loadDoc();
  }, [loadDoc, reloadKey]);

  const pageCount = doc?.page_count ?? 1;
  const blocks: TextBlock[] =
    doc?.font_metadata?.pages?.find((p) => p.page === page)?.text_blocks?.map((b) => ({
      text: b.text,
      font: b.font,
      size: b.size,
      bbox: b.bbox as [number, number, number, number],
    })) ?? [];

  const fonts = doc?.font_metadata?.pages?.[page]?.fonts ?? [];

  async function runOcr() {
    setMsg('');
    try {
      const r = await ocrPage(docId, page);
      setOcrResult(`${r.source}: ${r.text}`);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'OCR échoué');
    }
  }

  return (
    <AppShell user={user}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h1>{doc?.original_filename ?? 'Éditeur'}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={page <= 0}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Page
          </button>
          <span style={{ color: 'var(--muted)' }}>
            {page + 1} / {pageCount}
          </span>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={page >= pageCount - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Page →
          </button>
        </div>
      </div>

      <div className="editor-layout">
        <div className="editor-main card">
          {pdfBlob ? (
            <PdfInlineEditor
              key={`${reloadKey}-${page}`}
              docId={docId}
              pdfBlob={pdfBlob}
              pageIndex={page}
              textBlocks={blocks}
              onSaved={() => setReloadKey((k) => k + 1)}
            />
          ) : (
            <p style={{ padding: '2rem' }}>Chargement du PDF…</p>
          )}
        </div>
        <aside className="editor-sidebar">
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3>Édition directe</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Survolez le PDF : les zones de texte se surlignent. <strong>Double-cliquez</strong> pour modifier sur place.
              <br />
              <strong>Entrée</strong> = enregistrer · <strong>Échap</strong> = annuler
            </p>
          </div>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3>Polices (page {page + 1})</h3>
            <ul style={{ marginTop: '0.5rem', color: 'var(--muted)', fontSize: '0.85rem' }}>
              {fonts.length ? fonts.map((f, i) => (
                <li key={i}>{f.font} — {f.size} pt</li>
              )) : <li>Aucune police détectée</li>}
            </ul>
          </div>
          <div className="card">
            <button className="btn btn-ghost" style={{ width: '100%' }} type="button" onClick={runOcr}>
              OCR page (Hugging Face)
            </button>
            {msg && <p style={{ marginTop: '0.75rem', color: 'var(--danger)' }}>{msg}</p>}
            {ocrResult && <pre style={{ marginTop: '0.75rem', fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>{ocrResult}</pre>}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
