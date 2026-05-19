# PDFMaster — SaaS d'édition PDF

Éditeur PDF web qui préserve polices et tailles du document source. Backend FastAPI + Frontend React/GSAP.

## Démarrage rapide

### Backend

```bash
cd pdf-saas-backend
pip install -r requirements.txt
python3 scripts/seed_admin.py
uvicorn app.main:app --reload --port 8000
```

**Compte admin** : `admin@pdfmaster.app` / `Admin123!`

### Frontend

```bash
cd pdf-saas-frontend
npm install
npm run dev
```

Ouvrir http://localhost:5173

### Hugging Face (optionnel)

Définir `HF_TOKEN` dans `pdf-saas-backend/.env` pour activer l'OCR cloud gratuit (`microsoft/trocr-base-printed`).

## Documentation produit

- [Étape 2 — MVP fonctionnalités](docs/ETAPE2-MVP-FONCTIONNALITES.md)
- [Étape 4 — UI/UX](docs/ETAPE4-UI-UX.md)
- [Étape 7 — Landing Webflow](docs/ETAPE7-LANDING-WEBFLOW.md)
- [Étape 8 — Lancement Twitter / PH](docs/ETAPE8-LANCEMENT.md)
- [Étape 9 — Contenu 7 jours](docs/ETAPE9-CONTENT-7J.md)

## API

Documentation interactive : http://localhost:8000/docs

## Plans

| Plan | Prix | PDF/mois |
|------|------|----------|
| Gratuit | 0 € | 5 |
| Starter | 9 € | 50 |
| Pro | 19 € | 200 |
| Business | 30 € | Illimité + admin |
