import React from 'react';
import Image from 'next/image';
import { MdEmail, MdPhone, MdLocationOn, MdLanguage, MdLink } from 'react-icons/md';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import { getImage } from '@/lib/imageStorage';

const MASTER_COLOR = '#c8665b';

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

interface ModernResumeTemplateProps {
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
  leftColumnContent: {
    skills: Array<{
      skillName: string;
      rating: number;
    }>;
    interests: Array<{
      name: string;
      icon: string;
    }>;
  };
}

const ModernResumeTemplate: React.FC<ModernResumeTemplateProps> = ({ data }) => {
  const { personalInfo } = data.content;
  const [titleWidth, setTitleWidth] = React.useState(0);
  const titleRef = React.useRef<HTMLDivElement>(null);
  

  
  // Function to format URLs by removing http/https prefix
  const formatUrl = (url: string): string => {
    if (!url) return '';
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '');
  };

  // Function to format dates as MM/YYYY
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Return original if invalid date
      
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${year}`;
    } catch {
      return dateString; // Return original if parsing fails
    }
  };

  // Calculate content distribution across pages
  const calculatePages = (): PageContent[] => {
    const pages: PageContent[] = [];
    const maxContentHeight = 820; // Balanced height to prevent overflow while minimizing pages
    const maxLeftColumnHeight = 620; // Balanced height for left column
    
    let currentPage: PageContent = {
      workExperience: [],
      education: [],
      courses: [],
      leftColumnContent: {
        skills: [],
        interests: []
      }
    };
    
    let currentHeight = 0;
    const headerHeight = 120; // Header section height (only on first page)
    const sectionSpacing = 32; // Spacing between sections
    const itemSpacing = 12; // Spacing between items
    
    // Helper function to estimate content height
    const estimateContentHeight = (content: ResumeData['workExperience'][0] | ResumeData['education'][0] | NonNullable<ResumeData['courses']>[0], type: 'work' | 'education' | 'course'): number => {
      let height = 0;
      
      switch (type) {
        case 'work':
          height = 90; // Adjusted base height for work experience item
          if ('bulletPoints' in content && content.bulletPoints && content.bulletPoints.length > 0) {
            height += content.bulletPoints.length * 25; // Each bullet point adds ~25px
          }
          break;
        case 'education':
          height = 70; // Adjusted base height for education item
          break;
        case 'course':
          height = 45; // Adjusted base height for course item
          break;
      }
      
      return height;
    };
    
    // Helper function to estimate left column item height
    const estimateLeftColumnHeight = (type: 'skill' | 'interest'): number => {
      switch (type) {
        case 'skill':
          return 35; // Adjusted skill item height
        case 'interest':
          return 30; // Adjusted interest item height
        default:
          return 25;
      }
    };
    
    // Helper function to add section to current page
    const addSectionToPage = (section: ResumeData['workExperience'] | ResumeData['education'] | NonNullable<ResumeData['courses']>, type: 'work' | 'education' | 'course') => {
      const sectionHeight = 50; // Section header height
      
      // Check if we need a new page for this section
      if (currentHeight + sectionHeight > maxContentHeight) {
        pages.push(currentPage);
        currentPage = {
          workExperience: [],
          education: [],
          courses: [],
          leftColumnContent: {
            skills: [],
            interests: []
          }
        };
        currentHeight = 0; // No header on subsequent pages
      }
      
      currentHeight += sectionHeight;
      
      // Add items to the section
      for (const item of section) {
        const itemHeight = estimateContentHeight(item, type);
        
        if (currentHeight + itemHeight > maxContentHeight) {
          pages.push(currentPage);
          currentPage = {
            workExperience: [],
            education: [],
            courses: [],
            leftColumnContent: {
              skills: [],
              interests: []
            }
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
    
    // Helper function to distribute left column content
    const distributeLeftColumnContent = () => {
      let skillIndex = 0;
      let interestIndex = 0;
      
      // First, distribute all skills across pages
      if (data.strengths && data.strengths.length > 0) {
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          const skillsSectionHeight = 50; // Skills section header height
          let pageLeftHeight = skillsSectionHeight;
          
          // Reserve space for interests on each page
          const reservedForInterests = 150;
          const availableForSkills = maxLeftColumnHeight - reservedForInterests;
          
          // Add skills to this page, but respect the reserved space for interests
          while (skillIndex < data.strengths.length && pageLeftHeight < availableForSkills) {
            const skillHeight = estimateLeftColumnHeight('skill');
            if (pageLeftHeight + skillHeight <= availableForSkills) {
              page.leftColumnContent.skills.push(data.strengths[skillIndex]);
              pageLeftHeight += skillHeight + 12; // 12px spacing
              skillIndex++;
            } else {
              break;
            }
          }
        }
      }
      
      // Then, add interests to the page that contains the last skill
      if (data.interests && data.interests.length > 0) {
        // Find the page with the last skill
        let lastSkillPageIndex = -1;
        for (let i = pages.length - 1; i >= 0; i--) {
          if (pages[i].leftColumnContent.skills.length > 0) {
            lastSkillPageIndex = i;
            break;
          }
        }
        
        // If we found a page with skills, add interests to that page
        if (lastSkillPageIndex >= 0) {
          const page = pages[lastSkillPageIndex];
          const interestsSectionHeight = 50; // Interests section header height
          let pageLeftHeight = interestsSectionHeight;
          
          // Calculate how much space is already used by skills on this page
          const skillsUsedHeight = page.leftColumnContent.skills.length * estimateLeftColumnHeight('skill') + 
                                  (page.leftColumnContent.skills.length - 1) * 12 + // spacing between skills
                                  50; // skills section header
          
          // Reserve space for interests - ensure at least 150px is available
          const availableForInterests = Math.max(150, maxLeftColumnHeight - skillsUsedHeight);
          
          // Add interests to this page
          while (interestIndex < data.interests.length && pageLeftHeight < availableForInterests) {
            const interestHeight = estimateLeftColumnHeight('interest');
            if (pageLeftHeight + interestHeight <= availableForInterests) {
              page.leftColumnContent.interests.push(data.interests[interestIndex]);
              pageLeftHeight += interestHeight + 8; // 8px spacing
              interestIndex++;
            } else {
              break;
            }
          }
          
          // If there are still interests remaining, add them to the next page
          if (interestIndex < data.interests.length && lastSkillPageIndex + 1 < pages.length) {
            const nextPage = pages[lastSkillPageIndex + 1];
            const nextPageInterestsSectionHeight = 50;
            let nextPageLeftHeight = nextPageInterestsSectionHeight;
            
            while (interestIndex < data.interests.length && nextPageLeftHeight < maxLeftColumnHeight) {
              const interestHeight = estimateLeftColumnHeight('interest');
              if (nextPageLeftHeight + interestHeight <= maxLeftColumnHeight) {
                nextPage.leftColumnContent.interests.push(data.interests[interestIndex]);
                nextPageLeftHeight += interestHeight + 8; // 8px spacing
                interestIndex++;
              } else {
                break;
              }
            }
          }
        }
      }
    };
    
    // Start with header height for first page
    currentHeight = headerHeight;
    
    // Distribute content across pages
    if (data.workExperience && data.workExperience.length > 0) {
      addSectionToPage(data.workExperience, 'work');
    }
    
    if (data.courses && data.courses.length > 0) {
      addSectionToPage(data.courses, 'course');
    }
    
    if (data.education && data.education.length > 0) {
      addSectionToPage(data.education, 'education');
    }
    
    // Add the last page if it has content
    if (currentPage.workExperience.length > 0 || 
        currentPage.education.length > 0 || 
        currentPage.courses.length > 0) {
      pages.push(currentPage);
    }
    
    // If no pages were created, create at least one empty page
    if (pages.length === 0) {
      pages.push({
        workExperience: [],
        education: [],
        courses: [],
        leftColumnContent: {
          skills: [],
          interests: []
        }
      });
    }
    
    // Distribute left column content across pages
    distributeLeftColumnContent();
    
    return pages;
  };

  // Measure title width on mount and when title changes
  React.useEffect(() => {
    if (titleRef.current) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        // Get the computed font style from the element
        const computedStyle = window.getComputedStyle(titleRef.current);
        context.font = `${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`;
        const textWidth = context.measureText(data.jobTitle || '[Job Title]').width;
        setTitleWidth(textWidth);
      }
    }
  }, [data.jobTitle]);

  // Calculate pages
  const pages = calculatePages();

  // Render header (same for all pages)
  const renderHeader = () => (
    <div style={{ marginBottom: 16, background: MASTER_COLOR, padding: '12px' }}>
      <div style={{ 
        fontSize: '30px', 
        fontWeight: 500, 
        color: 'white',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        whiteSpace: 'normal',
        lineHeight: '1',
        marginBottom: 4
      }}>{personalInfo.name}</div>
      <div 
        ref={titleRef}
        style={{ 
          fontSize: '16px', 
          fontWeight: 500, 
          color: 'white',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          whiteSpace: 'normal',
          lineHeight: '1.2'
        }}
      >{data.jobTitle || '[Job Title]'}</div>
      <div style={{ 
        width: titleWidth > 0 ? `${titleWidth + 20}px` : '30%', 
        height: 1, 
        background: 'white', 
        margin: '6px 0 12px 0' 
      }} />
      <div style={{ 
        fontSize: '12px', 
        color: 'white',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        whiteSpace: 'normal',
        lineHeight: '1',
        marginRight: '14px'
      }}>{personalInfo.summary}</div>
    </div>
  );

  // Render right column content for a specific page
  const renderRightColumn = (pageContent: PageContent, isFirstPage: boolean = false, pageIndex: number = 0, allPages: PageContent[] = []) => {
    // Track which sections have already been started on previous pages
    const sectionsStarted = {
      workExperience: false,
      courses: false,
      education: false
    };
    
    // Check previous pages to see which sections have already started
    for (let i = 0; i < pageIndex; i++) {
      if (allPages[i].workExperience.length > 0) sectionsStarted.workExperience = true;
      if (allPages[i].courses.length > 0) sectionsStarted.courses = true;
      if (allPages[i].education.length > 0) sectionsStarted.education = true;
    }
    
    return (
    <div style={{ 
      width: '629px', // Always 629px (850px - 221px) to maintain left sidebar space
      margin: '24px 24px 90px 0', // Balanced bottom margin
      boxSizing: 'border-box'
    }}>
      {/* Header - only on first page and only if job title exists */}
      {isFirstPage && data.jobTitle && renderHeader()}
      
      {/* Work Experience */}
      {pageContent.workExperience.length > 0 && (
        <div style={{ marginBottom: 'clamp(16px, 3vw, 32px)' }}>
          {!sectionsStarted.workExperience && (
            <>
              <div style={{ 
                fontWeight: 700, 
                fontSize: 'clamp(14px, 2.2vw, 18px)', 
                color: MASTER_COLOR, 
                marginBottom: 4,
                marginLeft: '20px'
              }}>WORK EXPERIENCE</div>
              <div style={{ 
                width: '100%', 
                height: 2, 
                background: MASTER_COLOR, 
                margin: '4px 0 12px 0' 
              }} />
            </>
          )}
          {pageContent.workExperience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 12, marginLeft: '20px' }}>
              <div style={{ 
                fontWeight: 700, 
                fontSize: '16px',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'normal',
                color: MASTER_COLOR,
              }}>{exp.position}</div>
              <div style={{ 
                fontWeight: 600, 
                fontSize: '14px',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'normal',
                lineHeight: '1',
                marginBottom: 8
              }}>{exp.company}</div>
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ 
                  fontSize: '10px', 
                  color: MASTER_COLOR, 
                  marginBottom: 4,
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal',
                  fontStyle: 'italic'
                }}>{formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}</div>
                {(exp.city || exp.state) && (
                  <div style={{ 
                    fontSize: 'clamp(10px, 1.5vw, 12px)', 
                    color: MASTER_COLOR,
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal',
                    fontStyle: 'italic'
                  }}>{[exp.city, exp.state].filter(Boolean).join(', ')}</div>
                )}
              </div>
              {exp.bulletPoints.length > 0 && (
                <div style={{ 
                  fontSize: 'clamp(11px, 1.8vw, 14px)',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal',
                  lineHeight: '1.4'
                }}>
                  {exp.bulletPoints.map((bullet, bulletIndex) => (
                    <div key={bulletIndex} style={{ marginBottom: 4, flex: 1, display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                      <div style={{ 
                        width: 5, 
                        height: 5, 
                        border: `1px solid ${MASTER_COLOR}`, 
                        backgroundColor: 'transparent', 
                        marginRight: 4,
                        flexShrink: 0,
                        marginTop: 6
                      }}></div>
                      <div style={{ flex: 1, wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal', fontSize: 12, textAlign: 'justify' }}>{bullet.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Courses & Trainings */}
      {pageContent.courses.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          {!sectionsStarted.courses && (
            <>
              <div style={{ 
                fontWeight: 700, 
                fontSize: 'clamp(14px, 2.2vw, 18px)', 
                color: MASTER_COLOR, 
                marginBottom: 8,
                marginLeft: '20px'
              }}>COURSES & TRAININGS</div>
              <div style={{ 
                width: '100%', 
                height: 2, 
                background: MASTER_COLOR, 
                margin: '4px 0 12px 0' 
              }} />
            </>
          )}
          {pageContent.courses.map((course, i) => (
            <div key={i} style={{ marginBottom: 8, marginLeft: '20px' }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 2
              }}>
                <div style={{ 
                  fontSize: '14px',
                  fontWeight: 500,
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal',
                  lineHeight: '1.3',
                  flex: 1
                }}>{course.title}</div>
                {course.link && (
                  <a 
                    href={course.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      color: MASTER_COLOR,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <MdLink size={16} />
                  </a>
                )}
              </div>
              <div style={{ 
                fontSize: '10px',
                color: '#888',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'normal',
                lineHeight: '1.2',
                fontStyle: 'italic'
              }}>{course.provider}</div>
            </div>
          ))}
        </div>
      )}
      
      {/* Education */}
      {pageContent.education.length > 0 && (
        <div style={{ marginBottom: 'clamp(16px, 3vw, 32px)' }}>
          {!sectionsStarted.education && (
            <>
              <div style={{ 
                fontWeight: 700, 
                fontSize: 'clamp(14px, 2.2vw, 18px)', 
                color: MASTER_COLOR, 
                marginBottom: 8,
                marginLeft: '20px'
              }}>EDUCATION</div>
              <div style={{ 
                width: '100%', 
                height: 2, 
                background: MASTER_COLOR, 
                margin: '4px 0 12px 0' 
              }} />
            </>
          )}
          {pageContent.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: 12, marginLeft: '20px' }}>
              <div style={{ 
                fontWeight: 600, 
                fontSize: '16px',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'normal',
                color: MASTER_COLOR,
                lineHeight: '1',
                marginBottom: 4
              }}>{edu.degree} in {edu.field}</div>
              <div style={{ 
                fontSize: '14px', 
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'normal',
                lineHeight: '0.7',
                marginBottom: 7
              }}>{edu.institution}</div>
              <div style={{ 
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ 
                  fontSize: '10px', 
                  color: MASTER_COLOR,
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal',
                  lineHeight: '1.3',
                  fontStyle: 'italic'
                }}>{formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate)}</div>
                {edu.gpa &&
                  <div style={{ 
                    fontSize: '10px', 
                    color: MASTER_COLOR,
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal',
                    lineHeight: '1.3',
                    fontStyle: 'italic'
                  }}>{edu.gpa ? `GPA: ${edu.gpa}` : ''}</div>
                }
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  };

  // Render a single page
  const renderPage = (pageContent: PageContent, pageIndex: number) => {
    const isFirstPage = pageIndex === 0;
    
    return (
      <div
        key={pageIndex}
        className="modern-resume-page"
        style={{
          display: 'flex',
          fontFamily: 'sans-serif',
          background: '#fff',
          color: '#333',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          width: '850px',
          height: '1100px', // Letter size aspect ratio: 8.5:11 = 0.773, 850/1100 = 0.773 ✓
          position: 'relative',
          margin: '0 auto',
          marginBottom: pageIndex < pages.length - 1 ? '20px' : '0', // Add spacing between pages
          pageBreakAfter: pageIndex < pages.length - 1 ? 'always' : 'auto', // For PDF generation
          flexShrink: 0
        }}
      >
        {/* Left Column - on all pages to allow content to flow */}
        <div style={{ 
          width: '221px', // 26% of 850px
          padding: '24px 24px 90px 24px', // Balanced bottom padding
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'flex-start',
          minHeight: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}>
          {/* Profile Picture - only on first page and only if valid image exists */}
          {isFirstPage && data.profilePicture && data.profilePicture.trim() !== '' && data.profilePicture !== 'undefined' && (
            <div style={{ 
              width: '160px',
              height: '160px',
              borderRadius: '10%', 
              marginBottom: '20px',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              {data.profilePicture.startsWith('data:') ? (
                // Handle base64 data URLs with regular img tag
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={data.profilePicture}
                  alt="Profile"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '10%',
                    display: 'block'
                  }}
                  onError={(e) => {
                    // Hide the image container on error
                    const container = e.currentTarget.parentElement;
                    if (container) {
                      container.style.display = 'none';
                    }
                  }}
                />
              ) : data.profilePicture.startsWith('profile_') ? (
                // Handle localStorage image IDs
                (() => {
                  const storedImage = getImage(data.profilePicture);
                  return storedImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={storedImage}
                      alt="Profile"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '10%',
                        display: 'block'
                      }}
                      onError={(e) => {
                        // Hide the image container on error
                        const container = e.currentTarget.parentElement;
                        if (container) {
                          container.style.display = 'none';
                        }
                      }}
                    />
                  ) : null;
                })()
              ) : data.profilePicture && data.profilePicture.trim() !== '' ? (
                // Handle regular URLs with Next.js Image component
                <Image 
                  src={data.profilePicture.startsWith('http') ? data.profilePicture : `${window.location.origin}${data.profilePicture}`}
                  alt="Profile"
                  width={160}
                  height={160}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '10%',
                    display: 'block'
                  }}
                  onError={(e) => {
                    // Hide the image container on error
                    // @ts-expect-error: Next.js Image onError typing
                    const container = e.target.parentElement;
                    if (container) {
                      container.style.display = 'none';
                    }
                  }}
                />
              ) : null}
            </div>
          )}
          
          {/* Contact Info - only on first page */}
          {isFirstPage && (
            <div style={{ width: '160px', marginBottom: '24px' }}>
              {personalInfo.email && (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'flex-start', 
                  fontSize: 'clamp(10px, 1.5vw, 12px)', 
                  marginBottom: 12, 
                  wordWrap: 'break-word', 
                  overflowWrap: 'break-word', 
                  whiteSpace: 'normal' 
                }}>
                  <MdEmail size="clamp(12px, 2vw, 16px)" style={{ color: MASTER_COLOR, marginRight: 8, flexShrink: 0 }} />
                  <span style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.phone && (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'flex-start', 
                  fontSize: 'clamp(10px, 1.5vw, 12px)', 
                  marginBottom: 12, 
                  wordWrap: 'break-word', 
                  overflowWrap: 'break-word', 
                  whiteSpace: 'normal' 
                }}>
                  <MdPhone size="clamp(12px, 2vw, 16px)" style={{ color: MASTER_COLOR, marginRight: 8, flexShrink: 0 }} />
                  <span style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>{personalInfo.phone}</span>
                </div>
              )}
              {(personalInfo.city || personalInfo.state) && (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'flex-start', 
                  fontSize: 'clamp(10px, 1.5vw, 12px)', 
                  marginBottom: 12, 
                  wordWrap: 'break-word', 
                  overflowWrap: 'break-word', 
                  whiteSpace: 'normal' 
                }}>
                  <MdLocationOn size="clamp(12px, 2vw, 16px)" style={{ color: MASTER_COLOR, marginRight: 8, flexShrink: 0 }} />
                  <span style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>{[personalInfo.city, personalInfo.state].filter(Boolean).join(', ')}</span>
                </div>
              )}
              {personalInfo.website && (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'flex-start', 
                  fontSize: 'clamp(10px, 1.5vw, 12px)', 
                  marginBottom: 12, 
                  wordWrap: 'break-word', 
                  overflowWrap: 'break-word', 
                  whiteSpace: 'normal' 
                }}>
                  <MdLanguage size="clamp(12px, 2vw, 16px)" style={{ color: MASTER_COLOR, marginRight: 8, flexShrink: 0 }} />
                  <span style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>{formatUrl(personalInfo.website)}</span>
                </div>
              )}
              {personalInfo.linkedin && (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'flex-start', 
                  fontSize: 'clamp(10px, 1.5vw, 12px)', 
                  marginBottom: 12, 
                  wordWrap: 'break-word', 
                  overflowWrap: 'break-word', 
                  whiteSpace: 'normal' 
                }}>
                  <FaLinkedin size="clamp(12px, 2vw, 16px)" style={{ color: MASTER_COLOR, marginRight: 8, flexShrink: 0 }} />
                  <span style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>{formatUrl(personalInfo.linkedin)}</span>
                </div>
              )}
              {personalInfo.github && (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'flex-start', 
                  fontSize: 'clamp(10px, 1.5vw, 12px)', 
                  marginBottom: 12, 
                  wordWrap: 'break-word', 
                  overflowWrap: 'break-word', 
                  whiteSpace: 'normal' 
                }}>
                  <FaGithub size="clamp(12px, 2vw, 16px)" style={{ color: MASTER_COLOR, marginRight: 8, flexShrink: 0 }} />
                  <span style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>{formatUrl(personalInfo.github)}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Technical Skills - on all pages to allow overflow */}
          {pageContent.leftColumnContent.skills && pageContent.leftColumnContent.skills.length > 0 && (
            <div style={{ width: '100%', maxWidth: '180px', marginBottom: '32px' }}>
              {/* Only show title on first page that has skills */}
              {(() => {
                // Check if this is the first page that has skills
                let isFirstPageWithSkills = false;
                for (let i = 0; i <= pageIndex; i++) {
                  if (i === pageIndex) {
                    isFirstPageWithSkills = true;
                    break;
                  }
                  if (pages[i].leftColumnContent.skills.length > 0) {
                    break;
                  }
                }
                return isFirstPageWithSkills;
              })() && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ 
                    fontWeight: 700, 
                    fontSize: '16px', 
                    color: MASTER_COLOR,
                    textAlign: 'left',
                  }}>TECHNICAL SKILLS</div>
                  <div style={{ width: '100%', height: 2, background: MASTER_COLOR, margin: '2px 0 0 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: 10 }}>
                    {[...Array(4)].map((_, i) => (
                      <div key={i} style={{ width: 2, height: 5, background: MASTER_COLOR, borderRadius: 0 }} />
                    ))}
                  </div>
                </div>
              )}
              {pageContent.leftColumnContent.skills.map((s, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ 
                    fontSize: 'clamp(10px, 1.5vw, 12px)', 
                    marginBottom: 4, 
                    wordWrap: 'break-word', 
                    overflowWrap: 'break-word', 
                    whiteSpace: 'normal',
                    lineHeight: '1.2'
                  }}>{s.skillName}</div>
                  <div style={{ 
                    width: '100%', 
                    height: '10px', 
                    backgroundColor: 'transparent', 
                    border: `2px solid ${MASTER_COLOR}`,
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${(s.rating / 10) * 100}%`,
                      height: '100%',
                      backgroundColor: MASTER_COLOR,
                      padding: 1
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Interests - on all pages to allow overflow */}
          {pageContent.leftColumnContent.interests && pageContent.leftColumnContent.interests.length > 0 && (
            <div style={{ width: '100%', maxWidth: '180px', justifyContent: 'flex-start' }}>
              <div style={{ 
                fontWeight: 700, 
                fontSize: 'clamp(12px, 2vw, 16px)', 
                color: MASTER_COLOR,
                textAlign: 'left'
              }}>INTERESTS</div>
              <div style={{ 
                width: '100%', 
                height: 2, 
                background: MASTER_COLOR, 
                margin: '2px 0 12px 0' 
              }} />
              {pageContent.leftColumnContent.interests.map((interest, i) => (
                <div key={i} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: 8,
                  gap: 8
                }}>
                  <span style={{
                    fontSize: '16px',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>{interest.icon}</span>
                  <div style={{ 
                    fontSize: 'clamp(11px, 1.8vw, 14px)', 
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal',
                    lineHeight: '1.2'
                  }}>{interest.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Right Column */}
        {renderRightColumn(pageContent, isFirstPage, pageIndex, pages)}
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

export default ModernResumeTemplate; 