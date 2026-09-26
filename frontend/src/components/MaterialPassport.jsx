import React from 'react';
import { FileCheck, ShieldCheck, Calendar, Layers, CheckCircle2, Lock } from 'lucide-react';

export default function MaterialPassport({ resource }) {
  if (!resource) return null;

  const passport = resource.materialPassport || {};
  const isConfidential = resource.identityVisibility === 'Confidential';

  return (
    <div className="card-ivory p-6 border border-[#E3DBCC] relative overflow-hidden">
      {/* Top Header Badge */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E3DBCC]">
        <div className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-[#101010]" />
          <h3 className="text-base font-bold tracking-tight text-[#101010] uppercase">
            Official Material Passport
          </h3>
        </div>
        <span className="text-[11px] font-mono px-2.5 py-1 bg-[#FDFCF8] border border-[#E3DBCC] rounded text-[#101010] font-semibold">
          ISO-14021 Certified Protocol
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-[#E3DBCC]/70">
        <div>
          <span className="text-xs uppercase font-mono text-[#101010]/55">Material</span>
          <div className="font-bold text-[#101010] text-sm mt-0.5">{resource.title}</div>
        </div>

        <div>
          <span className="text-xs uppercase font-mono text-[#101010]/55">Source Stream</span>
          <div className="font-semibold text-[#101010] text-sm mt-0.5 flex items-center gap-1">
            {isConfidential && <Lock className="w-3.5 h-3.5 text-[#101010]" />}
            {passport.sourceStatus || 'Verified Industrial Stream'}
          </div>
        </div>

        <div>
          <span className="text-xs uppercase font-mono text-[#101010]/55">Quantity</span>
          <div className="font-bold text-[#101010] text-sm mt-0.5">
            {resource.quantity?.toLocaleString()} {resource.unit || 'tons / month'}
          </div>
        </div>

        <div>
          <span className="text-xs uppercase font-mono text-[#101010]/55">Evidence Status</span>
          <div className="text-sm font-bold text-[#101010] mt-0.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#101010]" />
            {passport.evidenceStatus || 'Verified Lab Report'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-[#E3DBCC]/70 text-sm">
        <div>
          <span className="text-xs uppercase font-mono text-[#101010]/55 block mb-1">
            Preparation & Processing
          </span>
          <p className="text-[#101010]/80">
            {passport.preparation || 'Air-cooled, stabilized & magnetic separated'}
          </p>
        </div>

        <div>
          <span className="text-xs uppercase font-mono text-[#101010]/55 block mb-1">
            Test Verification Date
          </span>
          <p className="text-[#101010]/80 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#101010]/60" />
            {passport.testDate
              ? new Date(passport.testDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Recent Batch Sign-off'}
          </p>
        </div>
      </div>

      {/* Flexible Technical Assay Matrix */}
      {resource.properties && resource.properties.length > 0 && (
        <div className="py-4">
          <span className="text-xs uppercase font-mono text-[#101010]/55 block mb-2.5">
            Assayed Physical & Chemical Properties
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {resource.properties.map((prop, idx) => (
              <div
                key={idx}
                className="bg-[#FDFCF8] p-2.5 rounded border border-[#E3DBCC]/80 flex justify-between items-center text-xs"
              >
                <span className="text-[#101010]/70 font-medium">{prop.name}</span>
                <span className="font-mono font-bold text-[#101010]">
                  {prop.value} {prop.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Passport Summary footer */}
      {passport.summary && (
        <div className="mt-2 p-3 bg-[#FDFCF8] rounded-md border border-[#E3DBCC] text-xs text-[#101010]/75 leading-relaxed">
          <span className="font-bold text-[#101010]">Assay Note:</span> {passport.summary}
        </div>
      )}
    </div>
  );
}
