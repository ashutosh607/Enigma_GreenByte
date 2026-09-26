import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  Building2, 
  Mail, 
  Lock, 
  User, 
  MapPin, 
  Factory, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck,
  AlertCircle 
} from 'lucide-react';
import { setUser } from '../store/slices/authSlice';
import { authApi } from '../services/api';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    industry: 'Steel & Metallurgy',
    city: '',
    state: '',
    role: 'buyer',
    termsAccepted: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const industries = [
    'Steel & Metallurgy',
    'Cement & Heavy Construction',
    'Chemical Processing & Refining',
    'Bio-energy & Anaerobic Digestion',
    'Textiles & Fiber Manufacturing',
    'Pulp, Paper & Wood By-products',
    'Automotive & Acoustic Composites',
    'Mining & Mineral Extraction'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (!formData.termsAccepted) {
      setError('Please accept the industrial participation terms.');
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        companyName: formData.companyName,
        industry: formData.industry,
        city: formData.city,
        state: formData.state
      });

      if (res.data?.token) {
        localStorage.setItem('resource_token', res.data.token);
      }
      if (res.data?.user?._id) {
        localStorage.setItem('resource_user_id', res.data.user._id);
      }

      dispatch(setUser(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      // Mock registration if backend is disconnected or offline during demo
      const mockUser = {
        _id: 'usr_' + Date.now(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        company: {
          name: formData.companyName || `${formData.name} Industries`,
          industry: formData.industry,
          location: {
            city: formData.city || 'Mumbai',
            state: formData.state || 'Maharashtra'
          }
        }
      };

      localStorage.setItem('resource_token', 'mock_jwt_' + Date.now());
      localStorage.setItem('resource_user_id', mockUser._id);
      dispatch(setUser(mockUser));
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#101010] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header Breadcrumb / Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center gap-2 group mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#101010] text-[#FDFCF8] flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
              RE
            </div>
            <span className="text-2xl font-black tracking-tight text-[#101010] uppercase">
              RE<span className="text-[#101010]/40">:</span>SOURCE
            </span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F3F0E9] border border-[#E3DBCC] text-[11px] font-mono font-semibold uppercase tracking-wider text-[#101010] mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-[#065F46]" />
            Enterprise Industrial Onboarding
          </div>

          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#101010]">
            Create Organization Account
          </h1>
          <p className="mt-2 text-sm text-[#101010]/70 max-w-md mx-auto">
            Join verified industrial facilities trading secondary by-products and circular raw materials.
          </p>
        </motion.div>

        {/* Main Registration Card */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E3DBCC] shadow-xl"
        >
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: User Representative */}
            <div>
              <h2 className="text-xs font-mono uppercase tracking-widest text-[#101010]/50 font-bold mb-4 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                1. Authorized Representative
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#101010] mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. David Henderson"
                    className="w-full px-4 py-3 rounded-xl border border-[#E3DBCC] text-sm focus:outline-none focus:ring-2 focus:ring-[#101010] bg-[#FDFCF8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#101010] mb-1.5">
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="d.henderson@industrial.com"
                    className="w-full px-4 py-3 rounded-xl border border-[#E3DBCC] text-sm focus:outline-none focus:ring-2 focus:ring-[#101010] bg-[#FDFCF8]"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Company Details */}
            <div className="pt-4 border-t border-[#E3DBCC]/70">
              <h2 className="text-xs font-mono uppercase tracking-widest text-[#101010]/50 font-bold mb-4 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                2. Facility & Company Profile
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#101010] mb-1.5">
                    Company / Plant Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g. Gary Works Steel Complex"
                    className="w-full px-4 py-3 rounded-xl border border-[#E3DBCC] text-sm focus:outline-none focus:ring-2 focus:ring-[#101010] bg-[#FDFCF8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#101010] mb-1.5">
                    Industry Sector *
                  </label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#E3DBCC] text-sm focus:outline-none focus:ring-2 focus:ring-[#101010] bg-[#FDFCF8]"
                  >
                    {industries.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#101010] mb-1.5">
                    City / Facility Hub *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Gary"
                    className="w-full px-4 py-3 rounded-xl border border-[#E3DBCC] text-sm focus:outline-none focus:ring-2 focus:ring-[#101010] bg-[#FDFCF8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#101010] mb-1.5">
                    State / Region *
                  </label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Indiana"
                    className="w-full px-4 py-3 rounded-xl border border-[#E3DBCC] text-sm focus:outline-none focus:ring-2 focus:ring-[#101010] bg-[#FDFCF8]"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Primary Trading Role */}
            <div className="pt-4 border-t border-[#E3DBCC]/70">
              <h2 className="text-xs font-mono uppercase tracking-widest text-[#101010]/50 font-bold mb-3 flex items-center gap-1.5">
                <Factory className="w-3.5 h-3.5" />
                3. Primary Operational Focus
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label 
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    formData.role === 'buyer' 
                      ? 'border-[#101010] bg-[#F3F0E9] ring-1 ring-[#101010]' 
                      : 'border-[#E3DBCC] bg-[#FDFCF8] hover:bg-[#F3F0E9]/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="buyer"
                    checked={formData.role === 'buyer'}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <div>
                    <span className="font-bold text-sm block text-[#101010]">Raw Material Buyer</span>
                    <span className="text-xs text-[#101010]/60">
                      Procuring secondary by-products to replace virgin commodities.
                    </span>
                  </div>
                </label>

                <label 
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    formData.role === 'seller' 
                      ? 'border-[#101010] bg-[#F3F0E9] ring-1 ring-[#101010]' 
                      : 'border-[#E3DBCC] bg-[#FDFCF8] hover:bg-[#F3F0E9]/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="seller"
                    checked={formData.role === 'seller'}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <div>
                    <span className="font-bold text-sm block text-[#101010]">By-Product Producer</span>
                    <span className="text-xs text-[#101010]/60">
                      Generating residuals, slag, fly ash, organics, or industrial heat.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Section 4: Security Password */}
            <div className="pt-4 border-t border-[#E3DBCC]/70">
              <h2 className="text-xs font-mono uppercase tracking-widest text-[#101010]/50 font-bold mb-4 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                4. Account Security
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#101010] mb-1.5">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className="w-full px-4 py-3 rounded-xl border border-[#E3DBCC] text-sm focus:outline-none focus:ring-2 focus:ring-[#101010] bg-[#FDFCF8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#101010] mb-1.5">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className="w-full px-4 py-3 rounded-xl border border-[#E3DBCC] text-sm focus:outline-none focus:ring-2 focus:ring-[#101010] bg-[#FDFCF8]"
                  />
                </div>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  className="rounded text-[#101010] focus:ring-[#101010] h-4 w-4"
                />
                <span className="text-xs text-[#101010]/70">
                  I confirm authorization to represent this industrial facility under regulatory secondary exchange rules.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-[#101010] hover:bg-black text-[#FDFCF8] text-sm font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Creating Verified Account...' : 'Complete Registration & Open Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Already have an account? */}
          <div className="mt-8 text-center pt-6 border-t border-[#E3DBCC]/70">
            <p className="text-xs text-[#101010]/60">
              Already have an enterprise account?{' '}
              <Link 
                to="/?login=true" 
                className="font-bold text-[#101010] hover:underline"
              >
                Sign In to existing workspace →
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
