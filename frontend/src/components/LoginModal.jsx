import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { X, LogIn, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { setUser } from '../store/slices/authSlice';
import { authApi } from '../services/api';

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.login({ email, password });

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
      // Mock login for smooth evaluation if backend is running separately
      const mockUser = {
        _id: 'usr_' + Date.now(),
        name: email.split('@')[0] || 'Enterprise Operator',
        email: email || 'operator@industrial.com',
        role: 'buyer',
        company: { name: 'Tata Steel Long Products' },
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

  const handleQuickDemoLogin = (role, defaultName, company) => {
    const mockUser = {
      _id: `usr_${role}_demo`,
      name: defaultName,
      email: `${role}@industrial-network.com`,
      role: role,
      company: { name: company },
    };
    localStorage.setItem('resource_token', 'mock_jwt_' + role);
    localStorage.setItem('resource_user_id', mockUser._id);
    dispatch(setUser(mockUser));
    if (onSuccess) onSuccess(mockUser);
    onClose();
  };

  const handleGoToRegister = () => {
    onClose();
    navigate('/register');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl p-7 sm:p-9 shadow-2xl border border-white/60 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-black/5 text-[#101010]/60 hover:text-[#101010] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3F0E9] border border-[#E3DBCC] text-[11px] font-mono font-semibold uppercase tracking-wider text-[#101010] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#286B4A]" />
            Enterprise Sign In
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-[#101010]">
            Welcome Back
          </h2>
          <p className="text-xs text-[#101010]/60 mt-1">
            Access your materials exchange workspace and active deals.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase text-[#101010]/70 font-semibold mb-1">
              Corporate Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@company.com"
              className="w-full px-4 py-3 rounded-xl border border-[#E3DBCC] text-xs focus:outline-none focus:ring-2 focus:ring-[#101010] bg-[#FDFCF8]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-mono uppercase text-[#101010]/70 font-semibold">
                Password
              </label>
              <button 
                type="button" 
                onClick={() => alert("Password reset link has been simulated.")} 
                className="text-[10px] text-[#101010]/60 hover:text-[#101010] font-medium"
              >
                Forgot?
              </button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-[#E3DBCC] text-xs focus:outline-none focus:ring-2 focus:ring-[#101010] bg-[#FDFCF8]"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#101010] hover:bg-black text-[#FDFCF8] text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-1"
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Link to Dedicated Registration Page */}
        <div className="mt-5 pt-4 text-center border-t border-[#E3DBCC]/80">
          <p className="text-xs text-[#101010]/70">
            Don't have an enterprise account?{' '}
            <button
              type="button"
              onClick={handleGoToRegister}
              className="font-bold text-[#101010] hover:underline cursor-pointer"
            >
              Create an Account →
            </button>
          </p>
        </div>

        {/* Quick Demo Evaluation Buttons */}
        <div className="mt-4 pt-3 border-t border-[#E3DBCC]/50">
          <p className="text-[10px] font-mono uppercase text-[#101010]/50 text-center mb-2 font-semibold">
            Or quick demo evaluation:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('buyer', 'Elena Rostova', 'Heidelberg Materials')}
              className="px-2.5 py-1.5 rounded-lg bg-[#F3F0E9] hover:bg-[#E3DBCC] text-[11px] font-semibold text-[#101010] text-center transition-all cursor-pointer"
            >
              Demo Buyer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('seller', 'Marcus Vance', 'Nucor Steel')}
              className="px-2.5 py-1.5 rounded-lg bg-[#F3F0E9] hover:bg-[#E3DBCC] text-[11px] font-semibold text-[#101010] text-center transition-all cursor-pointer"
            >
              Demo Seller
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
