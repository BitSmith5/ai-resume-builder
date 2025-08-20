import React from 'react'
import { render } from '@testing-library/react'
import ResumeTemplateRegistry from '../ResumeTemplateRegistry'

// Mock the resume templates
jest.mock('../ModernResumeTemplate', () => {
  return function MockModernTemplate({ data }: any) {
    return <div data-testid="modern-template">Modern Template: {data.title}</div>
  }
})

jest.mock('../ClassicResumeTemplate', () => {
  return function MockClassicTemplate({ data }: any) {
    return <div data-testid="classic-template">Classic Template: {data.title}</div>
  }
})

describe('ResumeTemplateRegistry', () => {
  const mockResumeData = {
    id: 1,
    title: 'John Doe Resume',
    jobTitle: 'Software Developer',
    content: {
      personalInfo: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        city: 'New York',
        state: 'NY',
        summary: 'Experienced developer'
      }
    },
    strengths: [
      { id: 1, skillName: 'JavaScript', rating: 5 }
    ],
    workExperience: [
      {
        id: 1,
        company: 'Tech Corp',
        position: 'Developer',
        startDate: '2023-01-01',
        endDate: '2024-01-01',
        current: false,
        bulletPoints: [{ description: 'Built web applications' }]
      }
    ],
    education: [
      {
        id: 1,
        institution: 'University of Tech',
        degree: 'Computer Science',
        field: 'Software Engineering',
        startDate: '2019-09-01',
        endDate: '2023-05-01',
        current: false,
        gpa: 3.8
      }
    ],
    createdAt: '2024-01-01T00:00:00Z'
  }

  it('should render modern template when templateId is modern', () => {
    const { getByTestId } = render(
      <ResumeTemplateRegistry templateId="modern" data={mockResumeData} />
    )
    
    expect(getByTestId('modern-template')).toBeDefined()
    expect(getByTestId('modern-template').textContent).toContain('Modern Template: John Doe Resume')
  })

  it('should render classic template when templateId is classic', () => {
    const { getByTestId } = render(
      <ResumeTemplateRegistry templateId="classic" data={mockResumeData} />
    )
    
    expect(getByTestId('classic-template')).toBeDefined()
    expect(getByTestId('classic-template').textContent).toContain('Classic Template: John Doe Resume')
  })

  it('should render modern template as default when templateId is not specified', () => {
    const { getByTestId } = render(
      <ResumeTemplateRegistry templateId="" data={mockResumeData} />
    )
    
    expect(getByTestId('modern-template')).toBeDefined()
  })

  it('should render modern template for unknown templateId', () => {
    const { getByTestId } = render(
      <ResumeTemplateRegistry templateId="unknown" data={mockResumeData} />
    )
    
    expect(getByTestId('modern-template')).toBeDefined()
  })

  it('should pass correct data structure to templates', () => {
    const { getByTestId } = render(
      <ResumeTemplateRegistry templateId="modern" data={mockResumeData} />
    )
    
    const template = getByTestId('modern-template')
    expect(template.textContent).toContain('John Doe Resume')
  })

  it('should handle resume data with missing optional fields', () => {
    const minimalData = {
      ...mockResumeData,
      courses: undefined,
      interests: undefined,
      projects: undefined,
      publications: undefined,
      awards: undefined,
      volunteerExperience: undefined
    }

    const { getByTestId } = render(
      <ResumeTemplateRegistry templateId="classic" data={minimalData} />
    )
    
    expect(getByTestId('classic-template')).toBeDefined()
  })
})
