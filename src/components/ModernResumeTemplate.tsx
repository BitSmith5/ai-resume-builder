import React from 'react';
import { MdEmail, MdPhone, MdLocationOn, MdLanguage } from 'react-icons/md';
import { FaLinkedin, FaGithub } from 'react-icons/fa';

interface ResumeData {
  title: string;
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
  }>;
  interests?: Array<{
    name: string;
    icon?: string;
  }>;
}

interface ModernResumeTemplateProps {
  data: ResumeData;
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

  // Measure title width on mount and when title changes
  React.useEffect(() => {
    if (titleRef.current) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        // Get the computed font style from the element
        const computedStyle = window.getComputedStyle(titleRef.current);
        context.font = `${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`;
        const textWidth = context.measureText(data.title || '[Job Title]').width;
        setTitleWidth(textWidth);
      }
    }
  }, [data.title]);
  
  return (
    <div
      className="modern-resume-template"
      style={{
        display: 'flex',
        fontFamily: 'sans-serif',
        background: '#fff',
        color: '#333',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        width: '850px',
        height: '1100px',
        position: 'relative',
        margin: '0 auto',
      }}
    >
      {/* Left Column */}
      <div style={{ 
        width: '221px', // 26% of 850px
        padding: '24px',
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center' 
      }}>
        {/* Avatar Placeholder */}
        <div style={{ 
          width: '160px',
          height: '160px',
          borderRadius: '10%', 
          background: '#e0e0e0', 
          marginBottom: '20px' 
        }} />
        {/* Contact Info */}
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
                <MdEmail size="clamp(12px, 2vw, 16px)" style={{ color: '#c94f4f', marginRight: 8, flexShrink: 0 }} />
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
                <MdPhone size="clamp(12px, 2vw, 16px)" style={{ color: '#c94f4f', marginRight: 8, flexShrink: 0 }} />
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
                <MdLocationOn size="clamp(12px, 2vw, 16px)" style={{ color: '#c94f4f', marginRight: 8, flexShrink: 0 }} />
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
              <MdLanguage size="clamp(12px, 2vw, 16px)" style={{ color: '#c94f4f', marginRight: 8, flexShrink: 0 }} />
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
              <FaLinkedin size="clamp(12px, 2vw, 16px)" style={{ color: '#c94f4f', marginRight: 8, flexShrink: 0 }} />
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
              <FaGithub size="clamp(12px, 2vw, 16px)" style={{ color: '#c94f4f', marginRight: 8, flexShrink: 0 }} />
              <span style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>{formatUrl(personalInfo.github)}</span>
            </div>
          )}
        </div>
        {/* Technical Skills */}
        {data.strengths && data.strengths.length > 0 &&
          <div style={{ width: '100%', maxWidth: '180px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ 
                fontWeight: 700, 
                fontSize: '16px', 
                color: '#c94f4f' 
              }}>TECHNICAL SKILLS</div>
              <div style={{ width: '100%', height: 2, background: '#c94f4f', margin: '2px 0 0 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: 10 }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{ width: 2, height: 5, background: '#c94f4f', borderRadius: 0 }} />
                ))}
              </div>
            </div>
            {data.strengths.map((s, i) => (
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
                  height: 10, 
                  backgroundColor: 'transparent', 
                  border: '2px solid #c94f4f',
                  borderRadius: 0,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${(s.rating / 10) * 100}%`,
                    height: '100%',
                    backgroundColor: '#c94f4f',
                    borderRadius: 0
                  }} />
                </div>
              </div>
            ))}
          </div>
        }
        {/* Interests */}
        {data.interests && data.interests.length > 0 &&
          <div style={{ width: '100%', maxWidth: '180px' }}>
            <div style={{ 
              fontWeight: 700, 
              fontSize: 'clamp(12px, 2vw, 16px)', 
              marginBottom: 8, 
              color: '#c94f4f' 
            }}>INTERESTS</div>
            {data.interests.map((interest, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: 6,
                gap: 8
              }}>
                <div style={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: '50%', 
                  backgroundColor: '#c94f4f',
                  flexShrink: 0
                }} />
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
        }
      </div>
      {/* Right Column */}
      <div style={{ 
        width: '629px', // 850px - 221px
        margin: '24px 24px 0 0',
        overflow: 'hidden' 
      }}>
        {/* Header */}
        <div style={{ marginBottom: 16, background: '#c94f4f', padding: '12px' }}>
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
          >{data.title || '[Job Title]'}</div>
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
        {/* Work Experience */}
        <div style={{ marginBottom: 'clamp(16px, 3vw, 32px)' }}>
          <div style={{ 
            fontWeight: 700, 
            fontSize: 'clamp(14px, 2.2vw, 18px)', 
            color: '#c94f4f', 
            marginBottom: 4 
          }}>WORK EXPERIENCE</div>
          <div style={{ 
            width: '100%', 
            height: 2, 
            background: '#c94f4f', 
            margin: '4px 0 12px 0' 
          }} />
          {data.workExperience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ 
                fontWeight: 700, 
                fontSize: '16px',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'normal',
                color: '#c94f4f',
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
                  color: '#c94f4f', 
                  marginBottom: 4,
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal',
                  fontStyle: 'italic'
                }}>{formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}</div>
                {(exp.city || exp.state) && (
                  <div style={{ 
                    fontSize: 'clamp(10px, 1.5vw, 12px)', 
                    color: '#c94f4f',
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
                        border: '1px solid #c94f4f', 
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
        {/* Courses & Trainings Placeholder */}
        {data.courses && data.courses.length > 0 &&
          <div style={{ marginBottom: '16px' }}>
            <div style={{ 
              fontWeight: 700, 
              fontSize: 'clamp(14px, 2.2vw, 18px)', 
              color: '#c94f4f', 
              marginBottom: 8 
            }}>COURSES & TRAININGS</div>
            <div style={{ 
              width: '100%', 
              height: 2, 
              background: '#c94f4f', 
              margin: '4px 0 12px 0' 
            }} />
            {data.courses.map((course, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ 
                  fontSize: '14px',
                  fontWeight: 500,
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal',
                  lineHeight: '1.3'
                }}>{course.title}</div>
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
        }
        {/* Education */}
        {data.education && data.education.length > 0 &&
          <div style={{ marginBottom: 'clamp(16px, 3vw, 32px)' }}>
            <div style={{ 
              fontWeight: 700, 
              fontSize: 'clamp(14px, 2.2vw, 18px)', 
              color: '#c94f4f', 
              marginBottom: 8 
            }}>EDUCATION</div>
            <div style={{ 
              width: '100%', 
              height: 2, 
              background: '#c94f4f', 
              margin: '4px 0 12px 0' 
            }} />
            {data.education.map((edu, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ 
                  fontWeight: 600, 
                  fontSize: '16px',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal',
                  color: '#c94f4f',
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
                    color: '#c94f4f',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal',
                    lineHeight: '1.3',
                    fontStyle: 'italic'
                  }}>{formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate)}</div>
                  {edu.gpa &&
                    <div style={{ 
                      fontSize: '10px', 
                      color: '#c94f4f',
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
        }
      </div>
    </div>
  );
};

export default ModernResumeTemplate; 