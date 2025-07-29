import React, { useRef, useEffect, useState } from 'react';

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
  const [sectionPages, setSectionPages] = useState<{ [key: string]: number }>({});
  const [pages, setPages] = useState<{ sections: string[]; pageNumber: number }[]>([]);

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





  // Render functions for each section
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
        margin: '0 0 8px 0',
        fontFamily: data.fontFamily || 'Times New Roman, serif',
        borderBottom: '1px solid #000',
        paddingBottom: '2px'
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
        margin: '0 0 8px 0',
        fontFamily: data.fontFamily || 'Times New Roman, serif',
        borderBottom: '1px solid #000',
        paddingBottom: '2px'
      }}>
        Technical Skills
      </h2>
      
      {/* Render strengths if they exist */}
      {data.strengths && data.strengths.length > 0 && (
        <div style={{ 
          fontSize: `${data.bodyTextSize || 14}px`,
          fontFamily: data.fontFamily || 'Times New Roman, serif',
          lineHeight: `${data.lineSpacing || 14}px`,
          marginBottom: '8px'
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
                lineHeight: `${data.lineSpacing || 14}px`
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
        margin: '0 0 8px 0',
        fontFamily: data.fontFamily || 'Times New Roman, serif',
        borderBottom: '1px solid #000',
        paddingBottom: '2px'
      }}>
        Work Experience
      </h2>
      {data.workExperience.map((work, index) => (
        <div 
          key={index} 
          data-subsection={`work-${index}`}
          style={{ marginBottom: `${data.entrySpacing || 12}px` }}
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
            marginBottom: '4px'
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
              <li key={pointIndex} style={{ marginBottom: '2px' }}>
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
          margin: '0 0 8px 0',
          fontFamily: data.fontFamily || 'Times New Roman, serif',
          borderBottom: '1px solid #000',
          paddingBottom: '2px'
        }}>
          Education
      </h2>
      {data.education.map((edu, index) => (
        <div 
          key={index} 
          data-subsection={`education-${index}`}
          style={{ marginBottom: `${data.entrySpacing || 12}px` }}
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
            fontFamily: data.fontFamily || 'Times New Roman, serif'
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
          margin: '0 0 8px 0',
          fontFamily: data.fontFamily || 'Times New Roman, serif',
          borderBottom: '1px solid #000',
          paddingBottom: '2px'
        }}>
          Projects
        </h2>
        {data.projects.map((project, index) => (
          <div key={index} style={{ marginBottom: `${data.entrySpacing || 12}px` }}>
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
              marginBottom: '4px'
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
                <li key={pointIndex} style={{ marginBottom: '2px' }}>
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
          margin: '0 0 8px 0',
          fontFamily: data.fontFamily || 'Times New Roman, serif',
          borderBottom: '1px solid #000',
          paddingBottom: '2px'
        }}>
          Courses
        </h2>
        <div style={{ 
          fontSize: `${data.bodyTextSize || 14}px`,
          fontFamily: data.fontFamily || 'Times New Roman, serif',
          lineHeight: `${data.lineSpacing || 14}px`
        }}>
          {data.courses.map((course, index) => (
            <div key={index} style={{ marginBottom: '8px' }}>
              <div style={{ marginBottom: '2px' }}>
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
                      fontFamily: data.fontFamily || 'Times New Roman, serif'
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
          margin: '0 0 8px 0',
          fontFamily: data.fontFamily || 'Times New Roman, serif',
          borderBottom: '1px solid #000',
          paddingBottom: '2px'
        }}>
          Languages
        </h2>
        <div style={{ 
          fontSize: `${data.bodyTextSize || 14}px`,
          fontFamily: data.fontFamily || 'Times New Roman, serif',
          lineHeight: `${data.lineSpacing || 14}px`
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
          margin: '0 0 8px 0',
          fontFamily: data.fontFamily || 'Times New Roman, serif',
          borderBottom: '1px solid #000',
          paddingBottom: '2px'
        }}>
          Skills
        </h2>
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
              lineHeight: `${data.lineSpacing || 14}px`
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
          margin: '0 0 8px 0',
          fontFamily: data.fontFamily || 'Times New Roman, serif',
          borderBottom: '1px solid #000',
          paddingBottom: '2px'
        }}>
          Interests
        </h2>
        <div style={{ 
          fontSize: `${data.bodyTextSize || 14}px`,
          fontFamily: data.fontFamily || 'Times New Roman, serif',
          lineHeight: `${data.lineSpacing || 14}px`
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
          margin: '0 0 8px 0',
          fontFamily: data.fontFamily || 'Times New Roman, serif',
          borderBottom: '1px solid #000',
          paddingBottom: '2px'
        }}>
          Publications
        </h2>
        {data.publications.map((pub, index) => (
          <div key={index} style={{ marginBottom: `${data.entrySpacing || 12}px` }}>
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
              marginBottom: '2px'
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
          margin: '0 0 8px 0',
          fontFamily: data.fontFamily || 'Times New Roman, serif',
          borderBottom: '1px solid #000',
          paddingBottom: '2px'
        }}>
          Awards
        </h2>
        {data.awards.map((award, index) => (
          <div key={index} style={{ marginBottom: `${data.entrySpacing || 12}px` }}>
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
              marginBottom: '4px'
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
                <li key={pointIndex} style={{ marginBottom: '2px' }}>
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
          margin: '0 0 8px 0',
          fontFamily: data.fontFamily || 'Times New Roman, serif',
          borderBottom: '1px solid #000',
          paddingBottom: '2px'
        }}>
          Volunteer Experience
        </h2>
        {data.volunteerExperience.map((volunteer, index) => (
          <div key={index} style={{ marginBottom: `${data.entrySpacing || 12}px` }}>
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
              marginBottom: '4px'
            }}>
              {volunteer.organization}, {volunteer.location}
            </div>
            <div style={{ 
              fontSize: `${data.bodyTextSize || 14}px`,
              fontFamily: data.fontFamily || 'Times New Roman, serif',
              marginBottom: '4px'
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
                <li key={pointIndex} style={{ marginBottom: '2px' }}>
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
          margin: '0 0 8px 0',
          fontFamily: data.fontFamily || 'Times New Roman, serif',
          borderBottom: '1px solid #000',
          paddingBottom: '2px'
        }}>
          References
        </h2>
        {data.references.map((ref, index) => (
          <div key={index} style={{ marginBottom: `${data.entrySpacing || 12}px` }}>
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
              marginBottom: '2px'
            }}>
              {ref.title} at {ref.company}
            </div>
            <div style={{ 
              fontSize: `${data.bodyTextSize || 14}px`,
              fontFamily: data.fontFamily || 'Times New Roman, serif',
              marginBottom: '2px'
            }}>
              {ref.email} • {ref.phone}
            </div>
            <div style={{ 
              fontSize: `${data.bodyTextSize || 14}px`,
              fontFamily: data.fontFamily || 'Times New Roman, serif'
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

  // Helper function to get subsections for each section
  const getSubsections = (sectionName: string): Array<{ id: string; name: string; isFirst: boolean }> => {
    switch (sectionName) {
      case 'Professional Summary':
        return [{ id: 'professional-summary', name: 'Professional Summary', isFirst: true }];
      case 'Technical Skills':
        return [{ id: 'technical-skills', name: 'Technical Skills', isFirst: true }];
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
        return (data.interests || []).map((interest, index) => ({
          id: `interest-${index}`,
          name: interest.name,
          isFirst: index === 0
        }));
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

  // Helper function to estimate subsection heights (more accurate)
  const getEstimatedSubsectionHeight = (sectionName: string, subsection: { id: string; name: string; isFirst: boolean }): number => {
    const baseHeight = 30; // Reduced base height for section header
    const sectionSpacing = data.sectionSpacing || 20;
    const entrySpacing = data.entrySpacing || 12;
    
    if (subsection.isFirst) {
      // First subsection includes section header
      switch (sectionName) {
        case 'Professional Summary':
          return baseHeight + 30;
        case 'Technical Skills':
          return baseHeight + (data.strengths?.length || 0) * 15;
        case 'Work Experience':
          return baseHeight + 100; // Reduced from 120
        case 'Education':
          return baseHeight + 60; // Reduced from 80
        case 'Projects':
          return baseHeight + 120; // Reduced from 150
        case 'Courses':
          return baseHeight + 25; // Reduced from 30
        case 'Languages':
          return baseHeight + 20; // Reduced from 25
        case 'Skills':
          return baseHeight + 50; // Reduced from 60
        case 'Interests':
          return baseHeight + 20; // Reduced from 25
        case 'Publications':
          return baseHeight + 60; // Reduced from 80
        case 'Awards':
          return baseHeight + 80; // Reduced from 100
        case 'Volunteer Experience':
          return baseHeight + 100; // Reduced from 120
        case 'References':
          return baseHeight + 60; // Reduced from 80
        default:
          return baseHeight + 40;
      }
    } else {
      // Regular subsection (no section header)
      switch (sectionName) {
        case 'Work Experience':
          return 100; // Reduced from 120
        case 'Education':
          return 60; // Reduced from 80
        case 'Projects':
          return 120; // Reduced from 150
        case 'Courses':
          return 25; // Reduced from 30
        case 'Languages':
          return 20; // Reduced from 25
        case 'Skills':
          return 50; // Reduced from 60
        case 'Interests':
          return 20; // Reduced from 25
        case 'Publications':
          return 60; // Reduced from 80
        case 'Awards':
          return 80; // Reduced from 100
        case 'Volunteer Experience':
          return 100; // Reduced from 120
        case 'References':
          return 60; // Reduced from 80
        default:
          return 40;
      }
    }
  };

  // Subsection-based page calculation
  useEffect(() => {
    const calculatePages = () => {
      const pageHeight = data.pageHeight || 1100;
      const topBottomMargin = data.topBottomMargin || 40;
      const contentHeight = pageHeight - (topBottomMargin * 2);
      const headerHeight = data.profilePicture ? 180 : 120;
      
      const pages: { sections: string[]; pageNumber: number }[] = [];
      let currentPage = { sections: [] as string[], pageNumber: 0 };
      let currentHeight = headerHeight; // Start with header height for first page
      
      // Add first page
      pages.push(currentPage);
      
      // Get all subsections from all sections
      const allSubsections: Array<{ sectionName: string; subsection: { id: string; name: string; isFirst: boolean } }> = [];
      
      for (const sectionName of activeSections) {
        const subsections = getSubsections(sectionName);
        subsections.forEach(subsection => {
          allSubsections.push({ sectionName, subsection });
        });
      }
      
      // Process each subsection
      for (const { sectionName, subsection } of allSubsections) {
        // Estimate subsection height
        const estimatedHeight = getEstimatedSubsectionHeight(sectionName, subsection);
        
        // Debug information
        const debugInfo = {
          sectionName,
          subsectionName: subsection.name,
          isFirst: subsection.isFirst,
          estimatedHeight,
          currentHeight,
          contentHeight,
          willFit: currentHeight + estimatedHeight <= contentHeight,
          remainingSpace: contentHeight - currentHeight
        };
        
        console.log('📊 Subsection calculation:', debugInfo);
        
        // Check if subsection fits on current page
        if (currentHeight + estimatedHeight > contentHeight && currentPage.sections.length > 0) {
          console.log(`🚨 Creating new page for "${subsection.name}" - doesn't fit!`, {
            currentHeight,
            estimatedHeight,
            total: currentHeight + estimatedHeight,
            contentHeight,
            overflow: (currentHeight + estimatedHeight) - contentHeight
          });
          
          // Create new page
          currentPage = { sections: [], pageNumber: pages.length };
          pages.push(currentPage);
          currentHeight = 0; // Reset height for new page
        }
        
        // Add section to current page (we still track by section for rendering)
        if (!currentPage.sections.includes(sectionName)) {
          currentPage.sections.push(sectionName);
        }
        currentHeight += estimatedHeight;
      }
      
      setPages(pages);
    };

    // Debounce the calculation by 1 second (1000ms) to prevent jumpy updates
    const timer = setTimeout(calculatePages, 1000);
    return () => clearTimeout(timer);
  }, [activeSections, data.topBottomMargin, data.pageHeight, data.profilePicture, data.sectionSpacing, data.entrySpacing, data.lineSpacing, data.sectionHeadersSize, data.subHeadersSize, data.bodyTextSize, data.sideMargins]);



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

  // If we have pages from collision detection, render multiple pages
  if (pages.length > 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        {pages.map((page, pageIndex) => (
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
            {pageIndex === 0 && renderHeader()}

            {/* Render sections for this page */}
            {page.sections.map((sectionName) => (
              <div 
                key={sectionName}
                data-section={sectionName}
                ref={(el) => {
                  if (el) {
                    sectionRefs.current.set(sectionName.toLowerCase().replace(/\s+/g, '-'), el);
                  }
                }}
              >
                {getRenderFunction(sectionName)()}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Initial render - single page for collision detection
  return (
    <div 
      ref={resumeRef}
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
      

      {/* Header */}
      {renderHeader()}

      {/* Render sections with subsection collision detection */}
      {activeSections.map((sectionName) => (
        <div 
          key={sectionName}
          data-section={sectionName}
          ref={(el) => {
            if (el) {
              sectionRefs.current.set(sectionName.toLowerCase().replace(/\s+/g, '-'), el);
            }
          }}
        >
          {getRenderFunction(sectionName)()}
        </div>
      ))}
    </div>
  );
};

export default ClassicResumeTemplate; 