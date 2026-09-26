import React, { useState } from 'react';
import { Sliders, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

export default function PriceSlider({
  sellerPrice = 60,
  minBound = 45,
  maxBound = 75,
  quantity = 300,
  unit = 'ton',
  onRequestSubmit,
  disabled = false,
  isSellerCounter = false,
}) {
  const [mode, setMode] = useState('single'); // 'single' | 'range'
  const [requestedPrice, setRequestedPrice] = useState(
    isSellerCounter ? Math.round((sellerPrice + minBound) / 2) : Math.max(minBound, sellerPrice - 4)
  );
  const [rangeMin, setRangeMin] = useState(Math.max(minBound, sellerPrice - 5));
  const [rangeMax, setRangeMax] = useState(Math.min(maxBound, sellerPrice - 3));
  const [note, setNote] = useState('');

  const originalTotal = quantity * sellerPrice;
  const requestedTotalSingle = quantity * requestedPrice;
  const requestedTotalMin = quantity * rangeMin;
  const requestedTotalMax = quantity * rangeMax;

  const diffSingle = requestedPrice - sellerPrice;
  const diffPercent = ((diffSingle / sellerPrice) * 100).toFixed(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (disabled) return;

    if (mode === 'single') {
      onRequestSubmit({
        requestedMinPrice: requestedPrice,
        requestedMaxPrice: requestedPrice,
        priceType: 'single',
        note,
      });
    } else {
      onRequestSubmit({
        requestedMinPrice: rangeMin,
        requestedMaxPrice: rangeMax,
        priceType: 'range',
        note,
      });
    }
  };

  return (
    <div className="card-ivory p-6 shadow-sm border border-[#E3DBCC]">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#E3DBCC] gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#101010]" />
            <h3 className="text-lg font-semibold tracking-tight text-[#101010]">
              {isSellerCounter ? 'Set Your Counter Price' : 'Structured Price Negotiation'}
            </h3>
          </div>
          <p className="text-sm text-[#101010]/60 mt-0.5">
            {isSellerCounter
              ? 'Propose an alternative acceptable price back to the buyer without chat clutter.'
              : 'Request a customized price or acceptable range. Sent directly to seller dashboard.'}
          </p>
        </div>

        {!isSellerCounter && (
          <div className="inline-flex p-1 bg-[#FDFCF8] border border-[#E3DBCC] rounded-lg self-start">
            <button
              type="button"
              onClick={() => setMode('single')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                mode === 'single'
                  ? 'bg-[#101010] text-[#FDFCF8]'
                  : 'text-[#101010]/70 hover:text-[#101010]'
              }`}
            >
              Exact Price
            </button>
            <button
              type="button"
              onClick={() => setMode('range')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                mode === 'range'
                  ? 'bg-[#101010] text-[#FDFCF8]'
                  : 'text-[#101010]/70 hover:text-[#101010]'
              }`}
            >
              Price Range
            </button>
          </div>
        )}
      </div>

      {/* Commercial Anchor Reference Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-5 my-2 border-b border-[#E3DBCC]/60 bg-[#FDFCF8]/60 p-4 rounded-lg">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#101010]/55 font-mono">
            Seller Listed Price
          </span>
          <div className="text-xl font-bold text-[#101010] mt-0.5">
            ₹{sellerPrice} <span className="text-xs font-normal text-[#101010]/60">/ {unit}</span>
          </div>
        </div>

        <div>
          <span className="text-xs uppercase tracking-wider text-[#101010]/55 font-mono">
            Consignment Quantity
          </span>
          <div className="text-xl font-bold text-[#101010] mt-0.5">
            {quantity.toLocaleString()} <span className="text-xs font-normal text-[#101010]/60">{unit}s</span>
          </div>
        </div>

        <div>
          <span className="text-xs uppercase tracking-wider text-[#101010]/55 font-mono">
            Listed Deal Value
          </span>
          <div className="text-xl font-bold text-[#101010] mt-0.5">
            ₹{originalTotal.toLocaleString()}
          </div>
        </div>

        <div>
          <span className="text-xs uppercase tracking-wider text-[#101010]/55 font-mono">
            Suggested Range
          </span>
          <div className="text-sm font-semibold text-[#101010] mt-1 font-mono">
            ₹{minBound} — ₹{maxBound}
          </div>
        </div>
      </div>

      {/* Interactive Slider Area */}
      <div className="py-6 space-y-6">
        {mode === 'single' ? (
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <label className="text-sm font-medium text-[#101010]">
                {isSellerCounter ? 'Counter Price Proposal' : 'Your Proposed Unit Price'}
              </label>
              <div className="text-2xl font-extrabold text-[#101010] font-mono tracking-tight">
                ₹{requestedPrice}{' '}
                <span className="text-sm font-normal text-[#101010]/55">/ {unit}</span>
              </div>
            </div>

            <div className="relative pt-2 pb-1">
              <input
                type="range"
                min={minBound}
                max={maxBound}
                step={1}
                value={requestedPrice}
                onChange={(e) => setRequestedPrice(Number(e.target.value))}
                disabled={disabled}
                className="price-slider-input w-full"
              />
              {/* Marker ticks */}
              <div className="flex justify-between text-[11px] text-[#101010]/50 font-mono mt-2 px-1">
                <span>₹{minBound} (Min)</span>
                <span className="text-[#101010] font-semibold">● Seller ₹{sellerPrice}</span>
                <span>₹{maxBound} (Max)</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-[#101010]/70">Minimum of Range</span>
                <span className="font-bold font-mono text-[#101010]">₹{rangeMin} / {unit}</span>
              </div>
              <input
                type="range"
                min={minBound}
                max={rangeMax}
                step={1}
                value={rangeMin}
                onChange={(e) => setRangeMin(Number(e.target.value))}
                disabled={disabled}
                className="price-slider-input w-full"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-[#101010]/70">Maximum of Range</span>
                <span className="font-bold font-mono text-[#101010]">₹{rangeMax} / {unit}</span>
              </div>
              <input
                type="range"
                min={rangeMin}
                max={maxBound}
                step={1}
                value={rangeMax}
                onChange={(e) => setRangeMax(Number(e.target.value))}
                disabled={disabled}
                className="price-slider-input w-full"
              />
            </div>
          </div>
        )}

        {/* Dynamic Variance Summary */}
        <div className="p-4 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] space-y-2">
          {mode === 'single' ? (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm gap-2">
              <div>
                <span className="text-[#101010]/60">Difference vs Seller Base:</span>{' '}
                <span
                  className={`font-semibold font-mono ${
                    diffSingle < 0 ? 'text-[#101010]' : 'text-[#101010]'
                  }`}
                >
                  {diffSingle >= 0 ? `+₹${diffSingle}` : `-₹${Math.abs(diffSingle)}`} / {unit} ({diffPercent}%)
                </span>
              </div>
              <div>
                <span className="text-[#101010]/60">Requested Deal Value:</span>{' '}
                <span className="font-bold text-base text-[#101010] font-mono">
                  ₹{requestedTotalSingle.toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm gap-2">
              <div>
                <span className="text-[#101010]/60">Requested Band:</span>{' '}
                <span className="font-semibold font-mono text-[#101010]">
                  ₹{rangeMin} — ₹{rangeMax} / {unit}
                </span>
              </div>
              <div>
                <span className="text-[#101010]/60">Estimated Deal Value Band:</span>{' '}
                <span className="font-bold text-base text-[#101010] font-mono">
                  ₹{requestedTotalMin.toLocaleString()} — ₹{requestedTotalMax.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Commercial notes / logistics condition */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-[#101010]/60 font-mono mb-1">
            Commercial Rationale / Sieve Specification (Optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g., Based on recurring 12-month commitment and buyer-side sieve screening."
            disabled={disabled}
            className="w-full text-sm px-3.5 py-2.5 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010] placeholder-[#101010]/40 focus:outline-none focus:border-[#101010]"
          />
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={disabled}
            className="w-full py-3.5 px-6 rounded-lg bg-[#101010] text-[#FDFCF8] font-semibold text-sm tracking-wide hover:bg-black transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSellerCounter ? (
              <>Send Counter Price of ₹{requestedPrice} / {unit} <ArrowRight className="w-4 h-4" /></>
            ) : mode === 'single' ? (
              <>Request ₹{requestedPrice} / {unit} (₹{requestedTotalSingle.toLocaleString()}) <ArrowRight className="w-4 h-4" /></>
            ) : (
              <>Request Price Band ₹{rangeMin}–₹{rangeMax} / {unit} <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
          <p className="text-[11px] text-center text-[#101010]/50 mt-2 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#101010]/60" />
            No chat required. Price requests are logged directly onto seller commercial ledger.
          </p>
        </div>
      </div>
    </div>
  );
}
