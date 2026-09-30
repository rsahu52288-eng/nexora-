"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Upload,
  Download,
  User,
  Settings,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Menu,
} from "lucide-react";
import { useStorage } from "@/lib/storage-store";
import { formatRelativeTime } from "@/lib/utils";
import { signOutFromSupabase } from "@/lib/supabase-service";

interface TopbarProps {
  onOpenMobileMenu?: () => void;
  onSearch?: (query: string) => void;
}

export function Topbar({ onOpenMobileMenu, onSearch }: TopbarProps) {
  const router = useRouter();
  const {
    user,
    notifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    downloadedItems,
    showDownloadsDrawer,
    setShowDownloadsDrawer,
  } = useStorage();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile hamburger & Search bar */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open mobile menu"
        >
          <Menu size={20} />
        </button>

        <div className="relative w-full max-w-md">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search files, folders..."
            value={searchVal}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-slate-800 placeholder-slate-400 transition-all outline-none"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Upload Button */}
        <Link
          href="/upload"
          className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl shadow-sm shadow-blue-500/30 transition-all hover:shadow"
        >
          <Upload size={16} />
          <span>Upload</span>
        </Link>

        {/* Downloaded Files Indicator Button */}
        <button
          onClick={() => setShowDownloadsDrawer(!showDownloadsDrawer)}
          className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Downloaded Files"
          aria-label="View downloaded files"
        >
          <Download size={19} />
          {downloadedItems.length > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-sm ring-2 ring-white">
              {downloadedItems.length}
            </span>
          )}
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="View notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  onClick={markAllNotificationsAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Mark all as read
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 mt-2">
                {notifications.length === 0 ? (
                  <p className="text-center py-6 text-xs text-slate-400">No notifications yet.</p>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`py-3 px-2 rounded-xl transition-colors cursor-pointer flex items-start gap-3 ${
                        n.read ? "opacity-75 hover:bg-slate-50" : "bg-blue-50/50 hover:bg-blue-50"
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-blue-600" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-semibold text-slate-900">{n.title}</h4>
                          <span className="text-[10px] text-slate-400">
                            {formatRelativeTime(n.created_at)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <Link
                  href="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 block py-1"
                >
                  View all notifications &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1 rounded-full sm:rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <img
              src={user.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
              alt={user.full_name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/20 shadow-sm"
            />
            <div className="hidden md:block text-left pr-2">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {user.full_name}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                {user.plan}
              </div>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user.full_name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
              </div>

              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  <User size={15} className="text-slate-400" />
                  Profile Details
                </Link>
                <Link
                  href="/settings?tab=security"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  <Settings size={15} className="text-slate-400" />
                  Security & Keys
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  <ShieldCheck size={15} className="text-blue-500" />
                  Admin Console
                </Link>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={async () => {
                    setShowProfileMenu(false);
                    await signOutFromSupabase();
                    router.push("/login");
                  }}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
