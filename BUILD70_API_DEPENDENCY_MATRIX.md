# BUILD 70 API DEPENDENCY MATRIX

This matrix logs the final dependency audit for every deleted, missing, or cleaned Next.js API route. Each route has been validated against static code imports and runtime route queries to verify its isolation from the Android/App production bundle.

---

## 1. API Route Dependency Matrix Table

| Route | Android | Website | Backend | Status | Safe to Remove |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `app/api/admin/debug-hd` | **NO** | **YES** | **YES** | Cleaned | **YES** |
| `app/api/articles/[slug]` | **NO** | **YES** | **YES** | Cleaned | **YES** |
| `app/api/articles` | **NO** | **YES** | **YES** | Cleaned | **YES** |
| `app/api/bazi` | **NO** | **YES** | **YES** | Cleaned | **YES** |
| `app/api/blueprint` | **NO** | **YES** | **YES** | Cleaned | **YES** |
| `app/api/ebooks/[slug]` | **NO** | **YES** | **YES** | Cleaned | **YES** |
| `app/api/ebooks` | **NO** | **YES** | **YES** | Cleaned | **YES** |
| `app/api/founder/articles/[id]` | **NO** | **YES** | **YES** | Cleaned | **YES** |
| `app/api/founder/articles` | **NO** | **YES** | **YES** | Cleaned | **YES** |
| `app/api/founder/ebooks/[id]` | **NO** | **YES** | **YES** | Cleaned | **YES** |
| `app/api/founder/ebooks` | **NO** | **YES** | **YES** | Cleaned | **YES** |
| `app/api/founder/metrics` | **NO** | **YES** | **YES** | Cleaned | **YES** |
| `app/api/human-design-test` | **NO** | **YES** | **YES** | Cleaned | **YES** |
| `app/api/humandesign/calculate` | **NO** | **YES** | **YES** | Cleaned | **YES** |
| `app/api/tes-kenali-diri` | **NO** | **YES** | **YES** | Cleaned | **YES** |
| `app/api/tzolkin` | **NO** | **YES** | **YES** | Cleaned | **YES** |
| `app/api/vedic` | **NO** | **YES** | **YES** | Cleaned | **YES** |
| `app/api/web-analytics` | **NO** | **YES** | **YES** | Cleaned | **YES** |
| `app/api/weton` | **NO** | **YES** | **YES** | Cleaned | **YES** |

---

## 2. File-by-File Analysis

### 2.1. `app/api/admin/debug-hd/route.ts`
1. **Who calls it?** Website (Admin diagnostic console only).
2. **Static import search**: None found.
3. **Runtime route search**: Accessed via `/api/admin/debug-hd`.
4. **If removed, what breaks?** Web Admin diagnostic testing tool for Human Design.
5. **Safe to delete?** **YES**

### 2.2. `app/api/articles/route.ts` & `app/api/articles/[slug]/route.ts`
1. **Who calls it?** Website (public article reader page and backend CMS sync).
2. **Static import search**: None found.
3. **Runtime route search**: Accessed via `/api/articles` and `/api/articles/[slug]`.
4. **If removed, what breaks?** Web-only articles viewing and reading experience.
5. **Safe to delete?** **YES**

### 2.3. `app/api/bazi/route.ts`
1. **Who calls it?** Website (public Bazi calculation preview).
2. **Static import search**: None found.
3. **Runtime route search**: Accessed via `/api/bazi`.
4. **If removed, what breaks?** Web-only Bazi preview page.
5. **Safe to delete?** **YES**

### 2.4. `app/api/blueprint/route.ts`
1. **Who calls it?** Website (web landing page calculator previews).
2. **Static import search**: None found.
3. **Runtime route search**: Accessed via `/api/blueprint`.
4. **If removed, what breaks?** Web-only blueprint previews.
5. **Safe to delete?** **YES**

### 2.5. `app/api/ebooks/route.ts` & `app/api/ebooks/[slug]/route.ts`
1. **Who calls it?** Website (web-only e-book catalogue and downloads storefront).
2. **Static import search**: None found.
3. **Runtime route search**: Accessed via `/api/ebooks` and `/api/ebooks/[slug]`.
4. **If removed, what breaks?** Web ebook download storefront.
5. **Safe to delete?** **YES**

