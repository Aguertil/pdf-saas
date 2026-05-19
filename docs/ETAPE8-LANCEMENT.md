# Étape 8 — Thread Twitter + fiche Product Hunt

## Thread Twitter (lancement)

**Tweet 1 (accroche)**  
On a passé 6 mois à tester pourquoi chaque outil PDF en ligne casse la mise en page quand tu changes une date.

Spoiler : personne ne respecte vraiment les polices du document.

On lance PDFMaster — édition PDF pro dans le navigateur. 🧵

**Tweet 2**  
Le problème : tu reçois un contrat PDF, tu dois changer un montant ou une date.

→ iLovePDF déforme le texte  
→ Acrobat coûte 25€/mois  
→ Word + export = catastrophe typographique

**Tweet 3**  
Notre approche : analyser chaque PDF pour détecter polices, tailles et positions AVANT d’éditer.

Quand tu remplaces du texte, on réutilise le style du span original.

**Tweet 4**  
Fonctionnalités MVP :
✅ Upload & analyse typographique  
✅ Édition texte fidèle  
✅ Champs formulaire  
✅ Réorganisation pages  
✅ OCR (Hugging Face gratuit)  
✅ Plans 0€ → 30€/mois

**Tweet 5**  
Pour qui ?
→ Assistants admin & office managers PME  
→ Freelances (juridique, immo, compta)  
→ Toute équipe qui modifie des PDF sans budget Acrobat

**Tweet 6**  
Tarifs :
🆓 Gratuit — 5 PDF/mois  
⚡ Starter — 9€  
🚀 Pro — 19€  
🏢 Business — 30€ + admin équipe

**Tweet 7 (CTA)**  
On cherche 50 beta testeurs qui modifient des PDF chaque semaine.

👉 Essai gratuit : [lien]  
Feedback = 3 mois Pro offerts aux 10 premiers retours détaillés.

RT apprécié 🙏

---

## Fiche Product Hunt

**Nom**  
PDFMaster

**Tagline**  
Éditez vos PDF en ligne sans casser les polices du document

**Description courte**  
PDFMaster analyse la typographie de chaque PDF pour modifier texte et champs en préservant polices et tailles — comme un éditeur desktop pro, sans installation. Plans de 0 € à 30 €/mois.

**Description longue**  
PDFMaster est un SaaS d’édition PDF pour professionnels et PME qui en ont marre des outils gratuits qui déforment leurs documents.

**Ce qui nous différencie :**
- Détection automatique des polices et tailles par page
- Remplacement de texte avec préservation du style original (PyMuPDF)
- Édition des champs AcroForm
- OCR via Hugging Face Inference API (gratuit avec token) ou extraction locale
- Dashboard administrateur pour le plan Business
- 4 paliers : Gratuit (5 PDF), Starter (9€), Pro (19€), Business (30€)

**Catégorie**  
Productivity · SaaS

**Premier commentaire fondateur**  
Bonjour PH 👋

On a construit PDFMaster parce qu’on modifiait des contrats et factures PDF chaque semaine, et chaque outil « simple » cassait la mise en page.

Notre stack : FastAPI + PyMuPDF + React + GSAP. OCR optionnel via modèles gratuits Hugging Face.

On cherche vos retours sur :
1. La fidélité visuelle après édition
2. Le pricing (9/19/30€)
3. Les features manquantes pour remplacer votre workflow actuel

Code promo beta : les 20 premiers commentaires reçoivent 1 mois Pro — on vous envoie le code en DM.

**Mots-clés**  
PDF, editor, SaaS, productivity, typography, forms

**Liens**  
Site : [URL]  
Démo : [URL/register]  
Twitter : [@handle]
