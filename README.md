# AI Resume Builder

A comprehensive, feature-rich resume builder application built with Next.js 15, Prisma, Material-UI, and modern state management. Create professional resumes with multiple templates, drag-and-drop editing, and advanced customization options.

## ✨ Features

### 🎯 Core Features

- **Multi-Template System**: Choose between Classic and Modern resume templates
- **Advanced Resume Editor**: Comprehensive editor with drag-and-drop section management
- **Real-time Preview**: Live preview as you edit with instant updates
- **Professional PDF Export**: Generate high-quality PDF resumes with custom export settings
- **User Authentication**: Secure login and registration with NextAuth.js
- **Profile Management**: Upload and manage profile pictures with file storage
- **Responsive Design**: Mobile-friendly interface built with Material-UI v7

### 🚀 Advanced Saving System

The AI Resume Builder features a sophisticated **"Optimistic Updates with Background Synchronization"** saving system that provides lightning-fast performance similar to Google Docs and Notion:

#### **How It Works**

1. **Instant UI Updates**: Changes appear immediately as you type (no waiting)
2. **Local Persistence**: Data saves to localStorage in sub-milliseconds
3. **Background Synchronization**: Changes sync to server automatically in the background
4. **Smart Batching**: Multiple rapid changes are batched for efficient server updates
5. **Cross-Page Persistence**: Your work survives page navigation and refreshes

#### **Technical Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Input    │───▶│  React State    │───▶│   UI Updates    │
│                 │    │                 │    │   (Instant)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  localStorage   │
                       │   (Cache)       │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Save Queue     │
                       │  (Background)   │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Server API    │
                       │  (Database)     │
                       └─────────────────┘
```

#### **Key Benefits**

- **⚡ Lightning-Fast**: Changes save instantly (like JobRight.AI)
- **🔄 Always in Sync**: Data automatically syncs across devices
- **💾 Never Lose Work**: Changes persist even if you navigate away
- **📱 Offline Support**: Works without internet connection
- **🎯 Smart Throttling**: Prevents excessive server requests
- **🛡️ Data Safety**: Server remains source of truth

#### **Save Queue System**

The application uses an intelligent save queue that:
- **Batches changes** every 2 seconds for optimal performance
- **Prioritizes latest data** (most recent changes win)
- **Handles network failures** gracefully with retry logic
- **Persists across sessions** using localStorage
- **Provides real-time status** for debugging and monitoring

### 📝 Resume Sections

- **Personal Information**: Name, contact details, professional summary, social links
- **Professional Summary**: Compelling career overview
- **Work Experience**: Detailed job history with bullet points and achievements
- **Education**: Academic background with GPA and dates
- **Technical Skills**: Skills with proficiency ratings (1-10 scale)
- **Projects**: Portfolio projects with technologies and descriptions
- **Courses & Certifications**: Professional development and learning
- **Publications**: Academic and professional publications
- **Awards & Recognition**: Achievements and honors
- **Volunteer Experience**: Community service and volunteer work
- **Languages**: Language proficiency levels
- **Interests**: Personal interests with icons
- **References**: Professional references with contact information

### 🎨 Template Features

- **Classic Template**: Traditional, professional layout with clean typography
- **Modern Template**: Contemporary design with enhanced visual hierarchy
- **Customizable Styling**: Font sizes, colors, and layout options
- **Section Ordering**: Drag-and-drop to reorder resume sections
- **Export Settings**: Customize PDF generation parameters

### 🔧 Advanced Features

- **Drag & Drop Interface**: Intuitive section reordering and management
- **Auto-save**: Automatic saving of resume drafts
- **Section Management**: Add, remove, and customize resume sections
- **Profile Picture Support**: Upload and manage profile pictures
- **Export Customization**: Fine-tune PDF output settings
- **Responsive Layouts**: Optimized for all device sizes

## 🛠️ Technical Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI Library**: Material-UI (MUI) v7
- **Styling**: Emotion (CSS-in-JS) with custom theme system
- **State Management**: Zustand with persistence and devtools
- **Icons**: Material Icons and React Icons
- **Drag & Drop**: Hello Pangea DnD

### Backend
- **Runtime**: Node.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v4 with Prisma adapter
- **File Storage**: Local file system with profile picture support
- **PDF Generation**: Puppeteer with HTML templates

### Saving System Architecture
- **Optimistic Updates**: Instant UI feedback with React state management
- **Local Persistence**: localStorage-based caching for instant saves
- **Background Synchronization**: Queue-based server sync with smart batching
- **Cross-Session Persistence**: Save queue survives page navigation and refreshes
- **Conflict Resolution**: Server data takes precedence over local changes
- **Offline Support**: Works without internet connection using local cache

### Development Tools
- **Language**: TypeScript 5
- **Linting**: ESLint 9 with Next.js configuration
- **Package Manager**: npm/pnpm support
- **Database Migrations**: Prisma migrations with auto-generation
- **Testing**: Jest 30 with React Testing Library and comprehensive coverage

## 🧪 Testing

The AI Resume Builder includes a comprehensive testing suite built with Jest and React Testing Library, ensuring code quality and reliability.

### Testing Stack

- **Jest 30**: Modern JavaScript testing framework with enhanced performance
- **React Testing Library**: User-centric testing utilities for React components
- **Jest DOM**: Custom Jest matchers for DOM testing
- **TypeScript Support**: Full type safety in tests with custom type definitions

### Test Coverage Requirements

The project maintains strict testing standards with the following coverage thresholds:
- **Statements**: 70%
- **Branches**: 70%
- **Lines**: 70%
- **Functions**: 70%

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests in CI mode
npm run test:ci

# Run specific test file
npm test -- src/features/resume/ResumeEditor/components/__tests__/AlertMessages.test.tsx

# Run tests matching a pattern
npm test -- --testNamePattern="should render"
```

