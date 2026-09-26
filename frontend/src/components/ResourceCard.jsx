import React from 'react';
import { Link } from 'react-router-dom';
import {
  Lock,
  CheckCircle,
  AlertCircle,
  MapPin,
  Layers,
  ArrowUpRight,
  TrendingDown,
} from 'lucide-react';

export default function ResourceCard({ resource }) {
  if (!resource) return null;

  const isConfidential = resource.identityVisibility === 'Confidential';
  const supplierName = resource.seller?.name || (isConfidential ? '🔐 Verified Confidential Supplier' : 'Verified Producer');

  return (
    <div className="card-ivory p-5 border border-[#E3DBCC] hover:border-[#101010]/40 transition-all duration-200 flex flex-col justify-between group shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Top Meta Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010]/80">
              {resource.category || 'By-product'}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#E3DBCC]/60 text-[#101010]">
              {resource.stateOfMatter || 'Solid'}
            </span>
          </div>

          {resource.sellingMethod === 'Price Negotiation' && (
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E3DBCC] text-[#101010] font-semibold flex items-center gap-1">
              Negotiable
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold tracking-tight text-[#101010] group-hover:text-black transition-colors uppercase">
          {resource.title}
        </h3>

        {/* Quantity and Availability */}
        <div className="mt-2 text-sm font-semibold text-[#101010] flex items-baseline gap-1.5">
          <span>{resource.quantity?.toLocaleString()} {resource.unit || 'tons / month'}</span>
          <span className="text-xs font-normal text-[#101010]/55">• {resource.availability || 'Available Recurring'}</span>
        </div>

        {/* Location & Supplier Status */}
        <div className="mt-3.5 space-y-1.5 text-xs text-[#101010]/75">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#101010]/60 shrink-0" />
            <span>{resource.location?.region || 'Western India'} ({resource.location?.approxDistanceKm || 85} km)</span>
          </div>

          <div className="flex items-center gap-1.5">
            {isConfidential ? (
              <span className="inline-flex items-center gap-1 font-medium text-[#101010] bg-[#FDFCF8] px-2 py-0.5 rounded border border-[#E3DBCC]">
                <Lock className="w-3 h-3 text-[#101010]" /> Verified Confidential Supplier
              </span>
            ) : (
              <span className="font-medium text-[#101010]">
                {supplierName}
              </span>
            )}
          </div>
        </div>

        {/* Feature Badges: Evidence & Processing */}
        <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] font-medium">
          <div className="bg-[#FDFCF8] p-2 rounded border border-[#E3DBCC] flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-[#101010]" />
            <span>Evidence Available</span>
          </div>
          <div className="bg-[#FDFCF8] p-2 rounded border border-[#E3DBCC] flex items-center gap-1.5">
            {resource.processingRequired ? (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-[#101010]/70" />
                <span>Processing Req.</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-[#101010]" />
                <span>Direct Usable</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Pricing and Action Footer */}
      <div className="pt-5 mt-5 border-t border-[#E3DBCC] flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-mono text-[#101010]/55 block">
            Base Offering
          </span>
          <div className="text-lg font-bold text-[#101010] font-mono">
            ₹{resource.basePrice || '—'}{' '}
            <span className="text-xs font-normal text-[#101010]/60">/ {resource.unit?.includes('ton') ? 'ton' : 'unit'}</span>
          </div>
        </div>

        <Link
          to={`/materials/${resource._id}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#101010] text-[#FDFCF8] text-xs font-semibold hover:bg-black transition-all cursor-pointer shadow-sm"
        >
          View Material <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
