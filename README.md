# Comment Application - Backend-Focused Full-Stack System

A minimalistic and highly scalable comment application emphasizing backend performance, clean architecture, and Docker-based containerization.

## Features

- **Secure Authentication**: JWT-based user authentication
- **Nested Comments**: Support for multiple levels of comment nesting
- **Edit/Delete with Grace Period**: 15-minute window for editing and restoring comments
- **Real-time Notifications**: Alert system for comment replies with read/unread status
- **High Performance**: Redis caching and optimized database queries
- **Fully Dockerized**: Complete containerization for easy deployment
- **Scalable Architecture**: Built for heavy loads and horizontal scaling

## Tech Stack

- **Backend**: NestJS with TypeScript
- **Frontend**: React with TypeScript
- **Database**: PostgreSQL
- **Cache**: Redis
- **Containerization**: Docker & Docker Compose
- **Authentication**: JWT with Passport.js

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL (if running locally)

## Quick Start

### Using Docker (Recommended)

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd comment-app
\`\`\`

2. Start the application:
\`\`\`bash
npm run dev
\`\`\`

This will build and start all services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- vercel: https://fgh-task-overviews-projects.vercel.app/

### Local Development

1. Start the database and Redis:
\`\`\`bash
docker-compose up postgres redis
\`\`\`

2. Install backend dependencies:
\`\`\`bash
cd backend
npm install
\`\`\`

3. Install frontend dependencies:
\`\`\`bash
cd frontend
npm install
\`\`\`

4. Start backend development server:
\`\`\`bash
cd backend
npm run start:dev
\`\`\`

5. Start frontend development server:
\`\`\`bash
cd frontend
npm start
\`\`\`

## Architecture

### Backend Architecture

\`\`\`
src/
├── entities/           # TypeORM entities
├── auth/              # Authentication module
├── users/             # User management
├── comments/          # Comment CRUD operations
├── notifications/     # Notification system
└── main.ts           # Application entry point
\`\`\`

### Key Features Implementation

#### 1. Nested Comments
- Recursive comment structure using self-referencing foreign keys
- Efficient querying with proper indexing
- Hierarchical display in frontend

#### 2. Edit/Delete Grace Period
- Database-level computed columns for deadlines
- Automatic validation of time constraints
- Soft delete with restore functionality

#### 3. Notification System
- Real-time notifications for comment replies
- Read/unread status tracking
- Efficient querying with proper indexing

#### 4. Performance Optimizations
- Redis caching for frequently accessed data
- Database indexing on critical columns
- Query optimization with proper relations
- Rate limiting to prevent abuse

## Docker Configuration

### Services

- **postgres**: PostgreSQL 15 with initialization scripts
- **redis**: Redis 7 for caching
- **backend**: NestJS application
- **frontend**: React application with Nginx

### Environment Variables

\`\`\`env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/comment_app
REDIS_URL=redis://redis:6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=production
\`\`\`

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `username` (Unique)
- `email` (Unique)
- `password_hash`
- `created_at`, `updated_at`

### Comments Table
- `id` (UUID, Primary Key)
- `content` (Text)
- `user_id` (Foreign Key)
- `parent_id` (Self-referencing Foreign Key)
- `is_deleted` (Boolean)
- `deleted_at` (Timestamp)
- `edit_deadline` (Computed Column)
- `created_at`, `updated_at`

### Notifications Table
- `id` (UUID, Primary Key)
- `user_id` (Foreign Key)
- `comment_id` (Foreign Key)
- `type` (String)
- `message` (Text)
- `is_read` (Boolean)
- `created_at`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/profile` - Get user profile

### Comments
- `GET /api/comments` - Get all comments (nested)
- `POST /api/comments` - Create new comment
- `PATCH /api/comments/:id` - Update comment (within 15 min)
- `DELETE /api/comments/:id` - Delete comment
- `POST /api/comments/:id/restore` - Restore deleted comment (within 15 min)

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/mark-all-read` - Mark all as read

## Deployment

### Production Deployment

1. Update environment variables in `docker-compose.yml`
2. Build and deploy:
\`\`\`bash
docker-compose -f docker-compose.yml up -d
\`\`\`

### Scaling

The application is designed for horizontal scaling:

1. **Database**: Use PostgreSQL clustering or read replicas
2. **Cache**: Redis Cluster for distributed caching
3. **Backend**: Multiple NestJS instances behind a load balancer
4. **Frontend**: CDN distribution for static assets

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- SQL injection prevention with TypeORM

## Performance Considerations

- Redis caching for frequently accessed data
- Database indexing on critical queries
- Efficient nested comment loading
- Rate limiting to prevent abuse
- Connection pooling for database
- Optimized Docker images with multi-stage builds

## Testing

\`\`\`bash
## Backend tests
cd backend
npm run test

## Frontend tests
cd frontend
npm run test
\`\`\`

## License

MIT License - see LICENSE file for details
