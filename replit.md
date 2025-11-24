# PSITE Review Application

## Overview
A plastic surgery knowledge review application that helps users track their progress and master plastic surgery concepts through interactive questions and reference materials.

## Project Structure
This is a fullstack JavaScript application using:
- **Frontend**: React with TypeScript, Vite, Wouter for routing, TanStack Query for data fetching
- **Backend**: Express.js server
- **UI Components**: Shadcn UI components with Radix UI primitives
- **Styling**: Tailwind CSS with custom theming

## Directory Structure
```
client/           # Frontend React application
  src/
    components/   # React components including UI primitives
    pages/        # Page components (Index, NotFound)
    hooks/        # Custom React hooks
    lib/          # Utilities and query client
    types/        # TypeScript type definitions
    utils/        # Helper functions
server/           # Backend Express server
  index.ts        # Server entry point
  routes.ts       # API route definitions
  vite.ts         # Vite dev server setup
shared/           # Shared types between client and server
```

## Key Features
- Question review system with sections and subsections
- Reference text panel for study materials
- Progress tracking dashboard
- Search functionality
- Highlighting and note-taking capabilities
- Question filters and statistics

## Recent Changes (Migration from Lovable to Replit)
- **Date**: November 24, 2025
- Restructured project from Lovable's frontend-only structure to Replit's fullstack architecture
- Created Express backend with Vite middleware for development
- Updated routing from react-router-dom to wouter
- Configured proper TypeScript paths and aliases
- Set up fullstack development and production builds

## Running the Project
- **Development**: `npm run dev` - Starts Express server with Vite HMR on port 5000
- **Build**: `npm run build` - Builds the frontend for production
- **Production**: `npm run start` - Runs the production server

## Data Files
- `public/data/questions.xlsx` - Question bank
- `public/data/reference-text.docx` - Reference materials

## User Preferences
None documented yet.

## Architecture Notes
- Uses in-memory storage (no database required for current functionality)
- Client-side routing with wouter
- TanStack Query for state management and caching
- Hot module replacement (HMR) enabled in development
