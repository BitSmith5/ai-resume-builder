'use client';

import React, { useState, useEffect } from 'react';
import ClassicResumeTemplate from '../../components/ClassicResumeTemplate';
import { renderResumeToHtml } from '../../lib/renderResumeToHtml';

// Sample resume data for testing
const sampleResumeData = {
  title: "Test Resume",
  jobTitle: "Software Engineer",
  profilePicture: "",
  fontFamily: "Times New Roman, serif",
  nameSize: 40,
  sectionHeadersSize: 18,
  subHeadersSize: 16,
  bodyTextSize: 14,
  sectionSpacing: 20,
  entrySpacing: 12,
  lineSpacing: 14,
  topBottomMargin: 40,
  sideMargins: 40,
  alignTextLeftRight: false,
  pageWidth: 850,
  pageHeight: 1100,
  content: {
    personalInfo: {
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "5551234567",
      city: "San Francisco",
      state: "CA",
      summary: "Experienced software engineer with 5+ years of experience in full-stack development, specializing in React, Node.js, and cloud technologies. Passionate about creating scalable and maintainable applications.",
      website: "johndoe.dev",
      linkedin: "linkedin.com/in/johndoe",
      github: "github.com/johndoe"
    }
  },
  strengths: [
    { skillName: "JavaScript", rating: 9 },
    { skillName: "React", rating: 8 },
    { skillName: "Node.js", rating: 8 },
    { skillName: "Python", rating: 7 },
    { skillName: "AWS", rating: 7 }
  ],
  workExperience: [
    {
      company: "Tech Corp",
      position: "Senior Software Engineer",
      startDate: "2022-01-01",
      endDate: "",
      current: true,
      city: "San Francisco",
      state: "CA",
      bulletPoints: [
        { description: "Led development of microservices architecture serving 1M+ users" },
        { description: "Mentored 3 junior developers and conducted code reviews" },
        { description: "Improved application performance by 40% through optimization" }
      ]
    },
    {
      company: "Startup Inc",
      position: "Full Stack Developer",
      startDate: "2020-03-01",
      endDate: "2021-12-31",
      current: false,
      city: "San Francisco",
      state: "CA",
      bulletPoints: [
        { description: "Built and deployed React-based web application" },
        { description: "Implemented CI/CD pipeline reducing deployment time by 60%" },
        { description: "Collaborated with design team to improve user experience" }
      ]
    }
  ],
  education: [
    {
      institution: "University of California",
      degree: "Bachelor of Science",
      field: "Computer Science",
      startDate: "2016-09-01",
      endDate: "2020-05-31",
      current: false,
      gpa: 3.8
    }
  ],
  courses: [
    {
      title: "Advanced React Patterns",
      provider: "Frontend Masters",
      link: "frontendmasters.com/courses/advanced-react"
    },
    {
      title: "AWS Solutions Architect",
      provider: "AWS Training",
      link: "aws.amazon.com/training"
    }
  ],
  interests: [
    { name: "Open Source", icon: "🔧" },
    { name: "Hiking", icon: "🏔️" },
    { name: "Photography", icon: "📸" }
  ]
};

export default function TestPdfComparison() {
  const [generatedHtml, setGeneratedHtml] = useState<string>('');
  const [exportSettings, setExportSettings] = useState({
    template: 'classic',
    pageSize: 'letter' as 'letter' | 'a4',
    fontFamily: 'Times New Roman, serif',
    nameSize: 40,
    sectionHeadersSize: 18,
    subHeadersSize: 16,
    bodyTextSize: 14,
    sectionSpacing: 20,
    entrySpacing: 12,
    lineSpacing: 14,
    topBottomMargin: 40,
    sideMargins: 40,
    alignTextLeftRight: false,
    pageWidth: 850,
    pageHeight: 1100
  });

  useEffect(() => {
    // Generate HTML using the renderResumeToHtml function
    const html = renderResumeToHtml(sampleResumeData, 'classic', exportSettings);
    setGeneratedHtml(html);
  }, [exportSettings]);

  const handleExportSettingsChange = (key: string, value: any) => {
    setExportSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>PDF Generation Comparison Test</h1>
      <p>This page compares the ClassicResumeTemplate React component with the generated HTML to ensure they match.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Export Settings</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <div>
            <label>Font Family:</label>
            <input
              type="text"
              value={exportSettings.fontFamily}
              onChange={(e) => handleExportSettingsChange('fontFamily', e.target.value)}
              style={{ width: '100%', padding: '5px' }}
            />
          </div>
          <div>
            <label>Name Size (px):</label>
            <input
              type="number"
              value={exportSettings.nameSize}
              onChange={(e) => handleExportSettingsChange('nameSize', parseInt(e.target.value))}
              style={{ width: '100%', padding: '5px' }}
            />
          </div>
          <div>
            <label>Section Headers Size (px):</label>
            <input
              type="number"
              value={exportSettings.sectionHeadersSize}
              onChange={(e) => handleExportSettingsChange('sectionHeadersSize', parseInt(e.target.value))}
              style={{ width: '100%', padding: '5px' }}
            />
          </div>
          <div>
            <label>Body Text Size (px):</label>
            <input
              type="number"
              value={exportSettings.bodyTextSize}
              onChange={(e) => handleExportSettingsChange('bodyTextSize', parseInt(e.target.value))}
              style={{ width: '100%', padding: '5px' }}
            />
          </div>
          <div>
            <label>Section Spacing (px):</label>
            <input
              type="number"
              value={exportSettings.sectionSpacing}
              onChange={(e) => handleExportSettingsChange('sectionSpacing', parseInt(e.target.value))}
              style={{ width: '100%', padding: '5px' }}
            />
          </div>
          <div>
            <label>Entry Spacing (px):</label>
            <input
              type="number"
              value={exportSettings.entrySpacing}
              onChange={(e) => handleExportSettingsChange('entrySpacing', parseInt(e.target.value))}
              style={{ width: '100%', padding: '5px' }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h2>React Component (ClassicResumeTemplate)</h2>
          <div style={{ border: '1px solid #ccc', padding: '10px', backgroundColor: '#f9f9f9' }}>
            <ClassicResumeTemplate data={sampleResumeData} />
          </div>
        </div>
        
        <div>
          <h2>Generated HTML (PDF)</h2>
          <div style={{ border: '1px solid #ccc', padding: '10px', backgroundColor: '#f9f9f9' }}>
            <div dangerouslySetInnerHTML={{ __html: generatedHtml }} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>Generated HTML Source</h2>
        <details>
          <summary>Click to view HTML source</summary>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '10px', 
            overflow: 'auto', 
            maxHeight: '400px',
            fontSize: '12px'
          }}>
            {generatedHtml}
          </pre>
        </details>
      </div>
    </div>
  );
} 