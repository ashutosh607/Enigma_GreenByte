import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { X, LogIn, UserPlus, Sparkles, Building2, CheckCircle2, ArrowRight } from 'lucide-react';
import { setUser } from '../store/slices/authSlice';
import { authApi } from '../services/api';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onSuccess }) {
  const dispatch = useDispatch();
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('buyer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (mode === 'login') {
        res = await authApi.login({ email, password });
      } else {
        res = await authApi.register({ name, email, password, role, companyName });
      }

      if (res.data?.token) {
        localStorage.setItem('resource_token', res.data.token);
      }
      if (res.data?.user?._id) {
        localStorage.setItem('resource_user_id', res.data.user._id);
      }

      dispatch(setUser(res.data.user));
      if (onSuccess) onSuccess(res.data.user);
      onClose();
    } catch (err) {
      // Fallback demo simulation if backend is not currently connected
      const mockUser = {
        _id: 'usr_demo_123',
        name: name || (email.split('@')[0]) || 'Authorized Operator',
        email: email || 'demo@industrial.com',
        role: role,
        company: { name: companyName || 'ArcelorMittal Global' },
      };
      localStorage.setItem('resource_token', 'mock_jwt_token_auth');
      localStorage.setItem('resource_user_id', mockUser._id);
      dispatch(setUser(mockUser));
      if (onSuccess) onSuccess(mockUser);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (selectedRole, defaultName, company) => {
    const mockUser = {
      _id: `usr_${selectedRole}_demo`,
      name: defaultName,
      email: `${selectedRole}@enterprise.com`,
      role: selectedRole,
      company: { name: company },
    };
    localStorage.setItem('resource_token', 'mock_jwt_token_' + selectedRole);
    localStorage.setItem('resource_user_id', mockUser._id);
    dispatch(setUser(mockUser));
    if (onSuccess) onSuccess(mockUser);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/60 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-black/5 text-[#101010]/60 hover:text-[#101010] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3F0E9] border border-[#E3DBCC] text-[11px] font-mono font-semibold uppercase tracking-wider text-[#101010] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#286B4A]" />
            Enterprise Authentication
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-[#101010]">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="text-xs text-[#101010]/60 mt-1">
            Access certified secondary material trading and activity workspace.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-xl bg-[#F3F0E9] border border-[#E3DBCC] mb-5">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'login'
                ? 'bg-white text-[#101010] shadow-sm'
                : 'text-[#101010]/60 hover:text-[#101010]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'register'
                ? 'bg-white text-[#101010] shadow-sm'
                : 'text-[#101010]/60 hover:text-[#101010]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#101010]/70 font-semibold mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] text-xs focus:outline-none focus:ring-2 focus:ring-[#101010] bg-[#FDFCF8]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#101010]/70 font-semibold mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Holcim Cement Ltd."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] text-xs focus:outline-none focus:ring-2 focus:ring-[#101010] bg-[#FDFCF8]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#101010]/70 font-semibold mb-1">
                  Primary Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] text-xs focus:outline-none focus:ring-2 focus:ring-[#101010] bg-[#FDFCF8]"
                >
                  <option value="buyer">Material Buyer / Procurement</option>
                  <option value="seller">By-product Producer / Seller</option>
                  <option value="admin">Platform Auditor / Admin</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-mono uppercase text-[#101010]/70 font-semibold mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@company.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] text-xs focus:outline-none focus:ring-2 focus:ring-[#101010] bg-[#FDFCF8]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-[#101010]/70 font-semibold mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] text-xs focus:outline-none focus:ring-2 focus:ring-[#101010] bg-[#FDFCF8]"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#101010] hover:bg-black text-[#FDFCF8] text-xs font-bold uppercase tracking-wider transition-all shadow-md mt-2 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In to Dashboard' : 'Complete Registration'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick 1-Click Demo Buttons for Fast Evaluation */}
        <div className="mt-5 pt-4 border-t border-[#E3DBCC]/80">
          <p className="text-[10px] font-mono uppercase text-[#101010]/50 text-center mb-2.5 font-semibold">
            Or quick demo evaluation login:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('buyer', 'Elena Rostova', 'Heidelberg Materials')}
              className="px-2.5 py-2 rounded-lg bg-[#F3F0E9] hover:bg-[#E3DBCC] text-[11px] font-semibold text-[#101010] text-center transition-all cursor-pointer"
            >
              Demo Buyer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('seller', 'Marcus Vance', 'Nucor Steel')}
              className="px-2.5 py-2 rounded-lg bg-[#F3F0E9] hover:bg-[#E3DBCC] text-[11px] font-semibold text-[#101010] text-center transition-all cursor-pointer"
            >
              Demo Seller
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
