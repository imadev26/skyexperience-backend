# ✅ Checklist Déploiement Backend

## 📦 Avant de Déployer

- [ ] Code est prêt et testé localement
- [ ] `.env` existe avec toutes les variables
- [ ] MongoDB Atlas est accessible (ou autre DB cloud)
- [ ] Compte Cloudinary créé (pour upload images)
- [ ] Email SMTP configuré (Gmail App Password)

---

## 🚀 Étapes de Déploiement

### 1. Git & GitHub

- [ ] Code pushé sur GitHub
- [ ] Repo est public ou Render a accès
- [ ] Branch `main` existe

### 2. Render Configuration

- [ ] Compte Render créé: https://render.com
- [ ] Web Service créé
- [ ] Root Directory = `server`
- [ ] Build Command = `npm install`
- [ ] Start Command = `npm start`
- [ ] Region = Frankfurt (ou proche)

### 3. Variables d'Environnement (OBLIGATOIRES)

Ajouter dans Render Dashboard → Environment:

```bash
✅ DATABASE_URL = mongodb+srv://...
✅ PORT = 5000
✅ NODE_ENV = production
✅ JWT_KEY = ton_secret_super_secure
✅ ORIGIN = https://ton-frontend.vercel.app
✅ MAIL_USER = ton-email@gmail.com
✅ MAIL_PASS = ton-app-password
✅ CLOUDINARY_CLOUD_NAME = ton_cloud
✅ CLOUDINARY_API_KEY = ta_cle
✅ CLOUDINARY_API_SECRET = ton_secret
```

### 4. Déploiement

- [ ] Cliquer "Create Web Service"
- [ ] Attendre build (2-3 minutes)
- [ ] Vérifier logs: pas d'erreurs
- [ ] Copier l'URL du backend

### 5. Tests Post-Déploiement

```bash
# Test 1: API est accessible
curl https://ton-backend.onrender.com/

# Test 2: Routes fonctionnent
curl https://ton-backend.onrender.com/api/flights

# Test 3: Login admin
curl -X POST https://ton-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sky.com","password":"admin123"}'
```

---

## 🔗 Après Déploiement

### A. Mise à jour du Frontend

Dans `webnext/.env.local`:

```env
NEXT_PUBLIC_API_URL=https://ton-backend.onrender.com/api
```

### B. Mise à jour CORS

Dans Render ENV:

```
ORIGIN = https://ton-frontend.vercel.app,https://www.ton-domaine.com
```

### C. Créer Admin

Si besoin de créer un compte admin:

```bash
# Via Render Shell ou localement avec la bonne DB_URL
npm run create-admin
```

---

## 📊 Monitoring

### Vérifier Régulièrement:

- [ ] Logs Render (erreurs?)
- [ ] MongoDB Atlas (connexions actives?)
- [ ] Cloudinary (quota images?)
- [ ] Email (envois fonctionnent?)

### URLs Utiles:

```
📊 Render Dashboard: https://dashboard.render.com
📊 MongoDB Atlas: https://cloud.mongodb.com
📊 Cloudinary: https://cloudinary.com/console
```

---

## 🐛 Troubleshooting Rapide

| Problème | Solution |
|----------|----------|
| 502 Bad Gateway | Vérifier logs, restart service |
| DB Connection Failed | Vérifier DATABASE_URL |
| CORS Error | Ajouter frontend URL dans ORIGIN |
| Upload Failed | Vérifier Cloudinary credentials |
| Email Not Sent | Vérifier MAIL_USER/MAIL_PASS |

---

## ✅ Déploiement Réussi Si:

- ✅ URL backend est accessible
- ✅ API endpoints répondent correctement
- ✅ Login/Auth fonctionne
- ✅ Upload d'images marche
- ✅ Emails sont envoyés
- ✅ Pas d'erreurs dans les logs

---

## 🔄 Auto-Deploy

Chaque `git push` sur `main` = déploiement automatique!

```bash
git add .
git commit -m "Backend update"
git push origin main
```

✅ Render va rebuild automatiquement!

---

**Backend prêt! Passe au Frontend maintenant 🎉**
