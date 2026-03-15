import { useState, useCallback } from 'react';
import {
  Sword, Shield, Users, Star, Youtube, MessageCircle, Heart, ExternalLink,
  LogIn, UserPlus, LogOut, Menu, X, ChevronRight, Send, Upload, Check,
  XCircle, Clock, Search, Bell, Eye, Gamepad2, Mic, Globe, Filter,
  Home, FileText, Settings, CheckCircle, AlertCircle, Sparkles
} from 'lucide-react';

// ─── Constants ───
const SOCIAL_LINKS = {
  youtube: 'https://youtube.com/@YourChannel',
  tiktok: 'https://tiktok.com/@YourChannel',
  discord: 'https://discord.gg/YourServer',
  donate: 'https://ko-fi.com/YourPage',
};
const VOICECRAFT_LINK = 'https://example.com/voicecraft-download';
const ADMIN_EMAIL = 'admin@server.com';
const ADMIN_PASS = 'admin123';

// ─── Helpers ───
function getLS(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function setLS(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

// ─── Toast System ───
function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map(t => (
        <div key={t.id}
          className={`animate-fade-in flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${
            t.type === 'success' ? 'bg-emerald-900/80 border-emerald-700 text-emerald-200' :
            t.type === 'error' ? 'bg-red-900/80 border-red-700 text-red-200' :
            'bg-blue-900/80 border-blue-700 text-blue-200'
          }`}>
          {t.type === 'success' ? <CheckCircle size={18}/> :
           t.type === 'error' ? <AlertCircle size={18}/> : <Bell size={18}/>}
          <span className="text-sm flex-1">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="opacity-60 hover:opacity-100">
            <X size={14}/>
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Particle Background ───
const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: (i * 3.33 + i * 7.1) % 100,
  delay: (i * 0.5) % 15,
  duration: 10 + (i * 1.7) % 20,
  size: 2 + (i * 0.13) % 4,
}));

function Particles() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {PARTICLES.map(p => (
        <div key={p.id} className="absolute rounded-full bg-emerald-500/20"
          style={{
            left: `${p.left}%`, width: p.size, height: p.size,
            animation: `particle-float ${p.duration}s ${p.delay}s infinite linear`,
          }}/>
      ))}
    </div>
  );
}

