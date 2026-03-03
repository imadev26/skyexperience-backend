# 🚀 Quick Start: Push Backend to GitHub

## Option 1: Projet Complet (Recommandé)

Si tu veux push tout le projet `skyExperience`:

```bash
# Aller à la racine du projet
cd c:\Users\Imad ADAOUMOUM\Downloads\projet\skyExperience

# Vérifier le statut Git
git status

# Si pas encore initialisé:
git init

# Ajouter tous les fichiers
git add .

# Commit
git commit -m "Backend ready for Render deployment"

# Créer repo sur GitHub (via interface web)
# Puis connecter et push:
git remote add origin https://github.com/TON-USERNAME/skyExperience.git
git branch -M main
git push -u origin main
```

---

## Option 2: Backend Seulement

Si tu veux un repo séparé juste pour le backend:

```bash
# Aller dans le dossier server
cd c:\Users\Imad ADAOUMOUM\Downloads\projet\skyExperience\server

# Init Git
git init

# Ajouter fichiers
git add .

# Commit
git commit -m "SkyExperience Backend API"

# Push vers nouveau repo
git remote add origin https://github.com/TON-USERNAME/skyexperience-backend.git
git branch -M main
git push -u origin main
```

---

## ⚠️ Avant de Push

### Vérifier que .gitignore contient:

```
node_modules
.env
*.log
dist
```

### Vérifier que .env n'est PAS commité:

```bash
# Cette commande ne doit rien retourner:
git status | grep .env
```

✅ Si `.env` apparaît, il faut l'exclure!

---

## 📝 Après le Push

1. ✅ Aller sur Render.com
2. ✅ New Web Service
3. ✅ Connect ton repo
4. ✅ Root Directory = `server` (si projet complet)
5. ✅ Ajouter environment variables
6. ✅ Deploy!

---

## 🔗 URLs de Référence

- **GitHub:** https://github.com
- **Render:** https://render.com
- **Guide complet:** Voir `RENDER_DEPLOY.md`

---

**Besoin d'aide? Check le guide complet!** 📖
