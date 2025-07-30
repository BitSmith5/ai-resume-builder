import React, { useRef } from 'react';

interface ResumeData {
  title: string;
  jobTitle?: string;
  profilePicture?: string;
  fontFamily?: string;
  nameSize?: number;
  sectionHeadersSize?: number;
  subHeadersSize?: number;
  bodyTextSize?: number;
  sectionSpacing?: number;
  entrySpacing?: number;
  lineSpacing?: number;
  topBottomMargin?: number;
  sideMargins?: number;
  alignTextLeftRight?: boolean;
  sectionOrder?: string[];
  pageWidth?: number;
  pageHeight?: number;
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
  deletedSections?: string[];
}

interface ClassicResumeTemplateProps {
  data: ResumeData;
}

const ClassicResumeTemplate: React.FC<ClassicResumeTemplateProps> = ({ data }) => {
  const resumeRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  const { personalInfo } = data.content;

  // Format date helper
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
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

  // Format URL helper
  const formatUrl = (url: string): string => {
    if (!url) return '';
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '');
  };

  // Phone number formatting function
  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digit characters
    const phoneNumber = value.replace(/\D/g, "");

    // Limit to 10 digits
    const trimmed = phoneNumber.slice(0, 10);

    // Format as (XXX) XXX-XXXX
    if (trimmed.length === 0) return "";
    if (trimmed.length <= 3) return `(${trimmed}`;
    if (trimmed.length <= 6)
      return `(${trimmed.slice(0, 3)}) ${trimmed.slice(3)}`;
    return `(${trimmed.slice(0, 3)}) ${trimmed.slice(3, 6)}-${trimmed.slice(6)}`;
  };

  // Render functions for each section
  const renderHeader = () => (
    <div style={{ textAlign: 'center', marginBottom: `${data.sectionSpacing || 0}px` }}>
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
          formatPhoneNumber(personalInfo.phone),
          personalInfo.email,
          personalInfo.linkedin && (
            <a 
              key="linkedin"
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
              key="github"
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
              key="website"
              href={personalInfo.website.startsWith('http') ? personalInfo.website : `https://${personalInfo.website}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: '#333', 
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              {formatUrl(personalInfo.website)}
            </a>
          )
        ].filter(Boolean).map((item, index, array) => (
          <span key={index}>
            {item}
            {index < array.length - 1 && ' • '}
          </span>
        ))}
      </div>
    </div>
  );

  const renderProfessionalSummary = () => (
    <div style={{ marginBottom: `${data.sectionSpacing || 20}px` }}>
        <h2 style={{ 
          fontSize: `${data.sectionHeadersSize || 18}px`, 
          fontWeight: 'bold', 
          margin: '0 0 0px 0',
          fontFamily: data.fontFamily || 'Times New Roman, serif',
          borderBottom: '1px solid #000',
          paddingBottom: '1px'
        }}>
          Professional Summary
        </h2>
        <p style={{ 
          fontSize: `${data.bodyTextSize || 14}px`, 
          margin: '0', 
        fontFamily: data.fontFamily || 'Times New Roman, serif',
        lineHeight: `${data.lineSpacing || 14}px`,
          textAlign: data.alignTextLeftRight ? 'justify' : 'left'
        }}>
          {personalInfo.summary}
        </p>
      </div>
    );

  const renderTechnicalSkills = () => (
    <div style={{ marginBottom: `${data.sectionSpacing || 20}px` }}>
        <h2 style={{ 
          fontSize: `${data.sectionHeadersSize || 18}px`, 
          fontWeight: 'bold', 
          margin: '0 0 0px 0',
          fontFamily: data.fontFamily || 'Times New Roman, serif',
          borderBottom: '1px solid #000',
          paddingBottom: '1px'
        }}>
          Technical Skills
        </h2>
      
      {/* Render strengths if they exist */}
      {data.strengths && data.strengths.length > 0 && (
        <div style={{ 
          fontSize: `${data.bodyTextSize || 14}px`, 
          fontFamily: data.fontFamily || 'Times New Roman, serif',
          lineHeight: `${data.lineSpacing || 14}px`,
          marginBottom: '0px',
          textAlign: data.alignTextLeftRight ? 'justify' : 'left'
        }}>
          {data.strengths.map((skill, index) => (
            <span key={index}>
              {skill.skillName}
              {index < data.strengths.length - 1 && ' • '}
            </span>
          ))}
        </div>
      )}
      
      {/* Render skill categories if they exist */}
      {data.skillCategories && data.skillCategories.length > 0 && (
        <div>
          {data.skillCategories.map((category, index) => (
            <div key={index} style={{ marginBottom: '8px' }}>
              <div style={{ 
                fontSize: `${data.subHeadersSize || 16}px`, 
              fontWeight: 'bold',
                fontFamily: data.fontFamily || 'Times New Roman, serif',
                marginBottom: '4px'
              }}>
                {category.title}
              </div>
              <div style={{ 
                fontSize: `${data.bodyTextSize || 14}px`,
                fontFamily: data.fontFamily || 'Times New Roman, serif',
                lineHeight: `${data.lineSpacing || 14}px`,
                textAlign: data.alignTextLeftRight ? 'justify' : 'left'
              }}>
                {category.skills.map((skill, skillIndex) => (
                  <span key={skillIndex}>
                    {skill.name}
                    {skillIndex < category.skills.length - 1 && ' • '}
                </span>
              ))}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    );

  const renderWorkExperience = () => (
    <div style={{ marginBottom: `${data.sectionSpacing || 20}px` }}>
        <h2 style={{ 
          fontSize: `${data.sectionHeadersSize || 18}px`, 
          fontWeight: 'bold', 
          margin: '0 0 0px 0',
          fontFamily: data.fontFamily || 'Times New Roman, serif',
          borderBottom: '1px solid #000',
          paddingBottom: '1px'
        }}>
          Work Experience
        </h2>
      {data.workExperience.map((work, index) => (
        <div 
          key={index} 
          data-subsection={`work-${index}`}
          style={{ paddingBottom: `${data.entrySpacing || 12}px` }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '2px'
          }}>
            <div style={{ 
                fontSize: `${data.subHeadersSize || 16}px`, 
                fontWeight: 'bold', 
              fontFamily: data.fontFamily || 'Times New Roman, serif'
            }}>
              {work.company}
              {work.city && work.state && `, ${work.city}, ${work.state}`}
            </div>
            <div style={{ 
              fontSize: `${data.bodyTextSize || 14}px`,
              fontFamily: data.fontFamily || 'Times New Roman, serif',
              fontWeight: 'bold'
            }}>
              {formatDate(work.startDate)} - {work.current ? 'Present' : formatDate(work.endDate)}
            </div>
          </div>
          <div style={{ 
            fontSize: `${data.bodyTextSize || 14}px`, 
            fontStyle: 'italic',
            fontFamily: data.fontFamily || 'Times New Roman, serif',
            marginBottom: '2px'
          }}>
            {work.position}
          </div>
              <ul style={{ 
                margin: '0', 
                paddingLeft: '20px',
            fontSize: `${data.bodyTextSize || 14}px`,
            fontFamily: data.fontFamily || 'Times New Roman, serif',
            lineHeight: `${data.lineSpacing || 14}px`
          }}>
            {work.bulletPoints.map((point, pointIndex) => (
              <li key={pointIndex} style={{ 
                marginBottom: '2px',
                textAlign: data.alignTextLeftRight ? 'justify' : 'left'
              }}>
                {point.description}
                  </li>
                ))}
              </ul>
          </div>
        ))}
      </div>
    );

  const renderEducation = () => (
    <div style={{ marginBottom: `${data.sectionSpacing || 20}px` }}>
        <h2 style={{ 
          fontSize: `${data.sectionHeadersSize || 18}px`, 
          fontWeight: 'bold', 
          margin: '0 0 0px 0',
          fontFamily: data.fontFamily || 'Times New Roman, serif',
          borderBottom: '1px solid #000',
          paddingBottom: '1px'
        }}>
          Education
        </h2>
        {data.education.map((edu, index) => (
        <div 
          key={index} 
          data-subsection={`education-${index}`}
          style={{ paddingBottom: `${data.entrySpacing || 12}px` }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '4px'
          }}>
            <div style={{ 
                fontSize: `${data.subHeadersSize || 16}px`, 
                fontWeight: 'bold', 
              fontFamily: data.fontFamily || 'Times New Roman, serif'
              }}>
                {edu.degree} in {edu.field}
            </div>
            <div style={{ 
              fontSize: `${data.bodyTextSize || 14}px`,
              fontFamily: data.fontFamily || 'Times New Roman, serif',
              fontWeight: 'bold'
            }}>
                {formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate)}
            </div>
            </div>
            <div style={{ 
            fontSize: `${data.bodyTextSize || 14}px`,
            fontFamily: data.fontFamily || 'Times New Roman, serif',
            textAlign: data.alignTextLeftRight ? 'justify' : 'left'
            }}>
              {edu.institution}
            {edu.gpa && ` • GPA: ${edu.gpa}`}
            </div>
          </div>
        ))}
      </div>
    );

  const renderProjects = () => {
    if (!data.projects || data.projects.length === 0) return null;
    
    return (
      <div style={{ marginBottom: `${data.sectionSpacing || 20}px` }}>
        <h2 style={{ 
          fontSize: `${data.sectionHeadersSize || 18}px`, 
          fontWeight: 'bold', 
          margin: '0 0 0px 0',
          fontFamily: data.fontFamily || 'Times New Roman, serif',
          borderBottom: '1px solid #000',
          paddingBottom: '1px'
        }}>
          Projects
        </h2>
        {data.projects.map((project, index) => (
          <div key={index} style={{ paddingBottom: `${data.entrySpacing || 12}px` }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: '2px'
            }}>
              <div style={{ 
                fontSize: `${data.subHeadersSize || 16}px`, 
                fontWeight: 'bold', 
                fontFamily: data.fontFamily || 'Times New Roman, serif'
              }}>
                {project.title}
              </div>
              <div style={{ 
                fontSize: `${data.bodyTextSize || 14}px`,
                fontFamily: data.fontFamily || 'Times New Roman, serif',
                fontWeight: 'bold'
              }}>
                {formatDate(project.startDate)} - {project.current ? 'Present' : formatDate(project.endDate)}
              </div>
            </div>
            <div style={{ 
              fontSize: `${data.bodyTextSize || 14}px`,
              fontFamily: data.fontFamily || 'Times New Roman, serif',
              marginBottom: '2px',
              textAlign: data.alignTextLeftRight ? 'justify' : 'left'
            }}>
              {project.technologies.join(', ')}
            </div>
              <ul style={{ 
                margin: '0', 
                paddingLeft: '20px',
              fontSize: `${data.bodyTextSize || 14}px`,
              fontFamily: data.fontFamily || 'Times New Roman, serif',
              lineHeight: `${data.lineSpacing || 14}px`
            }}>
              {project.bulletPoints.map((point, pointIndex) => (
                <li key={pointIndex} style={{ 
                  marginBottom: '2px',
                  textAlign: data.alignTextLeftRight ? 'justify' : 'left'
                }}>
                  {point.description}
                  </li>
                ))}
              </ul>
          </div>
        ))}
      </div>
    );
  };

  const renderCourses = () => {
    if (!data.courses || data.courses.length === 0) return null;
    
    return (
      <div style={{ marginBottom: `${data.sectionSpacing || 20}px` }}>
        <h2 style={{ 
          fontSize: `${data.sectionHeadersSize || 18}px`, 
          fontWeight: 'bold', 
          margin: '0 0 0px 0',
          fontFamily: data.fontFamily || 'Times New Roman, serif',
          borderBottom: '1px solid #000',
          paddingBottom: '1px'
        }}>
          Courses
        </h2>
            <div style={{ 
          fontSize: `${data.bodyTextSize || 14}px`,
          fontFamily: data.fontFamily || 'Times New Roman, serif',
          lineHeight: `${data.lineSpacing || 14}px`,
          marginTop: '4px',
          textAlign: data.alignTextLeftRight ? 'justify' : 'left'
        }}>
          {data.courses.map((course, index) => (
            <div key={index} style={{ paddingBottom: `${data.entrySpacing || 12}px` }}>
              <div style={{ 
              marginBottom: '2px',
              textAlign: data.alignTextLeftRight ? 'justify' : 'left'
            }}>
                <strong>{course.title}</strong> - {course.provider}
            </div>
            {course.link && (
                <div>
                  <a 
                    href={course.link.startsWith('http') ? course.link : `https://${course.link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ 
                      color: '#0066cc', 
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontSize: `${data.bodyTextSize || 14}px`,
                      fontFamily: data.fontFamily || 'Times New Roman, serif',
                      textAlign: data.alignTextLeftRight ? 'justify' : 'left'
                    }}
                  >
                  {formatUrl(course.link)}
                </a>
              </div>
            )}
          </div>
        ))}
        </div>
      </div>
    );
  };

  const renderLanguages = () => {
    if (!data.languages || data.languages.length === 0) return null;
    
    return (
      <div style={{ marginBottom: `${data.sectionSpacing || 20}px` }}>
        <h2 style={{ 
          fontSize: `${data.sectionHeadersSize || 18}px`, 
          fontWeight: 'bold', 
          margin: '0 0 0px 0',
          fontFamily: data.fontFamily || 'Times New Roman, serif',
          borderBottom: '1px solid #000',
          paddingBottom: '1px'
        }}>
          Languages
        </h2>
        <div style={{ 
          fontSize: `${data.bodyTextSize || 14}px`, 
          fontFamily: data.fontFamily || 'Times New Roman, serif',
          lineHeight: `${data.lineSpacing || 14}px`,
          marginTop: '4px',
          textAlign: data.alignTextLeftRight ? 'justify' : 'left'
        }}>
          {data.languages.map((lang, index) => (
            <span key={index}>
              {lang.name} ({lang.proficiency})
              {index < data.languages!.length - 1 && ' • '}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderSkills = () => {
    if (!data.skillCategories || data.skillCategories.length === 0) return null;
    
    return (
      <div style={{ marginBottom: `${data.sectionSpacing || 20}px` }}>
        <h2 style={{ 
          fontSize: `${data.sectionHeadersSize || 18}px`, 
          fontWeight: 'bold', 
          margin: '0 0 0px 0',
          fontFamily: data.fontFamily || 'Times New Roman, serif',
          borderBottom: '1px solid #000',
          paddingBottom: '1px'
        }}>
          Skills
        </h2>
        {data.skillCategories.map((category, index) => (
          <div key={index} style={{ marginBottom: '8px', marginTop: index === 0 ? '4px' : '0px' }}>
            <div style={{ 
              fontSize: `${data.subHeadersSize || 16}px`, 
              fontWeight: 'bold',
              fontFamily: data.fontFamily || 'Times New Roman, serif',
              marginBottom: '4px'
            }}>
              {category.title}
            </div>
        <div style={{ 
          fontSize: `${data.bodyTextSize || 14}px`,
              fontFamily: data.fontFamily || 'Times New Roman, serif',
              lineHeight: `${data.lineSpacing || 14}px`,
              textAlign: data.alignTextLeftRight ? 'justify' : 'left'
            }}>
                              {category.skills.map((skill, skillIndex) => (
                  <span key={skillIndex}>
                    {skill.name}
                    {skillIndex < category.skills.length - 1 && ' • '}
                  </span>
                ))}
        </div>
          </div>
        ))}
      </div>
    );
  };

  const renderInterests = () => {
    if (!data.interests || data.interests.length === 0) return null;
    
    return (
      <div style={{ marginBottom: `${data.sectionSpacing || 20}px` }}>
        <h2 style={{ 
          fontSize: `${data.sectionHeadersSize || 18}px`, 
          fontWeight: 'bold', 
          margin: '0 0 0px 0',
          fontFamily: data.fontFamily || 'Times New Roman, serif',
          borderBottom: '1px solid #000',
          paddingBottom: '1px'
        }}>
          Interests
        </h2>
        <div style={{ 
          fontSize: `${data.bodyTextSize || 14}px`,
          fontFamily: data.fontFamily || 'Times New Roman, serif',
          lineHeight: `${data.lineSpacing || 14}px`,
          marginTop: '4px',
          textAlign: data.alignTextLeftRight ? 'justify' : 'left'
        }}>
          {data.interests.map((interest, index) => (
            <span key={index}>
              <span style={{ marginRight: '4px' }}>{interest.icon}</span>
              {interest.name}
              {index < data.interests!.length - 1 && ' • '}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderPublications = () => {
    if (!data.publications || data.publications.length === 0) return null;
    
    return (
      <div style={{ marginBottom: `${data.sectionSpacing || 20}px` }}>
        <h2 style={{ 
          fontSize: `${data.sectionHeadersSize || 18}px`, 
          fontWeight: 'bold', 
          margin: '0 0 0px 0',
          fontFamily: data.fontFamily || 'Times New Roman, serif',
          borderBottom: '1px solid #000',
          paddingBottom: '1px'
        }}>
          Publications
        </h2>
        {data.publications.map((pub, index) => (
          <div key={index} style={{ marginBottom: `${data.entrySpacing || 12}px`, marginTop: index === 0 ? '4px' : '0px' }}>
            <div style={{ 
                fontSize: `${data.subHeadersSize || 16}px`, 
                fontWeight: 'bold', 
              fontFamily: data.fontFamily || 'Times New Roman, serif',
              marginBottom: '4px'
              }}>
                {pub.title}
            </div>
            <div style={{ 
              fontSize: `${data.bodyTextSize || 14}px`,
              fontFamily: data.fontFamily || 'Times New Roman, serif',
              marginBottom: '2px',
              textAlign: data.alignTextLeftRight ? 'justify' : 'left'
            }}>
              {pub.authors} • {pub.journal} • {pub.year}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAwards = () => {
    if (!data.awards || data.awards.length === 0) return null;
    
    return (
      <div style={{ marginBottom: `${data.sectionSpacing || 20}px` }}>
        <h2 style={{ 
          fontSize: `${data.sectionHeadersSize || 18}px`, 
          fontWeight: 'bold', 
          margin: '0 0 0px 0',
          fontFamily: data.fontFamily || 'Times New Roman, serif',
          borderBottom: '1px solid #000',
          paddingBottom: '1px'
        }}>
          Awards
        </h2>
        {data.awards.map((award, index) => (
          <div key={index} style={{ marginBottom: `${data.entrySpacing || 12}px`, marginTop: index === 0 ? '4px' : '0px' }}>
            <div style={{ 
                fontSize: `${data.subHeadersSize || 16}px`, 
                fontWeight: 'bold', 
              fontFamily: data.fontFamily || 'Times New Roman, serif',
              marginBottom: '4px'
              }}>
                {award.title}
            </div>
            <div style={{ 
              fontSize: `${data.bodyTextSize || 14}px`,
              fontFamily: data.fontFamily || 'Times New Roman, serif',
              marginBottom: '4px',
              textAlign: data.alignTextLeftRight ? 'justify' : 'left'
            }}>
              {award.organization} • {award.year}
            </div>
              <ul style={{ 
                margin: '0', 
                paddingLeft: '20px',
              fontSize: `${data.bodyTextSize || 14}px`,
              fontFamily: data.fontFamily || 'Times New Roman, serif',
              lineHeight: `${data.lineSpacing || 14}px`
            }}>
              {award.bulletPoints.map((point, pointIndex) => (
                <li key={pointIndex} style={{ 
                  marginBottom: '2px',
                  textAlign: data.alignTextLeftRight ? 'justify' : 'left'
                }}>
                  {point.description}
                  </li>
                ))}
              </ul>
          </div>
        ))}
      </div>
    );
  };

  const renderVolunteerExperience = () => {
    if (!data.volunteerExperience || data.volunteerExperience.length === 0) return null;
    
    return (
      <div style={{ marginBottom: `${data.sectionSpacing || 20}px` }}>
        <h2 style={{ 
          fontSize: `${data.sectionHeadersSize || 18}px`, 
          fontWeight: 'bold', 
          margin: '0 0 0px 0',
          fontFamily: data.fontFamily || 'Times New Roman, serif',
          borderBottom: '1px solid #000',
          paddingBottom: '1px'
        }}>
          Volunteer Experience
        </h2>
        {data.volunteerExperience.map((volunteer, index) => (
          <div key={index} style={{ marginBottom: `${data.entrySpacing || 12}px`, marginTop: index === 0 ? '4px' : '0px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: '4px'
            }}>
              <div style={{ 
                fontSize: `${data.subHeadersSize || 16}px`, 
                fontWeight: 'bold', 
                fontFamily: data.fontFamily || 'Times New Roman, serif'
              }}>
                {volunteer.position}
              </div>
              <div style={{ 
                fontSize: `${data.bodyTextSize || 14}px`,
                fontFamily: data.fontFamily || 'Times New Roman, serif',
                fontWeight: 'bold'
              }}>
                {formatDate(volunteer.startDate)} - {volunteer.current ? 'Present' : formatDate(volunteer.endDate)}
              </div>
            </div>
            <div style={{ 
              fontSize: `${data.bodyTextSize || 14}px`, 
              fontWeight: 'bold', 
              fontFamily: data.fontFamily || 'Times New Roman, serif',
              marginBottom: '4px',
              textAlign: data.alignTextLeftRight ? 'justify' : 'left'
            }}>
              {volunteer.organization}, {volunteer.location}
            </div>
            <div style={{ 
              fontSize: `${data.bodyTextSize || 14}px`,
              fontFamily: data.fontFamily || 'Times New Roman, serif',
              marginBottom: '4px',
              textAlign: data.alignTextLeftRight ? 'justify' : 'left'
            }}>
              {volunteer.hoursPerWeek} hours per week
              </div>
              <ul style={{ 
                margin: '0', 
                paddingLeft: '20px',
              fontSize: `${data.bodyTextSize || 14}px`,
              fontFamily: data.fontFamily || 'Times New Roman, serif',
              lineHeight: `${data.lineSpacing || 14}px`
            }}>
              {volunteer.bulletPoints.map((point, pointIndex) => (
                <li key={pointIndex} style={{ 
                  marginBottom: '2px',
                  textAlign: data.alignTextLeftRight ? 'justify' : 'left'
                }}>
                  {point.description}
                  </li>
                ))}
              </ul>
          </div>
        ))}
      </div>
    );
  };

  const renderReferences = () => {
    if (!data.references || data.references.length === 0) return null;
    
    return (
      <div style={{ marginBottom: `${data.sectionSpacing || 20}px` }}>
        <h2 style={{ 
          fontSize: `${data.sectionHeadersSize || 18}px`, 
          fontWeight: 'bold', 
          margin: '0 0 0px 0',
          fontFamily: data.fontFamily || 'Times New Roman, serif',
          borderBottom: '1px solid #000',
          paddingBottom: '1px'
        }}>
          References
        </h2>
        {data.references.map((ref, index) => (
          <div key={index} style={{ marginTop: index === 0 ? '4px' : '0px', marginBottom: `${data.entrySpacing || 12}px` }}>
            <div style={{ 
                fontSize: `${data.subHeadersSize || 16}px`, 
                fontWeight: 'bold', 
              fontFamily: data.fontFamily || 'Times New Roman, serif',
              marginBottom: '4px'
              }}>
                {ref.name}
            </div>
            <div style={{ 
              fontSize: `${data.bodyTextSize || 14}px`,
              fontFamily: data.fontFamily || 'Times New Roman, serif',
              marginBottom: '2px',
              textAlign: data.alignTextLeftRight ? 'justify' : 'left'
            }}>
              {ref.title} at {ref.company}
            </div>
            <div style={{ 
              fontSize: `${data.bodyTextSize || 14}px`,
              fontFamily: data.fontFamily || 'Times New Roman, serif',
              marginBottom: '2px',
              textAlign: data.alignTextLeftRight ? 'justify' : 'left'
            }}>
              {ref.email} • {formatPhoneNumber(ref.phone)}
              </div>
            <div style={{ 
              fontSize: `${data.bodyTextSize || 14}px`,
              fontFamily: data.fontFamily || 'Times New Roman, serif',
              textAlign: data.alignTextLeftRight ? 'justify' : 'left'
            }}>
              {ref.relationship}
              </div>
          </div>
        ))}
      </div>
    );
  };

  // Render resume with Intersection Observer collision detection
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
    
  // Filter out sections that shouldn't be in page calculations (like Personal Info)
  const validSections = activeSections.filter(section => 
    section !== 'Personal Info' && 
    section !== 'personalInfo' && 
    section !== 'Personal Information'
  );

  // Helper function to get subsections for each section
  const getSubsections = (sectionName: string) => {
    switch (sectionName) {
      case 'Professional Summary':
        return [{ id: 'professional-summary', name: 'Professional Summary', isFirst: true }];
      case 'Technical Skills':
        const subsections = [];
        
        // Add strengths as first subsection
        if (data.strengths && data.strengths.length > 0) {
          subsections.push({ 
            id: 'technical-skills-strengths', 
            name: 'Strengths', 
            isFirst: true 
          });
        }
        
        // Add skill categories as separate subsections
        if (data.skillCategories && data.skillCategories.length > 0) {
          data.skillCategories.forEach((category, index) => {
            subsections.push({ 
              id: `technical-skills-category-${index}`, 
              name: category.title, 
              isFirst: index === 0 && subsections.length === 0 // First category is first if no strengths
            });
          });
        }
        
        // If no strengths or categories, return a default subsection
        if (subsections.length === 0) {
          subsections.push({ 
            id: 'technical-skills', 
            name: 'Technical Skills', 
            isFirst: true 
          });
        }
        
        return subsections;
      case 'Work Experience':
        return (data.workExperience || []).map((work, index) => ({
          id: `work-${index}`,
          name: `${work.position} at ${work.company}`,
          isFirst: index === 0
        }));
      case 'Education':
        return (data.education || []).map((edu, index) => ({
          id: `education-${index}`,
          name: `${edu.degree} at ${edu.institution}`,
          isFirst: index === 0
        }));
      case 'Projects':
        return (data.projects || []).map((project, index) => ({
          id: `project-${index}`,
          name: project.title,
          isFirst: index === 0
        }));
      case 'Courses':
        return (data.courses || []).map((course, index) => ({
          id: `course-${index}`,
          name: `${course.title} - ${course.provider}`,
          isFirst: index === 0
        }));
      case 'Languages':
        return (data.languages || []).map((lang, index) => ({
          id: `language-${index}`,
          name: `${lang.name} (${lang.proficiency})`,
          isFirst: index === 0
        }));
      case 'Skills':
        return (data.skillCategories || []).map((category, index) => ({
          id: `skill-category-${index}`,
          name: category.title,
          isFirst: index === 0
        }));
      case 'Interests':
        return [{ id: 'interests', name: 'Interests', isFirst: true }];
      case 'Publications':
        return (data.publications || []).map((pub, index) => ({
          id: `publication-${index}`,
          name: pub.title,
          isFirst: index === 0
        }));
      case 'Awards':
        return (data.awards || []).map((award, index) => ({
          id: `award-${index}`,
          name: award.title,
          isFirst: index === 0
        }));
      case 'Volunteer Experience':
        return (data.volunteerExperience || []).map((volunteer, index) => ({
          id: `volunteer-${index}`,
          name: `${volunteer.position} at ${volunteer.organization}`,
          isFirst: index === 0
        }));
      case 'References':
        return (data.references || []).map((ref, index) => ({
          id: `reference-${index}`,
          name: ref.name,
          isFirst: index === 0
        }));
      default:
        return [{ id: sectionName.toLowerCase().replace(/\s+/g, '-'), name: sectionName, isFirst: true }];
    }
  };
  
  // Filter out sections that have no data
  const sectionsWithData = validSections.filter(section => {
    const subsections = getSubsections(section);
    return subsections.length > 0;
  });

  // Helper function to estimate subsection heights (responsive to export settings)
    const getEstimatedSubsectionHeight = (sectionName: string, subsection: { id: string; name: string; isFirst: boolean }): number => {
    const sectionHeadersSize = data.sectionHeadersSize || 18;
    const subHeadersSize = data.subHeadersSize || 16;
    const bodyTextSize = data.bodyTextSize || 14;
    const lineSpacing = data.lineSpacing || 14;
    const entrySpacing = data.entrySpacing || 12;
    

    
    // Calculate dynamic heights based on font sizes and line spacing
    // More aggressive approach - further reduced from conservative estimates
    const sectionHeaderHeight = sectionHeadersSize + 6; // Header + padding + margin (reduced from 8)
    const subHeaderHeight = subHeadersSize + 2; // Sub header + padding + margin (reduced from 4)
    const bodyLineHeight = Math.max(bodyTextSize + 1, lineSpacing - 1); // Use larger of font size + padding or line spacing (further reduced padding)
    
    if (subsection.isFirst) {
      // First subsection includes section header + 1px marginTop
      const firstSubsectionMargin = 1; // 1px marginTop added to all first subsections (reduced from 2)
      switch (sectionName) {
        case 'Professional Summary':
          return sectionHeaderHeight + (bodyLineHeight * 2) + firstSubsectionMargin; // Header + ~2 lines of text + margin
        case 'Technical Skills':
          // Handle individual technical skills subsections
          if (subsection.id === 'technical-skills-strengths') {
            const strengthsCount = data.strengths?.length || 0;
            const strengthsHeight = strengthsCount * bodyLineHeight * 0.8; // Reduced multiplier for more compact rendering
            return subsection.isFirst ? sectionHeaderHeight + strengthsHeight + firstSubsectionMargin : strengthsHeight;
          } else if (subsection.id.startsWith('technical-skills-category-')) {
            const categoryIndex = parseInt(subsection.id.split('-')[3]) || 0;
            const category = data.skillCategories?.[categoryIndex];
            if (category) {
              // Skills are rendered inline with commas, estimate based on how many lines needed
              const skillsPerLine = 8; // Even more skills per line (increased from 6)
              const linesNeeded = Math.ceil(category.skills.length / skillsPerLine);
              const categoryHeight = subHeaderHeight + (linesNeeded * bodyLineHeight) + 2; // Further reduced padding from 4 to 2
              // Add section header height if this is the first subsection
              return subsection.isFirst ? sectionHeaderHeight + categoryHeight + firstSubsectionMargin : categoryHeight;
            }
          }
          // Fallback for default technical skills subsection
          return sectionHeaderHeight + firstSubsectionMargin;
        case 'Work Experience':
          const workExp = data.workExperience || [];
          if (workExp.length > 0) {
            // Calculate height based on the first work experience entry (most representative)
            const firstWork = workExp[0];
            const bulletPointsCount = firstWork.bulletPoints?.length || 0;
            // Add entry spacing for each work experience entry (except the last one)
            const entrySpacingTotal = (workExp.length - 1) * entrySpacing;
            const calculatedHeight = sectionHeaderHeight + subHeaderHeight + bodyLineHeight + (bulletPointsCount * bodyLineHeight) + entrySpacingTotal + firstSubsectionMargin;
            return calculatedHeight;
          }
          return sectionHeaderHeight + firstSubsectionMargin;
        case 'Education':
          const education = data.education || [];
          if (education.length > 0) {
            // Add entry spacing for each education entry (except the last one)
            const entrySpacingTotal = (education.length - 1) * entrySpacing;
            return sectionHeaderHeight + subHeaderHeight + (bodyLineHeight * 2) + entrySpacingTotal + firstSubsectionMargin; // Header + degree/institution + dates + margin
          }
          return sectionHeaderHeight + firstSubsectionMargin;
        case 'Projects':
          const projects = data.projects || [];
          if (projects.length > 0) {
            const firstProject = projects[0];
            const bulletPointsCount = firstProject.bulletPoints?.length || 0;
            // Add entry spacing for each project entry (except the last one)
            const entrySpacingTotal = (projects.length - 1) * entrySpacing;
            return sectionHeaderHeight + subHeaderHeight + bodyLineHeight + (bulletPointsCount * bodyLineHeight * 0.9) + entrySpacingTotal + firstSubsectionMargin; // Reduced bullet points multiplier
          }
          return sectionHeaderHeight + firstSubsectionMargin;
        case 'Courses':
          const courses = data.courses || [];
          if (courses.length > 0) {
            // Each course has: title+provider line + optional link line + margin
            const courseHeight = courses.length * (bodyLineHeight * 2.5) + (courses.length * 4); // Reduced from 3 lines to 2.5 lines per course + 4px margin each
            // Add entry spacing for each course entry (except the last one)
            const entrySpacingTotal = (courses.length - 1) * entrySpacing;
            return sectionHeaderHeight + courseHeight + entrySpacingTotal + firstSubsectionMargin; // Removed extra padding
          }
          return sectionHeaderHeight + firstSubsectionMargin;
        case 'Languages':
          const languages = data.languages || [];
          if (languages.length > 0) {
            return sectionHeaderHeight + (languages.length * bodyLineHeight) + firstSubsectionMargin;
          }
          return sectionHeaderHeight + firstSubsectionMargin;
        case 'Skills':
          const skillCategories = data.skillCategories || [];
          if (skillCategories.length > 0) {
            return sectionHeaderHeight + (skillCategories.length * (subHeaderHeight + bodyLineHeight * 0.8)) + firstSubsectionMargin; // Reduced body line height multiplier
          }
          return sectionHeaderHeight + firstSubsectionMargin;
        case 'Interests':
          const interests = data.interests || [];
          if (interests.length > 0) {
            return sectionHeaderHeight + bodyLineHeight + firstSubsectionMargin; // Single line of interests + margin
          }
          return sectionHeaderHeight + firstSubsectionMargin;
        case 'Publications':
          const publications = data.publications || [];
          if (publications.length > 0) {
            return sectionHeaderHeight + subHeaderHeight + (bodyLineHeight * 2) + firstSubsectionMargin;
          }
          return sectionHeaderHeight + firstSubsectionMargin;
        case 'Awards':
          const awards = data.awards || [];
          if (awards.length > 0) {
            const firstAward = awards[0];
            const bulletPointsCount = firstAward.bulletPoints?.length || 0;
            return sectionHeaderHeight + subHeaderHeight + (bulletPointsCount * bodyLineHeight) + firstSubsectionMargin;
          }
          return sectionHeaderHeight + firstSubsectionMargin;
        case 'Volunteer Experience':
          const volunteer = data.volunteerExperience || [];
          if (volunteer.length > 0) {
            const firstVolunteer = volunteer[0];
            const bulletPointsCount = firstVolunteer.bulletPoints?.length || 0;
            return sectionHeaderHeight + subHeaderHeight + (bodyLineHeight * 2) + (bulletPointsCount * bodyLineHeight) + firstSubsectionMargin;
          }
          return sectionHeaderHeight + firstSubsectionMargin;
        case 'References':
          const references = data.references || [];
          if (references.length > 0) {
            return sectionHeaderHeight + (references.length * (bodyLineHeight * 2)) + firstSubsectionMargin;
          }
          return sectionHeaderHeight + firstSubsectionMargin;
                  default:
            return sectionHeaderHeight + (bodyLineHeight * 2) + firstSubsectionMargin;
      }
    } else {
      // Regular subsection (no section header)
      switch (sectionName) {
        case 'Work Experience':
          const workExp = data.workExperience || [];
          const workIndex = parseInt(subsection.id.split('-')[1]) || 0;
          if (workExp[workIndex]) {
            const work = workExp[workIndex];
            const bulletPointsCount = work.bulletPoints?.length || 0;
            return subHeaderHeight + bodyLineHeight + (bulletPointsCount * bodyLineHeight) + entrySpacing;
          }
          return subHeaderHeight + entrySpacing;
        case 'Education':
          const education = data.education || [];
          const eduIndex = parseInt(subsection.id.split('-')[1]) || 0;
          if (education[eduIndex]) {
            return subHeaderHeight + (bodyLineHeight * 2) + entrySpacing;
          }
          return subHeaderHeight + entrySpacing;
        case 'Projects':
          const projects = data.projects || [];
          const projIndex = parseInt(subsection.id.split('-')[1]) || 0;
          if (projects[projIndex]) {
            const project = projects[projIndex];
            const bulletPointsCount = project.bulletPoints?.length || 0;
            return subHeaderHeight + bodyLineHeight + (bulletPointsCount * bodyLineHeight) + entrySpacing;
          }
          return subHeaderHeight + entrySpacing;
        case 'Courses':
          return bodyLineHeight * 3 + 8 + entrySpacing; // Each course ~3 lines + margin
        case 'Languages':
          return bodyLineHeight + entrySpacing;
        case 'Skills':
          return subHeaderHeight + bodyLineHeight + entrySpacing;
        case 'Interests':
          return bodyLineHeight + entrySpacing;
        case 'Publications':
          return subHeaderHeight + (bodyLineHeight * 2) + entrySpacing;
        case 'Awards':
          const awards = data.awards || [];
          const awardIndex = parseInt(subsection.id.split('-')[1]) || 0;
          if (awards[awardIndex]) {
            const award = awards[awardIndex];
            const bulletPointsCount = award.bulletPoints?.length || 0;
            return subHeaderHeight + (bulletPointsCount * bodyLineHeight) + entrySpacing;
          }
          return subHeaderHeight + entrySpacing;
        case 'Volunteer Experience':
          const volunteer = data.volunteerExperience || [];
          const volIndex = parseInt(subsection.id.split('-')[1]) || 0;
          if (volunteer[volIndex]) {
            const vol = volunteer[volIndex];
            const bulletPointsCount = vol.bulletPoints?.length || 0;
            return subHeaderHeight + (bodyLineHeight * 2) + (bulletPointsCount * bodyLineHeight) + entrySpacing;
          }
          return subHeaderHeight + entrySpacing;
        case 'References':
          return bodyLineHeight * 2 + entrySpacing;
        default:
          return subHeaderHeight + (bodyLineHeight * 2) + entrySpacing;
      }
    }
  };

  // Test version with improved pagination logic
  const calculatePagesTest = () => {
    const pageHeight = data.pageHeight || 1100;
    const topBottomMargin = data.topBottomMargin || 40;
    const contentHeight = pageHeight - (topBottomMargin * 2);
    const headerHeight = data.profilePicture ? 180 : 120;
    
    const pages: { sections: string[]; pageNumber: number; subsections: Array<{ sectionName: string; subsectionId: string }> }[] = [];
    let currentPage = { sections: [] as string[], pageNumber: 0, subsections: [] as Array<{ sectionName: string; subsectionId: string }> };
    let currentHeight = headerHeight; // Start with header height for first page
    
    // Add first page
    pages.push(currentPage);
    
    // Get all subsections from all sections
    const allSubsections: Array<{ sectionName: string; subsection: { id: string; name: string; isFirst: boolean } }> = [];
    
    for (const sectionName of sectionsWithData) {
      const subsections = getSubsections(sectionName);
      subsections.forEach(subsection => {
        allSubsections.push({ sectionName, subsection });
      });
    }
    
    // Process each subsection individually
    const processedSubsections = new Set<string>(); // Track processed subsections globally
    const sectionsStartedOnPages = new Map<string, number>(); // Track which page each section started on
    
    for (const { sectionName, subsection } of allSubsections) {
      // Skip if this subsection has already been processed
      const subsectionKey = `${sectionName}-${subsection.id}`;
      if (processedSubsections.has(subsectionKey)) {
        continue;
      }
      
      // Estimate subsection height
      const estimatedHeight = getEstimatedSubsectionHeight(sectionName, subsection);
      
      // Add section spacing for the last subsection of each section
      const subsections = getSubsections(sectionName);
      const currentIndex = subsections.findIndex(sub => sub.id === subsection.id);
      const sectionSpacing = currentIndex === subsections.length - 1 ? (data.sectionSpacing || 20) : 0;
      
      const totalHeight = estimatedHeight + sectionSpacing;
      
      // Check if adding this would exceed the content height with a very flexible buffer
      const safetyBuffer = 10; // Further reduced buffer to be very aggressive about fitting content
      const wouldExceedContent = (currentHeight + totalHeight) > (contentHeight - safetyBuffer);
      
      // Create new page if we would exceed content height
      if (wouldExceedContent && (currentPage.pageNumber > 0 || currentPage.subsections.length > 0)) {
        // Create new page
        currentPage = { sections: [] as string[], pageNumber: pages.length, subsections: [] as Array<{ sectionName: string; subsectionId: string }> };
        pages.push(currentPage);
        currentHeight = 0; // Reset height for new page
      }
      
      // Add section to current page if it hasn't been started on any page yet
      if (!sectionsStartedOnPages.has(sectionName)) {
        currentPage.sections.push(sectionName);
        sectionsStartedOnPages.set(sectionName, currentPage.pageNumber);
      }
      
      // Add this specific subsection to the current page
      currentPage.subsections.push({ sectionName, subsectionId: subsection.id });
      
      // Mark this subsection as processed
      processedSubsections.add(subsectionKey);
      currentHeight += totalHeight;
    }
    
    return pages;
  };

  // Use the test version instead of the original
  const pages = calculatePagesTest();





  // Helper function to get render function for a section
  const getRenderFunction = (sectionName: string) => {
    switch (sectionName) {
      case 'Professional Summary':
        return renderProfessionalSummary;
      case 'Technical Skills':
        return renderTechnicalSkills;
      case 'Work Experience':
        return renderWorkExperience;
      case 'Education':
        return renderEducation;
      case 'Projects':
        return renderProjects;
      case 'Courses':
        return renderCourses;
      case 'Languages':
        return renderLanguages;
      case 'Skills':
        return renderSkills;
      case 'Interests':
        return renderInterests;
      case 'Publications':
        return renderPublications;
      case 'Awards':
        return renderAwards;
      case 'Volunteer Experience':
        return renderVolunteerExperience;
      case 'References':
        return renderReferences;
      default:
        return () => null;
    }
  };

  // Helper function to render a specific subsection
  const renderSubsection = (sectionName: string, subsection: { id: string; name: string; isFirst: boolean }) => {
    const itemIndex = parseInt(subsection.id.split('-')[1]) || 0;
    

    
    if (subsection.isFirst) {
      // For first subsection, render section header + first item
      switch (sectionName) {
        case 'Professional Summary':
          return (
            <div>
                              <h2 style={{ 
                  fontSize: `${data.sectionHeadersSize || 18}px`, 
                  fontWeight: 'bold', 
                  marginBottom: '0px',
                  borderBottom: '1px solid #000',
                  paddingBottom: '1px'
                }}>
                  Professional Summary
                </h2>
              <p style={{ 
                fontSize: `${data.bodyTextSize || 14}px`, 
                lineHeight: `${data.lineSpacing || 14}px`, 
                marginTop: '4px',
                textAlign: data.alignTextLeftRight ? 'justify' : 'left'
              }}>
                {data.content.personalInfo.summary}
              </p>
            </div>
          );
        case 'Technical Skills':
          // Handle individual technical skills subsections
          if (subsection.id === 'technical-skills-strengths') {
            return (
              <div>
                {subsection.isFirst && (
                  <h2 style={{ 
                    fontSize: `${data.sectionHeadersSize || 18}px`, 
                    fontWeight: 'bold', 
                    marginBottom: '0px',
                    borderBottom: '1px solid #000',
                    paddingBottom: '0px'
                  }}>
                    Technical Skills
                  </h2>
                )}
                <div style={{ marginBottom: '10px', marginTop: '4px' }}>
                  <strong style={{ fontSize: `${data.subHeadersSize || 16}px` }}>Strengths:</strong>
                  <div style={{ fontSize: `${data.bodyTextSize || 14}px`, lineHeight: `${data.lineSpacing || 14}px` }}>
                    {data.strengths.map((strength, index) => (
                      <span key={index}>
                        {strength.skillName}{index < data.strengths.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          } else if (subsection.id.startsWith('technical-skills-category-')) {
            const categoryIndex = parseInt(subsection.id.split('-')[3]) || 0;
            const category = data.skillCategories?.[categoryIndex];
            
            if (category) {
              return (
                <div style={{ marginBottom: '10px' }}>
                  {subsection.isFirst && (
                    <h2 style={{ 
                      fontSize: `${data.sectionHeadersSize || 18}px`, 
                      fontWeight: 'bold', 
                      marginBottom: '0px',
                      borderBottom: '1px solid #000',
                      paddingBottom: '0px'
                    }}>
                      Technical Skills
                    </h2>
                  )}
                  <strong style={{ fontSize: `${data.subHeadersSize || 16}px` }}>{category.title}:</strong>
                  <div style={{ fontSize: `${data.bodyTextSize || 14}px`, lineHeight: `${data.lineSpacing || 14}px` }}>
                    {category.skills.map((skill, skillIndex) => (
                      <span key={skill.id}>
                        {skill.name}{skillIndex < category.skills.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              );
            }
          }
          
          // Fallback for default technical skills subsection
          return (
            <div>
              <h2 style={{ 
                fontSize: `${data.sectionHeadersSize || 18}px`, 
                fontWeight: 'bold', 
                marginBottom: '0px',
                borderBottom: '1px solid #000',
                paddingBottom: '0px'
              }}>
                Technical Skills
              </h2>
                              <div style={{ fontSize: `${data.bodyTextSize || 14}px`, lineHeight: `${data.lineSpacing || 14}px`, marginTop: '4px' }}>
                  No technical skills specified.
                </div>
            </div>
          );
        case 'Work Experience':
          const workExp = data.workExperience || [];
          if (workExp[itemIndex]) {
            const work = workExp[itemIndex];
            return (
              <div>
                                  <h2 style={{ 
                    fontSize: `${data.sectionHeadersSize || 18}px`, 
                    fontWeight: 'bold', 
                    marginBottom: '0px',
                    borderBottom: '1px solid #000',
                    paddingBottom: '1px'
                  }}>
                    Work Experience
                  </h2>
                <div style={{ paddingBottom: `${data.entrySpacing || 12}px`, marginTop: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 'bold', fontSize: `${data.subHeadersSize || 16}px` }}>
                      {work.company}{work.city && work.state ? `, ${work.city}, ${work.state}` : ''}
                    </div>
                    <div style={{ fontSize: `${data.bodyTextSize || 14}px`, fontWeight: 'bold' }}>
                      {formatDate(work.startDate)} - {work.current ? 'Present' : formatDate(work.endDate)}
                    </div>
                  </div>
                  <div style={{ fontStyle: 'italic', fontSize: `${data.bodyTextSize || 14}px` }}>
                    {work.position}
                  </div>
                  {work.bulletPoints && work.bulletPoints.length > 0 && (
                    <ul style={{ margin: '2px 0', paddingLeft: '20px' }}>
                      {work.bulletPoints.map((bullet, bulletIndex) => (
                        <li key={bulletIndex} style={{ fontSize: `${data.bodyTextSize || 14}px`, lineHeight: `${data.lineSpacing || 14}px` }}>
                          {bullet.description}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          }
          break;
        case 'Education':
          const education = data.education || [];
          if (education[itemIndex]) {
            const edu = education[itemIndex];
            return (
              <div>
                <h2 style={{ 
                  fontSize: `${data.sectionHeadersSize || 18}px`, 
                  fontWeight: 'bold', 
                  marginBottom: '0px',
                  borderBottom: '1px solid #000',
                  paddingBottom: '1px'
                }}>
                  Education
                </h2>
                <div style={{ paddingBottom: `${data.entrySpacing || 12}px`, marginTop: '4px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '4px'
                  }}>
                    <div style={{ 
                      fontSize: `${data.subHeadersSize || 16}px`, 
                      fontWeight: 'bold',
                      fontFamily: data.fontFamily || 'Times New Roman, serif'
                    }}>
                      {edu.degree} in {edu.field}
                    </div>
                    <div style={{ 
                      fontSize: `${data.bodyTextSize || 14}px`,
                      fontFamily: data.fontFamily || 'Times New Roman, serif',
                      fontWeight: 'bold'
                    }}>
                      {formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate)}
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: `${data.bodyTextSize || 14}px`,
                    fontFamily: data.fontFamily || 'Times New Roman, serif',
                    textAlign: data.alignTextLeftRight ? 'justify' : 'left'
                  }}>
                    {edu.institution}
                    {edu.gpa && ` • GPA: ${edu.gpa}`}
                  </div>
                </div>
              </div>
            );
          }
          break;
        case 'Projects':
          const projects = data.projects || [];
          if (projects[itemIndex]) {
            const project = projects[itemIndex];
            return (
              <div>
                <h2 style={{ 
                  fontSize: `${data.sectionHeadersSize || 18}px`, 
                  fontWeight: 'bold', 
                  marginBottom: '0px',
                  borderBottom: '1px solid #000',
                  paddingBottom: '1px'
                }}>
                  Projects
                </h2>
                <div key={project.id} style={{ paddingBottom: `${data.entrySpacing || 12}px`, marginTop: '4px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '2px'
                  }}>
                    <div style={{ 
                      fontSize: `${data.subHeadersSize || 16}px`, 
                      fontWeight: 'bold',
                      fontFamily: data.fontFamily || 'Times New Roman, serif'
                    }}>
                      {project.title}
                    </div>
                    <div style={{ 
                      fontSize: `${data.bodyTextSize || 14}px`,
                      fontFamily: data.fontFamily || 'Times New Roman, serif',
                      fontWeight: 'bold'
                    }}>
                      {formatDate(project.startDate)} - {project.current ? 'Present' : formatDate(project.endDate)}
                    </div>
                  </div>
                  {project.bulletPoints && project.bulletPoints.length > 0 && (
                    <ul style={{ margin: '2px 0', paddingLeft: '20px' }}>
                      {project.bulletPoints.map((bullet, bulletIndex) => (
                        <li key={bulletIndex} style={{ fontSize: `${data.bodyTextSize || 14}px`, lineHeight: `${data.lineSpacing || 14}px` }}>
                          {bullet.description}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          }
          break;
        case 'Awards':
          const awards = data.awards || [];
          if (awards[itemIndex]) {
            const award = awards[itemIndex];
            return (
              <div>
                <h2 style={{ 
                  fontSize: `${data.sectionHeadersSize || 18}px`, 
                  fontWeight: 'bold', 
                  marginBottom: '0px',
                  borderBottom: '1px solid #000',
                  paddingBottom: '1px'
                }}>
                  Awards
                </h2>
                <div key={award.id} style={{ paddingBottom: `${data.entrySpacing || 12}px`, marginTop: '4px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: `${data.subHeadersSize || 16}px` }}>
                    {award.title}
                  </div>
                  <div style={{ fontSize: `${data.bodyTextSize || 14}px` }}>
                    {award.organization} • {award.year}
                  </div>
                  {award.bulletPoints && award.bulletPoints.length > 0 && (
                    <ul style={{ margin: '2px 0', paddingLeft: '20px' }}>
                      {award.bulletPoints.map((bullet, bulletIndex) => (
                        <li key={bulletIndex} style={{ fontSize: `${data.bodyTextSize || 14}px`, lineHeight: `${data.lineSpacing || 14}px` }}>
                          {bullet.description}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          }
          break;
        default:
          return getRenderFunction(sectionName)();
      }
    } else {
      // For subsequent subsections, render only the specific item
      
      switch (sectionName) {
        case 'Work Experience':
          const workExp = data.workExperience || [];
          if (workExp[itemIndex]) {
            const work = workExp[itemIndex];
            return (
              <div key={work.company} style={{ paddingBottom: `${data.entrySpacing || 12}px` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 'bold', fontSize: `${data.subHeadersSize || 16}px` }}>
                    {work.company}{work.city && work.state ? `, ${work.city}, ${work.state}` : ''}
                  </div>
                  <div style={{ fontSize: `${data.bodyTextSize || 14}px`, fontWeight: 'bold' }}>
                    {formatDate(work.startDate)} - {work.current ? 'Present' : formatDate(work.endDate)}
                  </div>
                </div>
                <div style={{ fontStyle: 'italic', fontSize: `${data.bodyTextSize || 14}px` }}>
                  {work.position}
                </div>
                {work.bulletPoints && work.bulletPoints.length > 0 && (
                  <ul style={{ margin: '2px 0', paddingLeft: '20px' }}>
                    {work.bulletPoints.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} style={{ 
                        fontSize: `${data.bodyTextSize || 14}px`, 
                        lineHeight: `${data.lineSpacing || 14}px`,
                        textAlign: data.alignTextLeftRight ? 'justify' : 'left'
                      }}>
                        {bullet.description}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          }
          break;
        case 'Education':
          const education = data.education || [];
          if (education[itemIndex]) {
            const edu = education[itemIndex];
            return (
              <div key={edu.institution} style={{ paddingBottom: `${data.entrySpacing || 12}px` }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '4px'
                }}>
                  <div style={{ 
                    fontSize: `${data.subHeadersSize || 16}px`, 
                    fontWeight: 'bold',
                    fontFamily: data.fontFamily || 'Times New Roman, serif'
                  }}>
                    {edu.degree} in {edu.field}
                  </div>
                  <div style={{ 
                    fontSize: `${data.bodyTextSize || 14}px`,
                    fontFamily: data.fontFamily || 'Times New Roman, serif',
                    fontWeight: 'bold'
                  }}>
                    {formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate)}
                  </div>
                </div>
                <div style={{ 
                  fontSize: `${data.bodyTextSize || 14}px`,
                  fontFamily: data.fontFamily || 'Times New Roman, serif',
                  textAlign: data.alignTextLeftRight ? 'justify' : 'left'
                }}>
                  {edu.institution}
                  {edu.gpa && ` • GPA: ${edu.gpa}`}
                </div>
              </div>
            );
          }
          break;
        case 'Projects':
          const projects = data.projects || [];
          if (projects[itemIndex]) {
            const project = projects[itemIndex];
            return (
              <div key={project.id} style={{ paddingBottom: `${data.entrySpacing || 12}px` }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '2px'
                }}>
                  <div style={{ 
                    fontSize: `${data.subHeadersSize || 16}px`, 
                    fontWeight: 'bold',
                    fontFamily: data.fontFamily || 'Times New Roman, serif'
                  }}>
                    {project.title}
                  </div>
                  <div style={{ 
                    fontSize: `${data.bodyTextSize || 14}px`,
                    fontFamily: data.fontFamily || 'Times New Roman, serif',
                    fontWeight: 'bold'
                  }}>
                    {formatDate(project.startDate)} - {project.current ? 'Present' : formatDate(project.endDate)}
                  </div>
                </div>
                {project.bulletPoints && project.bulletPoints.length > 0 && (
                  <ul style={{ margin: '2px 0', paddingLeft: '20px' }}>
                    {project.bulletPoints.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} style={{ 
                        fontSize: `${data.bodyTextSize || 14}px`, 
                        lineHeight: `${data.lineSpacing || 14}px`,
                        textAlign: data.alignTextLeftRight ? 'justify' : 'left'
                      }}>
                        {bullet.description}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          }
          break;
        case 'Awards':
          const awards = data.awards || [];
          if (awards[itemIndex]) {
            const award = awards[itemIndex];
            return (
              <div key={award.id} style={{ marginBottom: `${data.entrySpacing || 12}px` }}>
                <div style={{ fontWeight: 'bold', fontSize: `${data.subHeadersSize || 16}px` }}>
                  {award.title}
                </div>
                <div style={{ 
                  fontSize: `${data.bodyTextSize || 14}px`,
                  textAlign: data.alignTextLeftRight ? 'justify' : 'left'
                }}>
                  {award.organization} • {award.year}
                </div>
                {award.bulletPoints && award.bulletPoints.length > 0 && (
                  <ul style={{ margin: '2px 0', paddingLeft: '20px' }}>
                    {award.bulletPoints.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} style={{ 
                        fontSize: `${data.bodyTextSize || 14}px`, 
                        lineHeight: `${data.lineSpacing || 14}px`,
                        textAlign: data.alignTextLeftRight ? 'justify' : 'left'
                      }}>
                        {bullet.description}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          }
          break;
        case 'Volunteer Experience':
          const volunteerExp = data.volunteerExperience || [];
          if (volunteerExp[itemIndex]) {
            const volunteer = volunteerExp[itemIndex];
            return (
              <div key={volunteer.id} style={{ marginBottom: `${data.entrySpacing || 12}px` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 'bold', fontSize: `${data.subHeadersSize || 16}px` }}>
                    {volunteer.position}
                  </div>
                  <div style={{ fontSize: `${data.bodyTextSize || 14}px`, fontWeight: 'bold' }}>
                    {formatDate(volunteer.startDate)} - {volunteer.current ? 'Present' : formatDate(volunteer.endDate)}
                  </div>
                </div>
                <div style={{ fontWeight: 'bold', fontSize: `${data.bodyTextSize || 14}px` }}>
                  {volunteer.organization}, {volunteer.location}
                </div>
                {volunteer.bulletPoints && volunteer.bulletPoints.length > 0 && (
                  <ul style={{ margin: '2px 0', paddingLeft: '20px' }}>
                    {volunteer.bulletPoints.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} style={{ 
                        fontSize: `${data.bodyTextSize || 14}px`, 
                        lineHeight: `${data.lineSpacing || 14}px`,
                        textAlign: data.alignTextLeftRight ? 'justify' : 'left'
                      }}>
                        {bullet.description}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          }
          break;
        case 'Publications':
          const publications = data.publications || [];
          if (publications[itemIndex]) {
            const pub = publications[itemIndex];
            return (
              <div key={pub.id} style={{ marginBottom: `${data.entrySpacing || 12}px` }}>
                <div style={{ fontWeight: 'bold', fontSize: `${data.subHeadersSize || 16}px` }}>
                  {pub.title}
                </div>
                <div style={{ 
                  fontSize: `${data.bodyTextSize || 14}px`,
                  textAlign: data.alignTextLeftRight ? 'justify' : 'left'
                }}>
                  {pub.authors} • {pub.journal} • {pub.year}
                </div>
                {pub.doi && (
                  <div style={{ fontSize: `${data.bodyTextSize || 14}px` }}>
                    DOI: {pub.doi}
                  </div>
                )}
              </div>
            );
          }
          break;
        case 'Languages':
          const languages = data.languages || [];
          if (languages[itemIndex]) {
            const lang = languages[itemIndex];
            return (
              <div key={lang.id} style={{ marginBottom: `${data.entrySpacing || 12}px` }}>
                <div style={{ fontWeight: 'bold', fontSize: `${data.subHeadersSize || 16}px` }}>
                  {lang.name}
                </div>
                <div style={{ 
                  fontSize: `${data.bodyTextSize || 14}px`,
                  textAlign: data.alignTextLeftRight ? 'justify' : 'left'
                }}>
                  {lang.proficiency}
                </div>
              </div>
            );
          }
          break;
        case 'Skills':
          const skillCategories = data.skillCategories || [];
          if (skillCategories[itemIndex]) {
            const category = skillCategories[itemIndex];
            return (
              <div key={category.id} style={{ marginBottom: `${data.entrySpacing || 12}px` }}>
                <div style={{ fontWeight: 'bold', fontSize: `${data.subHeadersSize || 16}px` }}>
                  {category.title}
                </div>
                <div style={{ 
                  fontSize: `${data.bodyTextSize || 14}px`,
                  textAlign: data.alignTextLeftRight ? 'justify' : 'left'
                }}>
                  {category.skills.map((skill, skillIndex) => (
                    <span key={skillIndex}>
                      {skill.name}{skillIndex < category.skills.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              </div>
            );
          }
          break;
        case 'Interests':
          return (
            <div>
                                <h2 style={{ 
                    fontSize: `${data.sectionHeadersSize || 18}px`, 
                    fontWeight: 'bold', 
                    marginBottom: '10px',
                    borderBottom: '1px solid #000',
                    paddingBottom: '1px'
                  }}>
                    Interests
                  </h2>
              <div style={{ 
                fontSize: `${data.bodyTextSize || 14}px`, 
                lineHeight: `${data.lineSpacing || 14}px`,
                textAlign: data.alignTextLeftRight ? 'justify' : 'left'
              }}>
                {data.interests?.map((interest, index) => (
                  <span key={index}>
                    {interest.icon} {interest.name}{index < (data.interests?.length || 0) - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            </div>
          );
        case 'Courses':
          const courses = data.courses || [];
          if (courses[itemIndex]) {
            const course = courses[itemIndex];
            return (
              <div>
                {subsection.isFirst && (
                  <h2 style={{ 
                    fontSize: `${data.sectionHeadersSize || 18}px`, 
                    fontWeight: 'bold', 
                    marginBottom: '10px',
                    borderBottom: '1px solid #000',
                    paddingBottom: '1px'
                  }}>
                    Courses
                  </h2>
                )}
                <div key={course.title} style={{ paddingBottom: `${data.entrySpacing || 12}px` }}>
                                  <div style={{ 
                  fontWeight: 'bold', 
                  fontSize: `${data.subHeadersSize || 16}px`,
                  textAlign: data.alignTextLeftRight ? 'justify' : 'left'
                }}>
                  {course.title}
                </div>
                <div style={{ 
                  fontSize: `${data.bodyTextSize || 14}px`,
                  textAlign: data.alignTextLeftRight ? 'justify' : 'left'
                }}>
                  {course.provider}
                </div>
                </div>
              </div>
            );
          }
          break;
        case 'Technical Skills':
          // Handle individual technical skills subsections
          if (subsection.id === 'technical-skills-strengths') {
            return (
              <div>
                {subsection.isFirst && (
                  <h2 style={{ 
                    fontSize: `${data.sectionHeadersSize || 18}px`, 
                    fontWeight: 'bold', 
                    marginBottom: '0px',
                    borderBottom: '1px solid #000',
                    paddingBottom: '0px'
                  }}>
                    Technical Skills
                  </h2>
                )}
                <div style={{ marginBottom: '0px', marginTop: '-8px' }}>
                  <strong style={{ fontSize: `${data.subHeadersSize || 16}px` }}>Strengths:</strong>
                  <div style={{ 
                    fontSize: `${data.bodyTextSize || 14}px`, 
                    lineHeight: `${data.lineSpacing || 14}px`,
                    textAlign: data.alignTextLeftRight ? 'justify' : 'left'
                  }}>
                    {data.strengths.map((strength, index) => (
                      <span key={index}>
                        {strength.skillName}{index < data.strengths.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          } else if (subsection.id.startsWith('technical-skills-category-')) {
            const categoryIndex = parseInt(subsection.id.split('-')[3]) || 0;
            const category = data.skillCategories?.[categoryIndex];
            
            if (category) {
              return (
                <div style={{ marginBottom: '10px' }}>
                  {subsection.isFirst && (
                    <h2 style={{ 
                      fontSize: `${data.sectionHeadersSize || 18}px`, 
                      fontWeight: 'bold', 
                      marginBottom: '10px',
                      borderBottom: '1px solid #000',
                      paddingBottom: '5px'
                    }}>
                      Technical Skills
                    </h2>
                  )}
                  <strong style={{ fontSize: `${data.subHeadersSize || 16}px` }}>{category.title}:</strong>
                  <div style={{ 
                    fontSize: `${data.bodyTextSize || 14}px`, 
                    lineHeight: `${data.lineSpacing || 14}px`,
                    textAlign: data.alignTextLeftRight ? 'justify' : 'left'
                  }}>
                    {category.skills.map((skill, skillIndex) => (
                      <span key={skillIndex}>
                        {skill.name}{skillIndex < category.skills.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              );
            }
          }
          
          // Fallback for default technical skills subsection
          return (
            <div>
              <h2 style={{ 
                fontSize: `${data.sectionHeadersSize || 18}px`, 
                fontWeight: 'bold', 
                marginBottom: '0px',
                borderBottom: '1px solid #000',
                paddingBottom: '1px'
              }}>
                Technical Skills
              </h2>
              <div style={{ 
                fontSize: `${data.bodyTextSize || 14}px`, 
                lineHeight: `${data.lineSpacing || 14}px`,
                textAlign: data.alignTextLeftRight ? 'justify' : 'left'
              }}>
                No technical skills specified.
              </div>
            </div>
          );
        case 'References':
          const references = data.references || [];
          if (references[itemIndex]) {
            const ref = references[itemIndex];
            return (
              <div key={ref.id} style={{ marginBottom: `${data.entrySpacing || 12}px` }}>
                <div style={{ fontWeight: 'bold', fontSize: `${data.subHeadersSize || 16}px` }}>
                  {ref.name}
                </div>
                <div style={{ 
                  fontSize: `${data.bodyTextSize || 14}px`,
                  textAlign: data.alignTextLeftRight ? 'justify' : 'left'
                }}>
                  {ref.title} at {ref.company}
                </div>
                <div style={{ 
                  fontSize: `${data.bodyTextSize || 14}px`,
                  textAlign: data.alignTextLeftRight ? 'justify' : 'left'
                }}>
                  {ref.email} • {ref.phone}
                </div>
              </div>
            );
          }
          break;
        default:
          return null;
      }
    }
    
    return null;
  };

  // Render with calculated pages
  const sectionsToRender = pages;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      {sectionsToRender.map((page, pageIndex) => {
        return (
          <div
            key={page.pageNumber}
            ref={pageIndex === 0 ? resumeRef : undefined}
        style={{ 
          fontFamily: data.fontFamily || 'Times New Roman, serif', 
          background: '#fff', 
          color: '#000', 
          padding: `${data.topBottomMargin !== undefined ? data.topBottomMargin : 40}px ${data.sideMargins !== undefined ? data.sideMargins : 40}px`,
          width: `${data.pageWidth || 850}px`,
            height: `${data.pageHeight || 1100}px`,
          margin: '0 auto',
          lineHeight: '1.2',
          position: 'relative',
            overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderRadius: '20px',
          border: '1px solid #e0e0e0'
        }}
      >
          {/* Header only on first page */}
          {pageIndex === 0 && (
            <div 
              key="header"
              data-subsection="header"
              ref={(el) => {
                if (el) {
                  sectionRefs.current.set('header', el);
                }
              }}
            >
              {renderHeader()}
            </div>
          )}

                        {/* Render subsections for this page */}
              {page.subsections.map(({ sectionName, subsectionId }) => {
                const subsections = getSubsections(sectionName);
                const subsection = subsections.find(sub => sub.id === subsectionId);
                
                if (!subsection) {
                  return null;
                }
                
                const estimatedHeight = getEstimatedSubsectionHeight(sectionName, subsection);
                if (estimatedHeight <= 0) {
                  return null;
                }
                
                return (
                  <div 
                    key={`${sectionName}-${subsection.id}`}
                    data-subsection={subsection.id}
                    ref={(el) => {
                      if (el) {
                        sectionRefs.current.set(subsection.id, el);
                      }
                    }}
                    style={{
                      paddingBottom: (() => {
                        // Include section spacing as padding for the last subsection
                        const subsections = getSubsections(sectionName);
                        const currentIndex = subsections.findIndex(sub => sub.id === subsection.id);
                  
                        return currentIndex === subsections.length - 1 ? `${data.sectionSpacing || 20}px` : '0px';
                      })()
                    }}
                  >
                    {/* Render this specific subsection */}
                    {renderSubsection(sectionName, subsection)}
                  </div>
                );
              })}
          

        </div>
      );
      })}
      

    </div>
  );
};

export default ClassicResumeTemplate; 