// ─── Navbar ───
function Navbar({ page, setPage, user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = user?.email === ADMIN_EMAIL;

  const navItems = user ? (
    isAdmin ? [
      { label: 'Dashboard', icon: <Settings size={16}/>, page: 'admin' },
    ] : [
      { label: 'Home', icon: <Home size={16}/>, page: 'landing' },
      { label: 'Dashboard', icon: <Gamepad2 size={16}/>, page: 'dashboard' },
      { label: 'My Status', icon: <FileText size={16}/>, page: 'status' },
    ]
  ) : [
    { label: 'Home', icon: <Home size={16}/>, page: 'landing' },
    { label: 'Login', icon: <LogIn size={16}/>, page: 'login' },
    { label: 'Sign Up', icon: <UserPlus size={16}/>, page: 'signup' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <button onClick={() => setPage(user ? (isAdmin ? 'admin' : 'dashboard') : 'landing')}
          className="flex items-center gap-2 text-emerald-400 font-bold text-lg hover:text-emerald-300 transition-colors">
          <Sword size={22} className="animate-float"/>
          <span>MalaySMP</span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(n => (
            <button key={n.page} onClick={() => setPage(n.page)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all ${
                page === n.page ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}>
              {n.icon} {n.label}
            </button>
          ))}
          {user && (
            <button onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all ml-2">
              <LogOut size={16}/> Logout
            </button>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-400 hover:text-white">
          {menuOpen ? <X size={24}/> : <Menu size={24}/>}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden glass border-t border-white/5 animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navItems.map(n => (
              <button key={n.page} onClick={() => { setPage(n.page); setMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  page === n.page ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}>
                {n.icon} {n.label}
              </button>
            ))}
            {user && (
              <button onClick={() => { onLogout(); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                <LogOut size={16}/> Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Social Links Bar ───
function SocialBar() {
  const links = [
    { label: 'YouTube', href: SOCIAL_LINKS.youtube, icon: <Youtube size={18}/>, color: 'hover:bg-red-500/20 hover:text-red-400' },
    { label: 'TikTok', href: SOCIAL_LINKS.tiktok, icon: <Globe size={18}/>, color: 'hover:bg-pink-500/20 hover:text-pink-400' },
    { label: 'Discord', href: SOCIAL_LINKS.discord, icon: <MessageCircle size={18}/>, color: 'hover:bg-indigo-500/20 hover:text-indigo-400' },
    { label: 'Donate', href: SOCIAL_LINKS.donate, icon: <Heart size={18}/>, color: 'hover:bg-yellow-500/20 hover:text-yellow-400' },
  ];
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {links.map(l => (
        <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg glass glass-hover text-gray-300 text-sm transition-all ${l.color}`}>
          {l.icon} {l.label} <ExternalLink size={12} className="opacity-50"/>
        </a>
      ))}
    </div>
  );
}

// ─── Landing Page ───
function LandingPage({ setPage }) {
  const features = [
    { icon: <Sword size={28}/>, title: 'Epic Roleplay', desc: 'Immerse yourself in deep storytelling and character-driven adventures.' },
    { icon: <Mic size={28}/>, title: 'Voice Chat', desc: 'Proximity voice chat via VoiceCraft for an immersive experience.' },
    { icon: <Shield size={28}/>, title: 'Private & Safe', desc: 'Whitelisted community with active moderation and friendly players.' },
    { icon: <Users size={28}/>, title: 'Active Community', desc: 'Join an engaged group of roleplayers from around the world.' },
    { icon: <Star size={28}/>, title: 'Custom Content', desc: 'Unique builds, lore, quests, and events crafted by our team.' },
    { icon: <Gamepad2 size={28}/>, title: 'Bedrock Edition', desc: 'Play on any device — Xbox, Mobile, PC, Switch, and more.' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative flex items-center justify-center min-h-screen px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 via-transparent to-black/50"/>
        <div className="relative z-10 max-w-3xl animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-emerald-400 text-xs font-medium mb-6">
            <Sparkles size={14}/> Season 1 Now Live
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-500 bg-clip-text text-transparent leading-tight">
            MalaySMP
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-2 font-light">
            Private Minecraft Roleplay Server
          </p>
          <p className="text-gray-500 mb-8 max-w-lg mx-auto">
            A cinematic, voice-chat-powered Bedrock experience. Build your story, forge alliances, and survive together.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => setPage('signup')}
              className="px-8 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all animate-pulse-glow flex items-center justify-center gap-2">
              <UserPlus size={18}/> Apply Now
            </button>
            <button onClick={() => setPage('login')}
              className="px-8 py-3 rounded-lg glass glass-hover text-gray-300 hover:text-white font-semibold transition-all flex items-center justify-center gap-2">
              <LogIn size={18}/> Member Login
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-white mb-2">Why Join MalaySMP?</h2>
        <p className="text-gray-500 text-center mb-12">A premium Minecraft roleplay experience like no other.</p>
        <div className="grid md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div key={i} className="glass glass-hover rounded-xl p-6 transition-all animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'backwards' }}>
              <div className="text-emerald-400 mb-3">{f.icon}</div>
              <h3 className="text-white font-semibold mb-1">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Screenshots placeholder */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-white mb-2">Server Gallery</h2>
        <p className="text-gray-500 text-center mb-12">Explore our world.</p>
        <div className="grid md:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="aspect-video rounded-xl glass flex items-center justify-center text-gray-600">
              <div className="text-center">
                <Eye size={32} className="mx-auto mb-2 opacity-30"/>
                <span className="text-sm">Screenshot {i}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Social links */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Connect With Us</h2>
        <p className="text-gray-500 mb-8">Follow us on social media and join the community.</p>
        <SocialBar/>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="glass rounded-2xl p-10">
          <h2 className="text-3xl font-bold text-white mb-3">Ready to Begin Your Story?</h2>
          <p className="text-gray-400 mb-6">Create an account and submit your application to join the server.</p>
          <button onClick={() => setPage('signup')}
            className="px-8 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all inline-flex items-center gap-2">
            Login or Create Account to Apply <ChevronRight size={18}/>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-gray-600 text-sm">
        <p>&copy; {new Date().getFullYear()} MalaySMP. All rights reserved.</p>
      </footer>
    </div>
  );
}

// ─── Auth Forms ───
function AuthPage({ mode, setPage, onAuth, addToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gamertag, setGamertag] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const users = getLS('msmp_users', []);
      if (mode === 'signup') {
        if (users.find(u => u.email === email)) {
          addToast('An account with this email already exists.', 'error');
          setLoading(false);
          return;
        }
        const newUser = { id: genId(), email, password, gamertag, createdAt: new Date().toISOString() };
        setLS('msmp_users', [...users, newUser]);
        setLS('msmp_current_user', newUser);
        addToast('Account created! Welcome to MalaySMP.', 'success');
        onAuth(newUser);
      } else {
        // Admin login
        if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
          const adminUser = { id: 'admin', email: ADMIN_EMAIL, gamertag: 'Admin', isAdmin: true };
          setLS('msmp_current_user', adminUser);
          addToast('Welcome back, Admin!', 'success');
          onAuth(adminUser);
          return;
        }
        const found = users.find(u => u.email === email && u.password === password);
        if (!found) {
          addToast('Invalid email or password.', 'error');
          setLoading(false);
          return;
        }
        setLS('msmp_current_user', found);
        addToast(`Welcome back, ${found.gamertag}!`, 'success');
        onAuth(found);
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="w-full max-w-md glass rounded-2xl p-8 animate-fade-in">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-emerald-500/20 text-emerald-400 mb-4">
            {mode === 'login' ? <LogIn size={24}/> : <UserPlus size={24}/>}
          </div>
          <h2 className="text-2xl font-bold text-white">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {mode === 'login' ? 'Login to access your dashboard' : 'Join the MalaySMP community'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition"
              placeholder="you@example.com"/>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition"
              placeholder="••••••••"/>
          </div>
          {mode === 'signup' && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Minecraft Gamertag</label>
              <input type="text" required value={gamertag} onChange={e => setGamertag(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition"
                placeholder="YourGamertag"/>
            </div>
          )}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold transition-all flex items-center justify-center gap-2">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
            ) : (
              <>{mode === 'login' ? <LogIn size={18}/> : <UserPlus size={18}/>}
                {mode === 'login' ? 'Login' : 'Create Account'}</>
            )}
          </button>
        </form>
        <p className="text-center text-gray-500 text-sm mt-4">
          {mode === 'login' ? (
            <>No account? <button onClick={() => setPage('signup')} className="text-emerald-400 hover:underline">Sign up</button></>
          ) : (
            <>Already have an account? <button onClick={() => setPage('login')} className="text-emerald-400 hover:underline">Login</button></>
          )}
        </p>
      </div>
    </div>
  );
}

// ─── Application Form ───
function ApplicationForm({ user, addToast, setPage }) {
  const existing = getLS('msmp_applications', []).find(a => a.userId === user.id);
  const [form, setForm] = useState({
    gamertag: user.gamertag || '',
    discordId: '',
    gender: '',
    age: '',
    socialMedia: '',
    skinPreview: '',
    rpInterest: '',
    rpExplanation: '',
    voiceCraftConfirm: false,
    additionalMessage: '',
  });
  const [submitted, setSubmitted] = useState(!!existing);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm(prev => ({ ...prev, skinPreview: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.discordId || !form.gender || !form.age || !form.rpInterest) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }
    if (!form.voiceCraftConfirm) {
      addToast('You must confirm VoiceCraft download and microphone agreement.', 'error');
      return;
    }
    const apps = getLS('msmp_applications', []);
    const app = {
      id: genId(),
      userId: user.id,
      email: user.email,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      ...form,
    };
    setLS('msmp_applications', [...apps, app]);
    setSubmitted(true);
    addToast('Your application has been submitted!', 'success');
  };

  if (submitted) {
    return (
      <div className="glass rounded-2xl p-8 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mb-4">
          <Check size={32}/>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Application Submitted!</h3>
        <p className="text-gray-400 mb-4">
          Our admin will review and contact you via Discord or Email.
        </p>
        <button onClick={() => setPage('status')}
          className="px-6 py-2 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-all text-sm">
          Check Application Status
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 md:p-8 animate-fade-in">
      <h3 className="text-xl font-bold text-white mb-1">Server Application</h3>
      <p className="text-gray-500 text-sm mb-6">Fill out all fields to apply for whitelist access.</p>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Minecraft Gamertag</label>
          <input type="text" value={form.gamertag} readOnly
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/60 cursor-not-allowed"/>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Discord ID</label>
          <input type="text" value={form.discordId}
            onChange={e => setForm({...form, discordId: e.target.value})}
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition"
            placeholder="username#1234"/>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Gender</label>
          <select value={form.gender}
            onChange={e => setForm({...form, gender: e.target.value})}
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 transition">
            <option value="" className="bg-gray-900">Select...</option>
            <option value="Male" className="bg-gray-900">Male</option>
            <option value="Female" className="bg-gray-900">Female</option>
            <option value="Other" className="bg-gray-900">Other</option>
            <option value="Prefer not to say" className="bg-gray-900">Prefer not to say</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Age</label>
          <input type="number" min="13" max="99" value={form.age}
            onChange={e => setForm({...form, age: e.target.value})}
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition"
            placeholder="18"/>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-400 mb-1">Social Media Handle(s)</label>
          <input type="text" value={form.socialMedia}
            onChange={e => setForm({...form, socialMedia: e.target.value})}
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition"
            placeholder="@yourhandle (Instagram, Twitter, etc.)"/>
        </div>
      </div>

      {/* Skin upload */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Minecraft Skin (Image Upload)</label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:border-emerald-500/50 cursor-pointer transition text-sm">
            <Upload size={16}/> Choose File
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload}/>
          </label>
          {form.skinPreview && (
            <img src={form.skinPreview} alt="Skin preview" className="w-12 h-12 rounded-lg object-cover border border-white/10"/>
          )}
        </div>
      </div>

      {/* RP Interest */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Are you interested in Roleplay?</label>
        <div className="flex gap-4 mb-2">
          {['Yes', 'No'].map(opt => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="rpInterest" value={opt}
                checked={form.rpInterest === opt}
                onChange={e => setForm({...form, rpInterest: e.target.value})}
                className="accent-emerald-500"/>
              <span className="text-sm text-gray-300">{opt}</span>
            </label>
          ))}
        </div>
        <textarea value={form.rpExplanation}
          onChange={e => setForm({...form, rpExplanation: e.target.value})}
          className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition text-sm"
          rows={2} placeholder="Briefly explain your roleplay interest..."/>
      </div>

      {/* VoiceCraft checkbox */}
      <div className="mb-4 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={form.voiceCraftConfirm}
            onChange={e => setForm({...form, voiceCraftConfirm: e.target.checked})}
            className="mt-1 accent-emerald-500"/>
          <span className="text-sm text-gray-300">
            I confirm I have downloaded{' '}
            <a href={VOICECRAFT_LINK} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">
              VoiceCraft (Voice Proximity for Bedrock)
            </a>{' '}
            and I agree to use a microphone in-server.
          </span>
        </label>
      </div>

      {/* Additional message */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-1">Additional Message to Admin</label>
        <textarea value={form.additionalMessage}
          onChange={e => setForm({...form, additionalMessage: e.target.value})}
          className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition text-sm"
          rows={3} placeholder="Anything else you'd like us to know..."/>
      </div>

      <button type="submit"
        className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all flex items-center justify-center gap-2">
        <Send size={18}/> Submit Application
      </button>
    </form>
  );
}

// ─── Member Dashboard ───
function Dashboard({ user, addToast, setPage }) {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-4xl mx-auto">
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Welcome, {user.gamertag}! 🎮</h1>
          <p className="text-gray-500">Member Dashboard</p>
        </div>

        {/* Social links */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">Community Links</h2>
          <SocialBar/>
        </div>

        {/* Application form */}
        <ApplicationForm user={user} addToast={addToast} setPage={setPage}/>
      </div>
    </div>
  );
}

// ─── Application Status Page ───
function StatusPage({ user }) {
  const apps = getLS('msmp_applications', []);
  const myApp = apps.find(a => a.userId === user.id);

  const statusConfig = {
    pending: { icon: <Clock size={32}/>, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Pending Review', desc: 'Your application is being reviewed by our admins.' },
    accepted: { icon: <CheckCircle size={32}/>, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Accepted!', desc: 'Congratulations! You have been whitelisted. Check Discord for server details.' },
    declined: { icon: <XCircle size={32}/>, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Declined', desc: 'Unfortunately your application was declined. You may contact admin for details.' },
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-2xl mx-auto">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-6">Application Status</h1>
        {myApp ? (() => {
          const cfg = statusConfig[myApp.status];
          return (
            <div className={`glass rounded-2xl p-8 text-center`}>
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${cfg.bg} ${cfg.color} mb-4`}>
                {cfg.icon}
              </div>
              <h2 className={`text-2xl font-bold ${cfg.color} mb-2`}>{cfg.label}</h2>
              <p className="text-gray-400 mb-6">{cfg.desc}</p>
              <div className="glass rounded-xl p-4 text-left space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Gamertag:</span><span className="text-white">{myApp.gamertag}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Discord:</span><span className="text-white">{myApp.discordId}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Submitted:</span><span className="text-white">{new Date(myApp.submittedAt).toLocaleDateString()}</span></div>
              </div>
            </div>
          );
        })() : (
          <div className="glass rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-500/10 text-gray-500 mb-4">
              <FileText size={32}/>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No Application Found</h2>
            <p className="text-gray-400">You haven&apos;t submitted an application yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Admin Panel ───
function AdminPanel({ addToast }) {
  const [apps, setApps] = useState(getLS('msmp_applications', []));
  const [tab, setTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const updateStatus = (appId, status) => {
    const updated = apps.map(a => a.id === appId ? { ...a, status } : a);
    setLS('msmp_applications', updated);
    setApps(updated);
    addToast(`Application ${status === 'accepted' ? 'accepted ✅' : 'declined ❌'}`, status === 'accepted' ? 'success' : 'error');
  };

  const filteredApps = apps.filter(a => {
    const matchesTab = tab === 'all' ? true :
      tab === 'pending' ? a.status === 'pending' :
      tab === 'accepted' ? a.status === 'accepted' :
      tab === 'declined' ? a.status === 'declined' : true;
    const matchesSearch = searchQuery === '' ||
      a.gamertag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.discordId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const stats = {
    total: apps.length,
    pending: apps.filter(a => a.status === 'pending').length,
    accepted: apps.filter(a => a.status === 'accepted').length,
    declined: apps.filter(a => a.status === 'declined').length,
  };

  const tabs = [
    { key: 'all', label: 'All', count: stats.total },
    { key: 'pending', label: 'Pending', count: stats.pending },
    { key: 'accepted', label: 'Whitelist', count: stats.accepted },
    { key: 'declined', label: 'Rejected', count: stats.declined },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-6xl mx-auto">
      <div className="animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
              Admin Panel
              {stats.pending > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                  <Bell size={12}/> {stats.pending} new
                </span>
              )}
            </h1>
            <p className="text-gray-500">Manage server applications and whitelist.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', value: stats.total, icon: <FileText size={18}/>, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Pending', value: stats.pending, icon: <Clock size={18}/>, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { label: 'Accepted', value: stats.accepted, icon: <CheckCircle size={18}/>, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Rejected', value: stats.declined, icon: <XCircle size={18}/>, color: 'text-red-400', bg: 'bg-red-500/10' },
          ].map(s => (
            <div key={s.label} className="glass rounded-xl p-4">
              <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${s.bg} ${s.color} mb-2`}>{s.icon}</div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-gray-500 text-sm">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search and tabs */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by gamertag, Discord ID, or email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition text-sm"/>
          </div>
          <div className="flex gap-1 p-1 glass rounded-lg">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 rounded-md text-sm transition-all flex items-center gap-1.5 ${
                  tab === t.key ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-white'
                }`}>
                {t.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  tab === t.key ? 'bg-emerald-500/30' : 'bg-white/10'
                }`}>{t.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Application cards */}
        {filteredApps.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Filter size={32} className="mx-auto mb-3 text-gray-600"/>
            <p className="text-gray-500">No applications found.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredApps.map(app => (
              <div key={app.id} className="glass glass-hover rounded-xl p-5 transition-all">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* Skin preview */}
                  <div className="flex-shrink-0">
                    {app.skinPreview ? (
                      <img src={app.skinPreview} alt="Skin" className="w-16 h-16 rounded-lg object-cover border border-white/10"/>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-600">
                        <Gamepad2 size={24}/>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">{app.gamertag}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        app.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        app.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-sm mb-3">
                      <span className="text-gray-500">Discord: <span className="text-gray-300">{app.discordId}</span></span>
                      <span className="text-gray-500">Age: <span className="text-gray-300">{app.age}</span></span>
                      <span className="text-gray-500">Gender: <span className="text-gray-300">{app.gender}</span></span>
                      <span className="text-gray-500">Email: <span className="text-gray-300">{app.email}</span></span>
                      <span className="text-gray-500">RP Interest: <span className="text-gray-300">{app.rpInterest}</span></span>
                      {app.socialMedia && <span className="text-gray-500">Social: <span className="text-gray-300">{app.socialMedia}</span></span>}
                    </div>
                    {app.rpExplanation && (
                      <p className="text-sm text-gray-400 mb-2"><span className="text-gray-500">RP Note:</span> {app.rpExplanation}</p>
                    )}
                    {app.additionalMessage && (
                      <p className="text-sm text-gray-400"><span className="text-gray-500">Message:</span> {app.additionalMessage}</p>
                    )}
                  </div>

                  {/* Actions */}
                  {app.status === 'pending' && (
                    <div className="flex md:flex-col gap-2 flex-shrink-0">
                      <button onClick={() => updateStatus(app.id, 'accepted')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-all text-sm font-medium">
                        <Check size={16}/> Accept
                      </button>
                      <button onClick={() => updateStatus(app.id, 'declined')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-all text-sm font-medium">
                        <XCircle size={16}/> Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main App ───
export default function App() {
  const [user, setUser] = useState(() => getLS('msmp_current_user', null));
  const [page, setPage] = useState(() => {
    const u = getLS('msmp_current_user', null);
    if (u) return u.email === ADMIN_EMAIL ? 'admin' : 'dashboard';
    return 'landing';
  });
  const [toasts, setToasts] = useState([]);
  const [transitioning, setTransitioning] = useState(false);

  const addToast = useCallback((message, type = 'info') => {
    const id = genId();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const navigate = useCallback((newPage) => {
    setTransitioning(true);
    setTimeout(() => {
      setPage(newPage);
      window.scrollTo(0, 0);
      setTransitioning(false);
    }, 200);
  }, []);

  const handleAuth = useCallback((u) => {
    setUser(u);
    navigate(u.email === ADMIN_EMAIL ? 'admin' : 'dashboard');
  }, [navigate]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('msmp_current_user');
    setUser(null);
    navigate('landing');
    addToast('Logged out successfully.', 'info');
  }, [navigate, addToast]);

  const renderPage = () => {
    switch (page) {
      case 'landing': return <LandingPage setPage={navigate}/>;
      case 'login': return <AuthPage mode="login" setPage={navigate} onAuth={handleAuth} addToast={addToast}/>;
      case 'signup': return <AuthPage mode="signup" setPage={navigate} onAuth={handleAuth} addToast={addToast}/>;
      case 'dashboard': return user ? <Dashboard user={user} addToast={addToast} setPage={navigate}/> : <LandingPage setPage={navigate}/>;
      case 'status': return user ? <StatusPage user={user}/> : <LandingPage setPage={navigate}/>;
      case 'admin': return user?.email === ADMIN_EMAIL ? <AdminPanel addToast={addToast}/> : <LandingPage setPage={navigate}/>;
      default: return <LandingPage setPage={navigate}/>;
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-gray-200">
      <Particles/>
      <Navbar page={page} setPage={navigate} user={user} onLogout={handleLogout}/>
      <ToastContainer toasts={toasts} removeToast={removeToast}/>
      <div className={`transition-opacity duration-200 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
        {renderPage()}
      </div>
    </div>
  );
}
