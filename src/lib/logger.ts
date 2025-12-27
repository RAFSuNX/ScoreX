type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isTest = process.env.NODE_ENV === 'test';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  info(message: string, context?: LogContext): void {
    if (this.isTest) return;
    const formattedMessage = this.formatMessage('info', message, context);
    console.log(formattedMessage);
  }

  warn(message: string, context?: LogContext): void {
    if (this.isTest) return;
    const formattedMessage = this.formatMessage('warn', message, context);
    console.warn(formattedMessage);
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.isTest) return;

    const errorDetails: LogContext = {
      ...context,
    };

    if (error instanceof Error) {
      errorDetails.error = {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      };
    } else if (error) {
      errorDetails.error = error;
    }

    const formattedMessage = this.formatMessage('error', message, errorDetails);
    console.error(formattedMessage);
  }

  debug(message: string, context?: LogContext): void {
    if (!this.isDevelopment || this.isTest) return;
    const formattedMessage = this.formatMessage('debug', message, context);
    console.debug(formattedMessage);
  }

  // API-specific logging
  apiRequest(method: string, path: string, userId?: string): void {
    this.info('API Request', { method, path, userId });
  }

  apiResponse(method: string, path: string, statusCode: number, duration?: number): void {
    this.info('API Response', { method, path, statusCode, duration });
  }

  apiError(method: string, path: string, error: Error | unknown, userId?: string): void {
    this.error('API Error', error, { method, path, userId });
  }
}

export const logger = new Logger();
