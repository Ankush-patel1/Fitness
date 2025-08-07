# FitTrack Pro - Fitness Tracking Application

## Overview

FitTrack Pro is a comprehensive fitness tracking web application built with React and Express.js. The application allows users to log workouts, track health metrics, schedule future workouts, and monitor their fitness progress over time. It features a modern UI built with shadcn/ui components and provides a complete user management system with authentication and personalized fitness goals.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing with protected routes
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: shadcn/ui component library built on Radix UI primitives with Tailwind CSS
- **Forms**: React Hook Form with Zod validation for robust form handling
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **Authentication**: Passport.js with local strategy using session-based authentication
- **Session Management**: Express sessions with memory store (configurable for production)
- **Password Security**: Node.js crypto module with scrypt for secure password hashing
- **API Design**: RESTful API endpoints with JSON responses and proper error handling
- **Database Integration**: Drizzle ORM for type-safe database operations

### Data Storage Architecture
- **Database**: PostgreSQL with Drizzle ORM for schema management and queries
- **Schema Design**: Four main entities (users, workouts, health metrics, scheduled workouts) with proper relationships
- **Data Validation**: Zod schemas shared between frontend and backend for consistent validation
- **Migrations**: Drizzle Kit for database schema migrations and version control

### Authentication & Authorization
- **Strategy**: Session-based authentication with secure cookie configuration
- **Password Security**: Salted password hashing using scrypt algorithm
- **Session Storage**: Configurable session store (memory for development, can be extended for production)
- **Route Protection**: Middleware-based authentication checks for API endpoints
- **User Management**: Complete user lifecycle including registration, login, and profile management

### Application Features
- **User Onboarding**: Guided setup for fitness goals, weight targets, and workout frequency
- **Workout Tracking**: Log completed workouts with exercises, duration, and notes
- **Health Metrics**: Track weight, sleep quality, water intake, and daily wellness indicators
- **Workout Scheduling**: Plan future workouts with date/time scheduling
- **Progress Monitoring**: Streak tracking and fitness goal progress visualization
- **Responsive Design**: Mobile-first design that works across all device sizes

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Neon Database serverless driver for PostgreSQL connections
- **drizzle-orm**: Type-safe ORM for database operations and schema management
- **drizzle-kit**: CLI tool for database migrations and schema management

### Authentication & Security
- **passport**: Authentication middleware for Node.js with strategy-based authentication
- **passport-local**: Local username/password authentication strategy
- **express-session**: Session middleware for Express.js applications
- **connect-pg-simple**: PostgreSQL session store for production session persistence

### Frontend UI & Interaction
- **@radix-ui/**: Complete suite of accessible, unstyled UI primitives for complex components
- **@tanstack/react-query**: Powerful data fetching and state management for React applications
- **wouter**: Minimalist routing library for React applications
- **react-hook-form**: Performant, flexible forms with easy validation

### Development & Build Tools
- **vite**: Next-generation frontend build tool with fast HMR and optimized builds
- **tailwindcss**: Utility-first CSS framework for rapid UI development
- **typescript**: Static type checking for enhanced developer experience and code reliability
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay for better debugging experience

### Validation & Type Safety
- **zod**: TypeScript-first schema validation library shared across frontend and backend
- **@hookform/resolvers**: Form validation resolvers for integrating Zod with React Hook Form
- **drizzle-zod**: Integration between Drizzle ORM and Zod for schema validation