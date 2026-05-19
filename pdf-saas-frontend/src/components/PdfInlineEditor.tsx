import { useCallback, useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { editText } from '../api';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export interface TextBlock {
  text: string;
  font: string;
  size: number;
  bbox: [number, number, number, number];
}

interface Props {
  docId: number;
  pdfBlob: Blob;
  pageIndex: number;
  textBlocks: TextBlock[];
  onSaved: () => void;
}

export function PdfInlineEditor({ docId, pdfBlob, pageIndex, textBlocks, onSaved }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [pageSize, setPageSize] = useState({ w: 0, h: 0 });
  const [editing, setEditing] = useState<{ block: TextBlock; value: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [hint, setHint] = useState('Double-cliquez sur un texte pour le modifier');

  const renderPage = useCallback(async () => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const data = await pdfBlob.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    const page = await pdf.getPage(pageIndex + 1);
    const baseViewport = page.getViewport({ scale: 1 });
    const maxW = wrap.clientWidth || 700;
    const s = Math.min(maxW / baseViewport.width, 2);
    const viewport = page.getViewport({ scale: s });

    setScale(s);
    setPageSize({ w: viewport.width, h: viewport.height });

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise;
  }, [pdfBlob, pageIndex]);

  useEffect(() => {
    renderPage();
    const ro = new ResizeObserver(() => renderPage());
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [renderPage]);

  async function saveEdit() {
    if (!editing) return;
    const { block, value } = editing;
    if (value.trim() === block.text.trim()) {
      setEditing(null);
      return;
    }
    setSaving(true);
    setHint('');
    try {
      await editText(docId, pageIndex, block.text, value, block.bbox);
      setEditing(null);
      setHint('Enregistré — rechargement…');
      onSaved();
    } catch (e) {
      setHint(e instanceof Error ? e.message : 'Erreur de sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pdf-inline-editor">
      <p className="pdf-edit-hint">{saving ? 'Enregistrement…' : hint}</p>
      <div ref={wrapRef} className="pdf-canvas-wrap">
        <canvas ref={canvasRef} className="pdf-canvas" />
        <div
          className="pdf-text-layer"
          style={{ width: pageSize.w, height: pageSize.h }}
        >
          {textBlocks.map((block, i) => {
            const [x0, y0, x1, y1] = block.bbox;
            const left = x0 * scale;
            const top = y0 * scale;
            const width = Math.max((x1 - x0) * scale, 24);
            const height = Math.max((y1 - y0) * scale, 14);
            const isActive =
              editing?.block.text === block.text &&
              editing?.block.bbox.join() === block.bbox.join();

            if (isActive) {
              return (
                <textarea
                  key={i}
                  className="pdf-text-edit-active"
                  style={{
                    left,
                    top,
                    width: Math.max(width, 80),
                    minHeight: height,
                    fontSize: `${block.size * scale * 0.95}px`,
                  }}
                  value={editing.value}
                  autoFocus
                  onChange={(e) => setEditing({ block, value: e.target.value })}
                  onBlur={() => saveEdit()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      saveEdit();
                    }
                    if (e.key === 'Escape') setEditing(null);
                  }}
                />
              );
            }

            return (
              <button
                key={i}
                type="button"
                className="pdf-text-hit"
                style={{
                  left,
                  top,
                  width,
                  height,
                  fontSize: `${block.size * scale * 0.95}px`,
                }}
                title={`Modifier: ${block.text}`}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  setEditing({ block, value: block.text });
                  setHint('Échap = annuler · Entrée = enregistrer');
                }}
              >
                <span className="pdf-text-hit-label">{block.text}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
