"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  UserProfile,
  NexoraFile,
  ActivityLog,
  NotificationItem,
  SharedFileItem,
  UploadProcessState,
} from "@/types";
import {
  initialUser,
  initialFiles,
  initialActivityLogs,
  initialNotifications,
  initialSharedWithMe,
  initialSharedByMe,
} from "./mock-data";
import { createDownloadableBlob } from "./file-generator";
import {
  downloadFileFromSupabase,
  deleteFileFromSupabase,
  renameFileInSupabase,
  fetchFilesFromSupabase,
  fetchActivityLogsFromSupabase,
  insertActivityLogInSupabase,
  fetchTotalUsersCount,
  getInitialSupabaseUser,
  getSupabaseCredentials,
} from "./supabase-service";
import { supabase } from "./supabase/client";

export interface DownloadedItem {
  id: string;
  file: NexoraFile;
  downloadedAt: string;
  blobUrl?: string;
}

interface StorageContextType {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  files: NexoraFile[];
  activityLogs: ActivityLog[];
  notifications: NotificationItem[];
  sharedWithMe: SharedFileItem[];
  sharedByMe: SharedFileItem[];
  activeUpload: UploadProcessState | null;
  setActiveUpload: React.Dispatch<React.SetStateAction<UploadProcessState | null>>;
  previewFile: NexoraFile | null;
  setPreviewFile: (file: NexoraFile | null) => void;
  // Downloads manager
  downloadedItems: DownloadedItem[];
  downloadFile: (file: NexoraFile) => Promise<void>;
  clearDownloads: () => void;
  showDownloadsDrawer: boolean;
  setShowDownloadsDrawer: (show: boolean) => void;
  // File operations
  addFile: (file: NexoraFile) => void;
  deleteFile: (id: string) => void;
  renameFile: (id: string, newName: string) => void;
  toggleFileShare: (id: string, recipientEmail?: string) => void;
  // Notifications operations
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notif: Omit<NotificationItem, "id" | "created_at">) => void;
  // Activity operations
  logActivity: (action: ActivityLog["action"], description: string, fileName?: string) => void;
  // User profile
  updateProfile: (updates: Partial<UserProfile>) => void;
  // Dynamic Real Metrics
  storageUsedBytes: number;
  storageQuotaBytes: number;
  storageUsedGB: number;
  storagePercentage: number;
  duplicateSavedBytes: number;
  totalFilesCount: number;
  sharedFilesCount: number;
  totalUsersCount: number;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  resetToDefaults: () => void;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_FILES = "nexora_files_v3";
const LOCAL_STORAGE_KEY_USER = "nexora_user_v3";
const LOCAL_STORAGE_KEY_ACTIVITIES = "nexora_activities_v3";
const LOCAL_STORAGE_KEY_NOTIFS = "nexora_notifications_v3";
const LOCAL_STORAGE_KEY_SHARED_BY = "nexora_shared_by_v3";
const LOCAL_STORAGE_KEY_DOWNLOADS = "nexora_downloads_v3";

