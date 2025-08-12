/**
 * 🧪 Simple Tests for LoginForm Component
 * 
 * These tests verify basic functionality of the LoginForm component:
 * - Component renders without crashing
 * - Form elements are present
 * - User interactions work correctly
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import LoginForm from '../../components/LoginForm'

// Mock the API module to avoid actual API calls during testing
// This creates a mock version of the api.post method that can be tracked
vi.mock('../../api', () => ({
  default: {
    post: vi.fn()
  }
}))

// Wrapper component for Router
// This wrapper provides the Router context needed by the LoginForm component
// It's necessary because LoginForm likely uses router hooks or components
const LoginFormWrapper = ({ ...props }) => (
  <BrowserRouter>
    <LoginForm {...props} />
  </BrowserRouter>
)

describe('LoginForm Component', () => {
  it('renders login form correctly', () => {
    render(<LoginFormWrapper />)
    
    // Check if main elements are present using placeholder text
    // Verify email field is rendered
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
    // Verify password field is rendered
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument()
    // Verify login button is rendered
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('allows user to type in email field', () => {
    render(<LoginFormWrapper />)
    
    // Get the email input field using its placeholder text
    const emailInput = screen.getByPlaceholderText(/email/i)
    // Simulate user typing into the email field
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    
    // Verify the input field contains the email that was entered
    expect(emailInput.value).toBe('test@example.com')
  })

  it('allows user to type in password field', () => {
    render(<LoginFormWrapper />)
    
    // Get the password input field using its placeholder text
    const passwordInput = screen.getByPlaceholderText(/password/i)
    // Simulate user typing into the password field
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } })
    
    // Verify the input field contains the text that was entered
    expect(passwordInput.value).toBe('testpassword')
  })

  it('shows sign up button', () => {
    render(<LoginFormWrapper />)
    
    // Look for sign up button using its text content
    const signUpButton = screen.getByRole('button', { name: /sign up/i })
    // Verify the sign up button is rendered on the page
    expect(signUpButton).toBeInTheDocument()
  })
})
