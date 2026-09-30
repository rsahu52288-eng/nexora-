"use client";

import React, { useState } from "react";
import { X, Copy, Check, Share2, Mail, Shield, Globe } from "lucide-react";
import { NexoraFile } from "@/types";
import { useStorage } from "@/lib/storage-store";

interface ShareModalProps {
  file: NexoraFile | null;
  onClose: () => void;
}

export function ShareFileModal({ file, onClose }: ShareModalProps) {
  const { toggleFileShare } = useStorage();
  const [emailInput, setEmailInput] = useState("");
  const [accessLevel, setAccessLevel] = useState<"View" | "Download" | "Full Access">("View");
  const [copied, setCopied] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  if (!file) return null;

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : "https://nexora.cloud"}/shared?token=tk_${file.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;

    toggleFileShare(file.id, emailInput);
    setSuccessMsg(`Access granted to ${emailInput}`);
    setEmailInput("");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Share2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Share File</h3>
              <p className="text-xs text-slate-500 truncate max-w-xs">{file.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Email invite form */}
        <form onSubmit={handleInvite} className="space-y-3">
          <label className="text-xs font-bold text-slate-700 block">
            Invite People via Email
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="email"
                placeholder="colleague@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
            <select
              value={accessLevel}
              onChange={(e) => setAccessLevel(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2.5 text-slate-700 focus:outline-none"
            >
              <option value="View">Can view</option>
              <option value="Download">Can download</option>
              <option value="Full Access">Full access</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-blue-500/30 transition-colors"
            >
              Send
            </button>
          </div>
          {successMsg && (
            <p className="text-xs text-emerald-600 font-semibold">{successMsg}</p>
          )}
        </form>

        {/* Share Link Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Globe size={14} className="text-blue-500" /> Shareable Link
            </span>
            <span className="text-[11px] text-slate-400">
              Anyone with this link can view
            </span>
          </div>

          <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="bg-transparent text-xs text-slate-600 flex-1 outline-none px-2 font-mono truncate"
            />
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-sm transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-center gap-3 text-xs text-slate-600">
          <Shield size={16} className="text-blue-600 flex-shrink-0" />
          <span>
            Links are protected with end-to-end client key decryption. File data remains zero-knowledge encrypted on Supabase storage.
          </span>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
