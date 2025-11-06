import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock the Button component
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: { children?: unknown; [key: string]: unknown }) => (
    <button {...props}>{children}</button>
  ),
}))

// Mock prisma
const mockFindMany = vi.fn()
vi.mock('@/lib/db', () => ({
  default: {
    user: {
      findMany: mockFindMany,
    },
  },
}))

describe('Page Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('should render the page with button', async () => {
      mockFindMany.mockResolvedValue([])
      
      const Page = (await import('../page')).default
      render(await Page())
      
      expect(screen.getByText('Click Me')).toBeInTheDocument()
    })

    it('should have correct container classes', async () => {
      mockFindMany.mockResolvedValue([])
      
      const Page = (await import('../page')).default
      const { container } = render(await Page())
      
      const div = container.querySelector('div')
      expect(div).toHaveClass('min-w-full', 'min-h-screen', 'flex', 'items-center', 'justify-center')
    })

    it('should render a button element', async () => {
      mockFindMany.mockResolvedValue([])
      
      const Page = (await import('../page')).default
      render(await Page())
      
      const button = screen.getByRole('button', { name: 'Click Me' })
      expect(button).toBeInTheDocument()
    })

    it('should render a pre element for displaying users', async () => {
      mockFindMany.mockResolvedValue([])
      
      const Page = (await import('../page')).default
      const { container } = render(await Page())
      
      const pre = container.querySelector('pre')
      expect(pre).toBeInTheDocument()
    })
  })

  describe('Data Fetching', () => {
    it('should call prisma.user.findMany()', async () => {
      mockFindMany.mockResolvedValue([])
      
      const Page = (await import('../page')).default
      await Page()
      
      expect(mockFindMany).toHaveBeenCalledTimes(1)
      expect(mockFindMany).toHaveBeenCalledWith()
    })

    it('should display empty array when no users exist', async () => {
      mockFindMany.mockResolvedValue([])
      
      const Page = (await import('../page')).default
      const { container } = render(await Page())
      
      const pre = container.querySelector('pre')
      expect(pre?.textContent).toBe('[]')
    })

    it('should display single user data correctly', async () => {
      const mockUser = {
        id: 1,
        name: 'John Doe',
      }
      mockFindMany.mockResolvedValue([mockUser])
      
      const Page = (await import('../page')).default
      const { container } = render(await Page())
      
      const pre = container.querySelector('pre')
      const displayedData = JSON.parse(pre?.textContent || '[]')
      
      expect(displayedData).toHaveLength(1)
      expect(displayedData[0]).toEqual(mockUser)
    })

    it('should display multiple users correctly', async () => {
      const mockUsers = [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' },
        { id: 3, name: 'Bob Johnson' },
      ]
      mockFindMany.mockResolvedValue(mockUsers)
      
      const Page = (await import('../page')).default
      const { container } = render(await Page())
      
      const pre = container.querySelector('pre')
      const displayedData = JSON.parse(pre?.textContent || '[]')
      
      expect(displayedData).toHaveLength(3)
      expect(displayedData).toEqual(mockUsers)
    })

    it('should format JSON with proper indentation', async () => {
      const mockUsers = [
        { id: 1, name: 'John Doe' },
      ]
      mockFindMany.mockResolvedValue(mockUsers)
      
      const Page = (await import('../page')).default
      const { container } = render(await Page())
      
      const pre = container.querySelector('pre')
      const expectedFormat = JSON.stringify(mockUsers, null, 2)
      
      expect(pre?.textContent).toBe(expectedFormat)
    })
  })

  describe('Edge Cases', () => {
    it('should handle users with missing fields gracefully', async () => {
      const mockUsers = [
        { id: 1, name: 'John' },
        { id: 2 } as { id: number },
      ]
      mockFindMany.mockResolvedValue(mockUsers)
      
      const Page = (await import('../page')).default
      const { container } = render(await Page())
      
      const pre = container.querySelector('pre')
      expect(pre).toBeInTheDocument()
      
      const displayedData = JSON.parse(pre?.textContent || '[]')
      expect(displayedData).toHaveLength(2)
    })

    it('should handle users with extra fields', async () => {
      const mockUsers = [
        { 
          id: 1, 
          name: 'John Doe',
          email: 'john@example.com',
          createdAt: new Date().toISOString(),
        },
      ]
      mockFindMany.mockResolvedValue(mockUsers)
      
      const Page = (await import('../page')).default
      const { container } = render(await Page())
      
      const pre = container.querySelector('pre')
      const displayedData = JSON.parse(pre?.textContent || '[]')
      
      expect(displayedData[0]).toHaveProperty('email')
      expect(displayedData[0]).toHaveProperty('createdAt')
    })

    it('should handle large number of users', async () => {
      const mockUsers = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
      }))
      mockFindMany.mockResolvedValue(mockUsers)
      
      const Page = (await import('../page')).default
      const { container } = render(await Page())
      
      const pre = container.querySelector('pre')
      const displayedData = JSON.parse(pre?.textContent || '[]')
      
      expect(displayedData).toHaveLength(100)
    })

    it('should handle users with special characters in names', async () => {
      const mockUsers = [
        { id: 1, name: 'John "The Rock" Doe' },
        { id: 2, name: "O'Brien" },
        { id: 3, name: 'User\nWith\nNewlines' },
        { id: 4, name: 'User\tWith\tTabs' },
      ]
      mockFindMany.mockResolvedValue(mockUsers)
      
      const Page = (await import('../page')).default
      const { container } = render(await Page())
      
      const pre = container.querySelector('pre')
      const displayedData = JSON.parse(pre?.textContent || '[]')
      
      expect(displayedData).toEqual(mockUsers)
    })

    it('should handle users with unicode characters', async () => {
      const mockUsers = [
        { id: 1, name: '日本語' },
        { id: 2, name: '中文' },
        { id: 3, name: 'Émilie' },
        { id: 4, name: '🎉 Celebration' },
      ]
      mockFindMany.mockResolvedValue(mockUsers)
      
      const Page = (await import('../page')).default
      const { container } = render(await Page())
      
      const pre = container.querySelector('pre')
      const displayedData = JSON.parse(pre?.textContent || '[]')
      
      expect(displayedData).toEqual(mockUsers)
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      mockFindMany.mockRejectedValue(new Error('Database connection failed'))
      
      const Page = (await import('../page')).default
      
      await expect(async () => {
        await Page()
      }).rejects.toThrow('Database connection failed')
    })

    it('should handle query timeout errors', async () => {
      mockFindMany.mockRejectedValue(new Error('Query timeout'))
      
      const Page = (await import('../page')).default
      
      await expect(async () => {
        await Page()
      }).rejects.toThrow('Query timeout')
    })

    it('should handle unexpected prisma errors', async () => {
      mockFindMany.mockRejectedValue(new Error('Unexpected error'))
      
      const Page = (await import('../page')).default
      
      await expect(async () => {
        await Page()
      }).rejects.toThrow('Unexpected error')
    })
  })

  describe('Server Component Behavior', () => {
    it('should be an async function', async () => {
      const Page = (await import('../page')).default
      
      expect(Page.constructor.name).toBe('AsyncFunction')
    })

    it('should return a React element', async () => {
      mockFindMany.mockResolvedValue([])
      
      const Page = (await import('../page')).default
      const result = await Page()
      
      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
    })
  })

  describe('Component Structure', () => {
    it('should have button and pre as siblings', async () => {
      mockFindMany.mockResolvedValue([])
      
      const Page = (await import('../page')).default
      const { container } = render(await Page())
      
      const div = container.querySelector('div')
      const button = div?.querySelector('button')
      const pre = div?.querySelector('pre')
      
      expect(button).toBeInTheDocument()
      expect(pre).toBeInTheDocument()
      expect(button?.parentElement).toBe(pre?.parentElement)
    })
  })

  describe('JSON Formatting', () => {
    it('should use 2-space indentation', async () => {
      const mockUsers = [{ id: 1, name: 'John' }]
      mockFindMany.mockResolvedValue(mockUsers)
      
      const Page = (await import('../page')).default
      const { container } = render(await Page())
      
      const pre = container.querySelector('pre')
      expect(pre?.textContent).toContain('  ')
      expect(pre?.textContent).not.toContain('    ') // Should not have 4 spaces
    })

    it('should handle null values in user data', async () => {
      const mockUsers = [
        { id: 1, name: null as string | null },
      ]
      mockFindMany.mockResolvedValue(mockUsers)
      
      const Page = (await import('../page')).default
      const { container } = render(await Page())
      
      const pre = container.querySelector('pre')
      expect(pre?.textContent).toContain('null')
    })

    it('should handle nested objects if present', async () => {
      const mockUsers = [
        { 
          id: 1, 
          name: 'John',
          metadata: { role: 'admin', active: true }
        } as { id: number; name: string; metadata: { role: string; active: boolean } },
      ]
      mockFindMany.mockResolvedValue(mockUsers)
      
      const Page = (await import('../page')).default
      const { container } = render(await Page())
      
      const pre = container.querySelector('pre')
      const displayedData = JSON.parse(pre?.textContent || '[]')
      
      expect(displayedData[0].metadata).toEqual({ role: 'admin', active: true })
    })
  })
})