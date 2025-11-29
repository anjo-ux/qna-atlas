# PSITE Review Application

## Overview
A plastic surgery knowledge review application that helps users track their progress and master plastic surgery concepts through interactive questions and reference materials.

## Project Structure
This is a fullstack JavaScript application using:
- **Frontend**: React with TypeScript, Vite, Wouter for routing, TanStack Query for data fetching
- **Backend**: Express.js server with Replit Auth integration
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: Shadcn UI components with Radix UI primitives
- **Styling**: Tailwind CSS with custom theming

## Directory Structure
```
client/           # Frontend React application
  src/
    components/   # React components including UI primitives
    pages/        # Page components (Index, NotFound, Landing)
    hooks/        # Custom React hooks (useAuth, useTestSessions)
    lib/          # Utilities and query client
    types/        # TypeScript type definitions
    utils/        # Helper functions
server/           # Backend Express server
  index.ts        # Server entry point
  routes.ts       # API route definitions
  storage.ts      # Database storage layer
  replitAuth.ts   # Replit Auth integration
  db.ts           # Drizzle database connection
  vite.ts         # Vite dev server setup
shared/           # Shared types between client and server
  schema.ts       # Database schema definitions
  schemas.ts      # Zod validation schemas
```

## Key Features
- **Authentication**: Replit Auth integration supporting Google, GitHub, X, Apple, and email/password login
- **Database Persistence**: PostgreSQL database for user data and test session tracking
- **Question review system** with sections and subsections
- **Progress tracking dashboard** with analytics
- **Test sessions** that can be resumed across devices
- **Reference text panel** for study materials
- **Search functionality** for questions
- **Highlighting and note-taking capabilities**
- **Question filters and statistics**

## Recent Changes

### November 29, 2025
- **Temporary Password Recovery System**:
  - Implemented forgot password flow with 12-character temporary passwords
  - Added `passwordNeedsReset` flag to users table for tracking password recovery state
  - Users logging in with temporary passwords are prompted to set permanent password
  - Backend endpoints: `/api/auth/forgot-password` and `/api/auth/change-password`
  - Frontend modals for both password recovery request and password change
  - **Email Configuration**: Currently logs temporary passwords to server console for development
    - To enable production email: Set up SendGrid integration with `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL` environment variables
    - See customAuth.ts for SendGrid implementation notes

### November 26, 2025
- **Glassmorphism UI Implementation**:
  - Implemented comprehensive glassmorphism design system with Card variant="glass"
  - Created pastel gradient background (purple → lavender → pink)
  - Updated color scheme to vibrant purple/magenta primary with pink accents
  - Added frosted glass effects with 32px backdrop blur and proper transparency
  - Updated all major components to use glass variant consistently
- **Typography Updates**:
  - Configured SF Pro font stack as primary font family
  - Font fallback chain: "SF Pro" → "SF Pro Display" → "SF Pro Text" → -apple-system → BlinkMacSystemFont → sans-serif
  - Updated both CSS and Tailwind config for consistency

### November 25, 2025
- **Bug Fixes**:
  - Fixed test deletion: Tests now properly disappear from recent tests list after deletion
    - Added proper 204 (No Content) response handling in apiRequest function
    - Updated deleteSession to use async/await for proper cache invalidation
  - Fixed duplicate close button in mobile sidebar
    - Updated CSS selector to properly hide SheetContent's built-in close button

### November 24, 2025
- **Authentication & Database Integration**:
  - Implemented Replit Auth with OpenID Connect for user authentication
  - Created PostgreSQL database with tables: users, sessions, testSessions, questionResponses
  - Built protected API routes with authentication middleware
  - Migrated test session storage from localStorage to database
  - Created Landing page for unauthenticated users
  - Added user profile menu with logout functionality

## Running the Project
- **Development**: `npm run dev` - Starts Express server with Vite HMR on port 5000
- **Build**: `npm run build` - Builds the frontend for production
- **Production**: `npm run start` - Runs the production server
- **Database Push**: `npm run db:push` - Syncs database schema changes

## Data Files
- `public/data/questions.xlsx` - Question bank
- `public/data/reference-text.docx` - Reference materials

## User Preferences
None documented yet.

## Architecture Notes
- Uses PostgreSQL database with Drizzle ORM
- Client-side routing with wouter
- TanStack Query for state management and caching
- Hot module replacement (HMR) enabled in development
- Session management with connect-pg-simple
- Protected API routes using isAuthenticated middleware

## Known Limitations
- **Question Responses**: While the database schema and API endpoints support saving individual question responses, the frontend integration is not yet complete. Currently, test sessions store questions in the database but individual answers are not persisted/restored. This means users can create and resume test sessions, but their answer progress within a session is not saved to the database yet.

## Security
- Authentication tokens managed by Replit Auth with OpenID Connect
- Protected API routes verify user ownership of resources
- Input validation using Zod schemas
- Session data stored securely in database
- CSRF protection via Express session middleware
