"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UploadCloud,
  FolderOpen,
  Share2,
  BarChart3,
  History,
  Settings,
  ShieldCheck,
  Zap,
  HardDrive,
  X,
  Download,
} from "lucide-react";
import { useStorage } from "@/lib/storage-store";
import { NexoraLogo } from "./nexora-logo";

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { storageUsedGB, storagePercentage, user, updateProfile, downloadedItems } = useStorage();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Upload Files", href: "/upload", icon: UploadCloud },
    { label: "My Files", href: "/files", icon: FolderOpen },
    { label: "Downloads", href: "/downloads", icon: Download, badge: downloadedItems.length > 0 ? downloadedItems.length : undefined },
    { label: "Shared Files", href: "/shared", icon: Share2 },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Activity Logs", href: "/activity", icon: History },
    { label: "Settings", href: "/settings", icon: Settings },
    { label: "Admin Console", href: "/admin", icon: ShieldCheck },
  ];

  return (
    <>
      <aside className="w-64 bg-[#0A101D] text-slate-300 flex flex-col h-full border-r border-slate-800/80 select-none">
        {/* Header / Brand with Original Logo */}
        <div className="p-5 flex items-center justify-between border-b border-slate-800/60">
          <Link
            href="/"
            onClick={onCloseMobile}
            className="flex items-center group focus:outline-none"
          >
            <NexoraLogo theme="dark" size="sm" />
          </Link>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon
                  size={18}
                  className={isActive ? "text-white" : "text-slate-400 group-hover:text-white"}
                />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    {item.badge}
                  </span>
                )}
                {item.label === "Admin Console" && (
                  <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    Pro
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Storage Widget */}
        <div className="p-4 mx-3 mb-3 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-inner">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <HardDrive size={14} className="text-blue-400" /> Storage Used
            </span>
            <span className="text-slate-400 font-semibold">{storagePercentage}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.max(4, storagePercentage)}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
            <span>{storageUsedGB} GB of 100 GB</span>
            <span className="text-emerald-400 font-medium">Optimized</span>
          </div>
        </div>

        {/* Upgrade Plan Card */}
        <div className="p-4 mx-3 mb-4 rounded-2xl bg-gradient-to-br from-blue-900/40 via-indigo-950/40 to-slate-900 border border-blue-500/20 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all pointer-events-none" />
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black shadow-md flex-shrink-0">
              <Zap size={16} fill="currentColor" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white tracking-wide">Upgrade Plan</h4>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                Get up to 2 TB storage and zero-knowledge vault.
              </p>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="mt-2.5 text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
              >
                Upgrade now &rarr;
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Zap size={24} className="text-blue-600 fill-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Upgrade to NEXORA Pro 🇮🇳</h3>
            <p className="text-sm text-slate-500 mt-1">
              Unlock unlimited compression savings, 2 TB dedicated encrypted cloud storage, and priority chunk distribution — Built for India.
            </p>
            <div className="mt-5 p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2 text-sm text-slate-700">
              <div className="flex justify-between font-semibold text-slate-900">
                <span>Pro Storage Plan</span>
                <span className="text-blue-600">₹799 / mo</span>
              </div>
              <ul className="text-xs space-y-1.5 text-slate-600 pt-2 border-t border-blue-100">
                <li className="flex items-center gap-2">✓ 2,000 GB AES-256 Storage</li>
                <li className="flex items-center gap-2">✓ Multi-Region Chunk Replication</li>
                <li className="flex items-center gap-2">✓ Zero-Knowledge Password Vault</li>
                <li className="flex items-center gap-2">✓ 24/7 Priority SLA & Dedicated Nodes</li>
              </ul>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateProfile({
                    plan: "Pro Plan",
                    storage_quota: 2000 * 1024 * 1024 * 1024,
                  });
                  setShowUpgradeModal(false);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-600/30 transition-all"
              >
                Confirm Upgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
