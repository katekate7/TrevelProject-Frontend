/**
 * 🧪 Simple Tests for RegisterForm Component
 * 
 * These tests verify basic functionality of the RegisterForm component:
 * - Component renders without crashing
 * - Form elements are present
 * - User can input data
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import RegisterForm from '../../components/RegisterForm'

// Mock the API module
vi.mock('../../api', () => ({
  default: {
    post: vi.fn()
  }
}))

// Wrapper component for Router
const RegisterFormWrapper = ({ ...props }) => (
  <BrowserRouter>
    <RegisterForm {...props} />
  </BrowserRouter>
)

describe('RegisterForm Component', () => {
  it('renders register form correctly', () => {
    render(<RegisterFormWrapper />)
    
    // Check if main form elements are present using placeholder text
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
  })

  it('allows user to type in username field', () => {
    render(<RegisterFormWrapper />)
    
    const usernameInput = screen.getByPlaceholderText(/username/i)
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    
    expect(usernameInput.value).toBe('testuser')
  })

  it('allows user to type in email field', () => {
    render(<RegisterFormWrapper />)
    
    const emailInput = screen.getByPlaceholderText(/email/i)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    
    expect(emailInput.value).toBe('test@example.com')
  })

  it('allows user to type in password field', () => {
    render(<RegisterFormWrapper />)
    
    const passwordInput = screen.getByPlaceholderText(/password/i)
    fireEvent.change(passwordInput, { target: { value: 'testpassword123' } })
    
    expect(passwordInput.value).toBe('testpassword123')
  })

  it('shows log in button', () => {
    render(<RegisterFormWrapper />)
    
    // Look for log in button
    const loginButton = screen.getByRole('button', { name: /log in/i })
    expect(loginButton).toBeInTheDocument()
  })
})
