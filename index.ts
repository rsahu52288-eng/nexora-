export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  role: 'user' | 'admin';
  plan: 'Free Plan' | 'Pro Plan' | 'Enterprise';
  storage_used: number; // in bytes
  storage_quota: number; // in bytes (e.g. 100 GB)
  two_factor_enabled?: boolean;
  created_at?: string;
}

export type FileCategory = 'PDF' | 'PPTX' | 'Image' | 'ZIP' | 'Video' | 'Audio' | 'Document' | 'Figma' | 'Other';

export interface NexoraFile {
  id: string;
  user_id?: string;
  name: string;
  size: number; // Stored bytes (e.g. 48.3 MB)
  original_size: number; // Raw bytes (e.g. 125.8 MB)
  type: FileCategory;
  mime_type: string;
  hash: string; // SHA-256 hash string
  encryption_algorithm: string; // e.g. "AES-256-GCM"
  is_compressed: boolean;
  compression_ratio: number; // e.g. 61.6 (%)
  chunks_count: number;
  storage_path: string;
  public_url?: string; // Supabase Storage public access URL
  thumbnail_url?: string; // Thumbnail preview URL
  status: 'active' | 'trash' | 'archived';
  is_shared: boolean;
  created_at: string;
  updated_at?: string;
  shared_count?: number;
  data_url?: string; // For previews if loaded in memory or base64 cache
}

export type ActivityAction = 'Upload' | 'Login' | 'Delete' | 'Share' | 'Security' | 'Download' | 'Rename';

export interface ActivityLog {
  id: string;
  action: ActivityAction;
  description: string;
  file_name?: string;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

export type NotificationType =
  | 'Upload Complete'
  | 'Duplicate Detected'
  | 'Storage Warning'
  | 'Security Alert'
  | 'Share Received';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface SharedFileItem {
  id: string;
  file_id: string;
  name: string;
  size: number;
  type: FileCategory;
  shared_with: string;
  shared_by: string;
  date: string;
  access: 'View' | 'Download' | 'Full Access';
  token: string;
  public_url?: string;
  thumbnail_url?: string;
}

export type PipelineStepId =
  | 'selected'
  | 'hashing'
  | 'duplicate_check'
  | 'compressing'
  | 'encrypting'
  | 'chunking'
  | 'uploading'
  | 'verification'
  | 'complete';

export interface PipelineStep {
  id: PipelineStepId;
  label: string;
  shortName: string;
  iconName: string;
  status: 'pending' | 'active' | 'completed' | 'skipped' | 'duplicate_found';
  details?: string;
  progress?: number; // 0 to 100 for current sub-step
}

export interface UploadProcessState {
  file: File | null;
  currentStepIndex: number;
  overallProgress: number; // 0 to 100
  hash: string;
  isDuplicate: boolean;
  originalSize: number;
  compressedSize: number;
  compressionSavedPercent: number;
  chunksCount: number;
  statusText: string;
  isCompleted: boolean;
  isCancelled: boolean;
  error?: string;
}
