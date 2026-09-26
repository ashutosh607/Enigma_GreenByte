import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  Building2,
  ArrowRight,
  Heart,
  FileText,
} from 'lucide-react';

// Curated high-resolution industrial photography matching actual material streams
const getMaterialImage = (resource) => {
  if (resource.images && resource.images.length > 0 && resource.images[0]) {
    return resource.images[0];
  }
  const title = (resource.title || '').toLowerCase();
  const category = (resource.category || '').toLowerCase();

  if (title.includes('phospho') || title.includes('gypsum') || title.includes('filter cake') || title.includes('cake')) {
    // White/beige stacked industrial bags & filter cake in plant (as in reference image 1)
    return 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80';
  }
  if (title.includes('blast furnace') || title.includes('ggbs') || title.includes('granulated slag')) {
    // Dark granulated blast furnace slag mound with conveyor machinery (as in reference image 2)
    return 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80';
  }
  if (title.includes('silica') || title.includes('sand') || title.includes('foundry')) {
    // Fine silica sand and mineral aggregate mounds under industrial shed (as in reference image 3)
    return 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80';
  }
  if (title.includes('fly ash') || title.includes('pulverized') || title.includes('ash') || title.includes('pozzolan')) {
    // Dark pulverized fine industrial mineral powder in factory vats (as in reference image 4)
    return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
  }
  if (title.includes('steel slag') || title.includes('slag')) {
    // Heavy metallic and mineral steel slag rocks in processing yard (as in reference image 5)
    return 'https://images.unsplash.com/photo-1505705694340-019e1e335916?auto=format&fit=crop&w=800&q=80';
  }
  if (title.includes('metal') || title.includes('alloy') || title.includes('steel') || title.includes('scrap') || title.includes('iron') || category.includes('metal')) {
    // Heavy industrial steel coils & metallurgy billets
    return 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80';
  }
  if (title.includes('machin') || title.includes('equip') || title.includes('kiln') || title.includes('crusher') || title.includes('mill') || category.includes('machin')) {
    // Industrial machinery & grinding mill
    return 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80';
  }
  if (title.includes('textil') || title.includes('fiber') || title.includes('fabric') || category.includes('textil')) {
    // Industrial recycled textile and yarn bales
    return 'https://images.unsplash.com/photo-1594824813580-c0813f3801f0?auto=format&fit=crop&w=800&q=80';
  }
  if (category.includes('chemical') || title.includes('chemical') || title.includes('caustic') || title.includes('acid')) {
    return 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80';
  }
  if (category.includes('biomass') || title.includes('biomass')) {
    return 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80';
  }
  // Default high-grade industrial mineral aggregate
  return 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80';
};

export default function ResourceCard({ resource }) {
  const [isLiked, setIsLiked] = useState(false);

  if (!resource) return null;

  const isConfidential = resource.identityVisibility === 'Confidential';
  const supplierName = resource.seller?.name || 'Tata Metaliks & Foundry Division';
  const imageUrl = getMaterialImage(resource);

  // Normalize category label
  const categoryLabel = resource.category?.toUpperCase() || 'BY-PRODUCT';
  const stateLabel = resource.stateOfMatter?.toUpperCase() || 'SOLID';

  return (
    <div className="card-ivory overflow-hidden border border-[#E3DBCC] hover:border-[#101010]/40 rounded-2xl bg-white transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-xl flex flex-col justify-between group">
      <div>
        {/* Top High-Resolution Industrial Image with Floating Tags */}
        <div className="relative w-full h-52 sm:h-56 overflow-hidden bg-[#F3F0E9]">
          <img
            src={imageUrl}
            alt={resource.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Top-Left Floating Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
            <span className="bg-[#FDFCF8]/95 text-[#101010] text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-md shadow-xs border border-white/60 backdrop-blur-sm">
              {categoryLabel}
            </span>
            <span className="bg-[#101010]/85 text-white text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-md shadow-xs backdrop-blur-sm">
              {stateLabel}
            </span>
          </div>

          {/* Top-Right Favorite Heart Icon */}
          <div className="absolute top-3 right-3 z-10">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-md active:scale-90 cursor-pointer"
              aria-label="Save material"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isLiked ? 'fill-red-500 text-red-500' : 'text-white'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          {/* Material Title */}
          <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-[#101010] leading-snug group-hover:text-black line-clamp-1">
            {resource.title}
          </h3>

          {/* Volume and Recurring Schedule */}
          <div className="text-xs sm:text-sm font-bold text-[#101010] flex items-center gap-1.5 font-mono">
            <span>
              {resource.quantity?.toLocaleString()} {resource.unit || 'tons / month'}
            </span>
            <span className="text-[#101010]/30">•</span>
            <span className="font-sans font-normal text-xs text-[#101010]/60">
              {resource.availability || 'Available Recurring'}
            </span>
          </div>

          {/* Location with Pin */}
          <div className="flex items-center gap-1.5 text-xs text-[#101010]/70 font-mono">
            <MapPin className="w-3.5 h-3.5 text-[#101010]/50 shrink-0" />
            <span>
              {resource.location?.region || 'Western India'} ({resource.location?.approxDistanceKm || 85} km)
            </span>
          </div>

          {/* Verified Supplier Badge with Improved Premium Emerald Green */}
          <div>
            {isConfidential ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] text-[11px] font-bold tracking-tight">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                <span>Verified Confidential Supplier</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-[#101010] font-semibold">
                <Building2 className="w-3.5 h-3.5 text-[#101010]/60 shrink-0" />
                <span className="truncate">{supplierName}</span>
              </div>
            )}
          </div>

          {/* Two Specification Badges in Row */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-medium">
            <div className="bg-[#FDFCF8] py-1.5 px-2.5 rounded-lg border border-[#E3DBCC] flex items-center gap-1.5 text-[11px] text-[#101010]/80">
              <ShieldCheck className="w-3.5 h-3.5 text-[#101010]/60 shrink-0" />
              <span className="truncate">Evidence Available</span>
            </div>

            <div className="bg-[#FDFCF8] py-1.5 px-2.5 rounded-lg border border-[#E3DBCC] flex items-center gap-1.5 text-[11px] text-[#101010]/80">
              {resource.processingRequired ? (
                <>
                  <FileText className="w-3.5 h-3.5 text-[#101010]/60 shrink-0" />
                  <span className="truncate">Processing Req.</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                  <span className="truncate">Direct Usable</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing and Action Footer */}
      <div className="p-5 pt-0">
        <div className="pt-4 border-t border-[#E3DBCC] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono text-[#101010]/50 tracking-wider block font-bold">
              BASE OFFERING
            </span>
            <div className="text-xl font-black text-[#101010] font-mono leading-none mt-1">
              ₹{resource.basePrice || 45}
              <span className="text-xs font-normal text-[#101010]/60 ml-1">
                / {resource.unit?.includes('ton') ? 'ton' : 'unit'}
              </span>
            </div>
          </div>

          <Link
            to={`/materials/${resource._id}`}
            className="px-5 py-2.5 rounded-xl bg-[#101010] hover:bg-black text-[#FDFCF8] text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
