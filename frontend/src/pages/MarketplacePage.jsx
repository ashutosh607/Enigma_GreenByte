import React, { useState, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  Tag,
  Building2,
  Layers,
  Settings,
  FlaskConical,
  Scissors,
  MoreHorizontal,
  RefreshCw,
  X,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchResources, setFilters, resetFilters } from '../store/slices/resourceSlice';
import ResourceCard from '../components/ResourceCard';

const CATEGORY_TABS = [
  { id: 'All', label: 'All', icon: null },
  { id: 'Construction Materials', label: 'Construction Materials', icon: Building2 },
  { id: 'Metals & Alloys', label: 'Metals & Alloys', icon: Layers },
  { id: 'Machinery & Equipment', label: 'Machinery & Equipment', icon: Settings },
  { id: 'Chemicals', label: 'Chemicals', icon: FlaskConical },
  { id: 'Textiles', label: 'Textiles', icon: Scissors },
  { id: 'Others', label: 'Others', icon: MoreHorizontal },
];

export default function MarketplacePage() {
  const dispatch = useDispatch();
  const { items, loading, filters } = useSelector((state) => state.resources);

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchResources(filters));
  }, [dispatch, filters]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(setFilters({ search: searchInput }));
  };

  const handleCategoryClick = (catId) => {
    setActiveCategory(catId);
    dispatch(setFilters({ category: catId }));
  };

  // Client-side smart matching in case backend categories differ slightly
  const filteredItems = items.filter((item) => {
    if (activeCategory === 'All') return true;

    const title = (item.title || '').toLowerCase();
    const cat = (item.category || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();

    if (activeCategory === 'Construction Materials') {
      return (
        cat.includes('construction') ||
        cat.includes('gypsum') ||
        title.includes('gypsum') ||
        title.includes('sand') ||
        title.includes('slag') ||
        title.includes('fly ash') ||
        title.includes('ggbs') ||
        desc.includes('aggregate') ||
        desc.includes('concrete')
      );
    }
    if (activeCategory === 'Metals & Alloys') {
      const tags = Array.isArray(item.tags) ? item.tags.join(' ').toLowerCase() : '';
      return (
        cat.includes('metal') ||
        title.includes('steel') ||
        title.includes('slag') ||
        title.includes('metal') ||
        title.includes('alloy') ||
        title.includes('iron') ||
        desc.includes('metallurg') ||
        desc.includes('metal') ||
        tags.includes('metallurg') ||
        tags.includes('slag') ||
        tags.includes('metal')
      );
    }
    if (activeCategory === 'Chemicals') {
      return (
        cat.includes('chemical') ||
        title.includes('caustic') ||
        title.includes('phospho') ||
        title.includes('acid') ||
        desc.includes('chemical')
      );
    }
    if (activeCategory === 'Machinery & Equipment') {
      return (
        cat.includes('machinery') ||
        cat.includes('equipment') ||
        title.includes('kiln') ||
        title.includes('crusher') ||
        desc.includes('equipment')
      );
    }
    if (activeCategory === 'Textiles') {
      return cat.includes('textile') || title.includes('textile') || desc.includes('fiber');
    }
    return true;
  });

  return (
    <div className="w-full min-h-screen bg-[#FDFCF8] text-[#101010] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Marketplace Header: Title on Left, Pill Search + Filters on Right */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
          {/* Left Column: Badge, Title, Subtitle */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3F0E9] border border-[#E3DBCC] text-[11px] font-mono font-bold uppercase tracking-wider text-[#101010] mb-3 shadow-xs">
              <Tag className="w-3.5 h-3.5 text-[#065F46]" />
              <span>Marketplace</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black uppercase tracking-tight text-[#101010] leading-none">
              Industrial Materials & Equipment
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#101010]/65 font-normal">
              Verified suppliers. Quality materials. Faster deals.
            </p>
          </div>

          {/* Right Column: Rounded-Full Search Bar & Filters Button */}
          <div className="flex items-center gap-3 w-full lg:max-w-xl">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#101010]/40" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search for materials, category or location..."
                className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-[#E3DBCC] text-xs sm:text-sm text-[#101010] placeholder-[#101010]/45 shadow-xs focus:outline-none focus:border-[#101010] transition-colors"
              />
            </form>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-5 py-3 rounded-full bg-white hover:bg-[#F3F0E9] border border-[#E3DBCC] text-xs font-bold uppercase tracking-wider text-[#101010] flex items-center gap-2 shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills Row (as in reference image) */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeCategory === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleCategoryClick(tab.id)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shadow-xs ${
                  isSelected
                    ? 'bg-[#101010] text-[#FDFCF8] font-bold shadow-sm'
                    : 'bg-white hover:bg-[#F3F0E9] border border-[#E3DBCC] text-[#101010]/80 hover:text-[#101010]'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5 text-[#101010]/70" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Expandable Parameter Filters Drawer */}
        {showFilters && (
          <div className="card-ivory p-6 border border-[#E3DBCC] rounded-2xl space-y-4 animate-in fade-in duration-150 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DBCC]">
              <span className="text-xs uppercase font-mono font-bold text-[#101010]">
                Advanced Search Filters
              </span>
              <button
                type="button"
                onClick={() => {
                  dispatch(resetFilters());
                  setActiveCategory('All');
                  setSearchInput('');
                }}
                className="text-xs font-semibold text-[#101010]/70 hover:text-[#101010] underline cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#101010]/60 mb-1 font-bold">
                  Region
                </label>
                <select
                  value={filters.region}
                  onChange={(e) => dispatch(setFilters({ region: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E3DBCC] text-[#101010] text-xs"
                >
                  <option value="All">All Regions</option>
                  <option value="Western India">Western India</option>
                  <option value="Eastern India">Eastern India</option>
                  <option value="Northern India">Northern India</option>
                  <option value="Southern India">Southern India</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#101010]/60 mb-1 font-bold">
                  State of Matter
                </label>
                <select
                  value={filters.stateOfMatter || 'All'}
                  onChange={(e) => dispatch(setFilters({ stateOfMatter: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E3DBCC] text-[#101010] text-xs"
                >
                  <option value="All">All States</option>
                  <option value="Solid">Solid</option>
                  <option value="Slurry">Slurry</option>
                  <option value="Liquid">Liquid</option>
                  <option value="Gas">Gas</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#101010]/60 mb-1 font-bold">
                  Processing Required
                </label>
                <select
                  value={filters.processingRequired}
                  onChange={(e) => dispatch(setFilters({ processingRequired: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E3DBCC] text-[#101010] text-xs"
                >
                  <option value="All">Any</option>
                  <option value="false">Direct Usable Only</option>
                  <option value="true">Processing Required</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#101010]/60 mb-1 font-bold">
                  Price Limit (Max ₹/ton)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 100"
                  value={filters.maxPrice || ''}
                  onChange={(e) => dispatch(setFilters({ maxPrice: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E3DBCC] text-[#101010] text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Material Cards Grid (3 Columns Layout matching user reference image) */}
        {loading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-[#101010]/40 mx-auto mb-3" />
            <p className="text-xs font-mono uppercase text-[#101010]/60">
              Querying verified industrial streams...
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="card-ivory p-12 text-center border border-[#E3DBCC] rounded-2xl max-w-md mx-auto space-y-3">
            <p className="text-sm font-bold text-[#101010]">No materials match this filter.</p>
            <p className="text-xs text-[#101010]/60">
              Try selecting "All" or resetting your search parameters.
            </p>
            <button
              type="button"
              onClick={() => {
                dispatch(resetFilters());
                setActiveCategory('All');
                setSearchInput('');
              }}
              className="px-4 py-2 rounded-xl bg-[#101010] text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredItems.map((resource) => (
              <ResourceCard key={resource._id} resource={resource} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
