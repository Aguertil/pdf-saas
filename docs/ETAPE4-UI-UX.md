# Étape 4 — Structure UI/UX

## Architecture des écrans

```
[Landing] → [Inscription/Connexion] → [Dashboard documents]
                                        ↓
                                   [Éditeur PDF]
                                        ↓
                                   [Export]
[Admin] ← rôle admin uniquement
[Tarifs] ← depuis landing ou dashboard
```

## Composants clés

| Composant | Rôle |
|-----------|------|
| `AppShell` | Header + nav + quota utilisateur |
| `PdfUploader` | Drag & drop, validation taille |
| `PdfViewer` | iframe PDF + panneau latéral |
| `FontInspector` | Liste polices/tailles détectées |
| `TextEditPanel` | old_text → new_text par page |
| `FormFieldsPanel` | Champs AcroForm éditables |
| `PageManager` | Réordonnancement pages |
| `PlanCard` | Carte tarifaire animée (GSAP) |
| `AdminTable` | Users, plans, stats |

## Parcours utilisateur

1. **Acquisition** — Landing hero animé → CTA « Essayer gratuit »
2. **Activation** — Upload premier PDF < 2 min
3. **Aha moment** — Modification texte avec police préservée
4. **Conversion** — Quota atteint → modal upgrade
5. **Rétention** — Dashboard historique documents

## Design system

- **Couleurs** : fond `#0f1419`, accent `#3b82f6`, succès `#22c55e`
- **Typo** : DM Sans (titres), Inter (corps)
- **Espacement** : grille 8px
- **Mobile** : éditeur en pile (viewer au-dessus, panneau en dessous)

## États vides & erreurs

- Aucun PDF : illustration + bouton upload
- Quota dépassé : bannière upgrade avec plan recommandé
- PDF corrompu : message clair + lien support