export function StorageProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [files, setFiles] = useState<NexoraFile[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [sharedWithMe] = useState<SharedFileItem[]>([]);
  const [sharedByMe, setSharedByMe] = useState<SharedFileItem[]>([]);
  const [downloadedItems, setDownloadedItems] = useState<DownloadedItem[]>([]);
  const [showDownloadsDrawer, setShowDownloadsDrawer] = useState<boolean>(false);
  const [activeUpload, setActiveUpload] = useState<UploadProcessState | null>(null);
  const [previewFile, setPreviewFile] = useState<NexoraFile | null>(null);
  const [totalUsersCount, setTotalUsersCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Live Refresh from Supabase Database
  const refreshData = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);

    try {
      const [remoteFiles, remoteLogs, userCount] = await Promise.all([
        fetchFilesFromSupabase(user.id),
        fetchActivityLogsFromSupabase(user.id),
        fetchTotalUsersCount(),
      ]);

      setFiles(remoteFiles || []);
      setActivityLogs(remoteLogs || []);
      setTotalUsersCount(typeof userCount === "number" ? userCount : 0);
    } catch (err: any) {
      console.warn("StorageProvider live refresh notice:", err);
      setError(err?.message || "Could not sync live data");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Hydrate from localStorage once mounted (purging any legacy mock datasets)
  useEffect(() => {
    try {
      // Clear legacy mock keys if present
      ["nexora_files_v2", "nexora_user_v2", "nexora_activities_v2", "nexora_notifications_v2", "nexora_shared_by_v2"].forEach((k) => {
        localStorage.removeItem(k);
      });

      const storedFiles = localStorage.getItem(LOCAL_STORAGE_KEY_FILES);
      if (storedFiles) {
        const parsed = JSON.parse(storedFiles);
        if (Array.isArray(parsed)) {
          // Keep only non-mock files
          setFiles(parsed.filter((f) => !f.id?.startsWith("file-") || f.id.length > 10));
        }
      }

      const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed?.email && parsed.email !== "rahul.sahu@example.com" && parsed.id !== "usr_rahul_sahu_9482") {
          setUser(parsed);
        }
      }

      const storedLogs = localStorage.getItem(LOCAL_STORAGE_KEY_ACTIVITIES);
      if (storedLogs) {
        const parsed = JSON.parse(storedLogs);
        if (Array.isArray(parsed)) {
          setActivityLogs(parsed.filter((l) => !l.id?.startsWith("act-") || l.id.length > 10));
        }
      }

      const storedNotifs = localStorage.getItem(LOCAL_STORAGE_KEY_NOTIFS);
      if (storedNotifs) {
        const parsed = JSON.parse(storedNotifs);
        if (Array.isArray(parsed)) {
          setNotifications(parsed.filter((n) => !n.id?.startsWith("notif-") || n.id.length > 10));
        }
      }

      const storedShared = localStorage.getItem(LOCAL_STORAGE_KEY_SHARED_BY);
      if (storedShared) setSharedByMe(JSON.parse(storedShared));

      const storedDownloads = localStorage.getItem(LOCAL_STORAGE_KEY_DOWNLOADS);
      if (storedDownloads) setDownloadedItems(JSON.parse(storedDownloads));
    } catch {
      // Fallback to initial state
    } finally {
      setIsInitialized(true);
    }

    // Check active Supabase session
    getInitialSupabaseUser().then((supaUser) => {
      if (supaUser) setUser(supaUser);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const supaUser = await getInitialSupabaseUser();
        if (supaUser) setUser(supaUser);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Fetch Supabase data & listen to Real-Time Postgres updates
  useEffect(() => {
    if (!user?.id) return;
    refreshData();

    const creds = getSupabaseCredentials();
    if (!creds.isConfigured) return;

    // Real-time listener for files and activity logs
    const channel = supabase
      .channel(`realtime_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "files",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchFilesFromSupabase(user.id).then((remFiles) => {
            if (remFiles) setFiles(remFiles);
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "activity_logs",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchActivityLogsFromSupabase(user.id).then((remLogs) => {
            if (remLogs) setActivityLogs(remLogs);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refreshData]);

  // Sync to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_FILES, JSON.stringify(files));
      localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(user));
      localStorage.setItem(LOCAL_STORAGE_KEY_ACTIVITIES, JSON.stringify(activityLogs));
      localStorage.setItem(LOCAL_STORAGE_KEY_NOTIFS, JSON.stringify(notifications));
      localStorage.setItem(LOCAL_STORAGE_KEY_SHARED_BY, JSON.stringify(sharedByMe));
      localStorage.setItem(LOCAL_STORAGE_KEY_DOWNLOADS, JSON.stringify(downloadedItems));
    } catch {
      // Ignore storage quota
    }
  }, [files, user, activityLogs, notifications, sharedByMe, downloadedItems, isInitialized]);

  const logActivity = (
    action: ActivityLog["action"],
    description: string,
    fileName?: string
  ) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      action,
      description,
      file_name: fileName,
      created_at: new Date().toISOString(),
      ip_address: "192.168.1.45",
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 30) : "Browser",
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    if (user?.id) {
      insertActivityLogInSupabase(user.id, action, description, fileName);
    }
  };

  const addNotification = (notif: Omit<NotificationItem, "id" | "created_at">) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const downloadFile = async (file: NexoraFile) => {
    try {
      const blob = await downloadFileFromSupabase(file);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      const newItem: DownloadedItem = {
        id: `dl-${Date.now()}`,
        file,
        downloadedAt: new Date().toISOString(),
        blobUrl: url,
      };

      setDownloadedItems((prev) => [newItem, ...prev.filter((d) => d.file.id !== file.id)]);
      setShowDownloadsDrawer(true);

      logActivity("Download", `${file.name} downloaded successfully`, file.name);
      addNotification({
        type: "Upload Complete",
        title: "Download Finished",
        message: `${file.name} has been decrypted and saved to your device.`,
        read: false,
      });
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  const clearDownloads = () => {
    setDownloadedItems([]);
    setShowDownloadsDrawer(false);
  };

  const addFile = (newFile: NexoraFile) => {
    setFiles((prev) => [newFile, ...prev]);
    logActivity("Upload", `${newFile.name} uploaded successfully`, newFile.name);
    addNotification({
      type: "Upload Complete",
      title: "Upload Complete",
      message: `${newFile.name} has been processed, encrypted, and stored in Supabase.`,
      read: false,
    });
  };

  const deleteFile = async (id: string) => {
    const fileToDelete = files.find((f) => f.id === id);
    if (!fileToDelete) return;

    setFiles((prev) => prev.filter((f) => f.id !== id));
    logActivity("Delete", `Moved ${fileToDelete.name} to trash`, fileToDelete.name);

    if (user?.id) {
      deleteFileFromSupabase(fileToDelete);
    }
  };

  const renameFile = async (id: string, newName: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name: newName } : f))
    );
    logActivity("Rename", `Renamed file to ${newName}`, newName);

    if (user?.id) {
      renameFileInSupabase(id, newName);
    }
  };

  const toggleFileShare = (id: string, recipientEmail?: string) => {
    const targetFile = files.find((f) => f.id === id);
    if (!targetFile) return;

    const willBeShared = !targetFile.is_shared;

    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, is_shared: willBeShared } : f))
    );

    if (willBeShared) {
      const newSharedItem: SharedFileItem = {
        id: `sh-${Date.now()}`,
        file_id: targetFile.id,
        name: targetFile.name,
        size: targetFile.size,
        type: targetFile.type,
        shared_with: recipientEmail || "Shared via Link",
        shared_by: user.full_name,
        date: new Date().toISOString(),
        access: "Download",
        token: Math.random().toString(36).substring(2, 10),
      };
      setSharedByMe((prev) => [newSharedItem, ...prev]);
      logActivity("Share", `Created public link for ${targetFile.name}`, targetFile.name);
      addNotification({
        type: "Share Received",
        title: "Share Link Generated",
        message: `Public access link created for ${targetFile.name}`,
        read: false,
      });
    } else {
      setSharedByMe((prev) => prev.filter((s) => s.file_id !== id));
      logActivity("Share", `Revoked access to ${targetFile.name}`, targetFile.name);
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
    logActivity("Security", "Profile settings updated");
  };

  const resetToDefaults = () => {
    setFiles([]);
    setUser(initialUser);
    setActivityLogs([]);
    setNotifications([]);
    setSharedByMe([]);
    setDownloadedItems([]);
  };

  // Pure Live Dynamic Calculations from Actual Database Data
  const storageUsedBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);
  const totalOriginalBytes = files.reduce(
    (acc, f) => acc + (f.original_size || f.size || 0),
    0
  );
  const duplicateSavedBytes = Math.max(0, totalOriginalBytes - storageUsedBytes);
  const storageQuotaBytes = user.storage_quota || 100 * 1024 * 1024 * 1024;
  const storageUsedGB = Number((storageUsedBytes / (1024 * 1024 * 1024)).toFixed(2));
  const storagePercentage =
    storageQuotaBytes > 0
      ? Math.min(100, Math.round((storageUsedBytes / storageQuotaBytes) * 100))
      : 0;
  const totalFilesCount = files.length;
  const sharedFilesCount = files.filter((f) => f.is_shared).length + sharedByMe.length;

  return (
    <StorageContext.Provider
      value={{
        user,
        setUser,
        files,
        activityLogs,
        notifications,
        sharedWithMe,
        sharedByMe,
        downloadedItems,
        downloadFile,
        clearDownloads,
        showDownloadsDrawer,
        setShowDownloadsDrawer,
        activeUpload,
        setActiveUpload,
        previewFile,
        setPreviewFile,
        addFile,
        deleteFile,
        renameFile,
        toggleFileShare,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
        logActivity,
        updateProfile,
        storageUsedBytes,
        storageQuotaBytes,
        storageUsedGB,
        storagePercentage,
        duplicateSavedBytes,
        totalFilesCount,
        sharedFilesCount,
        totalUsersCount,
        isLoading,
        error,
        refreshData,
        resetToDefaults,
      }}
    >
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage() {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error("useStorage must be used within a StorageProvider");
  }
  return context;
}
