/**
 * Email Security System for detecting malicious email patterns
 * Detects variations like: ca.raolivia222@gmail.com, car.aolivia222@gmail.com, cara.olivia222@gmail.com
 */

import { AccountStatus } from "../types/user.types";

interface EmailSecurityOptions {
  minSimilarityThreshold?: number;
  maxAllowedVariations?: number;
  suspiciousDomains?: string[];
}

interface EmailPattern {
  core: string;
  domain: string;
  original: string;
}

interface SimilarEmail {
  emailAddress: string;
  similarity: number;
  corePattern: string;
  suspiciousFeatures: string[];
}

interface EmailValidationResult {
  shouldBlock: boolean;
  riskScore: number;
  similarEmails: SimilarEmail[];
  suspiciousFeatures: string[];
  reason: string;
}

interface SuspiciousGroup {
  corePattern: string;
  emails: string[];
  count: number;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
}

interface SignupValidationResult {
  allowed: boolean;
  riskScore: number;
}

interface SuspensionResult {
  group: string;
  suspendedCount: number;
  suspendedEmails: string[];
}

interface AuditResult {
  totalSuspiciousGroups: number;
  totalAccountsSuspended: number;
  suspensionDetails: SuspensionResult[];
}

interface UserDocument {
  _id: string;
  emailAddress: string;
  status?: string;
  createdAt?: Date;
}

interface UserModel {
  find(filter: any, projection?: any): Promise<UserDocument[]>;
  updateMany(filter: any, update: any): Promise<any>;
}

type SuspiciousFeature =
  | "suspicious_dot_pattern"
  | "very_short_local_part"
  | "ends_with_multiple_numbers"
  | "common_free_email_domain"
  | "short_prefix_dot_pattern";

class EmailSecuritySystem {
  private readonly minSimilarityThreshold: number;
  private readonly maxAllowedVariations: number;
  private readonly suspiciousDomains: Set<string>;

  constructor(options: EmailSecurityOptions = {}) {
    this.minSimilarityThreshold = options.minSimilarityThreshold || 0.7;
    this.maxAllowedVariations = options.maxAllowedVariations || 3;
    this.suspiciousDomains = new Set(
      options.suspiciousDomains || [
        "gmail.com",
        "yahoo.com",
        "hotmail.com",
        "outlook.com",
      ]
    );
  }

  /**
   * Normalize email for comparison by removing dots and converting to lowercase
   */
  private normalizeEmail(emailAddress: string): string {
    const [localPart, domain] = emailAddress.toLowerCase().split("@");

    // For Gmail, dots in local part are ignored
    if (domain === "gmail.com") {
      return localPart.replace(/\./g, "") + "@" + domain;
    }

    return emailAddress.toLowerCase();
  }

