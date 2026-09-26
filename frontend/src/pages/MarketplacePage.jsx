import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, SlidersHorizontal, Lock, Check } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchResources, setFilters, resetFilters } from '../store/slices/resourceSlice';
import ResourceCard from '../components/ResourceCard';

export default function MarketplacePage() {
  const dispatch = useDispatch();
  const { items, loading, error, filters } = useSelector((state) => state.resources);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchResources(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(fetchResources(filters));
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFCF8] text-[#101010] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="max-w-3xl mb-8">
          <div className="text-xs font-mono uppercase tracking-widest text-[#101010]/55 font-bold mb-2">
            Public Material Registry
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#101010]">
            Industrial Marketplace
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#101010]/70 leading-relaxed font-normal">
            Find industrial residuals, by-products and secondary materials from verified sources.
          </p>
        </div>

        {/* Large Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mb-6">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-[#101010]/40" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search material, category or intended use..."
              className="w-full pl-12 pr-32 py-4 rounded-xl bg-[#F3F0E9] border border-[#E3DBCC] text-sm text-[#101010] placeholder-[#101010]/40 focus:outline-none focus:border-[#101010] focus:ring-1 focus:ring-[#101010]"
            />
            <div className="absolute right-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="px-3.5 py-2 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-xs font-semibold text-[#101010] flex items-center gap-1.5 hover:bg-[#E3DBCC] transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Filters</span>
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#101010] text-[#FDFCF8] text-xs font-bold hover:bg-black transition-colors cursor-pointer"
              >
                Search
              </button>
            </div>
          </div>
        </form>

        {/* Expandable Industrial Filters Panel */}
        {showFilters && (
          <div className="card-ivory p-6 border border-[#E3DBCC] rounded-xl mb-8 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DBCC]">
              <span className="text-xs uppercase font-mono font-bold text-[#101010]">
                Industrial Search Parameters
              </span>
              <button
                type="button"
                onClick={() => dispatch(resetFilters())}
                className="text-xs font-semibold text-[#101010]/70 hover:text-[#101010] underline"
              >
                Reset Filters
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-xs">
              {/* Category */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#101010]/60 mb-1">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010]"
                >
                  <option value="All">All Categories</option>
                  <option value="By-product">By-product</option>
                  <option value="Residual">Residual</option>
                  <option value="Waste">Waste</option>
                  <option value="Secondary Material">Secondary Material</option>
                </select>
              </div>

              {/* Region */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#101010]/60 mb-1">
                  Region
                </label>
                <select
                  value={filters.region}
                  onChange={(e) => handleFilterChange('region', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010]"
                >
                  <option value="All">All Regions</option>
                  <option value="Western India">Western India</option>
                  <option value="Northern India">Northern India</option>
                  <option value="Southern India">Southern India</option>
                  <option value="Eastern India">Eastern India</option>
                </select>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#101010]/60 mb-1">
                  Availability
                </label>
                <select
                  value={filters.availability}
                  onChange={(e) => handleFilterChange('availability', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010]"
                >
                  <option value="All">All Availability</option>
                  <option value="Available Recurring">Available Recurring</option>
                  <option value="Recurring">Recurring</option>
                  <option value="One-time Batch">One-time Batch</option>
                  <option value="Spot Available">Spot Available</option>
                </select>
              </div>

              {/* Processing Required */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#101010]/60 mb-1">
                  Processing
                </label>
                <select
                  value={filters.processingRequired}
                  onChange={(e) => handleFilterChange('processingRequired', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010]"
                >
                  <option value="All">Any Status</option>
                  <option value="false">Direct Usable</option>
                  <option value="true">Processing Required</option>
                </select>
              </div>

              {/* Confidentiality */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#101010]/60 mb-1">
                  Supplier Identity
                </label>
                <select
                  value={filters.identityVisibility}
                  onChange={(e) => handleFilterChange('identityVisibility', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010]"
                >
                  <option value="All">All Suppliers</option>
                  <option value="Confidential">🔐 Confidential Only</option>
                  <option value="Open">Open Producer Only</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Confidentiality Guarantee Notice */}
        <div className="mb-8 p-3 rounded-lg bg-[#F3F0E9] border border-[#E3DBCC] flex items-center justify-between text-xs text-[#101010]/75">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#101010]" />
            <span>
              <strong>Backend Anonymity Protocol:</strong> Confidential supplier names and exact GPS
              coordinates are protected by authorization access controls.
            </span>
          </div>
          <span className="hidden sm:inline font-mono text-[10px] uppercase font-bold text-[#101010]">
            Verified Trade Enforced
          </span>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-2 border-[#101010] border-t-transparent rounded-full animate-spin mb-3" />
            <div className="text-xs uppercase font-mono text-[#101010]/60">
              Querying Industrial Registry...
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center card-ivory border border-[#101010]">
            <p className="text-sm font-semibold text-[#101010]">{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center card-ivory border border-[#E3DBCC] rounded-xl">
            <p className="text-base font-bold text-[#101010]">No materials match your filter criteria.</p>
            <p className="text-xs text-[#101010]/60 mt-1">Try resetting search terms or parameters.</p>
            <button
              type="button"
              onClick={() => dispatch(resetFilters())}
              className="mt-4 px-4 py-2 rounded-lg bg-[#101010] text-[#FDFCF8] text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((resource) => (
              <ResourceCard key={resource._id} resource={resource} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
