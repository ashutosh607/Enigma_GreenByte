import React, { useState } from 'react';
import { UserCheck, ChevronDown, Check } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { switchUserPersona } from '../store/slices/authSlice';

const ROLES = [
  { role: 'buyer', label: 'Buyer (UltraTech Infra)', sub: 'Ashutosh Kadam' },
  { role: 'seller', label: 'Seller (Tata Metaliks)', sub: 'Rajesh Varma' },
  { role: 'admin', label: 'Facilitator / Admin', sub: 'Platform HQ' },
];

export default function RoleSwitcher() {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const { activeRole, user } = useSelector((state) => state.auth);

  const handleSelectRole = (role) => {
    dispatch(switchUserPersona(role));
    setOpen(false);
  };

  const currentLabel =
    ROLES.find((r) => r.role === activeRole)?.label ||
    (user?.role ? `${user.role.toUpperCase()}` : 'Buyer (UltraTech)');

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F3F0E9] hover:bg-[#E3DBCC] border border-[#E3DBCC] text-xs font-semibold text-[#101010] transition-colors cursor-pointer"
        title="Switch persona to test both sides of negotiation"
      >
        <UserCheck className="w-3.5 h-3.5 text-[#101010]" />
        <span className="hidden sm:inline font-mono">{currentLabel}</span>
        <ChevronDown className="w-3.5 h-3.5 text-[#101010]/60" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 card-ivory border border-[#E3DBCC] shadow-lg rounded-xl z-50 overflow-hidden p-1.5">
            <div className="px-3 py-2 border-b border-[#E3DBCC]/70 mb-1">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#101010]/55 block">
                Interactive Persona Mode
              </span>
              <span className="text-xs font-semibold text-[#101010]">
                Evaluate from both sides
              </span>
            </div>
            {ROLES.map((r) => (
              <button
                key={r.role}
                type="button"
                onClick={() => handleSelectRole(r.role)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                  activeRole === r.role
                    ? 'bg-[#101010] text-[#FDFCF8] font-bold'
                    : 'text-[#101010] hover:bg-[#E3DBCC]/50'
                }`}
              >
                <div>
                  <div className="font-semibold">{r.label}</div>
                  <div
                    className={`text-[10px] ${
                      activeRole === r.role ? 'text-[#FDFCF8]/70' : 'text-[#101010]/50'
                    }`}
                  >
                    {r.sub}
                  </div>
                </div>
                {activeRole === r.role && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
