# Notes API Documentation

## Overview

The Notes API provides complete CRUD operations for managing user notes with categories like kontrol, pengingat, lainnya, obat, and dokter. This API is fully integrated with the existing SmedBox backend infrastructure.

## Base URL

```
/v1/api/notes
```

## Implementation Details

### Backend Files Created:

1. **`src/services/notesService.js`** - Service layer with database operations
2. **`src/controllers/notesController.js`** - Controller layer with business logic
3. **`src/routes/notesRoutes.js`** - Route definitions and middleware
4. **`src/index.js`** - Updated to include notes routes

### Database Integration:

- Uses existing Supabase connection
- Integrates with `notes` table as defined in database schema
- Maintains foreign key relationships with `profile` table
- Uses UUID for primary keys and proper user/profile access control

## Authentication

All endpoints require JWT authentication via the `verifySupabaseUser` middleware.

- Token must be provided in Authorization header: `Bearer <token>`
- User ID is extracted from JWT token
- Profile ID is fetched from database based on user ID

## Endpoints

### 1. Get All Notes

```http
GET /v1/api/notes
```

**Query Parameters:**

- `category` (optional): Filter by category (kontrol|pengingat|lainnya|obat|dokter)

**Example Request:**

```bash
GET /v1/api/notes?category=kontrol
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Notes retrieved successfully",
  "data": [
    {
      "note_id": "uuid",
      "user_id": "uuid",
      "profile_id": "uuid",
      "category": "kontrol",
      "message": "Kontrol rutin ke dokter",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

### 2. Get Note by ID

```http
GET /v1/api/notes/:noteId
```

**Parameters:**

- `noteId` (required): UUID of the note

**Example Request:**

```bash
GET /v1/api/notes/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Note retrieved successfully",
  "data": {
    "note_id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "uuid",
    "profile_id": "uuid",
    "category": "kontrol",
    "message": "Kontrol rutin ke dokter",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 3. Create Note

```http
POST /v1/api/notes
```

**Request Body:**

```json
{
  "category": "kontrol",
  "message": "Kontrol rutin ke dokter"
}
```

**Validation Rules:**

- `category`: Required, must be one of: kontrol, pengingat, lainnya, obat, dokter
- `message`: Required, max 1000 characters, cannot be empty

**Example Request:**

```bash
POST /v1/api/notes
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "category": "obat",
  "message": "Minum obat tekanan darah setiap pagi setelah sarapan"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Note created successfully",
  "data": {
    "note_id": "new-uuid",
    "user_id": "uuid",
    "profile_id": "uuid",
    "category": "obat",
    "message": "Minum obat tekanan darah setiap pagi setelah sarapan",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 4. Update Note

```http
PUT /v1/api/notes/:noteId
```

**Parameters:**

- `noteId` (required): UUID of the note

**Request Body:**

```json
{
  "category": "obat",
  "message": "Updated message"
}
```

**Validation Rules:**

- At least one field (category or message) must be provided
- `category`: Must be one of: kontrol, pengingat, lainnya, obat, dokter
- `message`: Max 1000 characters, cannot be empty

**Example Request:**

```bash
PUT /v1/api/notes/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "message": "Minum obat tekanan darah setiap pagi jam 8:00"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Note updated successfully",
  "data": {
    "note_id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "uuid",
    "profile_id": "uuid",
    "category": "obat",
    "message": "Minum obat tekanan darah setiap pagi jam 8:00",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T01:00:00Z"
  }
}
```

### 5. Delete Note

```http
DELETE /v1/api/notes/:noteId
```

**Parameters:**

- `noteId` (required): UUID of the note

**Example Request:**

```bash
DELETE /v1/api/notes/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Note deleted successfully",
  "data": {
    "note_id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "uuid",
    "profile_id": "uuid",
    "category": "obat",
    "message": "Minum obat tekanan darah setiap pagi jam 8:00",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 6. Search Notes

```http
GET /v1/api/notes/search?q=search_term
```

**Query Parameters:**

- `q` (required): Search query string

**Example Request:**

```bash
GET /v1/api/notes/search?q=obat
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": [
    {
      "note_id": "uuid",
      "user_id": "uuid",
      "profile_id": "uuid",
      "category": "obat",
      "message": "Minum obat tekanan darah setiap pagi",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1,
  "query": "obat"
}
```

### 7. Get Notes Statistics

```http
GET /v1/api/notes/stats
```

**Example Request:**

```bash
GET /v1/api/notes/stats
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Notes statistics retrieved successfully",
  "data": {
    "kontrol": 5,
    "pengingat": 3,
    "lainnya": 2,
    "obat": 4,
    "dokter": 1,
    "total": 15
  }
}
```

## Error Responses

### Validation Error (400)

```json
{
  "success": false,
  "message": "Category and message are required",
  "error_type": "validation_error"
}
```

### Authentication Error (401)

```json
{
  "success": false,
  "message": "Token tidak ditemukan atau format salah"
}
```

### Not Found (404)

```json
{
  "success": false,
  "message": "Note not found or access denied",
  "error_type": "not_found"
}
```

### Server Error (500)

```json
{
  "success": false,
  "message": "Failed to create note",
  "error": "Detailed error message",
  "error_type": "server_error"
}
```

## Categories

The following categories are supported:

- `kontrol`: Medical checkup notes
- `pengingat`: Reminder notes
- `lainnya`: Other general notes
- `obat`: Medication-related notes
- `dokter`: Doctor-related notes

## Security Features

- JWT authentication required for all endpoints
- Users can only access their own notes
- Profile-based access control enforced
- Input validation prevents SQL injection and XSS attacks
- Parameterized queries used throughout
- UUID validation for note IDs

## Database Schema Integration

```sql
-- Notes table structure (from supabase.sql)
CREATE TABLE notes (
    note_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category VARCHAR(20) NOT NULL CHECK (category IN ('kontrol', 'pengingat', 'lainnya', 'obat', 'dokter')),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## Implementation Architecture

### Service Layer (`notesService.js`)

- Database operations using Supabase client
- Error handling for database operations
- Data validation and sanitization
- User/profile access verification

### Controller Layer (`notesController.js`)

- HTTP request/response handling
- Business logic implementation
- Profile ID resolution from user ID
- Input validation and error responses

### Route Layer (`notesRoutes.js`)

- Express route definitions
- Middleware application (JWT verification)
- Route documentation comments
- RESTful endpoint structure

## Testing Examples

### Create a medication reminder note

```bash
curl -X POST http://localhost:5000/v1/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "category": "obat",
    "message": "Minum obat tekanan darah setiap pagi"
  }'
