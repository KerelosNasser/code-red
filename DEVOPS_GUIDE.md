# 🚀 DARA DEPLOYMENT GUIDE (IDIOT-PROOF)

Follow these instructions EXACTLY. Do not skip steps or assume anything. You do NOT need to install Node, npm, or pnpm on the actual Hetzner server. Docker will handle everything internally.

## Prerequisites
You only need TWO things installed on the Hetzner VPS:
1. **Docker**
2. **Docker Compose**

---

## Step 1: Get the Code
Clone or copy the repository onto the Hetzner server.
```bash
git clone <repository_url> code-red
cd code-red
```

## Step 2: Set the Environment Variables
1. Copy the example environment file:
```bash
cp .env.example .env
```
2. Open `.env` and fill in the details. The default database credentials work automatically with Docker, but you MUST add the Admin phone numbers:
```env
NEXT_PUBLIC_ADMIN_PHONES="+1234567890,+0987654321"
```

## Step 3: Start the Servers
Run this exact command. Docker will automatically download the required Linux packages, install `npm`, use `npm` to install `pnpm`, install `FFmpeg` for video processing, and build the Next.js application.
```bash
docker-compose up -d --build
```

## Step 4: Push the Database Schema (CRITICAL!)
Once the containers are running, you must create the database tables. Run this exact command to push the Drizzle ORM schemas into PostgreSQL. **If you skip this, the app will crash.**
```bash
docker exec -it dara_app pnpm run db:push
```

## Step 5: Verify Everything is Working
Run `docker ps` to ensure you see exactly **4** containers running:
- `dara_app` (The Next.js website running on port 3000)
- `dara_worker` (The background video processor)
- `dara_postgres` (The Database)
- `dara_redis` (The Queue system for the videos)

---

## Testing the Code (Optional)
If you want to run the automated type-checks and linting rules before deploying, use the Testing Dockerfile:
```bash
# 1. Build the test image
docker build -t dara_test -f Dockerfile.test .

# 2. Run the tests
docker run dara_test
```
*If Step 2 finishes without errors, the code is perfectly clean and ready to deploy.*