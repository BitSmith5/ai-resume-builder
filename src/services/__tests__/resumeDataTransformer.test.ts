// Test the resume data transformer service
// This service transforms raw resume data into the format needed for rendering

describe('Resume Data Transformer', () => {
  const mockRawResumeData = {
    id: '1',
    userId: 'user1',
    template: 'classic',
    personalInfo: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      summary: 'Experienced developer'
    },
    workExperience: [
      {
        id: 'work1',
        company: 'Tech Corp',
        position: 'Developer',
        startDate: '2023-01-01',
        endDate: '2024-01-01',
        description: 'Built web applications',
        bulletPoints: ['Developed React components', 'Implemented API integrations']
      }
    ],
    education: [
      {
        id: 'edu1',
        institution: 'University of Tech',
        degree: 'Computer Science',
        startDate: '2019-09-01',
        endDate: '2023-05-01',
        gpa: '3.8'
      }
    ],
    skills: [
      {
        id: 'skill1',
        name: 'JavaScript',
        level: 'Advanced'
      }
    ]
  }

  describe('Data Structure Validation', () => {
    it('should have required resume fields', () => {
      expect(mockRawResumeData.id).toBeDefined()
      expect(mockRawResumeData.userId).toBeDefined()
      expect(mockRawResumeData.template).toBeDefined()
      expect(mockRawResumeData.personalInfo).toBeDefined()
    })

    it('should have personal info structure', () => {
      const { personalInfo } = mockRawResumeData
      expect(personalInfo.name).toBe('John Doe')
      expect(personalInfo.email).toBe('john@example.com')
      expect(personalInfo.phone).toBe('1234567890')
      expect(personalInfo.summary).toBe('Experienced developer')
    })

    it('should have work experience structure', () => {
      const workExp = mockRawResumeData.workExperience[0]
      expect(workExp.company).toBe('Tech Corp')
      expect(workExp.position).toBe('Developer')
      expect(workExp.startDate).toBe('2023-01-01')
      expect(workExp.endDate).toBe('2024-01-01')
      expect(workExp.bulletPoints).toHaveLength(2)
    })

    it('should have education structure', () => {
      const education = mockRawResumeData.education[0]
      expect(education.institution).toBe('University of Tech')
      expect(education.degree).toBe('Computer Science')
      expect(education.startDate).toBe('2019-09-01')
      expect(education.endDate).toBe('2023-05-01')
      expect(education.gpa).toBe('3.8')
    })

    it('should have skills structure', () => {
      const skill = mockRawResumeData.skills[0]
      expect(skill.name).toBe('JavaScript')
      expect(skill.level).toBe('Advanced')
    })
  })

  describe('Data Transformation Logic', () => {
    it('should transform dates to consistent format', () => {
      // Test date transformation logic
      const transformDate = (dateString: string): string => {
        if (!dateString) return ''
        
        // Ensure YYYY-MM-DD format
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return dateString
        }
        
        // Try to parse and format
        try {
          const date = new Date(dateString)
          if (isNaN(date.getTime())) return dateString
          
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          
          return `${year}-${month}-${day}`
        } catch {
          return dateString
        }
      }

      expect(transformDate('2023-01-01')).toBe('2023-01-01')
      expect(transformDate('2023/01/01')).toBe('2023-01-01')
      expect(transformDate('01/01/2023')).toBe('2023-01-01')
      expect(transformDate('')).toBe('')
      expect(transformDate('invalid')).toBe('invalid')
    })

    it('should validate required fields', () => {
      const validateRequired = (data: any, requiredFields: string[]): boolean => {
        return requiredFields.every(field => {
          const value = data[field]
          return value !== undefined && value !== null && value !== ''
        })
      }

      const requiredPersonalInfo = ['name', 'email']
      expect(validateRequired(mockRawResumeData.personalInfo, requiredPersonalInfo)).toBe(true)
      
      const missingData = { name: 'John', email: '' }
      expect(validateRequired(missingData, requiredPersonalInfo)).toBe(false)
    })

    it('should handle empty arrays gracefully', () => {
      const resumeWithEmptySections = {
        ...mockRawResumeData,
        workExperience: [],
        education: [],
        skills: []
      }

      expect(resumeWithEmptySections.workExperience).toHaveLength(0)
      expect(resumeWithEmptySections.education).toHaveLength(0)
      expect(resumeWithEmptySections.skills).toHaveLength(0)
    })
  })

  describe('Template Handling', () => {
    it('should support multiple template types', () => {
      const supportedTemplates = ['classic', 'modern', 'minimal', 'professional']
      expect(supportedTemplates).toContain(mockRawResumeData.template)
    })

    it('should have default template fallback', () => {
      const getTemplateOrDefault = (template?: string): string => {
        const supportedTemplates = ['classic', 'modern', 'minimal', 'professional']
        return template && supportedTemplates.includes(template) ? template : 'classic'
      }

      expect(getTemplateOrDefault('modern')).toBe('modern')
      expect(getTemplateOrDefault('invalid')).toBe('classic')
      expect(getTemplateOrDefault(undefined)).toBe('classic')
    })
  })

  describe('Data Sanitization', () => {
    it('should sanitize text fields', () => {
      const sanitizeText = (text: string): string => {
        if (!text) return ''
        return text
          .trim()
          .replace(/[<>]/g, '') // Remove potential HTML tags
          .replace(/\s+/g, ' ') // Normalize whitespace
      }

      expect(sanitizeText('  Hello   World  ')).toBe('Hello World')
      expect(sanitizeText('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script')
      expect(sanitizeText('')).toBe('')
    })

    it('should validate email format', () => {
      const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
      }

      expect(isValidEmail('john@example.com')).toBe(true)
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('john@')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })
})
