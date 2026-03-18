import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Flame, Shield, Users, Star, Youtube, MessageCircle, Heart, ExternalLink,
  LogIn, UserPlus, LogOut, Menu, X, ChevronRight, ChevronLeft, Send, Upload, Check,
  XCircle, Clock, Search, Bell, Eye, Gamepad2, Mic, Globe, Filter,
  Home, FileText, Settings, CheckCircle, AlertCircle, Sparkles,
  RefreshCw, Trash2, Download, Palette, Image, User, Megaphone, Type,
  ArrowUpDown, Edit, LayoutDashboard, Link2, BookOpen, SkipForward, UserX,
  Calendar, Plus, CalendarDays,
  Ban, AlertTriangle,
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
  updateDoc, deleteDoc, query, where, orderBy, onSnapshot, writeBatch,
  serverTimestamp,
  storageRef, uploadBytes, getDownloadURL, deleteObject,
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
const FIRESTORE_BATCH_LIMIT = 500;
const VALID_SKIN_DIMENSIONS = [[64, 64], [64, 128]];
const DEFAULT_STEVE_SKIN = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAFDUlEQVR42u2a20sUURzH97+I/gzfeuipKIggelARBD1EQVBQD0FBRJeXIqMkMmsrK7O8pZm3NNdbbXXV9bL3mdnZ2ZnZ+8XvOTOr7ZjXnVlX54cfzO7szO75fM/5nXPmjEolISEhISEhISEhISEhMYe4CJYYweJ/fUFfCU4Y/PchScjCJfhXGAe/g5/AJ+AXkIEIDGJePAn/Ai6RR/AHCAt8RFjAfUbw6PsnkB/xKi8LfjEI1gEl4NteqkkvBS7jnf8I1zHOPwwJ/7gTenY2Ax+7d93ifayz62fB7CRy1Y8jP0poQw9/BAl8CjTCNdIh8vMrOK3ESAM58XNIAaV+x74fF/gXSk8rNEiHyNdPIm3wEw3IjdI+5pRK0F2dkN0IlGIPiL2u2HIOJ7vA3Kwq/hfOkR9AQTQH/IVHM+mfMpHAZN9JdjJG0E+k0bEQUomQINqU/RPqjd//g/SIJqHIv5VPkDrL+T89kmGzZ6FGxDhRPIGXH0PdMIvewE+x4f+0gvYwdOZmUQMILU40nnFhKu+x52Xm0mBU2OvUa7LE1oGqWflD/9n9uIEA+cR7GKu/QWQH9x3I+QA/6fPsxXq4f6r2MJ6aF2gxaLBrYlRNBv/g66z9OKBmn0G/I91IjbXCHF2wdH0gT1dlRPtcxp2vD8cCjzzjSYJ1+tVCHvgBH0J+nvTeCxJmEVPAwD0BbDbrBHPo7IhgS+FjqL5SIT8T5hyInOb6E6tGbqLnKJvRwR86TnG+v1j9xBJMl8FfCYNEeSWjHOQ9sSU6K3NdCBJyMQ2J+tQ7d5+dGBt1jN8pQVEyNITgdzBfgFwxPhYBKmSJaBJYxKCfuRZEXfJ/G2kH1uOdBkZF7LBNbRjJvVWdU3Sn2+LqoH+nXsS+ISnQ/x4VOl5sXq16EO8Dg7j/b9nJMgSAcIQEhISUrrBN2hVT7M2+Wp+qUmFz1aYK60mLTw3yfHR0fKSo+nT3c5OBjmYYyF8y81mZ3LBVqI7TxgS8k3f4mVlB0OjV/M0Kt2GUJVLJ/PcmpC9v/2f9jxfJX7z4l/5FPbLJVFSj+y1VwH3fJHybHQFP8zy8rp7MNJabnPYOd1/rMk/V6BRf3m0BO56KZzl7hbufeWf/T4+Z3v7tFXhd0HzKR4n3fCJPHwRNdJfZs6Bg3fUiY9VW8rNjhSXjEXpZ9cbb9fVq/7XTCKkLy3dGv3L7zfcq70WT9X0R/8+rR5Nj+9u7tO3u/f/6pOf/1uJ5KPDE2Y++4Pk3d5T+W1Zr9lVVHiCYj6X64HT9pN3Ln64YcvAOZUKavDCj0PbC/Z0U3M/03NLvXjKF3b8sHT3I84+kX1jVGEW/JWxYe3tN+ybWZp3SqFXaXXfnTmVbkNrnX3s6Yq/7DwTLm8MwS/KR/UDhUV+K44s2m4rdWj/UyLO78m38fzeSZm4qnp5Q7j5OqF4xpb2GPSxW41xz2OoZz5qwuE6hO8ZCwSr+28+TaR8Pw5wZEV4UKGp2ecAV2dfjhc5MQFHklkNAjkJ0SCGi1/5evbqwXGDp7RG7gVnGaFW50d4fSNd1h/tX/2OMJ3V4Dh1BXXLZN6I8yTyVZ+IZ7qFvlB2qJx4tNe8J3v+xPVDwFVw87gQ/o8Y/TCSHUYBJfEVBfhnJFKxX8E1+Bd/UOoIQkJCQkJCQkJCQkJCQkrxP3FH8/bMz1lLAAAAAElFTkSuQmCC';

const EVENT_STATUSES = {
  open:        { label: 'Open',         color: 'bg-emerald-500/20 text-emerald-400', icon: CheckCircle,   canJoin: true,  userMessage: null },
  full:        { label: 'Full',         color: 'bg-red-500/20 text-red-400',         icon: Users,         canJoin: false, userMessage: 'This event is full. No more spots available.' },
  cancelled:   { label: 'Cancelled',    color: 'bg-gray-500/20 text-gray-400',       icon: Ban,           canJoin: false, userMessage: 'This event has been cancelled.' },
  coming_soon: { label: 'Coming Soon',  color: 'bg-blue-500/20 text-blue-400',       icon: Clock,         canJoin: false, userMessage: 'Registration is not yet open. Stay tuned!' },
  ended:       { label: 'Ended',        color: 'bg-gray-500/20 text-gray-400',       icon: XCircle,       canJoin: false, userMessage: 'This event has ended.' },
  maintenance: { label: 'Maintenance',  color: 'bg-yellow-500/20 text-yellow-400',   icon: AlertTriangle, canJoin: false, userMessage: 'This event is temporarily unavailable for maintenance.' },
};

const RULES_TEXT = [
  {
    title: 'Berkaitan Dalam Server',
    rules: [
      'Para pemain tidak dibenarkan memasang atau menggunakan toolbox, script, x-ray, dup machine & mana-mana cheating software (sebarang bentuk eksploitasi melanggar permainan minecraft normal)',
      'Para pemain tidak dibenarkan menyebabkan server menjadi lag.',
      'Para pemain tidak dibenarkan melakukan sebarang griefing yang melampaui batas.',
      'Para pemain harus kekal mengikut roleplay masing-masing.',
    ],
  },
  {
    title: 'Berkaitan Pemain',
    rules: [
      'Para pemain harus menghormati privasi antara satu sama lain, tidak berkongsi maklumat pribadi.',
      'Para pemain tidak dibenarkan melakukan sebarang bentuk pembulian, mass massacre tanpa reason yang munasabah (gila pvp) di dalam server.',
    ],
  },
  {
    title: 'Hak Cipta',
    rules: [
      'Para pemain bersetuju untuk membenarkan video, gambar, audio berkaitan server digunakan oleh LostShark Studio.',
      'LostShark Studio mempunyai hak ke atas rakaman, gambar dan segala bentuk media berkaitan server (untuk dimasukkan ke dalam konten).',
    ],
  },
  {
    title: 'Lain-Lain',
    rules: [
      'Para pemain wajib menggunakan mic (voice proximity) untuk bermain.',
      'Para pemain tidak dibenarkan memasuki Nether atau The End. Event ini hanya dijalankan di Overworld sahaja.',
      'Jika server berstatus event maka hanya pemain yang telah berdaftar serta tersenarai di #Whitelisted dibenarkan berada di dalam server.',
    ],
  },
];

