import { UserProfile, NexoraFile, ActivityLog, NotificationItem, SharedFileItem } from '@/types';

/**
 * NEXORA Real Data System
 * All datasets default to empty collections.
 * Real data is populated dynamically from Supabase database.
 */

export const initialUser: UserProfile = {
  id: '',
  email: '',
  full_name: 'Guest User',
  avatar_url: '',
  role: 'user',
  plan: 'Free Plan',
  storage_used: 0,
  storage_quota: 100 * 1024 * 1024 * 1024, // 100 GB default quota
  two_factor_enabled: false,
  created_at: new Date().toISOString(),
};

export const initialFiles: NexoraFile[] = [];

export const initialActivityLogs: ActivityLog[] = [];

export const initialNotifications: NotificationItem[] = [];

export const initialSharedWithMe: SharedFileItem[] = [];

export const initialSharedByMe: SharedFileItem[] = [];
