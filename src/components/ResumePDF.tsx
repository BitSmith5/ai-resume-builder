"use client";

import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

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

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontSize: 12,
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 20,
    borderBottom: '1px solid #333',
    paddingBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2c3e50',
  },
  contactInfo: {
    fontSize: 10,
    color: '#666',
    marginBottom: 5,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
    borderBottom: '1px solid #eee',
    paddingBottom: 3,
  },
  summary: {
    fontSize: 11,
    color: '#333',
    marginBottom: 10,
  },
  experienceItem: {
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  company: {
    fontSize: 11,
    color: '#666',
    marginBottom: 3,
  },
  dateRange: {
    fontSize: 10,
    color: '#888',
    marginBottom: 5,
  },
  description: {
    fontSize: 10,
    color: '#333',
    marginTop: 5,
  },
  educationItem: {
    marginBottom: 10,
  },
  degree: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  institution: {
    fontSize: 11,
    color: '#666',
    marginBottom: 3,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  skill: {
    backgroundColor: '#f8f9fa',
    padding: '3px 8px',
    margin: '2px',
    borderRadius: 3,
    fontSize: 9,
  },
});

interface ResumePDFProps {
  resumeData: ResumeData;
}

const ResumePDF: React.FC<ResumePDFProps> = ({ resumeData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>
          {resumeData.content.personalInfo.name || 'Your Name'}
        </Text>
        <Text style={styles.contactInfo}>
          {resumeData.content.personalInfo.email || 'email@example.com'}
        </Text>
        <Text style={styles.contactInfo}>
          {resumeData.content.personalInfo.phone || 'Phone Number'}
        </Text>
        <Text style={styles.contactInfo}>
          {resumeData.content.personalInfo.address || 'Address'}
        </Text>
      </View>

      {/* Professional Summary */}
      {resumeData.content.personalInfo.summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Summary</Text>
          <Text style={styles.summary}>{resumeData.content.personalInfo.summary}</Text>
        </View>
      )}

      {/* Skills */}
      {resumeData.strengths.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsContainer}>
            {resumeData.strengths.map((strength, index) => (
              <Text key={index} style={styles.skill}>
                {strength.skillName} ({strength.rating}/10)
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Work Experience */}
      {resumeData.workExperience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Experience</Text>
          {resumeData.workExperience.map((exp, index) => (
            <View key={index} style={styles.experienceItem}>
              <Text style={styles.jobTitle}>{exp.position}</Text>
              <Text style={styles.company}>{exp.company}</Text>
              <Text style={styles.dateRange}>
                {new Date(exp.startDate).toLocaleDateString()} - {exp.current ? 'Present' : new Date(exp.endDate).toLocaleDateString()}
              </Text>
              <Text style={styles.description}>{exp.description}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Education */}
      {resumeData.education.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {resumeData.education.map((edu, index) => (
            <View key={index} style={styles.educationItem}>
              <Text style={styles.degree}>
                {edu.degree} in {edu.field}
              </Text>
              <Text style={styles.institution}>{edu.institution}</Text>
              <Text style={styles.dateRange}>
                {new Date(edu.startDate).toLocaleDateString()} - {edu.current ? 'Present' : new Date(edu.endDate).toLocaleDateString()}
                {edu.gpa && ` • GPA: ${edu.gpa}`}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Page>
  </Document>
);

export const generateResumePDF = async (resumeData: ResumeData): Promise<Blob> => {
  const element = <ResumePDF resumeData={resumeData} />;
  const blob = await pdf(element).toBlob();
  return blob;
};

export default ResumePDF; 