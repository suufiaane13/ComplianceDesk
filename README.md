<p align="center">
  <img src="others/logo_compliancedesk.png" alt="ComplianceDesk" width="120" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="others/logo_entsi.jpeg" alt="ENTSI" width="120" />
</p>

<h1 align="center">ComplianceDesk</h1>

<p align="center">
  SaaS multi-tenant pour le suivi des obligations réglementaires des PME marocaines<br/>
  (CNSS, assurances, médecine du travail, autorisations, etc.)
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-12-FF2D20?style=flat&logo=laravel" alt="Laravel" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat&logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Licence-MIT-green" alt="Licence MIT" />
</p>

---

## Stack

| Couche | Technologies |
|--------|----------------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Laravel 12, Sanctum, Brevo (emails) |
| Base | MySQL (recommandé) ou SQLite |
| Qualité | PHPUnit, Vitest, GitHub Actions, SonarCloud |

```text
ComplianceDesk/
├── backend/      API Laravel (port 8000)
├── frontend/     SPA React (port 3000)
├── others/       Captures, UML, logos, rapport
└── scripts/      SonarCloud / couverture PHP
```

---

## Prérequis

- PHP 8.2+ et Composer  
- Node.js 18+ et npm  
- MySQL 8+ (ou SQLite)

---

## Installation rapide

### Backend

```bash
cd backend
composer install
copy .env.example .env
php artisan key:generate
```

Configurer MySQL dans `backend/.env` :

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=compliancedesk
DB_USERNAME=root
DB_PASSWORD=
```

Puis :

```bash
php artisan migrate --seed
```

### Frontend

```bash
cd frontend
npm install
```

Les appels `/api` sont proxifiés vers `http://localhost:8000` (voir `frontend/vite.config.js`).

---

## Démarrage

Deux terminaux :

```bash
# Terminal 1 — API
cd backend
php artisan serve
```

```bash
# Terminal 2 — interface
cd frontend
npm run dev
```

- Application : http://localhost:3000  
- API : http://localhost:8000  

Si les emails sont en file (`QUEUE_CONNECTION=database`) :

```bash
cd backend
php artisan queue:work
```

---

## Comptes de démo

Après `php artisan migrate --seed` :

| Rôle | Email | Mot de passe |
|------|--------|--------------|
| Super admin | `superadmin@compliancedesk.ma` | `password` |
| Admin | `admin@compliancedesk.ma` | `password` |
| Utilisateur | `user@compliancedesk.ma` | `password` |

Comptes locaux uniquement. Mot de passe trivial des seeders : à changer ou désactiver en production.

Pas d’inscription publique : les comptes sont créés par un supérieur  
(`super_admin` → admin d’entreprise, `admin` → utilisateur).

---

## Rôles

| Rôle | Accès |
|------|--------|
| `super_admin` | Console `/admin/*` : entreprises, suspension, stats |
| `admin` | Obligations, utilisateurs, documents, dashboard |
| `user` | Consultation, documents, notifications |

---

## Commandes utiles

```bash
# Tests backend
cd backend
php artisan test

# Tests + build frontend
cd frontend
npm test
npm run build

# Recréer la base (efface les données)
cd backend
php artisan migrate:fresh --seed

# Recalcul des statuts d’obligations
php artisan obligations:refresh-statuts

# SonarCloud (depuis la racine, token dans .sonarcloud.token)
npm run sonar:full
```

### Docker (optionnel)

```bash
docker compose up --build
```

- API : http://localhost:8000  
- Mailpit : http://localhost:8025  
- MySQL : `localhost:3306` (`compliancedesk` / `secret`)  

Le frontend se lance toujours avec `npm run dev` (port 3000).

---

## Emails (Brevo)

Emails envoyés via Brevo SMTP :

| Email | Quand |
|-------|--------|
| Compte créé | Création d’un utilisateur / admin (lien `/set-password`) |
| Entreprise suspendue | Suspension d’un tenant (admins notifiés) |

Sans Brevo en local : `MAIL_MAILER=log` dans `.env` (écriture dans les logs Laravel).

Avec Brevo, renseigner dans `backend/.env` : `MAIL_HOST`, `MAIL_USERNAME`, `MAIL_PASSWORD`,  
`MAIL_FROM_ADDRESS` (expéditeur **vérifié**), `FRONTEND_URL`, puis `php artisan config:clear`.  
Ne jamais committer la clé SMTP.

---

## Licence

MIT — voir `LICENSE`.

**Explication simple :** la licence MIT permet à n’importe qui d’utiliser, modifier et redistribuer ce code (même pour un usage commercial), à condition de conserver la mention de copyright et le texte de la licence. Le logiciel est fourni « tel quel », sans garantie.
