import React from 'react';

interface ResumeData {
  title: string;
  content: {
    personalInfo: {
      name: string;
      email: string;
      phone: string;
      address: string;
      summary: string;
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
    description: string;
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
  return (
    <div style={{ display: 'flex', fontFamily: 'sans-serif', background: '#fff', color: '#333', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', minHeight: 800 }}>
      {/* Left Column */}
      <div style={{ background: '#f8f8fa', width: 280, padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Avatar Placeholder */}
        <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#e0e0e0', marginBottom: 24 }} />
        {/* Contact Info */}
        <div style={{ width: '100%', marginBottom: 32 }}>
          <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>{personalInfo.name}</div>
          <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>{personalInfo.email}</div>
          <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>{personalInfo.phone}</div>
          <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>{personalInfo.address}</div>
        </div>
        {/* Technical Skills */}
        <div style={{ width: '100%', marginBottom: 32 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: '#c94f4f' }}>TECHNICAL SKILLS</div>
          {data.strengths.map((s, i) => (
            <div key={i} style={{ fontSize: 14, marginBottom: 4 }}>{s.skillName}</div>
          ))}
        </div>
        {/* Interests Placeholder */}
        <div style={{ width: '100%' }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: '#c94f4f' }}>INTERESTS</div>
          <div style={{ fontSize: 14, marginBottom: 4 }}>[Interests go here]</div>
        </div>
      </div>
      {/* Right Column */}
      <div style={{ flex: 1, padding: 40 }}>
        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#c94f4f' }}>{personalInfo.name}</div>
          <div style={{ fontSize: 20, fontWeight: 500, color: '#555' }}>{data.title || '[Job Title]'}</div>
        </div>
        {/* Summary */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 15, color: '#444' }}>{personalInfo.summary}</div>
        </div>
        {/* Work Experience */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#c94f4f', marginBottom: 8 }}>WORK EXPERIENCE</div>
          {data.workExperience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{exp.position} <span style={{ color: '#888', fontWeight: 400 }}>@ {exp.company}</span></div>
              <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</div>
              <div style={{ fontSize: 14 }}>{exp.description}</div>
            </div>
          ))}
        </div>
        {/* Education */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#c94f4f', marginBottom: 8 }}>EDUCATION</div>
          {data.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{edu.degree} in {edu.field}</div>
              <div style={{ fontSize: 13, color: '#888' }}>{edu.institution} | {edu.startDate} - {edu.current ? 'Present' : edu.endDate} {edu.gpa ? `| GPA: ${edu.gpa}` : ''}</div>
            </div>
          ))}
        </div>
        {/* Courses & Trainings Placeholder */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#c94f4f', marginBottom: 8 }}>COURSES & TRAININGS</div>
          <div style={{ fontSize: 14 }}>[Courses & Trainings go here]</div>
        </div>
      </div>
    </div>
  );
};

export default ModernResumeTemplate; 