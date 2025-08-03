/**
 * 🧪 Simple Tests for App Component
 * 
 * These tests verify basic functionality of the main App component:
 * - Component renders without crashing
 * - Routes are set up correctly
 * - Navigation works
 */

import { render, screen } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import App from '../App'

// Mock all the page components to avoid complex dependencies
vi.mock('../pages/Home', () => ({
  default: () => <div data-testid="home-page">Home Page</div>
}))

vi.mock('../pages/HomePage', () => ({
  default: () => <div data-testid="homepage">HomePage Component</div>
}))

vi.mock('../pages/Dashboard', () => ({
  default: () => <div data-testid="dashboard">Dashboard Page</div>
}))

vi.mock('../pages/AdminPage', () => ({
  default: () => <div data-testid="admin-page">Admin Page</div>
}))

// Mock API to avoid network calls
vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

describe('App Component', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    
    // App should render without throwing errors
    expect(document.querySelector('div')).toBeInTheDocument()
  })

  it('renders Home page on /start route', () => {
    render(
      <MemoryRouter initialEntries={['/start']}>
        <App />
      </MemoryRouter>
    )
    
    expect(screen.getByTestId('home-page')).toBeInTheDocument()
  })

  it('renders HomePage on / route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )
    
    expect(screen.getByTestId('homepage')).toBeInTheDocument()
  })

  it('renders Dashboard on /dashboard route', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    )
    
    expect(screen.getByTestId('dashboard')).toBeInTheDocument()
  })

  it('renders Admin page on /admin route', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <App />
      </MemoryRouter>
    )
    
    expect(screen.getByTestId('admin-page')).toBeInTheDocument()
  })
})
