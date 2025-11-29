# TripConnect - Architecture & System Design

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              React 19 + Vite + TypeScript               │   │
│  │                                                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐   │   │
│  │  │   Login     │  │  Traveler   │  │    Agent     │   │   │
│  │  │ Component   │  │  Dashboard  │  │  Dashboard   │   │   │
│  │  └─────────────┘  └─────────────┘  └──────────────┘   │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │         Researcher Dashboard                     │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  │  State Management: React Hooks + localStorage          │   │
│  │  HTTP Client: Fetch API                                │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                                   │
│  Port: 5173                                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    JWT Token in Headers
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                           │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Express.js Server                           │   │
│  │                                                          │   │
│  │  CORS Middleware → Authentication → Route Handlers      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Port: 5000                                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                             │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Auth       │  │   Trips      │  │   Agents     │          │
│  │  Routes      │  │   Routes     │  │   Routes     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐                                               │
│  │  Researcher  │                                               │
│  │   Routes     │                                               │
│  └──────────────┘                                               │
│                                                                   │
│  Business Logic & Validation                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                             │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Database Connection Manager                      │   │
│  │                                                          │   │
│  │  - Promise-based queries                                │   │
│  │  - Connection pooling                                   │   │
│  │  - Error handling                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                                │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              SQLite3 Database                            │   │
│  │                                                          │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │   │
│  │  │   Users    │  │   Trips    │  │ Promotions │        │   │
│  │  └────────────┘  └────────────┘  └────────────┘        │   │
│  │                                                          │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │   │
│  │  │ Expenses   │  │ Documents  │  │  Messages  │        │   │
│  │  └────────────┘  └────────────┘  └────────────┘        │   │
│  │                                                          │   │
│  │  tripconnect.db                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### User Registration/Login Flow

```
┌─────────────────┐
│  User enters    │
│  credentials    │
└────────┬────────┘
         ↓
┌─────────────────────────────────────┐
│  Frontend validates input           │
│  - Email format                     │
│  - Password strength                │
└────────┬────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  POST /api/auth/login               │
│  or /api/auth/register              │
└────────┬────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  Backend validates credentials      │
│  - Check if user exists             │
│  - Verify password hash             │
└────────┬────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  Generate JWT token                 │
│  - User ID                          │
│  - Email                            │
│  - Role                             │
│  - Expiration (7 days)              │
└────────┬────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  Return token + user data           │
└────────┬────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  Frontend stores token              │
│  - localStorage.setItem('token')    │
│  - localStorage.setItem('user')     │
└────────┬────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  User logged in                     │
│  Redirect to dashboard              │
└─────────────────────────────────────┘
```

### Trip Creation Flow

```
┌──────────────────────┐
│  Traveler fills      │
│  trip form           │
└──────────┬───────────┘
           ↓
┌──────────────────────────────────────┐
│  Frontend validates                  │
│  - Title, destination required       │
│  - Dates valid                       │
│  - Budget positive                   │
└──────────┬───────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│  POST /api/trips                     │
│  Headers: Authorization: Bearer JWT  │
│  Body: Trip data                     │
└──────────┬───────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│  Backend verifies JWT token          │
│  - Decode token                      │
│  - Extract user ID                   │
│  - Verify expiration                 │
└──────────┬───────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│  Backend validates trip data         │
│  - Check required fields             │
│  - Validate date ranges              │
└──────────┬───────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│  Insert into database                │
│  INSERT INTO trips (...)             │
└──────────┬───────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│  Return trip ID + confirmation       │
└──────────┬───────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│  Frontend shows success message      │
│  Updates UI with new trip            │
└──────────────────────────────────────┘
```

## Database Schema

```
USERS
├── id (PK)
├── username (UNIQUE)
├── email (UNIQUE)
├── password (hashed)
├── role (traveler|agent|researcher)
├── full_name
├── phone
├── location
├── bio
├── profile_image
├── created_at
└── updated_at

TRIPS
├── id (PK)
├── user_id (FK → users)
├── title
├── description
├── destination
├── start_date
├── end_date
├── budget
├── status (planning|ongoing|completed)
├── created_at
└── updated_at

TRIP_DOCUMENTS
├── id (PK)
├── trip_id (FK → trips)
├── file_name
├── file_type
├── file_path
├── document_type (flight|hotel|itinerary|expense|other)
└── uploaded_at

EXPENSES
├── id (PK)
├── trip_id (FK → trips)
├── category
├── amount
├── currency
├── description
├── date
└── created_at

PROMOTIONS
├── id (PK)
├── agent_id (FK → users)
├── title
├── description
├── destination
├── category
├── price
├── image_url
├── rating
├── views
├── created_at
└── updated_at

MESSAGES
├── id (PK)
├── sender_id (FK → users)
├── receiver_id (FK → users)
├── promotion_id (FK → promotions)
├── message
├── read_status
└── created_at

RESEARCH_ACCESS
├── id (PK)
├── researcher_id (FK → users)
├── data_type
├── query_params
└── accessed_at
```

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    REQUEST LIFECYCLE                         │
└─────────────────────────────────────────────────────────────┘

