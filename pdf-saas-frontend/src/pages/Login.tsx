import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { login } from '../api';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      setError('Identifiants incorrects');
    }
  }

  return (
    <AppShell>
      <div className="card" style={{ maxWidth: 400, margin: '2rem auto' }}>
        <h1 style={{ marginBottom: '1rem' }}>Connexion</h1>
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="input" type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
          <button className="btn btn-primary" type="submit">Se connecter</button>
        </form>
        <p style={{ marginTop: '1rem', color: 'var(--muted)' }}>
          Pas de compte ? <Link to="/register">S'inscrire</Link>
        </p>
      </div>
    </AppShell>
  );
}
