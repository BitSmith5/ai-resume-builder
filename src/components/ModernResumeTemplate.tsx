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
}

interface ModernResumeTemplateProps {
  data: ResumeData;
}

const ModernResumeTemplate: React.FC<ModernResumeTemplateProps> = ({ data }) => {
  const { personalInfo } = data.content;
  
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
        background: '#f8f8fa', 
        width: '221px', // 26% of 850px
        padding: '24px',
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center' 
      }}>
        {/* Avatar Placeholder */}
        <div style={{ 
          width: '80px',
          height: '80px',
          borderRadius: '50%', 
          background: '#e0e0e0', 
          marginBottom: '20px' 
        }} />
        {/* Contact Info */}
          <div style={{ width: '100%', maxWidth: '180px', marginBottom: '24px' }}>
            <div style={{ 
              fontWeight: 600, 
              fontSize: 'clamp(14px, 2.5vw, 18px)', 
              marginBottom: 8 
            }}>{personalInfo.name}</div>
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
        {/* Interests Placeholder */}
        <div style={{ width: '100%', maxWidth: '180px' }}>
          <div style={{ 
            fontWeight: 700, 
            fontSize: 'clamp(12px, 2vw, 16px)', 
            marginBottom: 8, 
            color: '#c94f4f' 
          }}>INTERESTS</div>
          <div style={{ 
            fontSize: 'clamp(11px, 1.8vw, 14px)', 
            marginBottom: 4 
          }}>[Interests go here]</div>
        </div>
      </div>
      {/* Right Column */}
      <div style={{ 
        width: '629px', // 850px - 221px
        padding: '40px',
        overflow: 'hidden' 
      }}>
        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ 
            fontSize: 'clamp(24px, 4vw, 32px)', 
            fontWeight: 700, 
            color: '#c94f4f',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            whiteSpace: 'normal',
            lineHeight: '1.1'
          }}>{personalInfo.name}</div>
          <div style={{ 
            fontSize: 'clamp(16px, 2.5vw, 20px)', 
            fontWeight: 500, 
            color: '#555',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            whiteSpace: 'normal',
            lineHeight: '1.2'
          }}>{data.title || '[Job Title]'}</div>
        </div>
        {/* Summary */}
        <div style={{ marginBottom: 'clamp(16px, 3vw, 32px)' }}>
          <div style={{ 
            fontSize: 'clamp(12px, 1.8vw, 15px)', 
            color: '#444',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            whiteSpace: 'normal',
            lineHeight: '1.4'
          }}>{personalInfo.summary}</div>
        </div>
        {/* Work Experience */}
        <div style={{ marginBottom: 'clamp(16px, 3vw, 32px)' }}>
          <div style={{ 
            fontWeight: 700, 
            fontSize: 'clamp(14px, 2.2vw, 18px)', 
            color: '#c94f4f', 
            marginBottom: 8 
          }}>WORK EXPERIENCE</div>
          {data.workExperience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ 
                fontWeight: 600, 
                fontSize: 'clamp(13px, 2vw, 16px)',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'normal',
                lineHeight: '1.3'
              }}>{exp.position} <span style={{ color: '#888', fontWeight: 400 }}>@ {exp.company}</span></div>
              <div style={{ 
                fontSize: 'clamp(11px, 1.6vw, 13px)', 
                color: '#888', 
                marginBottom: 4,
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'normal'
              }}>{formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}</div>
              {exp.bulletPoints.length > 0 && (
                <div style={{ 
                  fontSize: 'clamp(11px, 1.8vw, 14px)',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal',
                  lineHeight: '1.4'
                }}>
                  {exp.bulletPoints.map((bullet, bulletIndex) => (
                    <div key={bulletIndex} style={{ marginBottom: 4, paddingLeft: 16 }}>
                      • {bullet.description}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Education */}
        <div style={{ marginBottom: 'clamp(16px, 3vw, 32px)' }}>
          <div style={{ 
            fontWeight: 700, 
            fontSize: 'clamp(14px, 2.2vw, 18px)', 
            color: '#c94f4f', 
            marginBottom: 8 
          }}>EDUCATION</div>
          {data.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ 
                fontWeight: 600, 
                fontSize: 'clamp(12px, 1.9vw, 15px)',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'normal',
                lineHeight: '1.3'
              }}>{edu.degree} in {edu.field}</div>
              <div style={{ 
                fontSize: 'clamp(11px, 1.6vw, 13px)', 
                color: '#888',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'normal',
                lineHeight: '1.3'
              }}>{edu.institution} | {formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate)} {edu.gpa ? `| GPA: ${edu.gpa}` : ''}</div>
            </div>
          ))}
        </div>
        {/* Courses & Trainings Placeholder */}
        <div>
          <div style={{ 
            fontWeight: 700, 
            fontSize: 'clamp(14px, 2.2vw, 18px)', 
            color: '#c94f4f', 
            marginBottom: 8 
          }}>COURSES & TRAININGS</div>
          <div style={{ 
            fontSize: 'clamp(11px, 1.8vw, 14px)' 
          }}>[Courses & Trainings go here]</div>
        </div>
      </div>
    </div>
  );
};

export default ModernResumeTemplate; 