const APP_STEPS = [
  { label: 'Rules', icon: 'BookOpen' },
  { label: 'Profile', icon: 'User' },
  { label: 'Details', icon: 'FileText' },
  { label: 'Social', icon: 'Globe' },
  { label: 'Skin', icon: 'Upload' },
  { label: 'Roleplay', icon: 'Gamepad2' },
  { label: 'VoiceCraft', icon: 'Mic' },
  { label: 'Submit', icon: 'Send' },
];

// ─── Helpers ───
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function getEventStatus(ev) { return ev.status || (ev.active ? 'open' : 'ended'); }

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

// ─── Notification Dropdown ───
function NotificationDropdown({ notifications, onMarkRead, onClose }) {
  return (
    <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto glass rounded-xl border border-white/10 shadow-2xl animate-fade-in z-50">
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Notifications</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={14}/></button>
      </div>
      {notifications.length === 0 ? (
        <div className="p-6 text-center text-gray-500 text-sm">No notifications yet</div>
      ) : (
        <div className="divide-y divide-white/5">
          {notifications.map(n => (
            <div key={n.id}
              className={`p-3 hover:bg-white/5 transition-colors cursor-pointer ${!n.read ? 'bg-orange-500/5' : ''}`}
              onClick={() => onMarkRead(n.id)}>
              <div className="flex items-start gap-2">
                <div className={`mt-0.5 flex-shrink-0 ${
                  n.type === 'accepted' ? 'text-emerald-400' :
                  n.type === 'declined' ? 'text-red-400' :
                  n.type === 'removed' ? 'text-yellow-400' : 'text-blue-400'
                }`}>
                  {n.type === 'accepted' ? <CheckCircle size={16}/> :
                   n.type === 'declined' ? <XCircle size={16}/> :
                   n.type === 'removed' ? <UserX size={16}/> : <Bell size={16}/>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.read ? 'text-white' : 'text-gray-400'}`}>{n.message}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{n.timeAgo || ''}</p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0 mt-1.5"/>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Navbar ───
function Navbar({ page, setPage, user, onLogout, notifications, onMarkNotifRead }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const isAdmin = user?.email === ADMIN_EMAIL;
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const navItems = user ? (
    isAdmin ? [
      { label: 'Dashboard', icon: <Settings size={16}/>, page: 'admin' },
      { label: 'Events', icon: <CalendarDays size={16}/>, page: 'events' },
      { label: 'Members', icon: <Users size={16}/>, page: 'members' },
      { label: 'Server', icon: <Globe size={16}/>, page: 'server' },
    ] : [
      { label: 'Home', icon: <Home size={16}/>, page: 'landing' },
      { label: 'Dashboard', icon: <LayoutDashboard size={16}/>, page: 'dashboard' },
      { label: 'Events', icon: <CalendarDays size={16}/>, page: 'events' },
      { label: 'Members', icon: <Users size={16}/>, page: 'members' },
      { label: 'Server', icon: <Globe size={16}/>, page: 'server' },
      { label: 'Profile', icon: <User size={16}/>, page: 'profile' },
    ]
  ) : [
    { label: 'Home', icon: <Home size={16}/>, page: 'landing' },
    { label: 'Events', icon: <CalendarDays size={16}/>, page: 'events' },
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
          {user && !isAdmin && (
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)}
                className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                <Bell size={16}/>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <NotificationDropdown
                  notifications={notifications || []}
                  onMarkRead={(id) => { onMarkNotifRead(id); }}
                  onClose={() => setNotifOpen(false)}
                />
              )}
            </div>
          )}
          {user && (
            <button onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all ml-2">
              <LogOut size={16}/> Logout
            </button>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          {user && !isAdmin && (
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)}
                className="relative text-gray-400 hover:text-white p-1">
                <Bell size={20}/>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <NotificationDropdown
                  notifications={notifications || []}
                  onMarkRead={(id) => { onMarkNotifRead(id); }}
                  onClose={() => setNotifOpen(false)}
                />
              )}
            </div>
          )}
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-400 hover:text-white">
            {menuOpen ? <X size={24}/> : <Menu size={24}/>}
          </button>
        </div>
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

// ─── Footer ───
function Footer({ siteSettings }) {
  const serverName = siteSettings?.serverName || 'MalaySMP';
  return (
    <footer className="relative z-10 border-t border-white/5 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 text-orange-400 font-bold text-lg">
            <Flame size={22}/> {serverName}
          </div>
          <SocialBar/>
          <div className="w-full border-t border-white/5 pt-6">
            <p className="text-center text-gray-600 text-sm">
              &copy; {new Date().getFullYear()} {serverName}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Landing Page ───
function LandingPage({ setPage, siteSettings, user }) {
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
    { icon: <Gamepad2 size={28}/>, title: 'Bedrock Edition', desc: 'Play on any device \u2014 Xbox, Mobile, PC, Switch, and more.' },
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
            <button onClick={() => setPage(user ? 'dashboard' : 'login')}
              className="px-8 py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold transition-all animate-pulse-glow animate-btn-press flex items-center justify-center gap-2">
              {user ? <><Send size={18}/> Go to Dashboard</> : <><LogIn size={18}/> Apply Now</>}
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

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="glass rounded-2xl p-10">
          <h2 className="text-3xl font-bold text-white mb-3">Ready to Begin Your Story?</h2>
          <p className="text-gray-400 mb-6">
            {user ? 'Head to your dashboard to submit your application and join the server.' : 'Create an account and submit your application to join the server.'}
          </p>
          <button onClick={() => setPage(user ? 'dashboard' : 'login')}
            className="px-8 py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold transition-all animate-btn-press inline-flex items-center gap-2">
            {user ? <><LayoutDashboard size={18}/> Go to Dashboard <ChevronRight size={18}/></> : <>Sign In with Google to Apply <ChevronRight size={18}/></>}
          </button>
        </div>
      </section>
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

// ─── Step Progress Bar ───
function StepProgress({ currentStep, totalSteps, stepLabels }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex flex-col items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              i < currentStep ? 'bg-orange-500 text-white' :
              i === currentStep ? 'bg-orange-500/30 text-orange-400 ring-2 ring-orange-500/50' :
              'bg-white/5 text-gray-600'
            }`}>
              {i < currentStep ? <Check size={14}/> : i + 1}
            </div>
            <span className={`text-[10px] mt-1 text-center hidden md:block ${
              i <= currentStep ? 'text-orange-400' : 'text-gray-600'
            }`}>{stepLabels?.[i] || ''}</span>
          </div>
        ))}
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full transition-all duration-500"
          style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}/>
      </div>
    </div>
  );
}

