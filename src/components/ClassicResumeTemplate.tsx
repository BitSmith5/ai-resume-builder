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
  // Flags to track which sections have already started on previous pages
  workExperienceStarted: boolean;
  coursesStarted: boolean;
  educationStarted: boolean;
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
    
    // NEW APPROACH: Calculate all section heights first
    const sections: Array<{
      type: 'work' | 'courses' | 'education';
      items: ResumeData['workExperience'] | NonNullable<ResumeData['courses']> | ResumeData['education'];
      height: number;
    }> = [];
    
    if (data.workExperience && data.workExperience.length > 0) {
      const workHeight = estimateSectionHeaderHeight() + data.workExperience.reduce((total, item) => total + estimateContentHeight(item, 'work') + itemSpacing, 0);
      sections.push({ type: 'work', items: data.workExperience, height: workHeight });
    }
    
    if (data.courses && data.courses.length > 0) {
      const coursesHeight = estimateSectionHeaderHeight() + data.courses.reduce((total, item) => total + estimateContentHeight(item, 'course') + itemSpacing, 0);
      sections.push({ type: 'courses', items: data.courses, height: coursesHeight });
    }
    
    if (data.education && data.education.length > 0) {
      const educationHeight = estimateSectionHeaderHeight() + data.education.reduce((total, item) => total + estimateContentHeight(item, 'education') + itemSpacing, 0);
      sections.push({ type: 'education', items: data.education, height: educationHeight });
    }
    
    // NEW APPROACH: Process sections in correct visual order but optimize Education placement
    let currentPage: PageContent = {
      workExperience: [],
      education: [],
      courses: [],
      skills: [],
      interests: [],
      workExperienceStarted: false,
      coursesStarted: false,
      educationStarted: false
    };
    
    let currentPageHeight = headerHeight; // Start with header height for first page
    

    

    
    // Process sections in correct visual order: work, courses, education
    for (const section of sections) {
      
      if (section.type === 'education') {
        // For Education, check if it can fit on current page
        
        // Force Education to fit on current page if we're on page 1 or 2
        const currentPageNumber = pages.length + 1;
        
        if (currentPageNumber <= 2 || currentPageHeight + section.height <= maxContentHeight - bottomMargin - 20) {
          // Add Education to current page
          currentPage.education = section.items as ResumeData['education'];
          currentPage.educationStarted = false;
          currentPageHeight += section.height;
        } else {
          // Start new page for Education
          if (currentPage.workExperience.length > 0 || currentPage.education.length > 0 || currentPage.courses.length > 0) {
            pages.push(currentPage);
          }
          
          currentPage = {
            workExperience: [],
            education: [],
            courses: [],
            skills: [],
            interests: [],
            workExperienceStarted: false,
            coursesStarted: false,
            educationStarted: false
          };
          currentPageHeight = 0;
          
          currentPage.education = section.items as ResumeData['education'];
          currentPage.educationStarted = false;
          currentPageHeight += section.height;
        }
        continue;
      }
      
      // For Work Experience and Courses, process items individually to allow splitting
      const sectionHeaderHeight = estimateSectionHeaderHeight();
      
      // Check if section header fits
      if (currentPageHeight + sectionHeaderHeight > maxContentHeight - bottomMargin - 20) {
        // Start new page
        if (currentPage.workExperience.length > 0 || currentPage.education.length > 0 || currentPage.courses.length > 0) {
          pages.push(currentPage);
        }
        
        currentPage = {
          workExperience: [],
          education: [],
          courses: [],
          skills: [],
          interests: [],
          workExperienceStarted: false,
          coursesStarted: false,
          educationStarted: false
        };
        currentPageHeight = 0;
      }
      
      // Add section header
      currentPageHeight += sectionHeaderHeight;
      switch (section.type) {
        case 'work':
          currentPage.workExperienceStarted = false;
          break;
        case 'courses':
          currentPage.coursesStarted = false;
          break;
      }
      
      // Process items individually
      for (const item of section.items) {
        const itemHeight = estimateContentHeight(item, section.type === 'courses' ? 'course' : section.type) + itemSpacing;
        
        // Check if item fits on current page
        if (currentPageHeight + itemHeight > maxContentHeight - bottomMargin - 20) {
          // Start new page
          if (currentPage.workExperience.length > 0 || currentPage.education.length > 0 || currentPage.courses.length > 0) {
            pages.push(currentPage);
          }
          
          currentPage = {
            workExperience: [],
            education: [],
            courses: [],
            skills: [],
            interests: [],
            workExperienceStarted: true, // Section already started - don't show header again
            coursesStarted: true, // Section already started - don't show header again
            educationStarted: false
          };
          currentPageHeight = 0;
          
          // Re-add section header on new page
          currentPageHeight += sectionHeaderHeight;
          switch (section.type) {
            case 'work':
              currentPage.workExperienceStarted = true; // Don't show header again
              break;
            case 'courses':
              currentPage.coursesStarted = true; // Don't show header again
              break;
          }
        }
        
        // Add item to current page
        switch (section.type) {
          case 'work':
            currentPage.workExperience.push(item as ResumeData['workExperience'][0]);
            break;
          case 'courses':
            currentPage.courses.push(item as NonNullable<ResumeData['courses']>[0]);
            break;
        }
        currentPageHeight += itemHeight;
      }
    }
    
    // Add the final page
    if (currentPage.workExperience.length > 0 || currentPage.education.length > 0 || currentPage.courses.length > 0) {
      pages.push(currentPage);
    }
    
    // Add skills and interests to the last page, but check for overflow
    if (pages.length > 0) {
      const lastPage = pages[pages.length - 1];
      
      // Estimate skills and interests height
      const skillsHeight = data.strengths && data.strengths.length > 0 ? 60 : 0; // Section header + content
      const interestsHeight = data.interests && data.interests.length > 0 ? 60 : 0; // Section header + content
      const totalSkillsInterestsHeight = skillsHeight + interestsHeight;
      
      // Check if skills/interests would overflow the bottom margin
      if (currentPageHeight + totalSkillsInterestsHeight > maxContentHeight - bottomMargin - 20) {
        // Create a new page for skills and interests
        const newPage: PageContent = {
          workExperience: [],
          education: [],
          courses: [],
          skills: data.strengths || [],
          interests: data.interests || [],
          workExperienceStarted: true,
          coursesStarted: true,
          educationStarted: true
        };
        pages.push(newPage);
      } else {
        // Add to current page
        if (data.strengths && data.strengths.length > 0) {
          lastPage.skills = [...data.strengths];
        }
        
        if (data.interests && data.interests.length > 0) {
          lastPage.interests = [...data.interests];
        }
      }
    }
    
    // If no pages were created at all, create one with just skills/interests
    if (pages.length === 0) {
      pages.push({
        workExperience: [],
        education: [],
        courses: [],
        skills: data.strengths || [],
        interests: data.interests || [],
        workExperienceStarted: false,
        coursesStarted: false,
        educationStarted: false
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
          width: '850px', // Match modern template width
          height: '1100px', // Letter size aspect ratio: 8.5:11 = 0.773, 850/1100 = 0.773 ✓
          margin: '0 auto',
          marginBottom: pageIndex < pages.length - 1 ? '20px' : '0',
          lineHeight: '1.6',
          position: 'relative',
          overflow: 'hidden',
          pageBreakAfter: pageIndex < pages.length - 1 ? 'always' : 'auto',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderRadius: '20px',
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
            {!pageContent.workExperienceStarted && (
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
            )}
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
            {!pageContent.coursesStarted && (
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
            )}
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
          <div style={{ marginBottom: '20px' }}>
            {!pageContent.educationStarted && (
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
            )}
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