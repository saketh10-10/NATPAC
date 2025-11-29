# TripConnect - Setup & Installation Guide

## Project Overview

TripConnect is a comprehensive travel data management platform that connects travelers, local agents, and NATPAC (National Transportation Planning and Research Centre) for smart travel insights and planning.

## Project Structure

```
SIH/
├── backend/                 # Node.js/Express backend
│   ├── database/           # SQLite database setup
│   ├── routes/             # API endpoints
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── .env                # Environment variables
├── frontend/
│   └── frontend/           # React + Vite frontend
│       ├── src/
│       │   ├── components/ # React components
│       │   ├── App.tsx     # Main app component
│       │   └── main.tsx    # Entry point
│       ├── package.json    # Frontend dependencies
│       └── vite.config.ts  # Vite configuration
├── package.json            # Root package.json
└── README.md              # Project documentation
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

## Installation

### 1. Install Dependencies

#### Option A: Using root package.json (Recommended)
```bash
cd d:\SIH
npm install
```

This will install dependencies for both backend and frontend.

#### Option B: Manual Installation
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend/frontend
npm install
```

## Running the Application

### Development Mode (Both Backend & Frontend)

```bash
cd d:\SIH
npm run dev
```

This will start:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173

### Running Backend Only

```bash
cd d:\SIH\backend
npm run dev
```

Backend will run on http://localhost:5000

### Running Frontend Only

```bash
cd d:\SIH\frontend\frontend
npm run dev
```

Frontend will run on http://localhost:5173

## Default Test Credentials

### Traveler Account
- **Email**: traveler@example.com
- **Password**: password123

### Agent Account
- **Email**: agent@example.com
- **Password**: password123

### Researcher Account
- **Email**: researcher@example.com
- **Password**: password123

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Trips (Traveler)
- `GET /api/trips` - Get all trips
- `GET /api/trips/:id` - Get single trip
- `POST /api/trips` - Create new trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip
- `POST /api/trips/:id/expenses` - Add expense

### Agents
- `GET /api/agents/promotions` - Get all promotions
- `GET /api/agents/my-promotions` - Get agent's promotions
- `POST /api/agents/promotions` - Create promotion
- `PUT /api/agents/promotions/:id` - Update promotion
- `DELETE /api/agents/promotions/:id` - Delete promotion
- `POST /api/agents/messages` - Send message
- `GET /api/agents/messages` - Get messages

### Researcher
- `GET /api/researcher/traveler-stats` - Traveler statistics
- `GET /api/researcher/destination-insights` - Destination insights
- `GET /api/researcher/expense-analysis` - Expense analysis
- `GET /api/researcher/agent-performance` - Agent performance
- `GET /api/researcher/travel-trends` - Travel trends
- `GET /api/researcher/access-logs` - Access logs

## Database

The application uses SQLite with the following tables:

- **users** - User accounts (traveler, agent, researcher)
- **trips** - Trip records
- **trip_documents** - Trip files (flights, hotels, itineraries)
- **expenses** - Trip expenses
- **promotions** - Agent promotions
- **messages** - Messages between travelers and agents
- **research_access** - Research data access logs

Database file: `backend/database/tripconnect.db`

## Features

### For Travelers
✅ Create and manage trips
✅ Upload trip documents (flights, hotels, itineraries)
✅ Track expenses
✅ Discover local agents and promotions
✅ Connect with agents for authentic experiences

### For Agents
✅ Create and manage promotions
✅ Promote destinations and packages
✅ Connect with travelers
✅ View engagement metrics
✅ Manage messages

### For Researchers
✅ Access anonymized traveler data
✅ View destination insights
✅ Analyze travel trends
✅ Study agent performance
✅ Generate research reports

## Environment Variables

Create a `.env` file in the backend directory:

```
PORT=5000
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
DATABASE_PATH=./database/tripconnect.db
```

## Frontend Features

- **Modern UI** - Built with React 19 + Vite
- **Responsive Design** - Mobile-friendly interface
- **Real-time Updates** - Live data synchronization
- **Form Validation** - Client-side validation
- **Error Handling** - User-friendly error messages
- **Authentication** - JWT-based auth with token storage

## Backend Features

- **Express.js** - Fast and lightweight web framework
- **SQLite** - Lightweight database
- **JWT Authentication** - Secure token-based auth
- **CORS** - Cross-origin resource sharing
- **Error Handling** - Comprehensive error management
- **Data Validation** - Input validation on all endpoints

## Troubleshooting

### Backend not connecting
- Ensure backend is running on port 5000
- Check if port 5000 is not already in use
- Verify `.env` file exists in backend directory

### Frontend not loading
- Clear browser cache
- Check if frontend is running on port 5173
- Verify backend is accessible

### Database errors
- Delete `backend/database/tripconnect.db` to reset
- Restart the backend server
- Check database permissions

### CORS errors
- Verify backend CORS configuration
- Check frontend URL is in CORS whitelist
- Ensure frontend is on allowed port

## Building for Production

### Frontend Build
```bash
cd frontend/frontend
npm run build
```

Output will be in `frontend/frontend/dist/`

### Backend Deployment
- Set `NODE_ENV=production`
- Update `JWT_SECRET` with a strong key
- Use a production database
- Deploy to hosting service (Vercel, Heroku, etc.)

## Support

For issues or questions, please check:
1. Backend console for error messages
2. Browser DevTools for frontend errors
3. Database file exists and is accessible
4. All environment variables are set correctly

## License

ISC
