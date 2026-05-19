import { Link, useNavigate } from 'react-router-dom';
import type { User } from '../api';
import { logout } from '../api';

export function AppShell({
  user,
  children,
}: {
  user?: User | null;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();

  return (
    <>
      <header className="app-header container">
        <Link to="/" className="logo">
          PDFMaster
        </Link>
        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {user ? (
            <>
              <Link to="/dashboard">Mes PDF</Link>
              <Link to="/pricing">Tarifs</Link>
              {user.is_admin && <Link to="/admin">Admin</Link>}
              <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                {user.plan} · {user.pdfs_used_this_month} PDF ce mois
              </span>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/pricing">Tarifs</Link>
              <Link to="/login" className="btn btn-ghost">
                Connexion
              </Link>
              <Link to="/register" className="btn btn-primary">
                Essayer gratuit
              </Link>
            </>
          )}
        </nav>
      </header>
      <main className="container" style={{ paddingBottom: '3rem' }}>
        {children}
      </main>
    </>
  );
}
