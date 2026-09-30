"use client";

import React from "react";

interface NexoraLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showSubtitle?: boolean;
  theme?: "dark" | "light" | "auto";
  className?: string;
}

export function NexoraLogo({
  size = "md",
  showSubtitle = true,
  theme = "auto",
  className = "",
}: NexoraLogoProps) {
  const iconSizes = {
    sm: 28,
    md: 38,
    lg: 48,
    xl: 60,
  };

  const textSizes = {
    sm: "text-base tracking-wider",
    md: "text-xl tracking-wider",
    lg: "text-2xl tracking-widest",
    xl: "text-3xl tracking-widest",
  };

  const subtitleSizes = {
    sm: "text-[8px] tracking-wider",
    md: "text-[9px] tracking-widest",
    lg: "text-[11px] tracking-widest",
    xl: "text-xs tracking-widest",
  };

  const px = iconSizes[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Original Bespoke Nexora Cryptographic Emblem */}
      <div
        className="relative flex-shrink-0 flex items-center justify-center group"
        style={{ width: px, height: px }}
      >
        {/* Ambient Neon Backglow */}
        <div className="absolute inset-0 bg-blue-500/30 rounded-2xl blur-md group-hover:bg-cyan-400/40 transition-all duration-500" />

        <svg
          viewBox="0 0 100 100"
          className="w-full h-full relative z-10 drop-shadow-md transition-transform duration-300 group-hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradients for faceted 3D cryptographic shield & cube */}
            <linearGradient id="nexoraGradTop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>

            <linearGradient id="nexoraGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E40AF" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>

            <linearGradient id="nexoraGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="60%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </linearGradient>

            <linearGradient id="nexoraGradCore" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            <filter id="coreGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Hexagonal Shield Contour */}
          <path
            d="M50 6 L86 25 V68 L50 94 L14 68 V25 Z"
            fill="url(#nexoraGradLeft)"
            stroke="url(#nexoraGradTop)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Top Facet of the Isometric Hyper-Block */}
          <path
            d="M50 18 L76 33 L50 48 L24 33 Z"
            fill="url(#nexoraGradTop)"
            opacity="0.95"
          />

          {/* Left Facet */}
          <path
            d="M24 33 L50 48 V78 L24 63 Z"
            fill="url(#nexoraGradLeft)"
            opacity="0.9"
          />

          {/* Right Facet */}
          <path
            d="M50 48 L76 33 V63 L50 78 Z"
            fill="url(#nexoraGradRight)"
            opacity="0.9"
          />

          {/* Dynamic Floating Keyhole & Cyber Core */}
          <circle
            cx="50"
            cy="46"
            r="8"
            fill="url(#nexoraGradCore)"
            filter="url(#coreGlow)"
          />
          <path
            d="M47 48 L45 59 H55 L53 48 Z"
            fill="white"
            opacity="0.95"
          />
          <circle
            cx="50"
            cy="45"
            r="3"
            fill="#0F172A"
          />

          {/* High-Tech Circuit Accent Dots */}
          <circle cx="86" cy="25" r="2.5" fill="#38BDF8" />
          <circle cx="14" cy="25" r="2.5" fill="#38BDF8" />
          <circle cx="50" cy="94" r="2.5" fill="#38BDF8" />
          <circle cx="50" cy="6" r="2.5" fill="#38BDF8" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col justify-center">
        <div
          className={`font-black uppercase leading-none font-sans flex items-center gap-1.5 ${
            textSizes[size]
          } ${
            theme === "dark"
              ? "text-white"
              : theme === "light"
              ? "text-slate-950"
              : "text-slate-950 dark:text-white"
          }`}
        >
          <span>NEXORA</span>
        </div>

        {showSubtitle && (
          <div
            className={`font-bold uppercase leading-none mt-1 font-mono ${
              subtitleSizes[size]
            } ${
              theme === "dark"
                ? "text-slate-400"
                : "text-slate-500"
            }`}
          >
            SECURE • EFFICIENT • DISTRIBUTED
          </div>
        )}
      </div>
    </div>
  );
}
