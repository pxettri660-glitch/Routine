import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles,
  ArrowRight,
  Mail,
  Lock,
  User,
  LogOut,
  Chrome
} from 'lucide-react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';

export default function WelcomeScreen() {
  const { setGuestMode } = useAuth();
  const [view, setView] = useState<'welcome' | 'login' | 'signup' | 'forgot'>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const formatFirebaseError = (err: any) => {
    const code = err.code || '';
    if (code === 'auth/api-key-not-valid') return 'API Key is restricted. Please go to Google Cloud Console, find this API key, and remove the Android app restrictions so it can work in this Web preview.';
    if (code === 'auth/operation-not-allowed') return 'This sign-in method is not enabled. Please enable it in the Firebase Console (Authentication > Sign-in method).';
    if (code === 'auth/invalid-email') return 'Please enter a valid email address.';
    if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') return 'Invalid email or password.';
    if (code === 'auth/email-already-in-use') return 'This email is already in use.';
    if (code === 'auth/weak-password') return 'Password should be at least 6 characters.';
    if (code === 'auth/network-request-failed') return 'Network error. Please check your connection.';
    return err.message || 'An unexpected error occurred. Please try again.';
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
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
      setError('Please fill in all fields.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await sendEmailVerification(cred.user);
      setMsg('Account created! Please check your email to verify.');
    } catch (err: any) {
      setError(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
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
      setError('Please enter your email.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await sendPasswordResetEmail(auth, email);
      setMsg('Password reset email sent!');
    } catch (err: any) {
      setError(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-900 flex items-center justify-center p-6 z-50 overflow-hidden font-sans text-white">
      {/* Abstract Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-purple-500/10 blur-[100px]" />
      </div>

      <AnimatePresence mode="wait">
        {view === 'welcome' && (
          <motion.div 
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10 max-w-md w-full"
          >
            <div className="text-center mb-12">
              <div className="w-24 h-24 rounded-[2rem] bg-white/[0.05] border border-white/[0.08] backdrop-blur-2xl flex items-center justify-center shadow-2xl mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter mb-4 text-white">
                Study Engine
              </h1>
              <p className="text-white/60 text-lg">
                Your ultimate production cockpit.
              </p>
            </div>

            <div className="space-y-4">
              <button 
                onClick={() => setView('signup')}
                className="w-full py-4 px-6 rounded-2xl bg-white text-black font-semibold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                Create Account
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setView('login')}
                className="w-full py-4 px-6 rounded-2xl bg-white/10 text-white border border-white/10 font-semibold text-lg hover:bg-white/20 active:scale-95 transition-all backdrop-blur-xl flex items-center justify-center gap-2"
              >
                Login
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-neutral-900 px-4 text-sm text-white/40 uppercase tracking-widest font-bold">Or</span>
                </div>
              </div>

              <button 
                onClick={() => setGuestMode(true)}
                className="w-full py-4 px-6 rounded-2xl bg-transparent text-white/60 font-semibold text-base hover:text-white transition-all flex items-center justify-center gap-2"
              >
                Continue as Guest
              </button>
            </div>
          </motion.div>
        )}

        {(view === 'login' || view === 'signup' || view === 'forgot') && (
          <motion.div 
            key="auth"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 max-w-md w-full bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] p-8 rounded-[2rem] shadow-2xl"
          >
            <button 
              onClick={() => { setView('welcome'); setError(''); setMsg(''); }}
              className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
            >
              Back
            </button>
            
            <h2 className="text-3xl font-bold tracking-tight mb-2 text-white">
              {view === 'login' ? 'Welcome Back' : view === 'signup' ? 'Create Account' : 'Reset Password'}
            </h2>
            <p className="text-white/50 text-sm mb-8">
              {view === 'login' ? 'Enter your details to sign in.' : view === 'signup' ? 'Start your journey today.' : 'Enter your email to receive a reset link.'}
            </p>

            {error && <div className="mb-6 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-sm">{error}</div>}
            {msg && <div className="mb-6 p-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-200 text-sm">{msg}</div>}

            <form onSubmit={view === 'login' ? handleEmailSignIn : view === 'signup' ? handleEmailSignUp : handleForgotPassword} className="space-y-4">
              {view === 'signup' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/50 ml-1">Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input 
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 outline-none focus:border-white/30 transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/50 ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input 
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 outline-none focus:border-white/30 transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              {view !== 'forgot' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/50 ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input 
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 outline-none focus:border-white/30 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 mt-4 rounded-xl bg-white text-black font-semibold hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : view === 'login' ? 'Sign In' : view === 'signup' ? 'Sign Up' : 'Reset Password'}
              </button>
            </form>

            {view === 'login' && (
              <div className="mt-6 flex flex-col items-center gap-4">
                <button onClick={() => { setView('forgot'); setError(''); setMsg(''); }} className="text-sm text-white/50 hover:text-white transition-colors">
                  Forgot Password?
                </button>
                <div className="w-full border-t border-white/10"></div>
                <button 
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Chrome className="w-5 h-5" />
                  Sign in with Google
                </button>
              </div>
            )}
            
            {view === 'signup' && (
              <div className="mt-6 text-center">
                <p className="text-sm text-white/50">
                  Already have an account?{' '}
                  <button onClick={() => { setView('login'); setError(''); setMsg(''); }} className="text-white hover:underline">
                    Sign in
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