### Test File Structure

Tests are organized alongside the code they test, following the `__tests__` convention:

```
src/
├── features/
│   └── resume/
│       ├── ResumeEditor/
│       │   ├── components/
│       │   │   ├── __tests__/           # Component tests
│       │   │   │   ├── AlertMessages.test.tsx
│       │   │   │   └── ...
│       │   │   └── AlertMessages.tsx
│       │   └── hooks/
│       │       ├── __tests__/           # Hook tests
│       │       │   ├── useDatePicker.test.ts
│       │       │   └── ...
│       │       └── useDatePicker.ts
│       └── __tests__/                   # Feature-level tests
│           └── ResumeTemplateRegistry.test.tsx
├── lib/
│   ├── __tests__/                       # Utility tests
│   │   ├── store.test.ts
│   │   └── utils.test.ts
│   └── store.ts
└── services/
    ├── __tests__/                       # Service tests
    │   ├── imageStorage.test.ts
    │   ├── pdfGenerator.test.ts
    │   └── resumeDataTransformer.test.ts
    └── imageStorage.ts
```

### Writing Tests

#### Component Testing

```tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import { AlertMessages } from '../AlertMessages'

describe('AlertMessages', () => {
  it('should render nothing when no messages are provided', () => {
    render(<AlertMessages />)
    
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('should render error message when error prop is provided', () => {
    const errorMessage = 'Something went wrong!'
    render(<AlertMessages error={errorMessage} />)
    
    const errorAlert = screen.getByRole('alert')
    expect(errorAlert).toBeInTheDocument()
    expect(errorAlert).toHaveTextContent(errorMessage)
    expect(errorAlert).toHaveClass('MuiAlert-standardError')
  })
})
```

#### Hook Testing

```tsx
import { renderHook, act } from '@testing-library/react'
import { useDatePicker } from '../useDatePicker'

describe('useDatePicker', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useDatePicker())
    
    expect(result.current.selectedDate).toBeNull()
    expect(result.current.isOpen).toBe(false)
  })

  it('should open date picker when openPicker is called', () => {
    const { result } = renderHook(() => useDatePicker())
    
    act(() => {
      result.current.openPicker()
    })
    
    expect(result.current.isOpen).toBe(true)
  })
})
```

#### Service Testing

```tsx
import { resumeDataTransformer } from '../resumeDataTransformer'

describe('resumeDataTransformer', () => {
  it('should transform raw data to resume format', () => {
    const rawData = { /* test data */ }
    const result = resumeDataTransformer.transform(rawData)
    
    expect(result).toHaveProperty('personalInfo')
    expect(result).toHaveProperty('workExperience')
    expect(result.workExperience).toHaveLength(2)
  })
})
```

### Testing Utilities

#### Custom Jest Matchers

The project includes custom Jest DOM matchers for enhanced testing:

```tsx
// Available custom matchers
expect(element).toBeInTheDocument()
expect(element).toHaveTextContent('expected text')
expect(element).toHaveClass('expected-class')
```

