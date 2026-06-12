# Implementation Plan

Four feature areas. I'll build them in order so each is shippable on its own.

## 1. Admin access control (max 2 admins + block/unblock)

**Database**
- New table `admin_settings` (singleton row): `max_admins` (default 2), `updated_by`, `updated_at`.
- Add `is_blocked` (bool) and `blocked_by` columns to `user_roles` for `admin` rows.
- Update `handle_new_user()` trigger: if admin count (non-blocked) is already `>= max_admins`, the new user becomes a `user`, not an `admin`. First user is still admin.
- New RPC `admin_block_user(target_user_id, blocked)` — only callable by an active admin; cannot block self; sets `is_blocked`.
- New RPC `admin_set_max(n)` — only callable by active admin, allows values 1 or 2.
- Update `has_role(...)` to return false when the admin row is blocked.

**App behavior**
- A blocked admin: `_authenticated/route.tsx` still allows sign-in, but `/admin` shows "Your admin access has been locked by another admin" and a Sign Out button.
- New tab in admin dashboard: **Admins** — lists all admins with Block / Unblock buttons + slider "Max admins: 1 or 2".

## 2. Blog / Posts CMS with likes

**Database**
- `posts` table: `title`, `slug` (unique), `excerpt`, `cover_image_url`, `body_markdown`, `published`, `published_at`, `author_id`, `view_count`.
- `post_likes` table: `post_id`, `liker_fingerprint` (anonymous, stored in localStorage), unique on `(post_id, liker_fingerprint)`. Anonymous likes allowed.
- RLS: anyone reads published posts; admins manage all; anyone inserts a like (rate limited by unique constraint).

**Routes**
- `/blog` — public list of published posts, with like counts.
- `/blog/$slug` — single post, SEO `head()` with og:image from `cover_image_url`, like button.
- Admin tab **Posts** — create/edit/delete, upload cover image to `gallery` bucket, toggle publish.
- Homepage: "Latest posts" strip with 3 most recent.

## 3. Recipes

Recipes are essentially specialized posts. I'll reuse the posts table with a `kind` column (`post` | `recipe`) plus optional recipe fields: `ingredients` (text), `instructions` (text), `prep_time_minutes`, `difficulty`. Routes `/recipes` and `/recipes/$slug`. Admin tab **Recipes** with a recipe-specific form.

## 4. Paid PDF downloads ("Premium recipes")

**Payments**
- Use Lovable's built-in Stripe payments (recommend_payment_provider → enable_stripe_payments). Digital downloads fit Stripe well.
- After enabling, I'll wire a "Premium PDFs" tab in admin.

**Database**
- `premium_pdfs` table: `title`, `description`, `cover_image_url`, `pdf_storage_path`, `price_cents`, `currency`, `is_active`.
- `pdf_purchases` table: `pdf_id`, `buyer_email`, `stripe_session_id`, `status`, `download_token`, `expires_at`.
- New private storage bucket `premium-pdfs` (admin-only direct access).

**Flow**
- Public `/shop` page lists active PDFs with "Buy for $X" button.
- Click → server fn creates Stripe Checkout session, redirects to Stripe.
- Stripe webhook (`/api/public/webhooks/stripe`) verifies signature, marks purchase paid, emits a one-time `download_token`.
- Success page `/shop/success?token=...` shows download button → server fn streams signed URL from `premium-pdfs` bucket.

## Build order (each step is independently shippable)

1. **Admin access control + Admins tab** (~security, ship first)
2. **Blog CMS + likes** (public `/blog` + admin tab)
3. **Recipes** (reuse posts schema)
4. **Paid PDFs** (Stripe + storage + shop)

## Things to confirm before I start coding

- (Q1) Stripe payments — OK to enable Lovable's built-in Stripe? It needs a quick one-time form (email, business name). Without it I can't build the paid-PDF feature; I'd stop after recipes.
- (Q2) For the homepage, should I link Blog and Recipes in the top nav, or keep nav minimal and link them from the hero only?

If you say "go" I'll start with step 1 (admin access control) right away and ask Q1 again when we reach step 4.
