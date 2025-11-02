# 🚀 Quick Setup - Run These Commands

## One-Step Setup (Recommended)

Just run this in your terminal:

```bash
./setup.sh
```

It will prompt for your password to:
1. Fix npm cache permissions
2. Install Docker Desktop
3. Install backend dependencies
4. Start PostgreSQL database

Then follow the on-screen instructions to start the app.

---

## Manual Setup (If setup.sh doesn't work)

### 1. Fix npm Cache

```bash
sudo chown -R 2121835035:1252520259 "/Users/ctw02526/.npm"
```

### 2. Install Docker

```bash
brew install --cask docker
```

Then:
- Open **Docker Desktop** from Applications
- Wait for Docker to start (whale icon in menu bar)

### 3. Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

### 4. Start PostgreSQL

```bash
docker compose up -d
```

Wait 10 seconds for initialization.

### 5. Start Backend Server

```bash
cd server
npm run dev
```

Keep this terminal open. You should see:
```
✅ Database connected successfully
🚀 Server running on http://localhost:3001
```

### 6. Start Frontend (New Terminal)

```bash
npm run dev
```

### 7. Open App

Navigate to: **http://localhost:8081/**

---

## Verify Everything Works

1. **Check database**: `docker compose logs postgres`
2. **Check backend API**: Open http://localhost:3001/health
3. **Check categories**: Open http://localhost:3001/api/categories

Should see 9 categories including Mercearia 🛒 and Restauração 🍽️

---

## Stop Everything

```bash
# Stop backend: Ctrl+C in server terminal
# Stop frontend: Ctrl+C in frontend terminal
# Stop database:
docker compose down
```

---

## Troubleshooting

**Port already in use?**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Kill process on port 8081
lsof -ti:8081 | xargs kill -9
```

**Docker not starting?**
- Make sure Docker Desktop app is running
- Check menu bar for whale icon
- Try: `docker ps` to verify Docker daemon is running

**npm cache still broken?**
```bash
# Try this alternative:
sudo npm cache clean --force
```

---

## 🎉 That's It!

Once running, you can:
- ✅ Add transactions (description is mandatory!)
- ✅ View transaction history
- ✅ Create budgets
- ✅ See dashboard with monthly stats

All data is stored in local PostgreSQL - no Supabase! 🎊
