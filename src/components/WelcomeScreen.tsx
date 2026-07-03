import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, ArrowRight, Mail, Lock, User, LogOut, Chrome, 
  AlertCircle, CheckCircle2, ShieldCheck, Zap
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { 
  signInWithPopup, createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, sendEmailVerification, 
  sendPasswordResetEmail, updateProfile, GoogleAuthProvider
} from 'firebase/auth';

export default function WelcomeScreen() {
  const [view, setView] = useState<'welcome' | 'login' | 'signup' | 'forgot'>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const formatFirebaseError = (err: any) => {
    const code = err.code || '';
    if (code === 'auth/configuration-not-found') return 'Auth Provider not enabled. Please enable Email/Password & Google Sign-In in Firebase Console.';
    if (code === 'auth/api-key-not-valid') return 'API Key is restricted. Remove Android app restrictions in Google Cloud Console for web preview.';
    if (code === 'auth/operation-not-allowed') return 'Sign-in method is disabled. Enable it in the Firebase Console.';
    if (code === 'auth/invalid-email') return 'Please enter a valid email address.';
    if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') return 'Invalid email or password.';
    if (code === 'auth/email-already-in-use') return 'This email is already registered.';
    if (code === 'auth/weak-password') return 'Password must be at least 6 characters long.';
    if (code === 'auth/network-request-failed') return 'Network error. Please check your connection.';
    return err.message || 'An unexpected error occurred. Please try again later.';
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      const googleProvider = new GoogleAuthProvider();
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(formatFirebaseError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields to continue.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await sendEmailVerification(cred.user);
      setMsg('Account created successfully! Please check your email to verify.');
      // Auto-login will happen via the listener in AuthContext, but we can set view just in case
    } catch (err: any) {
      setError(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your registered email address.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await sendPasswordResetEmail(auth, email);
      setMsg('A password reset link has been sent to your email.');
    } catch (err: any) {
      setError(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center p-6 z-50 overflow-hidden font-sans text-white">
      {/* Hero Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-top bg-no-repeat pointer-events-none" 
        style={{ backgroundImage: "url('/file_00000000e4ac71f8852031dc37195c7d.png')" }}
      >
        {/* Soft Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-[#0a0a0a]/60 to-[#0a0a0a] z-0"></div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'welcome' && (
          <motion.div 
            key="welcome"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
            className="relative z-10 max-w-md w-full flex flex-col justify-end h-full pb-8 pt-12"
          >
            <div className="mt-auto flex flex-col gap-6">
              <div className="text-center bg-black/20 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                  Welcome to Student Engine
                </h1>
                <p className="text-white/70 text-base sm:text-lg font-medium tracking-wide">
                  Build better habits. Stay focused. Achieve your goals.
                </p>
                
                <div className="mt-8 space-y-4 w-full">
                  <button 
                    onClick={() => setView('signup')}
                    className="w-full py-4 px-6 rounded-full bg-blue-600 text-white font-bold text-lg hover:bg-blue-500 active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-3 group"
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="mt-4 text-center">
                    <p className="text-sm text-white/70">
                      Already have an account?{' '}
                      <button onClick={() => { setView('login'); setError(''); setMsg(''); }} className="text-blue-400 font-bold hover:text-blue-300 transition-colors">
                        Sign In
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {(view === 'login' || view === 'signup' || view === 'forgot') && (
          <motion.div 
            key="auth"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }}
            className="relative z-10 max-w-md w-full bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] p-8 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          >
            <button 
              onClick={() => { setView('welcome'); setError(''); setMsg(''); }}
              className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
            </button>
            
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight mb-2 text-white">
                {view === 'login' ? 'Welcome Back' : view === 'signup' ? 'Create Account' : 'Reset Password'}
              </h2>
              <p className="text-white/40 text-sm">
                {view === 'login' ? 'Sign in to sync your progress.' : view === 'signup' ? 'Join to unlock cloud sync & achievements.' : 'We will email you instructions.'}
              </p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{error}</p>
                  </div>
                </motion.div>
              )}
              {msg && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
                  <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{msg}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={view === 'login' ? handleEmailSignIn : view === 'signup' ? handleEmailSignUp : handleForgotPassword} className="space-y-4">
              {view === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-white/60 transition-colors" />
                    <input 
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/[0.05] rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/20 outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-white/60 transition-colors" />
                  <input 
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.05] rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/20 outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              {view !== 'forgot' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-white/60 transition-colors" />
                    <input 
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/[0.05] rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/20 outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 mt-6 rounded-2xl bg-white text-black font-bold text-lg hover:bg-neutral-200 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full" />
                ) : (
                  view === 'login' ? 'Sign In' : view === 'signup' ? 'Create Account' : 'Send Reset Link'
                )}
              </button>
            </form>

            {view === 'login' && (
              <div className="mt-8 flex flex-col items-center gap-6">
                <button onClick={() => { setView('forgot'); setError(''); setMsg(''); }} className="text-sm font-medium text-white/40 hover:text-white transition-colors">
                  Forgot Password?
                </button>
                <div className="w-full flex items-center gap-4">
                  <div className="h-px bg-white/10 flex-1"></div>
                  <span className="text-xs uppercase tracking-widest text-white/30 font-bold">Or</span>
                  <div className="h-px bg-white/10 flex-1"></div>
                </div>
                <button 
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <Chrome className="w-5 h-5 text-white" />
                  Sign in with Google
                </button>
              </div>
            )}
            
            {view === 'signup' && (
              <div className="mt-8 text-center">
                <p className="text-sm text-white/40">
                  Already have an account?{' '}
                  <button onClick={() => { setView('login'); setError(''); setMsg(''); }} className="text-white font-bold hover:underline">
                    Sign In
                  </button>
                </p>
              </div>
            )}
            {view === 'forgot' && (
              <div className="mt-8 text-center">
                <p className="text-sm text-white/40">
                  Remembered it?{' '}
                  <button onClick={() => { setView('login'); setError(''); setMsg(''); }} className="text-white font-bold hover:underline">
                    Back to Login
                  </button>
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
