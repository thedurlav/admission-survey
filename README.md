# AdmissionTrack — School Field Survey System

A full-stack web application for digitizing school admission surveys. Field surveyors collect data house-to-house on mobile; admins view, manage, and export everything from a dashboard.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios, react-hot-toast |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Excel Export | ExcelJS |
| Fonts | DM Sans + DM Mono (Google Fonts) |

---

## Project Structure

```
admission-survey/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema (admin + surveyor)
│   │   └── Student.js       # Student survey schema
│   ├── routes/
│   │   ├── auth.js          # Login, /me
│   │   ├── students.js      # CRUD + Excel export
│   │   └── users.js         # Surveyor management
│   ├── middleware/
│   │   └── auth.js          # JWT protect + adminOnly
│   ├── server.js            # Express app entry
│   ├── seed.js              # Creates default users
│   ├── .env.example         # Environment variable template
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.js   # Auth state + Axios instance
    │   ├── components/
    │   │   ├── Topbar.js        # Shared top navigation bar
    │   │   ├── StudentForm.js   # Survey entry form (mobile-first)
    │   │   └── StudentTable.js  # Responsive data table
    │   ├── pages/
    │   │   ├── Login.js             # Role-selection login page
    │   │   ├── SurveyorDashboard.js # Surveyor view
    │   │   └── AdminDashboard.js    # Admin view
    │   ├── App.js           # Routing + auth guards
    │   ├── index.js         # React entry
    │   └── index.css        # Global design system
    └── package.json
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`) OR a MongoDB Atlas URI

---

### 1. Backend Setup

```bash
cd backend
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env — set MONGODB_URI and JWT_SECRET

# Seed the database with default users
npm run seed

# Start the server
npm run dev       # development (nodemon)
npm start         # production
```

Backend runs on **http://localhost:5000**

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on **http://localhost:3000**

The `"proxy": "http://localhost:5000"` in `frontend/package.json` proxies all `/api` calls to the backend automatically during development.

---

## Default Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Surveyor | `surveyor1` | `survey123` |
| Surveyor | `surveyor2` | `survey123` |

> ⚠️ Change these immediately in production by re-running seed with new values or updating via the admin panel.

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | — | Login, returns JWT + user |
| GET | `/api/auth/me` | Bearer | Get current user |

### Students
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/students` | Any | Create survey entry |
| GET | `/api/students/my` | Surveyor | Get own surveys |
| GET | `/api/students` | Admin | Get all surveys |
| GET | `/api/students/export` | Admin | Download XLSX file |
| DELETE | `/api/students/:id` | Admin | Delete entry |

### Users (Surveyors)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/surveyors` | Admin | List all surveyors |
| POST | `/api/users/surveyors` | Admin | Create surveyor account |
| PATCH | `/api/users/surveyors/:id/toggle` | Admin | Activate/deactivate |
| DELETE | `/api/users/surveyors/:id` | Admin | Delete surveyor |

---

## Features

### Surveyor
- Mobile-first form to enter student survey data on-the-go
- View personal survey history with search
- Stats: total, today, this week

### Admin
- Master view of all surveys across all surveyors
- Search by name, father's name, location, mobile, surveyor
- Export all data to a formatted `.xlsx` file with auto-filter
- Add students manually
- Create/activate/deactivate/delete surveyor accounts
- Dashboard stats: total surveys, today's count, unique locations

---

## Deployment (Production)

### Backend
```bash
# Set in .env:
NODE_ENV=production
MONGODB_URI=mongodb+srv://...  # Atlas URI
JWT_SECRET=long-random-secret  # Use crypto.randomBytes(64).toString('hex')
FRONTEND_URL=https://yourdomain.com

npm start
```

### Frontend
```bash
# Set REACT_APP_API_URL if not using proxy
npm run build
# Serve the /build folder with nginx or any static host
```

### Recommended Hosts
- **Backend**: Railway, Render, Fly.io, AWS EC2
- **Frontend**: Vercel, Netlify, or serve from same server
- **Database**: MongoDB Atlas (free tier available)

---

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/admission_survey
JWT_SECRET=change_this_to_a_long_random_string
NODE_ENV=development
FRONTEND_URL=http://localhost:3000   # used in production CORS
```

---

## Data Model

### User
```js
{
  username: String (unique, lowercase),
  password: String (bcrypt hashed),
  fullName: String,
  role: 'admin' | 'surveyor',
  isActive: Boolean
}
```

### Student Survey
```js
{
  childName: String (required),
  fatherName: String (required),
  class: String (required),
  medium: 'Hindi' | 'English' | 'Urdu' | 'Marathi' | 'Other',
  previousSchool: String,
  location: String (required),
  mobileNo: String (10 digits, required),
  remarks: String,
  surveyDate: Date (default: now),
  surveyedBy: ObjectId → User
}
```
