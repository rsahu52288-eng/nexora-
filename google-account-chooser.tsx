"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, X, Check, Plus, ExternalLink, HelpCircle, ArrowRight } from "lucide-react";
import { useStorage } from "@/lib/storage-store";
import { UserProfile } from "@/types";

interface GoogleAccountChooserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount?: (email: string, name: string) => void;
}

export function GoogleAccountChooser({ isOpen, onClose }: GoogleAccountChooserProps) {
  const router = useRouter();
  const { setUser, logActivity } = useStorage();
  const [customEmail, setCustomEmail] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showDocs, setShowDocs] = useState(false);

  if (!isOpen) return null;

  const demoGoogleAccounts = [
    {
      name: "Rahul Sahu",
      email: "rahul.sahu@gmail.com",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    },
    {
      name: "Praful Dev",
      email: "praful.dev@gmail.com",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
    },
    {
      name: "Cloud Architect",
      email: "engineer.nexora@gmail.com",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    },
  ];

  const handleSelect = (email: string, name: string, avatarUrl: string) => {
    const profile: UserProfile = {
      id: `usr_google_${Date.now()}`,
      email,
      full_name: name,
      avatar_url: avatarUrl,
      role: "user",
      plan: "Free Plan",
      storage_used: 12.5 * 1024 * 1024 * 1024,
      storage_quota: 100 * 1024 * 1024 * 1024,
      created_at: new Date().toISOString(),
    };

    setUser(profile);
    logActivity("Login", `Google Sign-In verified: ${email}`);
    onClose();
    router.push("/dashboard");
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;

    const email = customEmail.trim();
    const name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

    handleSelect(email, name, avatar);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative animate-in zoom-in-95 duration-200">
        {/* Google Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <div>
              <h3 className="text-base font-bold text-slate-900">Sign in with Google</h3>
              <p className="text-xs text-slate-500">Choose an account to continue to NEXORA</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Account List */}
        <div className="p-4 space-y-1 divide-y divide-slate-100 max-h-72 overflow-y-auto">
          {demoGoogleAccounts.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => handleSelect(acc.email, acc.name, acc.avatar)}
              className="w-full p-3 rounded-2xl hover:bg-slate-50 transition-colors flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <img
                  src={acc.avatar}
                  alt={acc.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {acc.name}
                  </h4>
                  <p className="text-[11px] text-slate-500">{acc.email}</p>
                </div>
              </div>
              <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}

          {/* Use another account option */}
          <div className="pt-2">
            {!showCustomInput ? (
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="w-full p-3 rounded-2xl hover:bg-slate-50 transition-colors flex items-center gap-3 text-left text-blue-600 font-bold text-xs"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Plus size={18} />
                </div>
                <span>Use another Google account</span>
              </button>
            ) : (
              <form onSubmit={handleCustomSubmit} className="p-2 space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Enter your Google Account email
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    required
                    placeholder="user@gmail.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm"
                  >
                    Continue
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer & OAuth Setup Note */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500">
          <button
            type="button"
            onClick={() => setShowDocs(!showDocs)}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium"
          >
            <HelpCircle size={13} />
            <span>Configuring Supabase Google OAuth in Production</span>
          </button>

          {showDocs && (
            <div className="mt-2.5 p-3 rounded-xl bg-white border border-slate-200 space-y-1.5 text-[10px] text-slate-600">
              <p>
                <strong>1.</strong> In Google Cloud Console, add Authorized redirect URI:
              </p>
              <code className="block p-1 rounded bg-slate-100 font-mono text-[9px] break-all">
                https://&lt;your-project&gt;.supabase.co/auth/v1/callback
              </code>
              <p>
                <strong>2.</strong> In Supabase Dashboard &rarr; Authentication &rarr; Providers &rarr; Google: enable provider and paste your Client ID & Client Secret.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
