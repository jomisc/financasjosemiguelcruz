# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Finanças+** is a personal finance management application built with React, TypeScript, Vite, and Supabase. Users can track income/expenses, manage budgets, and organize transactions by category.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (port 8080)
npm run dev

# Build for production
npm run build

# Build in development mode
npm run build:dev

# Lint code
npm run lint

# Preview production build locally
npm run preview
```

## Architecture

### Tech Stack
- **Frontend**: React 18.3, TypeScript 5.8, Vite 5.4
- **Routing**: React Router v6
- **Backend**: Supabase (PostgreSQL with Row-Level Security)
- **UI**: shadcn/ui (50+ components), Radix UI, Tailwind CSS
- **State**: Local component state + TanStack React Query
- **Forms**: React Hook Form + Zod validation
- **Icons**: lucide-react
- **Charts**: Recharts

### Project Structure

```
src/
├── pages/              # Route-based page components
│   ├── Index.tsx       # Landing page
│   ├── Auth.tsx        # Login/Register
│   ├── Dashboard.tsx   # Main dashboard with stats
│   ├── AddTransaction.tsx
│   ├── Transactions.tsx
│   └── Budgets.tsx
├── components/
│   └── ui/             # shadcn UI components (auto-generated)
├── integrations/supabase/
│   ├── client.ts       # Supabase client initialization
│   └── types.ts        # Auto-generated DB types
├── hooks/              # Custom React hooks
└── lib/utils.ts        # Utility functions (cn)

supabase/
└── migrations/         # Database schema migrations
```

### Routing

Routes defined in `App.tsx`:
- `/` - Landing page
- `/auth` - Authentication (login/register)
- `/dashboard` - Main dashboard with financial overview
- `/add-transaction` - Create new transaction
- `/transactions` - View all transactions
- `/budgets` - Manage category budgets

All pages check authentication; unauthenticated users redirect to `/auth`.

### Database Schema

**Key Tables** (all have RLS policies for user isolation):

1. **profiles** - User metadata (first_name, last_name, currency_preference)
2. **categories** - Expense/income categories with icons (8 defaults auto-created)
3. **transactions** - Financial transactions (type: income/expense, amount, category_id, date)
4. **budgets** - Monthly budget limits per category (unique constraint on user_id + category_id + month + year)

**Important Functions**:
- `create_default_categories(user_id)` - Creates 8 default categories for new users
- `handle_new_user()` - Trigger that auto-creates profile on signup

**Relationships**:
- All tables have `user_id` FK to `auth.users` (multi-tenancy)
- Transactions optionally link to categories (FK ON DELETE SET NULL)
- RLS policies enforce: `auth.uid() = user_id` on all operations

### Authentication

- **Provider**: Supabase Auth (email/password)
- **Session**: Stored in localStorage with auto-refresh
- **Flow**: Sign up → profile auto-created → default categories created on first dashboard load
- **OAuth**: Google/Apple buttons present but not yet implemented

### Data Fetching Pattern

```typescript
// Standard pattern across all pages
useEffect(() => {
  checkUser();
  loadData();
}, []);

const checkUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) navigate("/auth");
};

const loadData = async () => {
  const { data, error } = await supabase
    .from("table_name")
    .select("*, relation(*)")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (data) setState(data);
};
```

### UI Component Usage

Import shadcn components from `@/components/ui/`:

```typescript
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem } from "@/components/ui/select";
```

All styling uses Tailwind CSS with design tokens defined in `index.css`.

## Configuration Files

- **vite.config.ts**: Path alias `@/` → `src/`, port 8080, SWC plugin
- **tsconfig.json**: Relaxed type checking (strict: false), path aliases
- **tailwind.config.ts**: Custom color palette (HSL format), dark mode support
- **.env**: Supabase credentials (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)

## Key Patterns

### Creating New Pages

1. Create component in `src/pages/[PageName].tsx`
2. Add route to `App.tsx`
3. Implement `checkUser()` for auth protection
4. Use `useEffect` for data loading
5. Import shadcn components from `@/components/ui/`

### Database Operations

```typescript
// Always scope to current user
const { data: { session } } = await supabase.auth.getSession();

// Insert
await supabase.from("table").insert({
  user_id: session.user.id,
  ...otherFields
});

// Query with joins
await supabase
  .from("transactions")
  .select("*, categories(*)")
  .eq("user_id", session.user.id);
```

### Form Handling

Use React Hook Form + Zod for validation (see AddTransaction.tsx for example).

## Supabase Integration

**Environment Variables Required**:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

**Client Initialization**: `src/integrations/supabase/client.ts`

**Type Generation**: Run Supabase CLI to regenerate `types.ts` after schema changes.

## Important Notes

- **Security**: All data access enforced by RLS policies at database level
- **Multi-tenancy**: User isolation via `user_id` on all tables
- **State Management**: No global state manager; uses local component state
- **TypeScript**: Relaxed mode (noImplicitAny: false, strictNullChecks: false)
- **Port**: Dev server runs on 8080 (configured in vite.config.ts)
- **Path Alias**: Use `@/` to import from `src/` directory

## Current Feature Status

**Implemented**:
- User authentication (email/password)
- Transaction creation and management (income/expense)
- Category system with default categories
- Budget creation per category/month
- Dashboard with financial overview
- Transaction listing and deletion

**In Development**:
- Social authentication (Google/Apple)
- Budget vs actual reporting
- Transaction editing
- Advanced filtering/search
- Recurring transactions
- Data export
