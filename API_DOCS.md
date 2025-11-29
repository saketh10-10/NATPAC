# TripConnect API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Endpoints

### Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "traveler",
  "full_name": "John Doe"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "traveler"
  }
}
```

**Errors:**
- 400: Missing required fields
- 409: User already exists

---

### Login
**POST** `/auth/login`

Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "traveler",
    "full_name": "John Doe"
  }
}
```

**Errors:**
- 400: Email and password required
- 401: Invalid credentials

---

### Get Current User
**GET** `/auth/me`

Get authenticated user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "traveler",
    "full_name": "John Doe",
    "phone": "+1234567890",
    "location": "New York",
    "bio": "Travel enthusiast"
  }
}
```

**Errors:**
- 401: No token / Invalid token
- 404: User not found

---

## ✈️ Trip Endpoints

### Get All Trips
**GET** `/trips`

Get all trips for authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "trips": [
    {
      "id": 1,
      "user_id": 1,
      "title": "Summer Vacation",
      "destination": "Paris",
      "start_date": "2024-06-01",
      "end_date": "2024-06-15",
      "budget": 5000,
      "status": "planning",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### Get Single Trip
**GET** `/trips/:id`

Get trip details with documents and expenses.

**Response (200):**
```json
{
  "trip": {
    "id": 1,
    "user_id": 1,
    "title": "Summer Vacation",
    "destination": "Paris",
    "start_date": "2024-06-01",
    "end_date": "2024-06-15",
    "budget": 5000,
    "status": "planning"
  },
  "documents": [
    {
      "id": 1,
      "trip_id": 1,
      "file_name": "flight_ticket.pdf",
      "document_type": "flight",
      "uploaded_at": "2024-01-15T10:30:00Z"
    }
  ],
  "expenses": [
    {
      "id": 1,
      "trip_id": 1,
      "category": "accommodation",
      "amount": 1500,
      "currency": "USD",
      "date": "2024-06-01"
    }
  ]
}
```

---

### Create Trip
**POST** `/trips`

Create a new trip.

**Request Body:**
```json
{
  "title": "Summer Vacation",
  "description": "Amazing trip to Paris",
  "destination": "Paris",
  "start_date": "2024-06-01",
  "end_date": "2024-06-15",
  "budget": 5000
}
```

**Response (201):**
```json
{
  "message": "Trip created successfully",
  "trip": {
    "id": 1,
    "user_id": 1,
    "title": "Summer Vacation",
    "destination": "Paris",
    "start_date": "2024-06-01",
    "end_date": "2024-06-15"
  }
}
```

---

### Update Trip
**PUT** `/trips/:id`

Update trip details.

**Request Body:**
```json
{
  "title": "European Adventure",
  "status": "ongoing",
  "budget": 6000
}
```

**Response (200):**
```json
{
  "message": "Trip updated successfully"
}
```

---

### Delete Trip
**DELETE** `/trips/:id`

Delete a trip and all associated data.

**Response (200):**
```json
{
  "message": "Trip deleted successfully"
}
```

---

### Add Expense
**POST** `/trips/:id/expenses`

Add expense to a trip.

**Request Body:**
```json
{
  "category": "accommodation",
  "amount": 1500,
  "currency": "USD",
  "description": "Hotel booking",
  "date": "2024-06-01"
}
```

**Response (201):**
```json
{
  "message": "Expense added",
  "expense": {
    "id": 1
  }
}
```

---

## 🏢 Agent Endpoints

### Get All Promotions
**GET** `/agents/promotions`

Get all promotions (public endpoint, no auth required).

**Query Parameters:**
- `destination` (optional): Filter by destination
- `category` (optional): Filter by category

**Response (200):**
```json
{
  "promotions": [
    {
      "id": 1,
      "agent_id": 2,
      "title": "Paris City Tour",
      "destination": "Paris",
      "category": "tour",
      "price": 150,
      "rating": 4.5,
      "views": 250,
      "full_name": "Jane Agent",
      "location": "Paris"
    }
  ]
}
```

---

### Get Agent's Promotions
**GET** `/agents/my-promotions`

Get authenticated agent's promotions.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "promotions": [
    {
      "id": 1,
      "agent_id": 2,
      "title": "Paris City Tour",
      "destination": "Paris",
      "category": "tour",
      "price": 150,
      "rating": 4.5,
      "views": 250
    }
  ]
}
```

---

