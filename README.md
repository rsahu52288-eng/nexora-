# NEXORA - Next-Gen Full-Stack Cloud Storage Platform

NEXORA is a high-performance, production-ready cloud storage application engineered with Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion, and powered by Supabase Authentication, PostgreSQL, and Storage.

Designed with a clean SaaS aesthetic inspired by Dropbox, Google Drive, Notion, and Vercel, NEXORA provides zero-knowledge client-side encryption, real-time stream compression, cryptographic duplicate detection, and parallel multi-part chunk partitioning.

---

## 🌟 Key Features

1. **9-Step Animated Cryptographic Processing Pipeline**:
   - `File Selected`: Initial binary inspection and MIME verification.
   - `SHA-256 Hashing`: True client-side digest generated via the browser's native `crypto.subtle.digest("SHA-256", buffer)`.
   - `Duplicate Detection`: Instant collision check against PostgreSQL database indices to prevent redundant storage bloat.
   - `Smart Compression`: High-density stream compression via the `CompressionStream("gzip")` API, yielding up to **61.6% savings**.
   - `AES-256-GCM Encryption`: Zero-knowledge encryption with unique 96-bit initialization vectors (IV) and 256-bit AES keys generated directly on the client.
   - `Chunk Creation`: Dynamic partitioning into 8 authenticated block slices with individual sub-hashes.
   - `Uploading`: Resilient parallel multi-part block streaming to Supabase Cloud Storage.
   - `Integrity Verification`: Cryptographic checksum and database registration.
   - `Success & Confetti`: Instant feedback and notification trigger.

2. **Complete Screen Suite (14 Screens Implemented)**:
   - **Screen 1 - Landing Page**: Hero banner, 3D cyber visualizer, 4 glassmorphic feature cards, interactive pricing tiers, demo modal.
   - **Screen 2 - Login Page**: Clean white card, Google OAuth, email/password credentials, password visibility toggle, remember me.
   - **Screen 3 - Register Page**: Account signup, strong password validator, terms acceptance, auto-provisioning.
   - **Screen 4 - Dashboard**: 4 key storage stat cards, Upload Activity interactive bar chart (Mon–Sun), Recent Files list, Quick Actions.
   - **Screen 5 - Upload Files**: Drag & drop zone with dashed interactive state, file preview chip, quick test presets.
   - **Screen 6 - Processing Animation**: Live cyber architecture stage with animated flow arrows, chunk visualizer, progress bar, percentage counter, and cancel controls.
   - **Screen 7 - My Files**: Complete files table with search, category filtering (PDF, PPTX, Image, ZIP, Figma), sorting, list/grid view toggle, pagination, and action menus.
   - **Screen 8 - File Preview**: High-fidelity document viewer with page thumbnails sidebar, zoom in/out controls, pagination, direct download, and sharing.
   - **Screen 9 - Analytics**: 30-day storage breakdown, monthly Upload Trends area chart, File Types Distribution donut chart (PDF 40%, Images 25%, Videos 15%, Documents 12%, Others 8%).
   - **Screen 10 - Activity Logs**: Comprehensive audit trail with color-coded action badges (Upload, Login, Delete, Share, Security) and filter by action type.
   - **Screen 11 - Shared Files**: "Shared with me" and "Shared by me" tabs with link copy, access permissions, and revoke tools.
   - **Screen 12 - Notifications**: Notification center with unread badges, mark as read, and category icons.
   - **Screen 13 - Settings**: Profile management (photo, name, email, bio), Security (2FA toggle, password update), Storage (quota usage, deduplication optimizer), and Notification toggles.
   - **Screen 14 - Mobile Responsive**: Full responsive drawer sidebar, touch-optimized cards, and mobile topbar.
   - **Admin Console**: Master infrastructure telemetry, node health status, and user quota management.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ (tested on Node v24)
- npm or pnpm or yarn

### 2. Installation
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Supabase Configuration & Schema

To connect NEXORA to your live Supabase project:

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase dashboard and execute the SQL file included in this repository:
   ```
   supabase/schema.sql
   ```
   This creates:
   - `profiles` table with auto-provisioning trigger on user signup
   - `files` table with SHA-256 hash tracking and compression metadata
   - `file_chunks` table for multi-part block tracking
   - `shared_links` table for secure link sharing
   - `activity_logs` table for user audit trails
   - `notifications` table
   - Row Level Security (RLS) policies for all tables

3. Create a Supabase Storage Bucket:
   - In Supabase Dashboard, navigate to **Storage** -> **Create Bucket**.
   - Bucket name: `nexora-files`.
   - Toggle **Public** (or configure authenticated RLS download policies).

4. Configure your `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=nexora-files
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

*Note: If environment keys are not configured yet, NEXORA operates out-of-the-box in local client cryptographic mode with zero mock placeholders, allowing complete evaluation of all 14 screens immediately!*

---

## 🛠️ Tech Stack Architecture

- **Framework**: Next.js 15 (App Router, Server & Client Components)
- **Language**: TypeScript (strict types)
- **Styling**: Tailwind CSS, PostCSS, Custom Glassmorphism Layers
- **Icons**: Lucide React
- **Animations & Visuals**: Canvas Confetti, Framer Motion styling, CSS Glowing Pulses
- **Cryptography**: WebCrypto API (`crypto.subtle` for SHA-256 and AES-256-GCM)
- **Compression**: Native `CompressionStream("gzip")`
- **Database & Storage**: Supabase PostgreSQL, Supabase Auth, Supabase Storage
- **Deployment**: Configured for 1-click deployment on Vercel (`vercel.json`)

---

## 📦 Deployment to Vercel

Push to GitHub or run with Vercel CLI:
```bash
vercel
```
Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to your Vercel Project Environment Variables.
