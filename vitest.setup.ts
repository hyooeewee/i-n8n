import { beforeAll, afterEach, afterAll, vi } from 'vitest'

// Mock environment variables
beforeAll(() => {
  process.env.NODE_ENV = 'test'
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
})

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks()
})

afterAll(() => {
  vi.restoreAllMocks()
})