#### Test Setup

Tests are configured with comprehensive mocks and setup:

```tsx
// jest.setup.js
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => <img {...props} />,
}))

// Mock browser APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})
```

### Testing Best Practices

#### 1. **User-Centric Testing**
- Test behavior, not implementation
- Use semantic queries (`getByRole`, `getByLabelText`)
- Avoid testing internal state or implementation details

#### 2. **Accessibility Testing**
- Test with screen readers in mind
- Verify proper ARIA labels and roles
- Ensure keyboard navigation works correctly

#### 3. **Component Isolation**
- Mock external dependencies
- Test components in isolation
- Use proper cleanup between tests

#### 4. **Data Testing**
- Test with realistic data structures
- Verify data transformations
- Test edge cases and error conditions

#### 5. **Performance Testing**
- Test component rendering performance
- Verify efficient re-renders
- Test memory leaks and cleanup

### Mocking Strategies

#### API Mocking

```tsx
// Mock API responses
jest.mock('../api', () => ({
  fetchResume: jest.fn(() => Promise.resolve(mockResumeData)),
  saveResume: jest.fn(() => Promise.resolve({ success: true })),
}))

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockData),
  })
)
```

#### Component Mocking

```tsx
// Mock complex components
jest.mock('../ComplexComponent', () => {
  return function MockComplexComponent({ data }: any) {
    return <div data-testid="complex-component">{data.title}</div>
  }
})
```

### Debugging Tests

#### Console Logging

```tsx
// Enable verbose logging in tests
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {})
})

afterEach(() => {
  console.log.mockRestore()
})
```

#### Test Debugging

```tsx
// Debug test output
it('should work correctly', () => {
  const { debug } = render(<Component />)
  debug() // Prints the rendered HTML
  
  // Or debug specific elements
  const element = screen.getByText('Hello')
  debug(element)
})
```

### Continuous Integration

Tests are automatically run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: npm run test:ci
  
- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

### Coverage Reports

Generate detailed coverage reports:

```bash
npm run test:coverage
```

Coverage reports include:
- **Line Coverage**: Percentage of code lines executed
- **Branch Coverage**: Percentage of conditional branches tested
- **Function Coverage**: Percentage of functions called
- **Statement Coverage**: Overall code execution percentage

### Testing Checklist

Before submitting code, ensure:

- [ ] All new components have tests
- [ ] All new hooks have tests
- [ ] All new services have tests
- [ ] Tests cover happy path scenarios
- [ ] Tests cover error conditions
- [ ] Tests cover edge cases
- [ ] Coverage meets 70% threshold
- [ ] Tests pass in CI environment
- [ ] No console warnings in tests
- [ ] Proper cleanup in tests

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/ai-resume-builder.git
   cd ai-resume-builder
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/resume_builder"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Database Setup**:
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   
   # (Optional) Seed database with sample data
   npx prisma db seed
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```

6. **Open Application**:
   Navigate to `http://localhost:3000`

## 📖 Usage Guide

### Creating Your First Resume

1. **Sign Up/Login**: Create an account or sign in
2. **Create Resume**: Click "Create New Resume" from the dashboard
3. **Choose Template**: Select between Classic or Modern template
4. **Fill Information**: Complete personal details and professional summary
5. **Add Sections**: Use the section manager to add relevant resume sections
6. **Customize Content**: Fill in work experience, education, skills, and other sections
7. **Preview & Edit**: Use the live preview to see how your resume looks
8. **Export**: Download your resume as a professional PDF

### Advanced Features

- **Section Management**: Drag and drop sections to reorder them
- **Template Switching**: Change templates at any time
- **Profile Pictures**: Upload a professional photo for your resume
- **Export Settings**: Customize PDF generation parameters
- **Auto-save**: Your work is automatically saved as you type

## 🗄️ Database Schema

The application uses a comprehensive database schema with the following main models:

### Core Models
- **User**: Authentication, profile information, and preferences
- **Resume**: Main resume data with template and export settings
- **ProfilePicture**: User profile picture management

### Resume Content Models
- **PersonalInfo**: Contact details and professional summary
- **WorkExperience**: Job history with bullet points and achievements
- **Education**: Academic background and qualifications
- **Strength**: Skills with proficiency ratings
- **Project**: Portfolio projects and technologies
- **Course**: Professional development and certifications
- **Publication**: Academic and professional publications
- **Award**: Recognition and achievements
- **VolunteerExperience**: Community service
- **Language**: Language proficiency
- **Interest**: Personal interests and hobbies
- **Reference**: Professional references

