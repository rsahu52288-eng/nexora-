import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return `${mins} ${mins === 1 ? "minute" : "minutes"} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function detectFileType(filename: string): 'PDF' | 'PPTX' | 'Image' | 'ZIP' | 'Video' | 'Audio' | 'Document' | 'Figma' | 'Other' {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['pdf'].includes(ext)) return 'PDF';
  if (['pptx', 'ppt', 'keynote'].includes(ext)) return 'PPTX';
  if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext)) return 'Image';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'ZIP';
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return 'Video';
  if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return 'Audio';
  if (['doc', 'docx', 'txt', 'md', 'rtf'].includes(ext)) return 'Document';
  if (['fig'].includes(ext)) return 'Figma';
  return 'Other';
}

export function dataUrlToBlob(dataUrl: string): Blob {
  try {
    const parts = dataUrl.split(",");
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    console.error("dataUrlToBlob error:", e);
    return new Blob([], { type: "application/octet-stream" });
  }
}

