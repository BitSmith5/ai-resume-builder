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
    const maxContentHeight = 900; // Further reduced to ensure proper bottom margins
    const bottomMargin = 80; // Increased minimum space to keep at bottom of each page
    
    let currentPage: PageContent = {
      workExperience: [],
      education: [],
      courses: [],
      skills: [],
      interests: []
    };
    
    let currentHeight = 0;
    const headerHeight = 180; // Reduced header section height (only on first page)
    const sectionSpacing = 20; // Reduced spacing between sections
    const itemSpacing = 15; // Reduced spacing between items
    
    // Helper function to estimate content height
    const estimateContentHeight = (content: ResumeData['workExperience'][0] | ResumeData['education'][0] | NonNullable<ResumeData['courses']>[0], type: 'work' | 'education' | 'course'): number => {
      let height = 0;
      
      switch (type) {
        case 'work':
          height = 80; // Increased base height for work experience item to be more conservative
          if ('bulletPoints' in content && content.bulletPoints && content.bulletPoints.length > 0) {
            height += content.bulletPoints.length * 22; // Each bullet point adds ~22px (more conservative)
          }
          break;
        case 'education':
          height = 60; // Increased base height for education item
          break;
        case 'course':
          height = 45; // Increased base height for course item
          break;
      }
      
      return height;
    };
    
    // Helper function to estimate skills/interests height
    const estimateSkillsHeight = (skills: ResumeData['strengths']): number => {
      if (!skills || skills.length === 0) return 0;
      return 50 + (skills.length * 25); // Increased section header + skills for more conservative estimates
    };
    
    const estimateInterestsHeight = (interests: NonNullable<ResumeData['interests']>): number => {
      if (!interests || interests.length === 0) return 0;
      return 50 + (interests.length * 25); // Increased section header + interests for more conservative estimates
    };
    
    // Helper function to add section to current page
    const addSectionToPage = (section: ResumeData['workExperience'] | ResumeData['education'] | NonNullable<ResumeData['courses']>, type: 'work' | 'education' | 'course') => {
      const sectionHeight = 45; // Increased section header height for more conservative estimates
      
      // Check if we need a new page for this section
      if (currentHeight + sectionHeight > maxContentHeight - bottomMargin) {
        pages.push(currentPage);
        currentPage = {
          workExperience: [],
          education: [],
          courses: [],
          skills: [],
          interests: []
        };
        currentHeight = 0; // No header on subsequent pages
      }
      
      currentHeight += sectionHeight;
      
      // Add items to the section
      for (const item of section) {
        const itemHeight = estimateContentHeight(item, type);
        
        // Check if adding this item would push content too close to bottom
        // Add extra buffer to ensure we don't get too close to the bottom
        if (currentHeight + itemHeight > maxContentHeight - bottomMargin - 20) {
          pages.push(currentPage);
          currentPage = {
            workExperience: [],
            education: [],
            courses: [],
            skills: [],
            interests: []
          };
          currentHeight = sectionHeight; // Include section header on new page
        }
        
        switch (type) {
          case 'work':
            currentPage.workExperience.push(item as ResumeData['workExperience'][0]);
            break;
          case 'education':
            currentPage.education.push(item as ResumeData['education'][0]);
            break;
          case 'course':
            currentPage.courses.push(item as NonNullable<ResumeData['courses']>[0]);
            break;
        }
        
        currentHeight += itemHeight + itemSpacing;
      }
      
      currentHeight += sectionSpacing;
    };
    
    // Start with header height for first page
    currentHeight = headerHeight;
    
    // Distribute main content first (work experience, courses, education)
    if (data.workExperience && data.workExperience.length > 0) {
      addSectionToPage(data.workExperience, 'work');
    }
    
    if (data.courses && data.courses.length > 0) {
      addSectionToPage(data.courses, 'course');
    }
    
    if (data.education && data.education.length > 0) {
      addSectionToPage(data.education, 'education');
    }
    
    // Now distribute skills and interests to fill remaining space across all pages
    if (data.strengths && data.strengths.length > 0) {
      const skillsHeight = estimateSkillsHeight(data.strengths);
      if (currentHeight + skillsHeight <= maxContentHeight - bottomMargin - 20) {
        // Add skills to current page if there's space
        currentPage.skills = [...data.strengths];
        currentHeight += skillsHeight + sectionSpacing;
      } else {
        // If no space on current page, create a new page for skills
        pages.push(currentPage);
        currentPage = {
          workExperience: [],
          education: [],
          courses: [],
          skills: [...data.strengths],
          interests: []
        };
        currentHeight = skillsHeight + sectionSpacing;
      }
    }
    
    if (data.interests && data.interests.length > 0) {
      const interestsHeight = estimateInterestsHeight(data.interests);
      if (currentHeight + interestsHeight <= maxContentHeight - bottomMargin - 20) {
        // Add interests to current page if there's space
        currentPage.interests = [...data.interests];
        currentHeight += interestsHeight + sectionSpacing;
      } else {
        // Try to add interests to an existing page that has space
        let interestsAdded = false;
        for (let i = pages.length - 1; i >= 0; i--) {
          const page = pages[i];
          
          // Calculate total space used on this page
          let pageUsedHeight = 0;
          if (page.workExperience.length > 0) pageUsedHeight += 45 + (page.workExperience.length * 80);
          if (page.education.length > 0) pageUsedHeight += 45 + (page.education.length * 60);
          if (page.courses.length > 0) pageUsedHeight += 45 + (page.courses.length * 45);
          if (page.skills.length > 0) pageUsedHeight += 50 + (page.skills.length * 25);
          if (page.interests.length > 0) pageUsedHeight += 50 + (page.interests.length * 25);
          
          // Check if interests can fit on this page
          if (pageUsedHeight + interestsHeight <= maxContentHeight - bottomMargin - 20) {
            page.interests = [...data.interests];
            interestsAdded = true;
            break;
          }
        }
        
        if (!interestsAdded) {
          // Create a new page for interests if no existing page has space
          pages.push(currentPage);
          currentPage = {
            workExperience: [],
            education: [],
            courses: [],
            skills: [],
            interests: [...data.interests]
          };
          currentHeight = interestsHeight + sectionSpacing;
        }
      }
    }
    
    // Add the last page if it has content
    if (currentPage.workExperience.length > 0 || 
        currentPage.education.length > 0 || 
        currentPage.courses.length > 0 ||
        currentPage.skills.length > 0 ||
        currentPage.interests.length > 0) {
      pages.push(currentPage);
    }
    
    // If no pages were created, create at least one empty page
    if (pages.length === 0) {
      pages.push({
        workExperience: [],
        education: [],
        courses: [],
        skills: [],
        interests: []
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