  /**
   * Extract the core pattern from an email by removing dots and common variations
   */
  private extractCorePattern(emailAddress: string): EmailPattern {
    const [localPart, domain] = emailAddress.toLowerCase().split("@");

    // Remove dots, numbers at the end, and common suffixes
    const core = localPart
      .replace(/\./g, "")
      .replace(/\d+$/, "")
      .replace(/(test|temp|fake|spam)$/i, "");

    return { core, domain, original: localPart };
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i += 1) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j += 1) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Calculate similarity ratio between two strings
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 1.0;

    const distance = this.levenshteinDistance(str1, str2);
    return (maxLength - distance) / maxLength;
  }

  /**
   * Check if an email has suspicious dot patterns
   */
  private hasSuspiciousDotPattern(emailAddress: string): boolean {
    const [localPart] = emailAddress.split("@");

    // Check for unusual dot placement patterns
    const dotPatterns = [
      /^\./, // starts with dot
      /\.$/, // ends with dot
      /\.{2,}/, // consecutive dots
      /^.{1,2}\./, // very short prefix before dot
      /\..{1,2}\./, // very short segments between dots
    ];

    return dotPatterns.some((pattern) => pattern.test(localPart));
  }

  /**
   * Detect if an email is similar to existing emails in the database
   */
  public async detectSimilarEmails(
    newEmail: string,
    existingEmails: string[]
  ): Promise<SimilarEmail[]> {
    const newPattern = this.extractCorePattern(newEmail);
    const similarEmails: SimilarEmail[] = [];

    for (const existingEmail of existingEmails) {
      const existingPattern = this.extractCorePattern(existingEmail);

      // Skip if different domains
      if (newPattern.domain !== existingPattern.domain) continue;

      // Calculate similarity
      const similarity = this.calculateSimilarity(
        newPattern.core,
        existingPattern.core
      );

      if (similarity >= this.minSimilarityThreshold) {
        similarEmails.push({
          emailAddress: existingEmail,
          similarity: similarity,
          corePattern: existingPattern.core,
          suspiciousFeatures: this.analyzeSuspiciousFeatures(existingEmail),
        });
      }
    }

    return similarEmails;
  }

  /**
   * Analyze suspicious features in an email
   */
  private analyzeSuspiciousFeatures(emailAddress: string): SuspiciousFeature[] {
    const features: SuspiciousFeature[] = [];
    const [localPart, domain] = emailAddress.split("@");

    if (this.hasSuspiciousDotPattern(emailAddress)) {
      features.push("suspicious_dot_pattern");
    }

    if (localPart.length < 4) {
      features.push("very_short_local_part");
    }

    if (/\d{2,}$/.test(localPart)) {
      features.push("ends_with_multiple_numbers");
    }

    if (this.suspiciousDomains.has(domain)) {
      features.push("common_free_email_domain");
    }

    if (/^[a-z]{1,3}\.[a-z]+\d+/.test(localPart)) {
      features.push("short_prefix_dot_pattern");
    }

    return features;
  }

  /**
   * Main function to check if an email should be blocked
   */
  public async shouldBlockEmail(
    newEmail: string,
    existingEmails: string[]
  ): Promise<EmailValidationResult> {
    const similarEmails = await this.detectSimilarEmails(
      newEmail,
      existingEmails
    );
    const suspiciousFeatures = this.analyzeSuspiciousFeatures(newEmail);

    const riskScore = this.calculateRiskScore(
      similarEmails,
      suspiciousFeatures
    );

    return {
      shouldBlock: riskScore >= 0.7,
      riskScore: riskScore,
      similarEmails: similarEmails,
      suspiciousFeatures: suspiciousFeatures,
      reason: this.generateBlockReason(
        riskScore,
        similarEmails,
        suspiciousFeatures
      ),
    };
  }

  /**
   * Calculate overall risk score
   */
  private calculateRiskScore(
    similarEmails: SimilarEmail[],
    suspiciousFeatures: SuspiciousFeature[]
  ): number {
    let score = 0;

    // Base score from similar emails
    if (similarEmails.length > 0) {
      const maxSimilarity = Math.max(...similarEmails.map((e) => e.similarity));
      score += maxSimilarity * 0.6;

      // Additional penalty for multiple similar emails
      if (similarEmails.length >= this.maxAllowedVariations) {
        score += 0.3;
      }
    }

    // Add score for suspicious features
    score += suspiciousFeatures.length * 0.1;

    return Math.min(score, 1.0);
  }

  /**
   * Generate human-readable block reason
   */
  private generateBlockReason(
    riskScore: number,
    similarEmails: SimilarEmail[],
    suspiciousFeatures: SuspiciousFeature[]
  ): string {
    const reasons: string[] = [];

    if (similarEmails.length > 0) {
      reasons.push(`Similar to ${similarEmails.length} existing email(s)`);
    }

    if (suspiciousFeatures.includes("suspicious_dot_pattern")) {
      reasons.push("Suspicious dot placement pattern");
    }

    if (suspiciousFeatures.includes("short_prefix_dot_pattern")) {
      reasons.push("Characteristic attack pattern detected");
    }

    if (similarEmails.length >= this.maxAllowedVariations) {
      reasons.push("Exceeds maximum allowed email variations");
    }

    return reasons.join(", ") || "General suspicious pattern detected";
  }

  /**
   * Find all potentially malicious accounts in the database
   */
  public async findSuspiciousAccounts(
    allEmails: string[]
  ): Promise<SuspiciousGroup[]> {
    const suspiciousGroups = new Map<string, Set<string>>();

    for (let i = 0; i < allEmails.length; i++) {
      const email1 = allEmails[i];
      const pattern1 = this.extractCorePattern(email1);

      for (let j = i + 1; j < allEmails.length; j++) {
        const email2 = allEmails[j];
        const pattern2 = this.extractCorePattern(email2);

        if (pattern1.domain !== pattern2.domain) continue;

        const similarity = this.calculateSimilarity(
          pattern1.core,
          pattern2.core
        );

        if (similarity >= this.minSimilarityThreshold) {
          const groupKey = pattern1.core + "@" + pattern1.domain;

          if (!suspiciousGroups.has(groupKey)) {
            suspiciousGroups.set(groupKey, new Set<string>());
          }

          suspiciousGroups.get(groupKey)!.add(email1);
          suspiciousGroups.get(groupKey)!.add(email2);
        }
      }
    }

    // Filter groups that have enough members to be suspicious
    const result: SuspiciousGroup[] = [];
    for (const [corePattern, emails] of suspiciousGroups) {
      if (emails.size >= this.maxAllowedVariations) {
        result.push({
          corePattern,
          emails: Array.from(emails),
          count: emails.size,
          riskLevel: emails.size >= 5 ? "HIGH" : "MEDIUM",
        });
      }
    }

    return result.sort((a, b) => b.count - a.count);
  }
}

