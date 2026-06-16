# SaaS Dashboard Application

A modern, scalable SaaS dashboard built with Next.js 15, designed for managing users, projects, inventory, and more. This application provides a centralized interface with authentication, data visualization, and modular components for efficient business operations.

## Overview

This is a full-stack web application using the latest Next.js App Router, featuring:
- **Authentication**: Secure login system with JWT tokens
- **Dashboard**: Comprehensive admin panel with sidebar navigation
- **Data Management**: CRUD operations for multiple entities (users, projects, inventory, etc.)
- **UI Components**: Reusable Material-UI components with Tailwind CSS
- **API Integration**: RESTful API communication with external backend
- **Performance**: Optimized with lazy loading, caching, and production builds

## Technologies

### Core Framework
- **Next.js 15**: React framework with App Router for file-based routing, server components, and API routes
- **React 19**: Latest React version with concurrent features and hooks
- **TypeScript**: Type-safe development with strict mode and path aliases (`@/*`)

### UI & Styling
- **Material-UI (@mui/*)**: Component library including DataGrid, Charts, DatePickers, and Icons
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Emotion**: CSS-in-JS for styled components
- **Noto Sans**: Google font for consistent typography

### State & Data
- **TanStack React Query**: Server state management with caching, background updates, and optimistic updates
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation for forms and API responses
- **Axios**: HTTP client with request/response interceptors

### Authentication & Security
- **NextAuth.js**: Authentication library with credentials provider
- **JWT**: JSON Web Tokens for session management
- **Middleware**: Route protection and redirection logic

### Additional Libraries
- **date-fns / dayjs**: Date manipulation and formatting
- **js-cookie**: Client-side cookie management
- **@tanstack/react-table**: Table utilities for data display

### Development Tools
- **ESLint**: Code linting with Next.js configuration
- **TypeScript Compiler**: Type checking
- **PostCSS**: CSS processing with Tailwind
- **pnpm**: Fast package manager

## Architecture

### Folder Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (if any)
│   ├── dashboard/         # Protected dashboard routes
│   │   ├── accounts/
│   │   ├── affiliates/
│   │   ├── clients/
│   │   ├── inventory/
│   │   ├── projects/
│   │   ├── reports/
│   │   └── staff/
│   ├── login/             # Authentication page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home (redirects to login)
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── common/           # Shared components
│   ├── dashboard/        # Dashboard-specific components
│   ├── generic/          # Reusable generic components
│   └── layout/           # Layout components (Navbar, Sidebar)
├── hooks/                # Custom React hooks for data fetching
├── lib/                  # Utility libraries (auth, axios)
├── providers/            # React context providers
├── types/                # TypeScript type definitions
├── schema/               # Zod validation schemas
├── utils/                # Helper functions
└── config/               # Constants and configuration
```

### Key Architectural Patterns

#### Authentication Flow
- **NextAuth Configuration**: [src/lib/auth.ts](src/lib/auth.ts) sets up credentials provider
- **Middleware Protection**: [src/middleware.ts](src/middleware.ts) handles route access
- **Session Management**: JWT tokens stored in NextAuth sessions
- **API Integration**: Axios interceptors add Bearer tokens to requests

#### Data Fetching
- **Custom Hooks**: [src/hooks/useUsers.ts](src/hooks/useUsers.ts) wraps TanStack Query
- **Query Keys**: Centralized key management for cache invalidation
- **Error Handling**: Automatic retry and error states
- **Caching**: Configurable stale time and garbage collection

#### Component Architecture
- **Generic Components**: Reusable components like `GenericDataTable`, `GenericForm`
- **Lazy Loading**: [src/utils/lazyLoad.tsx](src/utils/lazyLoad.tsx) for performance
- **Provider Pattern**: AppProviders wrap the entire application

## Key Features

### Authentication System
- Secure login with username/password
- JWT-based session management
- Automatic logout on token expiration
- Protected routes with middleware

### Dashboard Interface
- Responsive sidebar navigation
- Collapsible menu for better UX
- Role-based access (if implemented)
- Loading states and error boundaries

### Data Management
- **Users**: CRUD operations with search, pagination, and filtering
- **Projects**: Project management with status tracking
- **Inventory**: Stock management and tracking
- **Staff**: Employee management with designations
- **Reports**: Data visualization with charts
- **Clients/Accounts/Affiliates**: Customer relationship management

### UI Components
- **Data Tables**: Sortable, filterable tables with pagination
- **Forms**: Validated forms with error handling
- **Charts**: Bar, pie, and line charts for analytics
- **Modals**: Reusable modal dialogs
- **File Uploads**: Document and media upload functionality

## How It Works

### Application Flow
1. **Entry Point**: User visits `/` → Redirected to `/login`
2. **Authentication**: Login form submits credentials to NextAuth
3. **API Call**: NextAuth calls external API (`/auth/login`) for verification
4. **Session Creation**: JWT token stored in session on successful login
5. **Dashboard Access**: User redirected to `/dashboard`
6. **Data Loading**: Components use hooks to fetch data via React Query
7. **API Requests**: Axios adds Bearer token to all authenticated requests
8. **Error Handling**: 401 responses trigger automatic logout

### Data Fetching Example
```typescript
// src/hooks/useUsers.ts
export function useUsersSearch(params: SearchParams = {}) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.search(params),
    queryFn: () =>
      ApiService.get<UserSearchResponse>(`/users/search?${queryParams}`),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### Authentication Example
```typescript
// src/hooks/useAuth.ts
const login = async (credentials: LoginRequest) => {
  const result = await signIn("credentials", {
    ...credentials,
    redirect: false,
  });
  if (result?.ok) {
    await update(); // Update session
    window.location.href = "/dashboard";
  }
};
```

### Component Example
```tsx
// src/components/generic/GenericDataTable.tsx
<GenericDataTable
  data={users}
  columns={userColumns}
  loading={isLoading}
  searchable
  searchPlaceholder="Search users..."
/>
```

## Tools and Configuration

### Build Tools
- **Next.js CLI**: `next dev`, `next build`, `next start`
- **TypeScript**: `tsc --noEmit` for type checking
- **ESLint**: `eslint` for code linting, `eslint --fix` for auto-fix

### Configuration Files
- **[next.config.ts](next.config.ts)**: Image optimization, caching headers, turbo disabled
- **[tsconfig.json](tsconfig.json)**: TypeScript config with strict mode and paths
- **[eslint.config.mjs](eslint.config.mjs)**: ESLint configuration
- **[postcss.config.mjs](postcss.config.mjs)**: PostCSS with Tailwind
- **[tailwind.config.js](tailwind.config.js)**: Tailwind CSS configuration

### Environment Variables
- `NEXTAUTH_SECRET`: Secret key for NextAuth JWT
- `NEXTAUTH_URL`: Base URL for NextAuth
- `NEXT_PUBLIC_API_URL`: External API base URL (e.g., `https://fast.saqod.com/api/v1`)

### Docker Configuration
- **Multi-stage Build**: Dependencies, builder, and runner stages
- **Base Image**: Node 20 Alpine for smaller size
- **Standalone Output**: Optimized for production deployment

## Installation and Setup

### Prerequisites
- Node.js 20+
- pnpm (recommended) or npm/yarn
- Docker (for containerized deployment)

### Local Development
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nextjs-v3-updated
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create `.env.local`:
   ```env
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   NEXT_PUBLIC_API_URL=https://fast.saqod.com/api/v1
   ```

4. **Run development server**
   ```bash
   pnpm dev
   ```

5. **Open browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Build
1. **Build the application**
   ```bash
   pnpm build
   ```

2. **Start production server**
   ```bash
   pnpm start
   ```

### Docker Deployment
1. **Build Docker image**
   ```bash
   docker build -t saas-dashboard .
   ```

2. **Run container**
   ```bash
   docker run -p 3000:3000 saas-dashboard
   ```

## Usage

### API Testing
Use the provided test script to verify API connectivity:
```bash
./test-api.sh
```

This script:
- Tests login endpoint
- Retrieves authentication token
- Tests various API endpoints (users, projects, etc.)

### Development Workflow
1. **Code Changes**: Edit files in `src/` directory
2. **Type Checking**: Run `pnpm type-check`
3. **Linting**: Run `pnpm lint` and `pnpm lint:fix`
4. **Testing**: Manual testing or add unit tests as needed

### Adding New Features
1. **Create API Hook**: Add to `src/hooks/`
2. **Create Component**: Add to appropriate `src/components/` folder
3. **Add Route**: Create page in `src/app/`
4. **Update Navigation**: Modify `DashboardSidebar.tsx`

## Troubleshooting

### Common Issues

#### Authentication Problems
- **Issue**: Login fails with "Invalid credentials"
- **Solution**: Verify API URL and credentials in `.env.local`
- **Check**: Ensure external API is accessible

- **Issue**: Redirect loop between login and dashboard
- **Solution**: Check `NEXTAUTH_SECRET` is set correctly
- **Check**: Clear browser cookies and local storage

#### API Connection Issues
- **Issue**: "Network Error" or 401 responses
- **Solution**: Verify `NEXT_PUBLIC_API_URL` is correct
- **Check**: Run `./test-api.sh` to test API connectivity

- **Issue**: Data not loading in components
- **Solution**: Check React Query devtools for errors
- **Check**: Verify API endpoints return expected data structure

#### Build Errors
- **Issue**: TypeScript compilation errors
- **Solution**: Run `pnpm type-check` for detailed errors
- **Check**: Ensure all imports are correct and types match

- **Issue**: ESLint errors blocking build
- **Solution**: Run `pnpm lint:fix` to auto-fix issues
- **Check**: Review remaining errors manually

#### Docker Issues
- **Issue**: Container fails to start
- **Solution**: Check environment variables are passed correctly
- **Check**: Verify Node.js version compatibility

### Debug Mode
Enable React Query devtools in development:
- Devtools are included and visible at `http://localhost:3000`

### Logs and Monitoring
- Check browser console for client-side errors
- Check server logs for API and build errors
- Use Next.js development mode for detailed error messages

## Diagrams

### Authentication Flow
```
User visits /login
    ↓
Login form submits credentials
    ↓
NextAuth authorize() function
    ↓
API call to /auth/login
    ↓
Success: JWT token returned
    ↓
NextAuth creates session
    ↓
User redirected to /dashboard
    ↓
Middleware checks session for protected routes
```

### Data Fetching Flow
```
Component mounts
    ↓
Hook called (e.g., useUsers())
    ↓
useQuery executes
    ↓
Check cache (staleTime)
    ↓
If stale: Axios GET request
    ↓
Add Bearer token via interceptor
    ↓
API responds with data
    ↓
Data cached by React Query
    ↓
Component re-renders with data
    ↓
Background refetch if needed
```

### Component Architecture
```
App (Root)
├── AppProviders
│   ├── SessionProvider (NextAuth)
│   └── QueryProvider (React Query)
├── ConditionalLayout
│   ├── Navbar (if authenticated)
│   ├── DashboardSidebar (if on dashboard)
│   └── Main Content
└── Pages (login, dashboard, etc.)
```

## Contributing

1. Follow the existing code style and patterns
2. Add TypeScript types for new data structures
3. Update hooks for new API endpoints
4. Test changes locally before committing
5. Run linting and type checking before PR

## License

This project is private and proprietary.
