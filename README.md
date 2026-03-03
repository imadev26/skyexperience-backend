# 🚀 SkyExperience Backend API

Backend REST API pour SkyExperience - Plateforme de réservation de vols en montgolfière au Maroc.

## 📋 Table des Matières

- [Technologies](#technologies)
- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [Déploiement](#déploiement)
- [API Endpoints](#api-endpoints)
- [Structure du Projet](#structure-du-projet)

## 🛠 Technologies

- **Node.js** v20+
- **Express** v5 - Framework web
- **MongoDB** - Base de données NoSQL
- **JWT** - Authentification
- **Cloudinary** - Upload d'images
- **Nodemailer** - Envoi d'emails
- **Multer** - Upload de fichiers
- **Bcrypt** - Hashage de mots de passe

## 📦 Installation

### Prérequis

- Node.js 20.x ou supérieur
- MongoDB (local ou Atlas)
- Compte Cloudinary (pour images)
- Compte Gmail (pour emails)

### Étapes

```bash
# 1. Cloner le repo
git clone https://github.com/TON-USERNAME/skyExperience.git
cd skyExperience/server

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp env.example .env
# Éditer .env avec vos credentials
```

## ⚙️ Configuration

### Fichier `.env`

Copier `env.example` vers `.env` et remplir:

```env
# Database
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Server
PORT=5000
NODE_ENV=development
ORIGIN=http://localhost:3000

# Security
JWT_KEY=your_super_secret_jwt_key_here

# Email
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-gmail-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### MongoDB Atlas

1. Créer compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créer cluster gratuit
3. Configurer Network Access (Allow from anywhere ou IP spécifique)
4. Créer Database User
5. Copier Connection String dans `DATABASE_URL`

### Gmail App Password

1. Activer 2FA: [Google Account Security](https://myaccount.google.com/security)
2. Générer App Password: [App Passwords](https://myaccount.google.com/apppasswords)
3. Utiliser le mot de passe généré dans `MAIL_PASS`

### Cloudinary

1. Créer compte sur [Cloudinary](https://cloudinary.com)
2. Dashboard → Copier credentials
3. Remplir `CLOUDINARY_*` dans `.env`

## 🚀 Démarrage

### Développement

```bash
npm run dev
```

Server démarre sur `http://localhost:5000`

### Production

```bash
npm start
```

### Créer Admin

```bash
npm run create-admin
```

Suit les instructions pour créer un compte administrateur.

## 🌐 Déploiement

### Render.com (Recommandé)

Guide complet: [RENDER_DEPLOY.md](./RENDER_DEPLOY.md)

**Quick Start:**

1. Push code sur GitHub
2. [Render.com](https://render.com) → New Web Service
3. Connect repo
4. Configuration:
   - Root Directory: `server`
   - Build: `npm install`
   - Start: `npm start`
5. Ajouter Environment Variables (voir [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md))
6. Deploy!

### Autres Options

- **Railway**: [Guide Railway](./RENDER_DEPLOY.md#railway)
- **Heroku**: Compatible avec buildpack Node.js
- **VPS**: Avec PM2 ou systemd
- **Docker**: `docker build -t skyexp-api .`

## 📡 API Endpoints

### Authentification

```http
POST   /api/auth/register       # Inscription
POST   /api/auth/login          # Connexion
POST   /api/auth/logout         # Déconnexion
GET    /api/auth/verify         # Vérifier token
```

### Vols

```http
GET    /api/flights             # Liste des vols
GET    /api/flights/:id         # Détails d'un vol
POST   /api/flights             # Créer vol (Admin)
PUT    /api/flights/:id         # Modifier vol (Admin)
DELETE /api/flights/:id         # Supprimer vol (Admin)
```

### Réservations

```http
GET    /api/reservations        # Liste réservations
GET    /api/reservations/:id    # Détails réservation
POST   /api/reservations        # Créer réservation
PUT    /api/reservations/:id    # Modifier réservation
DELETE /api/reservations/:id    # Annuler réservation
```

### Blog

```http
GET    /api/posts               # Liste articles
GET    /api/posts/:slug         # Article par slug
POST   /api/posts               # Créer article (Admin)
PUT    /api/posts/:id           # Modifier article (Admin)
DELETE /api/posts/:id           # Supprimer article (Admin)
```

### Avis

```http
GET    /api/reviews             # Liste avis
POST   /api/reviews             # Créer avis
PUT    /api/reviews/:id         # Modifier avis
DELETE /api/reviews/:id         # Supprimer avis
```

### Contact

```http
POST   /api/contact             # Envoyer message
```

### Dashboard (Admin)

```http
GET    /api/dashboard/stats     # Statistiques
```

### Upload

```http
POST   /api/upload              # Upload image
```

## 📁 Structure du Projet

```
server/
├── config/
│   ├── db.js                  # Configuration MongoDB
│   └── cloudinary.js          # Configuration Cloudinary
├── controllers/
│   ├── AuthController.js      # Logique authentification
│   ├── FlightController.js    # Logique vols
│   ├── ReservationController.js
│   ├── BlogPostController.js
│   ├── ReviewController.js
│   ├── ContactController.js
│   ├── DashboardController.js
│   └── UserController.js
├── middlewares/
│   └── AuthMiddleware.js      # Vérification JWT
├── models/
│   ├── User.js                # Schéma utilisateur
│   ├── Flight.js              # Schéma vol
│   ├── Reservation.js         # Schéma réservation
│   ├── BlogPost.js            # Schéma article
│   ├── Review.js              # Schéma avis
│   └── Category.js            # Schéma catégorie
├── routes/
│   ├── AuthRoutes.js          # Routes auth
│   ├── Flights.js             # Routes vols
│   ├── Reservations.js        # Routes réservations
│   ├── BlogPosts.js           # Routes blog
│   ├── Reviews.js             # Routes avis
│   ├── Contact.js             # Routes contact
│   ├── Dashboard.js           # Routes dashboard
│   └── Users.js               # Routes utilisateurs
├── scripts/
│   └── createAdmin.js         # Script création admin
├── utils/
│   └── cloudinaryUtils.js     # Utilitaires Cloudinary
├── public/
│   └── uploads/               # Uploads locaux
├── .env                       # Variables d'environnement (ne pas commit!)
├── env.example                # Template variables
├── .gitignore                 # Fichiers à ignorer
├── index.js                   # Point d'entrée
├── package.json               # Dépendances
├── Dockerfile                 # Config Docker
└── render.yaml                # Config Render

📚 Documentation:
├── README.md                  # Ce fichier
├── RENDER_DEPLOY.md           # Guide déploiement Render
├── DEPLOYMENT_CHECKLIST.md    # Checklist déploiement
└── QUICK_START.md             # Quick start GitHub
```

## 🔐 Sécurité

- ✅ Mots de passe hashés avec bcrypt
- ✅ Authentification JWT
- ✅ CORS configuré
- ✅ Variables sensibles dans .env
- ✅ Validation des données
- ✅ Protection contre injections

## 🧪 Tests

```bash
# Tester localement
npm run dev

# Test API avec curl
curl http://localhost:5000/api/flights

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'
```

## 📝 Scripts NPM

```bash
npm start          # Lancer en production
npm run dev        # Lancer en développement avec nodemon
npm run create-admin  # Créer compte administrateur
```

## 🐛 Debugging

### Logs

Le serveur affiche les logs dans la console:

```
Server running on port 5000
Connected to MongoDB
```

### Erreurs Communes

**MongoDB Connection Failed:**
- Vérifier `DATABASE_URL` dans `.env`
- Vérifier Network Access dans MongoDB Atlas

**CORS Error:**
- Ajouter l'URL du frontend dans `ORIGIN`

**Upload Failed:**
- Vérifier credentials Cloudinary

**Email Not Sent:**
- Vérifier App Password Gmail

## 🤝 Contribution

1. Fork le projet
2. Créer branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir Pull Request

## 📄 License

ISC

## 👨‍💻 Auteur

**SkyExperience Team**

## 🔗 Liens Utiles

- [Frontend Next.js](../webnext/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Cloudinary](https://cloudinary.com)
- [Render.com](https://render.com)
- [Documentation Express](https://expressjs.com)

---

**Made with ❤️ for SkyExperience**
