import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sliders,
  FileCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ShieldCheck,
  Building,
  Calendar,
  Check,
  X,
  RefreshCw,
  TrendingDown,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchDealById,
  submitPriceRequest,
  acceptPriceRequest,
  counterPriceRequest,
  buyerAcceptCounter,
  rejectPriceRequest,
} from '../store/slices/dealSlice';
import { assessmentApi, paymentApi, exchangeApi } from '../services/api';
import DealTimeline from '../components/DealTimeline';
import PriceSlider from '../components/PriceSlider';

export default function DealWorkspacePage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { activeDeal: deal, loading, actionLoading } = useSelector((state) => state.deals);
  const { activeRole, user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('negotiation'); // 'negotiation' | 'assessment' | 'agreement' | 'fulfillment'
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [counterPriceInput, setCounterPriceInput] = useState(58);
  const [counterNote, setCounterNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Dispatch Form State
  const [dispatchData, setDispatchData] = useState({
    actualQuantity: 300,
    carrierName: 'BlueStar Bulk Freight Logistics',
    trackingNumber: 'TRK-IND-' + Math.floor(100000 + Math.random() * 900000),
    vehicleNumber: 'MH-12-QZ-4921',
    driverContact: '+91 98230 44102',
    dispatchNotes: 'Dispatched under sealed tarp industrial protection.',
  });

  // Delivery Form State
  const [deliveryData, setDeliveryData] = useState({
    quantityReceived: 300,
    receivingFacility: 'Receiving Silo Yard 3',
    deliveryCondition: 'Optimal',
    receiverName: 'S. Patil (Yard Lead)',
    deliveryNotes: 'Tare weighbridge recorded and gross matches consignment sheet.',
  });

  // Quality Audit Form State
  const [qualityData, setQualityData] = useState({
    status: 'Quality Approved',
    moistureLevelPercent: 2.5,
    purityVerifiedPercent: 92.4,
    notes: 'Laboratory certified within contract tolerance and mechanical aggregate wear limits.',
    hasDiscrepancy: false,
    discrepancyType: 'Quality Deviation',
    discrepancyNote: '',
  });

  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    dispatch(fetchDealById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (deal) {
      if (deal.status === 'Assessment') setActiveTab('assessment');
      else if (deal.status === 'Price Negotiation') setActiveTab('negotiation');
      else if (deal.status === 'Agreement' || deal.status === 'Payment Pending') setActiveTab('agreement');
      else if (['In Transit', 'Delivery', 'Quality Confirmation', 'Exchange Completed'].includes(deal.status)) {
        setActiveTab('fulfillment');
      }
      if (deal.quantity) {
        setDispatchData((prev) => ({ ...prev, actualQuantity: deal.quantity }));
        setDeliveryData((prev) => ({ ...prev, quantityReceived: deal.quantity }));
      }
      if (deal.currentNegotiatedPrice) {
        setCounterPriceInput(deal.currentNegotiatedPrice);
      }
    }
  }, [deal]);

  if (loading || !deal) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#101010] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-xs uppercase font-mono text-[#101010]/60">
            Accessing Commercial Deal Ledger...
          </div>
        </div>
      </div>
    );
  }

  const resource = deal.resource || {};
  const priceReq = deal.priceRequest || {};
  const assessment = deal.assessment || {};
  const exchange = deal.exchange || {};
  const costs = deal.costs || {};

  const isSeller = activeRole === 'seller';
  const isBuyer = activeRole === 'buyer';

  const isPriceAgreed =
    priceReq.status === 'FINAL_AGREED' ||
    deal.status === 'Agreement' ||
    deal.status === 'Payment Completed' ||
    deal.status === 'Exchange Completed' ||
    Boolean(deal.finalAgreedPrice);

  // Price Negotiation Handlers
  const handleBuyerSubmitSlider = (sliderData) => {
    dispatch(
      submitPriceRequest({
        dealId: deal._id,
        requestedMinPrice: sliderData.requestedMinPrice,
        requestedMaxPrice: sliderData.requestedMaxPrice,
        priceType: sliderData.priceType,
        note: sliderData.note,
      })
    );
  };

  const handleSellerAccept = () => {
    if (!priceReq._id) return;
    dispatch(acceptPriceRequest({ requestId: priceReq._id, dealId: deal._id }));
  };

  const handleSellerCounterSubmit = () => {
    if (!priceReq._id) return;
    dispatch(
      counterPriceRequest({
        requestId: priceReq._id,
        dealId: deal._id,
        counterPrice: Number(counterPriceInput),
        note: counterNote,
      })
    );
    setShowCounterModal(false);
  };

  const handleBuyerAcceptCounter = () => {
    if (!priceReq._id) return;
    dispatch(buyerAcceptCounter({ requestId: priceReq._id, dealId: deal._id }));
  };

  const handleSellerReject = () => {
    if (!priceReq._id) return;
    dispatch(
      rejectPriceRequest({
        requestId: priceReq._id,
        dealId: deal._id,
        reason: rejectReason,
      })
    );
    setShowRejectModal(false);
  };

  // Assessment Blocker Resolution
  const handleResolveBlocker = async (idx) => {
    try {
      await assessmentApi.updateBlocker(assessment._id, idx, {
        isResolved: true,
        evidenceSubmitted: true,
      });
      dispatch(fetchDealById(deal._id));
    } catch (err) {
      alert('Failed to resolve blocker');
    }
  };

  // Payment Execution
  const handleExecutePayment = async () => {
    setPaymentProcessing(true);
    try {
      await paymentApi.processPayment({
        dealId: deal._id,
        paymentMethod: 'NEFT / RTGS Industrial Escrow',
        transactionNotes: 'Real-time corporate clearing settled into RE:SOURCE Escrow Account',
      });
      setPaymentSuccess(true);
      await dispatch(fetchDealById(deal._id));
      setActiveTab('fulfillment');
    } catch (err) {
      alert(err.response?.data?.message || 'Payment processing failed');
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Dispatch Action
  const handleMarkDispatched = async (e) => {
    e.preventDefault();
    try {
      await exchangeApi.markDispatched(deal._id, dispatchData);
      dispatch(fetchDealById(deal._id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record dispatch');
    }
  };

  // Delivery Action
  const handleConfirmDelivery = async (e) => {
    e.preventDefault();
    try {
      await exchangeApi.confirmDelivery(deal._id, deliveryData);
      dispatch(fetchDealById(deal._id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record delivery');
    }
  };

  // Quality Action
  const handleConfirmQuality = async (hasDiscrepancy) => {
    try {
      await exchangeApi.confirmQuality(deal._id, {
        status: hasDiscrepancy ? 'Rejected' : qualityData.status,
        hasDiscrepancy,
        issueType: qualityData.discrepancyType,
        description: qualityData.discrepancyNote,
        moistureLevelPercent: qualityData.moistureLevelPercent,
        purityVerifiedPercent: qualityData.purityVerifiedPercent,
        notes: qualityData.notes,
      });
      dispatch(fetchDealById(deal._id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to confirm quality');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFCF8] text-[#101010] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Back */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#101010]/70 hover:text-[#101010] mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Activity Dashboard
        </Link>

        {/* Master Deal Header */}
        <div className="card-ivory p-6 md:p-8 border border-[#E3DBCC] rounded-2xl mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2 font-mono text-xs">
                <span className="px-2.5 py-1 rounded bg-[#FDFCF8] border border-[#E3DBCC] font-bold text-[#101010]">
                  {deal.dealNumber}
                </span>
                <span className="px-2.5 py-1 rounded bg-[#E3DBCC] font-semibold text-[#101010]">
                  {deal.quantity?.toLocaleString()} {deal.unit || 'tons'}
                </span>
                <span className="px-2.5 py-1 rounded bg-[#101010] text-[#FDFCF8] font-semibold">
                  Status: {deal.status}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#101010]">
                {resource.title || 'Secondary Material Consignment'}
              </h1>

              {/* Commercial Parties Info */}
              <div className="mt-3 flex flex-wrap items-center gap-6 text-xs text-[#101010]/75">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#101010]/50 block">
                    Buyer
                  </span>
                  <span className="font-semibold text-[#101010]">
                    {deal.buyer?.name || user?.company?.name || 'Industrial Buyer'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-[#101010]/50 block">
                    Supplier
                  </span>
                  <span className="font-semibold text-[#101010] flex items-center gap-1">
                    {deal.confidentiality?.isConfidentialToBuyer && (
                      <Lock className="w-3.5 h-3.5 text-[#101010]" />
                    )}
                    {deal.seller?.name || 'Tata Metaliks & Foundry Division'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-[#101010]/50 block">
                    Active Agreed Price
                  </span>
                  <span className="font-bold text-[#101010] font-mono text-sm">
                    ₹{deal.finalAgreedPrice || deal.currentNegotiatedPrice || deal.originalPrice} / {deal.unit || 'ton'}
                  </span>
                </div>
              </div>
            </div>

            {/* Persona Action Status Alert */}
            <div className="bg-[#FDFCF8] p-4 rounded-xl border border-[#E3DBCC] text-xs max-w-sm">
              <span className="text-[10px] font-mono uppercase text-[#101010]/55 font-bold block mb-1">
                Current Persona Context: {activeRole.toUpperCase()}
              </span>
              <p className="text-[#101010]/80">
                {isBuyer && deal.status === 'Price Negotiation' && priceReq.status === 'PENDING' && (
                  'Price request submitted. Waiting for seller review.'
                )}
                {isBuyer && priceReq.status === 'BUYER_REVIEW' && (
                  <span className="font-semibold text-[#101010]">
                    Seller counter received: ₹{priceReq.counterPrice} / {deal.unit}! Action required.
                  </span>
                )}
                {isSeller && priceReq.status === 'PENDING' && (
                  <span className="font-semibold text-[#101010]">
                    Buyer requested ₹{priceReq.requestedMinPrice}{priceReq.requestedPriceType === 'range' ? `–₹${priceReq.requestedMaxPrice}` : ''} / {deal.unit}. Action required!
                  </span>
                )}
                {isPriceAgreed && (
                  <span className="font-semibold text-[#101010] flex items-center gap-1">
                    <Check className="w-4 h-4 text-[#101010]" /> Price locked. Ready for contract agreement & escrow.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline Stepper Component */}
        <div className="mb-8">
          <DealTimeline currentStatus={deal.status} />
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E3DBCC] mb-8 overflow-x-auto gap-2">
          {[
            { id: 'negotiation', label: '1. Structured Price Slider', icon: Sliders },
            { id: 'assessment', label: '2. Technical Assessment', icon: FileCheck },
            { id: 'agreement', label: '3. Agreement & Payment', icon: CreditCard },
            { id: 'fulfillment', label: '4. Transit & Quality Audit', icon: Truck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isTabActive
                    ? 'border-[#101010] text-[#101010] bg-[#F3F0E9]/50'
                    : 'border-transparent text-[#101010]/60 hover:text-[#101010] hover:bg-[#F3F0E9]/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: STRUCTURED PRICE NEGOTIATION (CORE INNOVATION) */}
        {activeTab === 'negotiation' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* If Price Already Agreed */}
            {isPriceAgreed && (
              <div className="p-6 rounded-2xl bg-[#E3DBCC] border border-[#101010]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#101010] text-[#FDFCF8] flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase text-[#101010]">
                      Price Agreed & Locked
                    </h3>
                    <p className="text-xs text-[#101010]/80">
                      Both commercial parties agreed on <strong>₹{deal.finalAgreedPrice || deal.currentNegotiatedPrice} / {deal.unit}</strong> for {deal.quantity} {deal.unit}s.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('agreement')}
                  className="px-6 py-2.5 rounded-lg bg-[#101010] text-[#FDFCF8] text-xs font-bold hover:bg-black transition-colors self-start sm:self-center"
                >
                  Proceed to Agreement & Payment →
                </button>
              </div>
            )}

            {/* SELLER VIEW: Inbound Price Request Action Card (Section 27 & 32) */}
            {isSeller && priceReq.status === 'PENDING' && (
              <div className="card-ivory p-6 md:p-8 border-2 border-[#101010] rounded-2xl shadow-md">
                <div className="flex items-center justify-between pb-4 border-b border-[#E3DBCC]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#101010] animate-ping" />
                    <h3 className="text-lg font-black uppercase text-[#101010]">
                      Incoming Buyer Price Request
                    </h3>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded bg-[#E3DBCC] text-[#101010] font-bold">
                    Action Required
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-[#E3DBCC] text-xs">
                  <div>
                    <span className="text-[#101010]/60 uppercase font-mono block">Buyer</span>
                    <span className="font-bold text-sm text-[#101010]">{deal.buyer?.name || 'Company B'}</span>
                  </div>
                  <div>
                    <span className="text-[#101010]/60 uppercase font-mono block">Your Listed Price</span>
                    <span className="font-bold text-sm text-[#101010] font-mono">₹{deal.originalPrice} / {deal.unit}</span>
                  </div>
                  <div>
                    <span className="text-[#101010]/60 uppercase font-mono block">Buyer Requested</span>
                    <span className="font-black text-base text-[#101010] font-mono">
                      ₹{priceReq.requestedMinPrice}{priceReq.requestedPriceType === 'range' ? `–₹${priceReq.requestedMaxPrice}` : ''} / {deal.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#101010]/60 uppercase font-mono block">Requested Value</span>
                    <span className="font-bold text-sm text-[#101010] font-mono">
                      ₹{priceReq.requestedTotalValueMin?.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Seller Action Buttons from Specification Section 27 */}
                <div className="pt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSellerAccept}
                    disabled={actionLoading}
                    className="px-6 py-3 rounded-lg bg-[#101010] text-[#FDFCF8] text-xs font-bold hover:bg-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" /> Accept Proposed Price
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCounterModal(true)}
                    disabled={actionLoading}
                    className="px-6 py-3 rounded-lg bg-[#E3DBCC] hover:bg-[#d6cbba] text-[#101010] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Sliders className="w-4 h-4" /> Set Counter Price
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionLoading}
                    className="px-5 py-3 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010] text-xs font-bold hover:bg-[#F3F0E9] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Reject Request
                  </button>
                </div>
              </div>
            )}

            {/* BUYER VIEW: Counter Price Review Card (Section 28) */}
            {isBuyer && priceReq.status === 'BUYER_REVIEW' && (
              <div className="card-ivory p-6 md:p-8 border-2 border-[#101010] rounded-2xl shadow-md">
                <div className="flex items-center justify-between pb-4 border-b border-[#E3DBCC]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#101010] animate-pulse" />
                    <h3 className="text-lg font-black uppercase text-[#101010]">
                      Counter Price Received From Seller
                    </h3>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded bg-[#E3DBCC] text-[#101010] font-bold">
                    Buyer Review Required
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-[#E3DBCC] text-xs">
                  <div>
                    <span className="text-[#101010]/60 uppercase font-mono block">Your Previous Request</span>
                    <span className="font-bold text-sm text-[#101010] font-mono">₹{priceReq.requestedMinPrice} / {deal.unit}</span>
                  </div>
                  <div>
                    <span className="text-[#101010]/60 uppercase font-mono block">Seller Counter Price</span>
                    <span className="font-black text-2xl text-[#101010] font-mono">
                      ₹{priceReq.counterPrice} <span className="text-xs font-normal text-[#101010]/60">/ {deal.unit}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[#101010]/60 uppercase font-mono block">Consignment Volume</span>
                    <span className="font-bold text-sm text-[#101010] font-mono">{deal.quantity} {deal.unit}s</span>
                  </div>
                  <div>
                    <span className="text-[#101010]/60 uppercase font-mono block">Revised Deal Total</span>
                    <span className="font-bold text-sm text-[#101010] font-mono">
                      ₹{(deal.quantity * (priceReq.counterPrice || deal.originalPrice)).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleBuyerAcceptCounter}
                    disabled={actionLoading}
                    className="px-6 py-3 rounded-lg bg-[#101010] text-[#FDFCF8] text-xs font-bold hover:bg-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" /> Accept Counter ₹{priceReq.counterPrice} / {deal.unit}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      // Allow re-submitting slider
                      const targetInput = document.getElementById('price-slider-anchor');
                      if (targetInput) targetInput.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-5 py-3 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010] text-xs font-bold hover:bg-[#E3DBCC] transition-colors cursor-pointer"
                  >
                    Adjust Price Request via Slider
                  </button>
                </div>
              </div>
            )}

            {/* Central Price Slider Component (Always Accessible unless final agreed) */}
            <div id="price-slider-anchor">
              <PriceSlider
                sellerPrice={deal.originalPrice || 60}
                minBound={resource.negotiationRange?.minPrice || 50}
                maxBound={resource.negotiationRange?.maxPrice || 70}
                quantity={deal.quantity || 300}
                unit={deal.unit || 'ton'}
                onRequestSubmit={handleBuyerSubmitSlider}
                disabled={isPriceAgreed || actionLoading}
              />
            </div>

            {/* Audit Trail: Negotiation History (Strictly structured, NO chat) */}
            {priceReq.history && priceReq.history.length > 0 && (
              <div className="card-ivory p-6 border border-[#E3DBCC] rounded-2xl">
                <span className="text-xs uppercase font-mono font-bold tracking-wider text-[#101010] block mb-4">
                  Commercial Negotiation Audit Log (Tamper-Proof)
                </span>
                <div className="divide-y divide-[#E3DBCC]/60 text-xs">
                  {priceReq.history.map((h, i) => (
                    <div key={i} className="py-3 flex items-start justify-between gap-4">
                      <div>
                        <div className="font-bold text-[#101010] flex items-center gap-2">
                          <span className="uppercase font-mono text-[10px] px-2 py-0.5 rounded bg-[#FDFCF8] border border-[#E3DBCC]">
                            {h.actorRole}
                          </span>
                          <span>{h.action.replace('_', ' ')}</span>
                          {h.price && <span className="font-mono text-[#101010]">₹{h.price} / {deal.unit}</span>}
                        </div>
                        <p className="text-[#101010]/70 mt-1 leading-relaxed">{h.note}</p>
                      </div>
                      <span className="font-mono text-[10px] text-[#101010]/40 shrink-0">
                        {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TECHNICAL ASSESSMENT WORKSPACE (Section 34) */}
        {activeTab === 'assessment' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="card-ivory p-6 md:p-8 border border-[#E3DBCC] rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E3DBCC] gap-2">
                <div>
                  <h3 className="text-lg font-black uppercase text-[#101010]">
                    Technical & Engineering Assessment
                  </h3>
                  <p className="text-xs text-[#101010]/60 mt-0.5">
                    Lead Engineer: {assessment.responsiblePerson || 'Buyer Technical Team'}
                  </p>
                </div>
                <div className="text-xs font-mono font-bold px-3 py-1 rounded bg-[#E3DBCC] text-[#101010]">
                  Assessment Status: {assessment.status || 'Action Required'}
                </div>
              </div>

              {/* Technical Requirements Checklist */}
              <div className="py-6 border-b border-[#E3DBCC]">
                <span className="text-xs font-mono uppercase tracking-wider text-[#101010]/60 font-bold block mb-3">
                  Technical Specifications Audit
                </span>
                <div className="space-y-2.5 text-xs">
                  {(assessment.technicalRequirements || []).map((req, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-[#FDFCF8] border border-[#E3DBCC] flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-[#101010]">{req.item}</div>
                        <div className="text-[#101010]/60 text-[11px] mt-0.5">
                          Spec: {req.specification}
                        </div>
                        {req.notes && (
                          <div className="text-[#101010]/80 text-[11px] mt-1 italic">
                            Lab verification: {req.notes}
                          </div>
                        )}
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase shrink-0 ${
                          req.status === 'Passed'
                            ? 'bg-[#101010] text-[#FDFCF8]'
                            : 'bg-[#E3DBCC] text-[#101010]'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Blockers & Actions Required */}
              <div className="py-6 border-b border-[#E3DBCC]">
                <span className="text-xs font-mono uppercase tracking-wider text-[#101010]/60 font-bold block mb-3">
                  Engineering Blockers & Evidence Required
                </span>
                <div className="space-y-3 text-xs">
                  {(assessment.blockers || []).map((blocker, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-xl border ${
                        blocker.isResolved
                          ? 'bg-[#FDFCF8] border-[#E3DBCC]'
                          : 'bg-[#FDFCF8] border-2 border-[#101010]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E3DBCC]/60">
                        <div className="flex items-center gap-2">
                          {blocker.isResolved ? (
                            <CheckCircle2 className="w-4 h-4 text-[#101010]" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-[#101010]" />
                          )}
                          <span className="font-bold text-[#101010] text-sm">{blocker.issue}</span>
                        </div>
                        <span className="font-mono text-[10px] text-[#101010]/55 uppercase">
                          Owner: <strong>{blocker.owner}</strong>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3 text-[11px] text-[#101010]/75">
                        <div>
                          <span className="text-[#101010]/50 block uppercase font-mono text-[10px]">
                            Evidence Required
                          </span>
                          {blocker.evidenceRequired}
                        </div>
                        <div>
                          <span className="text-[#101010]/50 block uppercase font-mono text-[10px]">
                            Completion Condition
                          </span>
                          {blocker.completionCondition}
                        </div>
                        <div>
                          <span className="text-[#101010]/50 block uppercase font-mono text-[10px]">
                            Next Action
                          </span>
                          <span className="font-semibold text-[#101010]">{blocker.nextAction}</span>
                        </div>
                      </div>

                      {!blocker.isResolved ? (
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleResolveBlocker(i)}
                            className="px-4 py-2 rounded-lg bg-[#101010] text-[#FDFCF8] text-xs font-bold hover:bg-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" /> Sign-off & Upload Evidence
                          </button>
                        </div>
                      ) : (
                        <div className="text-[11px] font-mono text-[#101010] font-semibold pt-1">
                          ✓ Blocker verified and resolved by authorized metallurgy lead.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample & Trial Status */}
              <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#FDFCF8] border border-[#E3DBCC]">
                  <span className="font-mono uppercase text-[10px] text-[#101010]/60 block mb-1">
                    Pilot Sample Status
                  </span>
                  <div className="font-bold text-sm text-[#101010]">
                    {assessment.sampleStatus || 'Sample Requested'}
                  </div>
                  <div className="font-mono text-[11px] text-[#101010]/60 mt-1">
                    Tracking: {assessment.sampleTrackingNumber || 'SMPL-IN-9821'}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#FDFCF8] border border-[#E3DBCC]">
                  <span className="font-mono uppercase text-[10px] text-[#101010]/60 block mb-1">
                    Production Plant Trial
                  </span>
                  <div className="font-bold text-sm text-[#101010]">
                    {assessment.trialStatus || 'Not Required for Initial 300 Ton Batch'}
                  </div>
                  <div className="font-mono text-[11px] text-[#101010]/60 mt-1">
                    Standard lab signoff sufficient
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AGREEMENT & ESCROW PAYMENT (Section 35-39) */}
        {activeTab === 'agreement' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="card-ivory p-6 md:p-8 border border-[#E3DBCC] rounded-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-[#E3DBCC]">
                <h3 className="text-lg font-black uppercase text-[#101010]">
                  Commercial Deal Agreement & Terms
                </h3>
                <span className="text-xs font-mono px-3 py-1 rounded bg-[#E3DBCC] text-[#101010] font-bold">
                  Legally Binding Institutional Protocol
                </span>
              </div>

              {/* Commercial Summary Table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-[#E3DBCC] text-xs">
                <div>
                  <span className="text-[#101010]/55 uppercase font-mono block">Buyer</span>
                  <span className="font-bold text-sm text-[#101010]">{deal.buyer?.name}</span>
                </div>
                <div>
                  <span className="text-[#101010]/55 uppercase font-mono block">Seller</span>
                  <span className="font-bold text-sm text-[#101010]">{deal.seller?.name}</span>
                </div>
                <div>
                  <span className="text-[#101010]/55 uppercase font-mono block">Consignment Quantity</span>
                  <span className="font-bold text-sm text-[#101010] font-mono">{deal.quantity} {deal.unit}</span>
                </div>
                <div>
                  <span className="text-[#101010]/55 uppercase font-mono block">Agreed Final Unit Price</span>
                  <span className="font-black text-base text-[#101010] font-mono">
                    ₹{deal.finalAgreedPrice || deal.currentNegotiatedPrice} / {deal.unit}
                  </span>
                </div>
              </div>

              {/* Logistics & Processing Responsibilities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-b border-[#E3DBCC] text-xs">
                <div className="p-4 rounded-xl bg-[#FDFCF8] border border-[#E3DBCC]">
                  <span className="font-mono uppercase text-[10px] text-[#101010]/60 block mb-1">
                    Processing Arrangements
                  </span>
                  <p className="text-[#101010]/80">
                    {deal.terms?.processingOwner || 'Buyer arrangements with certified local screening facility.'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#FDFCF8] border border-[#E3DBCC]">
                  <span className="font-mono uppercase text-[10px] text-[#101010]/60 block mb-1">
                    Logistics & Transport
                  </span>
                  <p className="text-[#101010]/80">
                    {deal.terms?.transportOwner || 'Platform designated bulk logistics carrier (BlueStar Heavy Freight).'}
                  </p>
                </div>
              </div>

              {/* Transparent Financial Settlement & Commission Breakdown (Section 36 & 37) */}
              <div className="py-6 border-b border-[#E3DBCC]">
                <h4 className="text-xs font-mono uppercase font-bold text-[#101010] mb-4">
                  Settlement & Platform Fee Breakdown
                </h4>
                <div className="p-5 rounded-xl bg-[#FDFCF8] border border-[#E3DBCC] space-y-3 text-xs">
                  <div className="flex justify-between pb-2 border-b border-[#E3DBCC]/60">
                    <span className="text-[#101010]/70">Material Value ({deal.quantity} tons × ₹{deal.finalAgreedPrice || deal.currentNegotiatedPrice}):</span>
                    <span className="font-mono font-bold text-[#101010]">
                      ₹{(deal.quantity * (deal.finalAgreedPrice || deal.currentNegotiatedPrice)).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between pb-2 border-b border-[#E3DBCC]/60">
                    <span className="text-[#101010]/70">Screening / Preparation Allocation:</span>
                    <span className="font-mono font-bold text-[#101010]">
                      ₹{(costs.processingCost || (resource.processingRequired ? deal.quantity * 15 : 0)).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between pb-2 border-b border-[#E3DBCC]/60">
                    <span className="text-[#101010]/70">Bulk Freight Logistics Allowance:</span>
                    <span className="font-mono font-bold text-[#101010]">
                      ₹{(costs.transportCost || deal.quantity * 10).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between pb-2 border-b border-[#E3DBCC]/60 bg-[#E3DBCC]/30 p-2 rounded">
                    <div className="flex items-center gap-1.5 font-bold text-[#101010]">
                      <ShieldCheck className="w-4 h-4 text-[#101010]" />
                      <span>Platform Commission Fee ({costs.commissionRate || 3.5}% tiered rate):</span>
                    </div>
                    <span className="font-mono font-bold text-[#101010]">
                      ₹{(costs.platformFee || 672).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between pt-2 text-base font-extrabold text-[#101010]">
                    <span>Total Payable into Escrow:</span>
                    <span className="font-mono">
                      ₹{(costs.totalPayable || (deal.quantity * (deal.finalAgreedPrice || deal.currentNegotiatedPrice) + (costs.platformFee || 672))).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Escrow Deposit Action (Section 38) */}
              <div className="pt-6">
                {deal.status === 'Payment Completed' || paymentSuccess ? (
                  <div className="p-5 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-[#065F46] font-bold text-sm">
                        <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                        <span>Escrow Payment Confirmed & Vault Cleared!</span>
                      </div>
                      <p className="text-xs text-[#065F46]/80 mt-1 font-mono">
                        Consignment is authorized for tare weighing and carrier haulage dispatch.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('fulfillment')}
                      className="px-6 py-3 rounded-full bg-[#101010] text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-all flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
                    >
                      <span>Proceed to Live Dispatch & Telematics →</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-[#101010]/60">
                      Deposit is held in third-party Escrow until buyer inspection and quality signoff.
                    </div>
                    <button
                      type="button"
                      onClick={handleExecutePayment}
                      disabled={paymentProcessing}
                      className="px-8 py-3.5 rounded-full bg-[#101010] text-[#FDFCF8] text-xs font-bold uppercase tracking-wider hover:bg-black transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                    >
                      <CreditCard className="w-4 h-4" />
                      {paymentProcessing ? 'Verifying with Gateway Clearinghouse...' : 'Proceed to Escrow Deposit'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TRANSIT & QUALITY AUDIT (Section 40-43) */}
        {activeTab === 'fulfillment' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Dispatch Phase */}
            <div className="card-ivory p-6 md:p-8 border border-[#E3DBCC] rounded-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-[#E3DBCC]">
                <h3 className="text-lg font-black uppercase text-[#101010]">
                  1. Dispatch Consignment (Supplier Responsibility)
                </h3>
                <span className="text-xs font-mono px-3 py-1 rounded bg-[#E3DBCC] text-[#101010] font-bold">
                  {exchange.dispatchDetails?.isDispatched ? 'Dispatched' : 'Awaiting Dispatch'}
                </span>
              </div>

              {exchange.dispatchDetails?.isDispatched ? (
                <div className="py-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[#101010]/55 uppercase font-mono block">Quantity Dispatched</span>
                    <span className="font-bold text-sm text-[#101010] font-mono">
                      {exchange.dispatchDetails.actualQuantity} {deal.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#101010]/55 uppercase font-mono block">Logistics Carrier</span>
                    <span className="font-bold text-sm text-[#101010]">{exchange.dispatchDetails.carrierName}</span>
                  </div>
                  <div>
                    <span className="text-[#101010]/55 uppercase font-mono block">Tracking Waybill</span>
                    <span className="font-bold text-sm text-[#101010] font-mono">{exchange.dispatchDetails.trackingNumber}</span>
                  </div>
                  <div>
                    <span className="text-[#101010]/55 uppercase font-mono block">Vehicle Plate</span>
                    <span className="font-bold text-sm text-[#101010] font-mono">{exchange.dispatchDetails.vehicleNumber}</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleMarkDispatched} className="py-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs uppercase font-mono text-[#101010]/60 mb-1">
                        Actual Dispatched Quantity
                      </label>
                      <input
                        type="number"
                        value={dispatchData.actualQuantity}
                        onChange={(e) => setDispatchData({ ...dispatchData, actualQuantity: e.target.value })}
                        className="w-full text-xs px-3 py-2 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-mono text-[#101010]/60 mb-1">
                        Freight Carrier Name
                      </label>
                      <input
                        type="text"
                        value={dispatchData.carrierName}
                        onChange={(e) => setDispatchData({ ...dispatchData, carrierName: e.target.value })}
                        className="w-full text-xs px-3 py-2 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-mono text-[#101010]/60 mb-1">
                        Vehicle Registration
                      </label>
                      <input
                        type="text"
                        value={dispatchData.vehicleNumber}
                        onChange={(e) => setDispatchData({ ...dispatchData, vehicleNumber: e.target.value })}
                        className="w-full text-xs px-3 py-2 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-[#101010] text-[#FDFCF8] text-xs font-bold hover:bg-black transition-colors"
                  >
                    Mark as Dispatched (Enter In Transit)
                  </button>
                </form>
              )}
            </div>

            {/* Delivery Receipt Phase */}
            <div className="card-ivory p-6 md:p-8 border border-[#E3DBCC] rounded-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-[#E3DBCC]">
                <h3 className="text-lg font-black uppercase text-[#101010]">
                  2. Delivery Receipt (Buyer Weighbridge Verification)
                </h3>
                <span className="text-xs font-mono px-3 py-1 rounded bg-[#E3DBCC] text-[#101010] font-bold">
                  {exchange.deliveryDetails?.isDelivered ? 'Delivered' : 'Awaiting Delivery'}
                </span>
              </div>

              {exchange.deliveryDetails?.isDelivered ? (
                <div className="py-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[#101010]/55 uppercase font-mono block">Quantity Received</span>
                    <span className="font-bold text-sm text-[#101010] font-mono">
                      {exchange.deliveryDetails.quantityReceived} {deal.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#101010]/55 uppercase font-mono block">Receiving Facility</span>
                    <span className="font-bold text-sm text-[#101010]">{exchange.deliveryDetails.receivingFacility}</span>
                  </div>
                  <div>
                    <span className="text-[#101010]/55 uppercase font-mono block">Condition Status</span>
                    <span className="font-bold text-sm text-[#101010]">{exchange.deliveryDetails.deliveryCondition}</span>
                  </div>
                  <div>
                    <span className="text-[#101010]/55 uppercase font-mono block">Receiver Signoff</span>
                    <span className="font-bold text-sm text-[#101010]">{exchange.deliveryDetails.receiverName}</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleConfirmDelivery} className="py-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs uppercase font-mono text-[#101010]/60 mb-1">
                        Weighbridge Tare Received
                      </label>
                      <input
                        type="number"
                        value={deliveryData.quantityReceived}
                        onChange={(e) => setDeliveryData({ ...deliveryData, quantityReceived: e.target.value })}
                        className="w-full text-xs px-3 py-2 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-mono text-[#101010]/60 mb-1">
                        Delivery Condition
                      </label>
                      <select
                        value={deliveryData.deliveryCondition}
                        onChange={(e) => setDeliveryData({ ...deliveryData, deliveryCondition: e.target.value })}
                        className="w-full text-xs px-3 py-2 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010]"
                      >
                        <option value="Optimal">Optimal (No Spillage/Moisture)</option>
                        <option value="Acceptable">Acceptable</option>
                        <option value="Partial Shortage">Partial Shortage</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-mono text-[#101010]/60 mb-1">
                        Receiver Officer Name
                      </label>
                      <input
                        type="text"
                        value={deliveryData.receiverName}
                        onChange={(e) => setDeliveryData({ ...deliveryData, receiverName: e.target.value })}
                        className="w-full text-xs px-3 py-2 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-[#101010] text-[#FDFCF8] text-xs font-bold hover:bg-black transition-colors"
                  >
                    Confirm Consignment Receipt
                  </button>
                </form>
              )}
            </div>

            {/* Quality Confirmation & Completion Phase (Section 42 & 43) */}
            <div className="card-ivory p-6 md:p-8 border border-[#E3DBCC] rounded-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-[#E3DBCC]">
                <h3 className="text-lg font-black uppercase text-[#101010]">
                  3. Quality Audit & Exchange Sign-Off
                </h3>
                <span className="text-xs font-mono px-3 py-1 rounded bg-[#E3DBCC] text-[#101010] font-bold">
                  {exchange.qualityConfirmation?.isConfirmed ? 'Quality Confirmed' : 'Inspection Pending'}
                </span>
              </div>

              {exchange.qualityConfirmation?.isConfirmed ? (
                <div className="py-6 space-y-4">
                  <div className="p-4 rounded-xl bg-[#E3DBCC] text-[#101010] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm uppercase font-mono">
                        ✓ Exchange Successfully Completed
                      </div>
                      <div className="text-xs text-[#101010]/75 mt-0.5">
                        Lab QC Batch: {exchange.qualityConfirmation.labAnalysisBatch} • Purity Verified: {exchange.qualityConfirmation.purityVerifiedPercent}%
                      </div>
                    </div>
                    <Link
                      to="/dashboard"
                      className="px-4 py-2 rounded-lg bg-[#101010] text-[#FDFCF8] text-xs font-bold hover:bg-black"
                    >
                      View Exchange Ledger →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="py-6 space-y-4 text-xs">
                  <p className="text-[#101010]/75">
                    Upon verifying physical and chemical properties in your facility laboratory, sign
                    off below to release escrow settlement or report an issue.
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleConfirmQuality(false)}
                      className="px-6 py-3 rounded-lg bg-[#101010] text-[#FDFCF8] font-bold text-xs hover:bg-black transition-colors flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" /> Confirm Quality & Complete Exchange
                    </button>

                    <button
                      type="button"
                      onClick={() => handleConfirmQuality(true)}
                      className="px-5 py-3 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010] font-bold text-xs hover:bg-[#E3DBCC]"
                    >
                      Report Quality Deviation / Shortage
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Counter Modal */}
        {showCounterModal && (
          <div className="fixed inset-0 z-50 bg-[#101010]/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="card-ivory p-6 border border-[#E3DBCC] rounded-2xl max-w-md w-full shadow-2xl">
              <h3 className="text-base font-bold uppercase text-[#101010] mb-2 font-mono">
                Set Your Counter Price
              </h3>
              <p className="text-xs text-[#101010]/70 mb-4">
                Buyer requested ₹{priceReq.requestedMinPrice} / {deal.unit}. Specify your counter proposal.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase font-mono text-[#101010]/60 mb-1">
                    Counter Unit Price (₹ / {deal.unit})
                  </label>
                  <input
                    type="number"
                    value={counterPriceInput}
                    onChange={(e) => setCounterPriceInput(e.target.value)}
                    className="w-full text-base font-bold font-mono px-3 py-2 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono text-[#101010]/60 mb-1">
                    Seller Rationale
                  </label>
                  <input
                    type="text"
                    value={counterNote}
                    onChange={(e) => setCounterNote(e.target.value)}
                    placeholder="e.g. Includes screening and magnetic separation cost."
                    className="w-full text-xs px-3 py-2 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCounterModal(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-[#101010] hover:bg-[#E3DBCC]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSellerCounterSubmit}
                    className="px-5 py-2 rounded-lg bg-[#101010] text-[#FDFCF8] text-xs font-bold hover:bg-black"
                  >
                    Submit Counter
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 bg-[#101010]/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="card-ivory p-6 border border-[#E3DBCC] rounded-2xl max-w-md w-full shadow-2xl">
              <h3 className="text-base font-bold uppercase text-[#101010] mb-2 font-mono">
                Decline Price Request
              </h3>
              <p className="text-xs text-[#101010]/70 mb-4">
                The listing base price of ₹{deal.originalPrice} / {deal.unit} will remain active.
              </p>

              <div className="space-y-4">
                <input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Reason (e.g. Margin thresholds cannot support requested price)."
                  className="w-full text-xs px-3 py-2 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010]"
                />

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-[#101010] hover:bg-[#E3DBCC]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSellerReject}
                    className="px-5 py-2 rounded-lg bg-[#101010] text-[#FDFCF8] text-xs font-bold hover:bg-black"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
