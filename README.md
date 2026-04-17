# 💄 Makeup Artist Booking Website
### BCA Final Year Project — Full Stack (React + Flask + MySQL)

---

## 📁 Project Structure

```
makeup-artist/
├── backend/                  ← Flask (Python) API
│   ├── app.py                ← Main Flask app
│   ├── requirements.txt      ← Python dependencies
│   ├── .env                  ← Environment variables
│   ├── routes/               ← URL route blueprints
│   │   ├── auth_routes.py
│   │   ├── booking_routes.py
│   │   ├── service_routes.py
│   │   └── gallery_routes.py
│   ├── controllers/          ← Business logic
│   │   ├── auth_controller.py
│   │   ├── booking_controller.py
│   │   ├── service_controller.py
│   │   └── gallery_controller.py
│   ├── models/               ← DB connection + middleware
│   │   ├── db.py
│   │   └── auth_middleware.py
│   └── uploads/              ← Uploaded gallery images (auto-created)
│
├── frontend/                 ← React.js app
│   ├── public/index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── src/
│       ├── App.jsx           ← Routes
│       ├── index.js
│       ├── index.css         ← Global styles + Tailwind
│       ├── api/
│       │   ├── axiosConfig.js
│       │   └── services.js   ← All API functions
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Footer.jsx
│       │   └── ProtectedRoute.jsx
│       └── pages/
│           ├── Home.jsx
│           ├── Services.jsx
│           ├── Gallery.jsx
│           ├── Booking.jsx
│           ├── Contact.jsx
│           └── admin/
│               ├── AdminLogin.jsx
│               ├── AdminDashboard.jsx
│               ├── AdminServices.jsx
│               └── AdminGallery.jsx
│
└── database/
    └── schema.sql            ← MySQL database schema + seed data
```

---

## ⚙️ Prerequisites

Make sure you have these installed:
- **Python 3.10+** — https://python.org
- **Node.js 18+** — https://nodejs.org
- **MySQL 8.0+** — https://dev.mysql.com/downloads/
- **pip** (comes with Python)
- **npm** (comes with Node.js)

---

## 🗄️ Step 1: Setup MySQL Database

1. Open MySQL command line or MySQL Workbench.
2. Run the schema file:

```sql
-- In MySQL CLI:
mysql -u root -p < database/schema.sql

-- OR paste contents of database/schema.sql into MySQL Workbench and execute.
```

This creates:
- Database: `makeup_artist_db`
- Tables: `admin`, `services`, `bookings`, `gallery`
- Default admin: username=`admin`, password=`admin123`
- Sample makeup services

---

## 🐍 Step 2: Setup Flask Backend

### 2a. Navigate to backend folder
```bash
cd makeup-artist/backend
```

### 2b. Create a virtual environment (recommended)
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

### 2c. Install Python dependencies
```bash
pip install -r requirements.txt
```

### 2d. Configure environment variables
Edit the `.env` file with your MySQL credentials:
```
SECRET_KEY=your-super-secret-key-change-this
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password_here
MYSQL_DB=makeup_artist_db
```

### 2e. Run the Flask server
```bash
python app.py
```

✅ Backend runs at: **http://localhost:5000**

---

## ⚛️ Step 3: Setup React Frontend

### 3a. Open a NEW terminal and navigate to frontend
```bash
cd makeup-artist/frontend
```

### 3b. Install Node.js dependencies
```bash
npm install
```

### 3c. Install Tailwind CSS
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3d. Start the React development server
```bash
npm start
```

✅ Frontend runs at: **http://localhost:3000**

---

## 🌐 Pages & URLs

| Page              | URL                      | Access  |
|-------------------|--------------------------|---------|
| Home              | http://localhost:3000/   | Public  |
| Services          | /services                | Public  |
| Portfolio/Gallery | /gallery                 | Public  |
| Book Appointment  | /booking                 | Public  |
| Contact           | /contact                 | Public  |
| Admin Login       | /admin/login             | Admin   |
| Admin Dashboard   | /admin/dashboard         | Admin   |
| Manage Services   | /admin/services          | Admin   |
| Manage Gallery    | /admin/gallery           | Admin   |

