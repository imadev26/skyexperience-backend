# 🚀 Guide Déploiement Backend sur Render

## ✅ Préparation (Déjà fait!)

Ton backend est prêt avec:
- ✅ `package.json` avec scripts corrects
- ✅ `.gitignore` configuré
- ✅ `render.yaml` pour déploiement auto
- ✅ `env.example` pour référence

---

## 📋 Étapes de Déploiement

### **1. Push ton code sur GitHub**

```bash
# Si ce n'est pas déjà fait
cd c:\Users\Imad ADAOUMOUM\Downloads\projet\skyExperience

# Init et commit (si pas déjà fait)
git init
git add .
git commit -m "Backend ready for Render deployment"

# Créer repo sur GitHub et push
git remote add origin https://github.com/TON-USERNAME/skyExperience.git
git branch -M main
git push -u origin main
```

---

### **2. Déployer sur Render.com**

#### A. Créer le Web Service

1. **Aller sur:** https://render.com
2. **Se connecter** avec GitHub
3. **Cliquer:** "New +" → "Web Service"
4. **Connecter** ton repo GitHub: `skyExperience`

#### B. Configuration du Service

Remplir les champs:

```yaml
Name: skyexperience-backend
Region: Frankfurt (Europe - proche Maroc)
Branch: main
Root Directory: server          ← IMPORTANT! Le dossier backend
Runtime: Node
Build Command: npm install
Start Command: npm start
```

#### C. Plan & Instance

```
Instance Type: Free
Auto-Deploy: Yes (cochée)
```

#### D. Variables d'Environnement

Cliquer "Add Environment Variable" et ajouter:

```bash
# Database (OBLIGATOIRE)
DATABASE_URL = mongodb+srv://skyExperience:skyExperience@skyexperience.m7wjwfk.mongodb.net/skyexp?appName=SkyExperience

# Server Config
PORT = 5000
NODE_ENV = production

# Security (IMPORTANT - Change cette valeur!)
JWT_KEY = VotreSecretSuperSecure123!@#$%

# Frontend CORS (tu changeras après avoir le domaine Vercel)
ORIGIN = http://localhost:3000,https://ton-site.vercel.app

# Email Config (Gmail/SMTP)
MAIL_USER = ton-email@gmail.com
MAIL_PASS = ton-mot-de-passe-app

# Cloudinary (Upload images)
CLOUDINARY_CLOUD_NAME = ton_cloud_name
CLOUDINARY_API_KEY = ton_api_key
CLOUDINARY_API_SECRET = ton_api_secret
```

#### E. Déployer!

1. Cliquer **"Create Web Service"**
2. Render va:
   - ✅ Cloner le repo
   - ✅ Installer les dépendances
   - ✅ Démarrer le serveur
   - ✅ Te donner une URL publique

**Attendre 2-3 minutes** pour le premier build.

---

## 🔗 URL de ton Backend

Après déploiement, tu auras:

```
https://skyexperience-backend.onrender.com
```

**API Endpoints disponibles:**
```
https://skyexperience-backend.onrender.com/api/auth/login
https://skyexperience-backend.onrender.com/api/flights
https://skyexperience-backend.onrender.com/api/reservations
... etc
```

---

## ⚙️ Configuration Cloudinary (Upload Images)

Si tu n'as pas encore Cloudinary:

1. Aller sur: https://cloudinary.com
2. Créer compte gratuit
3. Dashboard → Copier:
   - Cloud Name
   - API Key
   - API Secret
4. Ajouter dans Render Environment Variables

---

## 📧 Configuration Email (Nodemailer)

### Option 1: Gmail App Password (Recommandé)

1. Aller sur: https://myaccount.google.com/security
2. Activer "Vérification en 2 étapes"
3. Générer "Mot de passe d'application"
4. Copier le mot de passe et mettre dans `MAIL_PASS`

### Option 2: Autre SMTP

Configurer avec ton service email (SendGrid, Mailgun, etc.)

---

## 🔄 Auto-Déploiement

Chaque fois que tu push sur `main`:

```bash
git add .
git commit -m "Update backend"
git push origin main
```

✅ Render va **automatiquement** redéployer!

---

## 🧪 Tester ton API

### Test 1: Health Check

```bash
curl https://skyexperience-backend.onrender.com/
```

### Test 2: Get Flights

```bash
curl https://skyexperience-backend.onrender.com/api/flights
```

### Test 3: Login Admin

```bash
curl -X POST https://skyexperience-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sky.com","password":"admin123"}'
```

---

## 📝 IMPORTANT: Update Frontend après déploiement

Une fois le backend déployé, il faut mettre à jour le frontend:

### Dans `webnext/.env.local`:

```env
NEXT_PUBLIC_API_URL=https://skyexperience-backend.onrender.com/api
```

### Et mettre à jour CORS dans Render:

```
ORIGIN = https://ton-frontend.vercel.app
```

---

## 🐛 Troubleshooting

### Backend ne démarre pas?

**Vérifier les logs:** https://dashboard.render.com → Ton service → Logs

**Problèmes courants:**

1. **"Cannot find module"**
   - Solution: Vérifier `package.json` dependencies

2. **"MongoDB connection failed"**
   - Solution: Vérifier `DATABASE_URL` est correcte

3. **"Port already in use"**
   - Solution: S'assurer d'utiliser `process.env.PORT`

4. **Build timeout**
   - Solution: Render Free peut être lent, attendre

### Instance s'endort?

**Plan Free = Sleep après 15 min d'inactivité**

Solution:
- Première requête après sleep prend 30-50 secondes
- Upgrade vers plan payant ($7/mois) pour keep-alive
- Ou utiliser service gratuit de "ping" (UptimeRobot)

---

## 💡 Prochaines Étapes

1. ✅ Backend déployé sur Render
2. ⏭️ Déployer Frontend sur Vercel
3. ⏭️ Connecter les 2
4. ⏭️ Ajouter domaine custom (optionnel)
5. ⏭️ Setup monitoring

---

## 📚 Ressources

- **Render Docs:** https://render.com/docs
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **Cloudinary Docs:** https://cloudinary.com/documentation
- **Support:** https://render.com/support

---

## ✉️ Besoin d'aide?

Check les logs sur Render Dashboard!

---

**Bon déploiement! 🎉**
