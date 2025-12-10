# Supabase Integration - Setup Guide

## Quick Start

Integrasi Supabase untuk personal blog sudah selesai! Ikuti langkah-langkah berikut untuk menjalankan aplikasi.

## Prerequisites

- ✅ Node.js dan npm sudah terinstall
- ✅ Akun Supabase (gratis di [supabase.com](https://supabase.com))
- ✅ SQL setup sudah dijalankan di Supabase

## Setup Steps

### 1. Pastikan Environment Variables Sudah Diset

File `.env` harus berisi:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Cara mendapatkan credentials:**
1. Buka Supabase Dashboard
2. Pilih project Anda
3. Klik **Settings** → **API**
4. Copy **Project URL** dan **anon/public key**

### 2. Install Dependencies (Sudah Selesai)

```bash
npm install
```

Package `@supabase/supabase-js` sudah terinstall.

### 3. Jalankan Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

## Fitur yang Sudah Terintegrasi

### ✅ Blog Management
- Create, Read, Update, Delete blog posts
- Upload gambar ke Supabase Storage
- Kategori dan tags
- Publish/Draft status
- Search dan filter

### ✅ Tutorial Management
- Create, Read, Update, Delete tutorials
- Tutorial steps (multi-step guides)
- Premium unlock system
- Difficulty levels

### ✅ Settings Management
- Hero section customization
- Profile information
- Social links management
- Site configuration
- Portfolio projects

### ✅ Image Upload
- Upload gambar ke Supabase Storage bucket `blog-images`
- Automatic image cleanup on delete
- CDN URLs untuk performa optimal

## Database Schema

Semua tabel sudah dibuat melalui `supabase_setup.sql`:

- `blog_posts` - Blog posts dengan featured images
- `tutorials` - Tutorial guides
- `tutorial_steps` - Steps untuk setiap tutorial
- `settings` - Site configuration (JSONB)
- `social_links` - Social media links
- `tutorial_unlocks` - Premium tutorial unlock tracking

## Testing

### Test Blog Features
1. Buka `/dashboard/posts`
2. Klik **New Post**
3. Isi form dan upload gambar
4. Save dan verify di Supabase dashboard

### Test Public Pages
1. Buka `/` (homepage)
2. Buka `/blog` (blog list)
3. Klik salah satu post
4. Test search dan filter

### Test Settings
1. Buka `/dashboard/settings`
2. Update hero section
3. Refresh homepage dan lihat perubahan

## File Structure

```
src/
├── lib/
│   └── supabaseClient.js      # Supabase client config
├── services/
│   ├── blogService.js         # Blog CRUD operations
│   ├── tutorialService.js     # Tutorial CRUD operations
│   └── settingsService.js     # Settings management
├── hooks/
│   └── useData.js             # Custom React hooks
└── pages/
    ├── public/                # Public pages (async)
    └── dashboard/             # Dashboard pages (async)
```

## Important Changes

### Field Names (localStorage → Supabase)
- `createdAt` → `created_at`
- `updatedAt` → `updated_at`
- `featuredImage` → `featured_image`
- `isPremium` → `is_premium`

### All Services Now Async
Semua service functions sekarang menggunakan `async/await`:
```javascript
// Before (localStorage)
const posts = getAllPosts();

// After (Supabase)
const posts = await getAllPosts();
```

### React Components
Components menggunakan custom hooks:
```javascript
import { usePosts, useSettings } from '../hooks/useData';

const { posts, loading } = usePosts(true);
const { settings, loading } = useSettings();
```

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Check file `.env` ada dan berisi credentials yang benar
- Restart dev server setelah update `.env`

### Data tidak muncul
- Pastikan SQL setup sudah dijalankan
- Check Supabase dashboard untuk verify data
- Check browser console untuk errors

### Image upload gagal
- Verify storage bucket `blog-images` exists
- Check storage policies di Supabase dashboard

## Next Steps

1. ✅ Semua fitur sudah terintegrasi dengan Supabase
2. 🧪 Test semua fitur secara menyeluruh
3. 🔐 (Optional) Tambahkan authentication untuk dashboard
4. 🚀 Deploy ke production (Vercel/Netlify)

## Support

Jika ada masalah, check:
1. Browser console untuk errors
2. Supabase dashboard logs
3. Network tab untuk failed requests

---

**Status**: ✅ Integration Complete
**Database**: PostgreSQL (Supabase)
**Storage**: Supabase Storage
**Ready for**: Production Deployment
