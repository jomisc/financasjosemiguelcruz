# 🚀 Quick Start - PostgreSQL Migration

## Status: 70% Complete - Ready for Testing!

The core infrastructure is ready. Follow these steps to see the migrated application in action.

---

## ⚡ Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm run setup
```

### 2. Start PostgreSQL
```bash
npm run db:up
```

Wait 10 seconds for initialization.

### 3. Start Both Servers
```bash
npm run dev:all
```

###  4. Open Application
Navigate to: **http://localhost:8081/**

---

## ✅ What Works Now

- ✅ Dashboard with monthly stats
- ✅ Adding new transactions (with mandatory description)
- ✅ Budget progress tracking
- ✅ Default categories (9 total, including Mercearia 🛒 and Restauração 🍽️)
- ✅ API server on port 3001

---

## ⚠️ What Needs Manual Completion

Before the app is 100% functional, you need to update 2 more pages:

### 1. Transactions.tsx (~15 minutes)
Replace Supabase calls with API calls. See `MIGRATION_GUIDE.md` for details.

### 2. Budgets.tsx (~15 minutes)
Replace Supabase calls with API calls. See `MIGRATION_GUIDE.md` for details.

### 3. App.tsx (~5 minutes)
Remove `/auth` route and update routing.

---

## 🧪 Test Current Functionality

1. **View Dashboard** - Should load with empty stats
2. **Add Transaction**:
   - Click "Nova Transação"
   - Fill in: Description (required), Amount, Category, Date
   - Submit
   - Should redirect to dashboard
3. **Check API**:
   - Visit: http://localhost:3001/health
   - Should see: `{"status":"ok"}`
   - Visit: http://localhost:3001/api/categories
   - Should see 9 categories

---

## 📦 Migration Components Created

| Component | Status | Location |
|-----------|--------|----------|
| Docker Compose | ✅ Complete | `docker-compose.yml` |
| Database Schema | ✅ Complete | `database/init/01-schema.sql` |
| Seed Data | ✅ Complete | `database/init/02-seed.sql` |
| Express API | ✅ Complete | `server/index.js` |
| API Client | ✅ Complete | `src/lib/api.ts` |
| Dashboard | ✅ Complete | `src/pages/Dashboard.tsx` |
| Add Transaction | ✅ Complete | `src/pages/AddTransaction.tsx` |
| Transactions List | ⏳ Pending | `src/pages/Transactions.tsx` |
| Budgets | ⏳ Pending | `src/pages/Budgets.tsx` |

---

## 🎯 Next Actions

Choose one:

### Option A: Test What Works
1. Start the application
2. Add some transactions
3. View them on the dashboard
4. Note: "Ver Histórico" and "Gerir Orçamentos" buttons won't work yet

### Option B: Complete Migration
Follow the detailed instructions in `MIGRATION_GUIDE.md` to:
1. Update Transactions.tsx
2. Update Budgets.tsx
3. Update routing in App.tsx
4. Remove Supabase files

---

## 🛠️ Useful Commands

```bash
# Start database
npm run db:up

# Stop database
npm run db:down

# View database logs
npm run db:logs

# Start frontend only
npm run dev

# Start backend only
npm run dev:server

# Start both
npm run dev:all

# Connect to database
docker exec -it financas-postgres psql -U financas_user -d financas
```

---

## 🐛 Common Issues

**Port 5432 already in use?**
```bash
# Stop other PostgreSQL instances
brew services stop postgresql
# Or kill the process using port 5432
```

**API not connecting?**
- Check `.env` has `VITE_API_URL="http://localhost:3001/api"`
- Ensure backend is running on port 3001
- Check browser console for errors

**Database not initializing?**
```bash
# Reset everything
npm run db:down
docker volume rm financasjosemiguelcruz_postgres_data
npm run db:up
```

---

## 📖 Documentation

- **Full Details**: See `MIGRATION_GUIDE.md`
- **Original Codebase Docs**: See `CLAUDE.md`
- **Backend API**: Check `server/index.js` for all endpoints

---

**Ready to start!** Run `npm run db:up && npm run dev:all`
