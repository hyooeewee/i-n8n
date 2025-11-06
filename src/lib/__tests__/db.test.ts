import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { PrismaClient } from '@/generated/prisma/client'

// Mock the PrismaClient
vi.mock('@/generated/prisma/client', () => {
  const mockPrismaClient = {
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    post: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  }

  return {
    PrismaClient: vi.fn(() => mockPrismaClient),
  }
})

describe('db.ts - Prisma Client Singleton', () => {
  let originalEnv: string | undefined
  let originalGlobal: PrismaClient | undefined

  beforeEach(() => {
    // Store original environment
    originalEnv = process.env.NODE_ENV
    originalGlobal = (global as unknown as { prisma?: PrismaClient }).prisma

    // Clear module cache to get fresh instance
    vi.resetModules()
    
    // Clear global prisma instance
    delete (global as unknown as { prisma?: PrismaClient }).prisma
  })

  afterEach(() => {
    // Restore original environment
    if (originalEnv) {
      process.env.NODE_ENV = originalEnv
    }
    
    // Restore global prisma
    if (originalGlobal) {
      (global as unknown as { prisma?: PrismaClient }).prisma = originalGlobal
    } else {
      delete (global as unknown as { prisma?: PrismaClient }).prisma
    }
  })

  describe('Singleton Pattern', () => {
    it('should create a new PrismaClient instance', async () => {
      const { default: prisma } = await import('../db')
      
      expect(prisma).toBeDefined()
      expect(typeof prisma).toBe('object')
    })

    it('should export the same instance on multiple imports', async () => {
      const { default: prisma1 } = await import('../db')
      const { default: prisma2 } = await import('../db')
      
      expect(prisma1).toBe(prisma2)
    })

    it('should have standard Prisma client methods', async () => {
      const { default: prisma } = await import('../db')
      
      expect(prisma.user).toBeDefined()
      expect(prisma.post).toBeDefined()
      expect(typeof prisma.$connect).toBe('function')
      expect(typeof prisma.$disconnect).toBe('function')
    })
  })

  describe('Development Environment Behavior', () => {
    it('should store instance in global when NODE_ENV is not production', async () => {
      process.env.NODE_ENV = 'development'
      vi.resetModules()
      
      const { default: prisma } = await import('../db')
      
      expect((global as unknown as { prisma?: PrismaClient }).prisma).toBeDefined()
      expect((global as unknown as { prisma?: PrismaClient }).prisma).toBe(prisma)
    })

    it('should reuse global instance in development to prevent hot-reload issues', async () => {
      process.env.NODE_ENV = 'development'
      vi.resetModules()
      
      // First import
      const { default: prisma1 } = await import('../db')
      
      // Simulate hot reload by resetting modules but keeping global
      vi.resetModules()
      
      // Second import should reuse the global instance
      const { default: prisma2 } = await import('../db')
      
      expect(prisma1).toBe(prisma2)
      expect((global as unknown as { prisma?: PrismaClient }).prisma).toBe(prisma2)
    })

    it('should handle test environment correctly', async () => {
      process.env.NODE_ENV = 'test'
      vi.resetModules()
      
      const { default: prisma } = await import('../db')
      
      expect((global as unknown as { prisma?: PrismaClient }).prisma).toBeDefined()
      expect(prisma).toBeDefined()
    })
  })

  describe('Production Environment Behavior', () => {
    it('should not store instance in global when NODE_ENV is production', async () => {
      process.env.NODE_ENV = 'production'
      vi.resetModules()
      delete (global as unknown as { prisma?: PrismaClient }).prisma
      
      await import('../db')
      
      expect((global as unknown as { prisma?: PrismaClient }).prisma).toBeUndefined()
    })

    it('should create fresh instances in production', async () => {
      process.env.NODE_ENV = 'production'
      vi.resetModules()
      delete (global as unknown as { prisma?: PrismaClient }).prisma
      
      const { default: prisma } = await import('../db')
      
      expect(prisma).toBeDefined()
      expect((global as unknown as { prisma?: PrismaClient }).prisma).toBeUndefined()
    })
  })

  describe('Global Type Safety', () => {
    it('should properly type-cast global object', async () => {
      process.env.NODE_ENV = 'development'
      vi.resetModules()
      
      const { default: prisma } = await import('../db')
      const globalForPrisma = global as unknown as { prisma: PrismaClient }
      
      expect(globalForPrisma.prisma).toBe(prisma)
      expect(typeof globalForPrisma.prisma).toBe('object')
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined NODE_ENV', async () => {
      delete process.env.NODE_ENV
      vi.resetModules()
      
      const { default: prisma } = await import('../db')
      
      // When NODE_ENV is undefined, it's not 'production', so should store in global
      expect((global as unknown as { prisma?: PrismaClient }).prisma).toBeDefined()
      expect(prisma).toBeDefined()
    })

    it('should handle empty string NODE_ENV', async () => {
      process.env.NODE_ENV = ''
      vi.resetModules()
      
      const { default: prisma } = await import('../db')
      
      // Empty string is not 'production', so should store in global
      expect((global as unknown as { prisma?: PrismaClient }).prisma).toBeDefined()
      expect(prisma).toBeDefined()
    })

    it('should handle case-sensitive NODE_ENV comparison', async () => {
      process.env.NODE_ENV = 'PRODUCTION'
      vi.resetModules()
      
      const { default: prisma } = await import('../db')
      
      // 'PRODUCTION' !== 'production', so should store in global
      expect((global as unknown as { prisma?: PrismaClient }).prisma).toBeDefined()
      expect(prisma).toBeDefined()
    })
  })

  describe('Module Export', () => {
    it('should export prisma as default export', async () => {
      const dbModule = await import('../db')
      
      expect(dbModule.default).toBeDefined()
      expect(typeof dbModule.default).toBe('object')
    })

    it('should not have named exports', async () => {
      const dbModule = await import('../db')
      const exports = Object.keys(dbModule).filter(key => key !== 'default')
      
      expect(exports).toHaveLength(0)
    })
  })

  describe('PrismaClient Model Access', () => {
    it('should provide access to User model', async () => {
      const { default: prisma } = await import('../db')
      
      expect(prisma.user).toBeDefined()
      expect(typeof prisma.user.findMany).toBe('function')
      expect(typeof prisma.user.findUnique).toBe('function')
      expect(typeof prisma.user.create).toBe('function')
      expect(typeof prisma.user.update).toBe('function')
      expect(typeof prisma.user.delete).toBe('function')
    })

    it('should provide access to Post model', async () => {
      const { default: prisma } = await import('../db')
      
      expect(prisma.post).toBeDefined()
      expect(typeof prisma.post.findMany).toBe('function')
      expect(typeof prisma.post.findUnique).toBe('function')
      expect(typeof prisma.post.create).toBe('function')
      expect(typeof prisma.post.update).toBe('function')
      expect(typeof prisma.post.delete).toBe('function')
    })
  })

  describe('Concurrent Access', () => {
    it('should return same instance when accessed concurrently', async () => {
      process.env.NODE_ENV = 'development'
      vi.resetModules()
      
      const promises = Array.from({ length: 10 }, async () => {
        const { default: prisma } = await import('../db')
        return prisma
      })
      
      const instances = await Promise.all(promises)
      const firstInstance = instances[0]
      
      instances.forEach(instance => {
        expect(instance).toBe(firstInstance)
      })
    })
  })
})