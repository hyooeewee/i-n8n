import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock dotenv/config
vi.mock('dotenv/config', () => ({}))

// Mock prisma/config
const mockDefineConfig = vi.fn((config) => config)
const mockEnv = vi.fn((key) => process.env[key] || '')

vi.mock('prisma/config', () => ({
  defineConfig: mockDefineConfig,
  env: mockEnv,
}))

describe('prisma.config.ts', () => {
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    originalEnv = { ...process.env }
    vi.clearAllMocks()
  })

  afterEach(() => {
    process.env = originalEnv
    vi.resetModules()
  })

  describe('Configuration Structure', () => {
    it('should export a valid Prisma configuration', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
      
      const config = (await import('../prisma.config')).default
      
      expect(config).toBeDefined()
      expect(typeof config).toBe('object')
    })

    it('should call defineConfig with configuration object', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
      vi.resetModules()
      
      await import('../prisma.config')
      
      expect(mockDefineConfig).toHaveBeenCalledTimes(1)
      expect(mockDefineConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          schema: expect.any(String),
          migrations: expect.any(Object),
          engine: expect.any(String),
          datasource: expect.any(Object),
        })
      )
    })

    it('should have default export', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
      
      const configExport = await import('../prisma.config')
      
      expect(configExport.default).toBeDefined()
      expect(Object.keys(configExport).filter(k => k !== 'default')).toHaveLength(0)
    })
  })

  describe('Schema Configuration', () => {
    it('should specify correct schema path', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
      
      const config = (await import('../prisma.config')).default
      
      expect(config.schema).toBe('prisma/schema.prisma')
    })

    it('should use relative path for schema', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
      
      const config = (await import('../prisma.config')).default
      
      expect(config.schema).not.toMatch(/^\//)
      expect(config.schema).not.toMatch(/^\.\.\//)
    })
  })

  describe('Migrations Configuration', () => {
    it('should specify correct migrations path', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
      
      const config = (await import('../prisma.config')).default
      
      expect(config.migrations).toBeDefined()
      expect(config.migrations.path).toBe('prisma/migrations')
    })

    it('should use relative path for migrations', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
      
      const config = (await import('../prisma.config')).default
      
      expect(config.migrations.path).not.toMatch(/^\//)
      expect(config.migrations.path).not.toMatch(/^\.\.\//)
    })

    it('should have migrations as an object with path property', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
      
      const config = (await import('../prisma.config')).default
      
      expect(typeof config.migrations).toBe('object')
      expect(config.migrations).toHaveProperty('path')
    })
  })

  describe('Engine Configuration', () => {
    it('should use classic engine', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
      
      const config = (await import('../prisma.config')).default
      
      expect(config.engine).toBe('classic')
    })

    it('should not use accelerate or other engines', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
      
      const config = (await import('../prisma.config')).default
      
      expect(config.engine).not.toBe('accelerate')
      expect(config.engine).not.toBe('binary')
    })
  })

  describe('Datasource Configuration', () => {
    it('should have datasource configuration', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
      
      const config = (await import('../prisma.config')).default
      
      expect(config.datasource).toBeDefined()
      expect(typeof config.datasource).toBe('object')
    })

    it('should call env function for DATABASE_URL', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
      vi.resetModules()
      
      await import('../prisma.config')
      
      expect(mockEnv).toHaveBeenCalledWith('DATABASE_URL')
    })

    it('should use env function result as url', async () => {
      const testUrl = 'postgresql://test:test@localhost:5432/testdb'
      process.env.DATABASE_URL = testUrl
      mockEnv.mockReturnValue(testUrl)
      vi.resetModules()
      
      const config = (await import('../prisma.config')).default
      
      expect(config.datasource.url).toBe(testUrl)
    })
  })

  describe('Environment Variable Handling', () => {
    it('should handle standard PostgreSQL URL', async () => {
      process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/mydb'
      mockEnv.mockReturnValue(process.env.DATABASE_URL)
      vi.resetModules()
      
      const config = (await import('../prisma.config')).default
      
      expect(config.datasource.url).toBe(process.env.DATABASE_URL)
    })

    it('should handle PostgreSQL URL with special characters', async () => {
      process.env.DATABASE_URL = 'postgresql://user:p@ssw0rd!@localhost:5432/mydb'
      mockEnv.mockReturnValue(process.env.DATABASE_URL)
      vi.resetModules()
      
      const config = (await import('../prisma.config')).default
      
      expect(config.datasource.url).toBe(process.env.DATABASE_URL)
    })

    it('should handle cloud database URLs', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@db.cloud.provider.com:5432/mydb?sslmode=require'
      mockEnv.mockReturnValue(process.env.DATABASE_URL)
      vi.resetModules()
      
      const config = (await import('../prisma.config')).default
      
      expect(config.datasource.url).toContain('db.cloud.provider.com')
      expect(config.datasource.url).toContain('sslmode=require')
    })

    it('should handle Neon database URLs', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@ep-cool-name.region.aws.neon.tech/mydb?sslmode=require'
      mockEnv.mockReturnValue(process.env.DATABASE_URL)
      vi.resetModules()
      
      const config = (await import('../prisma.config')).default
      
      expect(config.datasource.url).toContain('neon.tech')
    })

    it('should handle missing DATABASE_URL gracefully', async () => {
      delete process.env.DATABASE_URL
      mockEnv.mockReturnValue('')
      vi.resetModules()
      
      const config = (await import('../prisma.config')).default
      
      expect(config.datasource.url).toBe('')
    })

    it('should handle empty DATABASE_URL', async () => {
      process.env.DATABASE_URL = ''
      mockEnv.mockReturnValue('')
      vi.resetModules()
      
      const config = (await import('../prisma.config')).default
      
      expect(config.datasource.url).toBe('')
    })
  })

  describe('dotenv Integration', () => {
    it('should import dotenv/config at the top', async () => {
      // This ensures environment variables are loaded before configuration
      const fileContent = await import('fs').then(fs => 
        fs.promises.readFile('prisma.config.ts', 'utf-8')
      )
      
      expect(fileContent).toContain('import "dotenv/config"')
      
      // Should be one of the first imports
      const lines = fileContent.split('\n')
      const dotenvImportLine = lines.findIndex(line => line.includes('dotenv/config'))
      expect(dotenvImportLine).toBeLessThan(5)
    })
  })

  describe('Configuration Immutability', () => {
    it('should return same configuration on multiple imports', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
      
      const config1 = (await import('../prisma.config')).default
      const config2 = (await import('../prisma.config')).default
      
      expect(config1).toEqual(config2)
    })
  })

  describe('Configuration Completeness', () => {
    it('should have all required fields', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
      
      const config = (await import('../prisma.config')).default
      
      expect(config).toHaveProperty('schema')
      expect(config).toHaveProperty('migrations')
      expect(config).toHaveProperty('engine')
      expect(config).toHaveProperty('datasource')
    })

    it('should not have unexpected fields', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
      
      const config = (await import('../prisma.config')).default
      const expectedKeys = ['schema', 'migrations', 'engine', 'datasource']
      const actualKeys = Object.keys(config)
      
      actualKeys.forEach(key => {
        expect(expectedKeys).toContain(key)
      })
    })
  })

  describe('Path Conventions', () => {
    it('should follow consistent path structure', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
      
      const config = (await import('../prisma.config')).default
      
      expect(config.schema.startsWith('prisma/')).toBe(true)
      expect(config.migrations.path.startsWith('prisma/')).toBe(true)
    })

    it('should use forward slashes in paths', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
      
      const config = (await import('../prisma.config')).default
      
      expect(config.schema).toContain('/')
      expect(config.schema).not.toContain('\\')
      expect(config.migrations.path).toContain('/')
      expect(config.migrations.path).not.toContain('\\')
    })
  })

  describe('Type Safety', () => {
    it('should have properly typed configuration', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
      
      const config = (await import('../prisma.config')).default
      
      expect(typeof config.schema).toBe('string')
      expect(typeof config.engine).toBe('string')
      expect(typeof config.migrations).toBe('object')
      expect(typeof config.migrations.path).toBe('string')
      expect(typeof config.datasource).toBe('object')
    })
  })
})