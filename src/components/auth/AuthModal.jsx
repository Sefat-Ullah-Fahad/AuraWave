import React, { useState } from 'react';
import {
  FiX,
  FiLock,
  FiMail,
  FiUser,
  FiPhone,
  FiCheck,
  FiLoader,
  FiMusic,
  FiZap,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext.jsx';

export function AuthModal({ isOpen, onClose }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (tab === 'register') {
      if (!name.trim() || !email.trim() || !password) {
        setError('Name, email, and password are required.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    } else {
      if (!email.trim() || !password) {
        setError('Email/phone and password are required.');
        return;
      }
    }

    try {
      setLoading(true);
      if (tab === 'login') {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password, phone.trim() || undefined);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    if (tab === 'login') {
      setEmail('fahad.web.code@gmail.com');
      setPassword('password123');
    } else {
      setName('Fahad Developer');
      setEmail('fahad.web.code@gmail.com');
      setPhone('+1234567890');
      setPassword('password123');
    }
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121422] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-white/5 bg-slate-900/40 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <FiX className="text-lg" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/30">
              <FiMusic className="text-xl" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">AuraWave Player</h2>
              <p className="text-xs text-slate-400">Personal & isolated music collection</p>
            </div>
          </div>

          {/* Tab selector */}
          <div className="flex p-1 bg-slate-950/80 rounded-xl mt-4 border border-white/5">
            <button
              onClick={() => {
                setTab('login');
                setError('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setTab('register');
                setError('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                tab === 'register'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
          {tab === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="text"
                  placeholder="e.g. Fahad"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-all"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              {tab === 'login' ? 'Email or Phone' : 'Email Address'}
            </label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                placeholder={tab === 'login' ? "user@example.com or phone" : "user@example.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-all"
                required
              />
            </div>
          </div>

          {tab === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="tel"
                  placeholder="+1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Quick Demo Fill button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleDemoFill}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-[11px] font-medium text-violet-300 border border-violet-500/20 transition-colors"
            >
              <FiZap className="text-violet-400" />
              <span>Fill Quick Demo Info ({tab === 'login' ? 'fahad.web.code@gmail.com' : 'Fahad'})</span>
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-violet-600/30 active:scale-98 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? (
              <FiLoader className="animate-spin text-base" />
            ) : (
              <>
                <FiCheck className="text-base" />
                <span>{tab === 'login' ? 'Sign In to AuraWave' : 'Create My Account'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