```

### Search for doctor-related notes

```bash
curl -X GET "http://localhost:5000/v1/api/notes/search?q=dokter" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get all control notes

```bash
curl -X GET "http://localhost:5000/v1/api/notes?category=kontrol" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update a note

```bash
curl -X PUT http://localhost:5000/v1/api/notes/note-uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "Updated reminder message"
  }'
```

### Delete a note

```bash
curl -X DELETE http://localhost:5000/v1/api/notes/note-uuid \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Integration with Frontend

To integrate with the frontend React application:

1. **Update API service** (`frontend/src/api/apiservice.js`):

   ```javascript
   // Add notes endpoints
   const notesAPI = {
     getAll: (category) =>
       api.get(`/notes${category ? `?category=${category}` : ""}`),
     getById: (id) => api.get(`/notes/${id}`),
     create: (data) => api.post("/notes", data),
     update: (id, data) => api.put(`/notes/${id}`, data),
     delete: (id) => api.delete(`/notes/${id}`),
     search: (query) => api.get(`/notes/search?q=${query}`),
     getStats: () => api.get("/notes/stats"),
   };
   ```

2. **Create React hooks** for notes management
3. **Add toast notifications** for user feedback
4. **Implement form validation** consistent with backend rules

## Status

✅ **Backend Implementation Complete**

- Service layer implemented
- Controller layer implemented
- Routes configured
- Server integration successful
- Documentation complete

🔄 **Next Steps**

- Frontend integration
- UI component development
- Testing with real data
- Performance optimization

The Notes API is now fully functional and ready for frontend integration!