1. CLIENT REQUEST
   ├── URL: /api/trips
   ├── Method: GET
   └── Headers:
       └── Authorization: Bearer eyJhbGc...

2. CORS MIDDLEWARE
   ├── Check origin
   ├── Allow/deny request
   └── Set CORS headers

3. BODY PARSER
   ├── Parse JSON
   └── Validate content-type

4. AUTHENTICATION MIDDLEWARE
   ├── Extract token from header
   ├── Verify JWT signature
   ├── Check expiration
   ├── Decode payload
   └── Attach user info to request

5. ROUTE HANDLER
   ├── Check user role
   ├── Validate permissions
   ├── Execute business logic
   └── Query database

6. RESPONSE
   ├── Format data
   ├── Set status code
   └── Send JSON response
```

## Role-Based Access Control (RBAC)

```
┌─────────────────────────────────────────────────────────────┐
│                      TRAVELER                                │
├─────────────────────────────────────────────────────────────┤
│ ✓ Create trips                                              │
│ ✓ View own trips                                            │
│ ✓ Update own trips                                          │
│ ✓ Delete own trips                                          │
│ ✓ Add expenses                                              │
│ ✓ View promotions                                           │
│ ✓ Send messages to agents                                   │
│ ✗ Create promotions                                         │
│ ✗ Access research data                                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                       AGENT                                  │
├─────────────────────────────────────────────────────────────┤
│ ✓ Create promotions                                         │
│ ✓ View own promotions                                       │
│ ✓ Update own promotions                                     │
│ ✓ Delete own promotions                                     │
│ ✓ Send messages to travelers                                │
│ ✓ View received messages                                    │
│ ✗ Create trips                                              │
│ ✗ Access research data                                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    RESEARCHER                                │
├─────────────────────────────────────────────────────────────┤
│ ✓ View traveler statistics                                  │
│ ✓ View destination insights                                 │
│ ✓ View expense analysis                                     │
│ ✓ View agent performance                                    │
│ ✓ View travel trends                                        │
│ ✓ View access logs                                          │
│ ✗ Create/modify data                                        │
│ ✗ Access individual user data                               │
└─────────────────────────────────────────────────────────────┘
```

## API Request/Response Cycle

```
CLIENT                          SERVER                      DATABASE
  │                               │                            │
  ├─ POST /api/trips ────────────>│                            │
  │  Headers: Authorization       │                            │
  │  Body: {trip data}            │                            │
  │                               ├─ Verify JWT ─────────────>│
  │                               │                            │
  │                               │<─ User verified ──────────┤
  │                               │                            │
  │                               ├─ Validate data            │
  │                               │                            │
  │                               ├─ INSERT trip ────────────>│
  │                               │                            │
  │                               │<─ Trip created ───────────┤
  │                               │                            │
  │<─ 201 Created ────────────────┤                            │
│  {trip_id: 1}                 │                            │
  │                               │                            │
```

## Deployment Architecture (Future)

```
┌──────────────────────────────────────────────────────────────┐
│                    PRODUCTION SETUP                           │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    CDN / STATIC HOSTING                      │
│                                                              │
│  Frontend (React build)                                     │
│  - Vercel / Netlify                                         │
│  - Global distribution                                      │
│  - Automatic HTTPS                                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY / LOAD BALANCER               │
│                                                              │
│  - Route requests                                           │
│  - SSL/TLS termination                                      │
│  - Rate limiting                                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND SERVERS                           │
│                                                              │
│  - Express.js instances                                     │
│  - Heroku / Railway / AWS                                   │
│  - Auto-scaling                                             │
│  - Health checks                                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    CACHING LAYER                             │
│                                                              │
│  - Redis                                                    │
│  - Session storage                                          │
│  - Query caching                                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE                                  │
│                                                              │
│  - PostgreSQL / MySQL                                       │
│  - Managed database service                                 │
│  - Automated backups                                        │
│  - Replication                                              │
└─────────────────────────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  SECURITY LAYERS                             │
└─────────────────────────────────────────────────────────────┘

1. TRANSPORT SECURITY
   ├── HTTPS/TLS encryption
   ├── Certificate pinning
   └── Secure headers

2. AUTHENTICATION
   ├── Password hashing (bcryptjs)
   ├── JWT tokens
   ├── Token expiration
   └── Refresh token rotation

3. AUTHORIZATION
   ├── Role-based access control
   ├── Resource ownership checks
   ├── Endpoint-level permissions
   └── Data isolation

4. INPUT VALIDATION
   ├── Type checking
   ├── Length validation
   ├── Format validation
   └── SQL injection prevention

5. OUTPUT ENCODING
   ├── JSON encoding
   ├── Error message sanitization
   └── No sensitive data exposure

6. RATE LIMITING
   ├── Per-user limits
   ├── Per-endpoint limits
   └── DDoS protection

7. LOGGING & MONITORING
   ├── Request logging
   ├── Error logging
   ├── Security event logging
   └── Audit trails
```

This architecture ensures scalability, security, and maintainability of the TripConnect platform.
