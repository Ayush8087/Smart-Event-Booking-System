Smart Event Booking System (Node/React + MySQL)

This repository contains a full‑stack event booking app. It is being implemented step‑by‑step.

Structure (work in progress):

- `server/` – Node.js + Express + MySQL backend
- `client/` – React frontend (to be scaffolded)
- `event_booking.sql` – MySQL schema (to be added)

Quick start (after steps are completed):

1) Backend
   - Copy `server/.env.example` to `server/.env` and set DB credentials
   - `cd server && npm install && npm run dev`

2) Frontend (coming in later steps)

Database setup (Aiven Cloud MySQL)

1. **Create an Aiven MySQL service:**
   - Go to https://console.aiven.io/
   - Create a new MySQL service
   - Note your connection details

2. **Set up your `.env` file in `server/` folder:**

   **Option A: Using connection string (recommended)**
   ```
   DATABASE_URL=mysql://avnadmin:yourpassword@your-project.aivencloud.com:12345/defaultdb?ssl-mode=REQUIRED
   PORT=4000
   ADMIN_KEY=devadmin123
   ```

   **Option B: Using individual parameters**
   ```
   DB_HOST=your-project.aivencloud.com
   DB_PORT=12345
   DB_USER=avnadmin
   DB_PASSWORD=yourpassword
   DB_NAME=defaultdb
   DB_SSL=true
   PORT=4000
   ADMIN_KEY=devadmin123
   ```

3. **Initialize the database:**
   - Connect to your Aiven MySQL instance
   - Run the SQL from `event_booking.sql` in your Aiven database
   - You can use Aiven's web console SQL editor or connect via MySQL client:
   ```bash
   mysql -h your-project.aivencloud.com -P 12345 -u avnadmin -p --ssl-mode=REQUIRED defaultdb < event_booking.sql
   ```

4. **Start the server:**
   ```bash
   cd server
   npm install
   npm run dev
   ```

5. **Test the connection:**
   - Visit `http://localhost:4000/api/health`
   - Should return `{"status":"ok","db":true}`

Windows note

- When running from PowerShell, prefer a `.env` file instead of inline env vars.


