import React, { useState, useEffect } from 'react';
import { Shield, DollarSign, Sliders, CheckCircle, Clock, AlertCircle, Save } from 'lucide-react';
import { adminApi, paymentApi } from '../services/api';

export default function AdminPortalPage() {
  const [overview, setOverview] = useState(null);
  const [negotiations, setNegotiations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Commission Config Form
  const [commissionForm, setCommissionForm] = useState({
    baseRatePercent: 3.5,
    minFee: 2500,
    maxCapFee: 75000,
  });
  const [configSaved, setConfigSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      adminApi.getAdminOverview(),
      adminApi.getNegotiationsAudit(),
      paymentApi.getPayments(),
    ])
      .then(([ovRes, negRes, payRes]) => {
        setOverview(ovRes.data.stats);
        if (ovRes.data.commissionConfig) {
          setCommissionForm({
            baseRatePercent: ovRes.data.commissionConfig.baseRatePercent || 3.5,
            minFee: ovRes.data.commissionConfig.minFee || 2500,
            maxCapFee: ovRes.data.commissionConfig.maxCapFee || 75000,
          });
        }
        setNegotiations(negRes.data.auditTrail || []);
        setPayments(payRes.data.payments || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleUpdateConfig = async (e) => {
    e.preventDefault();
    try {
      await adminApi.updateCommissionConfig(commissionForm);
      setConfigSaved(true);
      setTimeout(() => setConfigSaved(false), 3000);
    } catch (err) {
      alert('Failed to update commission rules');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFCF8] text-[#101010] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-8">
          <div className="text-xs font-mono uppercase tracking-widest text-[#101010]/55 font-bold mb-2 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#101010]" /> Institutional Platform Facilitation
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#101010]">
            Admin & Facilitator Portal
          </h1>
          <p className="mt-3 text-sm text-[#101010]/70 leading-relaxed font-normal">
            Platform governance, commission configuration rules, audit trail of structured price
            negotiations, and escrow clearinghouse verification.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <div className="card-ivory p-5 border border-[#E3DBCC] rounded-xl">
            <span className="text-[10px] uppercase font-mono text-[#101010]/50 block">Total Volume</span>
            <div className="text-2xl font-black font-mono text-[#101010] mt-1">
              ₹{(overview?.totalVolume ? overview.totalVolume / 100000 : 8.4).toFixed(1)} Lakhs
            </div>
            <span className="text-[10px] text-[#101010]/60 mt-1 block">Gross cleared exchange volume</span>
          </div>

          <div className="card-ivory p-5 border border-[#E3DBCC] rounded-xl">
            <span className="text-[10px] uppercase font-mono text-[#101010]/50 block">Platform Commission</span>
            <div className="text-2xl font-black font-mono text-[#101010] mt-1">
              ₹{(overview?.totalCommissionEarned || 29575).toLocaleString()}
            </div>
            <span className="text-[10px] text-[#101010]/60 mt-1 block">Institutional fee revenue</span>
          </div>

          <div className="card-ivory p-5 border border-[#E3DBCC] rounded-xl">
            <span className="text-[10px] uppercase font-mono text-[#101010]/50 block">Active Exchanges</span>
            <div className="text-2xl font-black font-mono text-[#101010] mt-1">
              {overview?.activeExchanges || 1} In Transit
            </div>
            <span className="text-[10px] text-[#101010]/60 mt-1 block">Live hauling & weighbridge</span>
          </div>

          <div className="card-ivory p-5 border border-[#E3DBCC] rounded-xl">
            <span className="text-[10px] uppercase font-mono text-[#101010]/50 block">Quality Disputes</span>
            <div className="text-2xl font-black font-mono text-[#101010] mt-1">
              {overview?.totalDisputes || 0} Open
            </div>
            <span className="text-[10px] text-[#101010]/60 mt-1 block">Facilitator mediation ledger</span>
          </div>
        </div>

        {/* Section 56: Admin Commission Configuration Panel */}
        <div className="card-ivory p-6 md:p-8 border border-[#E3DBCC] rounded-2xl mb-10">
          <div className="flex items-center justify-between pb-4 border-b border-[#E3DBCC] mb-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#101010] font-mono">
                Platform Commission Rules Engine (Dynamic Backend Config)
              </h2>
              <p className="text-xs text-[#101010]/60 mt-0.5">
                Configurable tiered parameters applied dynamically to all commercial settlements.
              </p>
            </div>
            {configSaved && (
              <span className="text-xs font-mono font-bold text-[#101010] bg-[#E3DBCC] px-2.5 py-1 rounded">
                ✓ Rules Updated in Database
              </span>
            )}
          </div>

          <form onSubmit={handleUpdateConfig} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs uppercase font-mono text-[#101010]/60 mb-1">
                Base Commission Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={commissionForm.baseRatePercent}
                onChange={(e) => setCommissionForm({ ...commissionForm, baseRatePercent: e.target.value })}
                className="w-full text-sm font-mono font-bold px-3 py-2 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010]"
              />
              <span className="text-[10px] text-[#101010]/50 mt-1 block">Default rate across standard tiers</span>
            </div>

            <div>
              <label className="block text-xs uppercase font-mono text-[#101010]/60 mb-1">
                Minimum Platform Fee Floor (₹)
              </label>
              <input
                type="number"
                value={commissionForm.minFee}
                onChange={(e) => setCommissionForm({ ...commissionForm, minFee: e.target.value })}
                className="w-full text-sm font-mono font-bold px-3 py-2 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010]"
              />
              <span className="text-[10px] text-[#101010]/50 mt-1 block">Protects baseline clearing costs</span>
            </div>

            <div>
              <label className="block text-xs uppercase font-mono text-[#101010]/60 mb-1">
                Maximum Platform Fee Cap Ceiling (₹)
              </label>
              <input
                type="number"
                value={commissionForm.maxCapFee}
                onChange={(e) => setCommissionForm({ ...commissionForm, maxCapFee: e.target.value })}
                className="w-full text-sm font-mono font-bold px-3 py-2 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010]"
              />
              <span className="text-[10px] text-[#101010]/50 mt-1 block">Maximum institutional ceiling</span>
            </div>

            <div className="sm:col-span-3 flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-[#101010] text-[#FDFCF8] text-xs font-bold hover:bg-black transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" /> Save Commission Rules
              </button>
            </div>
          </form>
        </div>

        {/* Section 57: Admin Structured Price Negotiations Audit Trail */}
        <div className="card-ivory p-6 md:p-8 border border-[#E3DBCC] rounded-2xl mb-10">
          <div className="flex items-center justify-between pb-4 border-b border-[#E3DBCC] mb-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#101010] font-mono">
                Structured Price Negotiations Audit Trail
              </h2>
              <p className="text-xs text-[#101010]/60 mt-0.5">
                Every slider bid, counter, and acceptance logged with timestamps for transparency.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#101010]">
              Audited Ledger
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E3DBCC] text-[10px] uppercase font-mono text-[#101010]/55">
                  <th className="py-2.5 pr-4">Deal</th>
                  <th className="py-2.5 pr-4">Material</th>
                  <th className="py-2.5 pr-4">Buyer</th>
                  <th className="py-2.5 pr-4">Seller</th>
                  <th className="py-2.5 pr-4">Base Price</th>
                  <th className="py-2.5 pr-4">Requested</th>
                  <th className="py-2.5 pr-4">Seller Counter</th>
                  <th className="py-2.5 pr-4">Final Agreed</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3DBCC]/60">
                {negotiations.map((item) => (
                  <tr key={item._id} className="hover:bg-[#FDFCF8]/60 transition-colors">
                    <td className="py-3 pr-4 font-mono font-bold">{item.dealNumber}</td>
                    <td className="py-3 pr-4 font-semibold text-[#101010]">{item.material}</td>
                    <td className="py-3 pr-4 text-[#101010]/80">{item.buyer}</td>
                    <td className="py-3 pr-4 text-[#101010]/80">{item.seller}</td>
                    <td className="py-3 pr-4 font-mono">₹{item.originalPrice}</td>
                    <td className="py-3 pr-4 font-mono font-bold">
                      ₹{item.requestedMinPrice}{item.requestedMaxPrice !== item.requestedMinPrice ? `–₹${item.requestedMaxPrice}` : ''}
                    </td>
                    <td className="py-3 pr-4 font-mono text-[#101010]">
                      {item.counterPrice ? `₹${item.counterPrice}` : '—'}
                    </td>
                    <td className="py-3 pr-4 font-mono font-black text-[#101010]">
                      {item.finalAgreedPrice ? `₹${item.finalAgreedPrice}` : '—'}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E3DBCC] text-[#101010]">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payments Settlement Panel */}
        <div className="card-ivory p-6 md:p-8 border border-[#E3DBCC] rounded-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-[#E3DBCC] mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#101010] font-mono">
              Escrow Payments & Commission Settlements
            </h2>
            <span className="text-xs font-mono font-bold text-[#101010]">
              {payments.length} Transactions
            </span>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E3DBCC] text-[10px] uppercase font-mono text-[#101010]/55">
                  <th className="py-2.5 pr-4">Txn ID</th>
                  <th className="py-2.5 pr-4">Buyer</th>
                  <th className="py-2.5 pr-4">Seller</th>
                  <th className="py-2.5 pr-4">Gross Escrow</th>
                  <th className="py-2.5 pr-4">Platform Fee</th>
                  <th className="py-2.5 pr-4">Supplier Net</th>
                  <th className="py-2.5">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3DBCC]/60">
                {payments.map((p) => (
                  <tr key={p._id}>
                    <td className="py-3 pr-4 font-mono">{p.gatewayTransactionId}</td>
                    <td className="py-3 pr-4 font-semibold">{p.buyerId?.name || 'Buyer'}</td>
                    <td className="py-3 pr-4 font-semibold">{p.sellerId?.name || 'Seller'}</td>
                    <td className="py-3 pr-4 font-mono font-bold">₹{p.transactionAmount?.toLocaleString()}</td>
                    <td className="py-3 pr-4 font-mono text-[#101010]">₹{p.platformFee?.toLocaleString()} ({p.commissionRate}%)</td>
                    <td className="py-3 pr-4 font-mono font-semibold">₹{p.supplierAmount?.toLocaleString()}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#101010] text-[#FDFCF8]">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
