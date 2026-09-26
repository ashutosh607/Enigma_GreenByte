import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Lock,
  CheckCircle,
  AlertCircle,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  CreditCard,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { resourceApi, dealApi, paymentApi } from '../services/api';
import MaterialPassport from '../components/MaterialPassport';

export default function MaterialDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dealQuantity, setDealQuantity] = useState(300);
  const [initiating, setInitiating] = useState(false);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    resourceApi
      .getResourceById(id)
      .then((res) => {
        setResource(res.data.resource);
        if (res.data.resource.quantity) {
          setDealQuantity(Math.min(res.data.resource.quantity, 300));
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load material');
        setLoading(false);
      });
  }, [id]);

  const handleInitiateDeal = async () => {
    if (!resource) return;
    setInitiating(true);
    try {
      const res = await dealApi.initiateDeal({
        resourceId: resource._id,
        quantity: dealQuantity,
        proposedPrice: resource.basePrice,
      });
      navigate(`/deals/${res.data.dealId}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to initiate deal');
      setInitiating(false);
    }
  };

  const handleInstantBuy = async () => {
    if (!resource) return;
    setBuying(true);
    try {
      await paymentApi.instantPurchase({
        resourceId: resource._id,
        quantity: dealQuantity,
        paymentMethod: 'NEFT / RTGS Industrial Escrow Vault',
        deliveryNotes: 'Instant Escrow order direct checkout.',
      });
      navigate('/dashboard?tab=orders');
    } catch (err) {
      alert(err.response?.data?.message || 'Instant payment processing failed');
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#101010] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-xs uppercase font-mono text-[#101010]/60">
            Retrieving Material Specifications...
          </div>
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-4">
        <div className="card-ivory p-8 border border-[#E3DBCC] max-w-md text-center">
          <p className="text-sm font-bold text-[#101010] mb-4">{error || 'Material not found'}</p>
          <Link
            to="/marketplace"
            className="px-4 py-2 rounded-lg bg-[#101010] text-[#FDFCF8] text-xs font-semibold"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const isConfidential = resource.identityVisibility === 'Confidential';
  const supplierDisplay = resource.seller?.name || (isConfidential ? '🔐 Verified Confidential Supplier' : 'Verified Producer');

  return (
    <div className="w-full min-h-screen bg-[#FDFCF8] text-[#101010] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#101010]/70 hover:text-[#101010] mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace Catalog
        </Link>

        {/* Top Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="card-ivory p-6 md:p-8 border border-[#E3DBCC] rounded-2xl mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-mono uppercase tracking-widest px-2.5 py-1 rounded bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010] font-semibold">
                  {resource.category || 'By-product'}
                </span>
                <span className="text-xs font-mono uppercase tracking-widest px-2.5 py-1 rounded bg-[#E3DBCC] text-[#101010] font-semibold">
                  {resource.stateOfMatter || 'Solid'}
                </span>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010]">
                  {resource.availability || 'Available Recurring'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#101010]">
                {resource.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[#101010]/75">
                <div className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#101010]" />
                  <span>{resource.location?.region || 'Western India'} ({resource.location?.approxDistanceKm || 85} km radius)</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {isConfidential ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-[#101010] bg-[#FDFCF8] px-2.5 py-0.5 rounded border border-[#E3DBCC]">
                      <Lock className="w-3.5 h-3.5 text-[#101010]" /> Verified Confidential Supplier
                    </span>
                  ) : (
                    <span className="font-semibold text-[#101010]">
                      Supplier: {supplierDisplay}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Price Box & Immediate Deal CTA */}
            <div className="bg-[#FDFCF8] p-5 rounded-xl border border-[#E3DBCC] min-w-[280px]">
              <span className="text-xs uppercase font-mono text-[#101010]/55 block">
                Base Quoted Price
              </span>
              <div className="text-3xl font-extrabold text-[#101010] font-mono mt-0.5">
                ₹{resource.basePrice}{' '}
                <span className="text-xs font-normal text-[#101010]/55">/ {resource.unit || 'ton'}</span>
              </div>
              <div className="text-[11px] font-mono text-[#101010]/60 mt-1">
                Structured Negotiation Range: ₹{resource.negotiationRange?.minPrice} — ₹{resource.negotiationRange?.maxPrice}
              </div>

              <div className="mt-4 pt-4 border-t border-[#E3DBCC] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#101010]/70">Required Batch:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={dealQuantity}
                      onChange={(e) => setDealQuantity(Number(e.target.value))}
                      className="w-20 px-2 py-1 text-right font-mono font-bold text-xs rounded bg-[#F3F0E9] border border-[#E3DBCC]"
                    />
                    <span className="text-[11px] font-mono text-[#101010]/60">{resource.unit || 'tons'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleInitiateDeal}
                  disabled={initiating || buying}
                  className="w-full py-3 rounded-xl bg-[#101010] text-[#FDFCF8] text-xs font-bold hover:bg-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {initiating ? 'Opening Commercial Deal...' : 'Initiate Deal & Negotiate'}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleInstantBuy}
                  disabled={initiating || buying}
                  className="w-full py-3 rounded-xl bg-[#065F46] hover:bg-[#059669] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 mt-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {buying
                      ? 'Securing Escrow Vault...'
                      : `Instant Escrow Purchase (₹${((dealQuantity || 100) * resource.basePrice).toLocaleString()})`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Two-Column Technical Layout */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Left Column: Material Passport & Properties */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="card-ivory p-6 border border-[#E3DBCC] rounded-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#101010] mb-2 font-mono">
                Technical Description & Industrial Generation
              </h3>
              <p className="text-sm text-[#101010]/80 leading-relaxed">
                {resource.description}
              </p>

              {resource.processingRequired && (
                <div className="mt-4 p-3 bg-[#FDFCF8] rounded-lg border border-[#E3DBCC] text-xs text-[#101010]">
                  <strong className="block font-mono uppercase mb-0.5">Processing Note:</strong>
                  {resource.processingDetails}
                </div>
              )}
            </div>

            {/* Material Passport Component */}
            <MaterialPassport resource={resource} />
          </div>

          {/* Right Column: Commercial & Logistics Summary */}
          <div className="space-y-6">
            <div className="card-ivory p-6 border border-[#E3DBCC] rounded-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#101010] mb-4 font-mono">
                Commercial Parameters
              </h3>

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between pb-2 border-b border-[#E3DBCC]/70">
                  <span className="text-[#101010]/60">Selling Method</span>
                  <span className="font-semibold text-[#101010]">{resource.sellingMethod || 'Price Negotiation'}</span>
                </div>

                <div className="flex justify-between pb-2 border-b border-[#E3DBCC]/70">
                  <span className="text-[#101010]/60">Recurring Monthly Capacity</span>
                  <span className="font-bold text-[#101010]">{resource.quantity?.toLocaleString()} {resource.unit}</span>
                </div>

                <div className="flex justify-between pb-2 border-b border-[#E3DBCC]/70">
                  <span className="text-[#101010]/60">Processing Status</span>
                  <span className="font-semibold text-[#101010]">
                    {resource.processingRequired ? 'Toll Processing Required' : 'Direct Aggregate Suitable'}
                  </span>
                </div>

                <div className="flex justify-between pb-2 border-b border-[#E3DBCC]/70">
                  <span className="text-[#101010]/60">Lab Evidence</span>
                  <span className="font-semibold text-[#101010] flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-[#101010]" />
                    {resource.materialPassport?.evidenceStatus || 'Verified'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#101010]/60">Trade Protocol</span>
                  <span className="font-semibold text-[#101010]">Escrow Protected</span>
                </div>
              </div>

              {/* Enter Deal CTA */}
              <div className="mt-6 pt-4 border-t border-[#E3DBCC]">
                <button
                  type="button"
                  onClick={handleInitiateDeal}
                  disabled={initiating}
                  className="w-full py-3 rounded-lg bg-[#101010] text-[#FDFCF8] text-xs font-bold hover:bg-black transition-all cursor-pointer shadow-sm disabled:opacity-50"
                >
                  Enter Deal Workflow →
                </button>
                <p className="text-[11px] text-center text-[#101010]/50 mt-2 font-mono">
                  Enters structured assessment & price slider.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
