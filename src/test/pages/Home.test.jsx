/**
 * 🧪 Simple Tests for Home Page Component
 * 
 * Basic tests to verify Home page functionality:
 * - Component renders without crashing
 * - Basic elements are present
 */

import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Home from '../../pages/Home'

// Mock the API module
vi.mock('../../api', () => ({
  default: {
    post: vi.fn()
  }
}))

// Wrapper component for Router
const HomeWrapper = () => (
  <BrowserRouter>
    <Home />
  </BrowserRouter>
)

describe('Home Page', () => {
  it('renders home page without crashing', () => {
    render(<HomeWrapper />)
    
    // Check if the page renders - look for common elements
    expect(document.querySelector('div')).toBeInTheDocument()
  })

  it('displays main form elements', () => {
    render(<HomeWrapper />)
    
    // Should show basic form elements
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument()
  })

  it('displays logo image', () => {
    render(<HomeWrapper />)
    
    // Check if logo is present
    const logo = screen.getByAltText(/logo/i)
    expect(logo).toBeInTheDocument()
  })
})
