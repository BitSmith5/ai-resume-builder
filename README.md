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

### Development Tools
- **Language**: TypeScript 5
- **Linting**: ESLint 9 with Next.js configuration
- **Package Manager**: npm/pnpm support
- **Database Migrations**: Prisma migrations with auto-generation

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

## 🔌 API Endpoints

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
