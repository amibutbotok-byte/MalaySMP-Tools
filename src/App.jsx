import { useState, useEffect, useCallback } from 'react';
import {
  Flame, Shield, Users, Star, Youtube, MessageCircle, Heart, ExternalLink,
  LogIn, UserPlus, LogOut, Menu, X, ChevronRight, Send, Upload, Check,
  XCircle, Clock, Search, Bell, Eye, Gamepad2, Mic, Globe, Filter,
  Home, FileText, Settings, CheckCircle, AlertCircle, Sparkles,
  RefreshCw, Trash2, Download, Palette, Image, User, Megaphone, Type,
  ArrowUpDown, Edit,
} from 'lucide-react';
import {
  auth, db, storage,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  deleteUser,
  updateProfile,
  collection, doc, setDoc, getDoc, getDocs,
  updateDoc, deleteDoc, query, where, onSnapshot, writeBatch,
  serverTimestamp,
  storageRef, uploadBytes, getDownloadURL,
} from './firebase.js';

// ─── Constants ───
const SOCIAL_LINKS = {
  youtube: 'https://www.youtube.com/@lostsharkstudio',
  tiktok: 'https://www.tiktok.com/@lostsharkz',
  discord: 'https://discord.gg/DkJYCrg47K',
  donate: 'https://sociabuzz.com/lostsharkofficial',
};
const VOICECRAFT_LINK = 'https://github.com/AvionBlock/VoiceCraft/releases/tag/v1.4.0';
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || '';
const MIN_DECLINE_REASON_LENGTH = 10;
const FIRESTORE_BATCH_LIMIT = 500;

// ─── Helpers ───
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

// ─── Skeleton Loading ───
function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`}>&nbsp;</div>;
}

// ─── Toast System ───
function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map(t => (
        <div key={t.id}
          className={`animate-fade-in flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${
            t.type === 'success' ? 'bg-orange-900/80 border-orange-700 text-orange-200' :
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

// ─── Ember Particle Background ───
const PARTICLES = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  left: (i * 2.5 + i * 5.7) % 100,
  delay: (i * 0.4) % 18,
  duration: 8 + (i * 1.3) % 22,
  size: 2 + (i * 0.17) % 5,
  useEmber: i % 3 === 0,
  colorClass: i % 3 === 0 ? 'bg-orange-500/30' : i % 3 === 1 ? 'bg-yellow-500/20' : 'bg-orange-400/20',
}));

