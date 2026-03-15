# MalaySMP Tools

A full-stack-style React web app for the **MalaySMP** Minecraft Private Roleplay Server community.  
Built with **Vite + React + Tailwind CSS v4** — all in a single `src/App.jsx` file.

---

## ✨ Features

- 🎨 Dark cinematic Minecraft-inspired theme with particle effects & glassmorphism
- 🏠 Public landing page (hero, features, gallery, social links)
- 🔐 Sign Up / Login with localStorage (no backend required)
- 📋 Server application form (gamertag, Discord ID, skin upload, VoiceCraft confirmation, …)
- 🛡️ Admin panel — review, accept, or decline applications with search & filters
- 📊 Application status page for members
- 🔔 Toast notifications, smooth page transitions, fully responsive

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
# (--legacy-peer-deps is needed because @tailwindcss/vite 4.x
#  hasn't listed vite 8 as a peer yet — everything works fine)

# 3. Start the dev server
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

1. Go to your repo on GitHub → **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Push any change to the `main` branch (or merge this PR)
4. The workflow runs automatically — your site will be live at:

   **https://amibutbotok-byte.github.io/MalaySMP-Tools/**

That's it! Every future push to `main` re-deploys automatically.

### Alternative: Deploy to other platforms

<details>
<summary><strong>Vercel</strong> (free, instant)</summary>

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"** → import `MalaySMP-Tools`
3. Vercel auto-detects Vite — just click **Deploy**
4. Your site is live at `https://your-project.vercel.app`

> **Note:** If deploying to Vercel or Netlify (where the app is served from `/`), change `base` in `vite.config.js` from `'/MalaySMP-Tools/'` to `'/'`.
</details>

<details>
<summary><strong>Netlify</strong> (free, drag-and-drop)</summary>

1. Run `npm run build` locally
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
3. Drag the `dist/` folder onto the page
4. Your site is instantly live

> **Note:** Change `base` in `vite.config.js` to `'/'` for root-level hosting.
</details>

---

## 🧪 Testing the App

Since the app uses **localStorage** for all data (no backend), you can test every feature locally:

1. **Landing page** — Open the site; browse as a visitor
2. **Sign up** — Create an account (email, password, gamertag)
3. **Submit application** — Fill in the server application form
4. **Check status** — Click "My Status" to see your application status
5. **Admin panel** — Log in with `admin@server.com` / `admin123` to review applications

All data is stored in your browser's localStorage and persists across refreshes.  
To reset everything, open DevTools → Application → Local Storage → Clear.

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
│   └── App.jsx            # ← All components, logic & pages (single-file)
├── vite.config.js         # Vite + Tailwind config
├── package.json           # Dependencies & scripts
└── .github/workflows/
    └── deploy.yml         # GitHub Pages auto-deploy
```

---

## 📝 License

This project is for the MalaySMP community. Feel free to fork and customise for your own server!
