import React from "react";
import {
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Archive,
  Film,
  Music,
  Figma,
  File,
} from "lucide-react";
import { FileCategory } from "@/types";

interface FileIconProps {
  type: FileCategory | string;
  className?: string;
  size?: number;
  imageUrl?: string;
  alt?: string;
}

export function FileIcon({ type, className = "", size = 20, imageUrl, alt }: FileIconProps) {
  const normType = type?.toUpperCase() || "";

  if (imageUrl) {
    return (
      <div className={`relative overflow-hidden rounded-xl border border-slate-200/90 bg-slate-100 flex-shrink-0 flex items-center justify-center shadow-xs ${className || "w-9 h-9"}`}>
        <div className="absolute inset-0 flex items-center justify-center text-emerald-600 bg-emerald-50">
          <ImageIcon size={size} />
        </div>
        <img
          src={imageUrl}
          alt={alt || "Image preview"}
          className="w-full h-full object-cover relative z-10"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    );
  }

  if (normType.includes("PDF")) {
    return (
      <div className={`p-2 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-center justify-center ${className}`}>
        <FileText size={size} />
      </div>
    );
  }

  if (normType.includes("PPT") || normType.includes("PRESENTATION")) {
    return (
      <div className={`p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center ${className}`}>
        <FileSpreadsheet size={size} />
      </div>
    );
  }

  if (normType.includes("IMAGE") || normType.includes("JPG") || normType.includes("PNG")) {
    return (
      <div className={`p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center ${className}`}>
        <ImageIcon size={size} />
      </div>
    );
  }

  if (normType.includes("ZIP") || normType.includes("ARCHIVE") || normType.includes("TAR")) {
    return (
      <div className={`p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center ${className}`}>
        <Archive size={size} />
      </div>
    );
  }

  if (normType.includes("FIGMA") || normType.includes("FIG")) {
    return (
      <div className={`p-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center ${className}`}>
        <Figma size={size} />
      </div>
    );
  }

  if (normType.includes("VIDEO") || normType.includes("MP4")) {
    return (
      <div className={`p-2 rounded-lg bg-violet-50 text-violet-600 border border-violet-100 flex items-center justify-center ${className}`}>
        <Film size={size} />
      </div>
    );
  }

  if (normType.includes("AUDIO") || normType.includes("MP3")) {
    return (
      <div className={`p-2 rounded-lg bg-pink-50 text-pink-600 border border-pink-100 flex items-center justify-center ${className}`}>
        <Music size={size} />
      </div>
    );
  }

  return (
    <div className={`p-2 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 flex items-center justify-center ${className}`}>
      <File size={size} />
    </div>
  );
}
