import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#F3F0E9] border-t border-[#E3DBCC] mt-24 text-[#101010] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <span className="text-2xl font-black tracking-tighter uppercase flex items-center gap-1">
              RE<span className="text-[#101010]/40">:</span>SOURCE
            </span>
            <div className="text-xs uppercase font-mono tracking-widest text-[#101010]/55 font-semibold">
              Industrial Resource Exchange
            </div>
            <p className="text-sm text-[#101010]/70 max-w-sm leading-relaxed pt-1">
              An institutional platform enabling industrial facilities to monetize secondary
              by-products, eliminate landfill costs, and replace virgin mineral extraction through
              structured commerce and auditable circular supply chains.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs font-mono text-[#101010]/60">
              <ShieldCheck className="w-4 h-4 text-[#101010]" />
              Structured Price Negotiation • Zero Chat • Backend Enforced Confidentiality
            </div>
          </div>

          {/* Column 1: Exchange */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#101010]/55 font-bold mb-3">
              Exchange
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/marketplace" className="text-[#101010]/80 hover:text-[#101010] transition-colors">
                  Material Marketplace
                </Link>
              </li>
              <li>
                <Link to="/ai-discovery" className="text-[#101010]/80 hover:text-[#101010] transition-colors">
                  AI Discovery Engine
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-[#101010]/80 hover:text-[#101010] transition-colors">
                  Price Request Ledger
                </Link>
              </li>
              <li>
                <Link to="/impact" className="text-[#101010]/80 hover:text-[#101010] transition-colors">
                  Environmental Impact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Material Sectors */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#101010]/55 font-bold mb-3">
              Residual Streams
            </h4>
            <ul className="space-y-2 text-sm text-[#101010]/80">
              <li>Metallurgical Slag & Scale</li>
              <li>Pulverized Class F Fly Ash</li>
              <li>Phosphogypsum & Sulfates</li>
              <li>Foundry Sand & Refractories</li>
              <li>Spent Alkali & Neutralizers</li>
            </ul>
          </div>

          {/* Column 3: Governance */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#101010]/55 font-bold mb-3">
              Governance & Trust
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/admin" className="text-[#101010]/80 hover:text-[#101010] transition-colors flex items-center gap-1">
                  Facilitator Portal <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li className="text-[#101010]/80">Confidentiality Protocol</li>
              <li className="text-[#101010]/80">Escrow Clearinghouse</li>
              <li className="text-[#101010]/80">Lab Assay Verification</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-[#E3DBCC] flex flex-col sm:flex-row items-center justify-between text-xs text-[#101010]/50 font-mono gap-4">
          <div>
            © {new Date().getFullYear()} RE:SOURCE Industrial Exchange. All commercial trade protocols protected.
          </div>
          <div className="flex items-center gap-6">
            <span>Palette: #FDFCF8 / #F3F0E9 / #101010 / #E3DBCC</span>
            <span>Version 2.4-Production</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
