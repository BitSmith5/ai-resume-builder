# AI Resume Builder

A comprehensive resume builder application built with Next.js, Prisma, and Material-UI.

## Features

### ✅ Implemented Features

- **User Authentication**: Secure login with NextAuth.js
- **Resume Management**: Create, edit, and delete resumes
- **Resume Editor**: Comprehensive form-based editor with MUI components
- **Live Preview**: Real-time preview of resume content
- **PDF Export**: Generate professional PDF resumes using react-pdf
- **Database Integration**: PostgreSQL database with Prisma ORM
- **Responsive Design**: Mobile-friendly interface with Material-UI

### Resume Editor Features

- **Personal Information**: Name, email, phone, city, state, and professional summary
- **Skills Management**: Add skills with ratings (1-10 scale)
- **Work Experience**: Add multiple work experiences with company, position, dates, and descriptions
- **Education**: Add educational background with institution, degree, field, dates, and GPA
- **Tabbed Interface**: Organized sections for easy navigation
- **Live Preview**: Real-time preview of how the resume will look

### Technical Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Framework**: Material-UI (MUI) v7
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **PDF Generation**: Puppeteer with clean HTML templates
- **File Storage**: Browser localStorage (device-specific)
- **Styling**: Emotion (CSS-in-JS)

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set up Environment Variables**:
   Create a `.env` file with:
   ```
   DATABASE_URL="your-postgresql-connection-string"
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```
   
   **Note**: Profile pictures are stored locally in the browser's localStorage, so no external storage configuration is needed. Images are device-specific and won't sync across devices. See [File Storage Guide](docs/FILE_STORAGE_MIGRATION.md) for details.

3. **Run Database Migrations**:
   ```bash
   npx prisma migrate dev
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Open Application**:
   Navigate to `http://localhost:3000`

## Usage

### Creating a Resume

1. Navigate to `/resume`
2. Click "Create New Resume"
3. Fill in your personal information
4. Add skills with ratings
5. Add work experience entries
6. Add education details
7. Save your resume
8. Download as PDF

### Editing a Resume

1. Go to the resumes list
2. Click the edit icon on any resume
3. Make your changes
4. Save to update
5. Download the updated PDF

## Database Schema

The application uses the following main models:

- **User**: Authentication and user management
- **Resume**: Main resume data with title and content
- **Strength**: Skills with ratings
- **WorkExperience**: Job history with company, position, dates
- **Education**: Educational background with institution, degree, dates

## API Endpoints

- `GET /api/resumes` - List all resumes for the authenticated user
- `POST /api/resumes` - Create a new resume
- `GET /api/resumes/[id]` - Get a specific resume
- `PUT /api/resumes/[id]` - Update a resume
- `DELETE /api/resumes/[id]` - Delete a resume

## PDF Export

The application generates professional PDF resumes using Puppeteer with clean HTML templates, featuring:

- Clean, professional layout
- Proper typography and spacing
- Organized sections (Personal Info, Skills, Work Experience, Education)
- Consistent styling across all resumes

## Development

### Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── login/            # Authentication pages
├── components/            # React components
│   ├── ResumeEditor.tsx  # Main resume editor
│   ├── ResumePDF.tsx     # PDF generation
│   └── DashboardLayout.tsx
├── lib/                   # Utility functions
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Database client
│   └── pdfGenerator.ts   # PDF generation utilities
└── hooks/                 # Custom React hooks
```

### Key Components

- **ResumeEditor**: Main editor component with tabs and live preview
- **ResumePDF**: PDF generation component with professional styling
- **DashboardLayout**: Consistent layout wrapper
- **API Routes**: RESTful endpoints for CRUD operations

## Future Enhancements

- Template selection for different resume styles
- AI-powered content suggestions
- Resume sharing and collaboration
- Advanced formatting options
- Integration with job boards
- Resume analytics and tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
