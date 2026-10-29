# فَهْم | Fahm

Arabic-first (RTL) learning platform for Mathematics and English. Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + Prisma.

## Run locally

Requires Node 22.9+ and a MySQL (or MariaDB) database.

```bash
npm install
cp .env.example .env        # set DATABASE_URL; optionally ADMIN_EMAIL / ADMIN_PASSWORD
npm run setup               # creates the tables and seeds subjects + 8 courses (+ admin if set)
npm run dev                 # http://localhost:3000 → redirects to /ar
```

Production: `npm run build && npm start`. The build also runs `prisma db push` and the seed, so a fresh database gets its tables and courses on the first deploy. `db push` refuses changes that would drop data.

### Hostinger (Node.js Web App)

Import the repo from GitHub (branch `main`, Node 22+, build `npm run build`, start `npm start`, output `.next`). Create a MySQL database in hPanel and set the environment variables below in the app's settings. Use `127.0.0.1` as the host, not `localhost` (Node resolves `localhost` to IPv6, which Hostinger MySQL rejects), and the full prefixed names, e.g. `mysql://u123456789_fahm:PASSWORD@127.0.0.1:3306/u123456789_fahm`. URL-encode special characters in the password.

Hostinger shared hosting caps the account at ~120 threads while reporting 48 cores, and most tools size their thread pools to the core count. So `build` and `start` export small `RAYON_NUM_THREADS`/`TOKIO_WORKER_THREADS`/`TURBO_TASKS_AVAILABLE_PARALLELISM`/`UV_THREADPOOL_SIZE` values, `next.config.ts` sets `experimental.cpus: 1`, `src/lib/db.ts` caps Prisma's pool, and the production build uses webpack (`next build --webpack`) because Turbopack's PostCSS worker processes can't start under that cap. `next dev` still uses Turbopack.

| Script | What it does |
| --- | --- |
| `npm run lint` | ESLint (next core-web-vitals + typescript) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Assertion checks for answer grading (`src/lib/grading.check.ts`) |
| `npm run db:seed` | Idempotent seed: skips existing courses so student progress is never wiped |

## Environment variables

| Name | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | `mysql://USER:PASSWORD@HOST:3306/DATABASE`. |
| `NEXT_PUBLIC_SITE_URL` | yes in prod | Canonical URLs, sitemap, Open Graph. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | no | `db:seed` creates or promotes this account to ADMIN. |

No third-party secrets are needed. Nothing secret is exposed to the client.

## Routes

| Route | Access |
| --- | --- |
| `/ar` | Home |
| `/ar/courses` | Listing: search (`q`), `subject`, `level`, `difficulty`, `type`, `price`, `sort`. All in the URL, so it works without JS. |
| `/ar/courses/[slug]` | Course details, curriculum, enrollment, rating, FAQ, related courses |
| `/ar/learn/[slug]/[lessonId]` | Lesson player. Preview lessons are open to everyone; the rest need enrollment. |
| `/ar/dashboard`, `/ar/account` | Student only (redirects to login) |
| `/ar/login`, `/ar/register`, `/ar/forgot-password`, `/ar/reset-password` | Auth |
| `/ar/admin`, `/ar/admin/courses/[id]` | ADMIN only |
| `/ar/how-it-works`, `/ar/about`, `/ar/faq`, `/ar/contact`, `/ar/privacy`, `/ar/terms` | Content |
| `/sitemap.xml`, `/robots.txt` | SEO |

## Architecture

```
prisma/schema.prisma     data model (users, sessions, subjects, courses, sections, lessons, progress, quizzes, favorites, reviews, contact)
prisma/seed.ts           demo content (marked isDemo, shown with a "تجريبي" badge)
src/lib/auth.ts          scrypt password hashing, DB-backed sessions (httpOnly cookie, only a hash stored), role guards
src/lib/actions.ts       all mutations as server actions: zod validation + server-side authorization
src/lib/courses.ts       read side: summaries, search/filter/sort, course detail, lesson access rules
src/lib/grading.ts       answer grading shared by the exercise UI and the server (scores are re-graded server-side)
src/components/          CourseCard, CourseFilters, Exercise, MathText (KaTeX), header/footer…
```

* **Roles:** `STUDENT` (default), `INSTRUCTOR`, `ADMIN`. Guests are unauthenticated visitors. Admins can change roles at `/ar/admin`.
* **Course states:** `DRAFT`, `PUBLISHED`, `ARCHIVED`. Only published courses are listed or openable by students.
* **Exercises:** `mcq` (incl. reading passages and listening via browser speech synthesis), `numeric` (accepts `3/4`, `0.75`, Arabic-Indic digits), `fill`, `match`, `order`. Stored as JSON on the lesson.
* **New subjects:** add a `Subject` row. Filters, tabs and cards pick it up automatically. Add an icon and cover theme in `SubjectIcon.tsx` / `CourseCover.tsx` (there's a generic fallback).

## Not implemented yet

* **Email delivery.** Password-reset links are printed to the server console (`[password reset] …`). Wire an email provider in `forgotPassword` (`src/lib/actions.ts`).
* **Payments.** Paid courses show prices, but enrolling is free (labelled "demo mode" on the course page).
* **Video hosting and secure media.** Lessons support `videoUrl`, but no videos or upload/signed-URL pipeline exist. Demo lessons are text with math.
* **Content editing UI** for sections, lessons, exercises and file uploads. The admin can edit course metadata, status, price, instructor and thumbnail URL; the curriculum is edited via the seed or DB.
* **Instructor tools.** The role exists and can be assigned to courses; there is no instructor dashboard yet.
* **Login rate limiting / account lockout.**
* **English (`/en`) version.** UI uses logical (start/end) CSS so it will flip, but routes are `app/ar/*` and strings are inline Arabic. Next step: move to `app/[lang]` and add a dictionary.
* **Parent accounts, reviews with text, certificates.**
* **Legal pages** are clearly marked drafts and need legal review.
* Listing filters run in memory over published courses. That's fine for hundreds of courses; switch to SQL filtering and pagination beyond that.
