import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ArrowRight, CheckCheck, Clock } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchNotifications, markNotificationRead } from '../store/slices/notificationSlice';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const { items, unreadCount } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
    const interval = setInterval(() => {
      dispatch(fetchNotifications());
    }, 15000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleRead = (id) => {
    dispatch(markNotificationRead(id));
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-[#E3DBCC]/50 text-[#101010] transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 stroke-[1.8]" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#101010] ring-2 ring-[#FDFCF8]" />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 card-ivory border border-[#E3DBCC] shadow-xl rounded-xl z-50 overflow-hidden">
            <div className="p-3.5 border-b border-[#E3DBCC] flex items-center justify-between bg-[#FDFCF8]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#101010]">
                  Structured Events
                </span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E3DBCC] text-[#101010] font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <span className="text-[11px] text-[#101010]/50 font-mono">
                Ledger Notifications
              </span>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-[#E3DBCC]/60">
              {items.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#101010]/60">
                  No notifications recorded.
                </div>
              ) : (
                items.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => handleRead(n._id)}
                    className={`p-3.5 hover:bg-[#FDFCF8]/80 transition-colors cursor-pointer ${
                      !n.isRead ? 'bg-[#E3DBCC]/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-[#101010] leading-tight">
                        {n.title}
                      </span>
                      <span className="text-[10px] font-mono text-[#101010]/50 shrink-0">
                        {new Date(n.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-[#101010]/75 leading-relaxed mb-2.5">
                      {n.message}
                    </p>
                    <Link
                      to={n.actionLink || '/dashboard'}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#101010] hover:underline"
                    >
                      {n.actionLabel || 'View Record'} <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))
              )}
            </div>

            <div className="p-2.5 border-t border-[#E3DBCC] bg-[#FDFCF8] text-center">
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="text-xs font-semibold text-[#101010] hover:underline"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
