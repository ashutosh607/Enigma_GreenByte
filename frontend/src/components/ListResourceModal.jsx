import React, { useState } from 'react';
import { X, Plus, Trash2, ShieldCheck, Lock, UploadCloud, Check } from 'lucide-react';
import { resourceApi } from '../services/api';

export default function ListResourceModal({ isOpen, onClose, onCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'By-product',
    stateOfMatter: 'Solid',
    description: '',
    quantity: 500,
    unit: 'tons / month',
    availability: 'Available Recurring',
    city: 'Nagpur',
    state: 'Maharashtra',
    region: 'Western India',
    basePrice: 60,
    minPrice: 54,
    maxPrice: 65,
    sellingMethod: 'Price Negotiation',
    processingRequired: false,
    processingDetails: 'Mechanical screening to 0-10mm sieve',
    identityVisibility: 'Confidential',
    evidenceStatus: 'Verified Lab Report',
    properties: [
      { name: 'Purity / Reactive Phase', value: '88%', unit: 'wt%' },
      { name: 'Bulk Density', value: '1,550', unit: 'kg/m³' },
      { name: 'Moisture Content', value: '2.5%', unit: '%' },
    ],
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleAddProp = () => {
    setFormData({
      ...formData,
      properties: [...formData.properties, { name: '', value: '', unit: '' }],
    });
  };

  const handleRemoveProp = (index) => {
    setFormData({
      ...formData,
      properties: formData.properties.filter((_, i) => i !== index),
    });
  };

  const handlePropChange = (index, field, val) => {
    const updated = [...formData.properties];
    updated[index][field] = val;
    setFormData({ ...formData, properties: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        stateOfMatter: formData.stateOfMatter,
        description: formData.description,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        availability: formData.availability,
        location: {
          city: formData.city,
          state: formData.state,
          region: formData.region,
          approxDistanceKm: 75,
        },
        basePrice: Number(formData.basePrice),
        negotiationRange: {
          minPrice: Number(formData.minPrice),
          preferredPrice: Number(formData.basePrice),
          maxPrice: Number(formData.maxPrice),
        },
        sellingMethod: formData.sellingMethod,
        processingRequired: formData.processingRequired,
        processingDetails: formData.processingDetails,
        properties: formData.properties.filter((p) => p.name.trim() !== ''),
        materialPassport: {
          sourceStatus: 'Verified Continuous Processing Stream',
          preparation: formData.processingRequired ? formData.processingDetails : 'Raw stream as produced',
          evidenceStatus: formData.evidenceStatus,
          testDate: new Date(),
          summary: 'Verified production batch compliant with industrial reuse standards.',
        },
        identityVisibility: formData.identityVisibility,
      };

      const res = await resourceApi.createResource(payload);
      if (onCreated) onCreated(res.data.resource);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to list resource');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#101010]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl card-ivory border border-[#E3DBCC] shadow-2xl rounded-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-[#E3DBCC] flex items-center justify-between bg-[#FDFCF8]">
          <div>
            <h3 className="text-lg font-bold text-[#101010]">
              List Industrial Residual / By-Product
            </h3>
            <p className="text-xs text-[#101010]/60">
              Publish secondary materials to verified commercial buyers across the network.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#E3DBCC]/50 text-[#101010] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="m-5 p-3 rounded-lg bg-[#101010] text-[#FDFCF8] text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Material Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase font-mono text-[#101010]/60 mb-1">
                Material Name *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Ladle Furnace Slag"
                className="w-full text-sm px-3.5 py-2.5 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010] focus:outline-none focus:border-[#101010]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-mono text-[#101010]/60 mb-1">
                Resource Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-sm px-3 py-2.5 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010] focus:outline-none focus:border-[#101010]"
              >
                <option value="By-product">By-product</option>
                <option value="Residual">Residual</option>
                <option value="Waste">Waste</option>
                <option value="Secondary Material">Secondary Material</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs uppercase font-mono text-[#101010]/60 mb-1">
              Material Specification & Description *
            </label>
            <textarea
              required
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe physical consistency, origin furnace/process, and storage condition."
              className="w-full text-sm px-3.5 py-2 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010] focus:outline-none focus:border-[#101010]"
            />
          </div>

          {/* Quantity, Unit & Availability */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs uppercase font-mono text-[#101010]/60 mb-1">
                Quantity
              </label>
              <input
                type="number"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full text-sm px-3 py-2 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010]"
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-mono text-[#101010]/60 mb-1">
                Unit
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full text-sm px-3 py-2 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010]"
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-mono text-[#101010]/60 mb-1">
                Availability
              </label>
              <select
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                className="w-full text-sm px-2 py-2 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010]"
              >
                <option value="Available Recurring">Available Recurring</option>
                <option value="Recurring">Recurring</option>
                <option value="One-time Batch">One-time Batch</option>
                <option value="Spot Available">Spot Available</option>
              </select>
            </div>
          </div>

          {/* Structured Negotiation Pricing & Bounds */}
          <div className="p-4 rounded-xl bg-[#FDFCF8] border border-[#E3DBCC]">
            <span className="text-xs uppercase font-mono font-bold tracking-wider text-[#101010] block mb-2">
              Structured Price & Negotiation Bounds
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-[#101010]/60 mb-1">
                  Min Acceptable Price (₹)
                </label>
                <input
                  type="number"
                  value={formData.minPrice}
                  onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
                  className="w-full text-sm px-3 py-1.5 rounded-lg bg-[#F3F0E9] border border-[#E3DBCC] text-[#101010] font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#101010] mb-1">
                  Target Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  className="w-full text-sm px-3 py-1.5 rounded-lg bg-[#F3F0E9] border border-[#101010] text-[#101010] font-bold font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#101010]/60 mb-1">
                  Max Reference (₹)
                </label>
                <input
                  type="number"
                  value={formData.maxPrice}
                  onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                  className="w-full text-sm px-3 py-1.5 rounded-lg bg-[#F3F0E9] border border-[#E3DBCC] text-[#101010] font-mono"
                />
              </div>
            </div>
          </div>

          {/* Supplier Confidentiality Protection Toggle */}
          <div className="p-4 rounded-xl bg-[#FDFCF8] border border-[#E3DBCC] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-[#101010]" />
              <div>
                <div className="text-xs font-bold text-[#101010] uppercase tracking-wide">
                  Confidential Supplier Identity
                </div>
                <div className="text-xs text-[#101010]/60">
                  {formData.identityVisibility === 'Confidential'
                    ? 'Protected: Shows as "🔐 Verified Confidential Supplier". Exact facility coordinates hidden.'
                    : 'Open: Your verified company name will appear publicly on the marketplace.'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  identityVisibility:
                    formData.identityVisibility === 'Confidential' ? 'Open' : 'Confidential',
                })
              }
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                formData.identityVisibility === 'Confidential'
                  ? 'bg-[#101010] text-[#FDFCF8]'
                  : 'bg-[#E3DBCC] text-[#101010]'
              }`}
            >
              {formData.identityVisibility === 'Confidential' ? 'Confidential' : 'Open'}
            </button>
          </div>

          {/* Dynamic Technical Properties */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs uppercase font-mono text-[#101010]/60">
                Technical Assay Properties (Flexible Matrix)
              </label>
              <button
                type="button"
                onClick={handleAddProp}
                className="text-xs font-semibold text-[#101010] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Property
              </button>
            </div>
            <div className="space-y-2">
              {formData.properties.map((prop, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Property name (e.g. CaO)"
                    value={prop.name}
                    onChange={(e) => handlePropChange(idx, 'name', e.target.value)}
                    className="flex-1 text-xs px-3 py-2 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010]"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. 42.5%)"
                    value={prop.value}
                    onChange={(e) => handlePropChange(idx, 'value', e.target.value)}
                    className="w-28 text-xs px-3 py-2 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010]"
                  />
                  <input
                    type="text"
                    placeholder="Unit"
                    value={prop.unit}
                    onChange={(e) => handlePropChange(idx, 'unit', e.target.value)}
                    className="w-20 text-xs px-3 py-2 rounded-lg bg-[#FDFCF8] border border-[#E3DBCC] text-[#101010]"
                  />
                  {formData.properties.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveProp(idx)}
                      className="p-1.5 text-[#101010]/50 hover:text-[#101010] cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-lg bg-[#101010] text-[#FDFCF8] font-bold text-sm hover:bg-black transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {submitting ? 'Publishing to Network...' : 'Publish Resource to Marketplace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
