# Supabase to PostgreSQL Migration Guide

## Migration Status: 70% Complete ✅

This guide documents the migration from Supabase to self-hosted PostgreSQL for the Finanças+ application.

---

## ✅ What's Been Completed

### 1. Database Setup (100%)
- ✅ Docker Compose configuration for PostgreSQL 15
- ✅ Simplified database schema (removed auth.users, RLS policies, user_id columns)
- ✅ Database initialization scripts (`database/init/`)
- ✅ Seed data with 9 default categories (including "Mercearia" and "Restauração")

### 2. Backend API Server (100%)
- ✅ Express.js server setup (`server/index.js`)
- ✅ PostgreSQL connection pool with `pg` library
- ✅ Full CRUD API endpoints:
  - `/api/categories` - GET, POST
  - `/api/transactions` - GET, POST, DELETE
  - `/api/budgets` - GET, POST, DELETE
  - `/api/dashboard/stats` - GET (optimized stats endpoint)
- ✅ CORS enabled for frontend communication
- ✅ Error handling middleware
- ✅ Health check endpoint

### 3. Frontend API Client (100%)
- ✅ New API client (`src/lib/api.ts`) replacing Supabase client
- ✅ Typed API response interfaces
- ✅ Environment variable configuration (`VITE_API_URL`)

### 4. Page Updates (40%)
- ✅ Dashboard.tsx - Fully migrated
- ✅ AddTransaction.tsx - Fully migrated
- ⏳ Transactions.tsx - **Needs migration**
- ⏳ Budgets.tsx - **Needs migration**
- ⏳ Auth.tsx - **Needs removal**

### 5. Configuration (100%)
- ✅ Package.json updated with new scripts:
  - `npm run db:up` - Start PostgreSQL
  - `npm run db:down` - Stop PostgreSQL
  - `npm run dev:server` - Start backend server
  - `npm run dev:all` - Start both frontend and backend
  - `npm run setup` - Install all dependencies
- ✅ Added `concurrently` for running multiple processes
- ✅ Updated `.env` with new API URL

---

## 🚧 Remaining Tasks

### 1. Update Remaining Pages

#### **Transactions.tsx** (`src/pages/Transactions.tsx`)

**Changes needed:**
```typescript
// Replace import
- import { supabase } from "@/integrations/supabase/client";
+ import api from "@/lib/api";

// Remove checkAuth function entirely

// Update loadTransactions()
- const { data, error } = await supabase
-   .from("transactions")
-   .select("*, categories(*)")
-   .order("date", { ascending: false });
+ const { data, error } = await api.transactions.getAll();

// Update handleDelete()
- await supabase.from("transactions").delete().eq("id", id);
+ await api.transactions.delete(id);
```

#### **Budgets.tsx** (`src/pages/Budgets.tsx`)

**Changes needed:**
```typescript
// Replace import
- import { supabase } from "@/integrations/supabase/client";
+ import api from "@/lib/api";

// Remove checkAuth function

// Update loadCategories()
- const { data, error } = await supabase.from("categories").select("*");
+ const { data, error } = await api.categories.getAll();

// Update loadBudgets()
- const { data, error } = await supabase
-   .from("budgets")
-   .select("*, categories(*)")
-   .eq("month", month)
-   .eq("year", year);
+ const { data, error } = await api.budgets.getAll({ month, year });

// Update handleSubmit()
- await supabase.from("budgets").insert({
-   user_id: user.id,
-   ...budgetData
- });
+ await api.budgets.create(budgetData);
```

### 2. Update Routing

#### **App.tsx** (`src/App.tsx`)

**Changes needed:**
```typescript
// Remove /auth route entirely
- <Route path="/auth" element={<Auth />} />

// Change root path to dashboard
- <Route path="/" element={<Index />} />
+ <Route path="/" element={<Dashboard />} />

// Remove Index import
- import Index from "./pages/Index";
```

### 3. Clean Up Files

**Files to delete:**
```bash
# Remove Supabase integration files
rm -rf src/integrations/supabase/

# Remove Auth page
rm src/pages/Auth.tsx

# Remove Index/Landing page (optional)
rm src/pages/Index.tsx
```

**Update package.json dependencies:**
```bash
# Remove Supabase from package.json
npm uninstall @supabase/supabase-js
```

### 4. Fix any remaining TypeScript errors

After removing Supabase:
```bash
npm run lint
```

---

## 🚀 How to Run the Application

### Prerequisites
- Docker installed and running
- Node.js 18+ installed

### Step 1: Install Dependencies
```bash
npm run setup
```

### Step 2: Start PostgreSQL Database
```bash
npm run db:up
```