### Create Promotion
**POST** `/agents/promotions`

Create new promotion (agent only).

**Request Body:**
```json
{
  "title": "Paris City Tour",
  "description": "Guided tour of Paris attractions",
  "destination": "Paris",
  "category": "tour",
  "price": 150,
  "image_url": "https://example.com/image.jpg"
}
```

**Response (201):**
```json
{
  "message": "Promotion created successfully",
  "promotion": {
    "id": 1
  }
}
```

---

### Update Promotion
**PUT** `/agents/promotions/:id`

Update promotion (agent only).

**Request Body:**
```json
{
  "title": "Paris City Tour - Updated",
  "price": 160
}
```

**Response (200):**
```json
{
  "message": "Promotion updated successfully"
}
```

---

### Delete Promotion
**DELETE** `/agents/promotions/:id`

Delete promotion (agent only).

**Response (200):**
```json
{
  "message": "Promotion deleted successfully"
}
```

---

### Send Message
**POST** `/agents/messages`

Send message to another user.

**Request Body:**
```json
{
  "receiver_id": 1,
  "promotion_id": 5,
  "message": "I'm interested in this promotion!"
}
```

**Response (201):**
```json
{
  "message": "Message sent",
  "messageId": 1
}
```

---

### Get Messages
**GET** `/agents/messages`

Get all messages for authenticated user.

**Response (200):**
```json
{
  "messages": [
    {
      "id": 1,
      "sender_id": 1,
      "receiver_id": 2,
      "message": "I'm interested in this promotion!",
      "read_status": 0,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## 📊 Researcher Endpoints

All researcher endpoints require `role: 'researcher'` in JWT token.

### Get Traveler Statistics
**GET** `/researcher/traveler-stats`

Get aggregated traveler statistics.

**Response (200):**
```json
{
  "stats": {
    "total_travelers": 150,
    "total_trips": 450,
    "avg_budget": 3500,
    "unique_destinations": 85
  }
}
```

---

### Get Destination Insights
**GET** `/researcher/destination-insights`

Get insights about popular destinations.

**Response (200):**
```json
{
  "insights": [
    {
      "destination": "Paris",
      "trip_count": 45,
      "avg_budget": 4200,
      "unique_travelers": 40
    }
  ]
}
```

---

### Get Expense Analysis
**GET** `/researcher/expense-analysis`

Analyze expenses by category.

**Response (200):**
```json
{
  "analysis": [
    {
      "category": "accommodation",
      "count": 200,
      "avg_amount": 1500,
      "total_amount": 300000
    }
  ]
}
```

---

### Get Agent Performance
**GET** `/researcher/agent-performance`

Get agent performance metrics.

**Response (200):**
```json
{
  "performance": [
    {
      "id": 2,
      "full_name": "Jane Agent",
      "location": "Paris",
      "promotion_count": 15,
      "avg_rating": 4.6,
      "total_views": 5000
    }
  ]
}
```

---

### Get Travel Trends
**GET** `/researcher/travel-trends`

Get travel trends over time.

**Response (200):**
```json
{
  "trends": [
    {
      "month": "2024-01",
      "trip_count": 45,
      "avg_budget": 3500
    }
  ]
}
```

---

### Get Access Logs
**GET** `/researcher/access-logs`

Get researcher's data access logs.

**Response (200):**
```json
{
  "logs": [
    {
      "id": 1,
      "researcher_id": 3,
      "data_type": "traveler_stats",
      "accessed_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid token"
}
```

### 403 Forbidden
```json
{
  "error": "Only agents can access this"
}
```

### 404 Not Found
```json
{
  "error": "Trip not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to create trip"
}
```

---

## Rate Limiting

Currently no rate limiting. Implement in production.

## CORS

Allowed origins:
- `http://localhost:3000`
- `http://localhost:5173`
- `http://localhost:5174`

---

## Testing with cURL

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"traveler@example.com","password":"password123"}'
```

### Get Trips
```bash
curl -X GET http://localhost:5000/api/trips \
  -H "Authorization: Bearer <token>"
```

### Create Trip
```bash
curl -X POST http://localhost:5000/api/trips \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"My Trip",
    "destination":"Paris",
    "start_date":"2024-06-01",
    "end_date":"2024-06-15",
    "budget":5000
  }'
```

---

## Health Check

**GET** `/health`

Check if backend is running.

**Response (200):**
```json
{
  "status": "Backend is running"
}
```
