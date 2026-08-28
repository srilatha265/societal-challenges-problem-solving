# CitySync - Societal Challenges & Collaborative Problem Solving

### Track: Sustainable Cities & Communities (SDG 11) | Swachh Bharat Mission

**Live Project:** Centralized City Problem Reporting Platform

### 🚨 Societal Challenge
In cities like Chebrolu/Guntur, 70% of complaints (garbage, streetlight, water leakage) get lost on paper. No tracking, no transparency, no collaboration between Citizen and Municipality.

### 💡 Our Collaborative Solution
A 3-role web platform:
- **Resident:** Raise request with category & description, track Raised/Pending/Completed in dashboard (Tested: kinni login working)
- **Admin:** View city-wide requests, approve users, assign to workers
- **Worker:** Complete assigned tasks, update status

### ✅ Features Completed & Tested
- Secure login with is_approved verification
- Raise new request (garbage category tested live)
- Real-time dashboard counters (1 Raised, 1 Pending verified)
- MySQL data persistence

### 🛠️ Tech Stack
Frontend: React.js (Vite) - Port 5175
Backend: Node.js, Express.js - Port 3000
Database: MySQL - city_problems_reporting

### ▶️ How to Run
1. Import Centralized-City-Problem-Reporting-Platform-main.zip / init.sql into MySQL
2. Run: UPDATE residents SET is_approved=1;
3. Backend: cd backend && npm install && npm start
4. Frontend: cd frontend && npm install && npm run dev
5. Login: kinni / your password

### 📸 Demo Proof
Resident dashboard, raise request form, pending tracking - all working (screenshots in PPT)

### 🔮 Future Scope
Map integration, Mobile App, AI priority detection, WhatsApp alerts

Built by Srilatha265 for Hackathon - Societal Challenges Track
