# Étape 2 — Fonctionnalités MVP (priorisées)

## P0 — Indispensable (MVP)

| # | Fonctionnalité | Justification |
|---|----------------|---------------|
| 1 | **Upload PDF** + stockage sécurisé | Point d'entrée produit |
| 2 | **Analyse typographique** (polices, tailles, positions) | Différenciateur vs iLovePDF |
| 3 | **Édition texte** avec préservation police/taille | Cœur de la promesse |
| 4 | **Édition champs formulaire** (AcroForm) | Usage métier quotidien |
| 5 | **Réorganisation pages** (supprimer, réordonner) | Besoin fréquent sans Acrobat |
| 6 | **Export PDF** | Livrable final |
| 7 | **Auth** (inscription / connexion JWT) | SaaS |
| 8 | **4 paliers** (Gratuit → 30 €/mois) + quotas | Monétisation |
| 9 | **Dashboard admin** (users, plans, usage) | B2B PME |

## P1 — Post-MVP (v1.1)

- Annotation (surlignage, commentaires)
- Fusion / découpage PDF
- Historique versions
- Stripe paiement réel
- SSO entreprise

## P2 — Plus tard

- OCR avancé multilingue
- Signature électronique qualifiée
- API publique
- App desktop

## Grille d'abonnements

| Plan | Prix | PDFs/mois | Taille max | OCR HF | Export HD | Admin |
|------|------|-----------|------------|--------|-----------|-------|
| **Gratuit** | 0 € | 5 | 10 Mo | 3 pages | Watermark léger | — |
| **Starter** | 9 € | 50 | 25 Mo | 50 pages | Oui | — |
| **Pro** | 19 € | 200 | 50 Mo | Illimité | Oui | — |
| **Business** | 30 € | Illimité | 100 Mo | Illimité | Oui | Dashboard équipe |
