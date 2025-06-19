import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  /**
   * Sanitizes input strings to prevent XSS attacks
   * @param input - The string to sanitize
   * @returns Sanitized string
   */
  sanitizeInput(input: string): string {
    if (!input) return input;

    // Basic XSS prevention - replace HTML special chars
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Checks if a request is potentially malicious based on patterns
   * @param userAgent - The user agent string
   * @param path - The request path
   * @returns Boolean indicating if the request is suspicious
   */
  isSuspiciousRequest(userAgent: string, path: string): boolean {
    // Handle undefined inputs
    if (!userAgent || !path) {
      return false;
    }

    // Check for common SQL injection patterns
    const sqlInjectionPatterns = [
      'SELECT',
      'UNION',
      'INSERT',
      'DROP',
      '--',
      '1=1',
    ];

    const pathLower = path.toLowerCase();

    // Check for SQL injection attempts in path
    for (const pattern of sqlInjectionPatterns) {
      if (pathLower.includes(pattern.toLowerCase())) {
        this.logger.warn(
          `Suspicious request detected: SQL injection pattern in path: ${path}`,
        );
        return true;
      }
    }

    // Check for suspicious user agents
    const suspiciousUserAgents = ['sqlmap', 'nikto', 'nessus', 'dirbuster'];

    if (userAgent) {
      const userAgentLower = userAgent.toLowerCase();
      for (const agent of suspiciousUserAgents) {
        if (userAgentLower.includes(agent.toLowerCase())) {
          this.logger.warn(
            `Suspicious request detected: Malicious user agent: ${userAgent}`,
          );
          return true;
        }
      }
    }

    return false;
  }
}