// Usage examples and integration functions

/**
 * Integration function for signup validation
 */
async function validateSignupEmail(
  newEmail: string,
  UserModel: UserModel
): Promise<SignupValidationResult> {
  const emailSecurity = new EmailSecuritySystem({
    minSimilarityThreshold: 0.7,
    maxAllowedVariations: 1,
  });

  try {
    // Get all existing emails from database
    const existingUsers = await UserModel.find({}, { emailAddress: 1 });
    const existingEmails = existingUsers.map((user) => user.emailAddress);

    const result = await emailSecurity.shouldBlockEmail(
      newEmail,
      existingEmails
    );

    if (result.shouldBlock) {
      throw new Error(
        `Email blocked: ${
          result.reason
        }. Risk score: ${result.riskScore.toFixed(2)}`
      );
    }

    // Log for monitoring
    if (result.riskScore > 0.4) {
      console.warn(
        `Suspicious email detected: ${newEmail}, Risk: ${result.riskScore.toFixed(
          2
        )}`
      );
    }

    return { allowed: true, riskScore: result.riskScore };
  } catch (error) {
    console.error("Email validation error:", error);
    throw error;
  }
}

/**
 * Function to find and suspend suspicious existing accounts
 */
async function auditAndSuspendSuspiciousAccounts(
  UserModel: UserModel
): Promise<AuditResult> {
  const emailSecurity = new EmailSecuritySystem({
    minSimilarityThreshold: 0.75,
    maxAllowedVariations: 1,
  });

  try {
    // Get all user emails
    const allUsers = await UserModel.find({}, { emailAddress: 1, status: 1 });
    const allEmails = allUsers.map((user) => user.emailAddress);

    const suspiciousGroups = await emailSecurity.findSuspiciousAccounts(
      allEmails
    );

    const suspensionResults: SuspensionResult[] = [];

    for (const group of suspiciousGroups) {
      console.log(`Found suspicious group: ${group.corePattern}`);
      console.log(`Emails: ${group.emails.join(", ")}`);
      console.log(`Risk Level: ${group.riskLevel}`);

      // Suspend accounts (keep the oldest one active as it might be legitimate)
      const userIds = await UserModel.find(
        { emailAddress: { $in: group.emails } },
        { _id: 1, emailAddress: 1, createdAt: 1 }
      );

      // Sort by creation date and skip the first (oldest) account, suspend the rest
      const sortedUsers = userIds.sort(
        (a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0)
      );
      const accountsToSuspend = sortedUsers.slice(1);

      if (accountsToSuspend.length > 0) {
        const suspendedIds = accountsToSuspend.map((user) => user._id);

        await UserModel.updateMany(
          { _id: { $in: suspendedIds } },
          {
            $set: {
              status: AccountStatus.suspended,
              suspensionReason: `Suspicious email pattern detected: similar to ${group.corePattern}`,
              suspendedAt: new Date(),
            },
          }
        );

        suspensionResults.push({
          group: group.corePattern,
          suspendedCount: accountsToSuspend.length,
          suspendedEmails: accountsToSuspend.map((u) => u.emailAddress),
        });
      }
    }

    return {
      totalSuspiciousGroups: suspiciousGroups.length,
      totalAccountsSuspended: suspensionResults.reduce(
        (sum, r) => sum + r.suspendedCount,
        0
      ),
      suspensionDetails: suspensionResults,
    };
  } catch (error) {
    console.error("Audit error:", error);
    throw error;
  }
}

// Export the main class and utility functions
export {
  EmailSecuritySystem,
  validateSignupEmail,
  auditAndSuspendSuspiciousAccounts,
  type EmailSecurityOptions,
  type EmailValidationResult,
  type SuspiciousGroup,
  type SignupValidationResult,
  type AuditResult,
  type UserModel,
  type UserDocument,
};
