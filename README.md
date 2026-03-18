# MalaySMP Tools

A full-stack-style React web app for the **MalaySMP** Minecraft Private Roleplay Server community.  
Built with **Vite + React + Tailwind CSS v4 + Firebase** — all in a single `src/App.jsx` file.

---

## ✨ Features

- 🎨 Dark cinematic Minecraft-inspired theme with particle effects & glassmorphism
- 🏠 Public landing page (hero, features, gallery, social links)
- 🔐 Sign Up / Login with **Firebase Authentication** (email + password, or **Google Sign-in**)
- ✉️ **Email verification** — users must verify their email before submitting applications
- ☁️ **Cloud database (Firestore)** — all data is shared in real-time across every browser and device
- 📋 Server application form (gamertag, Discord ID, skin upload, VoiceCraft confirmation, …)
- 🛡️ Admin panel — review, accept, or decline applications with search & filters (real-time updates)
- 📊 Application status page for members (updates in real-time)
- 👥 **Members page (Whitelisted Players)** — accessible to everyone: visitors, logged-in users, and admins
- 📅 **Event list** — admin can create multiple events; users choose which event to apply for
- 🔔 Toast notifications, smooth page transitions, fully responsive

---

## 🔥 Firebase Setup (Required — One-Time)

The app uses **Firebase** for authentication and data storage so that all users
share the same data. Follow these steps **once** to set up your own Firebase project.

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** (or "Add project")
3. Enter a project name (e.g. `MalaySMP`)
4. Disable Google Analytics (optional) → **Create Project**

### 2. Enable Authentication

1. In the Firebase Console, go to **Build → Authentication**
2. Click **"Get started"**
3. Under **Sign-in method**, enable **Email/Password** → click **Save**
4. Still on the Sign-in method page, click **"Add new provider"** → select **Google**
5. Toggle **Enable** on, choose a **support email** (your Gmail), then click **Save**

> **Why both?** Email/Password lets users create accounts with any email.
> Google Sign-in lets users log in with one click (no verification email needed).
> If you only enable one of them, that's fine too — the app supports both.

### 3. Create a Firestore Database

1. Go to **Build → Firestore Database**
2. Click **"Create database"**
3. Choose **Start in test mode** (you can tighten rules later)
4. Select a Cloud Firestore location close to your users → **Enable**

### 4. Set Firestore Security Rules

Once the database is created, go to **Firestore → Rules** and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // User profiles — owner can read/write, admin can read all
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null
                  && request.auth.token.email == 'YOUR_ADMIN_EMAIL_HERE';
    }

    // Applications — authenticated users can create & read their own,
    // admin can read/update all, anyone can read accepted applications
    match /applications/{appId} {
      allow create: if request.auth != null;
      allow read:   if resource.data.status == "accepted";
      allow read:   if request.auth != null
                    && (resource.data.userId == request.auth.uid
                        || request.auth.token.email == 'YOUR_ADMIN_EMAIL_HERE');
      allow update: if request.auth != null
                    && request.auth.token.email == 'YOUR_ADMIN_EMAIL_HERE';
    }

    // Events — anyone can read, admin can write
    match /events/{eventId} {
      allow read:  if true;
      allow write: if request.auth != null
                   && request.auth.token.email == 'YOUR_ADMIN_EMAIL_HERE';
    }

    // Notifications — users can read/update their own, admin can write
    match /notifications/{notifId} {
      allow read, update: if request.auth != null
                          && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null
                    && request.auth.token.email == 'YOUR_ADMIN_EMAIL_HERE';
    }
  }
}
```

> **Important:** Replace `YOUR_ADMIN_EMAIL_HERE` with your real admin email in **all five** places above.

Click **Publish**.

> **Tip — Whitelisted Players page:**
> The Members page (whitelisted players) is now accessible to **everyone** — visitors, logged-in users, and admins — all from the navbar.
> The Firestore rule `allow read: if resource.data.status == "accepted"` makes accepted applications publicly readable, which is what powers the Members page.
> If your logged-in users cannot see the Members page, make sure you have updated to the latest Firestore rules above and clicked **Publish**.

### 5. Add Authorized Domains (for Google Sign-in)

If you deploy to GitHub Pages (or any custom domain), add the domain so that
Google Sign-in works:

1. In the Firebase Console, go to **Build → Authentication → Settings**
2. Scroll to **Authorized domains**
3. Click **Add domain** and add your deployment domain, e.g.:
   - `amibutbotok-byte.github.io` (GitHub Pages)
   - `your-project.vercel.app` (Vercel)
   - `your-project.netlify.app` (Netlify)

> `localhost` is already authorized by default for local development.

### 6. Register a Web App & Get Config

1. In the Firebase Console, click the **gear icon** → **Project settings**
2. Scroll down to **"Your apps"** and click the **Web** icon (`</>`)
3. Enter a nickname (e.g. `MalaySMP Web`) → **Register app**
4. You will see a `firebaseConfig` object. Copy the values — you need them next.

### 7. Add Config as GitHub Secrets

Go to your GitHub repo → **Settings → Secrets and variables → Actions → New repository secret** and add each of these:

| Secret name | Value (from Firebase config) |
|---|---|
| `VITE_FIREBASE_API_KEY` | `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | `appId` |
| `VITE_ADMIN_EMAIL` | Your admin email (e.g. `youremail@gmail.com`) |