### Advanced Features
- **SectionOrder**: Custom ordering of resume sections
- **ExportSettings**: PDF generation customization
- **DeletedSections**: Track removed sections for template switching

## 🔧 Technical Implementation

### Saving System Deep Dive

The application implements a sophisticated multi-layer persistence strategy that ensures both performance and data integrity:

#### **1. React State Layer (UI)**
```typescript
// Instant UI updates with optimistic state management
const setResumeDataWithSave = useCallback((updater) => {
  setResumeData(prev => {
    const newData = typeof updater === 'function' ? updater(prev) : updater;
    
    // Save to localStorage immediately
    saveToLocalStorage(newData, profileDataRef.current, sectionOrderRef.current);
    
    // Queue background server sync
    if (saveQueueRef.current) {
      saveQueueRef.current.add(newData, profileDataRef.current, sectionOrderRef.current);
    }
    
    return newData;
  });
}, [saveToLocalStorage]);
```

#### **2. Local Storage Layer (Cache)**
```typescript
// Sub-millisecond local persistence
const saveToLocalStorage = useCallback((data, profileData, sectionOrder) => {
  if (!resumeId) return;
  
  const saveData = {
    resumeData: data,
    profileData,
    sectionOrder,
    timestamp: Date.now()
  };
  
  localStorage.setItem(`resume-draft-${resumeId}`, JSON.stringify(saveData));
  setHasUnsavedChanges(true);
}, [resumeId]);
```

#### **3. Save Queue Layer (Background Sync)**
```typescript
class SaveQueue {
  private queue: Array<{ data: ResumeData; profileData: ProfileData; sectionOrder: string[]; timestamp: number }> = [];
  private processing = false;
  private lastSaveTime = 0;
  private saveInterval = 2000; // Save every 2 seconds max
  
  add(data: ResumeData, profileData: ProfileData, sectionOrder: string[]) {
    const now = Date.now();
    
    // Add to queue with timestamp
    this.queue.push({ data, profileData, sectionOrder, timestamp: now });
    
    // Smart processing logic
    if (!this.processing) {
      if (now - this.lastSaveTime >= this.saveInterval) {
        this.process(); // Process immediately if enough time passed
      } else {
        // Schedule processing after the interval
        setTimeout(() => {
          if (!this.processing && this.queue.length > 0) {
            this.process();
          }
        }, this.saveInterval - (now - this.lastSaveTime));
      }
    }
  }
}
```

#### **4. Server Sync Layer (Database)**
```typescript
private async saveToServer(data: ResumeData, profileData: ProfileData, sectionOrder: string[]) {
  const url = `/api/resumes/${this.resumeId}`;
  
  const savePayload = {
    title: data.title || "Untitled Resume",
    jobTitle: data.jobTitle || "",
    template: data.template || "modern",
    content: data.content,
    // ... all resume sections
  };

  const response = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(savePayload),
  });

  if (!response.ok) {
    throw new Error(`Save failed: ${response.status}`);
  }
}
```

#### **5. Cross-Session Persistence**
```typescript
// Save queue persists across page navigation
private loadQueueFromStorage() {
  const storedQueue = localStorage.getItem(`save-queue-${this.resumeId}`);
  if (storedQueue) {
    try {
      const parsed = JSON.parse(storedQueue);
      this.queue = parsed.queue || [];
      this.lastSaveTime = parsed.lastSaveTime || 0;
      
      // Process any pending items if enough time has passed
      if (this.queue.length > 0 && Date.now() - this.lastSaveTime >= this.saveInterval) {
        this.process();
      }
    } catch (e) {
      console.warn('Failed to load queue from storage:', e);
      this.queue = [];
      this.lastSaveTime = 0;
    }
  }
}
```

#### **Performance Characteristics**

| **Operation** | **Time** | **Description** |
|---------------|----------|-----------------|
| **UI Update** | < 1ms | Instant React state change |
| **Local Save** | < 1ms | localStorage write |
| **Queue Add** | < 1ms | Add to save queue |
| **Server Sync** | 2s+ | Background database update |
| **Page Load** | < 100ms | Instant from localStorage |

#### **Error Handling & Recovery**

