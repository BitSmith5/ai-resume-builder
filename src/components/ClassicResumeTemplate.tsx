import React from 'react';

interface ResumeData {
  title: string;
  jobTitle?: string;
  profilePicture?: string;
  content: {
    personalInfo: {
      name: string;
      email: string;
      phone: string;
      city: string;
      state: string;
      summary: string;
      website?: string;
      linkedin?: string;
      github?: string;
    };
  };
  strengths: Array<{
    skillName: string;
    rating: number;
  }>;
  workExperience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    city?: string;
    state?: string;
    bulletPoints: Array<{
      description: string;
    }>;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    current: boolean;
    gpa?: number;
  }>;
  courses?: Array<{
    title: string;
    provider: string;
    link?: string;
  }>;
  interests?: Array<{
    name: string;
    icon: string;
  }>;
}

interface ClassicResumeTemplateProps {
  data: ResumeData;
}

interface PageContent {
  workExperience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    city?: string;
    state?: string;
    bulletPoints: Array<{
      description: string;
    }>;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    current: boolean;
    gpa?: number;
  }>;
  courses: Array<{
    title: string;
    provider: string;
    link?: string;
  }>;
  skills: Array<{
    skillName: string;
    rating: number;
  }>;
  interests: Array<{
    name: string;
    icon: string;
  }>;
}

