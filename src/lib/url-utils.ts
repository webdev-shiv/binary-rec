/**
 * Intelligently normalizes social handles and incomplete URLs to valid clickable links.
 */
export function normalizeUrl(value: string | null | undefined, type?: 'instagram' | 'linkedin' | 'github' | 'general'): string | null {
  if (!value) return null;
  let trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === 'n/a' || trimmed.toLowerCase() === 'none' || trimmed === '-') {
    return null;
  }

  // Remove leading @ if handle format like @john_doe
  if (trimmed.startsWith('@')) {
    trimmed = trimmed.substring(1);
  }

  if (type === 'instagram') {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    if (trimmed.includes('instagram.com/')) {
      return `https://${trimmed.replace(/^https?:\/\//, '')}`;
    }
    return `https://instagram.com/${trimmed}`;
  }

  if (type === 'linkedin') {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    if (trimmed.includes('linkedin.com/')) {
      return `https://${trimmed.replace(/^https?:\/\//, '')}`;
    }
    return `https://linkedin.com/in/${trimmed}`;
  }

  if (type === 'github') {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    if (trimmed.includes('github.com/')) {
      return `https://${trimmed.replace(/^https?:\/\//, '')}`;
    }
    return `https://github.com/${trimmed}`;
  }

  // General URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // If looks like a domain name
  if (trimmed.includes('.') && !trimmed.includes(' ')) {
    return `https://${trimmed}`;
  }

  return null;
}

export function isValidUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
