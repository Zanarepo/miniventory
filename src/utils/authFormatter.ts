/**
 * Converts a mobile phone number or standard email string into a valid email format
 * required by Supabase backend authentication.
 */
export const formatAuthIdentifier = (identifier: string): string => {
  const clean = identifier.trim().toLowerCase();

  // If it contains an '@', treat as standard email address for users like supermarket owners
  if (clean.includes('@')) {
    return clean;
  }

  // Strip all non-numeric characters (e.g., spaces, hyphens) except leading plus for mobile traders
  const numericOnly = clean.replace(/[^0-9+]/g, '');

  // Create a synthetic backend email domain so Supabase Auth receives valid email schema behind the scenes
  return `${numericOnly}@miniventory-user.com`;
};

/**
 * Extracts a display-friendly phone number or email from a synthetic backend email.
 */
export const extractDisplayIdentifier = (backendEmail?: string): string => {
  if (!backendEmail) return '';
  if (backendEmail.endsWith('@miniventory-user.com')) {
    return backendEmail.replace('@miniventory-user.com', '');
  }
  return backendEmail;
};
