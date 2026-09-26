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
  CreditCard,
  FileText,
  Navigation,
  Leaf,
  X,
  Radio,
  FileSignature,
  Activity,
  Maximize2,
} from 'lucide-react';
import { dealApi, resourceApi, discoveryApi, priceRequestApi, paymentApi, authApi } from '../services/api';
import { updateUserProfile } from '../store/slices/authSlice';

// Representative industrial photography for consignment items
const getMaterialPhoto = (title = '', category = '') => {
  const t = title.toLowerCase();
  const c = category.toLowerCase();
  if (t.includes('slag') || t.includes('blast')) {
    return 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80';
  }
  if (t.includes('fly ash') || t.includes('ash')) {
    return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';
  }
  if (t.includes('silica') || t.includes('sand')) {
    return 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80';
  }
  if (t.includes('phospho') || t.includes('gypsum')) {
    return 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80';
  }
  if (t.includes('steel') || c.includes('metal')) {
    return 'https://images.unsplash.com/photo-1505705694340-019e1e335916?auto=format&fit=crop&w=600&q=80';
  }
  return 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80';
};

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

  // Modals state
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [activeTrackingDeal, setActiveTrackingDeal] = useState(null);
  const [activeWaybillDeal, setActiveWaybillDeal] = useState(null);
  const [advancingDealId, setAdvancingDealId] = useState(null);

  // Instant Purchase Form State
  const [purchaseForm, setPurchaseForm] = useState({
    resourceId: '',
    quantity: 250,
    paymentMethod: 'NEFT / RTGS Industrial Escrow Vault',
    deliveryNotes: 'Standard tare weighbridge inspection required upon arrival.',
  });
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccessBanner, setPurchaseSuccessBanner] = useState('');

  // Add Product Form State
  const [productForm, setProductForm] = useState({
    title: '',
    category: 'Slag',
    stateOfMatter: 'Solid',
    description: '',
    quantity: '1200',
    unit: 'tons/month',
    basePrice: '65',
    minOrderQuantity: '50',
    city: user?.company?.location?.city || 'Nagpur',
    state: user?.company?.location?.state || 'Maharashtra',
    region: 'Western India',
    purityPercent: '95',
    moisturePercent: '2.5',
    processingRequired: false,
    identityVisibility: 'Public',
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

      const loadedDeals = dealsRes.data.deals || [];
      const loadedResources = resRes.data.resources || [];
      setDeals(loadedDeals);
      setResources(loadedResources);
      setPriceRequests(prRes.data.priceRequests || []);
      setPayments(payRes.data.payments || []);

      if (loadedResources.length > 0 && !purchaseForm.resourceId) {
        setPurchaseForm((prev) => ({ ...prev, resourceId: loadedResources[0]._id }));
      }
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

  // Handle Instant Escrow Purchase
  const handleExecuteInstantPurchase = async (e) => {
    e.preventDefault();
    if (!purchaseForm.resourceId) return;
    setPurchasing(true);
    setPurchaseSuccessBanner('');

    try {
      const res = await paymentApi.instantPurchase({
        resourceId: purchaseForm.resourceId,
        quantity: Number(purchaseForm.quantity),
        paymentMethod: purchaseForm.paymentMethod,
        deliveryNotes: purchaseForm.deliveryNotes,
      });

      if (res.data?.deal) {
        const newDeal = res.data.deal;
        setDeals((prev) => [newDeal, ...prev]);
        setPurchaseSuccessBanner(
          `Payment of ₹${(newDeal.costs?.totalPayable || 18450).toLocaleString()} Cleared in Escrow! Consignment #TRK-${newDeal.dealNumber} is now IN TRANSIT.`
        );
        setIsPurchaseModalOpen(false);
        switchTab('orders');
      }
    } catch (err) {
      console.error('Purchase failed:', err);
      alert(err.response?.data?.message || 'Payment processing failed. Please check network.');
    } finally {
      setPurchasing(false);
    }
  };

  // Advance deal dispatch state (interactive simulation)
  const handleAdvanceDispatch = async (dealId) => {
    setAdvancingDealId(dealId);
    try {
      const res = await dealApi.advanceDispatch(dealId);
      if (res.data?.deal) {
        const updated = res.data.deal;
        setDeals((prev) => prev.map((d) => (d._id === dealId ? updated : d)));
        if (activeTrackingDeal && activeTrackingDeal._id === dealId) {
          setActiveTrackingDeal(updated);
        }
      }
    } catch (err) {
      console.error('Error advancing dispatch:', err);
      // Fallback local update if network issue
      setDeals((prev) =>
        prev.map((d) => {
          if (d._id === dealId) {
            const cycle = {
              'In Transit': 'Delivery',
              Delivery: 'Exchange Completed',
              'Exchange Completed': 'In Transit',
              'Payment Completed': 'In Transit',
            };
            return { ...d, status: cycle[d.status] || 'In Transit' };
          }
          return d;
        })
      );
    } finally {
      setAdvancingDealId(null);
    }
  };

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
        setProductSuccessMsg(`"${productForm.title}" is now LIVE on the Industrial Marketplace!`);
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

  const displayName = user?.name || 'ashutosh kadam';
  const companyName = user?.company?.name || 'Gary Steel';
  const companyInitial = companyName.charAt(0).toUpperCase();

  // Summary Metrics
  const inTransitCount = displayPurchases.filter((d) => d.status === 'In Transit' || d.status === 'Dispatch').length;
  const deliveredCount = displayPurchases.filter((d) => d.status === 'Delivery' || d.status === 'Exchange Completed').length;
  const totalOrdersCount = displayPurchases.length;
  const activeDealsCount = deals.length;

  return (
    <div className="w-full min-h-screen bg-[#FDFCF8] text-[#101010] py-6 sm:py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* ========================================================= */}
        {/* TOP ENTERPRISE BANNER (Matching Reference Design) */}
        {/* ========================================================= */}
        <div className="relative overflow-hidden rounded-3xl border border-[#E3DBCC] bg-white shadow-sm">
          {/* Subtle industrial steel coils backdrop on the right */}
          <div
            className="absolute inset-y-0 right-0 w-full sm:w-1/2 bg-cover bg-right opacity-30 sm:opacity-90 pointer-events-none"
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1505705694340-019e1e335916?auto=format&fit=crop&w=1200&q=80")',
            }}
          >
            {/* Smooth gradient blend into card background */}
            <div className="w-full h-full bg-gradient-to-r from-white via-white/80 to-transparent" />
          </div>

          <div className="relative z-10 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left Column: Avatar + Organization Header */}
            <div className="flex items-start gap-4 sm:gap-5">
              {/* Organization Initial Badge */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#101010] text-[#FDFCF8] flex items-center justify-center font-black text-2xl sm:text-3xl shrink-0 shadow-md">
                {companyInitial}
              </div>

              <div className="space-y-1">
                {/* Audited Facility Badge in Refined Emerald */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-[#065F46]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Audited Facility</span>
                </div>

                {/* Company Name */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-[#101010] tracking-tight">
                  {companyName}
                </h1>

                {/* Subtitle Details */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#101010]/70 font-mono">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#101010]/50" />
                    Managed by <strong className="text-[#101010]">{displayName}</strong>
                  </span>
                  <span className="text-[#101010]/30">•</span>
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#101010]/50" />
                    {user?.company?.industry || 'Steel & Metallurgy'}
                  </span>
                </div>

                <p className="text-xs text-[#101010]/60 max-w-xl pt-0.5 font-normal">
                  Quality steel products for a stronger tomorrow. Trusted by industries worldwide.
                </p>
              </div>
            </div>

            {/* Right Column: Pill Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => switchTab('add-product')}
                className="px-5 py-3 rounded-full bg-[#101010] hover:bg-black text-[#FDFCF8] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-white" />
                <span>List New Product</span>
              </button>

              <button
                type="button"
                onClick={() => switchTab('orders')}
                className="px-5 py-3 rounded-full bg-white hover:bg-[#F3F0E9] border border-[#E3DBCC] text-[#101010] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-xs active:scale-95 cursor-pointer"
              >
                <Package className="w-4 h-4 text-[#065F46]" />
                <span>My Orders</span>
              </button>
            </div>
          </div>
        </div>

        {/* Success Banner if Purchase just made */}
        {purchaseSuccessBanner && (
          <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] flex items-center justify-between gap-3 animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />
              <span className="text-xs sm:text-sm font-bold">{purchaseSuccessBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setPurchaseSuccessBanner('')}
              className="text-[#065F46] hover:text-[#047857] p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* MAIN TWO-COLUMN WORKSPACE GRID */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================= */}
          {/* LEFT SIDEBAR NAVIGATION */}
          {/* ========================================================= */}
          <aside className="lg:col-span-3 card-ivory p-4 border border-[#E3DBCC] rounded-3xl bg-white shadow-xs sticky top-24 space-y-6">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#101010]/50 font-bold mb-3 px-2">
                Workspace Menu
              </div>

              {/* Navigation Items */}
              <nav className="space-y-1.5">
                {/* 1. Dashboard Overview */}
                <button
                  type="button"
                  onClick={() => switchTab('dashboard')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-left cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'bg-[#101010] text-white shadow-sm'
                      : 'text-[#101010]/75 hover:bg-[#F3F0E9] hover:text-[#101010]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Compass className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-white' : 'text-[#101010]/60'}`} />
                    <span>Dashboard</span>
                  </div>
                </button>

                {/* 2. Purchased Orders & Dispatch */}
                <button
                  type="button"
                  onClick={() => switchTab('orders')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-left cursor-pointer ${
                    activeTab === 'orders'
                      ? 'bg-[#101010] text-white shadow-sm'
                      : 'text-[#101010]/75 hover:bg-[#F3F0E9] hover:text-[#101010]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Truck className={`w-4 h-4 ${activeTab === 'orders' ? 'text-white' : 'text-[#101010]/60'}`} />
                    <span>Purchased Orders & Dispatch</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-[#E3DBCC] text-[#101010]'
                    }`}
                  >
                    {totalOrdersCount}
                  </span>
                </button>

                {/* 3. Add Product */}
                <button
                  type="button"
                  onClick={() => switchTab('add-product')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-left cursor-pointer ${
                    activeTab === 'add-product'
                      ? 'bg-[#101010] text-white shadow-sm'
                      : 'text-[#101010]/75 hover:bg-[#F3F0E9] hover:text-[#101010]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <PlusCircle className={`w-4 h-4 ${activeTab === 'add-product' ? 'text-white' : 'text-[#101010]/60'}`} />
                    <span>Add Product</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] px-2 py-0.5 rounded-full font-bold">
                    LIVE
                  </span>
                </button>

                {/* 4. My Products */}
                <button
                  type="button"
                  onClick={() => switchTab('my-products')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-left cursor-pointer ${
                    activeTab === 'my-products'
                      ? 'bg-[#101010] text-white shadow-sm'
                      : 'text-[#101010]/75 hover:bg-[#F3F0E9] hover:text-[#101010]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Box className={`w-4 h-4 ${activeTab === 'my-products' ? 'text-white' : 'text-[#101010]/60'}`} />
                    <span>My Products</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      activeTab === 'my-products' ? 'bg-white/20 text-white' : 'bg-[#E3DBCC] text-[#101010]'
                    }`}
                  >
                    {myListedResources.length || 5}
                  </span>
                </button>

                {/* 5. Deals & Contracts */}
                <button
                  type="button"
                  onClick={() => switchTab('deals')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-left cursor-pointer ${
                    activeTab === 'deals'
                      ? 'bg-[#101010] text-white shadow-sm'
                      : 'text-[#101010]/75 hover:bg-[#F3F0E9] hover:text-[#101010]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sliders className={`w-4 h-4 ${activeTab === 'deals' ? 'text-white' : 'text-[#101010]/60'}`} />
                    <span>Deals & Contracts</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      activeTab === 'deals' ? 'bg-white/20 text-white' : 'bg-[#E3DBCC] text-[#101010]'
                    }`}
                  >
                    {activeDealsCount}
                  </span>
                </button>

                {/* 6. Profile Settings */}
                <button
                  type="button"
                  onClick={() => switchTab('settings')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-left cursor-pointer ${
                    activeTab === 'settings'
                      ? 'bg-[#101010] text-white shadow-sm'
                      : 'text-[#101010]/75 hover:bg-[#F3F0E9] hover:text-[#101010]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-white' : 'text-[#101010]/60'}`} />
                    <span>Profile Settings</span>
                  </div>
                </button>
              </nav>
            </div>

            {/* Quick Links Section */}
            <div className="pt-4 border-t border-[#E3DBCC] space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#101010]/50 font-bold px-2">
                Quick Links
              </div>

              <div className="space-y-1.5 text-xs">
                <Link
                  to="/marketplace"
                  className="flex items-center justify-between px-2.5 py-2 rounded-xl text-[#101010]/75 hover:text-[#101010] hover:bg-[#F3F0E9] font-medium transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-[#101010]/60" />
                    <span>Browse Marketplace</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-[#101010]/40" />
                </Link>

                <Link
                  to="/ai-discovery"
                  className="flex items-center justify-between px-2.5 py-2 rounded-xl text-[#101010]/75 hover:text-[#101010] hover:bg-[#F3F0E9] font-medium transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-[#065F46]" />
                    <span>AI Material Matcher</span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-mono text-[#065F46] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                    New
                  </span>
                </Link>
              </div>

              {/* Sustainable Trade Mini Card */}
              <div className="p-3.5 rounded-2xl bg-[#F8FAF7] border border-[#E3DBCC] flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-[#ECFDF5] text-[#065F46] flex items-center justify-center shrink-0">
                    <Leaf className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-[#101010] text-[11px]">Sustainable trade</div>
                    <div className="text-[10px] text-[#101010]/60 leading-tight">
                      Building a circular industrial future
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#101010]/40 shrink-0" />
              </div>
            </div>
          </aside>

          {/* ========================================================= */}
          {/* MAIN CONTENT WORKSPACE */}
          {/* ========================================================= */}
          <main className="lg:col-span-9 space-y-6">

            {/* ========================================================= */}
            {/* VIEW 1: DASHBOARD OVERVIEW */}
            {/* ========================================================= */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black uppercase text-[#101010] tracking-tight">
                      Operations Overview
                    </h2>
                    <p className="text-xs text-[#101010]/65 mt-0.5">
                      Real-time overview of secondary resource dispatches, escrow settlements, and active deals.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPurchaseModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#101010] hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer self-start sm:self-center"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-white" />
                    <span>Instant Escrow Purchase</span>
                  </button>
                </div>

                {/* KPI Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-white border border-[#E3DBCC] shadow-xs">
                    <span className="text-[10px] font-mono uppercase text-[#101010]/50 tracking-wider font-bold block">
                      Total Orders
                    </span>
                    <div className="text-2xl font-black font-mono text-[#101010] mt-1">
                      {totalOrdersCount}
                    </div>
                    <span className="text-[10px] text-[#065F46] font-mono mt-1 block font-semibold">
                      Verified Escrow
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#E3DBCC] shadow-xs">
                    <span className="text-[10px] font-mono uppercase text-[#101010]/50 tracking-wider font-bold block">
                      In Transit
                    </span>
                    <div className="text-2xl font-black font-mono text-[#065F46] mt-1">
                      {inTransitCount}
                    </div>
                    <span className="text-[10px] text-[#101010]/55 font-mono mt-1 block">
                      Live Telematics Active
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#E3DBCC] shadow-xs">
                    <span className="text-[10px] font-mono uppercase text-[#101010]/50 tracking-wider font-bold block">
                      Delivered & Cleared
                    </span>
                    <div className="text-2xl font-black font-mono text-[#101010] mt-1">
                      {deliveredCount}
                    </div>
                    <span className="text-[10px] text-[#101010]/55 font-mono mt-1 block">
                      Tare Slip Approved
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#E3DBCC] shadow-xs">
                    <span className="text-[10px] font-mono uppercase text-[#101010]/50 tracking-wider font-bold block">
                      Active Deals
                    </span>
                    <div className="text-2xl font-black font-mono text-[#101010] mt-1">
                      {activeDealsCount}
                    </div>
                    <span className="text-[10px] text-[#065F46] font-mono mt-1 block font-semibold">
                      Commercial Contracts
                    </span>
                  </div>
                </div>

                {/* Quick Link Banner to Orders with Live Tracking */}
                <div className="p-6 rounded-3xl bg-white border border-[#E3DBCC] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] text-[#065F46] flex items-center justify-center shrink-0">
                      <Truck className="w-6 h-6 text-[#059669]" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold uppercase text-[#101010]">
                        Purchased Orders & Dispatch Live Tracking
                      </h3>
                      <p className="text-xs text-[#101010]/65 mt-0.5">
                        Track live vehicle locations, tare weighbridge status, and verify lab assay evidence.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => switchTab('orders')}
                    className="px-5 py-2.5 rounded-full bg-[#101010] hover:bg-black text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>View All Orders</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* VIEW 2: PURCHASED ORDERS & DISPATCH TRACKING (User's Exact UI) */}
            {/* ========================================================= */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                {/* Header: Title on Left, Action on Right */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white border border-[#E3DBCC] flex items-center justify-center text-[#101010] shrink-0 mt-0.5">
                      <Box className="w-5 h-5 text-[#101010]" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black uppercase text-[#101010] tracking-tight">
                        Purchased Orders & Dispatch Tracking
                      </h2>
                      <p className="text-xs text-[#101010]/65 mt-0.5">
                        Live tracking of verified secondary materials after escrow clearing.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={() => setIsPurchaseModalOpen(true)}
                      className="px-4 py-2.5 rounded-full bg-[#101010] hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-white" />
                      <span>Instant Escrow Purchase</span>
                    </button>
                    <Link
                      to="/marketplace"
                      className="px-4 py-2.5 rounded-full bg-white hover:bg-[#F3F0E9] border border-[#E3DBCC] text-[#101010] text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <span>Purchase More Materials</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* 4 Stat Cards Row (Exact Layout from Reference Image) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Card 1: Total Orders */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E3DBCC] shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#F8FAF7] border border-[#E3DBCC]/60 flex items-center justify-center text-[#101010] shrink-0">
                      <FileText className="w-5 h-5 text-[#101010]/70" />
                    </div>
                    <div>
                      <div className="text-xs font-mono uppercase text-[#101010]/55 font-bold">
                        Total Orders
                      </div>
                      <div className="text-2xl font-black font-mono text-[#101010] leading-none mt-1">
                        {totalOrdersCount}
                      </div>
                      <div className="text-[10px] text-[#101010]/45 font-mono mt-1">
                        — No change
                      </div>
                    </div>
                  </div>

                  {/* Card 2: In Transit */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E3DBCC] shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#F8FAF7] border border-[#E3DBCC]/60 flex items-center justify-center text-[#101010] shrink-0">
                      <Truck className="w-5 h-5 text-[#065F46]" />
                    </div>
                    <div>
                      <div className="text-xs font-mono uppercase text-[#101010]/55 font-bold">
                        In Transit
                      </div>
                      <div className="text-2xl font-black font-mono text-[#101010] leading-none mt-1">
                        {inTransitCount}
                      </div>
                      <div className="text-[10px] text-[#101010]/45 font-mono mt-1">
                        — No change
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Delivered */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E3DBCC] shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#F8FAF7] border border-[#E3DBCC]/60 flex items-center justify-center text-[#101010] shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-[#065F46]" />
                    </div>
                    <div>
                      <div className="text-xs font-mono uppercase text-[#101010]/55 font-bold">
                        Delivered
                      </div>
                      <div className="text-2xl font-black font-mono text-[#101010] leading-none mt-1">
                        {deliveredCount}
                      </div>
                      <div className="text-[10px] text-[#101010]/45 font-mono mt-1">
                        — No change
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Active Deals */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E3DBCC] shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#F8FAF7] border border-[#E3DBCC]/60 flex items-center justify-center text-[#101010] shrink-0">
                      <ShieldCheck className="w-5 h-5 text-[#101010]/70" />
                    </div>
                    <div>
                      <div className="text-xs font-mono uppercase text-[#101010]/55 font-bold">
                        Active Deals
                      </div>
                      <div className="text-2xl font-black font-mono text-[#101010] leading-none mt-1">
                        {activeDealsCount}
                      </div>
                      <div className="text-[10px] text-[#101010]/45 font-mono mt-1">
                        — No change
                      </div>
                    </div>
                  </div>
                </div>

                {/* If Zero Orders: Show Exact Reference Empty State */}
                {displayPurchases.length === 0 ? (
                  <div className="p-12 sm:p-16 text-center card-ivory border border-[#E3DBCC] rounded-3xl bg-white shadow-xs space-y-4">
                    {/* Package Illustration Icon with Green Checkmark */}
                    <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                      <div className="w-16 h-16 rounded-2xl bg-[#F3F0E9] border border-[#E3DBCC] flex items-center justify-center shadow-xs">
                        <Box className="w-8 h-8 text-[#101010]/50" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] flex items-center justify-center shadow-xs">
                        <Check className="w-4 h-4 text-[#059669]" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-black uppercase text-[#101010]">
                        No orders placed yet
                      </h3>
                      <p className="text-xs sm:text-sm text-[#101010]/60 max-w-md mx-auto mt-1 leading-relaxed">
                        Browse secondary industrial residuals on our marketplace, initiate purchase agreements, and track deliveries here.
                      </p>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                      <Link
                        to="/marketplace"
                        className="px-6 py-3 rounded-full bg-[#101010] hover:bg-black text-[#FDFCF8] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm active:scale-95 cursor-pointer"
                      >
                        <Compass className="w-4 h-4" />
                        <span>Explore Marketplace →</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => setIsPurchaseModalOpen(true)}
                        className="px-6 py-3 rounded-full bg-white hover:bg-[#F3F0E9] border border-[#E3DBCC] text-[#101010] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                      >
                        <CreditCard className="w-4 h-4 text-[#065F46]" />
                        <span>Place Instant Escrow Order</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ========================================================= */
                  /* ORDERS LIST WITH REAL-TIME DISPATCH TELEMATICS TRACKING */
                  /* ========================================================= */
                  <div className="space-y-6">
                    {displayPurchases.map((deal, idx) => {
                      const stage =
                        deal.status === 'Exchange Completed'
                          ? 5
                          : deal.status === 'Delivery'
                          ? 4
                          : deal.status === 'In Transit'
                          ? 3
                          : deal.status === 'Dispatch'
                          ? 2
                          : 1;

                      const price = deal.finalAgreedPrice || deal.currentNegotiatedPrice || deal.originalPrice || 45;
                      const quantity = deal.quantity || 250;
                      const totalCost = deal.costs?.totalPayable || quantity * price + 3500;
                      const orderRef = `ORD-${deal.dealNumber || 'DL-' + (849100 + idx)}`;
                      const supplierName = deal.seller?.name || 'Tata Industrial Metallurgy Works';
                      const materialTitle = deal.resource?.title || 'Blast Furnace Granulated Slag (GGBS)';
                      const photoUrl = getMaterialPhoto(materialTitle, deal.resource?.category);

                      return (
                        <div
                          key={deal._id || idx}
                          className="card-ivory p-6 border border-[#E3DBCC] hover:border-[#101010]/40 rounded-3xl bg-white transition-all shadow-xs space-y-6"
                        >
                          {/* Top Row: Ref, Title, Escrow Status, Amount */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-[#E3DBCC]">
                            <div className="flex items-start gap-4">
                              <img
                                src={photoUrl}
                                alt={materialTitle}
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-[#E3DBCC] shrink-0"
                              />

                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                                  <span className="font-bold text-[#101010] bg-[#F3F0E9] border border-[#E3DBCC] px-2.5 py-0.5 rounded-md">
                                    {orderRef}
                                  </span>
                                  <span className="text-[#101010]/30">•</span>
                                  <span className="text-[#101010]/60">
                                    Purchased on Sep 26, 2026
                                  </span>
                                </div>

                                <h3 className="text-lg sm:text-xl font-black uppercase text-[#101010] tracking-tight">
                                  {materialTitle}
                                </h3>

                                <div className="text-xs text-[#101010]/70 font-mono">
                                  Supplier: <span className="font-bold text-[#101010]">{supplierName}</span>
                                </div>
                              </div>
                            </div>

                            <div className="sm:text-right shrink-0">
                              <span className="text-[10px] font-mono uppercase text-[#101010]/50 tracking-wider block font-bold">
                                Escrow Locked Total
                              </span>
                              <div className="text-2xl font-black font-mono text-[#101010] mt-0.5">
                                ₹{totalCost.toLocaleString()}
                              </div>
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[11px] font-mono font-bold text-[#065F46] mt-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                                <span>Escrow Payment Verified</span>
                              </div>
                            </div>
                          </div>

                          {/* Consignment Specs Row */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F8FAF7] border border-[#E3DBCC]/70 p-3.5 rounded-2xl text-xs font-mono">
                            <div>
                              <span className="text-[#101010]/50 block text-[10px] uppercase font-bold">Batch Size</span>
                              <span className="font-bold text-[#101010]">{quantity.toLocaleString()} {deal.unit || 'tons'}</span>
                            </div>
                            <div>
                              <span className="text-[#101010]/50 block text-[10px] uppercase font-bold">Unit Settlement</span>
                              <span className="font-bold text-[#101010]">₹{price}/{deal.unit?.replace('/month', '') || 'ton'}</span>
                            </div>
                            <div>
                              <span className="text-[#101010]/50 block text-[10px] uppercase font-bold">Logistics Haulage</span>
                              <span className="font-bold text-[#101010]">Origin Yard → Gate 2 Dock</span>
                            </div>
                            <div>
                              <span className="text-[#101010]/50 block text-[10px] uppercase font-bold">Clearinghouse UTR</span>
                              <span className="font-bold text-[#101010]">UTR-8492048X</span>
                            </div>
                          </div>

                          {/* ========================================================= */}
                          {/* 5-STAGE INTERACTIVE DISPATCH PROGRESS TIMELINE */}
                          {/* ========================================================= */}
                          <div className="space-y-4 pt-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-mono">
                              <span className="font-bold uppercase tracking-wider text-[#101010] flex items-center gap-2">
                                <Activity className="w-4 h-4 text-[#065F46]" />
                                Live Dispatch & Delivery Status:
                              </span>
                              <span className="font-bold text-[#065F46] flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#059669] animate-ping" />
                                {stage >= 5
                                  ? '✓ Delivered & Weighbridge Signoff Completed'
                                  : stage >= 4
                                  ? '🚛 Inbound Weighbridge Gate 2 — Unloading'
                                  : stage >= 3
                                  ? '🚛 Highway Telematics Active — ETA 3.5 hrs'
                                  : stage >= 2
                                  ? '📦 Dispatch Manifest & Tare Weight Verified'
                                  : '🔒 Escrow Vault Cleared — Awaiting Dispatch'}
                              </span>
                            </div>

                            {/* Animated Multi-Stage Progress Bar */}
                            <div className="w-full bg-[#E3DBCC]/70 h-2.5 rounded-full overflow-hidden p-0.5">
                              <div
                                className="bg-[#065F46] h-full rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${(stage / 5) * 100}%` }}
                              />
                            </div>

                            {/* Milestones Steps */}
                            <div className="grid grid-cols-5 gap-1 text-center pt-1">
                              {/* Step 1 */}
                              <div className="flex flex-col items-center">
                                <div className="w-7 h-7 rounded-full bg-[#065F46] text-white flex items-center justify-center text-xs font-bold mb-1 shadow-xs">
                                  ✓
                                </div>
                                <span className="text-[10px] font-mono font-bold text-[#101010]">1. Escrow Paid</span>
                                <span className="text-[9px] text-[#101010]/50 font-mono">Fund Locked</span>
                              </div>

                              {/* Step 2 */}
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-all ${
                                    stage >= 2 ? 'bg-[#065F46] text-white shadow-xs' : 'bg-[#E3DBCC] text-[#101010]/50'
                                  }`}
                                >
                                  {stage >= 2 ? '✓' : '2'}
                                </div>
                                <span className="text-[10px] font-mono font-bold text-[#101010]">2. QC Assay</span>
                                <span className="text-[9px] text-[#101010]/50 font-mono">Lab Verified</span>
                              </div>

                              {/* Step 3 */}
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-all ${
                                    stage >= 3 ? 'bg-[#065F46] text-white shadow-xs' : 'bg-[#E3DBCC] text-[#101010]/50'
                                  }`}
                                >
                                  {stage >= 3 ? '✓' : '3'}
                                </div>
                                <span className="text-[10px] font-mono font-bold text-[#101010]">3. Dispatched</span>
                                <span className="text-[9px] text-[#101010]/50 font-mono">Tare Weighed</span>
                              </div>

                              {/* Step 4 */}
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-all ${
                                    stage >= 4 ? 'bg-[#065F46] text-white shadow-xs' : 'bg-[#E3DBCC] text-[#101010]/50'
                                  }`}
                                >
                                  {stage >= 4 ? '✓' : '4'}
                                </div>
                                <span className="text-[10px] font-mono font-bold text-[#101010]">4. In Transit</span>
                                <span className="text-[9px] text-[#101010]/50 font-mono">Live Highway GPS</span>
                              </div>

                              {/* Step 5 */}
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-all ${
                                    stage >= 5 ? 'bg-[#065F46] text-white shadow-xs' : 'bg-[#E3DBCC] text-[#101010]/50'
                                  }`}
                                >
                                  {stage >= 5 ? '✓' : '5'}
                                </div>
                                <span className="text-[10px] font-mono font-bold text-[#101010]">5. Delivered</span>
                                <span className="text-[9px] text-[#101010]/50 font-mono">Dock Signoff</span>
                              </div>
                            </div>
                          </div>

                          {/* ========================================================= */}
                          {/* REAL-TIME HIGHWAY TELEMATICS & TRUCK LOCATION DRAWER */}
                          {/* ========================================================= */}
                          <div className="p-4 sm:p-5 rounded-2xl bg-[#FDFCF8] border border-[#E3DBCC] space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E3DBCC]/60 pb-3">
                              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#101010]">
                                <Truck className="w-4 h-4 text-[#065F46]" />
                                <span>BlueStar Heavy Bulk Haulage • Fleet Truck #MH-12-Q-4921</span>
                              </div>
                              <div className="text-xs font-mono text-[#065F46] font-semibold flex items-center gap-1.5">
                                <Radio className="w-3.5 h-3.5 text-[#059669] animate-pulse" />
                                <span>GPS Telematics Active (Speed: 58 km/h)</span>
                              </div>
                            </div>

                            {/* Simulated Route Visualization: Origin -> Truck -> Destination */}
                            <div className="py-2">
                              <div className="relative flex items-center justify-between text-xs font-mono">
                                <div className="text-left">
                                  <div className="font-bold text-[#101010]">Origin Plant Yard</div>
                                  <div className="text-[10px] text-[#101010]/50">Nagpur Industrial Corridor</div>
                                </div>

                                <div className="flex-1 mx-4 sm:mx-8 relative">
                                  <div className="h-1.5 bg-[#E3DBCC] rounded-full w-full" />
                                  {/* Moving Truck Pin */}
                                  <div
                                    className="absolute -top-3 -translate-x-1/2 flex flex-col items-center transition-all duration-700"
                                    style={{
                                      left: `${stage === 1 ? '10%' : stage === 2 ? '30%' : stage === 3 ? '60%' : stage === 4 ? '88%' : '100%'}`,
                                    }}
                                  >
                                    <div className="w-7 h-7 rounded-full bg-[#101010] text-white flex items-center justify-center shadow-md">
                                      <Truck className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-[9px] font-bold text-[#101010] mt-0.5 whitespace-nowrap bg-white px-1.5 py-0.5 rounded shadow-xs border border-[#E3DBCC]">
                                      {stage >= 5 ? 'At Destination' : 'Toll Checkpoint'}
                                    </span>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <div className="font-bold text-[#101010]">Inbound Facility Dock</div>
                                  <div className="text-[10px] text-[#101010]/50">Buyer Gate 2 Weighbridge</div>
                                </div>
                              </div>
                            </div>

                            {/* Telematics Info Bar */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono pt-1 text-[#101010]/75">
                              <div>
                                <span className="text-[#101010]/50 block text-[9px] uppercase">Current Landmark:</span>
                                <strong>NH-48 Highway, Toll Khed</strong>
                              </div>
                              <div>
                                <span className="text-[#101010]/50 block text-[9px] uppercase">Driver & Contact:</span>
                                <strong>Rajesh Kumar (+91 98231 44021)</strong>
                              </div>
                              <div>
                                <span className="text-[#101010]/50 block text-[9px] uppercase">Digital Cargo Seal:</span>
                                <span className="text-[#065F46] font-bold">✓ Intact (#SEAL-8891)</span>
                              </div>
                              <div>
                                <span className="text-[#101010]/50 block text-[9px] uppercase">Estimated Arrival:</span>
                                <strong>3 hrs 45 mins</strong>
                              </div>
                            </div>
                          </div>

                          {/* Bottom Action Controls */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E3DBCC]">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Open Live GPS Map Modal */}
                              <button
                                type="button"
                                onClick={() => setActiveTrackingDeal(deal)}
                                className="px-4 py-2 rounded-xl bg-white hover:bg-[#F3F0E9] border border-[#E3DBCC] text-xs font-bold uppercase tracking-wider text-[#101010] flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                              >
                                <Navigation className="w-3.5 h-3.5 text-[#065F46]" />
                                <span>Track Live GPS Route</span>
                              </button>

                              {/* Open Waybill / Consignment receipt */}
                              <button
                                type="button"
                                onClick={() => setActiveWaybillDeal(deal)}
                                className="px-4 py-2 rounded-xl bg-white hover:bg-[#F3F0E9] border border-[#E3DBCC] text-xs font-bold uppercase tracking-wider text-[#101010] flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                              >
                                <FileText className="w-3.5 h-3.5 text-[#101010]/70" />
                                <span>E-Way Bill & Tare Slip</span>
                              </button>

                              {/* Advance Stage button for live simulation */}
                              <button
                                type="button"
                                onClick={() => handleAdvanceDispatch(deal._id)}
                                disabled={advancingDealId === deal._id}
                                className="px-3.5 py-2 rounded-xl bg-[#ECFDF5] hover:bg-[#D1FAE5] border border-[#A7F3D0] text-xs font-bold uppercase tracking-wider text-[#065F46] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                                title="Simulate vehicle moving to the next highway checkpoint"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 text-[#059669] ${advancingDealId === deal._id ? 'animate-spin' : ''}`} />
                                <span>Advance Transit State</span>
                              </button>
                            </div>

                            <Link
                              to={`/deals/${deal._id}`}
                              className="px-5 py-2.5 rounded-xl bg-[#101010] hover:bg-black text-[#FDFCF8] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              <span>Open Deal Workspace</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* VIEW 3: ADD LIVE PRODUCT FORM */}
            {/* ========================================================= */}
            {activeTab === 'add-product' && (
              <div className="card-ivory p-6 sm:p-8 border border-[#E3DBCC] rounded-3xl bg-white shadow-xs space-y-6">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-[#065F46] font-bold">
                    Direct Marketplace Publishing
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black uppercase text-[#101010] mt-1 tracking-tight">
                    Add Live Industrial Resource
                  </h2>
                  <p className="text-xs sm:text-sm text-[#101010]/70 mt-1">
                    List by-products, residuals, and secondary minerals directly into our active marketplace.
                  </p>
                </div>

                {productSuccessMsg && (
                  <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] flex items-center justify-between gap-3 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />
                      <span className="text-xs sm:text-sm font-bold">{productSuccessMsg}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => switchTab('my-products')}
                      className="px-3.5 py-1.5 rounded-xl bg-[#065F46] hover:bg-[#047857] text-white text-xs font-bold cursor-pointer"
                    >
                      View in Inventory
                    </button>
                  </div>
                )}

                <form onSubmit={handleAddProduct} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-[#101010]/70 font-bold mb-1.5">
                        Material Title *
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
                        Category *
                      </label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] bg-white text-sm text-[#101010] focus:outline-none focus:border-[#101010]"
                      >
                        <option value="Slag">Slag & Metallurgical Residues</option>
                        <option value="Fly Ash">Fly Ash & Pozzolans</option>
                        <option value="Chemical Gypsum">Phosphogypsum & Chemical Cakes</option>
                        <option value="Foundry Sand">Silica & Foundry Sand</option>
                        <option value="Spent Caustic">Spent Caustic & Chemicals</option>
                        <option value="By-product">Other Industrial By-product</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-[#101010]/70 font-bold mb-1.5">
                        Monthly Volume *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="1200"
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
                        <option value="tons">tons (single batch)</option>
                        <option value="MT">Metric Tons</option>
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
                        placeholder="65"
                        value={productForm.basePrice}
                        onChange={(e) => setProductForm({ ...productForm, basePrice: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] bg-white text-sm text-[#101010] focus:outline-none focus:border-[#101010]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-[#101010]/70 font-bold mb-1.5">
                        City / Plant Location *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nagpur"
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
                        placeholder="Maharashtra"
                        value={productForm.state}
                        onChange={(e) => setProductForm({ ...productForm, state: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] bg-white text-sm text-[#101010] focus:outline-none focus:border-[#101010]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-[#101010]/70 font-bold mb-1.5">
                        Physical State
                      </label>
                      <select
                        value={productForm.stateOfMatter}
                        onChange={(e) => setProductForm({ ...productForm, stateOfMatter: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] bg-white text-sm text-[#101010] focus:outline-none focus:border-[#101010]"
                      >
                        <option value="Solid">Solid</option>
                        <option value="Slurry">Slurry / Filter Cake</option>
                        <option value="Liquid">Liquid</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-[#101010]/70 font-bold mb-1.5">
                      Technical & Chemical Description *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Describe continuous generation rate, chemical composition, moisture levels, and recommended cementitious/aggregate replacements..."
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] bg-white text-sm text-[#101010] focus:outline-none focus:border-[#101010]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E3DBCC]">
                    <button
                      type="submit"
                      disabled={submittingProduct}
                      className="px-6 py-3 rounded-full bg-[#101010] hover:bg-black text-[#FDFCF8] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {submittingProduct ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>Publishing to Marketplace...</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-4 h-4 text-white" />
                          <span>Publish Product Live Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ========================================================= */}
            {/* VIEW 4: MY LISTED PRODUCTS */}
            {/* ========================================================= */}
            {activeTab === 'my-products' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black uppercase text-[#101010] tracking-tight">
                      My Live Industrial Listings
                    </h2>
                    <p className="text-xs text-[#101010]/70 mt-0.5">
                      Products published by your facility and active on the circular exchange.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => switchTab('add-product')}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#101010] hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-colors self-start sm:self-center cursor-pointer shadow-sm"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-white" />
                    <span>Add New Listing</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(myListedResources.length > 0 ? myListedResources : resources).map((res) => (
                    <div
                      key={res._id}
                      className="card-ivory p-5 border border-[#E3DBCC] hover:border-[#101010]/50 rounded-3xl bg-white transition-all shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-mono uppercase bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
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
                          <div className="text-[10px] font-mono uppercase text-[#101010]/50 font-bold">Available</div>
                          <div className="text-sm font-black font-mono text-[#101010]">
                            {res.quantity?.toLocaleString()} {res.unit}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-mono uppercase text-[#101010]/50 font-bold">Base Price</div>
                          <div className="text-sm font-black font-mono text-[#065F46]">
                            ₹{res.basePrice}/{res.unit?.replace('/month', '')}
                          </div>
                        </div>
                        <Link
                          to={`/materials/${res._id}`}
                          className="px-3.5 py-1.5 rounded-xl bg-[#101010] text-white text-xs font-bold hover:bg-black transition-colors flex items-center gap-1"
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
            {/* VIEW 5: DEALS & CONTRACTS PIPELINE */}
            {/* ========================================================= */}
            {activeTab === 'deals' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase text-[#101010] tracking-tight">
                    Commercial Agreements & Deals
                  </h2>
                  <p className="text-xs text-[#101010]/70 mt-0.5">
                    Structured multi-stage contracts, quality assessments, and settlement escrow.
                  </p>
                </div>

                <div className="space-y-4">
                  {deals.length === 0 ? (
                    <div className="p-12 text-center card-ivory border border-[#E3DBCC] rounded-3xl bg-white">
                      <p className="text-sm font-bold text-[#101010]">No active deals yet.</p>
                      <Link
                        to="/marketplace"
                        className="mt-3 inline-block px-5 py-2.5 rounded-full bg-[#101010] text-white text-xs font-bold"
                      >
                        Explore Marketplace
                      </Link>
                    </div>
                  ) : (
                    deals.map((deal) => (
                      <div
                        key={deal._id}
                        className="card-ivory p-5 border border-[#E3DBCC] hover:border-[#101010]/40 rounded-3xl bg-white transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1 text-xs font-mono">
                            <span className="font-bold text-[#101010] bg-[#F3F0E9] px-2 py-0.5 rounded border border-[#E3DBCC]">
                              {deal.dealNumber}
                            </span>
                            <span className="text-[#101010]/30">•</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] font-bold text-[10px] border border-[#A7F3D0]">
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
                            <div className="text-[10px] font-mono uppercase text-[#101010]/50 font-bold">Volume</div>
                            <div className="text-sm font-bold font-mono">
                              {deal.quantity} {deal.unit}
                            </div>
                          </div>

                          <Link
                            to={`/deals/${deal._id}`}
                            className="px-4 py-2 rounded-xl bg-[#101010] text-white text-xs font-bold hover:bg-black transition-colors flex items-center gap-1 shadow-sm"
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
            {/* VIEW 6: PROFILE SETTINGS */}
            {/* ========================================================= */}
            {activeTab === 'settings' && (
              <div className="card-ivory p-6 sm:p-8 border border-[#E3DBCC] rounded-3xl bg-white shadow-xs space-y-6">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-[#065F46] font-bold">
                    Credential Management
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black uppercase text-[#101010] mt-1 tracking-tight">
                    Profile & Company Settings
                  </h2>
                  <p className="text-xs sm:text-sm text-[#101010]/70 mt-1">
                    Update your authorized user profile, designation, plant location, and verified corporate details.
                  </p>
                </div>

                {profileSuccessMsg && (
                  <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs sm:text-sm font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />
                    <span>{profileSuccessMsg}</span>
                  </div>
                )}
                {profileErrorMsg && (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm font-semibold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <span>{profileErrorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-6">
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
                          Corporate Job Title
                        </label>
                        <input
                          type="text"
                          value={profileForm.jobTitle}
                          onChange={(e) => setProfileForm({ ...profileForm, jobTitle: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] bg-white text-sm text-[#101010] focus:outline-none focus:border-[#101010]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-[#101010]/55 font-bold border-b border-[#E3DBCC] pb-2">
                      2. Company & Facility Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono uppercase text-[#101010]/70 font-bold mb-1.5">
                          Organization Legal Name *
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
                          Primary Industry
                        </label>
                        <input
                          type="text"
                          value={profileForm.industry}
                          onChange={(e) => setProfileForm({ ...profileForm, industry: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] bg-white text-sm text-[#101010] focus:outline-none focus:border-[#101010]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-[#101010]/70 font-bold mb-1.5">
                          Plant City
                        </label>
                        <input
                          type="text"
                          value={profileForm.city}
                          onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] bg-white text-sm text-[#101010] focus:outline-none focus:border-[#101010]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-[#101010]/70 font-bold mb-1.5">
                          Plant State
                        </label>
                        <input
                          type="text"
                          value={profileForm.state}
                          onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] bg-white text-sm text-[#101010] focus:outline-none focus:border-[#101010]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-[#101010]/70 font-bold mb-1.5">
                        Facility Mission & Secondary Stream Strategy
                      </label>
                      <textarea
                        rows={2}
                        value={profileForm.description}
                        onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] bg-white text-sm text-[#101010] focus:outline-none focus:border-[#101010]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E3DBCC]">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-6 py-3 rounded-full bg-[#101010] hover:bg-black text-[#FDFCF8] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {savingProfile ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>Saving Profile...</span>
                        </>
                      ) : (
                        <span>Save Credentials</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: INSTANT ESCROW PURCHASE MODAL */}
      {/* ========================================================= */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="card-ivory w-full max-w-lg rounded-3xl bg-white border border-[#E3DBCC] shadow-2xl p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DBCC]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#065F46] font-bold">
                  Automated Escrow Protocol
                </span>
                <h3 className="text-xl font-black uppercase text-[#101010] tracking-tight">
                  Instant Purchase & Escrow
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPurchaseModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F3F0E9] hover:bg-[#E3DBCC] flex items-center justify-center text-[#101010]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteInstantPurchase} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#101010]/70 font-bold mb-1">
                  Select Material Stream *
                </label>
                <select
                  required
                  value={purchaseForm.resourceId}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, resourceId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] bg-white text-xs sm:text-sm font-semibold text-[#101010]"
                >
                  {resources.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.title} — ₹{r.basePrice}/{r.unit || 'ton'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#101010]/70 font-bold mb-1">
                    Order Tonnage *
                  </label>
                  <input
                    type="number"
                    required
                    min="10"
                    value={purchaseForm.quantity}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] bg-white text-xs sm:text-sm font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#101010]/70 font-bold mb-1">
                    Escrow Channel *
                  </label>
                  <select
                    value={purchaseForm.paymentMethod}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, paymentMethod: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3DBCC] bg-white text-xs font-semibold"
                  >
                    <option value="NEFT / RTGS Industrial Escrow Vault">RTGS Corporate Escrow</option>
                    <option value="Industrial Trade Letter of Credit">Bank LC Guarantee</option>
                    <option value="Instant Verified Clearing">UPI Business Settlement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#101010]/70 font-bold mb-1">
                  Delivery & Receiving Note
                </label>
                <input
                  type="text"
                  value={purchaseForm.deliveryNotes}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, deliveryNotes: e.target.value })}
                  placeholder="Gate instructions, weighbridge tare note..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E3DBCC] bg-white text-xs"
                />
              </div>

              {/* Price Calculation Box */}
              <div className="p-3.5 rounded-2xl bg-[#F8FAF7] border border-[#E3DBCC] space-y-1 text-xs font-mono">
                <div className="flex justify-between text-[#101010]/70">
                  <span>Material Subtotal:</span>
                  <span>₹{((Number(purchaseForm.quantity) || 100) * 55).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#101010]/70">
                  <span>Haulage & Tare Weighed Logistics:</span>
                  <span>₹{((Number(purchaseForm.quantity) || 100) * 10).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#101010]/70">
                  <span>Escrow Platform Insurance (1.5%):</span>
                  <span>₹{Math.round(((Number(purchaseForm.quantity) || 100) * 55) * 0.015).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#101010] pt-1.5 border-t border-[#E3DBCC]">
                  <span>Total Payable into Escrow:</span>
                  <span className="text-[#065F46]">
                    ₹{(
                      (Number(purchaseForm.quantity) || 100) * 65 +
                      Math.round(((Number(purchaseForm.quantity) || 100) * 55) * 0.015)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPurchaseModalOpen(false)}
                  className="px-4 py-2.5 rounded-full text-xs font-bold text-[#101010]/70 hover:bg-[#F3F0E9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={purchasing}
                  className="px-6 py-2.5 rounded-full bg-[#101010] hover:bg-black text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {purchasing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Securing Escrow...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-3.5 h-3.5 text-white" />
                      <span>Confirm Escrow Deposit & Dispatch</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: INTERACTIVE LIVE GPS ROUTE MAP */}
      {/* ========================================================= */}
      {activeTrackingDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="card-ivory w-full max-w-2xl rounded-3xl bg-white border border-[#E3DBCC] shadow-2xl p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DBCC]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#065F46] font-bold">
                  Highway Satellite Telematics
                </span>
                <h3 className="text-xl font-black uppercase text-[#101010] tracking-tight">
                  Live Dispatch GPS Tracking
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTrackingDeal(null)}
                className="w-8 h-8 rounded-full bg-[#F3F0E9] hover:bg-[#E3DBCC] flex items-center justify-center text-[#101010]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Interactive Simulated Map Canvas */}
            <div className="relative w-full h-64 rounded-2xl bg-[#E8EFEA] border border-[#A7F3D0] overflow-hidden flex flex-col justify-between p-4 shadow-inner">
              {/* Grid map texture */}
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage:
                    'radial-gradient(#065F46 1px, transparent 1px), radial-gradient(#065F46 1px, #E8EFEA 1px)',
                  backgroundSize: '20px 20px',
                }}
              />

              {/* Waypoint 1: Origin */}
              <div className="relative z-10 flex items-center gap-2 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-[#E3DBCC] shadow-xs w-max">
                <div className="w-2.5 h-2.5 rounded-full bg-[#101010]" />
                <span className="text-xs font-mono font-bold text-[#101010]">
                  Origin: Nagpur Industrial Plant Yard
                </span>
              </div>

              {/* Waypoint Center: Moving Truck Icon with Ping */}
              <div className="relative z-10 mx-auto text-center">
                <div className="relative inline-flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#065F46] text-white flex items-center justify-center shadow-lg animate-pulse">
                    <Truck className="w-6 h-6" />
                  </div>
                  <span className="absolute -bottom-6 whitespace-nowrap text-[11px] font-mono font-bold text-[#101010] bg-white px-2 py-0.5 rounded-md border border-[#E3DBCC] shadow-xs">
                    Current: NH-48 Corridor • Speed 58 km/h
                  </span>
                </div>
              </div>

              {/* Waypoint 3: Destination */}
              <div className="relative z-10 self-end flex items-center gap-2 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-[#E3DBCC] shadow-xs w-max">
                <div className="w-2.5 h-2.5 rounded-full bg-[#065F46]" />
                <span className="text-xs font-mono font-bold text-[#101010]">
                  Destination: Gary Steel Gate 2 Weighbridge
                </span>
              </div>
            </div>

            {/* Telematics Real-time Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F8FAF7] border border-[#E3DBCC] p-4 rounded-2xl text-xs font-mono">
              <div>
                <span className="text-[#101010]/50 block text-[10px] uppercase font-bold">Consignment ID</span>
                <span className="font-bold text-[#101010]">#TRK-IND-849104</span>
              </div>
              <div>
                <span className="text-[#101010]/50 block text-[10px] uppercase font-bold">Hauler Fleet</span>
                <span className="font-bold text-[#101010]">MH-12-Q-4921</span>
              </div>
              <div>
                <span className="text-[#101010]/50 block text-[10px] uppercase font-bold">Digital Tamper Seal</span>
                <span className="text-[#065F46] font-bold">✓ Intact (28°C)</span>
              </div>
              <div>
                <span className="text-[#101010]/50 block text-[10px] uppercase font-bold">Remaining ETA</span>
                <span className="font-bold text-[#101010]">3 hrs 45 mins</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#101010]/60 font-mono">
                Driver: Rajesh Kumar (+91 98231 44021)
              </span>
              <button
                type="button"
                onClick={() => {
                  handleAdvanceDispatch(activeTrackingDeal._id);
                }}
                className="px-4 py-2 rounded-full bg-[#101010] text-white text-xs font-bold uppercase tracking-wider hover:bg-black cursor-pointer shadow-sm"
              >
                Simulate Next Checkpoint →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: E-WAY BILL & TARE SLIP VIEWER */}
      {/* ========================================================= */}
      {activeWaybillDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="card-ivory w-full max-w-lg rounded-3xl bg-white border border-[#E3DBCC] shadow-2xl p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DBCC]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#065F46] font-bold">
                  Statutory Consignment Manifest
                </span>
                <h3 className="text-xl font-black uppercase text-[#101010] tracking-tight">
                  Electronic Way Bill & Tare Slip
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveWaybillDeal(null)}
                className="w-8 h-8 rounded-full bg-[#F3F0E9] hover:bg-[#E3DBCC] flex items-center justify-center text-[#101010]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-[#FDFCF8] border border-[#E3DBCC] space-y-3 font-mono text-xs text-[#101010]">
              <div className="flex justify-between border-b border-[#E3DBCC]/60 pb-2">
                <span className="text-[#101010]/60">E-Way Bill Number:</span>
                <strong className="font-bold">2819 0481 9920</strong>
              </div>
              <div className="flex justify-between border-b border-[#E3DBCC]/60 pb-2">
                <span className="text-[#101010]/60">Consignor (Seller):</span>
                <strong>{activeWaybillDeal.seller?.name || 'Tata Industrial Metallurgy Works'}</strong>
              </div>
              <div className="flex justify-between border-b border-[#E3DBCC]/60 pb-2">
                <span className="text-[#101010]/60">Consignee (Buyer):</span>
                <strong>{companyName}</strong>
              </div>
              <div className="flex justify-between border-b border-[#E3DBCC]/60 pb-2">
                <span className="text-[#101010]/60">Commodity Description:</span>
                <strong>{activeWaybillDeal.resource?.title || 'Granulated Slag (GGBS)'}</strong>
              </div>
              <div className="flex justify-between border-b border-[#E3DBCC]/60 pb-2">
                <span className="text-[#101010]/60">Net Weight / Volume:</span>
                <strong>{activeWaybillDeal.quantity || 250} {activeWaybillDeal.unit || 'tons'}</strong>
              </div>
              <div className="flex justify-between border-b border-[#E3DBCC]/60 pb-2">
                <span className="text-[#101010]/60">Vehicle & Tare Weighed:</span>
                <strong>MH-12-Q-4921 (Gross: 42.8 MT, Tare: 14.2 MT)</strong>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-[#101010]/60">Clearing Escrow Status:</span>
                <span className="text-[#065F46] font-bold">✓ Secured by RE:SOURCE Escrow Vault</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  alert('E-Way Bill & Tare Slip downloaded to your downloads folder.');
                  setActiveWaybillDeal(null);
                }}
                className="px-5 py-2.5 rounded-full bg-[#101010] text-white text-xs font-bold uppercase tracking-wider hover:bg-black cursor-pointer shadow-sm"
              >
                Download Official PDF Receipt
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