function Particles() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {PARTICLES.map(p => (
        <div key={p.id} className={`absolute rounded-full ${p.colorClass}`}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            bottom: p.useEmber ? '0' : 'auto',
            animation: `${p.useEmber ? 'ember-drift' : 'particle-float'} ${p.duration}s ${p.delay}s infinite linear`,
            boxShadow: p.useEmber ? '0 0 4px rgba(249,115,22,0.4)' : 'none',
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
      { label: 'Members', icon: <Users size={16}/>, page: 'members' },
    ] : [
      { label: 'Home', icon: <Home size={16}/>, page: 'landing' },
      { label: 'Dashboard', icon: <Gamepad2 size={16}/>, page: 'dashboard' },
      { label: 'My Status', icon: <FileText size={16}/>, page: 'status' },
      { label: 'Profile', icon: <User size={16}/>, page: 'profile' },
      { label: 'Members', icon: <Users size={16}/>, page: 'members' },
    ]
  ) : [
    { label: 'Home', icon: <Home size={16}/>, page: 'landing' },
    { label: 'Members', icon: <Users size={16}/>, page: 'members' },
    { label: 'Login', icon: <LogIn size={16}/>, page: 'login' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <button onClick={() => setPage(user ? (isAdmin ? 'admin' : 'dashboard') : 'landing')}
          className="flex items-center gap-2 text-orange-400 font-bold text-lg hover:text-yellow-300 transition-colors">
          <Flame size={22} className="animate-float"/>
          <span>MalaySMP</span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(n => (
            <button key={n.page} onClick={() => setPage(n.page)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all ${
                page === n.page ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
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
        <div className="md:hidden glass border-t border-white/5 animate-slide-in">
          <div className="px-4 py-3 space-y-1">
            {navItems.map(n => (
              <button key={n.page} onClick={() => { setPage(n.page); setMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  page === n.page ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
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
function LandingPage({ setPage, siteSettings }) {
  const serverName = siteSettings?.serverName || 'MalaySMP';
  const tagline = siteSettings?.tagline || 'Private Minecraft Roleplay Server';
  const description = siteSettings?.description ||
    'A cinematic, voice-chat-powered Bedrock experience. Build your story, forge alliances, and survive together.';

  const features = [
    { icon: <Flame size={28}/>, title: 'Epic Roleplay', desc: 'Immerse yourself in deep storytelling and character-driven adventures.' },
    { icon: <Mic size={28}/>, title: 'Voice Chat', desc: 'Proximity voice chat via VoiceCraft for an immersive experience.' },
    { icon: <Shield size={28}/>, title: 'Private & Safe', desc: 'Whitelisted community with active moderation and friendly players.' },
    { icon: <Users size={28}/>, title: 'Active Community', desc: 'Join an engaged group of roleplayers from around the world.' },
    { icon: <Star size={28}/>, title: 'Custom Content', desc: 'Unique builds, lore, quests, and events crafted by our team.' },
    { icon: <Gamepad2 size={28}/>, title: 'Bedrock Edition', desc: 'Play on any device — Xbox, Mobile, PC, Switch, and more.' },
  ];

  return (
    <div className="min-h-screen">
      {/* Announcement banner */}
      {siteSettings?.announcementEnabled && siteSettings?.announcement && (
        <div className="bg-orange-600/90 backdrop-blur text-white text-center py-2.5 px-4 text-sm flex items-center justify-center gap-2 mt-16">
          <Megaphone size={14}/> {siteSettings.announcement}
        </div>
      )}

      {/* Hero */}
      <section className="relative flex items-center justify-center min-h-screen px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-900/20 via-transparent to-black/50"/>
        <div className="relative z-10 max-w-3xl animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-orange-400 text-xs font-medium mb-6">
            <Sparkles size={14}/> Season 1 Now Live
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-500 bg-clip-text text-transparent leading-tight">
            {serverName}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-2 font-light">
            {tagline}
          </p>
          <p className="text-gray-500 mb-8 max-w-lg mx-auto">
            {description}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => setPage('login')}
              className="px-8 py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold transition-all animate-pulse-glow animate-btn-press flex items-center justify-center gap-2">
              <LogIn size={18}/> Apply Now
            </button>
            <button onClick={() => setPage('members')}
              className="px-8 py-3 rounded-lg glass glass-hover text-gray-300 hover:text-white font-semibold transition-all animate-btn-press flex items-center justify-center gap-2">
              <Users size={18}/> View Members
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-white mb-2">Why Join {serverName}?</h2>
        <p className="text-gray-500 text-center mb-12">A premium Minecraft roleplay experience like no other.</p>
        <div className="grid md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div key={i} className="glass glass-hover rounded-xl p-6 transition-all animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'backwards' }}>
              <div className="text-orange-400 mb-3">{f.icon}</div>
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
          <button onClick={() => setPage('login')}
            className="px-8 py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold transition-all animate-btn-press inline-flex items-center gap-2">
            Sign In with Google to Apply <ChevronRight size={18}/>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-gray-600 text-sm">
        <p>&copy; {new Date().getFullYear()} {serverName}. All rights reserved.</p>
      </footer>
    </div>
  );
}

// ─── Google Icon (inline SVG) ───
function GoogleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// ─── Auth Page (Google Sign-In Only) ───
function AuthPage({ addToast }) {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const snap = await getDoc(userDocRef);
      if (!snap.exists()) {
        await setDoc(userDocRef, {
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || '',
          gamertag: '',
          createdAt: new Date().toISOString(),
        });
      } else {
        await updateDoc(userDocRef, {
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || '',
        });
      }
      addToast(`Signed in as ${firebaseUser.email}`, 'success');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        addToast(err.message || 'Google sign-in failed.', 'error');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="w-full max-w-md glass rounded-2xl p-8 animate-fade-in">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-orange-500/20 text-orange-400 mb-4">
            <LogIn size={24}/>
          </div>
          <h2 className="text-2xl font-bold text-white">Welcome to MalaySMP</h2>
          <p className="text-gray-500 text-sm mt-1">Sign in with your Google account to continue</p>
        </div>

        <button type="button" onClick={handleGoogleSignIn} disabled={loading}
          className="w-full py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 text-white font-semibold transition-all flex items-center justify-center gap-3 animate-btn-press">
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
          ) : (
            <><GoogleIcon size={20}/> Continue with Google</>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Gamertag Setup (for first-time Google sign-in users) ───
function GamertagSetup({ user, onComplete, addToast }) {
  const [gamertag, setGamertag] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!gamertag.trim()) {
      addToast('Please enter your Minecraft gamertag.', 'error');
      return;
    }
    setLoading(true);
    try {
      await setDoc(doc(db, 'users', user.id), {
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        gamertag: gamertag.trim(),
        createdAt: new Date().toISOString(),
      }, { merge: true });
      addToast('Profile created! Welcome to MalaySMP!', 'success');
      onComplete({ ...user, gamertag: gamertag.trim() });
    } catch {
      addToast('Failed to save profile. Please try again.', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="w-full max-w-md glass rounded-2xl p-8 animate-fade-in">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-orange-500/20 text-orange-400 mb-4">
            <Gamepad2 size={24}/>
          </div>
          <h2 className="text-2xl font-bold text-white">Almost There!</h2>
          <p className="text-gray-500 text-sm mt-1">Set your Minecraft gamertag to finish signing up</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Minecraft Gamertag</label>
            <input type="text" required value={gamertag} onChange={e => setGamertag(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition"
              placeholder="YourGamertag"/>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-semibold transition-all animate-btn-press flex items-center justify-center gap-2">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
            ) : (
              <><Check size={18}/> Complete Setup</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Application Form ───
function ApplicationForm({ user, addToast, setPage, editData, onResubmit }) {
  const [loading, setLoading] = useState(!editData);
  const [form, setForm] = useState({
    gamertag: user.gamertag || '',
    discordId: editData?.discordId || '',
    gender: editData?.gender || '',
    age: editData?.age || '',
    socialMedia: editData?.socialMedia || '',
    skinPreview: editData?.skinPreview || '',
    rpInterest: editData?.rpInterest || '',
    rpExplanation: editData?.rpExplanation || '',
    voiceCraftConfirm: false,
    additionalMessage: editData?.additionalMessage || '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [skinError, setSkinError] = useState('');
  const [voiceCraftClicked, setVoiceCraftClicked] = useState(false);

  useEffect(() => {
    if (editData) {
      return;
    }
    (async () => {
      try {
        const q = query(collection(db, 'applications'), where('userId', '==', user.id));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setSubmitted(true);
        }
      } catch (err) {
        console.error('Failed to check existing application:', err);
      }
      setLoading(false);
    })();
  }, [user.id, editData]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSkinError('');
    if (!file.name.toLowerCase().endsWith('.png') || file.type !== 'image/png') {
      setSkinError('Invalid skin. Must be a 64×64 or 64×128 PNG file.');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.onload = () => {
        const valid = (img.width === 64 && img.height === 64) || (img.width === 64 && img.height === 128);
        if (!valid) {
          setSkinError('Invalid skin. Must be a 64×64 or 64×128 PNG file.');
          setForm(prev => ({ ...prev, skinPreview: '' }));
        } else {
          setSkinError('');
          setForm(prev => ({ ...prev, skinPreview: ev.target.result }));
        }
      };
      img.onerror = () => {
        setSkinError('Invalid skin. Must be a 64×64 or 64×128 PNG file.');
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.discordId || !form.gender || !form.age || !form.rpInterest) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }
    if (!form.skinPreview) {
      addToast('Please upload a valid Minecraft skin PNG file.', 'error');
      return;
    }
    if (!form.voiceCraftConfirm) {
      addToast('You must confirm VoiceCraft download and installation.', 'error');
      return;
    }
    try {
      if (editData && editData.appId) {
        // Resubmission — update existing document
        await updateDoc(doc(db, 'applications', editData.appId), {
          ...form,
          status: 'pending',
          declineReason: '',
          isResubmission: true,
          submittedAt: serverTimestamp(),
        });
        addToast('Application resubmitted! Please wait for admin review.', 'success');
        if (onResubmit) onResubmit();
      } else {
        const appId = genId();
        await setDoc(doc(db, 'applications', appId), {
          id: appId,
          userId: user.id,
          email: user.email,
          status: 'pending',
          submittedAt: serverTimestamp(),
          ...form,
        });
        setSubmitted(true);
        addToast('Your application has been submitted!', 'success');
      }
    } catch {
      addToast('Failed to submit application. Please try again.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-8 animate-fade-in space-y-4">
        <Skeleton className="h-6 w-48"/>
        <Skeleton className="h-4 w-64"/>
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-10"/>
          <Skeleton className="h-10"/>
          <Skeleton className="h-10"/>
          <Skeleton className="h-10"/>
        </div>
        <Skeleton className="h-24"/>
        <Skeleton className="h-12 w-full"/>
      </div>
    );
  }

  if (submitted && !editData) {
    return (
      <div className="glass rounded-2xl p-8 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/20 text-orange-400 mb-4">
          <Check size={32}/>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Application Submitted!</h3>
        <p className="text-gray-400 mb-4">
          Our admin will review and contact you via Discord or Email.
        </p>
        <button onClick={() => setPage('status')}
          className="px-6 py-2 rounded-lg bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 transition-all text-sm animate-btn-press">
          Check Application Status
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 md:p-8 animate-fade-in">
      <h3 className="text-xl font-bold text-white mb-1">
        {editData ? 'Edit & Resubmit Application' : 'Server Application'}
      </h3>
      <p className="text-gray-500 text-sm mb-6">
        {editData ? 'Update your answers and resubmit for review.' : 'Fill out all fields to apply for whitelist access.'}
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Minecraft Gamertag</label>
          <input type="text" value={form.gamertag} readOnly
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/60 cursor-not-allowed"/>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Discord ID <span className="text-red-400">*</span></label>
          <input type="text" value={form.discordId}
            onChange={e => setForm({...form, discordId: e.target.value})}
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition"
            placeholder="username#1234"/>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Gender <span className="text-red-400">*</span></label>
          <select value={form.gender}
            onChange={e => setForm({...form, gender: e.target.value})}
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-orange-500/50 transition">
            <option value="" className="bg-gray-900">Select...</option>
            <option value="Male" className="bg-gray-900">Male</option>
            <option value="Female" className="bg-gray-900">Female</option>
            <option value="Other" className="bg-gray-900">Other</option>
            <option value="Prefer not to say" className="bg-gray-900">Prefer not to say</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Age <span className="text-red-400">*</span></label>
          <input type="number" min="13" max="99" value={form.age}
            onChange={e => setForm({...form, age: e.target.value})}
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition"
            placeholder="18"/>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-400 mb-1">Social Media Handle(s)</label>
          <input type="text" value={form.socialMedia}
            onChange={e => setForm({...form, socialMedia: e.target.value})}
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition"
            placeholder="@yourhandle (Instagram, Twitter, etc.)"/>
        </div>
      </div>

      {/* Skin upload */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Minecraft Skin (PNG Upload) <span className="text-red-400">*</span></label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:border-orange-500/50 cursor-pointer transition text-sm">
            <Upload size={16}/> Choose .png File
            <input type="file" accept=".png,image/png" className="hidden" onChange={handleFileUpload}/>
          </label>
          {form.skinPreview && (
            <img src={form.skinPreview} alt="Skin preview" className="w-16 h-16 rounded-lg border border-white/10" style={{ imageRendering: 'pixelated' }}/>
          )}
        </div>
        {skinError && (
          <p className="text-red-400 text-xs mt-1">{skinError}</p>
        )}
      </div>

      {/* RP Interest */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Are you interested in Roleplay? <span className="text-red-400">*</span></label>
        <div className="flex gap-4 mb-2">
          {['Yes', 'No'].map(opt => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="rpInterest" value={opt}
                checked={form.rpInterest === opt}
                onChange={e => setForm({...form, rpInterest: e.target.value})}
                className="accent-orange-500"/>
              <span className="text-sm text-gray-300">{opt}</span>
            </label>
          ))}
        </div>
        <textarea value={form.rpExplanation}
          onChange={e => setForm({...form, rpExplanation: e.target.value})}
          className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition text-sm"
          rows={2} placeholder="Briefly explain your roleplay interest..."/>
      </div>

      {/* VoiceCraft Section */}
      <div className="mb-4 p-4 rounded-lg bg-orange-500/5 border border-orange-500/20 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Mic size={18} className="text-orange-400"/>
          <h4 className="text-sm font-semibold text-white">VoiceCraft — Voice Proximity Chat</h4>
        </div>
        <p className="text-xs text-gray-400">
          VoiceCraft adds proximity voice chat to Minecraft Bedrock. Players near you can hear you speak in real-time — this is <strong className="text-gray-300">required</strong> for our server&apos;s immersive roleplay experience. You must download and install it before joining.
        </p>
        <a href={VOICECRAFT_LINK} target="_blank" rel="noopener noreferrer"
          onClick={() => setVoiceCraftClicked(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 transition-all text-sm font-medium animate-btn-press">
          <Download size={16}/> Download VoiceCraft
        </a>
        {voiceCraftClicked && (
          <p className="text-xs text-emerald-400">✓ Download link opened</p>
        )}
        <label className="flex items-start gap-3 cursor-pointer pt-1">
          <input type="checkbox" checked={form.voiceCraftConfirm}
            onChange={e => setForm({...form, voiceCraftConfirm: e.target.checked})}
            className="mt-1 accent-orange-500"/>
          <span className="text-sm text-gray-300">
            I have downloaded and installed VoiceCraft
          </span>
        </label>
      </div>

      {/* Additional message */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-1">Additional Message to Admin</label>
        <textarea value={form.additionalMessage}
          onChange={e => setForm({...form, additionalMessage: e.target.value})}
          className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition text-sm"
          rows={3} placeholder="Anything else you'd like us to know..."/>
      </div>

      <button type="submit"
        className="w-full py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold transition-all animate-btn-press flex items-center justify-center gap-2">
        <Send size={18}/> {editData ? 'Resubmit Application' : 'Submit Application'}
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
function StatusPage({ user, setPage, addToast }) {
  const [myApp, setMyApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'applications'), where('userId', '==', user.id));
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setMyApp({ id: snap.docs[0].id, ...snap.docs[0].data() });
      } else {
        setMyApp(null);
      }
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [user.id]);

  const formatDate = (ts) => {
    if (!ts) return 'N/A';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString();
  };

  if (editing && myApp) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 max-w-4xl mx-auto">
        <div className="animate-fade-in">
          <button onClick={() => setEditing(false)}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white mb-4 text-sm transition-colors">
            <ChevronRight size={16} className="rotate-180"/> Back to Status
          </button>
          <ApplicationForm
            user={user}
            addToast={addToast}
            setPage={setPage}
            editData={{
              appId: myApp.id,
              discordId: myApp.discordId || '',
              gender: myApp.gender || '',
              age: myApp.age || '',
              socialMedia: myApp.socialMedia || '',
              skinPreview: myApp.skinPreview || '',
              rpInterest: myApp.rpInterest || '',
              rpExplanation: myApp.rpExplanation || '',
              additionalMessage: myApp.additionalMessage || '',
            }}
            onResubmit={() => setEditing(false)}
          />
        </div>
      </div>
    );
  }

  const statusConfig = {
    pending: { icon: <Clock size={32}/>, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Pending Review', desc: 'Your application is being reviewed by our admins.' },
    accepted: { icon: <CheckCircle size={32}/>, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Accepted!', desc: 'Congratulations! You have been whitelisted. Check Discord for server details.' },
    declined: { icon: <XCircle size={32}/>, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Declined', desc: 'Unfortunately your application was declined.' },
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-2xl mx-auto">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-6">Application Status</h1>
        {loading ? (
          <div className="glass rounded-2xl p-8 animate-fade-in space-y-4">
            <Skeleton className="h-16 w-16 rounded-full mx-auto"/>
            <Skeleton className="h-6 w-40 mx-auto"/>
            <Skeleton className="h-4 w-64 mx-auto"/>
            <div className="space-y-2 mt-4">
              <Skeleton className="h-4 w-full"/>
              <Skeleton className="h-4 w-full"/>
              <Skeleton className="h-4 w-3/4"/>
            </div>
          </div>
        ) : myApp ? (() => {
          const cfg = statusConfig[myApp.status];
          return (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-8 text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${cfg.bg} ${cfg.color} mb-4`}>
                  {cfg.icon}
                </div>
                <h2 className={`text-2xl font-bold ${cfg.color} mb-2`}>{cfg.label}</h2>
                <p className="text-gray-400 mb-6">{cfg.desc}</p>
                <div className="glass rounded-xl p-4 text-left space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Gamertag:</span><span className="text-white">{myApp.gamertag}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Discord:</span><span className="text-white">{myApp.discordId}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Submitted:</span><span className="text-white">{formatDate(myApp.submittedAt)}</span></div>
                </div>
              </div>

              {/* Accepted congratulations */}
              {myApp.status === 'accepted' && (
                <div className="rounded-xl p-4 bg-emerald-500/10 border border-emerald-500/30 text-center">
                  <CheckCircle size={24} className="text-emerald-400 mx-auto mb-2"/>
                  <p className="text-emerald-300 font-semibold">🎉 Congratulations! You&apos;re whitelisted!</p>
                  <p className="text-emerald-400/70 text-sm mt-1">Welcome to the server. Check Discord for connection details and rules.</p>
                </div>
              )}

              {/* Declined with reason */}
              {myApp.status === 'declined' && (
                <>
                  <div className="rounded-xl p-4 bg-red-500/10 border border-red-500/30">
                    <p className="text-red-300 font-semibold mb-1">Your application was declined.</p>
                    {myApp.declineReason ? (
                      <p className="text-red-400/80 text-sm">Reason: {myApp.declineReason}</p>
                    ) : (
                      <p className="text-red-400/60 text-sm">No specific reason was provided.</p>
                    )}
                  </div>
                  <button onClick={() => setEditing(true)}
                    className="w-full py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold transition-all animate-btn-press flex items-center justify-center gap-2">
                    <Edit size={18}/> Edit &amp; Resubmit
                  </button>
                </>
              )}
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

// ─── User Profile Page ───
function ProfilePage({ user, addToast, setPage, onProfileUpdate }) {
  const [avatar, setAvatar] = useState('');
  const [editGamertag, setEditGamertag] = useState(user.gamertag || '');
  const [editDiscord, setEditDiscord] = useState('');
  const [myApp, setMyApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const profileSnap = await getDoc(doc(db, 'users', user.id));
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          setAvatar(data.avatar || '');
          setEditDiscord(data.discordId || '');
          setEditGamertag(data.gamertag || user.gamertag || '');
        }
        const q = query(collection(db, 'applications'), where('userId', '==', user.id));
        const appSnap = await getDocs(q);
        if (!appSnap.empty) {
          setMyApp({ id: appSnap.docs[0].id, ...appSnap.docs[0].data() });
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
      setLoading(false);
    })();
  }, [user.id, user.gamertag]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const ref = storageRef(storage, `avatars/${user.id}`);
      await uploadBytes(ref, file);
      const url = await getDownloadURL(ref);
      await updateDoc(doc(db, 'users', user.id), { avatar: url });
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: url });
      }
      setAvatar(url);
      addToast('Avatar updated!', 'success');
    } catch {
      addToast('Failed to upload avatar.', 'error');
    }
    setUploading(false);
  };

  const handleSaveProfile = async () => {
    if (!editGamertag.trim()) {
      addToast('Gamertag cannot be empty.', 'error');
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.id), {
        gamertag: editGamertag.trim(),
        discordId: editDiscord.trim(),
      });
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: editGamertag.trim() });
      }
      onProfileUpdate({ ...user, gamertag: editGamertag.trim() });
      addToast('Profile updated!', 'success');
    } catch {
      addToast('Failed to update profile.', 'error');
    }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    try {
      const q = query(collection(db, 'applications'), where('userId', '==', user.id));
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        await deleteDoc(d.ref);
      }
      await deleteDoc(doc(db, 'users', user.id));
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
      }
      addToast('Account deleted successfully.', 'info');
      setPage('landing');
    } catch (err) {
      if (err.code === 'auth/requires-recent-login') {
        addToast('Please log out and log back in before deleting your account.', 'error');
      } else {
        addToast('Failed to delete account.', 'error');
      }
    }
    setShowDeleteModal(false);
    setDeleteConfirmText('');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 max-w-2xl mx-auto">
        <div className="animate-fade-in space-y-6">
          <Skeleton className="h-8 w-48"/>
          <div className="glass rounded-2xl p-8 space-y-4">
            <Skeleton className="h-20 w-20 rounded-full mx-auto"/>
            <Skeleton className="h-10"/>
            <Skeleton className="h-10"/>
            <Skeleton className="h-10 w-32"/>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-2xl mx-auto">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
          <User size={28} className="text-orange-400"/> My Profile
        </h1>

        {/* Avatar section */}
        <div className="glass rounded-2xl p-8 mb-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-2 border-orange-500/50"/>
              ) : (
                <div className="w-24 h-24 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 border-2 border-orange-500/30">
                  <User size={40}/>
                </div>
              )}
              <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-orange-600 hover:bg-orange-500 flex items-center justify-center cursor-pointer transition-colors">
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                ) : (
                  <Upload size={14} className="text-white"/>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading}/>
              </label>
            </div>
            <p className="text-gray-500 text-xs">Click the icon to upload a new avatar</p>
          </div>

          {/* Profile fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Minecraft Gamertag</label>
              <input type="text" value={editGamertag} onChange={e => setEditGamertag(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition"
                placeholder="YourGamertag"/>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Discord ID</label>
              <input type="text" value={editDiscord} onChange={e => setEditDiscord(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition"
                placeholder="username#1234"/>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input type="text" value={user.email} readOnly
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/60 cursor-not-allowed"/>
            </div>
            <button onClick={handleSaveProfile} disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-semibold transition-all animate-btn-press flex items-center gap-2">
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              ) : (
                <><Check size={16}/> Save Changes</>
              )}
            </button>
          </div>
        </div>

        {/* Application details (read-only) */}
        {myApp && (
          <div className="glass rounded-2xl p-8 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText size={20} className="text-orange-400"/> My Application
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Status:</span>
                <span className={
                  myApp.status === 'accepted' ? 'text-emerald-400' :
                  myApp.status === 'declined' ? 'text-red-400' : 'text-yellow-400'
                }>{myApp.status.charAt(0).toUpperCase() + myApp.status.slice(1)}</span>
              </div>
              <div className="flex justify-between"><span className="text-gray-500">Gamertag:</span><span className="text-white">{myApp.gamertag}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Discord:</span><span className="text-white">{myApp.discordId}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Age:</span><span className="text-white">{myApp.age}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Gender:</span><span className="text-white">{myApp.gender}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">RP Interest:</span><span className="text-white">{myApp.rpInterest}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Submitted:</span><span className="text-white">{new Date(myApp.submittedAt).toLocaleDateString()}</span></div>
            </div>
          </div>
        )}

        {/* Danger zone */}
        <div className="glass rounded-2xl p-8 border border-red-500/20">
          <h2 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h2>
          <p className="text-gray-500 text-sm mb-4">Permanently delete your account and all associated data.</p>
          <button onClick={() => setShowDeleteModal(true)}
            className="px-6 py-2.5 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-all animate-btn-press flex items-center gap-2 text-sm font-medium">
            <Trash2 size={16}/> Delete Account
          </button>
        </div>

        {/* Delete confirmation modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="w-full max-w-md glass rounded-2xl p-8 animate-fade-in">
              <h3 className="text-xl font-bold text-red-400 mb-2">Delete Account</h3>
              <p className="text-gray-400 text-sm mb-4">
                This action cannot be undone. All your data, including your application, will be permanently deleted.
              </p>
              <p className="text-gray-400 text-sm mb-3">Type <strong className="text-white">DELETE</strong> to confirm:</p>
              <input type="text" value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 transition mb-4"
                placeholder="DELETE"/>
              <div className="flex gap-3">
                <button onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                  className="flex-1 py-2.5 rounded-lg glass glass-hover text-gray-300 font-medium transition-all text-sm">
                  Cancel
                </button>
                <button onClick={handleDeleteAccount} disabled={deleteConfirmText !== 'DELETE'}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium transition-all text-sm">
                  Delete Forever
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// ─── Relative time helper ───
function timeAgo(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
  return d.toLocaleDateString();
}

function formatTimestamp(ts) {
  if (!ts) return 'N/A';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString();
}

// ─── Admin Panel ───
function AdminPanel({ addToast }) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  // Site settings state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState({
    serverName: 'MalaySMP',
    tagline: 'Private Minecraft Roleplay Server',
    description: '',
    backgroundImage: '',
    accentColor: '#f97316',
    announcement: '',
    announcementEnabled: false,
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [bgUploading, setBgUploading] = useState(false);

  // Reset modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirm, setResetConfirm] = useState('');

  // Decline modal
  const [declineTarget, setDeclineTarget] = useState(null);
  const [declineReason, setDeclineReason] = useState('');

  // Load site settings
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'siteSettings', 'config'));
        if (snap.exists()) {
          setLocalSettings(prev => ({ ...prev, ...snap.data() }));
        }
      } catch (err) {
        console.error('Failed to load site settings:', err);
      }
    })();
  }, []);

  // Real-time listener on all applications
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'applications'), (snap) => {
      setApps(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const updateStatus = async (appId, status) => {
    try {
      await updateDoc(doc(db, 'applications', appId), { status });
      addToast(`Application ${status === 'accepted' ? 'accepted ✅' : 'declined ❌'}`, status === 'accepted' ? 'success' : 'error');
    } catch {
      addToast('Failed to update application status.', 'error');
    }
  };

  const handleDeclineConfirm = async () => {
    if (!declineTarget || declineReason.length < MIN_DECLINE_REASON_LENGTH) return;
    try {
      await updateDoc(doc(db, 'applications', declineTarget), {
        status: 'declined',
        declineReason: declineReason,
      });
      addToast('Application declined ❌', 'error');
    } catch {
      addToast('Failed to decline application.', 'error');
    }
    setDeclineTarget(null);
    setDeclineReason('');
  };

  // Site settings handlers
  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    try {
      await setDoc(doc(db, 'siteSettings', 'config'), localSettings);
      addToast('Site settings saved!', 'success');
    } catch {
      addToast('Failed to save site settings.', 'error');
    }
    setSettingsSaving(false);
  };

  const handleBgUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBgUploading(true);
    try {
      const ref = storageRef(storage, 'site/background');
      await uploadBytes(ref, file);
      const url = await getDownloadURL(ref);
      setLocalSettings(prev => ({ ...prev, backgroundImage: url }));
      addToast('Background image uploaded!', 'success');
    } catch {
      addToast('Failed to upload background image.', 'error');
    }
    setBgUploading(false);
  };

  // Reset all applications — supports >500 docs with multiple batches
  const handleResetAll = async () => {
    if (resetConfirm !== 'RESET') return;
    try {
      const snap = await getDocs(collection(db, 'applications'));
      const docs = snap.docs;
      // Split into batches of 500 (Firestore limit)
      for (let i = 0; i < docs.length; i += FIRESTORE_BATCH_LIMIT) {
        const batch = writeBatch(db);
        const chunk = docs.slice(i, i + FIRESTORE_BATCH_LIMIT);
        chunk.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
      addToast(`All ${docs.length} applications have been reset.`, 'success');
    } catch (err) {
      addToast(`Failed to reset applications: ${err.message || 'Unknown error'}`, 'error');
    }
    setShowResetModal(false);
    setResetConfirm('');
  };

  // Export CSV
  const handleExportCSV = () => {
    if (apps.length === 0) {
      addToast('No applications to export.', 'error');
      return;
    }
    const headers = ['Gamertag', 'Email', 'Discord', 'Age', 'Gender', 'Status', 'Social Media', 'RP Interest', 'Submitted'];
    const rows = apps.map(a => [
      a.gamertag, a.email, a.discordId, a.age, a.gender, a.status,
      a.socialMedia || '', a.rpInterest, formatTimestamp(a.submittedAt),
    ]);
    const csv = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const prefix = (localSettings.serverName || 'MalaySMP').toLowerCase().replace(/\s+/g, '-');
    link.download = `${prefix}-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('CSV exported!', 'success');
  };

  const filteredApps = apps
    .filter(a => {
      const matchesTab = tab === 'all' ? true :
        tab === 'pending' ? a.status === 'pending' :
        tab === 'accepted' ? a.status === 'accepted' :
        tab === 'declined' ? a.status === 'declined' : true;
      const matchesSearch = searchQuery === '' ||
        a.gamertag?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.discordId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.email?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    })
    .sort((a, b) => {
      const getTime = (ts) => {
        if (!ts) return 0;
        return ts.toDate ? ts.toDate().getTime() : new Date(ts).getTime();
      };
      return sortOrder === 'newest'
        ? getTime(b.submittedAt) - getTime(a.submittedAt)
        : getTime(a.submittedAt) - getTime(b.submittedAt);
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
          <div className="flex gap-2">
            <button onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 transition-all text-sm font-medium animate-btn-press">
              <Download size={16}/> Export CSV
            </button>
            <button onClick={() => setShowResetModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-all text-sm font-medium animate-btn-press">
              <Trash2 size={16}/> Reset All
            </button>
          </div>
        </div>

        {/* ─── Site Settings (collapsible) ─── */}
        <div className="mb-6">
          <button onClick={() => setSettingsOpen(!settingsOpen)}
            className="w-full flex items-center justify-between px-5 py-3 glass rounded-xl text-white hover:bg-white/5 transition-all">
            <span className="flex items-center gap-2 font-semibold">
              <Settings size={18} className="text-orange-400"/> Site Settings
            </span>
            <ChevronRight size={18} className={`text-gray-400 transition-transform duration-200 ${settingsOpen ? 'rotate-90' : ''}`}/>
          </button>

          {settingsOpen && (
            <div className="glass rounded-xl mt-2 p-6 animate-fade-in space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-sm text-gray-400 mb-1">
                    <Type size={14}/> Server Name
                  </label>
                  <input type="text" value={localSettings.serverName}
                    onChange={e => setLocalSettings(prev => ({ ...prev, serverName: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition"
                    placeholder="MalaySMP"/>
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm text-gray-400 mb-1">
                    <Type size={14}/> Tagline
                  </label>
                  <input type="text" value={localSettings.tagline}
                    onChange={e => setLocalSettings(prev => ({ ...prev, tagline: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition"
                    placeholder="Private Minecraft Roleplay Server"/>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea value={localSettings.description}
                  onChange={e => setLocalSettings(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition text-sm"
                  rows={3} placeholder="Server description for the landing page..."/>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-sm text-gray-400 mb-1">
                    <Image size={14}/> Background Image
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:border-orange-500/50 cursor-pointer transition text-sm">
                      {bgUploading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                      ) : (
                        <Upload size={14}/>
                      )}
                      Upload
                      <input type="file" accept="image/*" className="hidden" onChange={handleBgUpload} disabled={bgUploading}/>
                    </label>
                    {localSettings.backgroundImage && (
                      <img src={localSettings.backgroundImage} alt="BG preview" className="w-10 h-10 rounded-lg object-cover border border-white/10"/>
                    )}
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm text-gray-400 mb-1">
                    <Palette size={14}/> Accent Color
                  </label>
                  <input type="text" value={localSettings.accentColor}
                    onChange={e => setLocalSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition"
                    placeholder="#f97316"/>
                </div>
              </div>

              {/* Announcement */}
              <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-sm text-gray-300 font-medium">
                    <Megaphone size={14} className="text-orange-400"/> Announcement Banner
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-gray-500">{localSettings.announcementEnabled ? 'Enabled' : 'Disabled'}</span>
                    <input type="checkbox" checked={localSettings.announcementEnabled}
                      onChange={e => setLocalSettings(prev => ({ ...prev, announcementEnabled: e.target.checked }))}
                      className="accent-orange-500"/>
                  </label>
                </div>
                <input type="text" value={localSettings.announcement}
                  onChange={e => setLocalSettings(prev => ({ ...prev, announcement: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition text-sm"
                  placeholder="Announcement message..."/>
              </div>

              <button onClick={handleSaveSettings} disabled={settingsSaving}
                className="px-6 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-semibold transition-all animate-btn-press flex items-center gap-2">
                {settingsSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                ) : (
                  <><Check size={16}/> Save Settings</>
                )}
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="animate-fade-in space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="glass rounded-xl p-4 space-y-2">
                  <Skeleton className="h-9 w-9 rounded-lg"/>
                  <Skeleton className="h-8 w-16"/>
                  <Skeleton className="h-4 w-20"/>
                </div>
              ))}
            </div>
            {[1,2,3].map(i => (
              <div key={i} className="glass rounded-xl p-5 space-y-3">
                <div className="flex gap-4">
                  <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0"/>
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-40"/>
                    <Skeleton className="h-4 w-64"/>
                    <Skeleton className="h-4 w-48"/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (<>

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

        {/* Search, tabs, and sort */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by gamertag, Discord ID, or email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition text-sm"/>
          </div>
          <div className="flex gap-1 p-1 glass rounded-lg">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 rounded-md text-sm transition-all flex items-center gap-1.5 ${
                  tab === t.key ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400 hover:text-white'
                }`}>
                {t.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  tab === t.key ? 'bg-orange-500/30' : 'bg-white/10'
                }`}>{t.count}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
            className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-lg text-sm text-gray-400 hover:text-white transition-all">
            <ArrowUpDown size={14}/> {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
          </button>
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
                      <img src={app.skinPreview} alt="Skin" className="w-16 h-16 rounded-lg border border-white/10" style={{ imageRendering: 'pixelated' }}/>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-600">
                        <Gamepad2 size={24}/>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-white">{app.gamertag}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        app.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        app.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                      {app.isResubmission && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                          Resubmission
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      Submitted: {formatTimestamp(app.submittedAt)} · {timeAgo(app.submittedAt)}
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
                    {app.declineReason && (
                      <p className="text-sm text-red-400 mt-1"><span className="text-red-500">Decline Reason:</span> {app.declineReason}</p>
                    )}
                  </div>

                  {/* Actions */}
                  {app.status === 'pending' && (
                    <div className="flex md:flex-col gap-2 flex-shrink-0">
                      <button onClick={() => updateStatus(app.id, 'accepted')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-all text-sm font-medium animate-btn-press">
                        <Check size={16}/> Accept
                      </button>
                      <button onClick={() => { setDeclineTarget(app.id); setDeclineReason(''); }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-all text-sm font-medium animate-btn-press">
                        <XCircle size={16}/> Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        </>)}

        {/* Reset All confirmation modal */}
        {showResetModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="w-full max-w-md glass rounded-2xl p-8 animate-fade-in">
              <h3 className="text-xl font-bold text-red-400 mb-2">Reset All Applications</h3>
              <p className="text-gray-400 text-sm mb-4">
                This will permanently delete all applications. This action cannot be undone.
              </p>
              <p className="text-gray-400 text-sm mb-3">Type <strong className="text-white">RESET</strong> to confirm:</p>
              <input type="text" value={resetConfirm} onChange={e => setResetConfirm(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 transition mb-4"
                placeholder="RESET"/>
              <div className="flex gap-3">
                <button onClick={() => { setShowResetModal(false); setResetConfirm(''); }}
                  className="flex-1 py-2.5 rounded-lg glass glass-hover text-gray-300 font-medium transition-all text-sm">
                  Cancel
                </button>
                <button onClick={handleResetAll} disabled={resetConfirm !== 'RESET'}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium transition-all text-sm">
                  Delete All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Decline Reason Modal */}
        {declineTarget && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="w-full max-w-md glass rounded-2xl p-8 animate-fade-in">
              <h3 className="text-xl font-bold text-red-400 mb-2">Decline Application</h3>
              <p className="text-gray-400 text-sm mb-4">
                Provide a reason for declining. This will be visible to the applicant.
              </p>
              <textarea value={declineReason} onChange={e => setDeclineReason(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 transition text-sm mb-1"
                rows={4} placeholder="Reason for declining (minimum 10 characters)..."/>
              <p className="text-xs text-gray-500 mb-4">{declineReason.length}/{MIN_DECLINE_REASON_LENGTH} characters minimum</p>
              <div className="flex gap-3">
                <button onClick={() => { setDeclineTarget(null); setDeclineReason(''); }}
                  className="flex-1 py-2.5 rounded-lg glass glass-hover text-gray-300 font-medium transition-all text-sm">
                  Cancel
                </button>
                <button onClick={handleDeclineConfirm} disabled={declineReason.length < MIN_DECLINE_REASON_LENGTH}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium transition-all text-sm">
                  Confirm Decline
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Members Page (Public) ───
function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, 'applications'), where('status', '==', 'accepted'));
        const snap = await getDocs(q);
        setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Failed to load members:', err);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-6xl mx-auto">
      <div className="animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Users size={28} className="text-orange-400"/> Server Members
          </h1>
          <p className="text-gray-500">Players who have been accepted into the server.</p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="glass rounded-xl p-6 space-y-3">
                <Skeleton className="h-16 w-16 rounded-lg mx-auto"/>
                <Skeleton className="h-5 w-32 mx-auto"/>
                <Skeleton className="h-4 w-24 mx-auto"/>
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Users size={32} className="mx-auto mb-3 text-gray-600"/>
            <p className="text-gray-500">No accepted members yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map(m => (
              <div key={m.id} className="glass glass-hover rounded-xl p-6 text-center transition-all">
                {m.skinPreview ? (
                  <img src={m.skinPreview} alt={m.gamertag} className="w-16 h-16 rounded-lg mx-auto mb-3 border border-white/10" style={{ imageRendering: 'pixelated' }}/>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-600 mx-auto mb-3">
                    <Gamepad2 size={28}/>
                  </div>
                )}
                <h3 className="text-white font-semibold text-lg">{m.gamertag}</h3>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                  Whitelisted
                </span>
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
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('landing');
  const [toasts, setToasts] = useState([]);
  const [transitioning, setTransitioning] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState({});

  // Listen for site settings
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'siteSettings', 'config'), (snap) => {
      if (snap.exists()) {
        setSiteSettings(snap.data());
      }
    }, (err) => {
      console.error('Failed to load site settings:', err);
    });
    return unsub;
  }, []);

  // Listen for Firebase auth state changes (persists across refreshes)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (snap.exists()) {
            const profile = snap.data();
            const u = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || profile.displayName || '',
              photoURL: firebaseUser.photoURL || profile.photoURL || '',
              gamertag: profile.gamertag || 'Player',
              emailVerified: firebaseUser.emailVerified,
              isAdmin: firebaseUser.email === ADMIN_EMAIL,
            };
            setUser(u);
            setPage(u.isAdmin ? 'admin' : 'dashboard');
          } else {
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || '',
              gamertag: '',
              emailVerified: firebaseUser.emailVerified,
              isAdmin: firebaseUser.email === ADMIN_EMAIL,
            });
            setPage('setup-gamertag');
          }
        } catch {
          setUser(null);
          setPage('landing');
        }
      } else {
        setUser(null);
        setPage('landing');
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

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

  const handleGamertagComplete = useCallback((u) => {
    setUser(u);
    navigate(u.isAdmin ? 'admin' : 'dashboard');
  }, [navigate]);

  const handleProfileUpdate = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch { /* ignore */ }
    setUser(null);
    navigate('landing');
    addToast('Logged out successfully.', 'info');
  }, [navigate, addToast]);

  // Background image style from site settings
  const bgStyle = siteSettings.backgroundImage ? {
    backgroundImage: `url(${siteSettings.backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  } : {};

  if (authLoading) {
    return (
      <div className="relative min-h-screen bg-[#0a0a0a] text-gray-200 flex items-center justify-center">
        <Particles/>
        <div className="text-center animate-fade-in">
          <Flame size={40} className="mx-auto text-orange-400 animate-float mb-4"/>
          <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-3"/>
          <p className="text-gray-500 text-sm">Loading MalaySMP…</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (page) {
      case 'landing': return <LandingPage setPage={navigate} siteSettings={siteSettings}/>;
      case 'login': return <AuthPage addToast={addToast}/>;
      case 'members': return <MembersPage/>;
      case 'setup-gamertag': return user ? <GamertagSetup user={user} onComplete={handleGamertagComplete} addToast={addToast}/> : <LandingPage setPage={navigate} siteSettings={siteSettings}/>;
      case 'dashboard': return user ? <Dashboard user={user} addToast={addToast} setPage={navigate}/> : <LandingPage setPage={navigate} siteSettings={siteSettings}/>;
      case 'status': return user ? <StatusPage user={user} setPage={navigate} addToast={addToast}/> : <LandingPage setPage={navigate} siteSettings={siteSettings}/>;
      case 'profile': return user ? <ProfilePage user={user} addToast={addToast} setPage={navigate} onProfileUpdate={handleProfileUpdate}/> : <LandingPage setPage={navigate} siteSettings={siteSettings}/>;
      case 'admin': return user?.email === ADMIN_EMAIL ? <AdminPanel addToast={addToast}/> : <LandingPage setPage={navigate} siteSettings={siteSettings}/>;
      default: return <LandingPage setPage={navigate} siteSettings={siteSettings}/>;
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-gray-200" style={bgStyle}>
      <Particles/>
      <Navbar page={page} setPage={navigate} user={user} onLogout={handleLogout}/>
      <ToastContainer toasts={toasts} removeToast={removeToast}/>
      {siteSettings.announcementEnabled && siteSettings.announcement && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-orange-600/90 backdrop-blur text-white text-center py-2 px-4 text-sm flex items-center justify-center gap-2">
          <Megaphone size={14}/> {siteSettings.announcement}
        </div>
      )}
      <div className={`transition-opacity duration-200 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
        {renderPage()}
      </div>
    </div>
  );
}
