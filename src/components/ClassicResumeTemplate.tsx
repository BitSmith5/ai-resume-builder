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
  
  return (
    <div style={{ 
      fontFamily: 'Times New Roman, serif', 
      background: '#fff', 
      color: '#000', 
      padding: '40px',
      width: '850px',
      height: '1100px',
      margin: '0 auto',
      lineHeight: '1.6',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #000', paddingBottom: '20px' }}>
        {data.profilePicture && (
          <div style={{ 
            width: '120px',
            height: '120px',
            borderRadius: '50%', 
            backgroundImage: `url(${data.profilePicture})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            margin: '0 auto 15px auto',
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
        <div style={{ fontSize: '14px', color: '#333' }}>
          {personalInfo.email && <span style={{ marginRight: '20px' }}>{personalInfo.email}</span>}
          {personalInfo.phone && <span style={{ marginRight: '20px' }}>{personalInfo.phone}</span>}
          {(personalInfo.city || personalInfo.state) && (
            <span>{[personalInfo.city, personalInfo.state].filter(Boolean).join(', ')}</span>
          )}
        </div>
        {(personalInfo.website || personalInfo.linkedin || personalInfo.github) && (
          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            {personalInfo.website && <span style={{ marginRight: '15px' }}>{personalInfo.website}</span>}
            {personalInfo.linkedin && <span style={{ marginRight: '15px' }}>{personalInfo.linkedin}</span>}
            {personalInfo.github && <span>{personalInfo.github}</span>}
          </div>
        )}
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            margin: '0 0 10px 0',
            textTransform: 'uppercase',
            borderBottom: '1px solid #000',
            paddingBottom: '5px'
          }}>
            Professional Summary
          </h2>
          <p style={{ fontSize: '14px', margin: '0', textAlign: 'justify' }}>
            {personalInfo.summary}
          </p>
        </div>
      )}

      {/* Skills */}
      {data.strengths.length > 0 && (
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            margin: '0 0 10px 0',
            textTransform: 'uppercase',
            borderBottom: '1px solid #000',
            paddingBottom: '5px'
          }}>
            Skills
          </h2>
          <div style={{ fontSize: '14px' }}>
            {data.strengths.map((strength, index) => (
              <span key={index} style={{ 
                display: 'inline-block',
                marginRight: '15px',
                marginBottom: '5px',
                fontWeight: 'bold'
              }}>
                {strength.skillName} ({strength.rating}/10)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Work Experience */}
      {data.workExperience.length > 0 && (
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            margin: '0 0 15px 0',
            textTransform: 'uppercase',
            borderBottom: '1px solid #000',
            paddingBottom: '5px'
          }}>
            Work Experience
          </h2>
          {data.workExperience.map((exp, index) => (
            <div key={index} style={{ marginBottom: '20px' }}>
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
              </div>
              {exp.bulletPoints.length > 0 && (
                <ul style={{ 
                  fontSize: '13px', 
                  margin: '0', 
                  paddingLeft: '20px',
                  textAlign: 'justify'
                }}>
                  {exp.bulletPoints.map((bullet, bulletIndex) => (
                    <li key={bulletIndex} style={{ marginBottom: '3px' }}>
                      {bullet.description}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            margin: '0 0 15px 0',
            textTransform: 'uppercase',
            borderBottom: '1px solid #000',
            paddingBottom: '5px'
          }}>
            Education
          </h2>
          {data.education.map((edu, index) => (
            <div key={index} style={{ marginBottom: '15px' }}>
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
    </div>
  );
};

export default ClassicResumeTemplate; 