# BrandGuard

BrandGuard is a brand-compliance audit dashboard for franchise networks. Signed-in users can add, edit, and delete franchise locations and score them across five categories — signage, cleanliness, color compliance, merchandising, and safety — to track overall brand adherence.

## What it does

- **Authentication**: Email/password sign-up and login powered by Supabase Auth.
- **Location management**: Create, read, update, and delete franchise locations.
- **Scoring**: Each location is scored 0–100 across five brand-compliance categories.
- **Overall compliance**: Dashboard cards display an automatically calculated overall score and color-coded health indicator.
- **Analytics**: Page views and a custom `audit_logged` event are sent to PostHog when a new location is saved.

## Tech stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (full-stack React 19 with SSR)
- **Build tool**: [Vite](https://vitejs.dev/)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com/) components
- **Database & Auth**: Supabase (PostgreSQL + Row Level Security + Auth)
- **State / Data fetching**: TanStack Query
- **Forms & validation**: React Hook Form + Zod
- **Analytics**: PostHog (`posthog-js`)
- **Package manager**: Bun

## Prerequisites

- [Bun](https://bun.sh/) installed
- A Supabase project (or access to the existing project credentials)
- (Optional) A PostHog project if you want analytics to work locally

## Local development

### 1. Clone the repository

```bash
git clone https://github.com/<your-org>/brandguard.git
cd brandguard
```

### 2. Install dependencies

```bash
bun install
```

### 3. Set environment variables

Copy the example environment file and fill in your Supabase credentials:

```bash
cp .env .env.local
```

Then edit `.env.local` with your values. The required variable names are:

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL (used by the browser client) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anonymous/public API key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID |
| `SUPABASE_URL` | Same Supabase URL (used during SSR / server functions) |
| `SUPABASE_PUBLISHABLE_KEY` | Same Supabase public key (used during SSR / server functions) |
| `SUPABASE_PROJECT_ID` | Same Supabase project ID |

Example:

```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
VITE_SUPABASE_PROJECT_ID="your-project-id"

SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_PUBLISHABLE_KEY="your-anon-key"
SUPABASE_PROJECT_ID="your-project-id"
```

> **Note**: This project uses Lovable Cloud / Supabase for the backend. If you are running it against your own Supabase project, make sure the `locations` table exists with the columns used by the app: `id`, `user_id`, `name`, `signage`, `cleanliness`, `color_compliance`, `merchandising`, `safety`, and `created_at`. Enable Row Level Security and add policies so users can only access their own rows.

### 4. Start the dev server

```bash
bun dev
```

The app will be available at `http://localhost:8080` by default.

### 5. Build for production (optional)

```bash
bun run build
```

Preview the production build:

```bash
bun run preview
```

## Available scripts

| Script | Command | Description |
|--------|---------|-------------|
| Dev server | `bun dev` | Start Vite in development mode |
| Build | `bun run build` | Build for production |
| Build (dev mode) | `bun run build:dev` | Build in development mode |
| Preview | `bun run preview` | Preview the production build |
| Lint | `bun run lint` | Run ESLint |
| Format | `bun run format` | Format code with Prettier |

## Project structure

```text
src/
├── components/        # Reusable UI components (shadcn/ui + custom)
├── hooks/               # Custom React hooks
├── integrations/        # Supabase client, types, auth middleware
├── lib/                 # Utility modules (PostHog init, error capture, etc.)
├── routes/              # TanStack Start file-based routes
│   ├── __root.tsx       # Root layout
│   ├── auth.tsx         # Login / sign-up page
│   ├── _authenticated/  # Protected routes
│   │   ├── route.tsx    # Auth layout guard
│   │   └── dashboard.tsx# Main dashboard
│   └── index.tsx        # Home redirect
├── router.tsx           # Router configuration
└── styles.css           # Tailwind v4 theme and global styles
```

## Analytics

PostHog is initialized in `src/lib/posthog.ts` and started once in `src/routes/__root.tsx` with automatic pageview tracking. When a user successfully saves a new location, an `audit_logged` event is captured with the location name:

```ts
posthog.capture("audit_logged", { location_name: values.name });
```

## License

[MIT](LICENSE)
