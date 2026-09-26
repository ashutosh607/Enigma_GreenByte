import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sliders,
  FileCheck,
  CreditCard,
  Truck,
  ArrowRight,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  Leaf,
  ChevronRight,
  Building,
  Lock,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { dealApi, resourceApi, discoveryApi, priceRequestApi } from '../services/api';
import ListResourceModal from '../components/ListResourceModal';

export default function DashboardPage() {
  const { user, activeRole } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'requests' | 'deals' | 'resources' | 'requirements'
  const [deals, setDeals] = useState([]);
  const [resources, setResources] = useState([]);
  const [priceRequests, setPriceRequests] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listModalOpen, setListModalOpen] = useState(false);

  const companyName = user?.company?.name || (activeRole === 'seller' ? 'Tata Metaliks' : 'UltraTech Infrastructure');

  useEffect(() => {
    Promise.all([
      dealApi.getDeals(),
      resourceApi.getResources(),
      priceRequestApi.getPriceRequests(),
      discoveryApi.getOpportunities(),
    ])
      .then(([dealRes, resRes, prRes, oppRes]) => {
        setDeals(dealRes.data.deals || []);
        setResources(resRes.data.resources || []);
        setPriceRequests(prRes.data.priceRequests || []);
        setOpportunities(oppRes.data.opportunities || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [activeRole]);

  // Compute "What should I do next?" actions
  const pendingPriceRequests = priceRequests.filter(
    (pr) => (activeRole === 'seller' && pr.status === 'PENDING') || (activeRole === 'buyer' && pr.status === 'BUYER_REVIEW')
  );

  const pendingAssessments = deals.filter((d) => d.status === 'Assessment');
  const pendingPayments = deals.filter((d) => d.status === 'Agreement' || d.status === 'Payment Pending');
  const pendingDeliveries = deals.filter((d) => d.status === 'In Transit');

  const totalActionsCount =
    pendingPriceRequests.length + pendingAssessments.length + pendingPayments.length + pendingDeliveries.length;

  return (
    <div className="w-full min-h-screen bg-[#FDFCF8] text-[#101010] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section 44: Dashboard Header */}
        <div className="card-ivory p-6 md:p-8 border border-[#E3DBCC] rounded-2xl mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-[#101010]/55 font-bold mb-1">
                Active Operational Workspace • {activeRole.toUpperCase()} VIEW
              </div>
              <h1 className="text-2xl sm:text-4xl font-black uppercase text-[#101010] tracking-tight">
                Good day, {companyName}.
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-mono font-semibold text-[#101010]/80">
                <span className="px-2.5 py-0.5 rounded bg-[#E3DBCC] text-[#101010]">
                  {totalActionsCount} Actions Needed
                </span>
                <span>•</span>
                <span>{opportunities.length} Matched Opportunities</span>
                <span>•</span>
                <span>{deals.length} Active Deals</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setListModalOpen(true)}
                className="px-4 py-2.5 rounded-lg bg-[#101010] text-[#FDFCF8] text-xs font-bold hover:bg-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>List New Resource</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 45: "WHAT SHOULD I DO NEXT?" HERO ACTIONS */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#101010]/55 font-bold">
              Priority Next Actions ({totalActionsCount})
            </h2>
            <span className="text-[11px] font-mono text-[#101010]/50">
              Immediate decision required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Price Request Action */}
            {pendingPriceRequests.length > 0 ? (
              pendingPriceRequests.slice(0, 1).map((pr) => (
                <div
                  key={pr._id}
                  className="card-ivory p-5 border-2 border-[#101010] rounded-xl flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <span className="text-[10px] font-mono uppercase bg-[#101010] text-[#FDFCF8] px-2 py-0.5 rounded font-bold">
                      Price Request Action
                    </span>
                    <h3 className="text-base font-bold uppercase text-[#101010] mt-2 mb-1">
                      {pr.resourceId?.title || 'Steel Slag'}
                    </h3>
                    <p className="text-xs text-[#101010]/75">
                      {activeRole === 'seller'
                        ? `Buyer requested ₹${pr.requestedMinPrice}${pr.requestedPriceType === 'range' ? `–₹${pr.requestedMaxPrice}` : ''} / ${pr.unit}. (Your price: ₹${pr.originalPrice})`
                        : `Seller countered ₹${pr.counterPrice} / ${pr.unit}. Please review.`}
                    </p>
                  </div>
                  <Link
                    to={`/deals/${pr.dealId?._id || pr.dealId}`}
                    className="mt-4 px-4 py-2 rounded-lg bg-[#101010] text-[#FDFCF8] text-xs font-bold text-center hover:bg-black flex items-center justify-center gap-1"
                  >
                    Review Negotiation Slider <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))
            ) : (
              <div className="card-ivory p-5 border border-[#E3DBCC] rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#101010]/55">
                    Price Negotiation
                  </span>
                  <div className="text-sm font-bold text-[#101010] mt-1">All price requests settled</div>
                  <p className="text-xs text-[#101010]/60 mt-1">No active price negotiations awaiting your action.</p>
                </div>
                <Link to="/marketplace" className="mt-4 text-xs font-bold text-[#101010] hover:underline">
                  Browse Marketplace →
                </Link>
              </div>
            )}

            {/* Assessment Action */}
            <div className="card-ivory p-5 border border-[#E3DBCC] rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#101010]/55">
                  Engineering Assessment
                </span>
                <div className="text-sm font-bold text-[#101010] mt-1">Contamination Assay Required</div>
                <p className="text-xs text-[#101010]/70 mt-1">
                  1 pending blocker awaiting lab verification signoff before price negotiation locks.
                </p>
              </div>
              <Link
                to={deals[0] ? `/deals/${deals[0]._id}` : '/dashboard'}
                className="mt-4 px-4 py-2 rounded-lg bg-[#E3DBCC] text-[#101010] text-xs font-bold text-center hover:bg-[#d4c8b6] flex items-center justify-center gap-1"
              >
                Resolve Blocker <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Payment & Fulfillment Action */}
            <div className="card-ivory p-5 border border-[#E3DBCC] rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#101010]/55">
                  Fulfillment & Escrow
                </span>
                <div className="text-sm font-bold text-[#101010] mt-1">
                  {pendingDeliveries.length > 0 ? 'Consignment In Transit' : 'Escrow Deposit'}
                </div>
                <p className="text-xs text-[#101010]/70 mt-1">
                  {pendingDeliveries.length > 0
                    ? `${pendingDeliveries[0]?.quantity} tons in transit via bulk hauler. Confirm receiving tare.`
                    : '1 contract ready for escrow deposit settlement.'}
                </p>
              </div>
              <Link
                to={deals[1] ? `/deals/${deals[1]._id}` : deals[0] ? `/deals/${deals[0]._id}` : '/dashboard'}
                className="mt-4 px-4 py-2 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010] text-xs font-bold text-center hover:bg-[#E3DBCC] flex items-center justify-center gap-1"
              >
                View Fulfillment <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Section 46: Dashboard Tabs */}
        <div className="flex border-b border-[#E3DBCC] mb-6 overflow-x-auto gap-2">
          {[
            { id: 'overview', label: 'All Active Deals', count: deals.length },
            { id: 'requests', label: 'Price Requests Ledger', count: priceRequests.length },
            { id: 'resources', label: 'My Listed Resources', count: resources.length },
            { id: 'opportunities', label: 'AI Opportunities', count: opportunities.length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-[#101010] text-[#101010] bg-[#F3F0E9]/60'
                  : 'border-transparent text-[#101010]/55 hover:text-[#101010]'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E3DBCC] text-[#101010]">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* TAB CONTENT: DEALS OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {deals.length === 0 ? (
              <div className="p-12 text-center card-ivory border border-[#E3DBCC] rounded-xl">
                <p className="text-sm font-bold text-[#101010]">No deals created yet.</p>
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
                  className="card-ivory p-5 border border-[#E3DBCC] hover:border-[#101010]/40 rounded-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1 text-xs font-mono">
                      <span className="font-bold text-[#101010]">{deal.dealNumber}</span>
                      <span className="text-[#101010]/40">•</span>
                      <span className="text-[#101010]/70">
                        {deal.quantity} {deal.unit}
                      </span>
                      <span className="text-[#101010]/40">•</span>
                      <span className="px-2 py-0.5 rounded bg-[#E3DBCC] text-[#101010] font-semibold text-[10px]">
                        {deal.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold uppercase text-[#101010]">
                      {deal.resource?.title || 'Industrial Material'}
                    </h3>

                    <div className="text-xs text-[#101010]/70 mt-1">
                      Buyer: <strong>{deal.buyer?.name}</strong> • Seller: <strong>{deal.seller?.name}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-start md:self-center">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-mono text-[#101010]/50 block">
                        Negotiated Price
                      </span>
                      <span className="text-base font-bold font-mono text-[#101010]">
                        ₹{deal.finalAgreedPrice || deal.currentNegotiatedPrice} / {deal.unit}
                      </span>
                    </div>

                    <Link
                      to={`/deals/${deal._id}`}
                      className="px-4 py-2.5 rounded-lg bg-[#101010] text-[#FDFCF8] text-xs font-bold hover:bg-black transition-colors flex items-center gap-1.5"
                    >
                      <span>View Deal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB CONTENT: PRICE REQUESTS DEDICATED VIEW (Section 51) */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#F3F0E9] border border-[#E3DBCC] text-xs text-[#101010]/70">
              Structured price negotiation requests logged directly onto the commercial ledger. No chat clutter.
            </div>

            {priceRequests.map((pr) => (
              <div
                key={pr._id}
                className="card-ivory p-5 border border-[#E3DBCC] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1 text-xs font-mono">
                    <span className="font-bold text-[#101010]">{pr.resourceId?.title || 'Resource'}</span>
                    <span className="text-[#101010]/40">•</span>
                    <span className="px-2 py-0.5 rounded bg-[#E3DBCC] text-[#101010] font-semibold text-[10px]">
                      {pr.status}
                    </span>
                  </div>

                  <div className="text-xs text-[#101010]/80">
                    Seller Price: <strong>₹{pr.originalPrice}</strong> • Buyer Requested:{' '}
                    <strong>
                      ₹{pr.requestedMinPrice}{pr.requestedPriceType === 'range' ? `–₹${pr.requestedMaxPrice}` : ''}
                    </strong>
                    {pr.counterPrice && (
                      <> • Counter Offer: <strong className="text-[#101010]">₹{pr.counterPrice}</strong></>
                    )}
                  </div>
                </div>

                <Link
                  to={`/deals/${pr.dealId?._id || pr.dealId}`}
                  className="px-4 py-2 rounded-lg bg-[#101010] text-[#FDFCF8] text-xs font-bold hover:bg-black self-start md:self-center"
                >
                  Open Negotiation Slider →
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* TAB CONTENT: MY RESOURCES */}
        {activeTab === 'resources' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-mono uppercase text-[#101010]/60">
                Secondary Streams Listed By Your Plant
              </span>
              <button
                type="button"
                onClick={() => setListModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-[#101010] text-[#FDFCF8] text-xs font-bold"
              >
                + List Another Stream
              </button>
            </div>

            {resources.map((res) => (
              <div
                key={res._id}
                className="card-ivory p-5 border border-[#E3DBCC] rounded-xl flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-[#101010] text-sm uppercase">{res.title}</h4>
                  <div className="text-xs text-[#101010]/60 mt-0.5">
                    {res.quantity} {res.unit} • Base: ₹{res.basePrice} / ton • {res.identityVisibility}
                  </div>
                </div>
                <Link
                  to={`/materials/${res._id}`}
                  className="text-xs font-bold text-[#101010] hover:underline"
                >
                  View Passport →
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* TAB CONTENT: OPPORTUNITIES */}
        {activeTab === 'opportunities' && (
          <div className="space-y-4">
            {opportunities.map((opp) => (
              <div
                key={opp._id}
                className="card-ivory p-5 border border-[#E3DBCC] rounded-xl flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-[#101010] text-sm uppercase">{opp.title}</h4>
                  <div className="text-xs text-[#101010]/60 mt-0.5">
                    Match Score: {opp.compatibility?.overallScore}% • Potential Savings: ₹{opp.costComparison?.potentialSavingsPerTon}/ton
                  </div>
                </div>
                <Link
                  to={`/opportunities/${opp._id}`}
                  className="px-4 py-2 rounded-lg bg-[#101010] text-[#FDFCF8] text-xs font-bold"
                >
                  View Symbiosis Opportunity →
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* List Resource Modal */}
        <ListResourceModal
          isOpen={listModalOpen}
          onClose={() => setListModalOpen(false)}
          onCreated={() => {
            window.location.reload();
          }}
        />
      </div>
    </div>
  );
}
