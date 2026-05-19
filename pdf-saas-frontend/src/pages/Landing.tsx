import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { AppShell } from '../components/AppShell';

export function Landing() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-title', { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out' });
      gsap.from('.hero-sub', { y: 24, opacity: 0, duration: 0.9, delay: 0.15, ease: 'power3.out' });
      gsap.from('.hero-cta', { y: 16, opacity: 0, duration: 0.7, delay: 0.35, ease: 'power2.out' });
      gsap.from('.feature-card', {
        y: 30,
        opacity: 0,
        stagger: 0.12,
        duration: 0.6,
        delay: 0.5,
        ease: 'power2.out',
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const features = [
    { t: 'Fidélité typographique', d: 'Détection automatique des polices et tailles du PDF source.' },
    { t: 'Champs & texte', d: 'Éditez le texte et les formulaires AcroForm en quelques clics.' },
    { t: 'OCR intelligent', d: 'Extraction via Hugging Face (gratuit) ou PyMuPDF en local.' },
    { t: 'Plans flexibles', d: 'De 0 € à 30 €/mois selon votre volume.' },
  ];

  return (
    <AppShell>
      <div ref={heroRef}>
        <section style={{ textAlign: 'center', padding: '4rem 0 3rem' }}>
          <p className="hero-sub" style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: '0.75rem' }}>
            Édition PDF pro dans le navigateur
          </p>
          <h1 className="hero-title" style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', maxWidth: 720, margin: '0 auto 1rem' }}>
            Modifiez vos PDF sans casser les polices
          </h1>
          <p className="hero-sub" style={{ color: 'var(--muted)', maxWidth: 560, margin: '0 auto 2rem', fontSize: '1.1rem' }}>
            PDFMaster analyse chaque document pour respecter tailles et typographies — comme un éditeur desktop, sans installation.
          </p>
          <div className="hero-cta" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary">
              Commencer gratuitement
            </Link>
            <Link to="/pricing" className="btn btn-ghost">
              Voir les tarifs
            </Link>
          </div>
        </section>

        <section className="grid-2" style={{ marginBottom: '3rem' }}>
          {features.map((f) => (
            <div key={f.t} className="card feature-card">
              <h3 style={{ marginBottom: '0.5rem' }}>{f.t}</h3>
              <p style={{ color: 'var(--muted)' }}>{f.d}</p>
            </div>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
