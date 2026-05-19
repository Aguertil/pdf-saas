import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { login, register } from '../api';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await register(email, password, fullName || undefined);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  }

  return (
    <AppShell>
      <div className="card" style={{ maxWidth: 400, margin: '2rem auto' }}>
        <h1 style={{ marginBottom: '1rem' }}>Créer un compte</h1>
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input className="input" placeholder="Nom" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="input" type="password" placeholder="Mot de passe (8+ car.)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
          <button className="btn btn-primary" type="submit">S'inscrire</button>
        </form>
        <p style={{ marginTop: '1rem', color: 'var(--muted)' }}>
          Déjà inscrit ? <Link to="/login">Connexion</Link>
        </p>
      </div>
    </AppShell>
  );
}
