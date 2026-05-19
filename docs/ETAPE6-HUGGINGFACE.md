# Étape 6 — Intégration Hugging Face (gratuit)

## Modèle utilisé

- **OCR** : `microsoft/trocr-base-printed` via [Hugging Face Inference API](https://huggingface.co/inference-api)
- **Fallback gratuit** : extraction texte native **PyMuPDF** (aucun token requis)

## Configuration

1. Créer un compte sur https://huggingface.co (gratuit)
2. Générer un token : Settings → Access Tokens
3. Ajouter dans `pdf-saas-backend/.env` :

```
HF_TOKEN=hf_votre_token
```

## Endpoint API

`POST /api/pdfs/{doc_id}/ocr/{page_index}`

Réponse exemple :

```json
{
  "source": "huggingface",
  "model": "microsoft/trocr-base-printed",
  "text": "..."
}
```

## Quotas par plan

| Plan | Pages OCR / mois |
|------|------------------|
| Gratuit | 3 |
| Starter | 50 |
| Pro / Business | Illimité |

## Alternatives HF gratuites (évolution)

- `facebook/nougat-base` — documents complexes
- `impira/layoutlm-document-qa` — extraction structurée
- **Transformers local** — zéro coût API si serveur GPU disponible

## Coût

- Inference API : tier gratuit avec rate limits
- Sans token : 100 % local via PyMuPDF (recommandé pour dev)
