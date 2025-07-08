# AI Resume Builder

A modern, AI-powered resume builder built with Next.js, Material-UI, and NextAuth.js. Create professional resumes with Google and GitHub authentication.

## Features

- 🔐 **Secure Authentication** - Sign in with Google or GitHub
- 🎨 **Modern UI** - Beautiful Material-UI interface with responsive design
- 📊 **Dashboard** - Comprehensive dashboard with resume management
- 📋 **DataGrid** - Advanced resume listing with sorting and filtering
- 🛡️ **Protected Routes** - Middleware-based route protection
- 📱 **Responsive Design** - Works perfectly on desktop and mobile

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Framework**: Material-UI (MUI) v6
- **Authentication**: NextAuth.js with Google & GitHub providers
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Emotion (CSS-in-JS)

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Google OAuth credentials
- GitHub OAuth credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-resume-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/ai_resume_builder"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret-key-here"

   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # GitHub OAuth
   GITHUB_ID="your-github-client-id"
   GITHUB_SECRET="your-github-client-secret"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### OAuth Setup

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Set authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to your `.env.local`

#### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set Homepage URL: `http://localhost:3000`
4. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
5. Copy Client ID and Client Secret to your `.env.local`

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth.js routes
│   │   └── resumes/       # Resume CRUD operations
│   ├── dashboard/         # Protected dashboard pages
│   ├── login/             # Authentication page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # Reusable components
│   ├── DashboardLayout.tsx # Dashboard layout with sidebar
│   └── Providers.tsx      # NextAuth SessionProvider
├── lib/                   # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   └── prisma.ts         # Prisma client
└── types/                # TypeScript type definitions
    └── next-auth.d.ts    # NextAuth type extensions
```

## Features Overview

### Authentication
- **Google OAuth**: Sign in with Google account
- **GitHub OAuth**: Sign in with GitHub account
- **Session Management**: Automatic session handling
- **Route Protection**: Middleware-based authentication

### Dashboard
- **Overview**: Statistics and recent resumes
- **Resume Management**: Create, view, edit, delete resumes
- **DataGrid**: Advanced table with sorting and pagination
- **Responsive Design**: Works on all screen sizes

### UI Components
- **Material-UI**: Modern, accessible components
- **AppBar**: Header with user menu and navigation
- **Drawer**: Responsive sidebar navigation
- **DataGrid**: Feature-rich data table
- **Cards**: Resume preview cards with skill chips

## API Endpoints

### Authentication
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js handlers

### Resumes
- `GET /api/resumes` - Fetch user's resumes
- `POST /api/resumes` - Create new resume
- `GET /api/resumes/[id]` - Fetch specific resume
- `PUT /api/resumes/[id]` - Update resume
- `DELETE /api/resumes/[id]` - Delete resume

## Database Schema

The application uses PostgreSQL with the following main tables:

- **User**: Authentication and user profile data
- **Account**: OAuth provider accounts
- **Session**: User sessions
- **Resume**: User resumes with content
- **Strength**: Skills and ratings for resumes

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
