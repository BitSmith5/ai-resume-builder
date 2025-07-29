import React, { useRef, useEffect, useState } from 'react';

interface ResumeData {
  title: string;
  jobTitle?: string;
  profilePicture?: string;
  fontFamily?: string; // Font family for the resume
  nameSize?: number; // Font size for the name header
  sectionHeadersSize?: number; // Font size for section headers
  subHeadersSize?: number; // Font size for sub-headers (job titles, company names, etc.)
  bodyTextSize?: number; // Font size for body text
  sectionSpacing?: number; // Spacing between sections
  entrySpacing?: number; // Spacing between subsections
  lineSpacing?: number; // Line spacing for text
  topBottomMargin?: number; // Top and bottom margins
  sideMargins?: number; // Left and right margins
  alignTextLeftRight?: boolean; // Whether to justify text
  sectionOrder?: string[]; // Array of section names in display order
  pageWidth?: number; // Page width in pixels
  pageHeight?: number; // Page height in pixels
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
  skillCategories?: Array<{
    id: string;
    title: string;
    skills: Array<{
      id: string;
      name: string;
    }>;
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
  projects?: Array<{
    id: string;
    title: string;
    bulletPoints: Array<{
      id: string;
      description: string;
    }>;
    technologies: string[];
    link: string;
    startDate: string;
    endDate: string;
    current: boolean;
  }>;
  languages?: Array<{
    id: string;
    name: string;
    proficiency: string;
  }>;
  publications?: Array<{
    id: string;
    title: string;
    authors: string;
    journal: string;
    year: string;
    doi: string;
    link: string;
  }>;
  awards?: Array<{
    id: string;
    title: string;
    organization: string;
    year: string;
    bulletPoints: Array<{
      id: string;
      description: string;
    }>;
  }>;
  volunteerExperience?: Array<{
    id: string;
    organization: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    bulletPoints: Array<{
      id: string;
      description: string;
    }>;
    hoursPerWeek: string;
  }>;
  references?: Array<{
    id: string;
    name: string;
    title: string;
    company: string;
    email: string;
    phone: string;
    relationship: string;
  }>;
  deletedSections?: string[]; // New field for deleted sections
}

interface ClassicResumeTemplateProps {
  data: ResumeData;
}

interface SectionInfo {
  id: string;
  name: string;
  element: HTMLElement;
  height: number;
  content: any;
  type: string;
}

interface PageInfo {
  sections: SectionInfo[];
  totalHeight: number;
}

const ClassicResumeTemplate: React.FC<ClassicResumeTemplateProps> = ({ data }) => {
  const { personalInfo } = data.content;
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [isMeasuring, setIsMeasuring] = useState(true);
  const resumeRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Function to format dates as MMM YYYY
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      return `${month} ${year}`;
    } catch {
      return dateString;
    }
  };

  // Function to format URLs by removing http/https prefix
  const formatUrl = (url: string): string => {
    if (!url) return '';
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '');
  };

  // Get actual height of an element including margins
  const getElementHeight = (element: HTMLElement): number => {
    const rect = element.getBoundingClientRect();
    const styles = window.getComputedStyle(element);
    
    // Get the element's height including padding and border
    let height = rect.height;
    
    // Add margins (top + bottom)
    const marginTop = parseFloat(styles.marginTop) || 0;
    const marginBottom = parseFloat(styles.marginBottom) || 0;
    height += marginTop + marginBottom;
    
    return height;
  };

  // Calculate collapsed margin height between elements
  const getCollapsedMarginHeight = (prevElement: HTMLElement | null, currentElement: HTMLElement): number => {
    if (!prevElement) return 0;
    
    const prevStyles = window.getComputedStyle(prevElement);
    const currentStyles = window.getComputedStyle(currentElement);
    
    const prevMarginBottom = parseFloat(prevStyles.marginBottom) || 0;
    const currentMarginTop = parseFloat(currentStyles.marginTop) || 0;
    
    // When margins collapse, the larger margin wins
    return Math.max(prevMarginBottom, currentMarginTop);
  };

  // Calculate pages based on actual DOM measurements
  const calculatePagesFromDOM = (): PageInfo[] => {
    const targetPageHeight = data.pageHeight || 1100;
    const paddingBuffer = 20;
    const headerHeight = data.profilePicture ? 180 : 120; // Header height for first page
    const maxContentHeight = targetPageHeight - paddingBuffer;
    const bottomMargin = data.topBottomMargin || 40; // Bottom margin to respect
    
    const pages: PageInfo[] = [];
    let currentPage: PageInfo = { sections: [], totalHeight: headerHeight };
    let prevSection: HTMLElement | null = null;

    // Get all section elements in order, but only include sections that have data and are not deleted
    const sectionOrder = data.sectionOrder || [
      'Professional Summary',
      'Technical Skills',
      'Work Experience',
      'Education',
      'Projects',
      'Courses',
      'Languages',
      'Publications',
      'Awards',
      'Volunteer Experience',
      'References',
      'Skills',
      'Interests'
    ];

    // Filter out deleted sections
    const deletedSections = data.deletedSections || [];
    const activeSections = sectionOrder.filter(section => !deletedSections.includes(section));

    for (const sectionName of activeSections) {
      const sectionId = sectionName.toLowerCase().replace(/\s+/g, '-');
      const sectionElement = sectionRefs.current.get(sectionId);
      
      if (!sectionElement) continue;

      const sectionHeight = getElementHeight(sectionElement);
      const collapsedMarginHeight = getCollapsedMarginHeight(prevSection, sectionElement);
      const totalSectionHeight = sectionHeight + collapsedMarginHeight;

      // Check if this section would overflow the current page
      // Account for bottom margin to ensure no content goes beyond it
      const availableHeight = maxContentHeight - bottomMargin - currentPage.totalHeight;
      
      if (totalSectionHeight > availableHeight && currentPage.sections.length > 0) {
        // Start a new page
        pages.push(currentPage);
        currentPage = { sections: [], totalHeight: 0 }; // No header on subsequent pages
        prevSection = null; // Reset prev section for new page
      }

      // Add section to current page
      currentPage.sections.push({
        id: sectionId,
        name: sectionName,
        element: sectionElement,
        height: sectionHeight,
        content: null, // We'll get content from the element
        type: sectionName
      });
      currentPage.totalHeight += totalSectionHeight;
      prevSection = sectionElement;
    }

    // Add the last page if it has content
    if (currentPage.sections.length > 0) {
      pages.push(currentPage);
    }

    return pages;
  };

  // Effect to measure sections and calculate pages
  useEffect(() => {
    if (!resumeRef.current) return;

    // Wait for next tick to ensure all elements are rendered
    const timer = setTimeout(() => {
      const calculatedPages = calculatePagesFromDOM();
      setPages(calculatedPages);
      setIsMeasuring(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [data]);

  // Render header (same for all pages)
  const renderHeader = () => (
    <div style={{ textAlign: 'center', marginBottom: '15px' }}>
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
        fontSize: `${data.nameSize || 40}px`, 
        fontWeight: 'normal', 
        margin: '0 0 1px 0',
        fontFamily: data.fontFamily || 'Times New Roman, serif'
      }}>
        {personalInfo.name}
      </h1>
      {data.jobTitle && (
        <div style={{ 
          fontSize: '16px', 
          fontWeight: 'normal', 
          margin: '0 0 4px 0',
          fontFamily: data.fontFamily || 'Times New Roman, serif',
          color: '#333'
        }}>
          {data.jobTitle}
        </div>
      )}
      <div style={{ 
        fontSize: '12px', 
        color: '#333',
        fontFamily: data.fontFamily || 'Times New Roman, serif',
        lineHeight: '1.4'
      }}>
        {[
          (personalInfo.city || personalInfo.state) && [personalInfo.city, personalInfo.state].filter(Boolean).join(', '),
          personalInfo.phone,
          personalInfo.email,
          personalInfo.linkedin && (
            <a 
              href={personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: '#333', 
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              LinkedIn
            </a>
          ),
          personalInfo.github && (
            <a 
              href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: '#333', 
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              GitHub
            </a>
          ),
          personalInfo.website && (
            <a 
              href={personalInfo.website.startsWith('http') ? personalInfo.website : `https://${personalInfo.website}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: '#333', 
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              Portfolio
            </a>
          )
        ].filter(Boolean).map((item, index, array) => (
          <span key={index}>
            {item}
            {index < array.length - 1 && <span style={{ margin: '0 8px', color: '#666' }}>|</span>}
          </span>
        ))}
      </div>
    </div>
  );

  // Section render functions with refs for measurement
  const renderProfessionalSummary = () => {
    if (!personalInfo.summary) return null;
    return (
      <div 
        ref={(el) => { if (el) sectionRefs.current.set('professional-summary', el); }}
        style={{ marginBottom: data.sectionSpacing !== undefined ? `${data.sectionSpacing}px` : '20px' }}
      >
        <h2 style={{ 
          fontSize: `${data.sectionHeadersSize || 18}px`, 
          fontWeight: 'bold', 
          margin: '0 0 8px 0',
          textTransform: 'uppercase',
          borderBottom: '1px solid #000',
          paddingBottom: '4px'
        }}>
          Professional Summary
        </h2>
        <p style={{ 
          fontSize: `${data.bodyTextSize || 14}px`, 
          margin: '0', 
          lineHeight: data.lineSpacing !== undefined ? `${data.lineSpacing / 10}` : '1.4',
          textAlign: data.alignTextLeftRight ? 'justify' : 'left'
        }}>
          {personalInfo.summary}
        </p>
      </div>
    );
  };

  const renderTechnicalSkills = () => {
    if (!data.skillCategories || data.skillCategories.length === 0) return null;
    return (
      <div 
        ref={(el) => { if (el) sectionRefs.current.set('technical-skills', el); }}
        style={{ marginBottom: data.sectionSpacing !== undefined ? `${data.sectionSpacing}px` : '20px' }}
      >
        <h2 style={{ 
          fontSize: `${data.sectionHeadersSize || 18}px`, 
          fontWeight: 'bold', 
          margin: '0 0 12px 0',
          textTransform: 'uppercase',
          borderBottom: '1px solid #000',
          paddingBottom: '4px'
        }}>
          Technical Skills
        </h2>
        <ul style={{ 
          fontSize: `${data.bodyTextSize || 14}px`, 
          margin: '0', 
          paddingLeft: '20px',
          listStyleType: 'disc',
          lineHeight: data.lineSpacing !== undefined ? `${data.lineSpacing / 10}` : '1.4'
        }}>
          {data.skillCategories.map((category, categoryIndex) => (
            <li key={categoryIndex} style={{ 
              marginBottom: data.entrySpacing !== undefined ? `${data.entrySpacing}px` : '8px',
              fontWeight: 'bold',
              lineHeight: data.lineSpacing !== undefined ? `${data.lineSpacing / 10}` : '1.4'
            }}>
              {category.title}: {category.skills.map((skill, skillIndex) => (
                <span key={skillIndex} style={{ 
                  fontWeight: 'normal',
                  marginRight: '4px'
                }}>
                  {skill.name}{skillIndex < category.skills.length - 1 ? ', ' : ''}
                </span>
              ))}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderWorkExperience = () => {
    if (!data.workExperience || data.workExperience.length === 0) return null;
    return (
      <div 
        ref={(el) => { if (el) sectionRefs.current.set('work-experience', el); }}
        style={{ marginBottom: data.sectionSpacing !== undefined ? `${data.sectionSpacing}px` : '20px' }}
      >
        <h2 style={{ 
          fontSize: `${data.sectionHeadersSize || 18}px`, 
          fontWeight: 'bold', 
          margin: '0 0 12px 0',
          textTransform: 'uppercase',
          borderBottom: '1px solid #000',
          paddingBottom: '4px'
        }}>
          Work Experience
        </h2>
        {data.workExperience.map((exp, index) => (
          <div key={index} style={{ marginBottom: data.entrySpacing !== undefined ? `${data.entrySpacing}px` : '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <h3 style={{ 
                fontSize: `${data.subHeadersSize || 16}px`, 
                fontWeight: 'bold', 
                margin: '0',
                lineHeight: data.lineSpacing !== undefined ? `${data.lineSpacing / 10}` : '1.4',
                textTransform: 'uppercase'
              }}>
                {exp.position}
              </h3>
              <span style={{ fontSize: '14px', color: '#000', fontWeight: 'bold' }}>
                {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
              </span>
            </div>
            <div style={{ 
              fontSize: `${data.subHeadersSize || 14}px`, 
              fontWeight: 'bold', 
              color: '#333',
              marginBottom: '8px',
              lineHeight: data.lineSpacing !== undefined ? `${data.lineSpacing / 10}` : '1.4',
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
                fontSize: `${data.bodyTextSize || 13}px`, 
                margin: '0', 
                paddingLeft: '20px',
                lineHeight: data.lineSpacing !== undefined ? `${data.lineSpacing / 10}` : '1.4',
                textAlign: data.alignTextLeftRight ? 'justify' : 'left'
              }}>
                {exp.bulletPoints.map((bullet, bulletIndex) => (
                  <li key={bulletIndex} style={{ 
                    marginBottom: '2px',
                    lineHeight: data.lineSpacing !== undefined ? `${data.lineSpacing / 10}` : '1.4'
                  }}>
                    {bullet.description}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderEducation = () => {
    if (!data.education || data.education.length === 0) return null;
    return (
      <div 
        ref={(el) => { if (el) sectionRefs.current.set('education', el); }}
        style={{ marginBottom: data.sectionSpacing !== undefined ? `${data.sectionSpacing}px` : '20px' }}
      >
        <h2 style={{ 
          fontSize: `${data.sectionHeadersSize || 18}px`, 
          fontWeight: 'bold', 
          margin: '0 0 12px 0',
          textTransform: 'uppercase',
          borderBottom: '1px solid #000',
          paddingBottom: '4px'
        }}>
          Education
        </h2>
        {data.education.map((edu, index) => (
          <div key={index} style={{ marginBottom: data.entrySpacing !== undefined ? `${data.entrySpacing}px` : '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <h3 style={{ 
                fontSize: `${data.subHeadersSize || 16}px`, 
                fontWeight: 'bold', 
                margin: '0',
                lineHeight: data.lineSpacing !== undefined ? `${data.lineSpacing / 10}` : '1.4',
                textTransform: 'uppercase'
              }}>
                {edu.degree} in {edu.field}
              </h3>
              <span style={{ fontSize: '14px', color: '#000', fontWeight: 'bold' }}>
                {formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate)}
              </span>
            </div>
            <div style={{ 
              fontSize: `${data.subHeadersSize || 14}px`, 
              fontWeight: 'bold', 
              color: '#333',
              marginBottom: '3px',
              lineHeight: data.lineSpacing !== undefined ? `${data.lineSpacing / 10}` : '1.4',
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
    );
  };

  const renderProjects = () => {
    if (!data.projects || data.projects.length === 0) return null;
    return (
      <div 
        ref={(el) => { if (el) sectionRefs.current.set('projects', el); }}
        style={{ marginBottom: data.sectionSpacing !== undefined ? `${data.sectionSpacing}px` : '20px' }}
      >
        <h2 style={{ 
          fontSize: `${data.sectionHeadersSize || 18}px`, 
          fontWeight: 'bold', 
          margin: '0 0 12px 0',
          textTransform: 'uppercase',
          borderBottom: '1px solid #000',
          paddingBottom: '4px'
        }}>
          Projects
        </h2>
        {data.projects.map((project, index) => (
          <div key={index} style={{ marginBottom: data.entrySpacing !== undefined ? `${data.entrySpacing}px` : '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <h3 style={{ 
                fontSize: `${data.subHeadersSize || 16}px`, 
                fontWeight: 'bold', 
                margin: '0',
                lineHeight: data.lineSpacing !== undefined ? `${data.lineSpacing / 10}` : '1.4',
                textTransform: 'uppercase'
              }}>
                {project.title}
              </h3>
              <span style={{ fontSize: '14px', color: '#000', fontWeight: 'bold' }}>
                {formatDate(project.startDate)} - {project.current ? 'Present' : formatDate(project.endDate)}
              </span>
            </div>
            <div style={{ 
              fontSize: `${data.subHeadersSize || 14}px`, 
              fontWeight: 'bold', 
              color: '#333',
              marginBottom: '8px',
              lineHeight: data.lineSpacing !== undefined ? `${data.lineSpacing / 10}` : '1.4',
              fontStyle: 'italic'
            }}>
              Technologies: {project.technologies.join(', ')}
            </div>
            {project.bulletPoints.length > 0 && (
              <ul style={{ 
                fontSize: `${data.bodyTextSize || 13}px`, 
                margin: '0', 
                paddingLeft: '20px',
                lineHeight: data.lineSpacing !== undefined ? `${data.lineSpacing / 10}` : '1.4',
                textAlign: data.alignTextLeftRight ? 'justify' : 'left'
              }}>
                {project.bulletPoints.map((bullet, bulletIndex) => (
                  <li key={bulletIndex} style={{ 
                    marginBottom: '2px',
                    lineHeight: data.lineSpacing !== undefined ? `${data.lineSpacing / 10}` : '1.4'
                  }}>
                    {bullet.description}
                  </li>
                ))}
              </ul>
            )}
            {project.link && (
              <div style={{ fontSize: '12px', color: '#666' }}>
                <a href={project.link} target="_blank" rel="noopener noreferrer" style={{ color: '#666', textDecoration: 'underline' }}>
                  {formatUrl(project.link)}
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderCourses = () => {
    if (!data.courses || data.courses.length === 0) return null;
    return (
      <div 
        ref={(el) => { if (el) sectionRefs.current.set('courses', el); }}
        style={{ marginBottom: data.sectionSpacing !== undefined ? `${data.sectionSpacing}px` : '20px' }}
      >
        <h2 style={{ 
          fontSize: `${data.sectionHeadersSize || 18}px`, 
          fontWeight: 'bold', 
          margin: '0 0 12px 0',
          textTransform: 'uppercase',
          borderBottom: '1px solid #000',
          paddingBottom: '4px'
        }}>
          Courses & Certifications
        </h2>
        {data.courses.map((course, index) => (
          <div key={index} style={{ marginBottom: data.entrySpacing !== undefined ? `${data.entrySpacing}px` : '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <h3 style={{ 
                fontSize: `${data.subHeadersSize || 16}px`, 
                fontWeight: 'bold', 
                margin: '0',
                lineHeight: data.lineSpacing !== undefined ? `${data.lineSpacing / 10}` : '1.4',
                textTransform: 'uppercase'
              }}>
                {course.title}
              </h3>
            </div>
            <div style={{ 
              fontSize: `${data.subHeadersSize || 14}px`, 
              fontWeight: 'bold', 
              color: '#333',
              marginBottom: '3px',
              lineHeight: data.lineSpacing !== undefined ? `${data.lineSpacing / 10}` : '1.4',
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
    );
  };

  const renderLanguages = () => {
    if (!data.languages || data.languages.length === 0) return null;
    return (
      <div 
        ref={(el) => { if (el) sectionRefs.current.set('languages', el); }}
        style={{ marginBottom: data.sectionSpacing !== undefined ? `${data.sectionSpacing}px` : '20px' }}
      >
        <h2 style={{ 
          fontSize: `${data.sectionHeadersSize || 18}px`, 
          fontWeight: 'bold', 
          margin: '0 0 8px 0',
          textTransform: 'uppercase',
          borderBottom: '1px solid #000',
          paddingBottom: '4px'
        }}>
          Languages
        </h2>
        <div style={{ 
          fontSize: `${data.bodyTextSize || 14}px`, 
          fontWeight: 'bold',
          lineHeight: data.lineSpacing !== undefined ? `${data.lineSpacing / 10}` : '1.4',
          textAlign: data.alignTextLeftRight ? 'justify' : 'left'
        }}>
          {data.languages.map((language) => 
            `${language.name} (${language.proficiency})`
          ).join(', ')}
        </div>
      </div>
    );
  };

  const renderSkills = () => {
    if (!data.strengths || data.strengths.length === 0) return null;
    return (
      <div 
        ref={(el) => { if (el) sectionRefs.current.set('skills', el); }}
        style={{ marginBottom: data.sectionSpacing !== undefined ? `${data.sectionSpacing}px` : '20px' }}
      >
        <h2 style={{ 
          fontSize: `${data.sectionHeadersSize || 18}px`, 
          fontWeight: 'bold', 
          margin: '0 0 8px 0',
          textTransform: 'uppercase',
          borderBottom: '1px solid #000',
          paddingBottom: '4px'
        }}>
          Skills
        </h2>
        <div style={{ 
          fontSize: `${data.bodyTextSize || 14}px`,
          lineHeight: data.lineSpacing !== undefined ? `${data.lineSpacing / 10}` : '1.4'
        }}>
          {data.strengths.map((strength, index) => (
            <span key={index} style={{ 
              display: 'inline-block',
              marginRight: '15px',
              marginBottom: data.entrySpacing !== undefined ? `${data.entrySpacing}px` : '4px',
              fontWeight: 'bold'
            }}>
              {strength.skillName} ({strength.rating}/10)
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderInterests = () => {
    if (!data.interests || data.interests.length === 0) return null;
    return (
      <div 
        ref={(el) => { if (el) sectionRefs.current.set('interests', el); }}
        style={{ marginBottom: data.sectionSpacing !== undefined ? `${data.sectionSpacing}px` : '20px' }}
      >
        <h2 style={{ 
          fontSize: `${data.sectionHeadersSize || 18}px`, 
          fontWeight: 'bold', 
          margin: '0 0 8px 0',
          textTransform: 'uppercase',
          borderBottom: '1px solid #000',
          paddingBottom: '4px'
        }}>
          Interests
        </h2>
        <div style={{ 
          fontSize: `${data.bodyTextSize || 14}px`,
          lineHeight: data.lineSpacing !== undefined ? `${data.lineSpacing / 10}` : '1.4'
        }}>
          {data.interests.map((interest, index) => (
            <span key={index} style={{ 
              display: 'inline-block',
              marginRight: '15px',
              marginBottom: data.entrySpacing !== undefined ? `${data.entrySpacing}px` : '4px'
            }}>
              {interest.icon} {interest.name}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderPublications = () => {
    if (!data.publications || data.publications.length === 0) return null;
    return (
      <div 
        ref={(el) => { if (el) sectionRefs.current.set('publications', el); }}
        style={{ marginBottom: data.sectionSpacing !== undefined ? `${data.sectionSpacing}px` : '20px' }}
      >
        <h2 style={{ 
          fontSize: `${data.sectionHeadersSize || 18}px`, 
          fontWeight: 'bold', 
          margin: '0 0 12px 0',
          textTransform: 'uppercase',
          borderBottom: '1px solid #000',
          paddingBottom: '4px'
        }}>
          Publications
        </h2>
        {data.publications.map((pub, index) => (
          <div key={index} style={{ marginBottom: data.entrySpacing !== undefined ? `${data.entrySpacing}px` : '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <h3 style={{ 
                fontSize: `${data.subHeadersSize || 16}px`, 
                fontWeight: 'bold', 
                margin: '0',
                lineHeight: data.lineSpacing !== undefined ? `${data.lineSpacing / 10}` : '1.4',
                textTransform: 'uppercase'
              }}>
                {pub.title}
              </h3>
              <span style={{ fontSize: '14px', color: '#000', fontWeight: 'bold' }}>
                {pub.year}
              </span>
            </div>
            <div style={{ 
              fontSize: `${data.subHeadersSize || 14}px`, 
              fontWeight: 'bold', 
              color: '#333',
              marginBottom: '3px',
              lineHeight: data.lineSpacing !== undefined ? `${data.lineSpacing / 10}` : '1.4',
              fontStyle: 'italic'
            }}>
              {pub.authors}
            </div>
            <div style={{ 
              fontSize: `${data.subHeadersSize || 14}px`, 
              fontWeight: 'bold', 
              color: '#333',
              marginBottom: '3px',
              lineHeight: data.lineSpacing !== undefined ? `${data.lineSpacing / 10}` : '1.4',
              fontStyle: 'italic'
            }}>
              {pub.journal}
            </div>
            {pub.doi && (
              <div style={{ fontSize: '12px', color: '#666' }}>
                DOI: {pub.doi}
              </div>
            )}
            {pub.link && (
              <div style={{ fontSize: '12px', color: '#666' }}>
                <a href={pub.link} target="_blank" rel="noopener noreferrer" style={{ color: '#666', textDecoration: 'underline' }}>
                  {formatUrl(pub.link)}
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderAwards = () => {
    if (!data.awards || data.awards.length === 0) return null;
    return (
      <div 
        ref={(el) => { if (el) sectionRefs.current.set('awards', el); }}
        style={{ marginBottom: data.sectionSpacing !== undefined ? `${data.sectionSpacing}px` : '20px' }}
      >
        <h2 style={{ 
          fontSize: `${data.sectionHeadersSize || 18}px`, 
          fontWeight: 'bold', 
          margin: '0 0 12px 0',
          textTransform: 'uppercase',
          borderBottom: '1px solid #000',
          paddingBottom: '4px'
        }}>
          Awards
        </h2>
        {data.awards.map((award, index) => (
          <div key={index} style={{ marginBottom: data.entrySpacing !== undefined ? `${data.entrySpacing}px` : '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <h3 style={{ 
                fontSize: `${data.subHeadersSize || 16}px`, 
                fontWeight: 'bold', 
                margin: '0',
                lineHeight: data.lineSpacing !== undefined ? `${data.lineSpacing / 10}` : '1.4',
                textTransform: 'uppercase'
              }}>
                {award.title}
              </h3>
              <span style={{ fontSize: '14px', color: '#000', fontWeight: 'bold' }}>
                {award.year}
              </span>
            </div>
            <div style={{ 
              fontSize: `${data.subHeadersSize || 14}px`, 
              fontWeight: 'bold', 
              color: '#333',
              marginBottom: '3px',
              lineHeight: data.lineSpacing !== undefined ? `${data.lineSpacing / 10}` : '1.4',
              fontStyle: 'italic'
            }}>
              {award.organization}
            </div>
            {award.bulletPoints.length > 0 && (
              <ul style={{ 
                fontSize: `${data.bodyTextSize || 13}px`, 
                margin: '0', 
                paddingLeft: '20px',
                lineHeight: data.lineSpacing !== undefined ? `${data.lineSpacing / 10}` : '1.4',
                textAlign: data.alignTextLeftRight ? 'justify' : 'left'
              }}>
                {award.bulletPoints.map((bullet, bulletIndex) => (
                  <li key={bulletIndex} style={{ 
                    marginBottom: '2px',
                    lineHeight: data.lineSpacing !== undefined ? `${data.lineSpacing / 10}` : '1.4'
                  }}>
                    {bullet.description}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderVolunteerExperience = () => {
    if (!data.volunteerExperience || data.volunteerExperience.length === 0) return null;
    return (
      <div 
        ref={(el) => { if (el) sectionRefs.current.set('volunteer-experience', el); }}
        style={{ marginBottom: data.sectionSpacing !== undefined ? `${data.sectionSpacing}px` : '20px' }}
      >
        <h2 style={{ 
          fontSize: `${data.sectionHeadersSize || 18}px`, 
          fontWeight: 'bold', 
          margin: '0 0 12px 0',
          textTransform: 'uppercase',
          borderBottom: '1px solid #000',
          paddingBottom: '4px'
        }}>
          Volunteer Experience
        </h2>
        {data.volunteerExperience.map((volunteer, index) => (
          <div key={index} style={{ marginBottom: data.entrySpacing !== undefined ? `${data.entrySpacing}px` : '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <h3 style={{ 
                fontSize: `${data.subHeadersSize || 16}px`, 
                fontWeight: 'bold', 
                margin: '0',
                lineHeight: data.lineSpacing !== undefined ? `${data.lineSpacing / 10}` : '1.4',
                textTransform: 'uppercase'
              }}>
                {volunteer.position}
              </h3>
              <span style={{ fontSize: '14px', color: '#000', fontWeight: 'bold' }}>
                {formatDate(volunteer.startDate)} - {volunteer.current ? 'Present' : formatDate(volunteer.endDate)}
              </span>
            </div>
            <div style={{ 
              fontSize: `${data.subHeadersSize || 14}px`, 
              fontWeight: 'bold', 
              color: '#333',
              marginBottom: '3px',
              lineHeight: data.lineSpacing !== undefined ? `${data.lineSpacing / 10}` : '1.4',
              fontStyle: 'italic'
            }}>
              {volunteer.organization}
            </div>
            {(volunteer.location || volunteer.hoursPerWeek) && (
              <div style={{ fontSize: '12px', color: '#666' }}>
                {volunteer.location && `Location: ${volunteer.location}`}
                {volunteer.location && volunteer.hoursPerWeek && `, `}
                {volunteer.hoursPerWeek && `Hours per week: ${volunteer.hoursPerWeek}`}
              </div>
            )}
            {volunteer.bulletPoints.length > 0 && (
              <ul style={{ 
                fontSize: `${data.bodyTextSize || 13}px`, 
                margin: '0', 
                paddingLeft: '20px',
                lineHeight: data.lineSpacing !== undefined ? `${data.lineSpacing / 10}` : '1.4',
                textAlign: data.alignTextLeftRight ? 'justify' : 'left'
              }}>
                {volunteer.bulletPoints.map((bullet, bulletIndex) => (
                  <li key={bulletIndex} style={{ 
                    marginBottom: '2px',
                    lineHeight: data.lineSpacing !== undefined ? `${data.lineSpacing / 10}` : '1.4'
                  }}>
                    {bullet.description}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderReferences = () => {
    if (!data.references || data.references.length === 0) return null;
    return (
      <div 
        ref={(el) => { if (el) sectionRefs.current.set('references', el); }}
        style={{ marginBottom: data.sectionSpacing !== undefined ? `${data.sectionSpacing}px` : '20px' }}
      >
        <h2 style={{ 
          fontSize: `${data.sectionHeadersSize || 18}px`, 
          fontWeight: 'bold', 
          margin: '0 0 12px 0',
          textTransform: 'uppercase',
          borderBottom: '1px solid #000',
          paddingBottom: '4px'
        }}>
          References
        </h2>
        {data.references.map((ref, index) => (
          <div key={index} style={{ marginBottom: data.entrySpacing !== undefined ? `${data.entrySpacing}px` : '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <h3 style={{ 
                fontSize: `${data.subHeadersSize || 16}px`, 
                fontWeight: 'bold', 
                margin: '0',
                lineHeight: data.lineSpacing !== undefined ? `${data.lineSpacing / 10}` : '1.4',
                textTransform: 'uppercase'
              }}>
                {ref.name}
              </h3>
              <span style={{ fontSize: '14px', color: '#000', fontWeight: 'bold' }}>
                {ref.title}
              </span>
            </div>
            <div style={{ 
              fontSize: `${data.subHeadersSize || 14}px`, 
              fontWeight: 'bold', 
              color: '#333',
              marginBottom: '3px',
              lineHeight: data.lineSpacing !== undefined ? `${data.lineSpacing / 10}` : '1.4',
              fontStyle: 'italic'
            }}>
              {ref.company}
            </div>
            {(ref.email || ref.phone) && (
              <div style={{ fontSize: '12px', color: '#666' }}>
                {ref.email && `Email: ${ref.email}`}
                {ref.email && ref.phone && `, `}
                {ref.phone && `Phone: ${ref.phone}`}
              </div>
            )}
            {ref.relationship && (
              <div style={{ fontSize: '12px', color: '#666' }}>
                Relationship: {ref.relationship}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render a single page
  const renderPage = (pageInfo: PageInfo, pageIndex: number) => {
    const isFirstPage = pageIndex === 0;
    const bottomMargin = data.topBottomMargin || 40;
    
    return (
      <div
        key={pageIndex}
        style={{ 
          fontFamily: data.fontFamily || 'Times New Roman, serif', 
          background: '#fff', 
          color: '#000', 
          padding: `${data.topBottomMargin !== undefined ? data.topBottomMargin : 40}px ${data.sideMargins !== undefined ? data.sideMargins : 40}px`,
          width: `${data.pageWidth || 850}px`,
          height: `${data.pageHeight || 1100}px`,
          margin: '0 auto',
          marginBottom: pageIndex < pages.length - 1 ? '20px' : '0',
          lineHeight: '1.2',
          position: 'relative',
          overflow: 'hidden',
          pageBreakAfter: pageIndex < pages.length - 1 ? 'always' : 'auto',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderRadius: '20px',
          border: '1px solid #e0e0e0'
        }}
      >
        <div style={{ 
          height: `calc(100% - ${bottomMargin * 2}px)`, // Ensure content area respects top and bottom margins
          overflow: 'hidden', // Prevent any content from overflowing
          position: 'relative'
        }}>
          {/* Header - only on first page */}
          {isFirstPage && renderHeader()}

          {/* Render sections for this page */}
          {pageInfo.sections.map((section) => {
            // Clone the section element and render it
            const sectionElement = section.element.cloneNode(true) as HTMLElement;
            return (
              <div key={section.id} dangerouslySetInnerHTML={{ __html: sectionElement.outerHTML }} />
            );
          })}
        </div>
      </div>
    );
  };

  // If still measuring, render a single page with all content for measurement
  if (isMeasuring) {
    const bottomMargin = data.topBottomMargin || 40;
    
    // Filter out deleted sections
    const deletedSections = data.deletedSections || [];
    const sectionOrder = data.sectionOrder || [
      'Professional Summary',
      'Technical Skills',
      'Work Experience',
      'Education',
      'Projects',
      'Courses',
      'Languages',
      'Publications',
      'Awards',
      'Volunteer Experience',
      'References',
      'Skills',
      'Interests'
    ];
    const activeSections = sectionOrder.filter(section => !deletedSections.includes(section));
    
    return (
      <div 
        ref={resumeRef}
        style={{ 
          fontFamily: data.fontFamily || 'Times New Roman, serif', 
          background: '#fff', 
          color: '#000', 
          padding: `${data.topBottomMargin !== undefined ? data.topBottomMargin : 40}px ${data.sideMargins !== undefined ? data.sideMargins : 40}px`,
          width: `${data.pageWidth || 850}px`,
          margin: '0 auto',
          lineHeight: '1.2',
          position: 'relative',
          overflow: 'visible', // Allow overflow for measurement
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderRadius: '20px',
          border: '1px solid #e0e0e0'
        }}
      >
        <div style={{ 
          height: `calc(100% - ${bottomMargin * 2}px)`, // Use same logic as paginated version
          position: 'relative'
        }}>
          {/* Render all sections for measurement */}
          {renderHeader()}
          {activeSections.includes('Professional Summary') && renderProfessionalSummary()}
          {activeSections.includes('Technical Skills') && renderTechnicalSkills()}
          {activeSections.includes('Work Experience') && renderWorkExperience()}
          {activeSections.includes('Education') && renderEducation()}
          {activeSections.includes('Projects') && renderProjects()}
          {activeSections.includes('Courses') && renderCourses()}
          {activeSections.includes('Languages') && renderLanguages()}
          {activeSections.includes('Skills') && renderSkills()}
          {activeSections.includes('Interests') && renderInterests()}
          {activeSections.includes('Publications') && renderPublications()}
          {activeSections.includes('Awards') && renderAwards()}
          {activeSections.includes('Volunteer Experience') && renderVolunteerExperience()}
          {activeSections.includes('References') && renderReferences()}
        </div>
      </div>
    );
  }

  // Render paginated content
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'flex-start',
      width: '100%',
    }}>
      {pages.map((pageInfo, pageIndex) => (
        <React.Fragment key={`page-${pageIndex}`}>
          {renderPage(pageInfo, pageIndex)}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ClassicResumeTemplate; 