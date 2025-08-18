# Project Structure

This project follows a **feature-based architecture** with clear separation of concerns, making it maintainable and scalable.

## 📁 Directory Structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # REST API endpoints
│   ├── login/             # Authentication pages
│   ├── profile/           # User profile management
│   ├── resume/            # Resume management pages
│   └── globals.css        # Global styles
├── features/              # Feature-based modules
│   ├── auth/              # Authentication feature (future)
│   └── resume/            # Resume management feature
│       ├── ResumeEditor/  # Resume editor components
│       ├── ResumeEditorV2.tsx
│       ├── ClassicResumeTemplate.tsx
│       ├── ModernResumeTemplate.tsx
│       └── ResumeTemplateRegistry.tsx
├── shared/                # Shared/common code
│   ├── components/        # Reusable UI components
│   ├── types/            # Shared TypeScript types
│   └── constants/        # Application constants
├── services/              # Business logic and external services
│   ├── pdfGenerator.ts   # PDF generation service
│   ├── renderResumeToHtml.ts
│   ├── resumeDataTransformer.ts
│   └── imageStorage.ts   # Image handling service
├── lib/                   # Core utilities and configurations
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Database client
│   ├── store.ts          # Zustand state management
│   ├── theme.ts          # Material-UI theme
│   └── utils.ts          # Utility functions
└── hooks/                 # Custom React hooks
```

## 🏗️ Architecture Principles

### **Feature-Based Organization**
- **`features/`**: Each major feature has its own directory
- **`shared/`**: Common components and utilities used across features
- **`services/`**: Business logic separated from UI components

### **Separation of Concerns**
- **Components**: Pure UI components with minimal business logic
- **Services**: Business logic and external API calls
- **Hooks**: Custom React hooks for state management
- **Types**: TypeScript definitions for type safety

### **Import Patterns**
```typescript
// Clean imports using index files
import { DashboardLayout } from '@/shared/components';
import { ResumeEditorV2 } from '@/features/resume';
import { generatePdf } from '@/services';
```

## 🔧 Development Guidelines

### **Adding New Features**
1. Create a new directory in `features/`
2. Include components, hooks, and types specific to that feature
3. Export through an `index.ts` file for clean imports

### **Shared Components**
- Place reusable components in `shared/components/`
- Export through `shared/components/index.ts`
- Keep components generic and configurable

### **Services**
- Business logic goes in `services/`
- Each service should have a single responsibility
- Export through `services/index.ts`

## 📚 Key Technologies

- **Next.js 15**: App Router for modern React development
- **TypeScript**: Full type safety across the application
- **Material-UI**: Professional UI component library
- **Prisma**: Type-safe database operations
- **Zustand**: Lightweight state management
- **Puppeteer**: Server-side PDF generation

## 🎯 Benefits for Recruiters

- **Clean Architecture**: Follows industry best practices
- **Maintainable Code**: Easy to understand and modify
- **Scalable Structure**: Can grow with business needs
- **Professional Standards**: Industry-standard folder organization
- **Type Safety**: Full TypeScript coverage for reliability
