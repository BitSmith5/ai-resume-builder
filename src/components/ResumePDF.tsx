import jsPDF from 'jspdf';

interface ResumeData {
  title: string;
  jobTitle?: string;
  content: {
    personalInfo: {
      name: string;
      email: string;
      phone: string;
      city: string;
      state: string;
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

export const generateResumePDF = async (resumeData: ResumeData): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF();
      let yPosition = 20;
      const margin = 20;
      const pageWidth = doc.internal.pageSize.width;
      const contentWidth = pageWidth - (margin * 2);

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

      // Helper function to add text with word wrapping
      const addWrappedText = (text: string, y: number, fontSize: number = 12, fontStyle: string = 'normal') => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', fontStyle);
        const lines = doc.splitTextToSize(text, contentWidth);
        doc.text(lines, margin, y);
        return y + (lines.length * fontSize * 0.4);
      };

      // Helper function to add section header
      const addSectionHeader = (title: string, y: number) => {
        yPosition = addWrappedText(title, y, 16, 'bold');
        yPosition += 5;
        return yPosition;
      };

      // Helper function to check if we need a new page
      const checkNewPage = (requiredSpace: number) => {
        if (yPosition + requiredSpace > doc.internal.pageSize.height - margin) {
          doc.addPage();
          yPosition = 20;
        }
      };

      // Title
      yPosition = addWrappedText(resumeData.jobTitle || resumeData.title || 'Resume', yPosition, 20, 'bold');
      yPosition += 10;

      // Personal Information
      yPosition = addSectionHeader('Personal Information', yPosition);
      
      const personalInfo = resumeData.content.personalInfo;
      if (personalInfo.name) {
        yPosition = addWrappedText(`Name: ${personalInfo.name}`, yPosition);
      }
      if (personalInfo.email) {
        yPosition = addWrappedText(`Email: ${personalInfo.email}`, yPosition);
      }
      if (personalInfo.phone) {
        yPosition = addWrappedText(`Phone: ${personalInfo.phone}`, yPosition);
      }
      if (personalInfo.city || personalInfo.state) {
        const location = [personalInfo.city, personalInfo.state].filter(Boolean).join(', ');
        yPosition = addWrappedText(`Location: ${location}`, yPosition);
      }
      if (personalInfo.summary) {
        yPosition += 5;
        yPosition = addWrappedText('Professional Summary:', yPosition, 12, 'bold');
        yPosition = addWrappedText(personalInfo.summary, yPosition);
      }

      yPosition += 10;

      // Skills & Strengths
      if (resumeData.strengths.length > 0) {
        checkNewPage(50);
        yPosition = addSectionHeader('Skills & Strengths', yPosition);
        
        resumeData.strengths.forEach((strength) => {
          if (strength.skillName) {
            const skillText = `${strength.skillName}${strength.rating ? ` (Rating: ${strength.rating}/10)` : ''}`;
            yPosition = addWrappedText(`• ${skillText}`, yPosition);
          }
        });
        yPosition += 10;
      }

      // Work Experience
      if (resumeData.workExperience.length > 0) {
        checkNewPage(100);
        yPosition = addSectionHeader('Work Experience', yPosition);
        
        resumeData.workExperience.forEach((exp) => {
          if (exp.company || exp.position) {
            const companyText = exp.company ? exp.company : '';
            const positionText = exp.position ? exp.position : '';
            const dateText = exp.current ? 
              `${formatDate(exp.startDate)} - Present` : 
              `${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}`;
            
            yPosition = addWrappedText(`${positionText} at ${companyText}`, yPosition, 12, 'bold');
            yPosition = addWrappedText(dateText, yPosition, 10);
            
            if (exp.bulletPoints.length > 0) {
              exp.bulletPoints.forEach((bullet) => {
                if (bullet.description) {
                  yPosition = addWrappedText(`• ${bullet.description}`, yPosition, 10);
                }
              });
            }
            yPosition += 5;
          }
        });
        yPosition += 10;
      }

      // Education
      if (resumeData.education.length > 0) {
        checkNewPage(100);
        yPosition = addSectionHeader('Education', yPosition);
        
        resumeData.education.forEach((edu) => {
          if (edu.institution || edu.degree) {
            const institutionText = edu.institution ? edu.institution : '';
            const degreeText = edu.degree ? edu.degree : '';
            const fieldText = edu.field ? edu.field : '';
            const dateText = edu.current ? 
              `${formatDate(edu.startDate)} - Present` : 
              `${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}`;
            
            yPosition = addWrappedText(`${degreeText} in ${fieldText}`, yPosition, 12, 'bold');
            yPosition = addWrappedText(institutionText, yPosition, 10);
            yPosition = addWrappedText(dateText, yPosition, 10);
            
            if (edu.gpa) {
              yPosition = addWrappedText(`GPA: ${edu.gpa}`, yPosition, 10);
            }
            yPosition += 5;
          }
        });
      }

      // Generate blob
      const pdfBlob = doc.output('blob');
      resolve(pdfBlob);
    } catch (error) {
      reject(error);
    }
  });
}; 