================================================================================
      Centralized City Problem Reporting Platform - Setup & Run Guide
================================================================================

Admin Credentials
----------------
   Default admin credentials created:
     Username: admin
     Password: admin123


Tools Needed on Your Computer
-----------------------------
1. Node.js (v18 or higher)           → https://nodejs.org/
2. MySQL Server & MySQL Workbench    → https://dev.mysql.com/downloads/
3. Code editor (VS Code recommended) → https://code.visualstudio.com/

Project Folder Structure (important!)
-------------------------------------
Centralized-City-Project/
├── backend/
│   ├── node_modules/
│   ├── uploads/                   
│   ├── server.js                 ← change the DB password here
│   ├── package.json
│   └── .env                       ← change the DB password here
└── frontend/


Step-by-Step Setup Instructions
===============================

1. Setup Database (very important!)
   • Open MySQL Workbench
   • Create new schema (or use query tab)
   • Copy-paste the entire SQL code from SQL.sql file (or the one below)
   • Run the script (lightning bolt icon)
   • You should see database "city_problems_reporting" created with tables

   If your MySQL root password is different from 'root123':
   → Open backend/server.js
   → Change :
       password: 'root123',
       to your actual password

3. Backend Setup
   • Open terminal/command prompt
   • Go to backend folder:
       cd backend
   • Start backend:
       npm run dev
   • You should see:
       Connected to MySQL Database.
       Server running on port 3000

   Test: open browser → http://localhost:3000/api/data
   → You should see JSON output (even if empty arrays)

4. Frontend Setup
   • Open new terminal
   • Go to frontend folder:
       cd frontend
   • Start frontend:
       npm run dev
   • Open browser → http://localhost:5173 (or the port shown)

5. Full Test Flow
   1. Go to http://localhost:5173
   2. Click "Get Started / Login" → login page
   3. Login with: admin / admin123 → goes to supervisor dashboard
   4. Register new citizen/worker → go to /register
   5. Login as new user (after approving from supervisor if needed)
   6. Citizen → can raise request
   7. Supervisor → can assign to worker
   8. Worker → can mark complete / raise complaint

Common Changes You May Need to Make
-----------------------------------
• MySQL password different?
  → backend/server.js → change password: 'yourpassword'

• Want different database name?
  → Change DB_NAME in .env
  → Update SQL script & server.js

• Port 3000 already used?
  → Change PORT in .env and server.js app.listen()

• Frontend port conflict (5173)?
  → Vite will auto-pick another port — just use the one shown in terminal

Troubleshooting
---------------
• Backend not starting? Check terminal for MySQL connection error
• 500 error on /api/data? Check backend terminal for SQL error
• Frontend 404 on pages? Check App.jsx routes & file names
• No data showing? Run http://localhost:3000/api/data — see if requests array is empty

================================================================================