---

## 🔐 Admin Login

Default credentials (change after first login!):
- **Username:** `admin`
- **Password:** `admin123`

Go to: **http://localhost:3000/admin/login**

---

## 🔌 REST API Endpoints

### Authentication
| Method | Endpoint            | Description        |
|--------|---------------------|--------------------|
| POST   | /api/auth/login     | Admin login → JWT  |
| PUT    | /api/auth/change-password | Change password |

### Services
| Method | Endpoint              | Auth    | Description         |
|--------|-----------------------|---------|---------------------|
| GET    | /api/services/        | Public  | Get all services    |
| GET    | /api/services/:id     | Public  | Get one service     |
| POST   | /api/services/        | Admin   | Create service      |
| PUT    | /api/services/:id     | Admin   | Update service      |
| DELETE | /api/services/:id     | Admin   | Delete service      |

### Bookings
| Method | Endpoint                        | Auth   | Description          |
|--------|---------------------------------|--------|----------------------|
| POST   | /api/bookings/                  | Public | Create booking       |
| GET    | /api/bookings/                  | Admin  | Get all bookings     |
| GET    | /api/bookings/available-slots   | Public | Get booked times     |
| PUT    | /api/bookings/:id/status        | Admin  | Update status        |
| DELETE | /api/bookings/:id               | Admin  | Delete booking       |

### Gallery
| Method | Endpoint              | Auth   | Description        |
|--------|-----------------------|--------|--------------------|
| GET    | /api/gallery/         | Public | Get all images     |
| POST   | /api/gallery/         | Admin  | Upload image       |
| DELETE | /api/gallery/:id      | Admin  | Delete image       |

---

## 🗃️ Database Schema

```sql
services  → id, name, price, description, duration
bookings  → id, name, phone, address, service_id, booking_date, booking_time, status, notes
gallery   → id, image_url, category, caption
admin     → id, username, password
```

**Booking statuses:** `pending` → `accepted` / `rejected` → `completed`

---

## 🚨 Common Issues & Fixes

**MySQL Connection Error**
```
Check: Is MySQL server running?
Check: .env credentials correct?
Run: mysql -u root -p (to test connection)
```

**CORS Error in browser**
```
Make sure Flask backend is running on port 5000.
The proxy in package.json handles this automatically.
```

**Module not found (Python)**
```bash
pip install -r requirements.txt
# Make sure virtual environment is activated!
```

**Port already in use**
```bash
# Kill port 5000 (Mac/Linux)
kill -9 $(lsof -ti:5000)
# Kill port 3000 (Mac/Linux)
kill -9 $(lsof -ti:3000)
```

---

## 🎓 Tech Stack Summary

| Layer     | Technology       | Purpose                    |
|-----------|------------------|----------------------------|
| Frontend  | React.js 18      | UI components & SPA        |
| Styling   | Tailwind CSS     | Responsive design          |
| HTTP      | Axios            | API calls from React       |
| Routing   | React Router v6  | Client-side navigation     |
| Backend   | Flask (Python)   | REST API server            |
| Auth      | JWT (PyJWT)      | Admin authentication       |
| Password  | bcrypt           | Secure password hashing    |
| Database  | MySQL 8          | Data persistence           |
| DB Driver | PyMySQL          | Python ↔ MySQL connection  |

---

## 📝 How to Customize

1. **Change artist name:** Search & replace "Priya Sharma" in frontend files
2. **Change phone/WhatsApp:** Update in `Contact.jsx` and `Footer.jsx`
3. **Change Instagram:** Update href in `Contact.jsx` and `Footer.jsx`
4. **Add more time slots:** Edit `ALL_SLOTS` array in `Booking.jsx`
5. **Change colors:** Edit `tailwind.config.js` color palette

---

*Built with ❤️ as a BCA Final Year Project*