> **Tip:** The admin email **must be a real email address** that can receive verification emails.
> Sign up through the app with this email to create the admin account.

### 8. Deploy

Push to `main` (or re-run the workflow manually) — the deploy workflow will
inject the secrets at build time and deploy to GitHub Pages automatically.

---

## 🚀 Run Locally

### Prerequisites

| Tool | Version |
|------|---------|
| [Node.js](https://nodejs.org/) | **18 +** (20 recommended) |
| npm | comes with Node.js |

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/amibutbotok-byte/MalaySMP-Tools.git
cd MalaySMP-Tools

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Create your .env file from the example
cp .env.example .env
# Then open .env and fill in your Firebase config values (see Firebase Setup above)

# 4. Start the dev server
npm run dev
```

Open **http://localhost:5173/MalaySMP-Tools/** in your browser.  
The page auto-reloads when you edit files.

### Other useful commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server with hot-reload |
| `npm run build` | Create optimised production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint checks |

---

## 🌐 Deploy to the Public (GitHub Pages)

This repo includes a GitHub Actions workflow that **automatically deploys** to GitHub Pages on every push to `main`.

### First-time setup (one-time)

1. Complete the **Firebase Setup** above (create project, enable auth, create database, add secrets)
2. Go to your repo on GitHub → **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. Push any change to the `main` branch (or merge this PR)
5. The workflow runs automatically — your site will be live at:

   **https://amibutbotok-byte.github.io/MalaySMP-Tools/**

That's it! Every future push to `main` re-deploys automatically.

### Alternative: Deploy to other platforms

<details>
<summary><strong>Vercel</strong> (free, instant)</summary>

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"** → import `MalaySMP-Tools`
3. Add the `VITE_FIREBASE_*` and `VITE_ADMIN_EMAIL` environment variables in the project settings
4. Vercel auto-detects Vite — just click **Deploy**
5. Your site is live at `https://your-project.vercel.app`

> **Note:** If deploying to Vercel or Netlify (where the app is served from `/`), change `base` in `vite.config.js` from `'/MalaySMP-Tools/'` to `'/'`.
</details>

<details>
<summary><strong>Netlify</strong> (free, drag-and-drop)</summary>

1. Run `npm run build` locally (make sure `.env` is filled in)
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
3. Drag the `dist/` folder onto the page
4. Your site is instantly live

> **Note:** Change `base` in `vite.config.js` to `'/'` for root-level hosting.
</details>

---

## 🧪 Testing the App

The app uses **Firebase** for all data — every user shares the same database in real time.

1. **Landing page** — Open the site; browse as a visitor
2. **Sign up** — Create an account (you will receive a verification email)
3. **Verify email** — Click the link in the email, then refresh the app
4. **View Members** — Click **"Members"** in the navbar to see whitelisted players (works for visitors, logged-in users, and admins)
5. **Create events (admin)** — Log in as admin, open **"Event Management"** in the admin panel, and create one or more events
6. **Submit application** — Log in as a regular user, go to the Dashboard, pick an event, and fill in the application form
7. **Check status** — Click "My Status" to see your application status (updates in real time)
8. **Admin panel** — Log in with the email you set as `VITE_ADMIN_EMAIL` to review applications (filter by event, accept/decline)

---

## 🔧 Troubleshooting

### Email verification not arriving?

Firebase sends verification emails from `noreply@YOUR_PROJECT.firebaseapp.com`.
Some email providers filter these:

1. **Check Spam / Junk** — look in your Spam or Junk folder first.
2. **Gmail Promotions tab** — if you use Gmail, also check the Promotions tab.
3. **Wait a minute** — emails can take 1–2 minutes to arrive.
4. **Resend** — on the Dashboard page, click the **Resend Email** button in the yellow banner.
5. **Use Google Sign-in instead** — Google-authenticated users are automatically verified (no email needed).

### Google Sign-in popup not working?

1. Make sure you enabled the **Google** provider in **Firebase Console → Authentication → Sign-in method**.
2. Make sure your deployment domain is listed in **Authentication → Settings → Authorized domains**.
3. If you see a "popup blocked" error, allow popups for your site in your browser settings.

---

## 📁 Project Structure

```
MalaySMP-Tools/
├── index.html            # Entry HTML
├── public/
│   └── favicon.svg       # Site icon
├── src/
│   ├── main.jsx          # React entry point
│   ├── index.css          # Tailwind CSS imports & custom styles
│   ├── firebase.js        # Firebase init & exports
│   └── App.jsx            # ← All components, logic & pages (single-file)
├── .env.example           # Example environment variables
├── vite.config.js         # Vite + Tailwind config
├── package.json           # Dependencies & scripts
└── .github/workflows/
    └── deploy.yml         # GitHub Pages auto-deploy (injects Firebase secrets)
```

---

## 📝 License

This project is for the MalaySMP community. Feel free to fork and customise for your own server!