// ─── Application Form (Multi-Step Wizard) ───
function ApplicationForm({ user, addToast, setPage, editData, onResubmit, event }) {
  const [loading, setLoading] = useState(!editData);
  const [step, setStep] = useState(editData ? 1 : 0);
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
    rulesAccepted: !!editData,
  });
  const [submitted, setSubmitted] = useState(false);
  const [skinError, setSkinError] = useState('');
  const [voiceCraftClicked, setVoiceCraftClicked] = useState(false);
  const [rulesScrolled, setRulesScrolled] = useState(false);
  const rulesRef = useRef(null);

  const TOTAL_STEPS = 8;
  const stepLabels = APP_STEPS.map(s => s.label);

  useEffect(() => {
    if (editData) {
      return;
    }
    (async () => {
      try {
        const filters = [where('userId', '==', user.id)];
        if (event?.id) {
          filters.push(where('eventId', '==', event.id));
        }
        const q = query(collection(db, 'applications'), ...filters);
        const snap = await getDocs(q);
        if (!snap.empty) {
          setSubmitted(true);
        }
      } catch (err) {
        console.error('Failed to check existing application:', err);
      }
      setLoading(false);
    })();
  }, [user.id, editData, event?.id]);

  const handleRulesScroll = () => {
    if (!rulesRef.current) return;
    const el = rulesRef.current;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 20;
    if (atBottom) setRulesScrolled(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSkinError('');
    if (!file.name.toLowerCase().endsWith('.png') || file.type !== 'image/png') {
      setSkinError('Invalid skin. Must be a 64\u00d764 or 64\u00d7128 PNG file.');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.onload = () => {
        const valid = VALID_SKIN_DIMENSIONS.some(([w, h]) => img.width === w && img.height === h);
        if (!valid) {
          setSkinError('Invalid skin. Must be a 64\u00d764 or 64\u00d7128 PNG file.');
          setForm(prev => ({ ...prev, skinPreview: '' }));
        } else {
          setSkinError('');
          setForm(prev => ({ ...prev, skinPreview: ev.target.result }));
        }
      };
      img.onerror = () => {
        setSkinError('Invalid skin. Must be a 64\u00d764 or 64\u00d7128 PNG file.');
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
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
        await updateDoc(doc(db, 'applications', editData.appId), {
          ...form,
          status: 'pending',
          declineReason: '',
          isResubmission: true,
          submittedAt: serverTimestamp(),
          eventId: event?.id || editData?.eventId || '',
          eventName: event?.name || editData?.eventName || '',
        });
        addToast('Application resubmitted! Please wait for admin review.', 'success');
        if (onResubmit) onResubmit();
      } else {
        const appId = genId();
        await setDoc(doc(db, 'applications', appId), {
          id: appId,
          userId: user.id,
          email: user.email,
          photoURL: user.photoURL || '',
          displayName: user.displayName || '',
          status: 'pending',
          submittedAt: serverTimestamp(),
          eventId: event?.id || '',
          eventName: event?.name || '',
          ...form,
        });
        setSubmitted(true);
        addToast('Your application has been submitted!', 'success');
      }
    } catch (err) {
      console.error('Failed to submit application:', err);
      addToast('Failed to submit application. Please try again.', 'error');
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, TOTAL_STEPS - 1));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

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

  const navButtons = (canNext, onNext) => (
    <div className="flex gap-3 mt-6">
      {step > 0 && (
        <button type="button" onClick={prevStep}
          className="flex-1 py-3 rounded-lg glass glass-hover text-gray-300 font-semibold transition-all animate-btn-press flex items-center justify-center gap-2">
          <ChevronLeft size={18}/> Back
        </button>
      )}
      <button type="button" onClick={onNext || nextStep} disabled={!canNext}
        className="flex-1 py-3 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold transition-all animate-btn-press flex items-center justify-center gap-2">
        {step === TOTAL_STEPS - 1 ? (
          <><Send size={18}/> {editData ? 'Resubmit Application' : 'Complete Application'}</>
        ) : (
          <>Confirm <ChevronRight size={18}/></>
        )}
      </button>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      // ─── Step 0: Rules ───
      case 0:
        return (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                <BookOpen size={20}/>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Server Rules & Agreement</h3>
                <p className="text-gray-500 text-xs">Please read all rules carefully before proceeding</p>
              </div>
            </div>
            <div ref={rulesRef} onScroll={handleRulesScroll}
              className="max-h-80 overflow-y-auto glass rounded-xl p-5 space-y-5 mb-4 border border-white/5">
              <div className="flex items-center gap-2 text-orange-400 font-semibold text-sm">
                <Megaphone size={16}/> PERATURAN
              </div>
              {RULES_TEXT.map((section, i) => (
                <div key={i}>
                  <h4 className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                    <Shield size={14}/> {section.title}
                  </h4>
                  <div className="space-y-2">
                    {section.rules.map((rule, j) => (
                      <div key={j} className="flex items-start gap-2 text-sm text-gray-300">
                        <ChevronRight size={14} className="text-orange-400 mt-0.5 flex-shrink-0"/>
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {!rulesScrolled && (
              <p className="text-xs text-yellow-400/70 mb-3 flex items-center gap-1">
                <AlertCircle size={12}/> Scroll to the bottom to enable the checkbox
              </p>
            )}
            <label className={`flex items-start gap-3 cursor-pointer ${!rulesScrolled ? 'opacity-40 pointer-events-none' : ''}`}>
              <input type="checkbox" checked={form.rulesAccepted}
                onChange={e => setForm(prev => ({ ...prev, rulesAccepted: e.target.checked }))}
                disabled={!rulesScrolled}
                className="mt-1 accent-orange-500"/>
              <span className="text-sm text-gray-300">
                I have read, understood, and agree to follow all the server rules above.
              </span>
            </label>
            {navButtons(form.rulesAccepted)}
          </div>
        );

      // ─── Step 1: Gamertag & Discord ───
      case 1:
        return (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                <User size={20}/>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Profile Information</h3>
                <p className="text-gray-500 text-xs">Enter your gamertag and Discord ID</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Minecraft Gamertag <span className="text-red-400">*</span></label>
                <input type="text" value={form.gamertag}
                  onChange={e => setForm(prev => ({ ...prev, gamertag: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition"
                  placeholder="YourGamertag"/>
                <p className="text-xs text-gray-600 mt-1">You can change your gamertag here if needed</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Discord ID <span className="text-red-400">*</span></label>
                <input type="text" value={form.discordId}
                  onChange={e => setForm(prev => ({ ...prev, discordId: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition"
                  placeholder="username#1234"/>
              </div>
            </div>
            {navButtons(form.gamertag.trim() && form.discordId.trim())}
          </div>
        );

      // ─── Step 2: Age & Gender ───
      case 2:
        return (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                <FileText size={20}/>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Personal Details</h3>
                <p className="text-gray-500 text-xs">Tell us a bit about yourself</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Age <span className="text-red-400">*</span></label>
                <input type="number" min="13" max="99" value={form.age}
                  onChange={e => setForm(prev => ({ ...prev, age: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition"
                  placeholder="18"/>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Gender <span className="text-red-400">*</span></label>
                <select value={form.gender}
                  onChange={e => setForm(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-orange-500/50 transition">
                  <option value="" className="bg-gray-900">Select...</option>
                  <option value="Male" className="bg-gray-900">Male</option>
                  <option value="Female" className="bg-gray-900">Female</option>
                  <option value="Other" className="bg-gray-900">Other</option>
                  <option value="Prefer not to say" className="bg-gray-900">Prefer not to say</option>
                </select>
              </div>
            </div>
            {navButtons(form.age && form.gender)}
          </div>
        );

      // ─── Step 3: Social Media ───
      case 3:
        return (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                <Globe size={20}/>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Social Media</h3>
                <p className="text-gray-500 text-xs">Optional &mdash; share your social media handles</p>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Social Media Handle(s)</label>
              <input type="text" value={form.socialMedia}
                onChange={e => setForm(prev => ({ ...prev, socialMedia: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition"
                placeholder="@yourhandle (Instagram, Twitter, TikTok, etc.)"/>
              <p className="text-xs text-gray-600 mt-1">This is optional. You can skip this step.</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={prevStep}
                className="flex-1 py-3 rounded-lg glass glass-hover text-gray-300 font-semibold transition-all animate-btn-press flex items-center justify-center gap-2">
                <ChevronLeft size={18}/> Back
              </button>
              {!form.socialMedia && (
                <button type="button" onClick={nextStep}
                  className="flex-1 py-3 rounded-lg bg-white/10 hover:bg-white/15 text-gray-300 font-semibold transition-all animate-btn-press flex items-center justify-center gap-2">
                  <SkipForward size={18}/> Skip
                </button>
              )}
              <button type="button" onClick={nextStep}
                className="flex-1 py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold transition-all animate-btn-press flex items-center justify-center gap-2">
                Confirm <ChevronRight size={18}/>
              </button>
            </div>
          </div>
        );

      // ─── Step 4: Skin Upload ───
      case 4:
        return (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                <Upload size={20}/>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Minecraft Skin</h3>
                <p className="text-gray-500 text-xs">Upload your Minecraft skin file (PNG, 64\u00d764 or 64\u00d7128)</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-5 py-3 rounded-lg bg-white/5 border border-white/10 border-dashed text-gray-300 hover:border-orange-500/50 cursor-pointer transition text-sm">
                  <Upload size={16}/> Choose .png File
                  <input type="file" accept=".png,image/png" className="hidden" onChange={handleFileUpload}/>
                </label>
                {form.skinPreview && !skinError && (
                  <div className="flex items-center gap-2 text-emerald-400 text-sm">
                    <CheckCircle size={16}/> Skin uploaded
                  </div>
                )}
              </div>
              {skinError && (
                <p className="text-red-400 text-xs">{skinError}</p>
              )}
              {form.skinPreview && !skinError && (
                <div className="glass rounded-xl p-6 flex flex-col items-center">
                  <p className="text-sm text-gray-400 mb-3">3D Preview</p>
                  <SkinViewer3D skinUrl={form.skinPreview} width={180} height={320}/>
                </div>
              )}
            </div>
            {navButtons(!!form.skinPreview && !skinError)}
          </div>
        );

      // ─── Step 5: Roleplay Questions ───
      case 5:
        return (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                <Gamepad2 size={20}/>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Roleplay Interest</h3>
                <p className="text-gray-500 text-xs">Tell us about your interest in roleplay</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Are you interested in Roleplay? <span className="text-red-400">*</span></label>
                <div className="flex gap-4">
                  {['Yes', 'No'].map(opt => (
                    <label key={opt} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg cursor-pointer border transition-all ${
                      form.rpInterest === opt
                        ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                    }`}>
                      <input type="radio" name="rpInterest" value={opt}
                        checked={form.rpInterest === opt}
                        onChange={e => setForm(prev => ({ ...prev, rpInterest: e.target.value }))}
                        className="hidden"/>
                      <span className="text-sm font-medium">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Briefly explain your roleplay interest</label>
                <textarea value={form.rpExplanation}
                  onChange={e => setForm(prev => ({ ...prev, rpExplanation: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition text-sm"
                  rows={3} placeholder="Tell us about your roleplay experience or what excites you about it..."/>
              </div>
            </div>
            {navButtons(!!form.rpInterest)}
          </div>
        );

      // ─── Step 6: VoiceCraft ───
      case 6:
        return (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                <Mic size={20}/>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Voice Proximity Chat</h3>
                <p className="text-gray-500 text-xs">VoiceCraft is required for our server</p>
              </div>
            </div>
            <div className="glass rounded-xl p-5 space-y-4 border border-orange-500/20">
              <p className="text-sm text-gray-300">
                VoiceCraft adds proximity voice chat to Minecraft Bedrock. Players near you can hear you speak in real-time &mdash; this is <strong className="text-orange-400">required</strong> for our server&apos;s immersive roleplay experience.
              </p>
              <p className="text-sm text-gray-400">
                You <strong className="text-white">must</strong> download and install VoiceCraft before you can proceed.
              </p>
              <a href={VOICECRAFT_LINK} target="_blank" rel="noopener noreferrer"
                onClick={() => setVoiceCraftClicked(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 transition-all text-sm font-medium animate-btn-press">
                <Download size={16}/> Download VoiceCraft v1.4.0
              </a>
              {voiceCraftClicked && (
                <p className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle size={12}/> Download link opened</p>
              )}
              <label className={`flex items-start gap-3 cursor-pointer pt-2 ${!voiceCraftClicked ? 'opacity-40 pointer-events-none' : ''}`}>
                <input type="checkbox" checked={form.voiceCraftConfirm}
                  onChange={e => setForm(prev => ({ ...prev, voiceCraftConfirm: e.target.checked }))}
                  disabled={!voiceCraftClicked}
                  className="mt-1 accent-orange-500"/>
                <span className="text-sm text-gray-300">
                  I have downloaded and installed VoiceCraft
                </span>
              </label>
              {!voiceCraftClicked && (
                <p className="text-xs text-yellow-400/70 flex items-center gap-1">
                  <AlertCircle size={12}/> You must click the download link first
                </p>
              )}
            </div>
            {navButtons(form.voiceCraftConfirm)}
          </div>
        );

      // ─── Step 7: Additional Message + Submit ───
      case 7:
        return (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                <Send size={20}/>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Almost Done!</h3>
                <p className="text-gray-500 text-xs">Leave a message or submit your application</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Additional Message to Admin <span className="text-gray-600">(optional)</span></label>
                <textarea value={form.additionalMessage}
                  onChange={e => setForm(prev => ({ ...prev, additionalMessage: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition text-sm"
                  rows={4} placeholder="Anything else you'd like us to know..."/>
              </div>
              {/* Summary */}
              <div className="glass rounded-xl p-4 space-y-2 text-sm">
                <h4 className="text-white font-semibold mb-2 flex items-center gap-2"><CheckCircle size={14} className="text-orange-400"/> Application Summary</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <span className="text-gray-500">Gamertag:</span><span className="text-white">{form.gamertag}</span>
                  <span className="text-gray-500">Discord:</span><span className="text-white">{form.discordId}</span>
                  <span className="text-gray-500">Age:</span><span className="text-white">{form.age}</span>
                  <span className="text-gray-500">Gender:</span><span className="text-white">{form.gender}</span>
                  <span className="text-gray-500">RP Interest:</span><span className="text-white">{form.rpInterest}</span>
                  <span className="text-gray-500">Skin:</span><span className="text-emerald-400">{form.skinPreview ? '\u2713 Uploaded' : '\u2717 Missing'}</span>
                  <span className="text-gray-500">VoiceCraft:</span><span className="text-emerald-400">{form.voiceCraftConfirm ? '\u2713 Confirmed' : '\u2717 Not confirmed'}</span>
                </div>
              </div>
            </div>
            {navButtons(true, handleSubmit)}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="glass rounded-2xl p-6 md:p-8 animate-fade-in">
      <h3 className="text-xl font-bold text-white mb-1">
        {editData ? 'Edit & Resubmit Application' : 'Server Application'}
      </h3>
      <p className="text-gray-500 text-sm mb-6">
        {editData ? 'Update your answers and resubmit for review.' : 'Complete all steps to apply for whitelist access.'}
      </p>
      <StepProgress currentStep={step} totalSteps={TOTAL_STEPS} stepLabels={stepLabels}/>
      {renderStep()}
    </div>
  );
}

// ─── Member Dashboard ───
function Dashboard({ user, addToast, setPage }) {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const allEvents = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Show events that have a visible status (or legacy active events)
      setEvents(allEvents.filter(ev => {
        const status = getEventStatus(ev);
        return status !== 'ended' && status !== 'cancelled';
      }));
    }, (err) => {
      console.error('Failed to load events:', err);
    });
    return unsub;
  }, []);

  const quickActions = [
    { label: 'My Status', desc: 'Check your application status', icon: <FileText size={24}/>, color: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 hover:border-yellow-400/50', iconColor: 'text-yellow-400', action: () => setPage('status') },
    { label: 'Members', desc: 'View whitelisted players', icon: <Users size={24}/>, color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-400/50', iconColor: 'text-blue-400', action: () => setPage('members') },
    { label: 'Discord', desc: 'Join our community server', icon: <MessageCircle size={24}/>, color: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 hover:border-indigo-400/50', iconColor: 'text-indigo-400', action: () => window.open(SOCIAL_LINKS.discord, '_blank', 'noopener,noreferrer') },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-4xl mx-auto">
      <div className="animate-fade-in">
        {/* Welcome header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="w-14 h-14 rounded-full border-2 border-orange-500/40 object-cover"/>
            ) : (
              <div className="w-14 h-14 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 border-2 border-orange-500/30">
                <User size={24}/>
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-white">Welcome, {user.gamertag}! &#127918;</h1>
              <p className="text-gray-500">Your MalaySMP Dashboard</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-orange-400"/> Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickActions.map((a) => (
              <button key={a.label} onClick={a.action}
                className={`group relative p-4 rounded-xl bg-gradient-to-br ${a.color} border backdrop-blur-sm transition-all duration-200 text-left hover:scale-[1.02] active:scale-[0.98]`}>
                <div className={`${a.iconColor} mb-3`}>{a.icon}</div>
                <h3 className="text-white font-semibold text-sm mb-0.5">{a.label}</h3>
                <p className="text-gray-400 text-xs">{a.desc}</p>
                <ChevronRight size={16} className="absolute top-4 right-4 text-gray-600 group-hover:text-gray-400 transition-colors"/>
              </button>
            ))}
          </div>
        </div>

        {/* Apply / Events Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-orange-400"/> Available Events
          </h2>

          {selectedEvent ? (() => {
            const evStatus = getEventStatus(selectedEvent);
            const statusInfo = EVENT_STATUSES[evStatus] || EVENT_STATUSES.open;
            const StatusIcon = statusInfo.icon;
            return (
            <div className="animate-fade-in">
              <button onClick={() => setSelectedEvent(null)}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-orange-400 transition-colors mb-3">
                <ChevronLeft size={16}/> Back to Events
              </button>
              <div className="glass rounded-xl p-4 mb-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-white font-semibold flex items-center gap-2"><CalendarDays size={16} className="text-orange-400"/> {selectedEvent.name}</h3>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    <StatusIcon size={12}/> {statusInfo.label}
                  </span>
                </div>
                {selectedEvent.description && <p className="text-gray-400 text-sm mt-1">{selectedEvent.description}</p>}
              </div>
              {statusInfo.canJoin ? (
                <ApplicationForm key={selectedEvent.id} user={user} addToast={addToast} setPage={setPage} event={selectedEvent}/>
              ) : (
                <div className="glass rounded-2xl p-8 text-center">
                  <StatusIcon size={32} className="mx-auto mb-3 text-gray-500"/>
                  <p className="text-gray-400 font-medium">{statusInfo.userMessage}</p>
                </div>
              )}
            </div>
            );
          })() : events.length > 0 ? (
            <div className="grid gap-3 animate-fade-in">
              {events.map(ev => {
                const evStatus = getEventStatus(ev);
                const statusInfo = EVENT_STATUSES[evStatus] || EVENT_STATUSES.open;
                const StatusIcon = statusInfo.icon;
                return (
                <button key={ev.id} onClick={() => setSelectedEvent(ev)}
                  className="w-full flex items-center justify-between px-5 py-4 glass glass-hover rounded-xl text-white transition-all group text-left">
                  <span className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                      <Calendar size={20}/>
                    </div>
                    <div>
                      <span className="font-semibold block">{ev.name}</span>
                      {ev.description && <span className="text-gray-500 text-xs block">{ev.description}</span>}
                    </div>
                  </span>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      <StatusIcon size={12}/> {statusInfo.label}
                    </span>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-orange-400 transition-colors"/>
                  </div>
                </button>
                );
              })}
            </div>
          ) : (
            <div className="glass rounded-2xl p-8 text-center animate-fade-in">
              <CalendarDays size={32} className="mx-auto mb-3 text-gray-600"/>
              <p className="text-gray-400 font-medium">No events available at the moment.</p>
              <p className="text-gray-600 text-sm mt-1">Check back later for new events and applications.</p>
            </div>
          )}
        </div>
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
              eventId: myApp.eventId || '',
              eventName: myApp.eventName || '',
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
                  <p className="text-emerald-300 font-semibold">&#127881; Congratulations! You&apos;re whitelisted!</p>
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
  const [editGamertag, setEditGamertag] = useState(user.gamertag || '');
  const [editDiscord, setEditDiscord] = useState('');
  const [myApp, setMyApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const profileSnap = await getDoc(doc(db, 'users', user.id));
        if (profileSnap.exists()) {
          const data = profileSnap.data();
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
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-2 border-orange-500/50"/>
              ) : (
                <div className="w-24 h-24 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 border-2 border-orange-500/30">
                  <User size={40}/>
                </div>
              )}
            </div>
            <p className="text-gray-500 text-xs">Profile picture from your Google account</p>
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

  // Remove from whitelist modal
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removeReason, setRemoveReason] = useState('');

  // Event management state
  const [events, setEvents] = useState([]);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [eventFilter, setEventFilter] = useState('all');

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

  // Real-time listener on events
  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => {
      console.error('Failed to load events:', err);
    });
    return unsub;
  }, []);

  const handleAddEvent = async () => {
    if (!newEventName.trim()) { addToast('Event name is required.', 'error'); return; }
    try {
      const eventId = genId();
      const eventData = {
        id: eventId,
        name: newEventName.trim(),
        description: newEventDescription.trim(),
        status: 'open',
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'events', eventId), eventData);
      setNewEventName('');
      setNewEventDescription('');
      addToast('Event created!', 'success');
    } catch { addToast('Failed to create event.', 'error'); }
  };

  const handleChangeEventStatus = async (ev, newStatus, note = '') => {
    try {
      await updateDoc(doc(db, 'events', ev.id), { status: newStatus });
      // Log the status change
      const logId = genId();
      await setDoc(doc(db, 'eventStatusLogs', logId), {
        id: logId,
        eventId: ev.id,
        eventName: ev.name,
        previousStatus: getEventStatus(ev),
        newStatus,
        note: note || '',
        changedBy: auth.currentUser?.email || ADMIN_EMAIL,
        changedAt: serverTimestamp(),
      });
      const statusLabel = EVENT_STATUSES[newStatus]?.label || newStatus;
      addToast(`Event status changed to ${statusLabel}.`, 'success');
    } catch { addToast('Failed to update event status.', 'error'); }
  };

  const handleDeleteEvent = async (ev) => {
    try {
      await deleteDoc(doc(db, 'events', ev.id));
      addToast('Event deleted.', 'success');
    } catch { addToast('Failed to delete event.', 'error'); }
  };

  const handleEventScreenshotUpload = async (ev, file) => {
    const current = ev.screenshots || [];
    if (current.length >= 3) {
      addToast('Maximum 3 screenshots per event.', 'error');
      return;
    }
    try {
      const idx = current.length;
      const ref = storageRef(storage, `events/${ev.id}/screenshot_${idx}_${Date.now()}`);
      await uploadBytes(ref, file);
      const url = await getDownloadURL(ref);
      await updateDoc(doc(db, 'events', ev.id), {
        screenshots: [...current, url],
      });
      addToast('Screenshot uploaded!', 'success');
    } catch {
      addToast('Failed to upload screenshot.', 'error');
    }
  };

  const handleEventScreenshotDelete = async (ev, urlToDelete, idx) => {
    try {
      try {
        const ref = storageRef(storage, urlToDelete);
        await deleteObject(ref);
      } catch (storageErr) { console.warn('Storage delete skipped:', storageErr.code || storageErr.message); }
      const updated = (ev.screenshots || []).filter((_, i) => i !== idx);
      await updateDoc(doc(db, 'events', ev.id), { screenshots: updated });
      addToast('Screenshot removed.', 'success');
    } catch {
      addToast('Failed to remove screenshot.', 'error');
    }
  };

  // Helper to create notification for a user
  const createNotification = async (userId, message, type) => {
    try {
      const notifId = genId();
      await setDoc(doc(db, 'notifications', notifId), {
        id: notifId,
        userId,
        message,
        type,
        read: false,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Failed to create notification:', err);
    }
  };

  const updateStatus = async (appId, status) => {
    try {
      const updateData = { status };
      if (status === 'accepted') {
        updateData.acceptedAt = serverTimestamp();
      }
      await updateDoc(doc(db, 'applications', appId), updateData);

      // Find the app to get userId
      const app = apps.find(a => a.id === appId);
      if (app?.userId) {
        const msg = status === 'accepted'
          ? '🎉 Your server application has been accepted! You are now whitelisted.'
          : '❌ Your server application has been declined.';
        await createNotification(app.userId, msg, status);
      }

      addToast(`Application ${status === 'accepted' ? 'accepted ✅' : 'declined ❌'}`, status === 'accepted' ? 'success' : 'error');
    } catch {
      addToast('Failed to update application status.', 'error');
    }
  };

  const handleDeclineConfirm = async () => {
    if (!declineTarget) return;
    try {
      await updateDoc(doc(db, 'applications', declineTarget), {
        status: 'declined',
        declineReason: declineReason,
      });

      const app = apps.find(a => a.id === declineTarget);
      if (app?.userId) {
        const reasonText = declineReason ? ` Reason: ${declineReason}` : '';
        await createNotification(app.userId, `❌ Your server application has been declined.${reasonText}`, 'declined');
      }

      addToast('Application declined ❌', 'error');
    } catch {
      addToast('Failed to decline application.', 'error');
    }
    setDeclineTarget(null);
    setDeclineReason('');
  };

  // Remove from whitelist handler
  const handleRemoveConfirm = async () => {
    if (!removeTarget) return;
    try {
      await updateDoc(doc(db, 'applications', removeTarget), {
        status: 'declined',
        declineReason: removeReason || 'Removed from whitelist by admin',
        acceptedAt: null,
      });

      const app = apps.find(a => a.id === removeTarget);
      if (app?.userId) {
        const reasonText = removeReason ? ` Reason: ${removeReason}` : '';
        await createNotification(app.userId, `⚠️ You have been removed from the whitelist.${reasonText}`, 'removed');
      }

      addToast('Player removed from whitelist', 'info');
    } catch {
      addToast('Failed to remove from whitelist.', 'error');
    }
    setRemoveTarget(null);
    setRemoveReason('');
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

  // Reset all applications
  const handleResetAll = async () => {
    if (resetConfirm !== 'RESET') return;
    try {
      const snap = await getDocs(collection(db, 'applications'));
      const docs = snap.docs;
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
    const headers = ['Gamertag', 'Email', 'Discord', 'Age', 'Gender', 'Status', 'Social Media', 'RP Interest', 'Event', 'Submitted'];
    const rows = apps.map(a => [
      a.gamertag, a.email, a.discordId, a.age, a.gender, a.status,
      a.socialMedia || '', a.rpInterest, a.eventName || '', formatTimestamp(a.submittedAt),
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

  const eventNames = useMemo(() => [...new Set(apps.map(a => a.eventName).filter(Boolean))], [apps]);

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
      const matchesEvent = eventFilter === 'all' || (a.eventName || '') === eventFilter;
      return matchesTab && matchesSearch && matchesEvent;
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

        {/* ─── Event Management (collapsible) ─── */}
        <div className="mb-6">
          <button onClick={() => setEventsOpen(!eventsOpen)}
            className="w-full flex items-center justify-between px-5 py-3 glass rounded-xl text-white hover:bg-white/5 transition-all">
            <span className="flex items-center gap-2 font-semibold">
              <CalendarDays size={18} className="text-orange-400"/> Event Management
            </span>
            <ChevronRight size={18} className={`text-gray-400 transition-transform duration-200 ${eventsOpen ? 'rotate-90' : ''}`}/>
          </button>
          {eventsOpen && (
            <div className="mt-3 glass rounded-xl p-5 space-y-4 animate-fade-in">
              <div className="space-y-3">
                <input type="text" value={newEventName} onChange={e => setNewEventName(e.target.value)}
                  placeholder="Event name *"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition text-sm"/>
                <textarea value={newEventDescription} onChange={e => setNewEventDescription(e.target.value)}
                  placeholder="Event description (optional)"
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition text-sm resize-none"/>
                <button onClick={handleAddEvent}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium transition-all animate-btn-press">
                  <Plus size={16}/> Add Event
                </button>
              </div>

              {events.length > 0 ? (
                <div className="space-y-2">
                  {events.map(ev => {
                    const evStatus = getEventStatus(ev);
                    const statusInfo = EVENT_STATUSES[evStatus] || EVENT_STATUSES.open;
                    const StatusIcon = statusInfo.icon;
                    return (
                    <div key={ev.id} className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-white text-sm font-medium">{ev.name}</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                              <StatusIcon size={10}/> {statusInfo.label}
                            </span>
                          </div>
                          {ev.description && <p className="text-gray-500 text-xs truncate mt-0.5">{ev.description}</p>}
                        </div>
                        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                          <button onClick={() => handleDeleteEvent(ev)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-all"
                            title="Delete event">
                            <Trash2 size={16}/>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={evStatus}
                          onChange={e => handleChangeEventStatus(ev, e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-500/50 transition cursor-pointer appearance-none"
                          style={{ backgroundImage: 'none' }}>
                          {Object.entries(EVENT_STATUSES).map(([key, val]) => (
                            <option key={key} value={key} className="bg-gray-900">{val.label}</option>
                          ))}
                        </select>
                      </div>
                      {/* Screenshots */}
                      <div className="pt-2 border-t border-white/5">
                        <p className="text-gray-400 text-xs font-medium mb-2 flex items-center gap-1.5">
                          <Image size={12}/> Screenshots ({(ev.screenshots || []).length}/3)
                        </p>
                        {(ev.screenshots || []).length > 0 && (
                          <div className="grid grid-cols-3 gap-2 mb-2">
                            {ev.screenshots.map((url, sIdx) => (
                              <div key={sIdx} className="relative group">
                                <img src={url} alt={`Screenshot ${sIdx + 1}`}
                                  className="w-full h-16 object-cover rounded-lg border border-white/10"/>
                                <button
                                  onClick={() => handleEventScreenshotDelete(ev, url, sIdx)}
                                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Remove screenshot">
                                  <X size={10}/>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        {(ev.screenshots || []).length < 3 && (
                          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-dashed border-white/10 hover:border-orange-500/30 text-gray-400 hover:text-orange-400 text-xs cursor-pointer transition-all w-fit">
                            <Upload size={12}/> Upload Screenshot
                            <input type="file" accept="image/*" className="hidden"
                              onChange={e => { if (e.target.files[0]) { handleEventScreenshotUpload(ev, e.target.files[0]); e.target.value = ''; } }}/>
                          </label>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-600 text-sm text-center py-2">No events created yet.</p>
              )}
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
          {eventNames.length > 0 && (
            <select value={eventFilter} onChange={e => setEventFilter(e.target.value)}
              className="px-3 py-1.5 glass rounded-lg text-sm text-gray-400 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition cursor-pointer">
              <option value="all" className="bg-gray-900">All Events</option>
              {eventNames.map(name => (
                <option key={name} value={name} className="bg-gray-900">{name}</option>
              ))}
            </select>
          )}
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
                  <div className="flex-shrink-0 group/skin relative">
                    {app.skinPreview ? (
                      <>
                        <img src={app.skinPreview} alt="Skin" className="w-16 h-16 rounded-lg border border-white/10 pixel-art"/>
                        <button onClick={() => {
                          const link = document.createElement('a');
                          link.download = `${app.gamertag || 'skin'}.png`;
                          if (app.skinPreview.startsWith('data:')) {
                            link.href = app.skinPreview;
                            link.click();
                          } else {
                            fetch(app.skinPreview).then(r => r.blob()).then(blob => {
                              link.href = URL.createObjectURL(blob);
                              link.click();
                              URL.revokeObjectURL(link.href);
                            }).catch(() => window.open(app.skinPreview, '_blank'));
                          }
                        }}
                          className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg opacity-0 group-hover/skin:opacity-100 transition-opacity cursor-pointer"
                          title="Download skin">
                          <Download size={18} className="text-white"/>
                        </button>
                      </>
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
                      {app.eventName && <span className="text-gray-500">Event: <span className="text-orange-300">{app.eventName}</span></span>}
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
                  <div className="flex md:flex-col gap-2 flex-shrink-0">
                    {app.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(app.id, 'accepted')}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-all text-sm font-medium animate-btn-press">
                          <Check size={16}/> Accept
                        </button>
                        <button onClick={() => { setDeclineTarget(app.id); setDeclineReason(''); }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-all text-sm font-medium animate-btn-press">
                          <XCircle size={16}/> Decline
                        </button>
                      </>
                    )}
                    {app.status === 'accepted' && (
                      <button onClick={() => { setRemoveTarget(app.id); setRemoveReason(''); }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30 transition-all text-sm font-medium animate-btn-press">
                        <UserX size={16}/> Remove
                      </button>
                    )}
                  </div>
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
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 transition text-sm mb-4"
                rows={4} placeholder="Reason for declining (optional)..."/>
              <div className="flex gap-3">
                <button onClick={() => { setDeclineTarget(null); setDeclineReason(''); }}
                  className="flex-1 py-2.5 rounded-lg glass glass-hover text-gray-300 font-medium transition-all text-sm">
                  Cancel
                </button>
                <button onClick={handleDeclineConfirm}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium transition-all text-sm">
                  Confirm Decline
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Remove from Whitelist Modal */}
        {removeTarget && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="w-full max-w-md glass rounded-2xl p-8 animate-fade-in">
              <h3 className="text-xl font-bold text-yellow-400 mb-2">Remove from Whitelist</h3>
              <p className="text-gray-400 text-sm mb-4">
                This will remove the player from the whitelist and set their status to declined. They will be notified.
              </p>
              <textarea value={removeReason} onChange={e => setRemoveReason(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 transition text-sm mb-4"
                rows={3} placeholder="Reason for removal (optional)..."/>
              <div className="flex gap-3">
                <button onClick={() => { setRemoveTarget(null); setRemoveReason(''); }}
                  className="flex-1 py-2.5 rounded-lg glass glass-hover text-gray-300 font-medium transition-all text-sm">
                  Cancel
                </button>
                <button onClick={handleRemoveConfirm}
                  className="flex-1 py-2.5 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white font-medium transition-all text-sm">
                  Confirm Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Server Page (Authenticated) ───
function ServerPage({ user, setPage }) {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-3xl mx-auto">
      <div className="animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
            <Globe size={32} className="text-orange-400"/>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Server Access</h1>
          <p className="text-gray-500">Join our Discord community to get the server details.</p>
        </div>

        {/* Discord Requirement Card */}
        <div className="glass rounded-2xl overflow-hidden mb-6">
          <div className="bg-[#5865F2]/10 border-b border-[#5865F2]/20 px-6 py-4 flex items-center gap-3">
            <MessageCircle size={22} className="text-[#5865F2]"/>
            <h2 className="text-lg font-semibold text-white">Discord Required</h2>
          </div>
          <div className="p-6 space-y-5">
            <p className="text-gray-300 leading-relaxed">
              To access the <span className="text-orange-400 font-medium">MalaySMP</span> server, you must join our official Discord server.
              All server information — including the <span className="text-white font-medium">IP address</span>, <span className="text-white font-medium">port</span>,
              and <span className="text-white font-medium">latest news</span> — is shared exclusively on Discord.
            </p>

            {/* Steps */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                <div className="w-7 h-7 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
                <div>
                  <p className="text-white font-medium text-sm">Download Discord</p>
                  <p className="text-gray-500 text-xs mt-0.5">If you don&apos;t have Discord yet, download it for free from the official website.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                <div className="w-7 h-7 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
                <div>
                  <p className="text-white font-medium text-sm">Join MalaySMP Discord</p>
                  <p className="text-gray-500 text-xs mt-0.5">Click the button below to join our server and get access to all channels.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                <div className="w-7 h-7 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
                <div>
                  <p className="text-white font-medium text-sm">Get Whitelisted</p>
                  <p className="text-gray-500 text-xs mt-0.5">Complete the application process and wait for admin approval. Once accepted, you&apos;ll find the server IP and connection details in Discord.</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a href={SOCIAL_LINKS.discord} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold transition-all animate-btn-press text-sm">
                <MessageCircle size={18}/> Join Discord Server
              </a>
              <a href="https://discord.com/download" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 font-medium transition-all text-sm">
                <Download size={18}/> Download Discord App
              </a>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="glass rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={18} className="text-orange-400"/>
              <h3 className="text-white font-semibold text-sm">Whitelisted Server</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              MalaySMP is a whitelisted server. Only approved members can join. Submit your application
              through the Dashboard and wait for admin approval.
            </p>
          </div>
          <div className="glass rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Bell size={18} className="text-orange-400"/>
              <h3 className="text-white font-semibold text-sm">Server News &amp; Updates</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Stay up to date with the latest server news, events, maintenance schedules,
              and announcements — all posted in our Discord server.
            </p>
          </div>
        </div>

        {/* Quick Links */}
        {user && (
          <div className="mt-6 glass rounded-xl p-5">
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <Link2 size={16} className="text-orange-400"/> Quick Links
            </h3>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setPage('dashboard')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs transition-all">
                <LayoutDashboard size={14}/> Go to Dashboard
              </button>
              <button onClick={() => setPage('events')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs transition-all">
                <CalendarDays size={14}/> View Events
              </button>
              <button onClick={() => setPage('members')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs transition-all">
                <Users size={14}/> View Members
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Event List Page (Public) ───
function EventListPage({ setPage }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [lightboxImg, setLightboxImg] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const allEvents = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Show all events except cancelled
      setEvents(allEvents.filter(ev => {
        const status = getEventStatus(ev);
        return status !== 'cancelled';
      }));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const formatDate = (ts) => {
    if (!ts) return null;
    try {
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch { return null; }
  };

  // Detail view for a single event
  if (selectedEvent) {
    const evStatus = getEventStatus(selectedEvent);
    const statusInfo = EVENT_STATUSES[evStatus] || EVENT_STATUSES.open;
    const StatusIcon = statusInfo.icon;
    const screenshots = selectedEvent.screenshots || [];

    return (
      <div className="min-h-screen pt-24 pb-12 px-4 max-w-4xl mx-auto">
        <div className="animate-fade-in">
          <button onClick={() => setSelectedEvent(null)}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white mb-6 text-sm transition-colors">
            <ChevronRight size={16} className="rotate-180"/> Back to Events
          </button>

          <div className="glass rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-white/5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{selectedEvent.name}</h1>
                  {formatDate(selectedEvent.createdAt) && (
                    <p className="text-gray-500 text-sm flex items-center gap-1.5">
                      <Calendar size={14}/> {formatDate(selectedEvent.createdAt)}
                    </p>
                  )}
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${statusInfo.color} flex-shrink-0`}>
                  <StatusIcon size={14}/> {evStatus === 'ended' ? 'ENDED' : statusInfo.label}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="p-6 md:p-8">
              {selectedEvent.description ? (
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedEvent.description}</p>
              ) : (
                <p className="text-gray-600 italic">No description provided.</p>
              )}
            </div>

            {/* Screenshots */}
            {screenshots.length > 0 && (
              <div className="px-6 md:px-8 pb-6 md:pb-8">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Image size={14} className="text-orange-400"/> Screenshots
                </h3>
                <div className={`grid gap-3 ${screenshots.length === 1 ? 'grid-cols-1' : screenshots.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {screenshots.map((url, idx) => (
                    <button key={idx} onClick={() => setLightboxImg(url)}
                      className="group relative overflow-hidden rounded-xl border border-white/10 hover:border-orange-500/40 transition-all duration-300">
                      <img src={url} alt={`Screenshot ${idx + 1}`}
                        className="w-full h-40 md:h-56 object-cover transition-transform duration-300 group-hover:scale-105"/>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Eye size={24} className="text-white opacity-0 group-hover:opacity-80 transition-opacity"/>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lightbox */}
        {lightboxImg && (
          <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLightboxImg(null)}>
            <button className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors" onClick={() => setLightboxImg(null)}>
              <X size={28}/>
            </button>
            <img src={lightboxImg} alt="Screenshot" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
              onClick={e => e.stopPropagation()}/>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-4xl mx-auto">
      <div className="animate-fade-in">
        {setPage && (
          <button onClick={() => setPage('landing')}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white mb-4 text-sm transition-colors">
            <ChevronRight size={16} className="rotate-180"/> Back
          </button>
        )}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <CalendarDays size={28} className="text-orange-400"/> Event List
          </h1>
          <p className="text-gray-500">Browse all server events and their details.</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="glass rounded-xl p-5 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-48"/>
                  <Skeleton className="h-6 w-20 rounded-full"/>
                </div>
                <Skeleton className="h-4 w-full"/>
                <Skeleton className="h-4 w-3/4"/>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <CalendarDays size={32} className="mx-auto mb-3 text-gray-600"/>
            <p className="text-gray-500 font-medium">No events available.</p>
            <p className="text-gray-600 text-sm mt-1">Check back later for new events.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map(ev => {
              const evStatus = getEventStatus(ev);
              const statusInfo = EVENT_STATUSES[evStatus] || EVENT_STATUSES.open;
              const StatusIcon = statusInfo.icon;
              const screenshots = ev.screenshots || [];
              return (
                <button key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className="w-full text-left glass glass-hover rounded-xl p-5 transition-all group">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 flex-shrink-0">
                        <Calendar size={20}/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-base truncate">{ev.name}</h3>
                        {formatDate(ev.createdAt) && (
                          <p className="text-gray-600 text-xs">{formatDate(ev.createdAt)}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                        <StatusIcon size={12}/> {evStatus === 'ended' ? 'ENDED' : statusInfo.label}
                      </span>
                      <ChevronRight size={18} className="text-gray-600 group-hover:text-orange-400 transition-colors"/>
                    </div>
                  </div>
                  {ev.description && (
                    <p className="text-gray-400 text-sm line-clamp-2 ml-[52px]">{ev.description}</p>
                  )}
                  {screenshots.length > 0 && (
                    <div className="flex gap-2 mt-3 ml-[52px]">
                      {screenshots.slice(0, 3).map((url, idx) => (
                        <img key={idx} src={url} alt="" className="w-16 h-10 object-cover rounded-lg border border-white/10 opacity-70 group-hover:opacity-100 transition-opacity"/>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Skin Viewer Component ───
function SkinViewer3D({ skinUrl, width = 150, height = 300 }) {
  const canvasRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const skinview3d = await import('skinview3d');
        if (cancelled || !canvasRef.current) return;
        const viewer = new skinview3d.SkinViewer({
          canvas: canvasRef.current,
          width,
          height,
          skin: skinUrl || DEFAULT_STEVE_SKIN,
        });
        viewer.autoRotate = true;
        viewer.autoRotateSpeed = 0.5;
        viewer.animation = new skinview3d.WalkingAnimation();
        viewer.animation.speed = 0.3;
        viewer.camera.rotation.x = -0.1;
        viewer.camera.rotation.y = 0.5;
        viewer.zoom = 0.9;
        viewerRef.current = viewer;
      } catch (err) {
        console.error('Failed to load skin viewer:', err);
      }
    })();
    return () => {
      cancelled = true;
      if (viewerRef.current) {
        viewerRef.current.dispose();
        viewerRef.current = null;
      }
    };
  }, [skinUrl, width, height]);

  return <canvas ref={canvasRef} className="mx-auto rounded-lg"/>;
}

// ─── Members Page (Public) ───
function MembersPage({ setPage }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const q = query(
          collection(db, 'applications'),
          where('status', '==', 'accepted')
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => {
          const getTime = (t) => {
            if (!t) return Infinity;
            if (typeof t.toMillis === 'function') return t.toMillis();
            if (t.seconds) return t.seconds * 1000;
            return Infinity;
          };
          return getTime(a.acceptedAt) - getTime(b.acceptedAt);
        });
        setMembers(data);
      } catch (err) {
        console.error('Failed to load members:', err);
      }
      setLoading(false);
    })();
  }, []);

  const formatAcceptedDate = (acceptedAt) => {
    if (!acceptedAt) return 'Date unavailable';
    try {
      const date = acceptedAt.toDate ? acceptedAt.toDate() : new Date(acceptedAt);
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return 'Date unavailable';
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-7xl mx-auto">
      <div className="animate-fade-in">
        {setPage && (
          <button onClick={() => setPage('dashboard')}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white mb-4 text-sm transition-colors">
            <ChevronRight size={16} className="rotate-180"/> Back
          </button>
        )}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Users size={28} className="text-orange-400"/> Server Members
          </h1>
          {!loading && members.length > 0 && (
            <p className="text-xl text-orange-300 font-semibold mt-3">&#127984; {members.length} Member{members.length !== 1 ? 's' : ''} and counting</p>
          )}
          {!loading && members.length === 0 && (
            <p className="text-gray-500">Players who have been accepted into the server.</p>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="glass rounded-xl p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-10 w-10 rounded-full"/>
                  <Skeleton className="h-5 w-16 rounded-full"/>
                </div>
                <Skeleton className="h-[300px] w-[150px] mx-auto rounded-lg"/>
                <Skeleton className="h-6 w-32 mx-auto"/>
                <Skeleton className="h-4 w-40 mx-auto"/>
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Users size={32} className="mx-auto mb-3 text-gray-600"/>
            <p className="text-gray-500">No accepted members yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {members.map((m, idx) => (
              <div key={m.id}
                className="glass rounded-xl p-5 text-center transition-all duration-300 hover:border-orange-500/40 hover:shadow-[0_0_15px_rgba(249,115,22,0.15)]"
              >
                {/* Top row: Google avatar + Member # badge */}
                <div className="flex justify-between items-start mb-3">
                  {m.photoURL ? (
                    <img src={m.photoURL} alt="" className="w-10 h-10 rounded-full border-2 border-orange-500/30 object-cover"/>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center text-gray-500">
                      <User size={18}/>
                    </div>
                  )}
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    #{idx + 1}
                  </span>
                </div>

                {/* 3D Skin Viewer */}
                <div className="mb-3">
                  <SkinViewer3D skinUrl={m.skinPreview || null} width={150} height={300}/>
                </div>

                {/* Minecraft Username */}
                <h3 className="text-white font-bold text-lg leading-tight">{m.gamertag}</h3>

                {/* Whitelisted Date */}
                <p className="text-gray-500 text-xs mt-1.5">
                  Whitelisted: {formatAcceptedDate(m.acceptedAt)}
                </p>
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
  const [notifications, setNotifications] = useState([]);

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

  // Listen for notifications (for logged-in non-admin users)
  useEffect(() => {
    if (!user || user.isAdmin) {
      return;
    }
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.id)
    );
    const unsub = onSnapshot(q, (snap) => {
      const notifs = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          timeAgo: timeAgo(data.createdAt),
        };
      });
      notifs.sort((a, b) => {
        const getTime = (ts) => {
          if (!ts) return 0;
          return ts.toDate ? ts.toDate().getTime() : new Date(ts).getTime();
        };
        return getTime(b.createdAt) - getTime(a.createdAt);
      });
      setNotifications(notifs);
    }, (err) => {
      console.error('Failed to load notifications:', err);
    });
    return unsub;
  }, [user]);

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

  const handleMarkNotifRead = useCallback(async (notifId) => {
    try {
      await updateDoc(doc(db, 'notifications', notifId), { read: true });
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

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
      case 'landing': return <LandingPage setPage={navigate} siteSettings={siteSettings} user={user}/>;
      case 'login': return user ? <Dashboard user={user} addToast={addToast} setPage={navigate}/> : <AuthPage addToast={addToast}/>;
      case 'members': return <MembersPage setPage={navigate}/>;
      case 'events': return <EventListPage setPage={navigate}/>;
      case 'server': return <ServerPage user={user} setPage={navigate}/>;
      case 'setup-gamertag': return user ? <GamertagSetup user={user} onComplete={handleGamertagComplete} addToast={addToast}/> : <LandingPage setPage={navigate} siteSettings={siteSettings} user={user}/>;
      case 'dashboard': return user ? <Dashboard user={user} addToast={addToast} setPage={navigate}/> : <LandingPage setPage={navigate} siteSettings={siteSettings} user={user}/>;
      case 'status': return user ? <StatusPage user={user} setPage={navigate} addToast={addToast}/> : <LandingPage setPage={navigate} siteSettings={siteSettings} user={user}/>;
      case 'profile': return user ? <ProfilePage user={user} addToast={addToast} setPage={navigate} onProfileUpdate={handleProfileUpdate}/> : <LandingPage setPage={navigate} siteSettings={siteSettings} user={user}/>;
      case 'admin': return user?.email === ADMIN_EMAIL ? <AdminPanel addToast={addToast}/> : <LandingPage setPage={navigate} siteSettings={siteSettings} user={user}/>;
      default: return <LandingPage setPage={navigate} siteSettings={siteSettings} user={user}/>;
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-gray-200 flex flex-col" style={bgStyle}>
      <Particles/>
      <Navbar page={page} setPage={navigate} user={user} onLogout={handleLogout}
        notifications={notifications} onMarkNotifRead={handleMarkNotifRead}/>
      <ToastContainer toasts={toasts} removeToast={removeToast}/>
      {siteSettings.announcementEnabled && siteSettings.announcement && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-orange-600/90 backdrop-blur text-white text-center py-2 px-4 text-sm flex items-center justify-center gap-2">
          <Megaphone size={14}/> {siteSettings.announcement}
        </div>
      )}
      <div className={`flex-1 transition-opacity duration-200 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
        {renderPage()}
      </div>
      <Footer siteSettings={siteSettings}/>
    </div>
  );
}
