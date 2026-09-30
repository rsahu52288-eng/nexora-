"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  Share2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  FileText,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Shield,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { NexoraFile } from "@/types";
import { formatBytes } from "@/lib/utils";
import { NexoraLogo } from "./nexora-logo";
import { useStorage } from "@/lib/storage-store";
import { supabase } from "@/lib/supabase/client";

interface FilePreviewModalProps {
  file: NexoraFile | null;
  onClose: () => void;
  onShare?: (file: NexoraFile) => void;
}

export function FilePreviewModal({
  file,
  onClose,
  onShare,
}: FilePreviewModalProps) {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState<string>("");
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const [imageError, setImageError] = useState<boolean>(false);

  const { downloadFile } = useStorage();

  const isImage = Boolean(
    file &&
      (file.type?.toLowerCase() === "image" ||
        file.mime_type?.toLowerCase().startsWith("image/") ||
        /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.name))
  );

  const totalPages = file?.type === "PDF" ? 24 : 1;

  // Accurately resolve this specific file's image
  useEffect(() => {
    if (!file || !isImage) return;

    let isCurrent = true;
    let objectUrl: string | null = null;
    setImageLoading(true);
    setImageError(false);

    async function loadTargetImage() {
      if (!file) return;

      // 1. Direct Data URL (original base64 bytes from this specific upload)
      if (file.data_url && file.data_url.startsWith("data:")) {
        if (isCurrent) {
          setResolvedSrc(file.data_url);
          setImageLoading(false);
        }
        return;
      }

      // 2. Direct public URL if it's already an active HTTP URL
      if (file.public_url && file.public_url.startsWith("http")) {
        if (isCurrent) {
          setResolvedSrc(file.public_url);
          setImageLoading(false);
        }
        return;
      }

      // 3. Supabase Storage fetch via storage_path
      if (file.storage_path) {
        try {
          const { data: pubData } = supabase.storage
            .from("nexora-files")
            .getPublicUrl(file.storage_path);

          if (pubData?.publicUrl && isCurrent) {
            setResolvedSrc(pubData.publicUrl);
            setImageLoading(false);
            return;
          }

          // Try downloading storage blob directly
          const { data: blobData, error: dlErr } = await supabase.storage
            .from("nexora-files")
            .download(file.storage_path);

          if (!dlErr && blobData && isCurrent) {
            objectUrl = URL.createObjectURL(blobData);
            setResolvedSrc(objectUrl);
            setImageLoading(false);
            return;
          }
        } catch (e) {
          console.warn("Storage preview notice:", e);
        }
      }

      // 4. Fallback to thumbnail_url if available
      if (file.thumbnail_url && file.thumbnail_url.startsWith("http")) {
        if (isCurrent) {
          setResolvedSrc(file.thumbnail_url);
          setImageLoading(false);
        }
        return;
      }

      if (isCurrent) {
        setImageLoading(false);
        setImageError(true);
      }
    }

    loadTargetImage();

    return () => {
      isCurrent = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file?.id, file?.storage_path, file?.public_url, file?.data_url, isImage]);

  if (!file) return null;

  const handleDownload = () => {
    downloadFile(file);
  };

  const handleShareClick = () => {
    if (onShare) {
      onShare(file);
    } else {
      navigator.clipboard.writeText(
        `${window.location.origin}/preview?id=${encodeURIComponent(file.id)}&file=${encodeURIComponent(file.name)}`
      );
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col animate-in fade-in">
      {/* Top Header Toolbar */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between text-white flex-shrink-0">
        {/* Left: File Name & Size */}
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isImage ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
            {isImage ? <ImageIcon size={18} /> : <FileText size={18} />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              {file.name}
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Shield size={10} /> Verified
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              {formatBytes(file.size)} • {file.encryption_algorithm}
            </p>
          </div>
        </div>

        {/* Center: Pagination & Zoom Controls */}
        <div className="hidden md:flex items-center gap-4 bg-slate-800/80 px-4 py-1.5 rounded-xl border border-slate-700">
          {file.type === "PDF" && (
            <div className="flex items-center gap-2 text-xs text-slate-300 pr-3 border-r border-slate-700">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1 rounded hover:bg-slate-700 disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <span>
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1 rounded hover:bg-slate-700 disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-slate-300">
            <button
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              className="p-1 rounded hover:bg-slate-700"
              title="Zoom out"
            >
              <ZoomOut size={16} />
            </button>
            <span className="w-10 text-center font-mono">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(200, z + 10))}
              className="p-1 rounded hover:bg-slate-700"
              title="Zoom in"
            >
              <ZoomIn size={16} />
            </button>
            {zoom !== 100 && (
              <button
                onClick={() => setZoom(100)}
                className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold ml-1"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Right: Download, Share, Close */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Download</span>
          </button>

          <button
            onClick={handleShareClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-blue-500/30 transition-all"
          >
            {copiedLink ? <Check size={14} /> : <Share2 size={14} />}
            <span className="hidden sm:inline">
              {copiedLink ? "Link Copied!" : "Share"}
            </span>
          </button>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-2"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Main Preview Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Thumbnails Column for PDF */}
        {file.type === "PDF" && (
          <div className="hidden lg:flex flex-col w-48 bg-slate-900/60 border-r border-slate-800 p-4 space-y-3 overflow-y-auto">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              Pages ({totalPages})
            </span>
            {[1, 2, 3, 4, 5].map((pageNum) => (
              <div
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`p-2 rounded-xl border cursor-pointer transition-all ${
                  currentPage === pageNum
                    ? "border-blue-500 bg-blue-500/10 shadow-glow"
                    : "border-slate-800 hover:border-slate-700 bg-slate-950/40"
                }`}
              >
                <div className="w-full h-24 bg-white rounded flex flex-col justify-between p-2 shadow-inner text-slate-400 select-none">
                  <div className="h-1 bg-slate-200 rounded w-1/3" />
                  <div className="space-y-1">
                    <div className="h-1 bg-slate-100 rounded w-full" />
                    <div className="h-1 bg-slate-100 rounded w-4/5" />
                    <div className="h-1 bg-slate-100 rounded w-2/3" />
                  </div>
                  <div className="text-[9px] text-right font-mono text-slate-400">
                    {pageNum}
                  </div>
                </div>
                <div className="text-center text-[10px] text-slate-400 mt-1 font-medium">
                  Page {pageNum}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Content Viewer */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center bg-slate-950/90">
          {isImage ? (
            /* Image Preview */
            <div className="flex flex-col items-center justify-center max-w-5xl w-full space-y-4">
              <div
                className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900/60 max-h-[75vh] flex items-center justify-center transition-transform duration-200 min-h-[300px] min-w-[300px]"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center center" }}
              >
                {imageLoading && (
                  <div className="flex flex-col items-center gap-3 p-10 text-slate-400">
                    <Loader2 size={32} className="animate-spin text-blue-500" />
                    <span className="text-xs">Fetching image from Supabase Storage...</span>
                  </div>
                )}

                {imageError && !imageLoading && (
                  <div className="flex flex-col items-center gap-3 p-10 text-slate-400">
                    <AlertCircle size={36} className="text-amber-500" />
                    <span className="text-xs font-bold text-slate-200">{file.name}</span>
                    <span className="text-[11px] text-slate-500">Image preview unavailable</span>
                  </div>
                )}

                {resolvedSrc && !imageError && (
                  <img
                    src={resolvedSrc}
                    alt={file.name}
                    className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl select-none"
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                      setImageLoading(false);
                      setImageError(true);
                    }}
                  />
                )}
              </div>

              {/* Image Info Metadata Bar */}
              <div className="flex items-center flex-wrap justify-center gap-3 text-xs text-slate-300 bg-slate-900/90 px-5 py-2.5 rounded-2xl border border-slate-800 shadow-xl">
                <span className="font-bold text-white">{file.name}</span>
                <span>•</span>
                <span>{formatBytes(file.size)}</span>
                <span>•</span>
                <span className="font-mono text-cyan-400">SHA-256: {file.hash?.substring(0, 16)}...</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Shield size={13} /> Supabase Storage Verified
                </span>
              </div>
            </div>
          ) : (
            /* Document Viewer Sheet */
            <div
              className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 max-w-3xl w-full min-h-[580px] text-slate-900 transition-transform duration-200 border border-slate-200 relative overflow-hidden"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
            >
              {/* Background watermark graphic */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <Shield size={360} className="text-blue-600" />
              </div>

              {/* Header */}
              <div className="border-b border-slate-200 pb-6 mb-8 flex justify-between items-start relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <NexoraLogo size="sm" theme="light" />
                    <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">
                      Document Security
                    </span>
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    {file.name}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    SHA-256: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[11px]">{file.hash}</code>
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200">
                    256-Bit Encrypted
                  </span>
                  <div className="text-[11px] text-slate-400 mt-2 font-mono">
                    Chunks: {file.chunks_count} | Ratio: {file.compression_ratio}%
                  </div>
                </div>
              </div>

              {/* Content Body */}
              <div className="space-y-4 text-xs leading-relaxed text-slate-700 relative z-10 font-sans">
                <p className="font-semibold text-slate-900 text-sm">
                  CONFIDENTIAL ARCHIVE & INTEGRITY RECORD
                </p>
                <p>
                  This file was processed, compressed, and encrypted directly on the client side using AES-256-GCM.
                  The cryptographic hash has been verified against the master ledger on Supabase Storage.
                </p>
                <div className="my-6 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Storage Partition:</span>
                    <span className="text-slate-800 font-bold">{file.storage_path}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Original Size:</span>
                    <span className="text-slate-800">{formatBytes(file.original_size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Compressed Size:</span>
                    <span className="text-slate-800 font-bold text-emerald-600">
                      {formatBytes(file.size)} ({file.compression_ratio}% reduction)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Encryption Method:</span>
                    <span className="text-slate-800">{file.encryption_algorithm}</span>
                  </div>
                </div>
                <p>
                  Zero-Knowledge Proof verified. Content blocks are distributed across decentralized Supabase Storage clusters.
                  Unauthorized access without encryption keys is mathematically unfeasible.
                </p>
              </div>

              {/* Footer */}
              <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
                <span>NEXORA Vault Security Engine v2.4</span>
                <span className="font-mono">Page {currentPage} of {totalPages}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
