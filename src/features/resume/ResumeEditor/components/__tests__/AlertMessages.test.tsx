import React from 'react'
import { render, screen } from '@testing-library/react'
import { AlertMessages } from '../AlertMessages'

describe('AlertMessages', () => {
  it('should render nothing when no messages are provided', () => {
    render(<AlertMessages />)
    
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('should render error message when error prop is provided', () => {
    const errorMessage = 'Something went wrong!'
    render(<AlertMessages error={errorMessage} />)
    
    const errorAlert = screen.getByRole('alert')
    expect(errorAlert).toBeInTheDocument()
    expect(errorAlert).toHaveTextContent(errorMessage)
    expect(errorAlert).toHaveClass('MuiAlert-standardError')
  })

  it('should render success message when success prop is provided', () => {
    const successMessage = 'Operation completed successfully!'
    render(<AlertMessages success={successMessage} />)
    
    const successAlert = screen.getByRole('alert')
    expect(successAlert).toBeInTheDocument()
    expect(successAlert).toHaveTextContent(successMessage)
    expect(successAlert).toHaveClass('MuiAlert-standardSuccess')
  })

  it('should render both error and success messages when both are provided', () => {
    const errorMessage = 'Something went wrong!'
    const successMessage = 'Operation completed successfully!'
    
    render(<AlertMessages error={errorMessage} success={successMessage} />)
    
    const alerts = screen.getAllByRole('alert')
    expect(alerts).toHaveLength(2)
    
    const errorAlert = screen.getByText(errorMessage)
    const successAlert = screen.getByText(successMessage)
    
    expect(errorAlert).toBeInTheDocument()
    expect(successAlert).toBeInTheDocument()
  })

  it('should handle empty string messages', () => {
    render(<AlertMessages error="" success="" />)
    
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('should handle null messages', () => {
    render(<AlertMessages error={null} success={null} />)
    
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('should handle undefined messages', () => {
    render(<AlertMessages error={undefined} success={undefined} />)
    
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('should apply proper styling classes', () => {
    render(<AlertMessages error="Test error" success="Test success" />)
    
    const alerts = screen.getAllByRole('alert')
    alerts.forEach(alert => {
      expect(alert).toHaveClass('MuiAlert-root')
    })
  })
})