const ClassicResumeTemplate: React.FC<ClassicResumeTemplateProps> = ({ data }) => {
  const { personalInfo } = data.content;
  
  // Function to format dates as MM/YYYY
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  // Function to format URLs by removing http/https prefix
  const formatUrl = (url: string): string => {
    if (!url) return '';
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '');
  };

  // Calculate content distribution across pages
  const calculatePages = (): PageContent[] => {
    const pages: PageContent[] = [];
    const maxContentHeight = 900;
    const bottomMargin = 80;
    const headerHeight = 180; // Only on first page
    const sectionSpacing = 20;
    const itemSpacing = 15;
    
    // Helper function to estimate content height
    const estimateContentHeight = (content: ResumeData['workExperience'][0] | ResumeData['education'][0] | NonNullable<ResumeData['courses']>[0], type: 'work' | 'education' | 'course'): number => {
      let height = 0;
      
      switch (type) {
        case 'work':
          height = 80;
          if ('bulletPoints' in content && content.bulletPoints && content.bulletPoints.length > 0) {
            height += content.bulletPoints.length * 22;
          }
          break;
        case 'education':
          height = 60;
          break;
        case 'course':
          height = 45;
          break;
      }
      
      return height;
    };
    
    // Helper function to estimate section header height
    const estimateSectionHeaderHeight = (): number => {
      return 45; // Section title + border + spacing
    };
    
    // SIMPLE APPROACH: First, create pages with ONLY main content (no skills/interests)
    let currentPage: PageContent = {
      workExperience: [],
      education: [],
      courses: [],
      skills: [], // EMPTY - no skills on main content pages
      interests: [] // EMPTY - no interests on main content pages
    };
    
    let currentHeight = headerHeight; // Start with header height for first page
    
    // Helper function to add a new page
    const addNewPage = () => {
      // Only add the current page if it has content
      if (currentPage.workExperience.length > 0 || 
          currentPage.education.length > 0 || 
          currentPage.courses.length > 0) {
        pages.push(currentPage);
      }
      
      // Create new page
      currentPage = {
        workExperience: [],
        education: [],
        courses: [],
        skills: [], // EMPTY - no skills on main content pages
        interests: [] // EMPTY - no interests on main content pages
      };
      currentHeight = 0; // No header on subsequent pages
    };
    
    // Helper function to check if we need a new page
    const needsNewPage = (additionalHeight: number): boolean => {
      return currentHeight + additionalHeight > maxContentHeight - bottomMargin - 20;
    };
    
    // Add work experience section
    if (data.workExperience && data.workExperience.length > 0) {
      const sectionHeaderHeight = estimateSectionHeaderHeight();
      
      // Check if we need a new page for the section header
      if (needsNewPage(sectionHeaderHeight)) {
        addNewPage();
      }
      
      currentHeight += sectionHeaderHeight;
      
      // Add each work experience item
      for (const exp of data.workExperience) {
        const itemHeight = estimateContentHeight(exp, 'work');
        
        // Check if we need a new page for this item
        if (needsNewPage(itemHeight)) {
          addNewPage();
          currentHeight += sectionHeaderHeight; // Add section header to new page
        }
        
        currentPage.workExperience.push(exp);
        currentHeight += itemHeight + itemSpacing;
      }
    }
    
    // Add courses section
    if (data.courses && data.courses.length > 0) {
      const sectionHeaderHeight = estimateSectionHeaderHeight();
      
      // Check if we need a new page for the section header
      if (needsNewPage(sectionHeaderHeight)) {
        addNewPage();
      }
      
      currentHeight += sectionHeaderHeight;
      
      // Add each course item
      for (const course of data.courses) {
        const itemHeight = estimateContentHeight(course, 'course');
        
        // Check if we need a new page for this item
        if (needsNewPage(itemHeight)) {
          addNewPage();
          currentHeight += sectionHeaderHeight; // Add section header to new page
        }
        
        currentPage.courses.push(course);
        currentHeight += itemHeight + itemSpacing;
      }
    }
    
    // Add education section
    if (data.education && data.education.length > 0) {
      const sectionHeaderHeight = estimateSectionHeaderHeight();
      
      // Check if we need a new page for the section header
      if (needsNewPage(sectionHeaderHeight)) {
        addNewPage();
      }
      
      currentHeight += sectionHeaderHeight;
      
      // Add each education item
      for (const edu of data.education) {
        const itemHeight = estimateContentHeight(edu, 'education');
        
        // Check if we need a new page for this item
        if (needsNewPage(itemHeight)) {
          addNewPage();
          currentHeight += sectionHeaderHeight; // Add section header to new page
        }
        
        currentPage.education.push(edu);
        currentHeight += itemHeight + itemSpacing;
      }
    }
    
    // Add the final page with content (still no skills/interests)
    if (currentPage.workExperience.length > 0 || 
        currentPage.education.length > 0 || 
        currentPage.courses.length > 0) {
      pages.push(currentPage);
    }
    
    // NOW, after ALL main content pages are created, add skills/interests to the VERY LAST page
    if (pages.length > 0) {
      const lastPage = pages[pages.length - 1];
      
      // Add skills and interests ONLY to the last page
      if (data.strengths && data.strengths.length > 0) {
        lastPage.skills = [...data.strengths];
      }
      
      if (data.interests && data.interests.length > 0) {
        lastPage.interests = [...data.interests];
      }
    }
    
    // If no pages were created at all, create one with just skills/interests
    if (pages.length === 0) {
      pages.push({
        workExperience: [],
        education: [],
        courses: [],
        skills: data.strengths || [],
        interests: data.interests || []
      });
    }
    
    return pages;
  };

  // Calculate pages
  const pages = calculatePages();

  // Render header (same for all pages)
  const renderHeader = () => (
    <div style={{ textAlign: 'center', marginBottom: '25px', borderBottom: '2px solid #000', paddingBottom: '16px' }}>
      {data.profilePicture && (
        <div style={{ 
          width: '120px',
          height: '120px',
          borderRadius: '50%', 
          backgroundImage: `url(${data.profilePicture})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          margin: '0 auto 12px auto',
          border: '3px solid #000'
        }} />
      )}
      <h1 style={{ 
        fontSize: '32px', 
        fontWeight: 'bold', 
        margin: '0 0 10px 0',
        textTransform: 'uppercase',
        letterSpacing: '2px'
      }}>
        {personalInfo.name}
      </h1>
      {data.jobTitle && (
        <div style={{ 
          fontSize: '18px', 
          fontWeight: 'bold', 
          margin: '0 0 10px 0',
          fontStyle: 'italic',
          color: '#333'
        }}>
          {data.jobTitle}
        </div>
      )}
      <div style={{ fontSize: '14px', color: '#333' }}>
        {personalInfo.email && <span style={{ marginRight: '20px' }}>{personalInfo.email}</span>}
        {personalInfo.phone && <span style={{ marginRight: '20px' }}>{personalInfo.phone}</span>}
        {(personalInfo.city || personalInfo.state) && (
          <span>{[personalInfo.city, personalInfo.state].filter(Boolean).join(', ')}</span>
        )}
      </div>
      {(personalInfo.website || personalInfo.linkedin || personalInfo.github) && (
        <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
          {personalInfo.website && <span style={{ marginRight: '15px' }}>{formatUrl(personalInfo.website)}</span>}
          {personalInfo.linkedin && <span style={{ marginRight: '15px' }}>{formatUrl(personalInfo.linkedin)}</span>}
          {personalInfo.github && <span>{formatUrl(personalInfo.github)}</span>}
        </div>
      )}
    </div>
  );

  // Render a single page
  const renderPage = (pageContent: PageContent, pageIndex: number) => {
    const isFirstPage = pageIndex === 0;
    
    return (
      <div
        key={pageIndex}
        style={{ 
          fontFamily: 'Times New Roman, serif', 
          background: '#fff', 
          color: '#000', 
          padding: '40px',
          width: '850px',
          height: '1100px',
          margin: '0 auto',
          marginBottom: pageIndex < pages.length - 1 ? '20px' : '0',
          lineHeight: '1.6',
          position: 'relative',
          overflow: 'hidden',
          pageBreakAfter: pageIndex < pages.length - 1 ? 'always' : 'auto',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderRadius: '4px',
          border: '1px solid #e0e0e0'
        }}
      >


        {/* Content wrapper that respects bottom margin */}
        <div style={{ 
          paddingBottom: '80px', // Ensure content doesn't overlap with bottom margin
          minHeight: 'calc(100% - 80px)' // Ensure content area respects bottom margin
        }}>
          {/* Header - only on first page */}
          {isFirstPage && renderHeader()}

                  {/* Summary - only on first page */}
        {isFirstPage && personalInfo.summary && (
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              margin: '0 0 8px 0',
              textTransform: 'uppercase',
              borderBottom: '1px solid #000',
              paddingBottom: '4px'
            }}>
              Professional Summary
            </h2>
            <p style={{ fontSize: '14px', margin: '0', textAlign: 'justify' }}>
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* Work Experience */}
        {pageContent.workExperience.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              margin: '0 0 12px 0',
              textTransform: 'uppercase',
              borderBottom: '1px solid #000',
              paddingBottom: '4px'
            }}>
              Work Experience
            </h2>
            {pageContent.workExperience.map((exp, index) => (
              <div key={index} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    margin: '0',
                    textTransform: 'uppercase'
                  }}>
                    {exp.position}
                  </h3>
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </span>
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 'bold', 
                  color: '#333',
                  marginBottom: '8px',
                  fontStyle: 'italic'
                }}>
                  {exp.company}
                  {(exp.city || exp.state) && (
                    <span style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}>
                      {' - '}{[exp.city, exp.state].filter(Boolean).join(', ')}
                    </span>
                  )}
                </div>
                {exp.bulletPoints.length > 0 && (
                  <ul style={{ 
                    fontSize: '13px', 
                    margin: '0', 
                    paddingLeft: '20px',
                    textAlign: 'justify'
                  }}>
                    {exp.bulletPoints.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} style={{ marginBottom: '2px' }}>
                        {bullet.description}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Courses */}
        {pageContent.courses.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              margin: '0 0 12px 0',
              textTransform: 'uppercase',
              borderBottom: '1px solid #000',
              paddingBottom: '4px'
            }}>
              Courses & Certifications
            </h2>
            {pageContent.courses.map((course, index) => (
              <div key={index} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    margin: '0',
                    textTransform: 'uppercase'
                  }}>
                    {course.title}
                  </h3>
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 'bold', 
                  color: '#333',
                  marginBottom: '3px',
                  fontStyle: 'italic'
                }}>
                  {course.provider}
                </div>
                {course.link && (
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    <a href={course.link} target="_blank" rel="noopener noreferrer" style={{ color: '#666', textDecoration: 'underline' }}>
                      {formatUrl(course.link)}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {pageContent.education.length > 0 && (
          <div>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              margin: '0 0 12px 0',
              textTransform: 'uppercase',
              borderBottom: '1px solid #000',
              paddingBottom: '4px'
            }}>
              Education
            </h2>
            {pageContent.education.map((edu, index) => (
              <div key={index} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    margin: '0',
                    textTransform: 'uppercase'
                  }}>
                    {edu.degree} in {edu.field}
                  </h3>
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    {formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate)}
                  </span>
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 'bold', 
                  color: '#333',
                  marginBottom: '3px',
                  fontStyle: 'italic'
                }}>
                  {edu.institution}
                </div>
                {edu.gpa && (
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    GPA: {edu.gpa}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {pageContent.skills.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              margin: '0 0 8px 0',
              textTransform: 'uppercase',
              borderBottom: '1px solid #000',
              paddingBottom: '4px'
            }}>
              Skills
            </h2>
            <div style={{ fontSize: '14px' }}>
              {pageContent.skills.map((strength, index) => (
                <span key={index} style={{ 
                  display: 'inline-block',
                  marginRight: '15px',
                  marginBottom: '4px',
                  fontWeight: 'bold'
                }}>
                  {strength.skillName} ({strength.rating}/10)
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {pageContent.interests.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              margin: '0 0 8px 0',
              textTransform: 'uppercase',
              borderBottom: '1px solid #000',
              paddingBottom: '4px'
            }}>
              Interests
            </h2>
            <div style={{ fontSize: '14px' }}>
              {pageContent.interests.map((interest, index) => (
                <span key={index} style={{ 
                  display: 'inline-block',
                  marginRight: '15px',
                  marginBottom: '4px'
                }}>
                  {interest.icon} {interest.name}
                </span>
              ))}
            </div>
          </div>
        )}
        </div> {/* Close content wrapper */}
      </div>
    );
  };
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'flex-start',
      width: '100%',
    }}>
      {pages.map((pageContent, pageIndex) => renderPage(pageContent, pageIndex))}
    </div>
  );
};

export default ClassicResumeTemplate; 