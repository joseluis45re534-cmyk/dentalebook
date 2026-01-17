# DentalEdu Pro

## Overview

DentalEdu Pro is a budget-friendly e-commerce platform for dental education materials. It provides dental students and practitioners access to courses, ebooks, and training materials at affordable prices. The application features a product catalog with search and filtering, shopping cart functionality, and a request system for users to suggest new materials.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, React Context for cart state
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Build Tool**: Vite with HMR support

The frontend follows a component-based architecture with:
- Reusable UI components in `client/src/components/ui/` (shadcn/ui)
- Feature components in `client/src/components/`
- Page components in `client/src/pages/`
- Custom hooks in `client/src/hooks/`
- Shared utilities and context providers in `client/src/lib/`

### Backend Architecture
- **Framework**: Express 5 on Node.js
- **API Design**: RESTful JSON API endpoints under `/api/`
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Validation**: Zod for runtime type checking

The server follows a modular structure:
- `server/index.ts`: Express app setup and middleware
- `server/routes.ts`: API route definitions
- `server/storage.ts`: Data access layer with product storage interface
- `server/static.ts`: Static file serving for production
- `server/vite.ts`: Vite dev server integration

### Data Storage
- PostgreSQL database accessed via Drizzle ORM
- Schema defined in `shared/schema.ts` using Drizzle and Zod
- Migrations managed via `drizzle-kit push`
- Products include pricing logic supporting sale prices

### Key Design Patterns
- **Shared Schema**: Types and validation schemas in `shared/` directory are used by both frontend and backend
- **API Query Builder**: Frontend uses a custom query function that builds URLs from query key parameters
- **Cart Persistence**: Shopping cart stored in localStorage with React Context for state management
- **File-based Product Storage**: Products loaded from CSV with category determination and price parsing logic
- **Batch Product Fetching**: Cart uses POST `/api/products/batch` endpoint to fetch only needed products by ID

## Recent Changes (Jan 2026)
- Fixed ProductDetail query key to use single string format for proper caching
- Added `/api/products/batch` POST endpoint for efficient cart product fetching
- Optimized Cart page to fetch only cart items instead of all products
- Fixed Badge hover states to comply with design system guidelines
- Simplified CSV parser filtering for better product validation

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management
- **connect-pg-simple**: Session storage (available but not actively used)

### UI Components
- **shadcn/ui**: Complete component library built on Radix UI primitives
- **Radix UI**: Accessible, unstyled UI primitives (dialog, dropdown, tabs, etc.)
- **Lucide React**: Icon library

### Build & Development
- **Vite**: Frontend build tool with React plugin
- **esbuild**: Server bundling for production
- **TypeScript**: Full type safety across the stack

### Replit-specific
- **@replit/vite-plugin-runtime-error-modal**: Error overlay for development
- **@replit/vite-plugin-cartographer**: Development tooling
- **@replit/vite-plugin-dev-banner**: Development environment indicator