- **Network Failures**: Changes remain in localStorage, retry on next sync
- **Server Errors**: Local data preserved, user notified of sync issues
- **Data Conflicts**: Server data takes precedence, local changes merged
- **Queue Corruption**: Automatic queue reset with fallback to server data

#### **Debugging & Monitoring**

The save system provides comprehensive debugging capabilities:

```typescript
// Get real-time save queue status
const { getSaveQueueStatus } = useResumeData(resumeId);

// Monitor queue performance
console.log('Save Queue Status:', getSaveQueueStatus());
// Output: {
//   queueLength: 3,
//   processing: false,
//   lastSaveTime: 1234567890,
//   timeSinceLastSave: 1500,
//   hasPendingSaves: true
// }

// Clear queue if needed
const { clearSaveQueue } = useResumeData(resumeId);
clearSaveQueue();
```

**Console Logs**: The system provides detailed logging:
- 📝 `Added to save queue. Queue length: X`
- 🔄 `Processing save queue. Items: X`
- ✅ `Background save completed at [time]`
- 🧹 `Save queue cleared`

## �� API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication

### Resume Management
- `GET /api/resumes` - List user resumes
- `POST /api/resumes` - Create new resume
- `GET /api/resumes/[id]` - Get specific resume
- `PUT /api/resumes/[id]` - Update resume
- `DELETE /api/resumes/[id]` - Delete resume

### Profile Management
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `POST /api/resumes/upload-profile-picture` - Upload profile picture
- `DELETE /api/resumes/delete-profile-picture` - Remove profile picture

### PDF Generation
- `GET /api/resumes/[id]/pdf-html` - Generate HTML for PDF
- `GET /api/resumes/[id]/pdf-with-links` - Generate PDF with clickable links

## 🏗️ Project Structure

```
src/
├── app/                          # Next.js app router
│   ├── api/                     # API routes
│   │   ├── auth/               # Authentication endpoints
│   │   ├── profile/            # Profile management
│   │   └── resumes/            # Resume CRUD operations
│   ├── login/                  # Authentication pages
│   ├── profile/                # User profile page
│   └── resume/                 # Resume management pages
├── features/                    # Feature-based organization
│   └── resume/                 # Resume-related features
│       ├── ResumeEditor/       # Main editor components
│       ├── ClassicResumeTemplate.tsx
│       ├── ModernResumeTemplate.tsx
│       ├── ResumeTemplateRegistry.tsx
│       └── ResumeEditorV2.tsx
├── lib/                         # Core utilities
│   ├── auth.ts                 # NextAuth configuration
│   ├── prisma.ts               # Database client
│   ├── store.ts                # Zustand state management
│   └── theme.ts                # Material-UI theme system
├── hooks/                       # Custom React hooks
├── services/                    # Business logic services
└── shared/                      # Shared components and types
```

## 🎨 Theme System

The application features a sophisticated theme system built on Material-UI:

- **Dynamic Color Generation**: Colors generated from a master color palette
- **Consistent Spacing**: Systematic spacing scale for UI elements
- **Typography System**: Comprehensive font sizing and hierarchy
- **Component Overrides**: Custom styling for all MUI components
- **Dark/Light Mode Support**: Built-in theme switching capabilities

## 🔒 Security Features

- **NextAuth.js Integration**: Secure authentication with multiple providers
- **Password Hashing**: bcryptjs for secure password storage
- **Session Management**: Secure session handling with JWT
- **Input Validation**: Comprehensive form validation and sanitization
- **File Upload Security**: Secure profile picture upload handling

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- **Railway**: Easy PostgreSQL + Node.js deployment
- **Render**: Simple container deployment
- **DigitalOcean**: App Platform or Droplet deployment

### Environment Variables
Ensure these are set in production:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Secure random string for JWT signing
- `NEXTAUTH_URL`: Your production domain

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with proper TypeScript types
4. **Add tests** if applicable
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use Material-UI components consistently
- Maintain responsive design principles
- Add proper error handling
- Include JSDoc comments for complex functions

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** team for the amazing framework
- **Material-UI** for the comprehensive component library
- **Prisma** for the excellent database toolkit
- **Zustand** for lightweight state management
- **Puppeteer** for PDF generation capabilities

## 📞 Support

- **Issues**: Report bugs and feature requests on GitHub
- **Discussions**: Join community discussions
- **Documentation**: Check the docs folder for detailed guides

---

**Built with ❤️ using Next.js, Material-UI, and modern web technologies**
