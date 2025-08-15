# ResumeEditor Component Library

This directory contains the refactored components extracted from the large `ResumeEditorV2.tsx` file to improve maintainability and readability.

## Structure

```
src/components/ResumeEditor/
├── README.md                           # This file
├── index.ts                            # Main exports
├── types.ts                            # Type definitions
├── components/
│   ├── ResumeHeader.tsx                # Header with close, title, and action buttons
│   └── sections/
│       ├── PersonalInfoSection.tsx     # Personal information section
│       ├── ProfessionalSummarySection.tsx  # Professional summary section
│       ├── TechnicalSkillsSection.tsx  # Technical skills with categories
│       ├── WorkExperienceSection.tsx   # Work experience with bullet points
│       └── EducationSection.tsx        # Education history
├── hooks/
│   └── useResumeData.ts                # Custom hook for resume data management
├── utils/
│   └── dateUtils.ts                    # Date and phone formatting utilities
├── test-components.tsx                 # Test page for all components
└── INTEGRATION_EXAMPLE.tsx             # Integration examples
```

## Components

### ResumeHeader
- **Purpose**: Top navigation bar with close button, resume title, and action buttons
- **Props**: `resumeTitle`, `jobTitle`, `loading`, `onClose`, `onEditResumeInfo`, `onExport`, `onDelete`
- **Features**: Responsive design, loading states, action callbacks

### PersonalInfoSection
- **Purpose**: Displays and allows editing of personal contact information
- **Props**: `profileData`, `setProfileData`
- **Features**: Contact info grid, social media links, validation states

### ProfessionalSummarySection
- **Purpose**: Professional summary text editor with paste formatting
- **Props**: `resumeData`, `setResumeData`, `onDeleteSection`
- **Features**: Multiline text input, automatic paste formatting, section deletion

### TechnicalSkillsSection
- **Purpose**: Technical skills management with categories and individual skills
- **Props**: `resumeData`, `setResumeData`, `onDeleteSection`
- **Features**: Skill categories, add/remove skills, drag indicators, section deletion

### WorkExperienceSection
- **Purpose**: Work experience entries with company, position, dates, and bullet points
- **Props**: `resumeData`, `setResumeData`, `onDeleteSection`
- **Features**: Add/remove work entries, bullet point management, current job checkbox

### EducationSection
- **Purpose**: Education history with institution, degree, field, dates, and GPA
- **Props**: `resumeData`, `setResumeData`, `onDeleteSection`
- **Features**: Add/remove education entries, current education checkbox, GPA input

## Hooks

### useResumeData
- **Purpose**: Manages resume data state and operations
- **Returns**: `resumeData`, `setResumeData`, `loading`, `error`, `success`, `updateResumeData`, `updateSection`, `saveResume`, `clearMessages`
- **Features**: Automatic error handling, success messages, loading states, direct state setter access

## Types

### ResumeData
- **Purpose**: Complete interface for resume data structure
- **Includes**: Personal info, work experience, education, skills, projects, languages, publications, awards, etc.

### ProfileData
- **Purpose**: Interface for profile information
- **Includes**: Name, email, phone, location, social media links

## Utilities

### dateUtils
- **formatPhoneNumber**: Formats phone numbers as (XXX) XXX-XXXX
- **formatDate**: Formats date strings for display
- **isDateInFuture**: Checks if a date is in the future

## Refactoring Benefits

1. **Improved Readability**: Each component has a single responsibility
2. **Better Testing**: Smaller components are easier to test in isolation
3. **Enhanced Maintainability**: Changes to one section don't affect others
4. **Performance Optimization**: Components can be optimized individually
5. **Easier Debugging**: Issues are isolated to specific components
6. **Team Collaboration**: Multiple developers can work on different components

## Usage Example

```tsx
import { 
  ResumeHeader, 
  PersonalInfoSection, 
  ProfessionalSummarySection,
  TechnicalSkillsSection,
  WorkExperienceSection,
  EducationSection,
  useResumeData 
} from './ResumeEditor';

function MyResumeEditor() {
  const { resumeData, loading, error, success, setResumeData } = useResumeData({
    initialData: resumeData,
    onSave: handleSave
  });

  const handleDeleteSection = (sectionName: string) => {
    // Handle section deletion logic
  };

  return (
    <div>
      <ResumeHeader
        resumeTitle={resumeData.title}
        loading={loading}
        onClose={() => router.push('/resume')}
        onEditResumeInfo={() => setEditResumeInfoOpen(true)}
        onExport={handleExportClick}
        onDelete={handleDeleteResume}
      />
      
      <PersonalInfoSection
        profileData={profileData}
        setProfileData={setProfileData}
      />

      <ProfessionalSummarySection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={handleDeleteSection}
      />

      <TechnicalSkillsSection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={handleDeleteSection}
      />

      <WorkExperienceSection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={handleDeleteSection}
      />

      <EducationSection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={handleDeleteSection}
      />
    </div>
  );
}
```

## Next Steps

This completes the major section extractions. Future enhancements could include:

1. **ExportPanel Component** - PDF export functionality and settings
2. **SectionManager Component** - Add/remove sections, layout modal
3. **Additional Form Sections** - Projects, Languages, Publications, Awards, etc.
4. **Custom Hooks** - useExportSettings, useDragAndDrop, useAutoSave
5. **Enhanced Drag & Drop** - Full drag and drop functionality for all sections
6. **Validation Utilities** - Form validation and error handling

## Migration Strategy

1. ✅ Create new component structure
2. ✅ Extract ResumeHeader component
3. ✅ Extract PersonalInfoSection component
4. ✅ Extract ProfessionalSummarySection component
5. ✅ Extract TechnicalSkillsSection component
6. ✅ Extract WorkExperienceSection component
7. ✅ Extract EducationSection component
8. ✅ Extract useResumeData hook
9. ✅ Extract dateUtils
10. ✅ Update useResumeData to expose setResumeData
11. 🔄 Gradually replace original components in ResumeEditorV2
12. 🔄 Test each extraction before proceeding
13. 🔄 Remove original code once all extractions are complete

## Testing

Use the `test-components.tsx` file to verify all components work correctly:
- Import and render all components
- Test form interactions
- Verify add/delete functionality
- Check console for errors
- Ensure proper data flow between components