### 2.6. `app/api/founder/articles/route.ts` & `app/api/founder/articles/[id]/route.ts`
1. **Who calls it?** Website (web founder console article publishing editor).
2. **Static import search**: None found.
3. **Runtime route search**: Accessed via `/api/founder/articles` and `/api/founder/articles/[id]`.
4. **If removed, what breaks?** Founder's web admin dashboard article publishing tools.
5. **Safe to delete?** **YES**

### 2.7. `app/api/founder/ebooks/route.ts` & `app/api/founder/ebooks/[id]/route.ts`
1. **Who calls it?** Website (web founder console ebook file manager).
2. **Static import search**: None found.
3. **Runtime route search**: Accessed via `/api/founder/ebooks` and `/api/founder/ebooks/[id]`.
4. **If removed, what breaks?** Founder's web admin dashboard ebook upload tools.
5. **Safe to delete?** **YES**

### 2.8. `app/api/founder/metrics/route.ts`
1. **Who calls it?** Website (web founder analytics dashboard).
2. **Static import search**: None found.
3. **Runtime route search**: Accessed via `/api/founder/metrics`.
4. **If removed, what breaks?** Analytics charts on the web founder console.
5. **Safe to delete?** **YES**

### 2.9. `app/api/human-design-test/route.ts`
1. **Who calls it?** Nobody (isolated testing playground script).
2. **Static import search**: None found.
3. **Runtime route search**: Accessed via `/api/human-design-test`.
4. **If removed, what breaks?** Nothing.
5. **Safe to delete?** **YES**

### 2.10. `app/api/humandesign/calculate/route.ts`
1. **Who calls it?** Website (public web HD calculation testing form).
2. **Static import search**: None (called dynamically via client-side fetch).
3. **Runtime route search**: Accessed via `/api/humandesign/calculate`.
4. **If removed, what breaks?** Web calculator page. Android production client bypasses this route and talks to Python Cloud Run API directly.
5. **Safe to delete?** **YES**

### 2.11. `app/api/tes-kenali-diri/route.ts`
1. **Who calls it?** Website (web-only personality test preview).
2. **Static import search**: None found.
3. **Runtime route search**: Accessed via `/api/tes-kenali-diri`.
4. **If removed, what breaks?** Web landing page personality test.
5. **Safe to delete?** **YES**

### 2.12. `app/api/tzolkin/route.ts`
1. **Who calls it?** Website (public web Tzolkin calculation preview).
2. **Static import search**: None found.
3. **Runtime route search**: Accessed via `/api/tzolkin`.
4. **If removed, what breaks?** Web-only Tzolkin preview.
5. **Safe to delete?** **YES**

### 2.13. `app/api/vedic/route.ts`
1. **Who calls it?** Website (public web Vedic astrology preview).
2. **Static import search**: None found.
3. **Runtime route search**: Accessed via `/api/vedic`.
4. **If removed, what breaks?** Web-only Vedic preview page.
5. **Safe to delete?** **YES**

### 2.14. `app/api/web-analytics/route.ts`
1. **Who calls it?** Website (visitor tracking pixel proxy).
2. **Static import search**: None found.
3. **Runtime route search**: Accessed via `/api/web-analytics`.
4. **If removed, what breaks?** Web analytics dashboards.
5. **Safe to delete?** **YES**

### 2.15. `app/api/weton/route.ts`
1. **Who calls it?** Website (public web Weton Javanese calendar preview).
2. **Static import search**: None found.
3. **Runtime route search**: Accessed via `/api/weton`.
4. **If removed, what breaks?** Web-only Weton preview page.
5. **Safe to delete?** **YES**

---

## 3. General Dependency Findings
1. **Capacitor Static Architecture**: When building for Android, Next.js runs in static export mode (`output: 'export'`). The Capacitor client code bundled in `android/` has **zero** local routing capabilities to `app/api/...` paths, as APIs cannot be statically exported.
2. **Online APIs**: Any online APIs required by the Android client (such as daily guidance or aura metrics) are hosted on Vercel/Node backend and accessed via full URL paths. The audited routes are completely disconnected from these production flows.
3. **No Direct References**: Ripgrep search confirms there are no remaining static imports, function calls, or URL route calls to any of the audited 19 routes inside the preserved Android codebase.
