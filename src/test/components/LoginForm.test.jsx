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

// Mock the API module
vi.mock('../../api', () => ({
  default: {
    post: vi.fn()
  }
}))

// Wrapper component for Router
const LoginFormWrapper = ({ ...props }) => (
  <BrowserRouter>
    <LoginForm {...props} />
  </BrowserRouter>
)

describe('LoginForm Component', () => {
  it('renders login form correctly', () => {
    render(<LoginFormWrapper />)
    
    // Check if main elements are present using placeholder text
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('allows user to type in email field', () => {
    render(<LoginFormWrapper />)
    
    const emailInput = screen.getByPlaceholderText(/email/i)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    
    expect(emailInput.value).toBe('test@example.com')
  })

  it('allows user to type in password field', () => {
    render(<LoginFormWrapper />)
    
    const passwordInput = screen.getByPlaceholderText(/password/i)
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } })
    
    expect(passwordInput.value).toBe('testpassword')
  })

  it('shows sign up button', () => {
    render(<LoginFormWrapper />)
    
    // Look for sign up button
    const signUpButton = screen.getByRole('button', { name: /sign up/i })
    expect(signUpButton).toBeInTheDocument()
  })
})
