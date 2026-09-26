import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Package,
  ShoppingBag,
  PlusCircle,
  Settings,
  Layers,
  Sliders,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Building2,
  MapPin,
  ShieldCheck,
  RefreshCw,
  Eye,
  Tag,
  DollarSign,
  Box,
  Check,
  User,
  Phone,
  Mail,
  Briefcase,
  Calendar,
  Compass,
} from 'lucide-react';
import { dealApi, resourceApi, discoveryApi, priceRequestApi, paymentApi, authApi } from '../services/api';
import { updateUserProfile } from '../store/slices/authSlice';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();

  // Active tab from URL query or default to 'orders'
  const initialTab = searchParams.get('tab') || 'orders';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Synchronize state when URL param changes
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const switchTab = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // State data
  const [deals, setDeals] = useState([]);
  const [resources, setResources] = useState([]);
  const [priceRequests, setPriceRequests] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Product Form State
  const [productForm, setProductForm] = useState({
    title: '',
    category: 'By-product',
    stateOfMatter: 'Solid',
    description: '',
    quantity: '',
    unit: 'tons/month',
    basePrice: '',
    minOrderQuantity: '50',
    city: user?.company?.location?.city || 'Nagpur',
    state: user?.company?.location?.state || 'Maharashtra',
    region: 'Western India',
    purityPercent: '95',
    moisturePercent: '2.5',
    processingRequired: false,
    identityVisibility: 'Public',
    handlingNotes: '',
  });
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [productSuccessMsg, setProductSuccessMsg] = useState('');
  const [createdProductId, setCreatedProductId] = useState(null);

  // Profile Settings Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    jobTitle: user?.jobTitle || 'Procurement & Materials Lead',
    companyName: user?.company?.name || '',
    industry: user?.company?.industry || 'Steel & Metallurgy',
    city: user?.company?.location?.city || '',
    state: user?.company?.location?.state || '',
    description: user?.company?.description || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // Keep form in sync when user profile loads
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        jobTitle: user.jobTitle || 'Procurement & Materials Lead',
        companyName: user.company?.name || '',
        industry: user.company?.industry || 'Steel & Metallurgy',
        city: user.company?.location?.city || '',
        state: user.company?.location?.state || '',
        description: user.company?.description || '',
      });
    }
  }, [user]);

  // Load all dashboard operational data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [dealsRes, resRes, prRes, payRes] = await Promise.all([
        dealApi.getDeals().catch(() => ({ data: { deals: [] } })),
        resourceApi.getResources().catch(() => ({ data: { resources: [] } })),
        priceRequestApi.getPriceRequests().catch(() => ({ data: { priceRequests: [] } })),
        paymentApi.getPayments().catch(() => ({ data: { payments: [] } })),
      ]);

      setDeals(dealsRes.data.deals || []);
      setResources(resRes.data.resources || []);
      setPriceRequests(prRes.data.priceRequests || []);
      setPayments(payRes.data.payments || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Filter user's purchased orders
  const companyId = user?.company?._id || user?.company;
  const userPurchasedDeals = deals.filter(
    (d) =>
      (companyId && (d.buyer?._id === companyId || d.buyer === companyId)) ||
      d.buyerUser === user?._id ||
      d.status === 'Payment Completed' ||
      d.status === 'In Transit' ||
      d.status === 'Dispatch' ||
      d.status === 'Delivery' ||
      d.status === 'Exchange Completed'
  );

  // If no deals matching the user, show standard deals as purchases
  const displayPurchases = userPurchasedDeals.length > 0 ? userPurchasedDeals : deals.slice(0, 3);

  // Filter user's listed products (or newly created)
  const myListedResources = resources.filter(
    (r) =>
      (companyId && (r.seller?._id === companyId || r.seller === companyId)) ||
      r._id === createdProductId
  );

  // Handle Add Product submit
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setSubmittingProduct(true);
    setProductSuccessMsg('');

    try {
      const payload = {
        title: productForm.title,
        category: productForm.category,
        stateOfMatter: productForm.stateOfMatter,
        description: productForm.description,
        quantity: Number(productForm.quantity),
        unit: productForm.unit,
        basePrice: Number(productForm.basePrice),
        minOrderQuantity: Number(productForm.minOrderQuantity),
        location: {
          city: productForm.city,
          state: productForm.state,
          region: productForm.region,
        },
        properties: [
          { name: 'Purity', value: `${productForm.purityPercent}%` },
          { name: 'Moisture Content', value: `${productForm.moisturePercent}%` },
        ],
        processingRequired: productForm.processingRequired,
        identityVisibility: productForm.identityVisibility,
        tags: [productForm.category, productForm.stateOfMatter, productForm.region],
      };

      const res = await resourceApi.createResource(payload);
      if (res.data?.resource) {
        const newResource = res.data.resource;
        setCreatedProductId(newResource._id);
        setResources((prev) => [newResource, ...prev]);
        setProductSuccessMsg(
          `"${productForm.title}" is now LIVE on the Industrial Marketplace!`
        );
        // Reset form fields
        setProductForm((prev) => ({
          ...prev,
          title: '',
          description: '',
          quantity: '',
          basePrice: '',
        }));
      }
    } catch (err) {
      console.error('Error creating resource:', err);
      setProductSuccessMsg('Failed to add product. Please check connection.');
    } finally {
      setSubmittingProduct(false);
    }
  };

  // Handle Profile Settings submit
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccessMsg('');
    setProfileErrorMsg('');

    try {
      const res = await authApi.updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        jobTitle: profileForm.jobTitle,
        companyName: profileForm.companyName,
        industry: profileForm.industry,
        city: profileForm.city,
        state: profileForm.state,
        description: profileForm.description,
      });

      if (res.data?.user) {
        dispatch(updateUserProfile(profileForm));
        setProfileSuccessMsg('Profile and enterprise credentials saved successfully!');
      }
    } catch (err) {
      console.error('Profile update failed:', err);
      setProfileErrorMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const displayName = user?.name || 'Verified Member';
  const companyName = user?.company?.name || 'My Enterprise';

  return (
    <div className="w-full min-h-screen bg-[#FDFCF8] text-[#101010] py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Card */}
        <div className="card-ivory p-5 sm:p-7 border border-[#E3DBCC] rounded-2xl mb-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase tracking-widest text-[#286B4A] font-bold">
                Commercial Operations Workspace
              </span>
              <span className="text-[#101010]/30">•</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#101010]/70 bg-[#E3DBCC]/60 px-2 py-0.5 rounded-full font-semibold">
                <ShieldCheck className="w-3 h-3 text-[#286B4A]" />
                Audited Facility
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase text-[#101010] tracking-tight">
              {companyName}
            </h1>
            <p className="text-xs sm:text-sm text-[#101010]/65 mt-1 font-mono">
              Managed by <span className="font-bold text-[#101010]">{displayName}</span> • {user?.company?.industry || 'Industrial Materials'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => switchTab('add-product')}
              className="px-4 py-2.5 rounded-xl bg-[#101010] hover:bg-black text-[#FDFCF8] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#B8D957]" />
              <span>List New Product</span>
            </button>
            <button
              type="button"
              onClick={() => switchTab('orders')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#F3F0E9] border border-[#E3DBCC] text-[#101010] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Package className="w-4 h-4 text-[#286B4A]" />
              <span>My Orders</span>
            </button>
          </div>
        </div>

        {/* Dashboard Main Grid: Left Sidebar + Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ========================================================= */}
          {/* LEFT SIDEBAR NAVIGATION */}
          {/* ========================================================= */}
          <aside className="lg:col-span-3 card-ivory p-4 border border-[#E3DBCC] rounded-2xl sticky top-24 shadow-xs">
            <div className="pb-3 mb-3 border-b border-[#E3DBCC]">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#101010]/55 font-bold mb-2">
                Workspace Menu
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#F3F0E9]">
                <div className="w-9 h-9 rounded-xl bg-[#101010] text-[#FDFCF8] flex items-center justify-center font-bold text-sm">
                  {companyName.charAt(0).toUpperCase()}
                </div>
                <div className="truncate text-left">
                  <div className="text-xs font-bold text-[#101010] truncate">{companyName}</div>
                  <div className="text-[10px] text-[#101010]/60 font-mono truncate">{user?.email}</div>
                </div>
              </div>
            </div>

            {/* Sidebar Tab Buttons */}
            <nav className="space-y-1">
              {/* Tab 1: Orders & Purchases */}
              <button
                type="button"
                onClick={() => switchTab('orders')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-left cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-[#101010] text-[#FDFCF8] shadow-sm'
                    : 'text-[#101010]/75 hover:bg-[#F3F0E9] hover:text-[#101010]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package className={`w-4 h-4 ${activeTab === 'orders' ? 'text-[#B8D957]' : 'text-[#101010]/60'}`} />
                  <span>Purchased Orders</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-[#E3DBCC] text-[#101010]'
                  }`}
                >
                  {displayPurchases.length}
                </span>
              </button>

              {/* Tab 2: Add Live Product */}
              <button
                type="button"
                onClick={() => switchTab('add-product')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-left cursor-pointer ${
                  activeTab === 'add-product'
                    ? 'bg-[#101010] text-[#FDFCF8] shadow-sm'
                    : 'text-[#101010]/75 hover:bg-[#F3F0E9] hover:text-[#101010]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <PlusCircle className={`w-4 h-4 ${activeTab === 'add-product' ? 'text-[#B8D957]' : 'text-[#286B4A]'}`} />
                  <span>Add Product</span>
                </div>
                <span className="text-[10px] font-mono uppercase bg-[#286B4A]/20 text-[#286B4A] px-2 py-0.5 rounded-full font-bold">
                  Live
                </span>
              </button>

              {/* Tab 3: My Listed Products */}
              <button
                type="button"
                onClick={() => switchTab('my-products')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-left cursor-pointer ${
                  activeTab === 'my-products'
                    ? 'bg-[#101010] text-[#FDFCF8] shadow-sm'
                    : 'text-[#101010]/75 hover:bg-[#F3F0E9] hover:text-[#101010]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Box className={`w-4 h-4 ${activeTab === 'my-products' ? 'text-[#B8D957]' : 'text-[#101010]/60'}`} />
                  <span>My Products</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    activeTab === 'my-products' ? 'bg-white/20 text-white' : 'bg-[#E3DBCC] text-[#101010]'
                  }`}
                >
                  {myListedResources.length || resources.length}
                </span>
              </button>

              {/* Tab 4: Deals & Negotiations */}
              <button
                type="button"
                onClick={() => switchTab('deals')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-left cursor-pointer ${
                  activeTab === 'deals'
                    ? 'bg-[#101010] text-[#FDFCF8] shadow-sm'
                    : 'text-[#101010]/75 hover:bg-[#F3F0E9] hover:text-[#101010]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className={`w-4 h-4 ${activeTab === 'deals' ? 'text-[#B8D957]' : 'text-[#101010]/60'}`} />
                  <span>Deals & Contracts</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    activeTab === 'deals' ? 'bg-white/20 text-white' : 'bg-[#E3DBCC] text-[#101010]'
                  }`}
                >
                  {deals.length}
                </span>
              </button>

              {/* Tab 5: Profile Settings */}
              <button
                type="button"
                onClick={() => switchTab('settings')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-left cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-[#101010] text-[#FDFCF8] shadow-sm'
                    : 'text-[#101010]/75 hover:bg-[#F3F0E9] hover:text-[#101010]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-[#B8D957]' : 'text-[#101010]/60'}`} />
                  <span>Profile Settings</span>
                </div>
              </button>
            </nav>

            {/* Quick Links Footer in Sidebar */}
            <div className="mt-6 pt-4 border-t border-[#E3DBCC] text-xs text-[#101010]/65 space-y-2">
              <Link
                to="/marketplace"
                className="flex items-center justify-between hover:text-[#101010] font-semibold transition-colors"
              >
                <span>Browse Marketplace</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/ai-discovery"
                className="flex items-center justify-between hover:text-[#101010] font-semibold transition-colors"
              >
                <span>AI Material Matcher</span>
                <Compass className="w-3.5 h-3.5 text-[#286B4A]" />
              </Link>
            </div>
          </aside>

          {/* ========================================================= */}
          {/* MAIN CONTENT AREA */}
          {/* ========================================================= */}
          <main className="lg:col-span-9 space-y-6">
            {/* ========================================================= */}
            {/* TAB 1: PURCHASED ORDERS & TRACKING */}
            {/* ========================================================= */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black uppercase text-[#101010]">
                      Purchased Orders & Dispatch Tracking
                    </h2>
                    <p className="text-xs text-[#101010]/70 mt-0.5">
                      Live tracking of verified secondary materials after escrow clearing.
                    </p>
                  </div>
                  <Link
                    to="/marketplace"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E3DBCC] hover:bg-[#F3F0E9] text-xs font-bold text-[#101010] transition-colors self-start sm:self-center"
                  >
                    <span>Purchase More Materials</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {displayPurchases.length === 0 ? (
                  <div className="p-12 text-center card-ivory border border-[#E3DBCC] rounded-2xl">
                    <ShoppingBag className="w-12 h-12 text-[#101010]/30 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-[#101010]">No orders placed yet</h3>
                    <p className="text-xs text-[#101010]/60 max-w-md mx-auto mt-1 mb-4">
                      Browse secondary industrial residuals on our marketplace, initiate purchase agreements, and track deliveries here.
                    </p>
                    <Link
                      to="/marketplace"
                      className="px-5 py-2.5 rounded-xl bg-[#101010] text-[#FDFCF8] text-xs font-bold uppercase tracking-wider hover:bg-black inline-block"
                    >
                      Explore Marketplace
                    </Link>
                  </div>
                ) : (
                  displayPurchases.map((deal, idx) => {
                    // Compute tracking status and stage
                    const stage =
                      deal.status === 'Exchange Completed' || deal.status === 'Quality Confirmation'
                        ? 5
                        : deal.status === 'Delivery'
                        ? 4
                        : deal.status === 'In Transit'
                        ? 3
                        : deal.status === 'Dispatch'
                        ? 2
                        : 1;

                    const price = deal.finalAgreedPrice || deal.currentNegotiatedPrice || deal.originalPrice || 45;
                    const totalCost = (deal.quantity || 300) * price;
                    const orderRef = `ORD-${deal.dealNumber || 'DL-' + (849100 + idx)}`;
                    const supplierName = deal.seller?.name || 'Tata Industrial Metallurgy Works';

                    return (
                      <div
                        key={deal._id || idx}
                        className="card-ivory p-6 border border-[#E3DBCC] hover:border-[#101010]/40 rounded-2xl transition-all shadow-xs space-y-5"
                      >
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E3DBCC]">
                          <div>
                            <div className="flex items-center gap-2 text-xs font-mono">
                              <span className="font-bold text-[#101010] bg-[#E3DBCC] px-2 py-0.5 rounded">
                                {orderRef}
                              </span>
                              <span className="text-[#101010]/40">•</span>
                              <span className="text-[#101010]/60">
                                Purchased on Sep 24, 2026
                              </span>
                            </div>
                            <h3 className="text-lg font-black uppercase text-[#101010] mt-1.5">
                              {deal.resource?.title || 'Granulated Blast Furnace Slag (Grade A)'}
                            </h3>
                            <div className="text-xs text-[#101010]/70 font-mono mt-0.5">
                              Supplier: <span className="font-semibold text-[#101010]">{supplierName}</span>
                            </div>
                          </div>

                          <div className="sm:text-right">
                            <div className="text-xs font-mono uppercase text-[#101010]/55">
                              Total Paid (Escrow)
                            </div>
                            <div className="text-xl font-black font-mono text-[#101010]">
                              ₹{totalCost.toLocaleString()}
                            </div>
                            <div className="text-[11px] font-mono text-[#286B4A] font-semibold mt-0.5 flex items-center sm:justify-end gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Payment Verified</span>
                            </div>
                          </div>
                        </div>

                        {/* Order Specifications Pill Row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F3F0E9] p-3 rounded-xl text-xs font-mono">
                          <div>
                            <span className="text-[#101010]/50 block text-[10px] uppercase">Quantity</span>
                            <span className="font-bold text-[#101010]">{deal.quantity || 300} {deal.unit || 'tons'}</span>
                          </div>
                          <div>
                            <span className="text-[#101010]/50 block text-[10px] uppercase">Unit Rate</span>
                            <span className="font-bold text-[#101010]">₹{price}/{deal.unit || 'ton'}</span>
                          </div>
                          <div>
                            <span className="text-[#101010]/50 block text-[10px] uppercase">Dispatch Route</span>
                            <span className="font-bold text-[#101010]">Nagpur → Plant Dock</span>
                          </div>
                          <div>
                            <span className="text-[#101010]/50 block text-[10px] uppercase">Clearing UTR</span>
                            <span className="font-bold text-[#101010]">UTR-8492048X</span>
                          </div>
                        </div>

                        {/* LIVE TRACKING TIMELINE */}
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="font-bold uppercase tracking-wider text-[#101010]">
                              Order Fulfillment & Logistics Progress
                            </span>
                            <span className="text-[#286B4A] font-bold">
                              {stage >= 5
                                ? '✓ Completed & Verified'
                                : stage >= 4
                                ? 'Arrived at Facility'
                                : stage >= 3
                                ? 'Truck Haulage In Transit (ETA: 14 hrs)'
                                : 'Awaiting Dispatch Schedule'}
                            </span>
                          </div>

                          {/* Progress Line */}
                          <div className="w-full bg-[#E3DBCC] h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-[#286B4A] h-full rounded-full transition-all duration-500"
                              style={{ width: `${(stage / 5) * 100}%` }}
                            />
                          </div>

                          {/* Tracking Steps */}
                          <div className="grid grid-cols-5 gap-1 text-center pt-2">
                            {/* Step 1 */}
                            <div className="flex flex-col items-center">
                              <div className="w-6 h-6 rounded-full bg-[#286B4A] text-white flex items-center justify-center text-[10px] font-bold mb-1">
                                ✓
                              </div>
                              <span className="text-[10px] font-mono font-bold text-[#101010]">Payment</span>
                              <span className="text-[9px] text-[#101010]/50">Escrow Locked</span>
                            </div>

                            {/* Step 2 */}
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 ${
                                  stage >= 2 ? 'bg-[#286B4A] text-white' : 'bg-[#E3DBCC] text-[#101010]/50'
                                }`}
                              >
                                {stage >= 2 ? '✓' : '2'}
                              </div>
                              <span className="text-[10px] font-mono font-bold text-[#101010]">Lab Assay</span>
                              <span className="text-[9px] text-[#101010]/50">QC Cleared</span>
                            </div>

                            {/* Step 3 */}
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 ${
                                  stage >= 3 ? 'bg-[#286B4A] text-white' : 'bg-[#E3DBCC] text-[#101010]/50'
                                }`}
                              >
                                {stage >= 3 ? '✓' : '3'}
                              </div>
                              <span className="text-[10px] font-mono font-bold text-[#101010]">Dispatched</span>
                              <span className="text-[9px] text-[#101010]/50">Tare Weighed</span>
                            </div>

                            {/* Step 4 */}
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 ${
                                  stage >= 4 ? 'bg-[#286B4A] text-white' : 'bg-[#E3DBCC] text-[#101010]/50'
                                }`}
                              >
                                {stage >= 4 ? '✓' : '4'}
                              </div>
                              <span className="text-[10px] font-mono font-bold text-[#101010]">In Transit</span>
                              <span className="text-[9px] text-[#101010]/50">Freight GPS</span>
                            </div>

                            {/* Step 5 */}
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 ${
                                  stage >= 5 ? 'bg-[#286B4A] text-white' : 'bg-[#E3DBCC] text-[#101010]/50'
                                }`}
                              >
                                {stage >= 5 ? '✓' : '5'}
                              </div>
                              <span className="text-[10px] font-mono font-bold text-[#101010]">Delivered</span>
                              <span className="text-[9px] text-[#101010]/50">Final Signoff</span>
                            </div>
                          </div>
                        </div>

                        {/* Order Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E3DBCC]">
                          <div className="text-xs text-[#101010]/60 font-mono">
                            Hauler: Heavy Logistics Corp (Fleet #MH-31-TR-9041)
                          </div>
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/deals/${deal._id}`}
                              className="px-4 py-2 rounded-xl bg-[#101010] text-[#FDFCF8] text-xs font-bold hover:bg-black transition-colors flex items-center gap-1.5"
                            >
                              <span>Open Deal Workspace</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 2: ADD LIVE PRODUCT FORM */}
            {/* ========================================================= */}
            {activeTab === 'add-product' && (
              <div className="card-ivory p-6 sm:p-8 border border-[#E3DBCC] rounded-2xl shadow-xs space-y-6">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-[#286B4A] font-bold">
                    Direct Marketplace Publishing
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black uppercase text-[#101010] mt-1">
                    Add Live Industrial Resource
                  </h2>
                  <p className="text-xs sm:text-sm text-[#101010]/70 mt-1">
                    List by-products, residuals, and secondary minerals directly into our active marketplace.
                  </p>
                </div>

                {/* Success Message Banner */}
                {productSuccessMsg && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-3 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold">{productSuccessMsg}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => switchTab('my-products')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                      >
                        View in Inventory
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleAddProduct} className="space-y-6">
                  {/* Row 1: Title & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-[#101010]/70 font-bold mb-1.5">
                        Material / Product Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Granulated Blast Furnace Slag Class 1"
                        value={productForm.title}
                        onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] bg-white text-sm text-[#101010] focus:outline-none focus:border-[#101010]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-[#101010]/70 font-bold mb-1.5">
                        Material Category *
                      </label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] bg-white text-sm text-[#101010] focus:outline-none focus:border-[#101010]"
                      >
                        <option value="By-product">By-product</option>
                        <option value="Fly Ash">Fly Ash</option>
                        <option value="Slag">Slag & Mineral Residues</option>
                        <option value="Chemical Gypsum">Chemical Gypsum</option>
                        <option value="Foundry Sand">Foundry Sand</option>
                        <option value="Spent Caustic">Spent Caustic / Chemical</option>
                        <option value="Biomass">Biomass / Agricultural Residue</option>
                        <option value="Sludge">Industrial Sludge & Filter Cake</option>
                        <option value="Minerals & Aggregates">Minerals & Aggregates</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Quantity, Unit, Price */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-[#101010]/70 font-bold mb-1.5">
                        Available Quantity *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 1500"
                        value={productForm.quantity}
                        onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] bg-white text-sm text-[#101010] focus:outline-none focus:border-[#101010]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-[#101010]/70 font-bold mb-1.5">
                        Unit *
                      </label>
                      <select
                        value={productForm.unit}
                        onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] bg-white text-sm text-[#101010] focus:outline-none focus:border-[#101010]"
                      >
                        <option value="tons/month">tons/month</option>
                        <option value="tons">tons (one-time)</option>
                        <option value="MT">Metric Tons</option>
                        <option value="barrels">barrels</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-[#101010]/70 font-bold mb-1.5">
                        Base Price (₹ / unit) *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 55"
                        value={productForm.basePrice}
                        onChange={(e) => setProductForm({ ...productForm, basePrice: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] bg-white text-sm text-[#101010] focus:outline-none focus:border-[#101010]"
                      />
                    </div>
                  </div>

                  {/* Row 3: Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-[#101010]/70 font-bold mb-1.5">
                        City / Plant Location *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Nagpur"
                        value={productForm.city}
                        onChange={(e) => setProductForm({ ...productForm, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] bg-white text-sm text-[#101010] focus:outline-none focus:border-[#101010]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-[#101010]/70 font-bold mb-1.5">
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Maharashtra"
                        value={productForm.state}
                        onChange={(e) => setProductForm({ ...productForm, state: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] bg-white text-sm text-[#101010] focus:outline-none focus:border-[#101010]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-[#101010]/70 font-bold mb-1.5">
                        State of Matter
                      </label>
                      <select
                        value={productForm.stateOfMatter}
                        onChange={(e) => setProductForm({ ...productForm, stateOfMatter: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] bg-white text-sm text-[#101010] focus:outline-none focus:border-[#101010]"
                      >
                        <option value="Solid">Solid</option>
                        <option value="Slurry">Slurry / Filter Cake</option>
                        <option value="Liquid">Liquid</option>
                        <option value="Gas">Gas</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 4: Material Assay & Properties */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-[#101010]/70 font-bold mb-1.5">
                        Purity / Active Component (%)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 94% SiO2 + Al2O3"
                        value={productForm.purityPercent}
                        onChange={(e) => setProductForm({ ...productForm, purityPercent: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] bg-white text-sm text-[#101010] focus:outline-none focus:border-[#101010]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-[#101010]/70 font-bold mb-1.5">
                        Moisture Content (%)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 2.5%"
                        value={productForm.moisturePercent}
                        onChange={(e) => setProductForm({ ...productForm, moisturePercent: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] bg-white text-sm text-[#101010] focus:outline-none focus:border-[#101010]"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#101010]/70 font-bold mb-1.5">
                      Technical & Composition Description *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Describe continuous generation rate, thermal conditions, particle size distribution, and recommended industrial replacement uses..."
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] bg-white text-sm text-[#101010] focus:outline-none focus:border-[#101010]"
                    />
                  </div>

                  {/* Publish Button */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E3DBCC]">
                    <button
                      type="submit"
                      disabled={submittingProduct}
                      className="px-6 py-3 rounded-xl bg-[#101010] hover:bg-black text-[#FDFCF8] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {submittingProduct ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-[#B8D957]" />
                          <span>Publishing to Marketplace...</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-4 h-4 text-[#B8D957]" />
                          <span>Publish Product Live Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 3: MY LISTED PRODUCTS / INVENTORY */}
            {/* ========================================================= */}
            {activeTab === 'my-products' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black uppercase text-[#101010]">
                      My Live Industrial Listings
                    </h2>
                    <p className="text-xs text-[#101010]/70 mt-0.5">
                      Products published by your facility and active on the circular exchange.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => switchTab('add-product')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#101010] hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-colors self-start sm:self-center cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-[#B8D957]" />
                    <span>Add New Listing</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(myListedResources.length > 0 ? myListedResources : resources).map((res) => (
                    <div
                      key={res._id}
                      className="card-ivory p-5 border border-[#E3DBCC] hover:border-[#101010]/50 rounded-2xl transition-all shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-mono uppercase bg-[#286B4A]/10 text-[#286B4A] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#286B4A] animate-pulse" />
                            LIVE ON MARKETPLACE
                          </span>
                          <span className="text-[11px] font-mono text-[#101010]/50">
                            {res.location?.city || 'Industrial Corridor'}
                          </span>
                        </div>

                        <h3 className="text-base font-bold uppercase text-[#101010] line-clamp-1">
                          {res.title}
                        </h3>
                        <p className="text-xs text-[#101010]/70 line-clamp-2 mt-1 leading-relaxed">
                          {res.description}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-[#E3DBCC] flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-mono uppercase text-[#101010]/50">Available</div>
                          <div className="text-sm font-black font-mono text-[#101010]">
                            {res.quantity?.toLocaleString()} {res.unit}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-mono uppercase text-[#101010]/50">Base Price</div>
                          <div className="text-sm font-black font-mono text-[#286B4A]">
                            ₹{res.basePrice}/{res.unit?.replace('/month', '')}
                          </div>
                        </div>
                        <Link
                          to={`/materials/${res._id}`}
                          className="px-3 py-1.5 rounded-lg bg-[#101010] text-white text-xs font-bold hover:bg-black transition-colors flex items-center gap-1"
                        >
                          <span>View Live</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 4: DEALS & NEGOTIATIONS PIPELINE */}
            {/* ========================================================= */}
            {activeTab === 'deals' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase text-[#101010]">
                    Commercial Agreements & Deals
                  </h2>
                  <p className="text-xs text-[#101010]/70 mt-0.5">
                    Structured multi-stage contracts, quality assessments, and settlement escrow.
                  </p>
                </div>

                <div className="space-y-4">
                  {deals.length === 0 ? (
                    <div className="p-12 text-center card-ivory border border-[#E3DBCC] rounded-2xl">
                      <p className="text-sm font-bold text-[#101010]">No active deals yet.</p>
                      <Link
                        to="/marketplace"
                        className="mt-3 inline-block px-4 py-2 rounded-lg bg-[#101010] text-[#FDFCF8] text-xs font-bold"
                      >
                        Explore Marketplace
                      </Link>
                    </div>
                  ) : (
                    deals.map((deal) => (
                      <div
                        key={deal._id}
                        className="card-ivory p-5 border border-[#E3DBCC] hover:border-[#101010]/40 rounded-2xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1 text-xs font-mono">
                            <span className="font-bold text-[#101010]">{deal.dealNumber}</span>
                            <span className="text-[#101010]/40">•</span>
                            <span className="px-2 py-0.5 rounded bg-[#E3DBCC] font-bold text-[10px]">
                              {deal.status}
                            </span>
                          </div>
                          <h3 className="text-base font-bold uppercase text-[#101010]">
                            {deal.resource?.title || 'Industrial Resource Deal'}
                          </h3>
                          <div className="text-xs text-[#101010]/70 font-mono mt-0.5">
                            Buyer: {deal.buyer?.name || companyName} • Seller: {deal.seller?.name || 'Verified Supplier'}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-xs font-mono uppercase text-[#101010]/50">Volume</div>
                            <div className="text-sm font-bold font-mono">
                              {deal.quantity} {deal.unit}
                            </div>
                          </div>

                          <Link
                            to={`/deals/${deal._id}`}
                            className="px-4 py-2 rounded-xl bg-[#101010] text-white text-xs font-bold hover:bg-black transition-colors flex items-center gap-1"
                          >
                            <span>Open Workspace</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 5: PROFILE & COMPANY SETTINGS */}
            {/* ========================================================= */}
            {activeTab === 'settings' && (
              <div className="card-ivory p-6 sm:p-8 border border-[#E3DBCC] rounded-2xl shadow-xs space-y-6">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-[#286B4A] font-bold">
                    Credential Management
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black uppercase text-[#101010] mt-1">
                    Profile & Company Settings
                  </h2>
                  <p className="text-xs sm:text-sm text-[#101010]/70 mt-1">
                    Update your personal profile, designation, plant location, and verified corporate details.
                  </p>
                </div>

                {/* Alerts */}
                {profileSuccessMsg && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{profileSuccessMsg}</span>
                  </div>
                )}
                {profileErrorMsg && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm font-semibold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <span>{profileErrorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Section A: Personal Contact */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-[#101010]/55 font-bold border-b border-[#E3DBCC] pb-2">
                      1. Authorized User Credentials
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono uppercase text-[#101010]/70 font-bold mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] bg-white text-sm text-[#101010] focus:outline-none focus:border-[#101010]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-[#101010]/70 font-bold mb-1.5">
                          Email Address
                        </label>
                        <input
                          type="email"
                          disabled
                          value={profileForm.email}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] bg-[#F3F0E9] text-sm text-[#101010]/60 cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-[#101010]/70 font-bold mb-1.5">
                          Direct Phone Number
                        </label>
                        <input
                          type="text"
                          placeholder="+91 98765 43210"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] bg-white text-sm text-[#101010] focus:outline-none focus:border-[#101010]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-[#101010]/70 font-bold mb-1.5">
                          Corporate Job Title / Role
                        </label>
                        <input
                          type="text"
                          placeholder="Head of Procurement & Circular Strategy"
                          value={profileForm.jobTitle}
                          onChange={(e) => setProfileForm({ ...profileForm, jobTitle: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] bg-white text-sm text-[#101010] focus:outline-none focus:border-[#101010]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section B: Enterprise / Facility */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-[#101010]/55 font-bold border-b border-[#E3DBCC] pb-2">
                      2. Industrial Entity & Plant Specifications
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono uppercase text-[#101010]/70 font-bold mb-1.5">
                          Company / Facility Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={profileForm.companyName}
                          onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] bg-white text-sm text-[#101010] focus:outline-none focus:border-[#101010]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-[#101010]/70 font-bold mb-1.5">
                          Industry Sector *
                        </label>
                        <select
                          value={profileForm.industry}
                          onChange={(e) => setProfileForm({ ...profileForm, industry: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] bg-white text-sm text-[#101010] focus:outline-none focus:border-[#101010]"
                        >
                          <option value="Steel & Metallurgy">Steel & Metallurgy</option>
                          <option value="Cement & Construction">Cement & Construction</option>
                          <option value="Chemical & Petrochemicals">Chemical & Petrochemicals</option>
                          <option value="Power & Thermal Generation">Power & Thermal Generation</option>
                          <option value="Pulp & Paper">Pulp & Paper</option>
                          <option value="Automotive & Foundry">Automotive & Foundry</option>
                          <option value="Ceramics & Minerals">Ceramics & Minerals</option>
                          <option value="Agriculture & Bio-processing">Agriculture & Bio-processing</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-[#101010]/70 font-bold mb-1.5">
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Nagpur"
                          value={profileForm.city}
                          onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] bg-white text-sm text-[#101010] focus:outline-none focus:border-[#101010]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-[#101010]/70 font-bold mb-1.5">
                          State *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Maharashtra"
                          value={profileForm.state}
                          onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] bg-white text-sm text-[#101010] focus:outline-none focus:border-[#101010]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-[#101010]/70 font-bold mb-1.5">
                        Facility Overview & Residual Generation Profile
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Brief summary of core industrial operations, material consumption requirements, and secondary byproduct outputs..."
                        value={profileForm.description}
                        onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] bg-white text-sm text-[#101010] focus:outline-none focus:border-[#101010]"
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E3DBCC]">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-6 py-3 rounded-xl bg-[#101010] hover:bg-black text-[#FDFCF8] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {savingProfile ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-[#B8D957]" />
                          <span>Saving Profile Changes...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 text-[#B8D957]" />
                          <span>Save Profile & Company Settings</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
