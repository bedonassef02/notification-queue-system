export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  meta?: Record<string, unknown>
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatLog(entry: LogEntry): string {
    return JSON.stringify(entry)
  }

  private log(entry: LogEntry) {
    const formatted = this.formatLog(entry)
    
    if (this.isDevelopment) {
      console.log(formatted)
    } else {
      console.log(formatted)
    }
  }

  info(message: string, meta?: Record<string, unknown>) {
    this.log({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      meta
    })
  }

  warn(message: string, meta?: Record<string, unknown>) {
    this.log({
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      meta
    })
  }

  error(message: string, error?: Error | unknown, meta?: Record<string, unknown>) {
    const errorMeta = {
      ...meta,
      ...(error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : {})
    }

    this.log({
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      meta: errorMeta
    })
  }

  debug(message: string, meta?: Record<string, unknown>) {
    if (this.isDevelopment) {
      this.log({
        level: 'debug',
        message,
        timestamp: new Date().toISOString(),
        meta
      })
    }
  }

  async trackPerformance<T>(
    name: string,
    fn: () => Promise<T>,
    meta?: Record<string, unknown>
  ): Promise<T> {
    const start = Date.now()
    this.debug(`Starting: ${name}`, meta)

    try {
      const result = await fn()
      const duration = Date.now() - start
      this.info(`Completed: ${name}`, {
        ...meta,
        duration,
        unit: 'ms'
      })
      return result
    } catch (error) {
      const duration = Date.now() - start
      this.error(`Failed: ${name}`, error, {
        ...meta,
        duration,
        unit: 'ms'
      })
      throw error
    }
  }
}

export const logger = new Logger()