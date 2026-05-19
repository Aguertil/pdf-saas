import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { AppShell } from '../components/AppShell';
import { getMe, getPlans, upgradePlan, type PlanTier, type User } from '../api';

const LABELS: Record<PlanTier, string> = {
  free: 'Gratuit',
  starter: 'Starter',
  pro: 'Pro',
  business: 'Business',
};

export function Pricing() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [plans, setPlans] = useState<Array<{ tier: PlanTier; price_eur: number; limits: Record<string, unknown> }>>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getPlans().then(setPlans).catch(() => {});
    getMe().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    if (!gridRef.current) return;
    gsap.from('.plan-card', { y: 24, opacity: 0, stagger: 0.1, duration: 0.5, ease: 'power2.out' });
  }, [plans]);

  async function select(tier: PlanTier) {
    if (!localStorage.getItem('token')) {
      window.location.href = '/register';
      return;
    }
    await upgradePlan(tier);
    const u = await getMe();
    setUser(u);
    alert(`Plan ${tier} activé (paiement simulé en MVP)`);
  }

  return (
    <AppShell user={user}>
      <h1 style={{ textAlign: 'center', margin: '2rem 0' }}>Tarifs simples, du gratuit au pro</h1>
      <div ref={gridRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {plans.map((p) => (
          <div key={p.tier} className="card plan-card" style={p.tier === 'pro' ? { borderColor: 'var(--accent)' } : {}}>
            <h3>{LABELS[p.tier]}</h3>
            <p style={{ fontSize: '2rem', fontWeight: 700, margin: '0.5rem 0' }}>{p.price_eur} €<span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>/mois</span></p>
            <ul style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1rem', paddingLeft: '1.2rem' }}>
              <li>{String(p.limits.pdfs_per_month)} PDF / mois</li>
              <li>Max {String(p.limits.max_size_mb)} Mo</li>
              <li>OCR {String(p.limits.ocr_pages)} pages</li>
            </ul>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => select(p.tier)}>
              {user?.plan === p.tier ? 'Plan actuel' : 'Choisir'}
            </button>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
