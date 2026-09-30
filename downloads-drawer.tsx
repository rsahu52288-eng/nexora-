"use client";

import React from "react";
import {
  Download,
  CheckCircle2,
  X,
  ExternalLink,
  Trash2,
  FileText,
  Eye,
  RefreshCw,
} from "lucide-react";
import { useStorage } from "@/lib/storage-store";
import { FileIcon } from "./file-icon";
import { formatBytes, formatRelativeTime } from "@/lib/utils";

interface DownloadsDrawerProps {
  onPreviewFile?: (file: any) => void;
}

export function DownloadsDrawer({ onPreviewFile }: DownloadsDrawerProps) {
  const {
    downloadedItems,
    showDownloadsDrawer,
    setShowDownloadsDrawer,
    clearDownloads,
    downloadFile,
  } = useStorage();

  if (!showDownloadsDrawer || downloadedItems.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-sm w-full bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
      {/* Header */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <Download size={15} className="text-white" />
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-wide">Downloaded Files</h4>
            <p className="text-[10px] text-slate-400">
              {downloadedItems.length} {downloadedItems.length === 1 ? "file" : "files"} saved to device
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={clearDownloads}
            title="Clear list"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={() => setShowDownloadsDrawer(false)}
            title="Close"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 p-2">
        {downloadedItems.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-2xl hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <FileIcon
                type={item.file.type}
                size={18}
                imageUrl={item.file.public_url || item.file.data_url || item.file.thumbnail_url}
                alt={item.file.name}
              />
              <div className="overflow-hidden">
                <h5 className="text-xs font-bold text-slate-900 truncate">
                  {item.file.name}
                </h5>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                  <span>{formatBytes(item.file.size)}</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={11} /> Ready
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {onPreviewFile && (
                <button
                  onClick={() => onPreviewFile(item.file)}
                  className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Open Preview"
                >
                  <Eye size={15} />
                </button>
              )}
              <button
                onClick={() => downloadFile(item.file)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Download Again"
              >
                <RefreshCw size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Files saved to your system <strong>Downloads</strong> folder</span>
        <button
          onClick={() => setShowDownloadsDrawer(false)}
          className="text-xs font-bold text-blue-600 hover:text-blue-700"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
