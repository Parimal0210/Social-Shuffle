/**
 * Security & Anti-Phishing Utility Functions
 * Enforces XSS Sanitization, Safe External Navigation, and Sensitive Data Masking.
 */

// Trusted external services for Social Shuffle Pune
const TRUSTED_DOMAINS = [
  'google.com',
  'maps.google.com',
  'goo.gl',
  'instagram.com',
  'wa.me',
  'whatsapp.com',
  'razorpay.com',
  'boardgamegeek.com',
  'unsplash.com',
  'dicebear.com'
];

/**
 * Strips script tags, javascript: pseudo-protocols, and dangerous HTML event handlers.
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

/**
 * Verifies if an external link belongs to an authorized trusted domain.
 * Thwarts open-redirect phishing and malicious lookalike links.
 */
export function isTrustedExternalUrl(urlStr: string): boolean {
  try {
    if (!urlStr) return false;
    // Allow relative paths
    if (urlStr.startsWith('/') || urlStr.startsWith('#')) return true;

    const parsed = new URL(urlStr);
    const hostname = parsed.hostname.toLowerCase();

    return TRUSTED_DOMAINS.some(trusted => 
      hostname === trusted || hostname.endsWith(`.${trusted}`)
    );
  } catch {
    return false;
  }
}

/**
 * Safe link properties for opening external websites.
 * 'noopener noreferrer' prevents the opened tab from accessing window.opener (Reverse Tabnabbing protection).
 */
export function getSafeExternalLinkProps(href: string) {
  const isTrusted = isTrustedExternalUrl(href);
  return {
    href,
    target: '_blank',
    rel: 'noopener noreferrer' as const,
    'data-trusted': isTrusted ? 'true' : 'false'
  };
}

/**
 * Mask sensitive participant contact details (Phone & Email)
 * Prevents phone scraping, spam, and spear-phishing targeting board game participants.
 * Admin users see the complete detail; public/regular participants see masked records.
 */
export function maskContact(value: string | undefined | null, type: 'phone' | 'email', isAdmin: boolean = false): string {
  if (!value) return '';
  if (isAdmin) return value; // Administrators have legitimate authorization to see contact

  if (type === 'phone') {
    const cleaned = value.trim();
    if (cleaned.length <= 4) return '****';
    const firstTwo = cleaned.slice(0, 4);
    const lastThree = cleaned.slice(-3);
    return `${firstTwo} **** ${lastThree}`;
  }

  if (type === 'email') {
    const parts = value.split('@');
    if (parts.length !== 2) return '****@hidden.com';
    const user = parts[0];
    const domain = parts[1];
    const maskedUser = user.length <= 2 ? user[0] + '***' : user.slice(0, 2) + '***' + user.slice(-1);
    return `${maskedUser}@${domain}`;
  }

  return '••••••••';
}