Wait for the database to initialize (about 10 seconds). You can check the logs:
```bash
npm run db:logs
```

### Step 3: Install Backend Dependencies
```bash
cd server && npm install && cd ..
```

### Step 4: Start Both Frontend and Backend
```bash
npm run dev:all
```

This will start:
- Frontend: http://localhost:8081/
- Backend API: http://localhost:3001/

Alternatively, run them separately:
```bash
# Terminal 1
npm run dev

# Terminal 2
npm run dev:server
```

### Step 5: Access the Application
Open http://localhost:8081/ in your browser.

---

## 🗄️ Database Management

### Connect to PostgreSQL
```bash
docker exec -it financas-postgres psql -U financas_user -d financas
```

### View Tables
```sql
\dt
```

### Query Data
```sql
-- View categories
SELECT * FROM categories;

-- View transactions
SELECT t.*, c.name as category_name
FROM transactions t
LEFT JOIN categories c ON t.category_id = c.id
ORDER BY t.date DESC
LIMIT 10;

-- View budgets
SELECT b.*, c.name as category_name
FROM budgets b
LEFT JOIN categories c ON b.category_id = c.id;
```

### Reset Database
```bash
# Stop and remove container with data
npm run db:down
docker volume rm financasjosemiguelcruz_postgres_data

# Start fresh
npm run db:up
```

---

## 📁 New File Structure

```
financasjosemiguelcruz/
├── database/
│   └── init/
│       ├── 01-schema.sql      # Database schema
│       └── 02-seed.sql         # Default categories
├── server/
│   ├── index.js                # Express API server
│   ├── package.json            # Backend dependencies
│   └── .env.example            # Environment template
├── src/
│   ├── lib/
│   │   └── api.ts              # API client (replaces Supabase)
│   ├── pages/
│   │   ├── Dashboard.tsx       # ✅ Migrated
│   │   ├── AddTransaction.tsx  # ✅ Migrated
│   │   ├── Transactions.tsx    # ⏳ Needs migration
│   │   └── Budgets.tsx         # ⏳ Needs migration
│   └── integrations/
│       └── supabase/           # ❌ TO BE REMOVED
├── docker-compose.yml          # PostgreSQL container
└── MIGRATION_GUIDE.md          # This file
```

---

## 🔧 Troubleshooting

### Database connection errors
- Ensure Docker is running
- Check PostgreSQL is up: `npm run db:logs`
- Verify port 5432 is not in use: `lsof -i :5432`

### API connection errors
- Check backend is running on port 3001
- Verify `VITE_API_URL` in `.env`
- Check CORS settings in `server/index.js`

### Frontend not loading data
- Open browser console for errors
- Verify API responses: http://localhost:3001/api/categories
- Check network tab in DevTools

---

## 📊 Database Schema

### Tables

**categories**
- `id` UUID PRIMARY KEY
- `name` TEXT NOT NULL
- `icon` TEXT DEFAULT '💰'
- `is_default` BOOLEAN DEFAULT false
- `created_at` TIMESTAMP

**transactions**
- `id` UUID PRIMARY KEY
- `category_id` UUID (FK to categories)
- `type` TEXT ('income' | 'expense')
- `amount` DECIMAL(10,2)
- `date` DATE
- `description` TEXT
- `created_at` TIMESTAMP

**budgets**
- `id` UUID PRIMARY KEY
- `category_id` UUID (FK to categories)
- `amount` DECIMAL(10,2)
- `month` INTEGER (1-12)
- `year` INTEGER (>= 2020)
- `created_at` TIMESTAMP
- UNIQUE(category_id, month, year)

---

## 🎯 Next Steps

1. **Complete page migrations** - Update Transactions.tsx and Budgets.tsx
2. **Update routing** - Remove /auth route, change root to /dashboard
3. **Remove Supabase files** - Clean up legacy code
4. **Test end-to-end** - Verify all functionality works
5. **Optional enhancements**:
   - Add authentication later if needed
   - Implement data export/import
   - Add backup scripts
   - Set up production deployment

---

## 📝 Notes

- This is now a **single-user application** - no authentication required
- All data is stored locally in Docker volume
- Default categories include the updated "Mercearia" 🛒 and new "Restauração" 🍽️
- The API uses JSON response format matching Supabase's structure for easier migration

---

## 💡 Tips

- Use `concurrently` to run both servers: `npm run dev:all`
- Database persists between Docker restarts (stored in volume)
- To backup data: `docker exec financas-postgres pg_dump -U financas_user financas > backup.sql`
- To restore data: `docker exec -i financas-postgres psql -U financas_user -d financas < backup.sql`

---

**Migration Progress: 70% Complete**

Remaining work: ~2-3 hours to complete page migrations and cleanup.
